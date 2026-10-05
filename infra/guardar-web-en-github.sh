#!/bin/bash
# Guarda en GitHub (rama main) una copia de la web publicada en urpilandia.
# GitHub Pages NO la publica: solo sirve pages-redirect/ (redirige a sillamc.es).
#
# Uso, desde la raíz del repo sillamc_web:  bash infra/guardar-web-en-github.sh
# Se quedan fuera los archivos pesados (vídeos, zips del launcher y downloads/),
# que viven en el servidor y en sus copias de seguridad.
set -euo pipefail
cd "$(git rev-parse --show-toplevel)"

[ "$(git branch --show-current)" = main ] || { echo "Cámbiate a main primero (git switch main)"; exit 1; }
git pull --ff-only -q

ssh -o BatchMode=yes -i ~/.ssh/id_claude_loitek urpilandia \
  "cd /var/www/sillaweb && tar cf - --exclude=./downloads --exclude='*.mp4' --exclude='*.zip' ." | tar xf -

# Solo la web: ni infra/ ni el contexto para IA (no se versiona a propósito).
git add -A -- . ':!infra' ':!ai_context.md' ':!pages-redirect' ':!.github'
if git diff --cached --quiet; then
  echo "La copia de GitHub ya estaba al día."
  exit 0
fi
git commit -q -m "Copia de la web publicada ($(date '+%Y-%m-%d %H:%M'))"
git push -q origin main
echo "Copia guardada: $(git log --oneline -1)"
