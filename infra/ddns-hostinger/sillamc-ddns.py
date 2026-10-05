#!/usr/bin/env python3
"""Actualiza los registros A de sillamc.es en Hostinger cuando cambia la IP pública.

Sustituye al cliente de No-IP. Solo toca los registros A de NOMBRES; el resto de
la zona (CNAME www, SRV, MX, TXT...) no se modifica: la API con overwrite=true
borra y recrea únicamente los registros que coinciden en nombre y tipo.

El token se lee de la credencial de systemd "token" (LoadCredential) o, para
pruebas a mano, de la variable HOSTINGER_API_TOKEN. Nunca va en el repo.
"""
import ipaddress
import json
import os
import sys
import urllib.request

DOMAIN = "sillamc.es"
NAMES = ["@", "play", "mail"]
TTL = 300
API = f"https://developers.hostinger.com/api/dns/v1/zones/{DOMAIN}"
IP_SOURCES = ["https://api.ipify.org", "https://ifconfig.me/ip", "https://ipv4.icanhazip.com"]
STATE = os.path.join(os.environ.get("STATE_DIRECTORY", "/var/lib/sillamc-ddns"), "last_ip")
DRY_RUN = "--dry-run" in sys.argv
FORCE = "--force" in sys.argv


def log(msg):
    print(msg, flush=True)


def token():
    cred = os.environ.get("CREDENTIALS_DIRECTORY")
    if cred and os.path.exists(os.path.join(cred, "token")):
        with open(os.path.join(cred, "token")) as f:
            return f.read().strip()
    t = os.environ.get("HOSTINGER_API_TOKEN", "").strip()
    if not t:
        sys.exit("Falta el token de Hostinger (LoadCredential=token o HOSTINGER_API_TOKEN)")
    return t


def public_ip():
    # Dos fuentes deben coincidir para no publicar una IP errónea.
    seen = []
    for url in IP_SOURCES:
        try:
            with urllib.request.urlopen(url, timeout=8) as r:
                ip = str(ipaddress.IPv4Address(r.read().decode().strip()))
        except Exception as e:
            log(f"aviso: {url}: {e}")
            continue
        if ip in seen:
            return ip
        seen.append(ip)
    sys.exit(f"No hay dos fuentes de IP que coincidan: {seen}")


def api(method, body=None):
    req = urllib.request.Request(
        API,
        method=method,
        data=json.dumps(body).encode() if body is not None else None,
        headers={
            "Authorization": f"Bearer {token()}",
            "Content-Type": "application/json",
            "Accept": "application/json",
            "User-Agent": "sillamc-ddns/1.0",
        },
    )
    with urllib.request.urlopen(req, timeout=20) as r:
        raw = r.read()
        return json.loads(raw) if raw else None


def current_records():
    out = {}
    for rr in api("GET") or []:
        if rr.get("type") == "A" and rr.get("name") in NAMES:
            out[rr["name"]] = [r["content"] for r in rr.get("records", [])]
    return out


def main():
    ip = public_ip()
    last = open(STATE).read().strip() if os.path.exists(STATE) else ""
    if ip == last and not FORCE:
        return  # sin cambios: ni siquiera se llama a la API

    zone = current_records()
    stale = [n for n in NAMES if zone.get(n) != [ip]]
    if not stale:
        log(f"DNS ya apunta a {ip}")
    else:
        log(f"IP {ip}; actualizando {', '.join(stale)} (antes: {zone})")
        if DRY_RUN:
            return
        api("PUT", {
            "overwrite": True,
            "zone": [{"name": n, "type": "A", "ttl": TTL, "records": [{"content": ip}]} for n in stale],
        })
        after = current_records()
        bad = [n for n in NAMES if after.get(n) != [ip]]
        if bad:
            sys.exit(f"Tras actualizar, siguen mal: {bad} -> {after}")
        log("Actualizado y verificado")

    if not DRY_RUN:
        with open(STATE, "w") as f:
            f.write(ip)


if __name__ == "__main__":
    main()
