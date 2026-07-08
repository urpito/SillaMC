#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
SillaMC — mini-backend de verificación de cuenta.
Flujo: la web pide un código para <usuario> -> este server manda /tell <usuario> <codigo>
al servidor de Minecraft (via API de Pterodactyl) -> la web valida el codigo.

Ejecutar en urpilandia:   python3 link_server.py
(usa Python estándar, sin dependencias)

Config por variables de entorno (o edita los DEFAULT_*):
  PTERO_PANEL   = http://192.168.0.19
  PTERO_ID      = 41292591
  PTERO_KEYFILE = /home/urpi/.ptero_key
  LINK_PORT     = 8770
"""
import os, json, time, random, threading, urllib.request, urllib.error
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer

PANEL   = os.environ.get("PTERO_PANEL", "http://192.168.0.19")
SRV_ID  = os.environ.get("PTERO_ID", "41292591")
KEYFILE = os.environ.get("PTERO_KEYFILE", os.path.expanduser("~/.ptero_key"))
PORT    = int(os.environ.get("LINK_PORT", "8770"))
CODE_TTL = 300      # segundos de validez del codigo
COOLDOWN = 30       # segundos entre peticiones por usuario

KEY = open(KEYFILE).read().strip()
_codes = {}         # user -> (code, expiry)
_last  = {}         # user -> last request ts
_attempts = {}      # user -> intentos de verificacion (anti fuerza-bruta)
_lock  = threading.Lock()

def send_console(command):
    req = urllib.request.Request(
        "%s/api/client/servers/%s/command" % (PANEL, SRV_ID),
        data=json.dumps({"command": command}).encode(),
        headers={"Authorization": "Bearer " + KEY, "Accept": "application/json", "Content-Type": "application/json"})
    try:
        return urllib.request.urlopen(req, timeout=10).status
    except urllib.error.HTTPError as e:
        return e.code

def valid_user(u):
    return u and 1 <= len(u) <= 16 and all(c.isalnum() or c == "_" for c in u)

class H(BaseHTTPRequestHandler):
    def _cors(self, code=200):
        self.send_response(code)
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.send_header("Access-Control-Allow-Methods", "POST, OPTIONS")
        self.send_header("Content-Type", "application/json")
        self.end_headers()
    def _json(self):
        n = int(self.headers.get("Content-Length", 0))
        try: return json.loads(self.rfile.read(n) or b"{}")
        except Exception: return {}
    def do_OPTIONS(self): self._cors(204)
    def log_message(self, *a): pass
    def do_POST(self):
        body = self._json()
        user = (body.get("username") or "").strip()
        if not valid_user(user):
            self._cors(400); self.wfile.write(b'{"error":"bad username"}'); return
        now = time.time()
        if self.path.rstrip("/").endswith("request-code"):
            with _lock:
                if now - _last.get(user, 0) < COOLDOWN:
                    self._cors(429); self.wfile.write(b'{"error":"cooldown"}'); return
                _last[user] = now
                code = "%06d" % random.randint(0, 999999)
                _codes[user] = (code, now + CODE_TTL)
                _attempts[user] = 0
            msg = "tell %s [SillaMC] Tu codigo de verificacion web es: %s  (valido 5 min)" % (user, code)
            send_console(msg)
            self._cors(200); self.wfile.write(b'{"ok":true}')
        elif self.path.rstrip("/").endswith("verify"):
            code = (body.get("code") or "").strip()
            with _lock:
                _attempts[user] = _attempts.get(user, 0) + 1
                if _attempts[user] > 6:            # demasiados intentos: invalida el codigo
                    _codes.pop(user, None)
                saved = _codes.get(user)
                ok = bool(saved) and saved[0] == code and now < saved[1]
                if ok:
                    _codes.pop(user, None); _attempts.pop(user, None)
            self._cors(200 if ok else 401)
            self.wfile.write(b'{"ok":true}' if ok else b'{"ok":false}')
        else:
            self._cors(404); self.wfile.write(b'{"error":"not found"}')

if __name__ == "__main__":
    print("SillaMC link-server en :%d  (panel=%s id=%s)" % (PORT, PANEL, SRV_ID))
    ThreadingHTTPServer(("0.0.0.0", PORT), H).serve_forever()
