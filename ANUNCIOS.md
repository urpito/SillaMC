# Anuncios en SillaMC (solo en la WEB)

Modelo simple: **no hay anuncios dentro del juego**. Quien quiera **SillaCoins (SC)** entra a la **web** (su panel), donde hay anuncios. Esos anuncios = ingresos del servidor. Los jugadores no pagan nada.

## Activar Google AdSense (paso a paso)
> Solo paga con **tráfico real**. Con pocas visitas, céntimos.

1. **Publica la web** (ya va a GitHub Pages: `https://urpito.github.io/SillaMC/`). AdSense necesita un sitio online, no local.
2. Crea cuenta en **adsense.google.com** → "Añadir sitio" → pon la URL de tu Pages.
3. Verifica el sitio en AdSense (pega el snippet de verificación que te dé, o usa el método de meta-tag).
4. **Espera la revisión** de Google (días a ~2-3 semanas; pide contenido real y algo de tráfico).
5. Aprobado → crea un **bloque de anuncios** → copia tu **`ca-pub-XXXX`** (ID de editor) y el **`data-ad-slot`** (ID del bloque).
6. **Ya está todo programado:** abre `script.js` y rellena solo estas 2 líneas de arriba:
   ```js
   const ADSENSE_CLIENT = "ca-pub-XXXXXXXXXXXXXXXX";
   const ADSENSE_SLOT   = "1234567890";
   ```
   En cuanto tengan valor, los 3 huecos (landing + panel) muestran anuncios reales en vez del demo. Sin valores = demo.
7. Google paga por transferencia al llegar al **mínimo (~70€)**.

## Cómo se ganan las SillaCoins (el "reclamar")
- En el **panel** (`dashboard.html`), el jugador verificado ve anuncios y pulsa para **reclamar SC** (con cooldown para evitar abuso).
- Para que las SC lleguen **al juego**, corre `link_server.py` en urpilandia y pon su URL en `API_BASE` (arriba de `script.js`). Sin backend, es demo (no entrega SC reales in-game).
- **Rewarded video** (ver un vídeo para ganar) NO es de AdSense estándar; si algún día lo quieres, se usa una red de "rewarded ads" para webs (H5). De momento: anuncios display de AdSense en el panel + reclamo con cooldown.

**Recomendación:** publica en Pages, mete AdSense cuando tengas visitas, y de momento el panel ya monetiza las visitas de quien quiera SC.
