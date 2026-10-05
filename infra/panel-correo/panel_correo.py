#!/usr/bin/env python3
"""Panel de correo de SillaMC: buzones y alias de @sillamc.es sobre la API de Mailcow.

Escucha solo en 127.0.0.1; nginx lo publica en https://mail.sillamc.es/cuentas/
y en /correo/ de la red local. Para entrar hace falta código de acceso + 2FA
(auth.py). La API key de Mailcow llega como credencial de systemd y nunca sale
hacia el navegador.
"""
import http.cookies
import json
import os
import re
import secrets
import ssl
import string
import urllib.error
import urllib.request
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer

import auth

DOMAIN = "sillamc.es"
COOKIE = "pc_sess"
MAILCOW = "https://127.0.0.1:8443/api/v1/"
PORT = int(os.environ.get("PANEL_PORT", "8795"))
HERE = os.path.dirname(os.path.abspath(__file__))
LOCAL_RE = re.compile(r"^[a-z0-9](?:[a-z0-9._-]{0,62}[a-z0-9])?$")
# Mailcow usa un certificado propio en 127.0.0.1: no hay nada que verificar en local.
CTX = ssl._create_unverified_context()


def api_key():
    cred = os.environ.get("CREDENTIALS_DIRECTORY", "")
    path = os.path.join(cred, "apikey") if cred else os.environ.get("MAILCOW_API_KEY_FILE", "")
    with open(path) as f:
        return f.read().strip()


KEY = api_key()


def mailcow(path, body=None):
    req = urllib.request.Request(
        MAILCOW + path,
        data=json.dumps(body).encode() if body is not None else None,
        headers={"X-API-Key": KEY, "Content-Type": "application/json"},
    )
    with urllib.request.urlopen(req, timeout=20, context=CTX) as r:
        return json.loads(r.read() or b"null")


def check(result):
    """Mailcow responde 200 incluso cuando falla: el error va dentro."""
    items = result if isinstance(result, list) else [result]
    for it in items:
        if isinstance(it, dict) and it.get("type") in ("danger", "error"):
            msg = it.get("msg")
            raise ValueError(" ".join(map(str, msg)) if isinstance(msg, list) else str(msg))
    return result


def new_password(n=20):
    alphabet = string.ascii_letters + string.digits + "-_.!"
    while True:
        p = "".join(secrets.choice(alphabet) for _ in range(n))
        if any(c.isdigit() for c in p) and any(c.isupper() for c in p) and any(c.islower() for c in p):
            return p


def valid_password(p):
    if len(p) < 10:
        raise ValueError("La contraseña debe tener al menos 10 caracteres")
    return p


def local_part(v):
    v = (v or "").strip().lower()
    if v.endswith("@" + DOMAIN):
        v = v[: -len(DOMAIN) - 1]
    if not LOCAL_RE.match(v):
        raise ValueError("Nombre no válido: usa letras, números, punto, guion o guion bajo")
    return v


def mailbox_address(v):
    return local_part(v) + "@" + DOMAIN


# ---------- acciones ----------

def list_mailboxes():
    rows = mailcow("get/mailbox/all/" + DOMAIN) or []
    out = []
    for m in rows if isinstance(rows, list) else []:
        out.append({
            "address": m.get("username"),
            "name": m.get("name") or "",
            "quota_mb": int(m.get("quota") or 0) // 1048576,
            "used_mb": round(int(m.get("quota_used") or 0) / 1048576, 1),
            "messages": int(m.get("messages") or 0),
            "active": str(m.get("active")) == "1",
            "last_login": max(int((m.get("last_imap_login") or 0)), int(m.get("last_sogo_login") or 0)),
        })
    return sorted(out, key=lambda m: m["address"])


def list_aliases():
    rows = mailcow("get/alias/all") or []
    out = []
    for a in rows if isinstance(rows, list) else []:
        if not str(a.get("address", "")).endswith("@" + DOMAIN):
            continue
        out.append({
            "id": a.get("id"),
            "address": a.get("address"),
            "goto": [g for g in str(a.get("goto", "")).split(",") if g],
            "active": str(a.get("active")) == "1",
        })
    return sorted(out, key=lambda a: a["address"])


def create_mailbox(d):
    lp = local_part(d.get("local_part"))
    pw = valid_password(d["password"]) if d.get("password") else new_password()
    quota = max(256, min(10240, int(d.get("quota_mb") or 2048)))
    check(mailcow("add/mailbox", {
        "local_part": lp, "domain": DOMAIN, "name": (d.get("name") or lp)[:100],
        "quota": str(quota), "password": pw, "password2": pw, "active": "1",
        "force_pw_update": "0",
    }))
    return {"address": f"{lp}@{DOMAIN}", "password": pw}


def set_password(d):
    addr = mailbox_address(d.get("address"))
    pw = valid_password(d["password"]) if d.get("password") else new_password()
    check(mailcow("edit/mailbox", {"items": [addr], "attr": {"password": pw, "password2": pw}}))
    return {"address": addr, "password": pw}


def set_active(d):
    addr = mailbox_address(d.get("address"))
    check(mailcow("edit/mailbox", {"items": [addr], "attr": {"active": "1" if d.get("active") else "0"}}))
    return {"ok": True}


def delete_mailbox(d):
    addr = mailbox_address(d.get("address"))
    if d.get("confirm") != addr:
        raise ValueError("Escribe la dirección completa para confirmar el borrado")
    check(mailcow("delete/mailbox", [addr]))
    return {"ok": True}


def create_alias(d):
    addr = mailbox_address(d.get("address"))
    goto = [g.strip().lower() for g in str(d.get("goto", "")).replace(";", ",").split(",") if g.strip()]
    if not goto or not all(re.match(r"^[^@\s]+@[^@\s]+\.[a-z]{2,}$", g) for g in goto):
        raise ValueError("Destino no válido")
    check(mailcow("add/alias", {"address": addr, "goto": ",".join(goto), "active": "1"}))
    return {"ok": True}


def delete_alias(d):
    check(mailcow("delete/alias", [str(int(d.get("id")))]))
    return {"ok": True}


def dns_status():
    """Qué ve Internet ahora mismo, consultado a dns.google."""
    def q(name, rtype):
        try:
            with urllib.request.urlopen(
                f"https://dns.google/resolve?name={name}&type={rtype}", timeout=8
            ) as r:
                j = json.loads(r.read())
            return [a["data"] for a in j.get("Answer", []) if a.get("type") in (1, 15, 16, 33)]
        except Exception:
            return None

    dkim = mailcow("get/dkim/" + DOMAIN) or {}
    return {
        "domain": DOMAIN,
        "a": q(DOMAIN, "A"),
        "mx": q(DOMAIN, "MX"),
        "spf": [t for t in (q(DOMAIN, "TXT") or []) if "v=spf1" in t],
        "dkim": q(f"{dkim.get('dkim_selector', 'dkim')}._domainkey.{DOMAIN}", "TXT"),
        "dmarc": q("_dmarc." + DOMAIN, "TXT"),
        "dkim_selector": dkim.get("dkim_selector"),
        "dkim_txt": dkim.get("dkim_txt"),
    }


GET = {"/api/mailboxes": list_mailboxes, "/api/aliases": list_aliases, "/api/dns": dns_status}
POST = {
    "/api/mailboxes": create_mailbox,
    "/api/mailboxes/password": set_password,
    "/api/mailboxes/active": set_active,
    "/api/mailboxes/delete": delete_mailbox,
    "/api/aliases": create_alias,
    "/api/aliases/delete": delete_alias,
}


class Handler(BaseHTTPRequestHandler):
    server_version = "panel-correo"

    def log_message(self, fmt, *args):
        # Sin cuerpos ni cabeceras en el log: ahí viajan contraseñas.
        print("%s %s" % (self.command, self.path.split("?")[0]), flush=True)

    # ---------- utilidades ----------

    def ip(self):
        # nginx (en 127.0.0.1) pone la IP real; sin él, la del socket.
        return self.headers.get("X-Real-IP") or self.client_address[0]

    def token(self):
        c = http.cookies.SimpleCookie(self.headers.get("Cookie", ""))
        return c[COOKIE].value if COOKIE in c else ""

    def cookie(self, value, max_age):
        secure = "; Secure" if self.headers.get("X-Forwarded-Proto") == "https" else ""
        return f"{COOKIE}={value}; Path=/; Max-Age={max_age}; HttpOnly; SameSite=Strict{secure}"

    def send(self, code, body, ctype="application/json", cookie=None):
        data = body if isinstance(body, bytes) else json.dumps(body, ensure_ascii=False).encode()
        self.send_response(code)
        self.send_header("Content-Type", ctype + ("; charset=utf-8" if "json" in ctype or "html" in ctype else ""))
        self.send_header("Cache-Control", "no-store")
        self.send_header("X-Content-Type-Options", "nosniff")
        self.send_header("X-Frame-Options", "DENY")
        self.send_header("Referrer-Policy", "no-referrer")
        if cookie:
            self.send_header("Set-Cookie", cookie)
        self.send_header("Content-Length", str(len(data)))
        self.end_headers()
        self.wfile.write(data)

    def run(self, fn, *a):
        try:
            self.send(200, fn(*a))
        except PermissionError as e:
            self.send(403, {"error": str(e)})
        except ValueError as e:
            self.send(400, {"error": str(e)})
        except urllib.error.URLError as e:
            self.send(502, {"error": f"Mailcow no responde: {e.reason}"})
        except Exception as e:  # noqa: BLE001
            self.send(500, {"error": type(e).__name__})

    def start_session(self, fn, *a):
        try:
            token = fn(*a)
        except PermissionError as e:
            return self.send(403, {"error": str(e)})
        except ValueError as e:
            return self.send(400, {"error": str(e)})
        self.send(200, {"ok": True}, cookie=self.cookie(token, auth.SESSION_TTL))

    # ---------- rutas ----------

    def do_GET(self):
        path = self.path.split("?")[0]
        if path in ("/", "/index.html"):
            with open(os.path.join(HERE, "index.html"), "rb") as f:
                return self.send(200, f.read(), "text/html")
        if path == "/api/session":
            return self.send(200, auth.status(self.ip(), self.token()))
        if path == "/api/setup":
            return self.run(auth.setup_start, self.ip())
        if path not in GET:
            return self.send(404, {"error": "no existe"})
        if not auth.session_ok(self.token()):
            return self.send(401, {"error": "Inicia sesión"})
        self.run(GET[path])

    def do_POST(self):
        path = self.path.split("?")[0]
        # Solo peticiones del propio panel.
        origin = self.headers.get("Origin", "")
        host = self.headers.get("Host", "")
        if not origin or origin.split("://", 1)[-1] != host:
            return self.send(403, {"error": "origen no permitido"})
        try:
            n = int(self.headers.get("Content-Length") or 0)
            data = json.loads(self.rfile.read(min(n, 65536)) or b"{}")
        except Exception:
            return self.send(400, {"error": "JSON no válido"})
        if path == "/api/login":
            return self.start_session(auth.login, self.ip(), data.get("access_code"), data.get("code"))
        if path == "/api/setup":
            return self.start_session(auth.setup_finish, self.ip(), data.get("access_code"), data.get("code"))
        if path == "/api/logout":
            auth.logout(self.token())
            return self.send(200, {"ok": True}, cookie=self.cookie("", 0))
        if path not in POST:
            return self.send(404, {"error": "no existe"})
        if not auth.session_ok(self.token()):
            return self.send(401, {"error": "Inicia sesión"})
        self.run(POST[path], data)


if __name__ == "__main__":
    ThreadingHTTPServer(("127.0.0.1", PORT), Handler).serve_forever()
