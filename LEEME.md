# SillaMC Survival — Web (guía)

Web estática bilingüe **ES/EN**, tema **oro + verde** (tu logo). Incluye: landing con logo, **vincular cuenta** (usuario → código en el juego → verificar), características, "gana SillaCoins viendo anuncios", **tienda con rangos de sillas** (Taburete/Sillón/Trono), demo de anuncio y huecos AdSense.

## 1) Verla ahora
Doble clic en **`index.html`**. Todo funciona en **modo demo** (idioma, tienda, copiar IP, ver-anuncio, y la verificación con código de prueba **123456**).

## 2) Pon tu LOGO
Guarda tu imagen del logo como **`logo.png`** en esta carpeta (junto a `index.html`). Aparece en la cabecera y el hero. Si no hay `logo.png`, se muestra un logo de texto "SILLAMC SURVIVAL" en oro+verde como respaldo.

## 3) Verificación de cuenta (usuario → código → validar)
Front-end listo. Para que funcione **de verdad** hace falta el mini-backend incluido:
1. En urpilandia: `python3 link_server.py` (usa Python estándar, sin dependencias; lee tu API key de `~/.ptero_key`). Escucha en el puerto **8770**.
2. En `script.js`, arriba, pon `API_BASE` con la URL pública del backend (ej. `"http://tu-dominio:8770"`). Vacío = modo demo.
3. Flujo real: el jugador (conectado al server) mete su usuario → el backend le manda el código por `/tell` al chat del juego → lo pega en la web → verificado.
> Para exponerlo a internet necesitarás abrir/redirigir el puerto 8770 (o ponerlo tras un proxy con HTTPS). Para pruebas en tu LAN va directo.

## 4) Publicar la web GRATIS
- **Cloudflare Pages / Netlify**: cuenta gratis → arrastra esta carpeta → URL con HTTPS. Luego apuntas tu dominio.
- (El backend `link_server.py` va aparte, en urpilandia.)

## 5) Anuncios
- **Demo:** ya se ve un anuncio de ejemplo en los dos huecos (para que veas cómo queda).
- **AdSense real:** cuando tengas cuenta aprobada + dominio con tráfico, descomenta el script de AdSense en `index.html` y mete tu `ca-pub-XXXX` + `data-ad-slot` en cada `.adslot__box`. (Necesita tráfico real para pagar algo.)
- **Anuncio→recompensa en el juego:** es el plugin RewardADs (SpigotMC) + tu cuenta; el botón "Ver anuncio" de la web es demo hasta enlazarlo.

## 6) Editar tienda / rangos / textos
- Recompensas: array `STORE_ITEMS` en `script.js` (`cur:"coins"` = SillaCoins, `cur:"eur"` = Tebex).
- Textos ES/EN: objeto `I18N`.
- Moneda: en el juego es **SC** (SillaCoins); en la web se muestra "SillaCoins · SC".

## 7) Estado del server en vivo (opcional)
En `script.js`, sustituye la última línea (`playerCount`) por `fetch("https://api.mcsrvstat.us/3/TU-IP")`.

---
**EULA:** todo lo vendible es cosmético/comodidad, nunca ventaja de juego. Mantenlo así o Mojang puede banear el server.
