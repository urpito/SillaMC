#!/bin/bash
# Cambia las direcciones de la web de SillaMC a sillamc.es según su función.
# Uso: web-a-sillamc-es.sh <carpeta de la web>
#   web y enlaces            sillaweb.ddns.net  -> sillamc.es
#   panel del jugador        .../dashboard      -> panel.sillamc.es
#   dirección del juego      sillamc.ddns.net   -> play.sillamc.es
#                            cubitov1.ddns.net  -> play.sillamc.es
set -euo pipefail
cd "$1"
FILES=$(grep -rlE 'sill[a-z]*\.ddns\.net|cubitov1\.ddns\.net' --include='*.html' --include='*.js' \
  --include='*.xml' --include='*.txt' --include='*.json' . | grep -v '^\./\.local-preview/' || true)
[ -n "$FILES" ] || { echo "nada que cambiar"; exit 0; }

# script.js decide la URL de la API comparando el nombre de la página: con varios
# nombres sirviendo la misma web, todos deben usar /api (mismo origen).
if [ -f script.js ] && grep -q 'const WEB_HOST = "sillaweb.ddns.net";' script.js; then
  python3 - <<'PY'
import re
p = "script.js"
s = open(p, encoding="utf-8").read()
s = s.replace(
    '   · En el propio servidor (sillaweb.ddns.net) la API cuelga de /api: mismo',
    '   · En el propio servidor (sillamc.es, panel.sillamc.es) la API cuelga de /api: mismo')
s = s.replace(
    'const WEB_HOST = "sillaweb.ddns.net";',
    '// sillaweb.ddns.net se mantiene mientras dure la migración (hasta el 21/10/2026).\n'
    'const WEB_HOSTS = ["sillamc.es", "panel.sillamc.es", "sillaweb.ddns.net"];')
s = s.replace('if (h === WEB_HOST) return "/api";', 'if (WEB_HOSTS.includes(h)) return "/api";')
s = s.replace('return "https://" + WEB_HOST + "/api";', 'return "https://sillamc.es/api";')
open(p, "w", encoding="utf-8").write(s)
PY
fi

for f in $FILES; do
  # Las dos líneas de WEB_HOSTS nombran el dominio antiguo a propósito.
  sed -i -E '/WEB_HOSTS = |se mantiene mientras dure la migración/!{
    s#https://sillaweb\.ddns\.net/dashboard(\.html)?#https://panel.sillamc.es/#g
    s#sillaweb\.ddns\.net/dashboard#panel.sillamc.es#g
    s#https?://sillaweb\.ddns\.net#https://sillamc.es#g
    s#sillaweb\.ddns\.net#sillamc.es#g
    s#(sillamc|cubitov1)\.ddns\.net#play.sillamc.es#g
  }' "$f"
  echo "cambiado: $f"
done
echo "quedan: $(grep -rlE 'ddns\.net' --include='*.html' --include='*.js' --include='*.xml' --include='*.txt' --include='*.json' . | grep -v '^\./\.local-preview/' | tr '\n' ' ')"
