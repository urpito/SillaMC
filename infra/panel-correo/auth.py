"""Acceso al panel de correo: código de acceso + TOTP (RFC 6238, 6 dígitos, 30 s).

- El código de acceso solo se guarda como hash PBKDF2.
- El secreto TOTP se genera aquí y solo viaja al navegador durante el
  emparejamiento, que únicamente se permite desde la red de casa o WireGuard y
  mientras no haya ningún móvil emparejado.
- Para reiniciar (móvil perdido): borrar /var/lib/panel-correo/auth.json como root
  y emparejar de nuevo desde casa.
"""
import base64
import hashlib
import hmac
import ipaddress
import json
import os
import secrets
import struct
import threading
import time

STATE = os.path.join(os.environ.get("STATE_DIRECTORY", "/var/lib/panel-correo"), "auth.json")
ISSUER = "SillaMC Correo"
ACCOUNT = "urpi"
SESSION_TTL = 12 * 3600
SETUP_TTL = 15 * 60
FAIL_WINDOW = 15 * 60
FAIL_PER_IP = 5
FAIL_GLOBAL = 20
PBKDF2_ROUNDS = 400_000
# Sin 127.0.0.0/8: el agente de playit entrega tráfico de Internet como si fuera local.
HOME_NETS = [ipaddress.ip_network(n) for n in ("192.168.0.0/24", "10.0.0.0/24")]

_lock = threading.Lock()
_sessions = {}   # token -> caduca
_pending = {}    # secreto de emparejamiento en curso
_fails = []      # (instante, ip)


def is_home(ip):
    try:
        return any(ipaddress.ip_address(ip) in n for n in HOME_NETS)
    except ValueError:
        return False


# ---------- estado en disco ----------

def _load():
    try:
        with open(STATE) as f:
            return json.load(f)
    except FileNotFoundError:
        return {}


def _save(d):
    tmp = STATE + ".tmp"
    fd = os.open(tmp, os.O_WRONLY | os.O_CREAT | os.O_TRUNC, 0o600)
    with os.fdopen(fd, "w") as f:
        json.dump(d, f)
    os.replace(tmp, STATE)


def configured():
    d = _load()
    return bool(d.get("pw") and d.get("totp"))


# ---------- primitivas ----------

def _hash_pw(pw, salt=None):
    salt = salt or secrets.token_bytes(16)
    h = hashlib.pbkdf2_hmac("sha256", pw.encode(), salt, PBKDF2_ROUNDS)
    return "pbkdf2$%d$%s$%s" % (PBKDF2_ROUNDS, base64.b64encode(salt).decode(), base64.b64encode(h).decode())


def _check_pw(pw, stored):
    try:
        _, rounds, salt, h = stored.split("$")
        got = hashlib.pbkdf2_hmac("sha256", pw.encode(), base64.b64decode(salt), int(rounds))
        return hmac.compare_digest(got, base64.b64decode(h))
    except Exception:
        return False


def _totp_at(secret, step):
    key = base64.b32decode(secret + "=" * (-len(secret) % 8))
    mac = hmac.new(key, struct.pack(">Q", step), hashlib.sha1).digest()
    off = mac[-1] & 0x0F
    return "%06d" % ((struct.unpack(">I", mac[off:off + 4])[0] & 0x7FFFFFFF) % 1_000_000)


def _match_totp(secret, code, last_step=-1):
    """Devuelve el paso aceptado (±1 de margen) o None. Un código no vale dos veces."""
    code = "".join(c for c in str(code) if c.isdigit())
    if len(code) != 6:
        return None
    now = int(time.time()) // 30
    for step in (now - 1, now, now + 1):
        if step > last_step and hmac.compare_digest(_totp_at(secret, step), code):
            return step
    return None


# ---------- límite de intentos ----------

def _blocked(ip):
    cut = time.time() - FAIL_WINDOW
    _fails[:] = [f for f in _fails if f[0] > cut]
    return sum(1 for _, i in _fails if i == ip) >= FAIL_PER_IP or len(_fails) >= FAIL_GLOBAL


def _fail(ip):
    _fails.append((time.time(), ip))
    print("acceso fallido desde %s" % ip, flush=True)


# ---------- API pública del módulo ----------

def session_ok(token):
    with _lock:
        exp = _sessions.get(token or "")
        if exp and exp > time.time():
            return True
        _sessions.pop(token or "", None)
        return False


def _new_session():
    token = secrets.token_urlsafe(32)
    _sessions[token] = time.time() + SESSION_TTL
    return token


def logout(token):
    with _lock:
        _sessions.pop(token or "", None)


def status(ip, token):
    return {
        "configured": configured(),
        "logged_in": session_ok(token),
        "can_setup": not configured() and is_home(ip),
        "home": is_home(ip),
    }


def setup_start(ip):
    if configured():
        raise PermissionError("Ya hay un móvil emparejado")
    if not is_home(ip):
        raise PermissionError("El emparejamiento solo se puede hacer desde casa o con WireGuard")
    with _lock:
        if not _pending or _pending["exp"] < time.time():
            _pending.update(secret=base64.b32encode(secrets.token_bytes(20)).decode().rstrip("="),
                            exp=time.time() + SETUP_TTL)
        s = _pending["secret"]
    label = "%s:%s" % (ISSUER, ACCOUNT)
    uri = "otpauth://totp/%s?secret=%s&issuer=%s&digits=6&period=30" % (
        label.replace(" ", "%20"), s, ISSUER.replace(" ", "%20"))
    return {"secret": s, "uri": uri}


def setup_finish(ip, access_code, code):
    if configured() or not is_home(ip):
        raise PermissionError("Emparejamiento no permitido")
    access_code = access_code or ""
    if len(access_code) < 10:
        raise ValueError("El código de acceso debe tener al menos 10 caracteres")
    with _lock:
        if _blocked(ip):
            raise PermissionError("Demasiados intentos. Espera 15 minutos")
        if not _pending or _pending["exp"] < time.time():
            raise ValueError("El emparejamiento ha caducado: recarga la página")
        step = _match_totp(_pending["secret"], code)
        if step is None:
            _fail(ip)
            raise ValueError("El código del móvil no coincide. Revisa la hora del móvil y prueba otra vez")
        _save({"pw": _hash_pw(access_code), "totp": _pending["secret"], "last_step": step,
               "created": int(time.time())})
        _pending.clear()
        return _new_session()


def change_access_code(ip, current, new, code):
    """Pide el código actual y uno del móvil, para que una sesión abierta no baste."""
    new = new or ""
    if len(new) < 10:
        raise ValueError("El código de acceso nuevo debe tener al menos 10 caracteres")
    with _lock:
        if _blocked(ip):
            raise PermissionError("Demasiados intentos. Espera 15 minutos")
        d = _load()
        step = _match_totp(d.get("totp", ""), code, d.get("last_step", -1))
        if not _check_pw(current or "", d.get("pw", "")) or step is None:
            _fail(ip)
            raise ValueError("Código de acceso actual o código del móvil incorrecto")
        d.update(pw=_hash_pw(new), last_step=step)
        _save(d)
        _sessions.clear()  # cierra las demás sesiones abiertas
        return _new_session()


def login(ip, access_code, code):
    with _lock:
        if _blocked(ip):
            raise PermissionError("Demasiados intentos. Espera 15 minutos")
        d = _load()
        if not (d.get("pw") and d.get("totp")):
            raise PermissionError("Todavía no hay ningún móvil emparejado")
        pw_ok = _check_pw(access_code or "", d["pw"])
        step = _match_totp(d["totp"], code, d.get("last_step", -1))
        if not pw_ok or step is None:
            _fail(ip)
            raise ValueError("Código de acceso o código del móvil incorrecto")
        d["last_step"] = step
        _save(d)
        return _new_session()
