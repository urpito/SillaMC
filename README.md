# SillaMC Survival — Web

Web oficial del servidor de Minecraft **SillaMC Survival** (Survival vanilla++, Java + Bedrock, ES/EN).
Sitio **estático** (HTML/CSS/JS) pensado para **GitHub Pages**.

🔗 **Demo (al activar Pages):** `https://urpito.github.io/SillaMC/`

## Qué incluye
- **`index.html`** — Landing para atraer jugadores (logo, características, IP, cómo entrar).
- **`dashboard.html`** — Panel del jugador: login por código → SillaCoins, ganar monedas viendo anuncios, y tienda de recompensas (rangos de sillas: Taburete → Sillón → Trono).
- **`styles.css`, `script.js`** — estilos y lógica (bilingüe ES/EN, tema oro+verde).
- **`logo.png`** — logo del servidor.
- **`link_server.py`** — mini-backend (Python puro) para la verificación real y entregar SillaCoins in-game vía la API de Pterodactyl. *No se sirve en Pages; se ejecuta en el servidor de casa.*

## Activar GitHub Pages
Settings → Pages → Source: **Deploy from a branch** → Branch: **main** / **/(root)** → Save.
En 1-2 min estará en `https://urpito.github.io/SillaMC/`.

## Modelo de monedas (sin cobrar a los jugadores)
Las **SillaCoins (SC)** se ganan **en la web** viendo anuncios (los anuncios de la web = ingresos del server vía AdSense). No hay anuncios dentro del juego. Para que las monedas lleguen a la cuenta in-game, corre `link_server.py` en el servidor y pon su URL en `API_BASE` (arriba de `script.js`). Sin backend, la web funciona en **modo demo** (código de verificación `123456`).

## Editar
- Recompensas de la tienda: array `STORE_ITEMS` en `script.js`.
- Textos ES/EN: objeto `I18N` en `script.js`.
- Anuncios AdSense: descomenta el bloque del `<head>` y pon tu `ca-pub-XXXX` (ver `ANUNCIOS.md`).

---
No afiliado a Mojang/Microsoft. Servidor comunitario. Solo se venden cosméticos/comodidad (EULA-safe).
