#!/usr/bin/env python3
"""Pone el favicon de SillaMC en todas las páginas y quita restos de la web antigua.

Uso: favicon-y-limpieza.py <carpeta de la web>
- En cada .html de la raíz: quita los <link rel="icon"> sueltos y añade el bloque
  de iconos antes de </head> (idempotente: no lo duplica).
- script.js: la API ya no se busca en GitHub Pages ni en sillaweb.ddns.net.
"""
import re
import sys
from pathlib import Path

MARK = "<!-- iconos SillaMC -->"
BLOCK = (
    f"  {MARK}\n"
    '  <link rel="icon" href="/favicon.ico" sizes="any">\n'
    '  <link rel="icon" type="image/png" sizes="32x32" href="/icon-32.png">\n'
    '  <link rel="apple-touch-icon" href="/apple-touch-icon.png">\n'
    '  <link rel="manifest" href="/site.webmanifest">\n'
    '  <meta name="theme-color" content="#0c0f0a">\n'
)
ICON_RE = re.compile(r'[ \t]*<link\b[^>]*\brel="(?:shortcut )?icon"[^>]*>[ \t]*\n?', re.I)

root = Path(sys.argv[1])
for page in sorted(root.glob("*.html")):
    s = page.read_text(encoding="utf-8")
    if MARK in s or "</head>" not in s:
        continue
    s = ICON_RE.sub("", s)
    s = s.replace("</head>", BLOCK + "</head>", 1)
    page.write_text(s, encoding="utf-8", newline="")
    print("favicon:", page.name)

js = root / "script.js"
if js.exists():
    s = js.read_text(encoding="utf-8")
    old = s
    s = s.replace(
        "   · En el propio servidor (sillamc.es, panel.sillamc.es) la API cuelga de /api: mismo\n",
        "   · En sillamc.es y panel.sillamc.es la API cuelga de /api: mismo\n")
    # La última línea del comentario lleva el cierre */: se conserva en la anterior.
    s = s.replace(
        "   · En local (Live Server) hace falta un tunel SSH al puerto 8770.\n"
        "   · Desde cualquier otro sitio (github.io) apuntamos al servidor por su nombre. */",
        "   · En local (Live Server) hace falta un tunel SSH al puerto 8770. */")
    s = s.replace(
        '// sillaweb.ddns.net se mantiene mientras dure la migración (hasta el 21/10/2026).\n'
        'const WEB_HOSTS = ["sillamc.es", "panel.sillamc.es", "sillaweb.ddns.net"];',
        'const WEB_HOSTS = ["sillamc.es", "panel.sillamc.es"];')
    if s != old:
        js.write_text(s, encoding="utf-8", newline="")
        print("limpio: script.js")
