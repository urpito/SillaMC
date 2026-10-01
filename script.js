/* ============================================================
   SillaMC Survival — funciona en index (landing) y dashboard
   · Recompensas: STORE_ITEMS · Textos: I18N
   · Backend: API_BASE. Sin él, el panel avisa de que no está conectado.
   ============================================================ */
/* Backend.
   · En el propio servidor (sillaweb.ddns.net) la API cuelga de /api: mismo
     origen, asi que no hay permisos entre dominios que configurar.
   · En local (Live Server) hace falta un tunel SSH al puerto 8770.
   · Desde cualquier otro sitio (github.io) apuntamos al servidor por su nombre. */
const WEB_HOST = "sillaweb.ddns.net";
const API_BASE = (() => {
  const h = location.hostname;
  if (h === "127.0.0.1" || h === "localhost") return "http://127.0.0.1:8770";
  if (h === WEB_HOST) return "/api";
  return "https://" + WEB_HOST + "/api";
})();

/* ===== Servidor. El registro SRV hace que en Java no haga falta escribir el puerto.
   Bedrock no soporta SRV, por eso sí lleva el 19132 a mano. ===== */
const SERVER = { host: "sillamc.ddns.net", bedrockPort: 19132 };

/* ===== Google AdSense — pon tus 2 IDs para activar anuncios reales =====
   1) Crea cuenta en adsense.google.com y aprueba tu sitio (tu URL de Pages).
   2) Pega aquí tu ID de editor (ca-pub-...) y el ID de un bloque de anuncio.
   Vacío = se muestra un anuncio DEMO. Ver ANUNCIOS.md */
const ADSENSE_CLIENT = "ca-pub-2645181840666522";  // tu ID de editor (ya en el <head>)
const ADSENSE_SLOT   = "9558886276";  // bloque "CercaComoEntrar"
let _adsenseLoaded = false;
function loadAdSense(){
  if(_adsenseLoaded || !ADSENSE_CLIENT) return;
  if(document.querySelector('script[src*="adsbygoogle.js"]')){_adsenseLoaded=true;return;}
  const s=document.createElement("script");
  s.async=true; s.crossOrigin="anonymous";
  s.src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client="+ADSENSE_CLIENT;
  document.head.appendChild(s); _adsenseLoaded=true;
}

/* Web 100% en español (de España). Sin selector de idioma. */
const I18N = {
  "nav.features":"Características","nav.finder":"Estadísticas","nav.discord":"Discord","nav.login":"Acceder","nav.home":"← Inicio",
  "hero.eyebrow":"SURVIVAL VANILLA++ · JAVA + BEDROCK · ESPAÑOL",
  "hero.tagline":"Economía viva, claims de terreno, trabajos y traductor de chat en tiempo real. Únete a la comunidad.",
  "hero.iplabel":"IP del servidor","hero.copy":"Copiar","hero.online":"En línea","hero.players":"jugadores",
  "hero.player":"jugador","hero.offline":"Fuera de línea","hero.checking":"Consultando…",
  "hero.bedrock":"Bedrock",
  "hero.enter":"Entrar a mi panel","hero.more":"Ver más",
  "features.title":"Qué hace especial a SillaMC",
  "band.n1":"Cross-play","band.t1":"Java y Bedrock juntos: PC, consola y móvil.",
  "band.n2":"Todo en español","band.t2":"Servidor 100% en castellano, sin líos de idiomas.",
  "band.n3":"Economía justa","band.t3":"Precios dinámicos, trabajos y SillaCoins.",
  "top.title":"Top jugadores","top.sub":"Los que más SillaCoins han amasado. ¿Te cuelas tú?","top.loading":"Cargando…","top.empty":"Aún no hay nadie con SillaCoins. ¡Sé el primero!",
  "finder.title":"Estadísticas","finder.sub":"Clasificación de jugadores con datos reales del servidor. Ordena por lo que quieras.",
  "finder.foot":"Se actualiza cada pocos segundos. El tiempo jugado, kills y muertes salen de las estadísticas del juego.",
  "finder.loading":"Cargando la clasificación…","finder.empty":"Aún no hay datos.","finder.error":"No se pudo cargar la clasificación.",
  "finder.search":"🔍 Buscar un jugador por su nombre…","finder.noresult":"Ningún jugador coincide con esa búsqueda.","finder.top10":"Top 10 · busca un nombre para ver a cualquiera",
  "prof.loading":"Cargando perfil…","prof.noname":"No has dicho de quién.","prof.notfound":"No encontramos a ese jugador.","prof.foot":"Solo datos del juego. Sin información personal.","prof.back":"← Volver a Estadísticas",
  "footer.join":"Únete","footer.legal":"No afiliado a Mojang ni Microsoft. SillaMC es un servidor comunitario.",
  "link.title":"Entra a tu panel","link.sub":"La primera vez entras con un código que te damos dentro del juego. Después puedes crear una contraseña si quieres.",
  "link.hint1":"Te aparecerá un código de 6 dígitos, solo para ti.",
  "link.codelabel":"Escribe el código que te ha llegado","link.verify":"Entrar",
  "link.hint2":"Caduca a los 5 minutos. No hace falta tu nombre: el código ya sabe quién eres.",
  "auth.tabcode":"Con código","auth.tabpass":"Con contraseña","auth.getcode":"Consigue tu código",
  "auth.ingame1":"Dentro de Minecraft, escribe","auth.ingame2":"Funciona en PC, móvil y consola. Debes haber hecho <code>/login</code> antes.",
  "auth.or":"o","auth.passlabel":"Nombre y contraseña","auth.enter":"Entrar",
  "auth.forgot":"¿La olvidaste? Entra con código, o abre un ticket en el Discord y pide ayuda a un miembro del staff.",
  "pw.title":"¿Quieres crear una contraseña? (opcional)","pw.sub":"No hace falta — siempre podrás entrar con el código del juego. Créala solo si quieres entrar más rápido la próxima vez.",
  "pw.save":"Guardar","pw.skip":"Ahora no","pw.hint":"No uses la misma contraseña que en el juego. El correo es por si necesitas recuperar la cuenta más adelante.",
  "dash.logout":"Salir","dash.hi":"Hola,","dash.earn":"Gana SillaCoins","dash.earndesc":"Muy pronto podrás ver un anuncio corto y recibir SC al instante.",
  "rewards.cta":"▶ Ver un anuncio","rewards.soon":"Próximamente","dash.rank":"Tu rango","dash.rankdesc":"Sube de rango en la tienda: Taburete → Sillón → Trono.",
  "store.title":"Tienda de recompensas","store.sub":"Rangos con prefijo, comodidad (homes, /nick) y packs de SC — nada de pay-to-win. Gasta SC o apoya el server.","ad.label":"Publicidad"
};

const FEATURES=[
 {i:"💰",t:["Economía dinámica","Tienda con precios por oferta/demanda y restock diario."]},
 {i:"🛡️",t:["Claims de terreno","Protege tus construcciones con ProtectionStones."]},
 {i:"🎫",mat:"nether_star",t:["Pase de temporada","50 niveles, misiones diarias y semanales, todo gratis."]},
 {i:"🎮",t:["Java + Bedrock","PC, consola o móvil. Crossplay con Geyser."]},
 {i:"⛏️",t:["Trabajos","Gana SC minando, talando, cultivando."]},
 {i:"🪑",t:["Rangos de sillas","De Taburete a Trono: sube y luce prefijo."]},
 {i:"⚖️",t:["Juego limpio","Anti-cheat, anti-grief y registro de bloques activos: sin tramposos, sin sustos."]}
];
const STORE_ITEMS=[
 {id:"sillapass_skip_tier",cat:"perk",icon:"⏭️",mat:"experience_bottle",price:400,cur:"coins",t:["Pase: saltar de nivel","Sube directamente al siguiente nivel del pase de temporada (la vía Gratis la tienen todos)."]},
 {id:"scythe_5m",cat:"perk",icon:"⏱️",mat:"diamond_hoe",tag:"GRANJA",price:10000,cur:"coins",t:["Autorreplantado 5 minutos","Durante 5 minutos, cada cultivo que coseches se replanta solo al instante — no hay que volver a plantar. Ideal si tienes una granja grande."]},
 {id:"pack_pan",cat:"pack",icon:"🍞",mat:"bread",price:15,cur:"coins",t:["Pack: 8 panes","Comida rápida para no morir de hambre a media partida."]},
 {id:"pack_antorchas",cat:"pack",icon:"🔥",mat:"torch",price:20,cur:"coins",t:["Pack: 16 antorchas","Para iluminar rápido una mina o una base nueva."]},
 {id:"pack_madera",cat:"pack",icon:"🪵",mat:"oak_log",price:55,cur:"coins",t:["Pack: 32 troncos de roble","Un empujón para empezar a construir sin tener que talar antes."]},
 {id:"pack_semillas",cat:"pack",icon:"🌾",mat:"wheat_seeds",price:12,cur:"coins",t:["Pack: 16 semillas de trigo","Para arrancar tu granja sin tener que buscar hierba alta."]},
 {id:"pack_piedra",cat:"pack",icon:"🧱",mat:"stone",price:10,cur:"coins",t:["Pack: 64 piedra","Material básico para no quedarte a medias en una construcción."]},
 {id:"pack_hierro",cat:"pack",icon:"⛏️",mat:"iron_ingot",tag:"NUEVO",price:40,cur:"coins",t:["Pack: 64 lingotes de hierro","Para herramientas, armadura o lo que te haga falta ahora mismo."]},
 {id:"pack_carbon",cat:"pack",icon:"⚫",mat:"coal",price:15,cur:"coins",t:["Pack: 32 carbón","Para antorchas y fundir sin tener que bajar a la mina."]},
 {id:"pack_arena",cat:"pack",icon:"🏖️",mat:"sand",price:130,cur:"coins",t:["Pack: 64 arena","Para cristal o construir, sin ir hasta la playa."]},
 {id:"pack_cuero",cat:"pack",icon:"🟫",mat:"leather",price:15,cur:"coins",t:["Pack: 8 cuero","Para libros, armadura de cuero o lo que estés fabricando."]},
 {id:"pack_silla",cat:"pack",icon:"🐴",mat:"saddle",price:130,cur:"coins",t:["Silla de montar","Para domar tu caballo, cerdo o strider sin buscarla en cofres."]}
];

let coins=0;            // siempre viene del servidor, nunca del navegador
let lockedCoins=0;      // SC de anuncios: se gastan, no se envian
let authTab="code";
let storeFilter="all";
const $=id=>document.getElementById(id);
const t=k=>I18N[k]||k;
const L=o=>o.t;
function toast(m){const el=$("toast");if(!el)return;el.textContent=m;el.classList.add("show");clearTimeout(el._t);el._t=setTimeout(()=>el.classList.remove("show"),2600);}

/* Cualquier <code>/comando</code> de la web recibe un botón para copiarlo, para
   que se pueda pegar directo en el chat de Minecraft sin escribirlo a mano. */
function addCommandCopyButtons(){
  document.querySelectorAll("code").forEach(el=>{
    if(el.dataset.cmdReady)return;
    const cmd=(el.textContent||"").trim();
    if(!cmd.startsWith("/"))return;
    el.dataset.cmdReady="1";
    el.classList.add("cmd-code");
    const btn=document.createElement("button");
    btn.type="button";
    btn.className="cmd-copy";
    btn.title="Copiar comando";
    btn.setAttribute("aria-label","Copiar comando");
    btn.innerHTML='<svg viewBox="0 0 24 24" width="13" height="13" aria-hidden="true"><path fill="currentColor" d="M16 1H4a2 2 0 0 0-2 2v14h2V3h12V1Zm3 4H8a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h11a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2Zm0 16H8V7h11v14Z"/></svg>';
    btn.addEventListener("click",e=>{
      e.preventDefault();
      navigator.clipboard.writeText(cmd).then(()=>toast("Comando copiado: "+cmd));
    });
    el.after(btn);
  });
}

function applyI18n(){
  document.querySelectorAll("[data-i18n]").forEach(el=>el.innerHTML=t(el.dataset.i18n));
  document.documentElement.lang="es";
}

/* ===== Selector de idioma (globo) =====
   La web se escribe y mantiene solo en español. Para el resto de idiomas no
   traducimos nada a mano: usamos el traductor de Google (gratis, cualquier
   idioma) por debajo de un boton propio con forma de globo. Por defecto
   nadie ve nada traducido; solo se activa si el visitante elige un idioma. */
const LANG_QUICK=[["es","Español"],["en","English"],["pt","Português"],["fr","Français"]];
const LANG_MORE=[["de","Deutsch"],["it","Italiano"],["ca","Català"],["eu","Euskara"],["gl","Galego"],
  ["nl","Nederlands"],["pl","Polski"],["ro","Română"],["sv","Svenska"],["tr","Türkçe"],["ru","Русский"],
  ["uk","Українська"],["el","Ελληνικά"],["ar","العربية"],["he","עברית"],["hi","हिन्दी"],["zh-CN","中文"],
  ["ja","日本語"],["ko","한국어"],["vi","Tiếng Việt"],["th","ไทย"],["id","Bahasa Indonesia"],["fil","Filipino"],
  ["cs","Čeština"],["hu","Magyar"],["fi","Suomi"],["da","Dansk"],["no","Norsk"],["bg","Български"],
  ["sr","Српски"],["hr","Hrvatski"]];
let _gtLoaded=false;
function loadGoogleTranslate(){
  if(_gtLoaded)return;_gtLoaded=true;
  window.googleTranslateElementInit=()=>{new google.translate.TranslateElement({pageLanguage:"es",autoDisplay:false},"google_translate_element");};
  const s=document.createElement("script");
  s.src="https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
  document.head.appendChild(s);
}
function doGTranslate(lang){
  if(lang==="es"){
    document.cookie="googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    document.cookie="googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain="+location.hostname+";";
    location.reload();
    return;
  }
  loadGoogleTranslate();
  const tryIt=(left)=>{
    const combo=document.querySelector("#google_translate_element select.goog-te-combo");
    if(!combo||combo.options.length<2){ if(left>0)setTimeout(()=>tryIt(left-1),300); return; }
    combo.value=lang;
    combo.dispatchEvent(new Event("change",{bubbles:true}));
  };
  tryIt(30);
}
function initLangSwitcher(){
  if($("langFab"))return;
  const holder=document.createElement("div");
  holder.id="google_translate_element";
  document.body.appendChild(holder);

  const fab=document.createElement("button");
  fab.className="lang-fab";fab.id="langFab";fab.type="button";fab.setAttribute("aria-label","Cambiar idioma");
  fab.innerHTML='<svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><path fill="currentColor" d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Zm6.93 6h-2.95a15.7 15.7 0 0 0-1.38-3.56A8.03 8.03 0 0 1 18.93 8ZM12 4.04c.83 1.2 1.5 2.55 1.97 3.96h-3.94c.47-1.41 1.14-2.76 1.97-3.96ZM4.26 14a7.94 7.94 0 0 1 0-4h3.38a16.6 16.6 0 0 0 0 4H4.26Zm.81 2h2.95c.32 1.25.78 2.45 1.38 3.56A8.03 8.03 0 0 1 5.07 16Zm2.95-8H5.07a8.03 8.03 0 0 1 4.33-3.56A15.7 15.7 0 0 0 8.02 8ZM12 19.96c-.83-1.2-1.5-2.55-1.97-3.96h3.94c-.47 1.41-1.14 2.76-1.97 3.96ZM10.06 14a14.6 14.6 0 0 1 0-4h3.88a14.6 14.6 0 0 1 0 4h-3.88Zm4.51 5.56c.6-1.11 1.06-2.31 1.38-3.56h2.95a8.03 8.03 0 0 1-4.33 3.56ZM16.35 14a16.6 16.6 0 0 0 0-4h3.38a7.94 7.94 0 0 1 0 4h-3.38Z"/></svg>';
  document.body.appendChild(fab);

  const panel=document.createElement("div");
  panel.className="lang-menu";panel.id="langMenu";
  panel.innerHTML=
    LANG_QUICK.map(([code,name])=>`<button type="button" data-lang="${code}">${name}</button>`).join("")+
    `<div class="lang-menu__more"><select id="langMoreSelect"><option value="">Otro idioma…</option>`+
    LANG_MORE.map(([code,name])=>`<option value="${code}">${name}</option>`).join("")+
    `</select></div>`;
  document.body.appendChild(panel);

  fab.addEventListener("click",e=>{e.stopPropagation();panel.classList.toggle("is-open");});
  document.addEventListener("click",e=>{if(!panel.contains(e.target)&&e.target!==fab)panel.classList.remove("is-open");});
  panel.querySelectorAll("button[data-lang]").forEach(b=>{
    b.addEventListener("click",()=>{doGTranslate(b.dataset.lang);panel.classList.remove("is-open");});
  });
  $("langMoreSelect").addEventListener("change",e=>{if(e.target.value){doGTranslate(e.target.value);panel.classList.remove("is-open");}});
}
function renderFeatures(){
  if(!$("featuresGrid"))return;
  $("featuresGrid").innerHTML=FEATURES.map(f=>{
    const icon=f.mat
      ?`<img class="fcard__icon-img" src="${mcItemIconUrl(f.mat)}" alt="" loading="lazy" onerror="this.outerHTML='<div class=&quot;fcard__icon&quot;>${f.i}</div>'" />`
      :`<div class="fcard__icon">${f.i}</div>`;
    return `<div class="fcard">${icon}<h3>${L(f)[0]}</h3><p>${L(f)[1]}</p></div>`;
  }).join("");
}
function renderStore(){
  if(!$("storeGrid"))return;
  const tabs=[["all","Todo"],["perk","Comodidad"],["pack","Packs"]];
  $("storeTabs").innerHTML=tabs.map(([k,l])=>`<button class="tab ${storeFilter===k?'is-active':''}" data-tab="${k}">${l}</button>`).join("");
  const items=STORE_ITEMS.filter(i=>storeFilter==="all"||i.cat===storeFilter);
  $("storeGrid").innerHTML=items.map(it=>{
    const price=it.cur==="coins"?`${it.price.toLocaleString()} <small>SC</small>`:`${it.price}€`;
    const buy=it.cur==="coins"?"Canjear":"Comprar";
    const icon=it.mat
      ?`<img class="scard__icon-img" src="${mcItemIconUrl(it.mat)}" alt="" loading="lazy" onerror="this.outerHTML='<div class=&quot;scard__icon&quot;>${it.icon}</div>'" />`
      :`<div class="scard__icon">${it.icon}</div>`;
    return `<div class="scard">${it.tag?`<span class="scard__tag">${it.tag}</span>`:""}${icon}<h3>${L(it)[0]}</h3><p>${L(it)[1]}</p><div class="scard__foot"><span class="scard__price">${price}</span><button class="btn btn--primary" data-buy="${STORE_ITEMS.indexOf(it)}">${buy}</button></div></div>`;
  }).join("");
}
/* Un anuncio se pinta UNA vez. Volver a pintarlo seria recargarlo sin que el
   usuario haga nada, y eso Google lo prohibe. */
const _adsFilled=new Set();
function renderAds(){
  loadAdSense();
  const slots=["adTop","adMid","adBottom"].filter(id=>$(id));
  if(!slots.length)return;
  if(ADSENSE_CLIENT && ADSENSE_SLOT){
    slots.forEach(id=>{
      const box=$(id);
      if(_adsFilled.has(id))return;
      // Los huecos del panel estan ocultos hasta que entras: si los rellenamos
      // ahora, AdSense los mide con 0 de ancho y no muestra nada nunca.
      if(!box.offsetWidth)return;
      _adsFilled.add(id);
      box.innerHTML=`<ins class="adsbygoogle" style="display:block;width:100%" data-ad-client="${ADSENSE_CLIENT}" data-ad-slot="${ADSENSE_SLOT}" data-ad-format="auto" data-full-width-responsive="true"></ins>`;
      try{(window.adsbygoogle=window.adsbygoogle||[]).push({});}catch(e){}
    });
    return;
  }
  const ad=`<div class="demoad"><span class="demoad__ico">🎮</span><div><div class="demoad__t">Tu anuncio aquí</div><div class="demoad__d">Espacio patrocinado · se activa con AdSense (ver ANUNCIOS.md)</div></div><span class="demoad__cta">Saber más</span></div>`;
  slots.forEach(id=>$(id).innerHTML=ad);
}
let _shownCoins=null;
const _coinLoc=()=>"es-ES";
const fmtCoinsExact=v=>v.toLocaleString(_coinLoc(),{maximumFractionDigits:2});
function animateCoins(el,from,to){
  const dur=650,start=performance.now();
  (function step(now){
    const t=Math.min(1,(now-start)/dur), e=1-Math.pow(1-t,3);
    el.textContent=Math.round(from+(to-from)*e).toLocaleString(_coinLoc());
    if(t<1)requestAnimationFrame(step); else el.textContent=fmtCoinsExact(to);
  })(start);
}
function updateCoins(){
  const el=$("coinBalance");
  if(el){
    const reduce=window.matchMedia&&window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if(_shownCoins===null||coins===_shownCoins||reduce){
      el.textContent=fmtCoinsExact(coins);
    }else{
      // el número sube o baja hasta el nuevo saldo, con un flash verde/rojo
      el.classList.remove("coin-up","coin-down"); void el.offsetWidth;
      el.classList.add(coins>_shownCoins?"coin-up":"coin-down");
      animateCoins(el,_shownCoins,coins);
    }
    _shownCoins=coins;
  }
  const note=$("lockedNote");
  if(!note)return;
  if(lockedCoins>0.01){
    note.style.display="block";
    note.textContent=`${Math.round(lockedCoins).toLocaleString("es-ES")} SC de anuncios · solo para gastar`;
  } else note.style.display="none";
}

/* ---- estado del servidor en vivo (dos APIs públicas, la 2ª es el respaldo) ---- */
let _status=null;   // null = aún no sabemos | {online, now, max}
async function fetchStatus(){
  // mcstatus.io va primero: cachea 60s. mcsrvstat cachea 300s y tarda 5 min en
  // enterarse de que alguien ha entrado, asi que solo lo usamos de respaldo.
  const sources=[
    [`https://api.mcstatus.io/v2/status/java/${SERVER.host}`, d=>({online:d.online,now:d.players?.online??0,max:d.players?.max??0})],
    [`https://api.mcsrvstat.us/3/${SERVER.host}`, d=>({online:d.online,now:d.players?.online??0,max:d.players?.max??0})]
  ];
  for(const [url,parse] of sources){
    try{
      const r=await fetch(url,{cache:"no-store"});
      if(!r.ok) continue;
      const d=await r.json();
      if(typeof d.online!=="boolean") continue;
      return parse(d);
    }catch(e){ /* probamos la siguiente */ }
  }
  return null;
}
function renderStatus(){
  const dot=$("statusDot"),txt=$("statusText");
  if(!dot||!txt)return;
  dot.className="dot "+(!_status?"dot--wait":_status.online?"dot--on":"dot--off");
  if(!_status){txt.textContent=t("hero.checking");return;}
  if(!_status.online){txt.textContent=t("hero.offline");return;}
  const word=_status.now===1?t("hero.player"):t("hero.players");
  txt.innerHTML=`${t("hero.online")} · <b>${_status.now}</b> ${word}`;
}
async function initStatus(){
  if(!$("statusDot"))return;
  const tick=async()=>{_status=await fetchStatus();renderStatus();};
  await tick();
  setInterval(tick,60000);
}

/* ---- Top jugadores (leaderboard público, lee /api/rankings/money) ---- */
const _esc=s=>String(s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
async function renderLeaderboard(){
  const el=$("leaderboard"); if(!el)return;
  let top=[];
  try{
    const r=await fetch((API_BASE||"")+"/rankings/money",{cache:"no-store"});
    if(r.ok){ const d=await r.json(); top=(d.top||[]); }
  }catch(e){}
  top=top.filter(p=>p.balance>0.5).slice(0,10);
  if(!top.length){ el.innerHTML=`<li class="lb__msg">${t("top.empty")}</li>`; return; }
  const medal=["🥇","🥈","🥉"];
  el.innerHTML=top.map((p,i)=>{
    const clean=(p.name||"").replace(/^\./,"")||"Steve";
    const rank=medal[i]||`<b class="lb__num">${i+1}</b>`;
    const sc=Math.round(p.balance).toLocaleString("es-ES");
    return `<li class="lb__row${i<3?" lb__row--top":""}">`
      +`<span class="lb__rank">${rank}</span>`
      // El top 10 va SIN lazy: son las caras que tienen que estar siempre, y
      // ademas salen arriba del todo (lazy solo retrasaba su carga).
      +`<img class="lb__face" alt="" width="30" height="30" src="${avatarUrl(clean,30)}" />`
      +`<span class="lb__name">${_esc(p.name)}</span>`
      +`<span class="lb__sc">${sc} <small>SC</small></span></li>`;
  }).join("");
}

/* ============ sesión ============ */
const tokenKey="sillamc_token";
const getToken=()=>localStorage.getItem(tokenKey);
const setToken=t=>localStorage.setItem(tokenKey,t);
const clearToken=()=>localStorage.removeItem(tokenKey);

/** Mensajes de error del backend traducidos a algo que un jugador entienda. */
const ERRORS={
  offline:"No estás conectado al servidor ahora mismo.",
  not_logged_in:"Primero escribe /login dentro del juego.",
  cooldown:"Espera un poco antes de pedir otro código.",
  no_code:"No has pedido ningún código. Escribe /cuentaweb en el juego.",
  expired:"El código ha caducado. Pide otro.",
  wrong_code:"Código incorrecto.",
  too_many_attempts:"Demasiados intentos. Espera unos minutos.",
  bad_credentials:"Nombre o contraseña incorrectos.",
  bad_username:"Ese nombre no es válido.",
  server_offline:"El servidor de Minecraft está apagado.",
  unknown_player:"No conocemos a ese jugador."
};
const errMsg=e=>ERRORS[e]||"Algo ha fallado.";

async function api(path,{method="GET",body=null,auth=false}={}){
  if(!API_BASE)throw new Error("no_api");
  const headers={};
  if(body)headers["Content-Type"]="application/json";
  if(auth){const t=getToken();if(t)headers["Authorization"]="Bearer "+t;}
  const r=await fetch(API_BASE+path,{method,headers,body:body?JSON.stringify(body):null});
  let data={};try{data=await r.json();}catch(e){}
  return {ok:r.ok,status:r.status,data};
}

function view(name){
  const views={loginView:"loginView",pwOfferView:"pwOfferView",dashView:"dashView"};
  Object.values(views).forEach(id=>{if($(id))$(id).style.display="none";});
  if($(name))$(name).style.display="block";
  if($("logoutBtn"))$("logoutBtn").style.display=(name==="loginView")?"none":"inline-flex";
  if(name!=="dashView")stopBalancePolling();
}

async function loadBalance(){
  const {ok,data}=await api("/me/balance",{auth:true});
  if(!ok)return;
  coins=data.balance||0;
  lockedCoins=data.locked||0;
  updateCoins();
}

/** Canjea un item de la tienda de SC: cobra vía /me/store/buy y lo entrega en el server. */
async function redeemStoreItem(it,btn){
  const original=btn?btn.textContent:null;
  if(btn){btn.disabled=true;btn.textContent="Canjeando…";}
  const {ok,data}=await api("/me/store/buy",{method:"POST",auth:true,body:{item:it.id}});
  if(ok && data.ok){
    if(btn)btn.textContent="✓ ¡Listo!";
    toast("¡Canjeado! Revisa tu inventario en el server.");
    loadBalance();
    loadSillaPass();
    setTimeout(()=>{if(btn){btn.disabled=false;btn.textContent=original;}},2000);
    return;
  }else{
    const err=(data&&data.error)||"";
    const msg=err==="insufficient"?"No te alcanzan los SC."
      :err==="must_be_online"?"Debes estar conectado al servidor para recibir este objeto."
      :"No se pudo canjear. Inténtalo de nuevo.";
    toast(msg);
  }
  if(btn){btn.disabled=false;btn.textContent=original;}
}

/* ---- Recompensa diaria: SC una vez al dia (UTC) con bonus por racha. ---- */
let _dailyTimer=null,_dailyBound=false;
function _cd(s){s=Math.max(0,s|0);const p=n=>String(n).padStart(2,"0");
  return p(Math.floor(s/3600))+":"+p(Math.floor(s%3600/60))+":"+p(s%60);}
function renderDaily(d){
  const btn=$("dailyBtn"),note=$("dailyNote"),desc=$("dailyDesc"),ttl=$("dailyTitle");
  if(!btn)return;
  if(_dailyTimer){clearInterval(_dailyTimer);_dailyTimer=null;}
  const r=d.streak||0;
  if(ttl)ttl.textContent="Recompensa diaria";
  if(desc)desc.textContent=r>0
    ? ("Llevas "+r+(r===1?" día seguido":" días seguidos")+". ¡No rompas la racha!")
    : "Entra cada día y llévate SillaCoins. Cuantos más días seguidos, más SC.";
  if(d.claimed_today){
    btn.disabled=true;
    let left=d.seconds_to_reset||0;
    const tick=()=>{
      btn.textContent="Vuelve en "+_cd(left);
      if(left<=0){clearInterval(_dailyTimer);_dailyTimer=null;loadDaily();}
      left--;
    };
    tick();_dailyTimer=setInterval(tick,1000);
    if(note)note.textContent="Mañana te tocan "+d.next_amount+" SC.";
  }else{
    btn.disabled=false;
    btn.textContent="Reclamar "+d.next_amount+" SC";
    const max=(d.base||0)+((d.max_days||1)-1)*(d.bonus||0);
    if(note)note.textContent="Racha máxima a los "+d.max_days+" días: "+max+" SC al día.";
  }
}
async function loadDaily(){
  if(!_dailyBound&&$("dailyBtn")){$("dailyBtn").addEventListener("click",claimDaily);_dailyBound=true;}
  const {ok,data}=await api("/me/daily",{auth:true});
  if(ok&&data&&data.ok)renderDaily(data);
}
async function claimDaily(){
  const btn=$("dailyBtn");if(!btn||btn.disabled)return;
  btn.disabled=true;
  let res;try{res=await api("/me/daily",{method:"POST",auth:true});}catch(e){res={ok:false,data:{}};}
  const d=res.data||{};
  if(res.ok&&d.ok){
    toast("¡+"+d.amount+" SC! Racha: "+d.streak);
    loadBalance();
    renderDaily({claimed_today:true,streak:d.streak,next_amount:d.next_amount,
                 seconds_to_reset:d.seconds_to_reset,base:d.base,bonus:d.bonus,max_days:d.max_days});
  }else if(d.error==="already_claimed"){ toast("Ya la has reclamado hoy."); loadDaily();
  }else if(d.error==="ip_cap"){ toast("Demasiadas cuentas desde esta conexión hoy."); loadDaily();
  }else{ toast("El servidor no responde, inténtalo luego."); btn.disabled=false; }
}

/* Puesto del jugador en el ranking de dinero (un empujoncito competitivo). */
async function loadBadge(){
  const el=$("rankBadge"); if(!el)return;
  try{
    const {ok,data}=await api("/me/badge",{auth:true});
    if(!ok || !data || !data.es) return;
    if(data.img){
      el.innerHTML=`<img class="rankbadge__img" src="mc-icons/ranks/${data.img}.png" alt="${escapeHtml(data.es)}" />`;
    }else{
      el.textContent=data.icon?`${data.icon} ${data.es}`:data.es;
    }
  }catch(e){}
}

async function loadRank(){
  const el=$("rankPos"); if(!el)return;
  try{
    const {ok,data}=await api("/me/rank",{auth:true});
    if(ok && data && data.position){
      el.style.display="block";
      el.textContent=`🏆 Puesto #${data.position} de ${data.total} en dinero`;
    } else el.style.display="none";
  }catch(e){ if(el)el.style.display="none"; }
}

/* Mantener el saldo y el SillaPass al día sin que el jugador refresque: sondeo
   cada segundo mientras la pestaña está visible, y refresco inmediato al volver a ella. */
let _balanceTimer=null,_balanceTick=0;
function startBalancePolling(){
  stopBalancePolling();
  _balanceTick=0;
  _balanceTimer=setInterval(()=>{
    if(document.visibilityState!=="visible")return;
    loadBalance();
    loadSillaPass();
    _balanceTick++;
    if(_balanceTick%15===0)loadCrate();   // el tiempo activo lo cuenta el server cada 30s, no hace falta más
  }, 1000);
}
function stopBalancePolling(){ if(_balanceTimer){clearInterval(_balanceTimer);_balanceTimer=null;} }
document.addEventListener("visibilitychange",()=>{
  if(document.visibilityState==="visible" && getToken() && $("dashView") && $("dashView").style.display!=="none"){
    loadBalance();
    loadSillaPass();
  }
});

function enterDashboard(name){
  if(name)localStorage.setItem("sillamc_name",name);   // la landing lo usa para la cara
  if($("dashUser"))$("dashUser").textContent=name;
  const av=$("dashAvatar");
  if(av){
    av.onerror=()=>{av.onerror=null;av.src=avatarUrl("Steve");};
    av.src=avatarUrl(name);
  }
  view("dashView");
  renderStore();renderAds();updateCoins();loadBalance();loadRank();loadBadge();startBalancePolling();loadDaily();
  loadSillaPass();loadMyThings();loadCrate();
}

/* ---- Caja SillaMC: se gana con 2h de juego activo (sin afk), 1 al día. ---- */
let _crateTimer=null,_crateOpening=false;
function _fmtHM(s){s=Math.max(0,s|0);const h=Math.floor(s/3600),m=Math.floor(s%3600/60);
  return h>0?(h+"h "+m+"min"):(m+"min");}
function renderCrate(d){
  const section=$("crateSection"),bar=$("crateBarFill"),btn=$("crateBtn"),note=$("crateNote"),desc=$("crateDesc");
  if(!section)return;
  if(_crateTimer){clearInterval(_crateTimer);_crateTimer=null;}
  if(!d){section.style.display="none";return;}
  section.style.display="";   // el apartado se ve siempre: aunque la caja gratis esté apagada, se puede canjear un código
  if(!d.enabled){
    if(bar)bar.style.width="0%";
    btn.disabled=true;btn.textContent="No disponible";
    if(desc)desc.textContent="Las cajas gratuitas todavía no están activas.";
    if(note)note.textContent="Si tienes un código, puedes canjearlo abajo.";
    return;
  }
  if(desc)desc.textContent="Juega 2 horas activo (sin estar afk) y llévate una caja gratis al día.";
  const pct=Math.min(100,Math.round(100*(d.active_seconds_today||0)/(d.required_seconds||7200)));
  if(bar)bar.style.width=pct+"%";
  if(d.already_opened_today){
    btn.disabled=true;btn.textContent="Ya has abierto tu caja de hoy";
    if(note)note.textContent="Premio: "+((d.opening&&d.opening.reward_label)||"—")+". Vuelve mañana.";
  }else if(d.eligible){
    btn.disabled=false;btn.textContent="🎁 Abrir caja";
    if(note)note.textContent="¡Ya has jugado suficiente hoy! Pulsa para abrirla.";
  }else{
    btn.disabled=true;
    const left=Math.max(0,(d.required_seconds||7200)-(d.active_seconds_today||0));
    btn.textContent="Te faltan "+_fmtHM(left);
    if(note)note.textContent="Cuenta el tiempo jugando SIN estar afk. Se comprueba solo, no hace falta hacer nada especial.";
  }
}
async function loadCrate(){
  if(!$("crateBtn"))return;
  if(!_crateBound){
    $("crateBtn").addEventListener("click",openCrate);
    $("crateCodeBtn").addEventListener("click",redeemCrateCode);
    $("crateCodeInput").addEventListener("keydown",e=>{if(e.key==="Enter")redeemCrateCode();});
    _crateBound=true;
  }
  const {ok,data}=await api("/me/crate/status",{auth:true});
  if(ok&&data&&data.ok){_lastCrateRewards=data.rewards||[];renderCrate(data);}
  loadCrateHistory();
}
let _crateBound=false,_lastCrateRewards=[];
async function openCrate(){
  if(_crateOpening)return;
  const btn=$("crateBtn");if(!btn||btn.disabled)return;
  _crateOpening=true;btn.disabled=true;
  let res;try{res=await api("/me/crate/open",{method:"POST",auth:true});}catch(e){res={ok:false,data:{}};}
  const d=res.data||{};
  if(res.ok&&d.ok){
    playCrateReel(d.reward_label,d.reward_kind,d.reward_payload,d.reward_kind==="sc"?"#7fd18a":"#d8b4e2");
  }else{
    const err=d.error||"";
    toast(err==="not_eligible"?"Todavía no llevas suficiente tiempo activo hoy."
      :err==="disabled"?"Las cajas están desactivadas ahora mismo."
      :"No se pudo abrir la caja. Inténtalo de nuevo.");
    _crateOpening=false;
  }
  loadCrate();loadBalance();
}
async function redeemCrateCode(){
  const input=$("crateCodeInput");
  const code=(input.value||"").trim();
  if(!code){toast("Escribe un código.");return;}
  if(_crateOpening)return;
  _crateOpening=true;
  const {ok,data}=await api("/me/redeem",{method:"POST",auth:true,body:{code}});
  if(ok&&data.ok){
    input.value="";
    playCrateReel(data.reward_label,data.reward_kind,data.reward_payload,data.reward_kind==="sc"?"#7fd18a":"#d8b4e2");
  }else{
    const err=(data&&data.error)||"";
    toast(err==="invalid_code"?"Ese código no existe o está desactivado."
      :err==="exhausted"?"Ese código ya se ha agotado."
      :err==="already_used"?"Ya has usado ese código."
      :"No se pudo canjear el código.");
    _crateOpening=false;
  }
  loadCrate();loadBalance();
}
async function loadCrateHistory(){
  const box=$("crateHistory");
  if(!box)return;
  const {ok,data}=await api("/me/crate/history",{auth:true});
  if(!ok||!data.ok||!(data.openings||[]).length){box.innerHTML="";return;}
  box.innerHTML="<p class=\"section__sub\" style=\"margin:0 0 .3rem\">Tus últimas cajas</p>"
    +data.openings.map(o=>`<div class="cratesec__history-row"><span>🎁 ${escapeHtml(o.reward_label)}</span>`
      +`<span>${new Date(o.opened_at*1000).toLocaleString("es-ES")}</span></div>`).join("");
}
/* Texto del tile: para SC solo el numero (el icono de moneda ya dice "SC"). */
function _crateItemLabel(kind,payload,fallbackLabel){
  if(kind==="sc"&&payload&&payload.amount!=null)return String(payload.amount);
  return fallbackLabel;
}
function _crateItemIconHtml(kind){
  return kind==="sc"?`<img src="sillacoin.png" alt="SC" />`:"";
}
function playCrateReel(winLabel,winKind,winPayload,winColor){
  const modal=$("crateModal"),track=$("crateReelTrack"),resultEl=$("crateResult"),closeBtn=$("crateModalClose");
  if(!modal||!track){_crateOpening=false;return;}
  resultEl.style.display="none";closeBtn.style.display="none";
  const pool=(_lastCrateRewards.length?_lastCrateRewards:[{label:winLabel,kind:winKind,payload:winPayload,color:winColor}]);
  const ITEM_W=160,COUNT=60,WIN_INDEX=50;
  const DURATION_MS=10000;
  track.style.transition="none";track.style.transform="translateX(0px)";
  track.innerHTML="";
  for(let i=0;i<COUNT;i++){
    const it=(i===WIN_INDEX)?{label:winLabel,kind:winKind,payload:winPayload,color:winColor}
      :pool[Math.floor(Math.random()*pool.length)];
    const div=document.createElement("div");
    div.className="crate-reel__item";
    div.style.background=it.color||"#8a8f98";
    div.innerHTML=_crateItemIconHtml(it.kind)+`<span>${_crateItemLabel(it.kind,it.payload,it.label)}</span>`;
    track.appendChild(div);
  }
  modal.style.display="flex";
  const viewport=track.parentElement;
  requestAnimationFrame(()=>{
    const vw=viewport.clientWidth;
    const jitter=(Math.random()*.6-.3)*ITEM_W;
    const target=(WIN_INDEX*ITEM_W+ITEM_W/2)-(vw/2)+jitter;
    requestAnimationFrame(()=>{
      track.style.transition="transform "+(DURATION_MS/1000)+"s cubic-bezier(.09,.82,.13,1)";
      track.style.transform="translateX(-"+target+"px)";
    });
  });
  setTimeout(()=>{
    resultEl.innerHTML="🎉 ¡Has ganado "+_crateItemIconHtml(winKind)+" <b>"+escapeHtml(winLabel)+"</b>!";
    resultEl.style.display="";
    closeBtn.style.display="";
    _crateOpening=false;
  },DURATION_MS+200);
}
document.addEventListener("DOMContentLoaded",()=>{
  const closeBtn=document.getElementById("crateModalClose");
  if(closeBtn)closeBtn.addEventListener("click",()=>{$("crateModal").style.display="none";});
});

/** Nivel/XP/premium de SillaPass, leidos del backend (que a su vez lee el YAML del plugin). */
/** Iconos de items reales de Minecraft (CDN publico de PrismarineJS via jsDelivr).
    Si un material no existe ahi, el onerror lo cambia por un emoji generico -
    nunca se queda con un icono roto. */
const MC_ITEM_ICON_BASE="https://cdn.jsdelivr.net/gh/PrismarineJS/minecraft-assets@master/data/1.21.1/items/";
const MC_BLOCK_ICON_BASE="https://cdn.jsdelivr.net/gh/PrismarineJS/minecraft-assets@master/data/1.21.1/blocks/";
/* Los iconos que usamos siempre (tienda, misiones, pase) se sirven desde
   nuestro propio servidor para que no parpadeen esperando al CDN externo.
   Los materiales que un admin escriba a mano en las recompensas del pase
   (pueden ser cualquier cosa) siguen tirando del CDN como respaldo. */
const MC_ICON_LOCAL_DIR="mc-icons/";
const MC_ICON_LOCAL_SET=new Set(["bone","bone_block_side","bread","carrots_stage3","clock_00","coal","coal_ore",
  "cobblestone","cooked_beef","copper_ore","deepslate","deepslate_coal_ore","deepslate_copper_ore",
  "deepslate_diamond_ore","deepslate_emerald_ore","deepslate_gold_ore","deepslate_iron_ore","deepslate_lapis_ore",
  "deepslate_redstone_ore","diamond","diamond_hoe","diamond_ore","emerald","emerald_ore","ender_pearl",
  "experience_bottle","fishing_rod","glass_bottle","gold_ore","golden_apple","gunpowder","iron_ingot","iron_ore",
  "iron_pickaxe","iron_sword","lapis_ore","leather","leather_boots","nether_gold_ore","nether_star",
  "netherite_ingot","netherite_scrap","oak_log","paper","potatoes_stage3","redstone_ore","rotten_flesh","saddle",
  "sand","spider_eye","stone","torch","trial_key","wheat_seeds","wheat_stage7","writable_book",
  "netherrack","end_stone","grass_block_side","dirt",
  /* Camas: el juego las pinta en 3D y no tienen textura plana (salia la lana).
     Estas se dibujaron con la misma vista que el inventario (BedIcons.java). */
  "white_bed","orange_bed","magenta_bed","light_blue_bed","yellow_bed","lime_bed","pink_bed","gray_bed","light_gray_bed","cyan_bed","purple_bed","blue_bed","brown_bed","green_bed","red_bed","black_bed"]);
/* Nombres en español de los materiales que aparecen como recompensa: si no
   esta en la lista, se muestra el nombre tal cual (legible pero en ingles). */
const MC_MATERIAL_ES={
  diamond:"Diamante", emerald:"Esmeralda", iron_ingot:"Lingote de hierro", gold_ingot:"Lingote de oro",
  netherite_ingot:"Lingote de netherita", netherite_scrap:"Chatarra de netherita",
  golden_apple:"Manzana dorada", enchanted_golden_apple:"Manzana dorada encantada",
  cooked_beef:"Filete asado", bread:"Pan", diamond_hoe:"Azada de diamante", saddle:"Silla de montar",
  torch:"Antorcha", oak_log:"Tronco de roble", stone:"Piedra", cobblestone:"Adoquín", sand:"Arena",
  coal:"Carbón", leather:"Cuero", wheat_seeds:"Semillas de trigo", paper:"Papel",
  experience_bottle:"Botella de experiencia", nether_star:"Estrella del Nether",
  elytra:"Élitros", totem_of_undying:"Tótem de la inmortalidad", ancient_debris:"Restos antiguos",
  diamond_pickaxe:"Pico de diamante", diamond_sword:"Espada de diamante", trial_key:"Llave"
};
// Los bloques (a diferencia de herramientas/comida) no tienen icono en items/ -
// esos materiales viven en blocks/ como textura plana.
/* Ya tenemos TODAS las texturas en local (mc-icons/items y mc-icons/blocks), asi
   que el CDN externo solo se usa como ultimo recurso para materiales de versiones
   mas nuevas que los assets descargados. */
const MC_LOCAL_ITEM_DIR="mc-icons/items/";
const MC_LOCAL_BLOCK_DIR="mc-icons/blocks/";
/* Icono visible para lo que no tiene textura posible: mejor un simbolo claro que
   un hueco en blanco (que parecia que la foto "no cargaba"). */
const MC_UNKNOWN_ICON=MC_LOCAL_ITEM_DIR+"barrier.png";

function mcHasItem(n){ return typeof MC_TEX_I!=="undefined" && MC_TEX_I.has(n); }
function mcHasBlock(n){ return typeof MC_TEX_B!=="undefined" && MC_TEX_B.has(n); }
function mcPath(n){
  if(mcHasItem(n))return MC_LOCAL_ITEM_DIR+n+".png";
  if(mcHasBlock(n))return MC_LOCAL_BLOCK_DIR+n+".png";
  return null;
}
/**
 * Muchos materiales NO tienen una textura con su nombre, porque el juego los
 * dibuja a partir de otra: las vallas usan la textura de las tablas, los huevos
 * de spawn comparten uno tintado por mob, las camas y banderas usan la lana...
 * Por eso aqui se prueban varios candidatos y se devuelve el primero que existe
 * de verdad en el indice (cero 404 y cero huecos en blanco).
 */
/* Casos sin textura propia posible, con el sustituto mas reconocible que hay en
   los assets. El tooltip de cada hueco sigue diciendo el nombre exacto. */
const MC_ICON_ALIAS={
  chest:"chest_minecart", trapped_chest:"chest_minecart", ender_chest:"chest_minecart",
  player_head:"skull_banner_pattern", skeleton_skull:"skull_banner_pattern",
  wither_skeleton_skull:"skull_banner_pattern", zombie_head:"skull_banner_pattern",
  creeper_head:"skull_banner_pattern", dragon_head:"skull_banner_pattern",
  piglin_head:"skull_banner_pattern",
  decorated_pot:"flower_pot",   // su textura es de entidad, no esta en items/blocks
};
function mcIconCandidates(m){
  const out=[m];
  if(MC_ICON_ALIAS[m])out.push(MC_ICON_ALIAS[m]);
  // Bloques cuya textura va por caras (grass_block, pumpkin, furnace...).
  out.push(m+"_side",m+"_top",m+"_front");
  const strip=(suf)=>m.endsWith(suf)?m.slice(0,-suf.length):null;

  const fence=strip("_fence_gate")||strip("_fence");
  if(fence)out.push(fence+"_planks",fence);

  const shape=strip("_stairs")||strip("_slab")||strip("_wall");
  if(shape)out.push(shape,shape+"s",shape+"_planks");   // stone_brick_stairs -> stone_bricks

  if(m.endsWith("_spawn_egg"))out.push("spawn_egg");

  const soft=strip("_bed")||strip("_banner")||strip("_wall_banner");
  if(soft)out.push(soft+"_wool");

  const box=strip("_shulker_box");
  if(box)out.push("shulker_box");

  // Cabezas y calaveras se pintan con la skin de la entidad: no hay textura.
  if(m.endsWith("_head")||m.endsWith("_skull"))out.push("skull_banner_pattern");

  return out;
}
/** URL de la textura de un material, garantizada existente.
    1) mapa oficial de los assets (cubre los 1331 materiales del juego)
    2) reglas por familias, como red de seguridad para materiales mas nuevos
    3) icono de "desconocido", que SIEMPRE se ve: nunca un hueco en blanco. */
function mcResolveIcon(material){
  const m=String(material||"stone").toLowerCase();
  if(MC_ICON_LOCAL_SET.has(m))return MC_ICON_LOCAL_DIR+m+".png";
  // Los alias van ANTES del mapa oficial: existen justo para corregir mapeos
  // suyos que no representan nada (player_head apuntaba a soul_sand).
  const al=MC_ICON_ALIAS[m];
  if(al){ const p=mcPath(al); if(p)return p; }
  const x=(typeof MC_TEX_X!=="undefined")?MC_TEX_X[m]:null;
  if(x)return (x.charAt(0)==="i"?MC_LOCAL_ITEM_DIR:MC_LOCAL_BLOCK_DIR)+x.slice(2)+".png";
  for(const cand of mcIconCandidates(m)){
    const p=mcPath(cand);
    if(p)return p;
  }
  return MC_UNKNOWN_ICON;
}
function mcItemIconUrl(material){
  return mcResolveIcon(material);
}
/** Ultimo recurso: si un material es tan nuevo que no esta ni en los assets
    locales, se prueba el CDN y, si tampoco, se deja el icono de "desconocido".
    Nunca se oculta la imagen: un hueco en blanco parece que la web esta rota. */
function mcIconFallback(img){
  const m=img.dataset.mat||"";
  const tried=img.dataset.tried||"";
  if(!tried.includes("I")){img.dataset.tried=tried+"I";img.src=MC_ITEM_ICON_BASE+m+".png";return;}
  if(!tried.includes("B")){img.dataset.tried=tried+"B";img.src=MC_BLOCK_ICON_BASE+m+".png";return;}
  if(!tried.includes("U")){img.dataset.tried=tried+"U";img.src=MC_UNKNOWN_ICON;return;}
}
/** <img> de un material. La ruta ya se resuelve contra el indice, asi que en la
    practica acierta a la primera; el onerror solo cubre materiales nuevos. */
function mcIconImgHtml(material,cls){
  const m=String(material||"stone").toLowerCase();
  return `<img class="${cls||""}" src="${mcResolveIcon(m)}" `
    +`data-mat="${escapeHtml(m)}" alt="" loading="lazy" onerror="mcIconFallback(this)" />`;
}
/** Igual que mcItemIconUrl pero siempre como bloque (para misiones de picar/cosechar,
   donde el material SIEMPRE es un bloque, sin tener que adivinar por nombre). */
function mcBlockIconUrl(material){
  return mcResolveIcon(material);
}
/** HTML de un icono+cantidad para una recompensa (SC/ITEM/TEMP_PERMISSION/TEMP_RANK). */
function rewardIconHtml(reward){
  if(!reward)return `<span class="pass-col__icon-emoji">—</span>`;
  if(reward.type==="SC"){
    return `<img class="pass-col__icon-img" src="sillacoin.png" alt="SC" /><span class="pass-col__amt">${reward.amount}</span>`;
  }
  if(reward.type==="ITEM"){
    const url=mcItemIconUrl(reward.material);
    return `<img class="pass-col__icon-img" src="${url}" alt="${escapeHtml(reward.material)}" loading="lazy" `
      +`onerror="this.outerHTML='<span class=&quot;pass-col__icon-emoji&quot;>📦</span>'" />`
      +`<span class="pass-col__amt">${reward.amount}</span>`;
  }
  if(reward.type==="TEMP_PERMISSION"){
    return `<span class="pass-col__icon-emoji">🌾</span><span class="pass-col__amt">${reward.hours}h</span>`;
  }
  if(reward.type==="TEMP_RANK"){
    return `<span class="pass-col__icon-emoji">👑</span><span class="pass-col__amt">${reward.hours}h</span>`;
  }
  return `<span class="pass-col__icon-emoji">—</span>`;
}

/** Explicaciones en claro de recompensas que no son obvias solo con el icono
    (sobre todo permisos/rangos temporales tipo Scythe) - pedido porque a la
    gente le genera dudas ver un icono suelto sin saber que hace. */
const REWARD_PERM_INFO={
  "scythe.use":["Autorreplantado (Scythe)","Mientras dura, cada cultivo que coseches se replanta solo al instante — no hace falta volver a plantar la semilla."],
  "essentials.recipe":["Recetas al vuelo (/recipe)","Mira cualquier item en tu inventario y usa /recipe para ver como se craftea, sin salir del juego."]
};
const REWARD_RANK_INFO={
  "vip":["Rango VIP temporal","Prefijo especial en el chat/tab, cooldowns de teletransporte y RTP mas cortos, y mas protecciones permitidas."],
  "mvp":["Rango MVP temporal","Como VIP pero con mas ventajas todavia: cooldowns aun mas cortos y aun mas protecciones permitidas."]
};
function humanMaterial(material){
  const m=String(material||"").toLowerCase();
  if(MC_MATERIAL_ES[m])return MC_MATERIAL_ES[m];
  return m.split("_").map(w=>w?w[0].toUpperCase()+w.slice(1):w).join(" ");
}
function rewardInfoFor(reward){
  if(!reward)return null;
  if(reward.type==="SC")return{title:"SillaCoins",desc:reward.amount+" SC se añaden directos a tu saldo del panel al reclamar."};
  if(reward.type==="ITEM")return{title:humanMaterial(reward.material),desc:reward.amount+"x — se entrega directo en tu inventario del juego al reclamar (tienes que estar conectado)."};
  if(reward.type==="TEMP_PERMISSION"){
    const info=REWARD_PERM_INFO[reward.node]||[reward.node,"Ventaja temporal."];
    return{title:info[0],desc:info[1]+" Dura "+reward.hours+"h jugadas (solo cuenta el tiempo que estas conectado, no horas reales)."};
  }
  if(reward.type==="TEMP_RANK"){
    const info=REWARD_RANK_INFO[reward.node]||["Rango "+reward.node+" temporal","Ventaja temporal."];
    return{title:info[0],desc:info[1]+" Dura "+reward.hours+"h jugadas (solo cuenta el tiempo que estas conectado, no horas reales)."};
  }
  return null;
}
function openPopoverBox(keepOpenSelector){
  let box=$("rewardInfo");
  if(!box){
    box=document.createElement("div");
    box.id="rewardInfo";box.className="reward-info";
    document.body.appendChild(box);
    document.addEventListener("click",e=>{
      if(!box.classList.contains("is-open"))return;
      if(box.contains(e.target))return;
      if(box._keepOpenSelector&&e.target.closest(box._keepOpenSelector))return;
      box.classList.remove("is-open");
    });
  }
  box._keepOpenSelector=keepOpenSelector||null;
  box.classList.add("is-open");
  return box;
}
function showInfoPopover(title,desc,keepOpenSelector){
  const box=openPopoverBox(keepOpenSelector);
  box.innerHTML=`<button class="reward-info__close" aria-label="Cerrar">✕</button><h4>${escapeHtml(title)}</h4><p>${escapeHtml(desc)}</p>`;
  box.querySelector(".reward-info__close").addEventListener("click",()=>box.classList.remove("is-open"));
}
/** Igual que showInfoPopover pero con HTML libre en el cuerpo (para meter un
    formulario, ej. poner el correo o crear la contraseña sin salir del panel). */
function showActionPopover(title,bodyHtml,keepOpenSelector,onMount){
  const box=openPopoverBox(keepOpenSelector);
  box.innerHTML=`<button class="reward-info__close" aria-label="Cerrar">✕</button><h4>${escapeHtml(title)}</h4>${bodyHtml}`;
  box.querySelector(".reward-info__close").addEventListener("click",()=>box.classList.remove("is-open"));
  if(onMount)onMount(box);
}
/* ============ Mis casas y mis protecciones ============
   Se leen del propio servidor (userdata de Essentials y regiones de WorldGuard).
   Las coordenadas se pueden copiar para mandarlas a un amigo. */
let _psEditableFlags={};
let _myProtections=[];
let _myHomes=[];

/** Icono segun el mundo: nether, end o normal (asi se distinguen de un vistazo). */
function worldIcon(world){
  const w=String(world||"").toLowerCase();
  if(w.includes("nether"))return mcBlockIconUrl("netherrack");
  if(w.includes("end"))return mcBlockIconUrl("end_stone");
  return mcBlockIconUrl("grass_block_side");
}
/** Nombre corto y legible de una proteccion (el id psXxYyZz no dice nada). */
function protectionLabel(p,i){
  if(p.coords)return "Protección en "+p.coords.x+", "+p.coords.z;
  return "Protección "+(i+1);
}

async function loadMyThings(){
  if(!$("homesList")&&!$("protectionsList"))return;
  const [homesRes,protRes]=await Promise.all([
    api("/me/homes",{auth:true}),
    api("/me/protections",{auth:true})
  ]);
  if($("homesList")){
    const box=$("homesList");
    if(!homesRes.ok||!homesRes.data.ok){box.innerHTML='<p class="finder__msg">No se pudo cargar.</p>';}
    else{
      _myHomes=homesRes.data.homes||[];
      box.innerHTML=_myHomes.length?`<div class="things">`+_myHomes.map(h=>{
        const coords=`${h.x} ${h.y} ${h.z}`;
        return `<div class="thing">
          <img class="thing__icon" src="${worldIcon(h.world)}" alt="" loading="lazy" onerror="this.style.visibility='hidden'" />
          <div class="thing__body"><b>${escapeHtml(h.name)}</b>
            <span class="thing__meta">${escapeHtml(h.world)} · ${escapeHtml(coords)}</span></div>
          <div class="thing__actions">
            <button class="btn btn--ghost" data-copytext="${escapeHtml(h.world+" "+coords)}">Copiar</button>
            <button class="btn btn--ghost btn--danger" data-homedel="${escapeHtml(h.name)}">Borrar</button>
          </div></div>`;
      }).join("")+`</div>`
        :'<p class="finder__msg">No tienes casas todavía. Usa <code>/sethome nombre</code> en el juego.</p>';
    }
  }
  if($("protectionsList")){
    const box=$("protectionsList");
    if(!protRes.ok||!protRes.data.ok){box.innerHTML='<p class="finder__msg">No se pudo cargar.</p>';}
    else{
      _psEditableFlags=protRes.data.editable_flags||{};
      _myProtections=protRes.data.protections||[];
      box.innerHTML=_myProtections.length?`<div class="things">`+_myProtections.map((p,i)=>{
        const c=p.coords?`${p.coords.x} ${p.coords.y} ${p.coords.z}`:"?";
        const nMembers=(p.members||[]).length;
        return `<div class="thing">
          <img class="thing__icon" src="${worldIcon(p.world)}" alt="" loading="lazy" onerror="this.style.visibility='hidden'" />
          <div class="thing__body"><b>${escapeHtml(protectionLabel(p,i))}</b>
            ${p.owner?'<span class="thing__role">Dueño</span>':'<span class="thing__role thing__role--guest">Invitado</span>'}
            <span class="thing__meta">${escapeHtml(c)}${p.size?" · "+p.size+"×"+p.size:""}${nMembers?" · "+nMembers+" con permiso":""}</span></div>
          <div class="thing__actions">
            <button class="btn btn--ghost" data-copytext="${escapeHtml(c)}">Copiar</button>
            ${p.owner?`<button class="btn btn--primary" data-psmenu="${i}">Gestionar</button>`:""}
          </div></div>`;
      }).join("")+`</div>`
        :'<p class="finder__msg">No tienes protecciones. Consigue tu primera en la tienda de abajo.</p>';
    }
  }
  document.querySelectorAll("[data-copytext]").forEach(b=>{
    if(b._bound)return;b._bound=true;
    b.addEventListener("click",()=>{navigator.clipboard.writeText(b.dataset.copytext);toast("Coordenadas copiadas.");});
  });
  const pbox=$("protectionsList");
  if(pbox)pbox.querySelectorAll("[data-psmenu]").forEach(b=>{
    b.addEventListener("click",()=>openProtectionMenu(_myProtections[Number(b.dataset.psmenu)],Number(b.dataset.psmenu)));
  });
  const hbox=$("homesList");
  if(hbox)hbox.querySelectorAll("[data-homedel]").forEach(b=>{
    b.addEventListener("click",async()=>{
      const name=b.dataset.homedel;
      if(!confirm('¿Seguro que quieres borrar la casa "'+name+'"? No se puede deshacer.'))return;
      const {ok,data}=await api("/me/homes/delete",{method:"POST",auth:true,body:{name}});
      if(ok&&data.ok){toast("Casa borrada.");loadMyThings();}
      else toast("No se pudo borrar.");
    });
  });
}

/** Menú completo de una protección propia: quién tiene permiso (añadir/quitar)
    y los ajustes de convivencia. El backend revalida que la región es tuya. */
function openProtectionMenu(p,idx){
  if(!p)return;
  const c=p.coords?`${p.coords.x} ${p.coords.y} ${p.coords.z}`:"?";
  const members=(p.members||[]).map(m=>
    `<div class="psmember"><span>${escapeHtml(m.name)}</span>
      <button class="btn btn--ghost btn--danger" data-psdel="${escapeHtml(m.name)}">Quitar</button></div>`
  ).join("")||'<p class="finder__msg">Nadie más tiene permiso todavía.</p>';
  const flagRows=Object.entries(_psEditableFlags).map(([key,meta])=>{
    const cur=(p.flags||{})[key]||"";
    const opts=meta.values.map(v=>`<option value="${v}"${cur===v?" selected":""}>${v==="allow"?"Permitir":"Bloquear"}</option>`).join("");
    return `<label class="psflag"><span>${escapeHtml(meta.label)}</span>
      <select data-psflag="${key}"><option value="">(por defecto)</option>${opts}</select></label>`;
  }).join("");
  openOnboardingModal(protectionLabel(p,idx),
    `<p class="onbmodal__hint">${escapeHtml(p.world)} · ${escapeHtml(c)}${p.size?" · "+p.size+"×"+p.size:""}</p>
     <div class="onbmodal__step">
       <h4 class="pass-track__title">Quién puede construir aquí</h4>
       <div class="psmembers">${members}</div>
       <div class="psaddrow">
         <input type="text" id="psAddName" placeholder="Nombre del jugador" maxlength="17" autocomplete="off" />
         <button class="btn btn--primary" id="psAddBtn">Dar permiso</button>
       </div>
     </div>
     <div class="onbmodal__step">
       <h4 class="pass-track__title">Ajustes del terreno</h4>
       <div class="psflags">${flagRows}</div>
     </div>
     <p class="reward-info__hint" id="psMsg"></p>`,
    bd=>{
      const msg=bd.querySelector("#psMsg");
      const say=(text,color)=>{msg.style.color=color;msg.textContent=text;};
      const member=async(player,action)=>{
        const {ok,data}=await api("/me/protections/member",{method:"POST",auth:true,
          body:{region:p.id,world:p.world,player,action}});
        if(ok&&data.ok){say(action==="add"?"Permiso dado a "+player+".":"Permiso quitado a "+player+".","var(--green)");
          await loadMyThings();
          const fresh=_myProtections.find(x=>x.id===p.id&&x.world===p.world);
          if(fresh)openProtectionMenu(fresh,idx);
        }else say("No se pudo cambiar.","var(--red)");
      };
      bd.querySelector("#psAddBtn").addEventListener("click",()=>{
        const name=bd.querySelector("#psAddName").value.trim();
        if(!name)return say("Escribe un nombre.","var(--red)");
        member(name,"add");
      });
      bd.querySelectorAll("[data-psdel]").forEach(b=>b.addEventListener("click",()=>member(b.dataset.psdel,"remove")));
      bd.querySelectorAll("[data-psflag]").forEach(sel=>sel.addEventListener("change",async()=>{
        if(!sel.value)return say("Elige Permitir o Bloquear.","var(--muted)");
        const {ok,data}=await api("/me/protections/flag",{method:"POST",auth:true,
          body:{region:p.id,world:p.world,flag:sel.dataset.psflag,value:sel.value}});
        if(ok&&data.ok){say("Guardado.","var(--green)");loadMyThings();}
        else say("No se pudo cambiar.","var(--red)");
      }));
    });
}

/** Tarjeta GRANDE centrada al pulsar una recompensa del pase: icono grande +
    titulo, y descripcion solo cuando aporta algo (un diamante se explica solo;
    un permiso temporal tipo Scythe o un rango por X horas, no). */
function showRewardInfo(reward){
  if(!reward)return;
  const info=rewardInfoFor(reward);
  if(!info)return;
  let iconHtml;
  if(reward.type==="SC"){
    iconHtml=`<img class="rewardcard__icon" src="sillacoin.png" alt="SC" />`;
  }else if(reward.type==="ITEM"){
    iconHtml=`<img class="rewardcard__icon" src="${mcItemIconUrl(reward.material)}" alt="" `
      +`onerror="this.outerHTML='<span class=&quot;rewardcard__icon rewardcard__icon--emoji&quot;>📦</span>'" />`;
  }else{
    iconHtml=`<span class="rewardcard__icon rewardcard__icon--emoji">${reward.type==="TEMP_RANK"?"👑":"🌾"}</span>`;
  }
  // Cantidad/duracion como "chip" bajo el icono.
  let amountChip="";
  if(reward.type==="SC")amountChip=`<span class="rewardcard__chip">${reward.amount} SC</span>`;
  else if(reward.type==="ITEM")amountChip=`<span class="rewardcard__chip">×${reward.amount}</span>`;
  else if(reward.hours)amountChip=`<span class="rewardcard__chip">${reward.hours}h jugadas</span>`;
  // Solo los permisos/rangos temporales necesitan explicacion de verdad.
  const needsDesc=reward.type==="TEMP_PERMISSION"||reward.type==="TEMP_RANK";
  const descHtml=needsDesc?`<p class="rewardcard__desc">${escapeHtml(info.desc)}</p>`:"";
  openOnboardingModal(info.title,
    `<div class="rewardcard">${iconHtml}${amountChip}${descHtml}</div>`);
}

/** Modal grande centrado para las misiones iniciales (mas visible que el popover
    pequeño de las recompensas del pase, que solo explica, no guia paso a paso). */
function openOnboardingModal(title,bodyHtml,onMount){
  let bd=$("onbModalBackdrop");
  if(!bd){
    bd=document.createElement("div");
    bd.id="onbModalBackdrop";bd.className="onbmodal-backdrop";
    bd.innerHTML=`<div class="onbmodal"><button class="onbmodal__close" id="onbModalClose" aria-label="Cerrar">✕</button>
      <h3 id="onbModalTitle"></h3><div id="onbModalBody"></div></div>`;
    document.body.appendChild(bd);
    bd.addEventListener("click",e=>{if(e.target===bd)closeOnboardingModal();});
    bd.querySelector("#onbModalClose").addEventListener("click",closeOnboardingModal);
  }
  bd.querySelector("#onbModalTitle").textContent=title;
  bd.querySelector("#onbModalBody").innerHTML=bodyHtml;
  bd.classList.add("is-open");
  if(onMount)onMount(bd);
}
function closeOnboardingModal(){const bd=$("onbModalBackdrop");if(bd)bd.classList.remove("is-open");}

function onboardingCopyBtn(cmd){
  return `<button type="button" class="btn btn--ghost onb-copybtn" data-copy="${escapeHtml(cmd)}">Copiar <code>${escapeHtml(cmd)}</code></button>`;
}

/** Cada mision inicial abre este modal con: paso a paso + boton de reclamar
    (el propio reclamar comprueba en vivo si ya esta hecho - no hace falta un
    "verificar" aparte). Si falla por no estar conectado o por no haberlo hecho
    aun, se ve un aviso claro y el boton vuelve a estar disponible: nunca se
    queda colgado en "Reclamando...". */
function onboardingModalBody(key){
  const bodies={
    discord:`<div class="onbmodal__step"><p><b>1.</b> Dentro de Minecraft, escribe este comando:</p>${onboardingCopyBtn("/link")}
      <p class="onbmodal__hint">Te dará un código de un solo uso.</p></div>
      <div class="onbmodal__step"><p><b>2.</b> Manda ese código al bot en nuestro Discord:</p>
      <a class="btn btn--discord" href="https://discord.gg/aTeaB9yQkJ" target="_blank" rel="noopener">Abrir el Discord</a></div>`,
    webpass:`<div class="onbmodal__step"><p>Crea una contraseña para entrar a este panel sin pedir un código cada vez:</p>
      <div class="reward-info__form">
        <input type="password" id="onbPw" placeholder="Mínimo 8 caracteres" autocomplete="new-password" />
        <button class="btn btn--primary" id="onbPwSave">Guardar</button>
        <p class="reward-info__hint" id="onbPwMsg"></p>
      </div></div>`,
    email:`<div class="onbmodal__step"><p>Vincula un correo por si necesitas recuperar la cuenta (nadie más lo ve):</p>
      <div class="reward-info__form">
        <input type="email" id="onbEmail" placeholder="tu@correo.com" autocomplete="email" />
        <button class="btn btn--primary" id="onbEmailSave">Guardar</button>
        <p class="reward-info__hint" id="onbEmailMsg"></p>
      </div></div>`,
    protection:`<div class="onbmodal__step"><p>Te regalamos <b>100 SC</b> (una sola vez) para que compres tu <b>primera protección de terreno</b> y nadie pueda tocarte la base.</p>
      <p class="onbmodal__hint">Solo para quien no tenga ninguna protección todavía.</p></div>
      <div class="onbmodal__step"><p>Después, cómprala en tu panel (sección <b>Tienda de recompensas</b>) y coloca el bloque en el suelo donde quieras proteger.</p></div>`
  };
  return bodies[key]||"";
}
const ONBOARDING_TITLES={discord:"Vincular Discord",webpass:"Crear contraseña del panel",
  email:"Vincular correo de recuperación",protection:"Tu primera protección"};

/* El modal lleva un pie con los 3 estados en orden, para que se vea de un golpe
   que hay que hacer: [Comprobar si ya está] -> [Reclamar recompensa] -> Completado. */
function onboardingModalFooter(key,state){
  if(state==="claimed")return `<p class="onbmodal__done">✓ Completado — recompensa ya recibida</p>`;
  if(state==="done")return `<p class="onbmodal__ready">✓ Hecho. Ya puedes reclamar tu recompensa.</p>
    <button class="btn btn--primary btn--lg" id="onbClaimBtn">Reclamar recompensa</button>`;
  return `<button class="btn btn--ghost" id="onbVerifyBtn">Ya lo he hecho — comprobar</button>
    <p class="reward-info__hint" id="onbVerifyMsg"></p>`;
}

function onboardingHowTo(key,state){
  state=state||"todo";
  const body=onboardingModalBody(key)
    +`<div class="onbmodal__footer" id="onbFooter">${onboardingModalFooter(key,state)}</div>`;
  openOnboardingModal(ONBOARDING_TITLES[key]||"Misión inicial",body,bd=>{
    bindOnboardingModal(bd,key);
  });
}

function bindOnboardingModal(bd,key){
  bd.querySelectorAll(".onb-copybtn").forEach(b=>b.addEventListener("click",()=>{
    navigator.clipboard.writeText(b.dataset.copy);toast("Comando copiado.");
  }));

  // Guardar contraseña / correo: al terminar bien, el pie pasa solo a "puedes reclamar".
  const pwBtn=bd.querySelector("#onbPwSave");
  if(pwBtn)pwBtn.addEventListener("click",async()=>{
    const pw=bd.querySelector("#onbPw").value;
    const hint=bd.querySelector("#onbPwMsg");
    const {ok,data}=await api("/auth/set-password",{method:"POST",body:{password:pw},auth:true});
    if(ok&&data.ok){
      hint.style.color="var(--green)";hint.textContent="¡Contraseña creada!";
      setOnboardingModalState(bd,key,"done");
      loadSillaPass();
    }else{hint.style.color="var(--red)";hint.textContent=(data&&data.error)||"No se pudo guardar, inténtalo de nuevo.";}
  });
  const emBtn=bd.querySelector("#onbEmailSave");
  if(emBtn)emBtn.addEventListener("click",async()=>{
    const email=bd.querySelector("#onbEmail").value.trim();
    const hint=bd.querySelector("#onbEmailMsg");
    const {ok,data}=await api("/auth/set-email",{method:"POST",body:{email},auth:true});
    if(ok&&data.ok){
      hint.style.color="var(--green)";hint.textContent="¡Correo guardado!";
      setOnboardingModalState(bd,key,"done");
      loadSillaPass();
    }else{
      const err=(data&&data.error)||"";
      hint.style.color="var(--red)";
      hint.textContent=err==="email_taken"?"Ese correo ya está en uso por otra cuenta.":"Correo no válido.";
    }
  });

  const verifyBtn=bd.querySelector("#onbVerifyBtn");
  if(verifyBtn)verifyBtn.addEventListener("click",async()=>{
    const hint=bd.querySelector("#onbVerifyMsg");
    verifyBtn.disabled=true;verifyBtn.textContent="Comprobando…";
    const {ok,data}=await api("/me/onboarding/verify",{method:"POST",auth:true,body:{key}});
    verifyBtn.disabled=false;verifyBtn.textContent="Ya lo he hecho — comprobar";
    if(ok&&data.ok&&data.done){
      setOnboardingModalState(bd,key,"done");
      loadSillaPass();
    }else if(hint){
      hint.style.color="var(--red)";
      hint.textContent=key==="protection"
        ? "Ya tienes una protección, así que este regalo no te corresponde."
        : "Todavía no lo detectamos. Repasa los pasos y vuelve a comprobar.";
    }
  });

  const claimBtn=bd.querySelector("#onbClaimBtn");
  if(claimBtn)claimBtn.addEventListener("click",()=>claimOnboarding(key,claimBtn));
}

function setOnboardingModalState(bd,key,state){
  const footer=bd.querySelector("#onbFooter");
  if(!footer)return;
  footer.innerHTML=onboardingModalFooter(key,state);
  bindOnboardingModal(bd,key);
}

let _passTrackLastTier=null;
function renderPassTrack(tiers,currentTier){
  const track=$("passTrack");
  if(!track)return;
  track.innerHTML=tiers.map(row=>{
    const cls=["pass-col"];
    if(row.reached)cls.push("is-reached");
    if(row.tier===currentTier+1)cls.push("is-current");
    const claimBtn=(row.reached&&!row.claimed)
      ?`<button class="pass-col__claim" data-claim-tier="${row.tier}">Reclamar</button>`
      :(row.reached?`<span class="pass-col__claimed">✓</span>`:"");
    return `<div class="${cls.join(' ')}" data-tier="${row.tier}">`
      +`<div class="pass-col__reward pass-col__reward--premium" data-reward-slot="premium">${rewardIconHtml(row.premium)}</div>`
      +`<div class="pass-col__num">${row.tier}</div>`
      +`<div class="pass-col__reward pass-col__reward--normal" data-reward-slot="normal">${rewardIconHtml(row.normal)}</div>`
      +claimBtn
      +`</div>`;
  }).join("");
  track.querySelectorAll(".pass-col__reward").forEach((el,i)=>{
    const row=tiers[Math.floor(i/2)];
    const reward=el.dataset.rewardSlot==="premium"?row.premium:row.normal;
    if(!reward)return;
    el.addEventListener("click",()=>showRewardInfo(reward));
  });
  // Solo centramos el scroll la primera vez o cuando cambias de nivel de verdad -
  // si no, con el sondeo cada segundo te quitaria el scroll mientras miras otros niveles.
  if(currentTier!==_passTrackLastTier){
    _passTrackLastTier=currentTier;
    const current=track.querySelector('.pass-col.is-current')||track.querySelector('.pass-col.is-reached');
    if(current)current.scrollIntoView({inline:"center",block:"nearest"});
  }
}

async function claimPassTier(tier,btn){
  if(!tier||btn.disabled)return;
  const original=btn.textContent;
  btn.disabled=true;
  btn.textContent="Reclamando…";
  const {ok,data}=await api("/me/sillapass/claim",{method:"POST",auth:true,body:{tier}});
  if(ok&&data.ok){
    btn.textContent="✓";
    toast("¡Nivel "+tier+" reclamado! Revisa tu inventario en el server.");
    loadBalance();
    loadSillaPass();
  }else{
    const err=(data&&data.error)||"";
    toast(err==="already_claimed"?"Ese nivel ya estaba reclamado."
      :err==="not_reached"?"Todavía no has llegado a ese nivel."
      :"No se pudo reclamar, inténtalo de nuevo.");
    btn.disabled=false;
    btn.textContent=original;
  }
}

let _lastPassSnapshot=null;
async function loadSillaPass(){
  const card=$("passCard");if(!card)return;
  const {ok,data}=await api("/me/sillapass",{auth:true});
  if(!ok||!data||!data.ok){card.style.display="none";return;}
  card.style.display="block";

  // El sondeo llama aqui cada 8s. Si nada cambio desde la ultima vez, no
  // repintamos: recrear las <img> sin necesidad es lo que causaba el
  // parpadeo (se destruyen y se vuelven a decodificar aunque esten cacheadas).
  const snapshot=JSON.stringify(data);
  if(snapshot===_lastPassSnapshot)return;
  _lastPassSnapshot=snapshot;

  if($("passTier"))$("passTier").textContent=data.pass_tier;
  if($("passMaxTier"))$("passMaxTier").textContent=data.pass_max_tier;
  const pct=data.pass_season_xp_needed>0?Math.max(0,Math.min(100,(data.pass_season_xp/data.pass_season_xp_needed)*100)):0;
  if($("passBarFill"))$("passBarFill").style.width=pct+"%";
  if($("passXpText"))$("passXpText").textContent=data.pass_season_xp+" / "+data.pass_season_xp_needed+" XP de temporada";

  const tag=$("passTypeTag");
  if(tag){
    // "Gratis"/"Extra" y no "Normal"/"Premium": la gente confundia el pase
    // Premium con las cuentas premium de Minecraft.
    if(data.pass_type==="PREMIUM"){tag.textContent="★ EXTRA";tag.style.background="var(--gold)";}
    else {tag.textContent="Gratis";tag.style.background="var(--green)";}
  }

  if($("passAccountLevel"))$("passAccountLevel").textContent=data.level;
  if($("passAccountXp"))$("passAccountXp").textContent=data.xp+"/"+data.xp_needed+" XP";

  renderPassTrack(data.tiers||[],data.pass_tier);
  renderMissions(data.missions||{daily:[],weekly:[]});
  renderOnboarding(data.onboarding||[]);
}

const DISCORD_SVG='<svg viewBox="0 0 127.14 96.36" width="20" height="20" aria-hidden="true"><path fill="currentColor" d="M107.7,8.07A105.15,105.15,0,0,0,81.47,0a72.06,72.06,0,0,0-3.36,6.83A97.68,97.68,0,0,0,49,6.83,72.37,72.37,0,0,0,45.64,0,105.89,105.89,0,0,0,19.39,8.09C2.79,32.65-1.71,56.6.54,80.21h0A105.73,105.73,0,0,0,32.71,96.36,77.7,77.7,0,0,0,39.6,85.25a68.42,68.42,0,0,1-10.85-5.18c.91-.66,1.8-1.34,2.66-2a75.57,75.57,0,0,0,64.32,0c.87.71,1.76,1.39,2.66,2a68.68,68.68,0,0,1-10.87,5.19,77,77,0,0,0,6.89,11.1A105.25,105.25,0,0,0,126.6,80.22h0C129.24,52.84,122.09,29.11,107.7,8.07ZM42.45,65.69C36.18,65.69,31,60,31,53s5-12.74,11.43-12.74S54,46,53.89,53,48.84,65.69,42.45,65.69Zm42.24,0C78.41,65.69,73.25,60,73.25,53s5-12.74,11.44-12.74S96.23,46,96.12,53,91.08,65.69,84.69,65.69Z"/></svg>';
function onboardingIconHtml(key){
  if(key==="discord")return `<span class="mission__icon mission__icon--svg">${DISCORD_SVG}</span>`;
  // "protection" ahora da 100 SC (antes daba el bloque directo) para comprarla en la tienda.
  if(key==="protection")
    return `<img class="mission__icon" src="sillacoin.png" alt="" loading="lazy" />`;
  return mcIconImgHtml(key==="webpass"?"trial_key":"paper","mission__icon");
}
/* Las 4 misiones iniciales NO se reclaman desde la fila: la fila abre un panel
   grande que explica que hay que hacer, comprueba si ya esta, y solo entonces
   deja reclamar. Asi nunca aparece un "Reclamar" que no se puede pulsar ni se
   queda nada colgado en "Reclamando...". */
const ONBOARDING_ACTION_LABEL={discord:"Vincular Discord",webpass:"Crear contraseña",
  email:"Vincular correo",protection:"Reclamar 100 SC"};
function renderOnboarding(list){
  const box=$("onboardingList");
  if(!box)return;
  const wrap=$("onboardingWrap");
  // Cuando ya estan TODAS reclamadas la seccion desaparece: no aporta nada
  // seguir viendo cuatro filas verdes para siempre.
  const allDone=list.length>0&&list.every(m=>m.claimed||(m.key==="protection"&&m.eligible===false));
  if(wrap)wrap.style.display=(!list.length||allDone)?"none":"";
  if(!list.length||allDone){box.innerHTML="";return;}
  box.innerHTML=list.map(m=>{
    let action;
    if(m.claimed){
      action=`<span class="mission__claimed">✓ Completado</span>`;
    }else if(m.key==="protection"&&m.eligible===false){
      action=`<span class="mission__na" title="El regalo es para comprar tu primera protección">Ya tienes protección</span>`;
    }else if(m.done){
      // Ya esta hecho: el boton reclama DIRECTO, sin abrir el panel de pasos
      // (si ya tienes la contraseña puesta no tiene sentido volver a explicartela).
      action=`<button class="mission__claim" data-onb-claim="${m.key}">${m.key==="protection"?"Reclamar 100 SC":"Reclamar"}</button>`;
    }else{
      action=`<button class="mission__howto" data-onb-open="${m.key}" data-onb-state="todo">${ONBOARDING_ACTION_LABEL[m.key]||"Ir"}</button>`;
    }
    const cls=m.claimed?" is-done":(m.done?" is-ready":"");
    return `<div class="mission${cls}">`
      +onboardingIconHtml(m.key)
      +`<div class="mission__body">`
      +`<div class="mission__top"><span class="mission__desc">${m.claimed?"✓ ":""}${escapeHtml(m.desc)}</span>`
      +`<span class="mission__xp">+${m.xp} XP · +${m.sc} SC</span></div>`
      +`</div>${action}</div>`;
  }).join("");
  box.querySelectorAll("[data-onb-open]").forEach(b=>{
    b.addEventListener("click",()=>onboardingHowTo(b.dataset.onbOpen,b.dataset.onbState));
  });
  box.querySelectorAll("[data-onb-claim]").forEach(b=>{
    b.addEventListener("click",()=>claimOnboarding(b.dataset.onbClaim,b));
  });
}

const ONBOARDING_CLAIM_ERR={
  already_claimed:"Ya estaba reclamada.",
  not_reached:"Todavía no lo has hecho — sigue los pasos de arriba.",
  not_online:"Debes estar conectado al servidor de Minecraft para reclamar esto.",
  already_has_protection:"Ya tienes una protección, así que este regalo no te corresponde.",
};
async function claimOnboarding(key,btn){
  if(btn.disabled)return;
  const original=btn.textContent;
  btn.disabled=true;
  btn.textContent="Reclamando…";
  const {ok,data}=await api("/me/onboarding/claim",{method:"POST",auth:true,body:{key}});
  if(ok&&data.ok){
    toast("¡Misión inicial completada! Revisa tu inventario/saldo.");
    const bd=$("onbModalBackdrop");
    if(bd&&bd.classList.contains("is-open"))setOnboardingModalState(bd,key,"claimed");
    loadBalance();
    loadSillaPass();
  }else{
    const err=(data&&data.error)||"";
    toast(ONBOARDING_CLAIM_ERR[err]||"No se pudo reclamar, inténtalo de nuevo.");
    btn.disabled=false;
    btn.textContent=original;
  }
}

const MISSION_TYPE_ICON={
  BREAK_BLOCK:"iron_pickaxe", KILL_ENTITY:"iron_sword",
  FISH:"fishing_rod", WALK:"leather_boots", LOGIN:"clock_00"
};
/* Icono especifico por mob (el CDN de iconos no tiene spawn eggs pintados por
   mob, asi que usamos el drop caracteristico de cada uno: se reconoce igual
   de bien y son iconos limpios que ya existen). */
const MISSION_ENTITY_ICON={
  ZOMBIE:"rotten_flesh", HUSK:"rotten_flesh", DROWNED:"rotten_flesh",
  SKELETON:"bone", STRAY:"bone", WITHER_SKELETON:"bone",
  SPIDER:"spider_eye", CAVE_SPIDER:"spider_eye",
  CREEPER:"gunpowder", ENDERMAN:"ender_pearl", WITCH:"glass_bottle"
};
/* Los cultivos son textura de bloque por ETAPA de crecimiento, no un .png
   simple con el nombre del cultivo - si no, sale roto. */
const MISSION_CROP_STAGE={ WHEAT:"wheat_stage7", CARROTS:"carrots_stage3", POTATOES:"potatoes_stage3" };
function missionIconUrl(m){
  if(m.type==="KILL_ENTITY"&&m.target)return mcItemIconUrl(MISSION_ENTITY_ICON[m.target]||"iron_sword");
  if(m.type==="BREAK_BLOCK"&&m.target){
    const mat=MISSION_CROP_STAGE[m.target]||m.target.toLowerCase();
    return mcBlockIconUrl(mat);
  }
  return mcItemIconUrl(MISSION_TYPE_ICON[m.type]||"paper");
}
/** Material del icono de una mision, y si hay que buscarlo en blocks/ primero. */
function missionIconParts(m){
  if(m.type==="KILL_ENTITY"&&m.target)
    return [MISSION_ENTITY_ICON[m.target]||"iron_sword",false];
  if(m.type==="BREAK_BLOCK"&&m.target)
    return [MISSION_CROP_STAGE[m.target]||m.target.toLowerCase(),true];
  return [MISSION_TYPE_ICON[m.type]||"paper",false];
}
function renderMissions(missions){
  const renderList=(id,list)=>{
    const box=$(id);
    if(!box)return;
    if(!list.length){box.innerHTML=`<p class="missions__empty">No hay misiones activas ahora mismo.</p>`;return;}
    box.innerHTML=list.map(m=>{
      const pct=m.amount>0?Math.max(0,Math.min(100,(m.progress/m.amount)*100)):0;
      // Con la cadena de reintentos: antes un bloque tipo calabaza se quedaba
      // en blanco y rompia la alineacion de la fila.
      const [iconMat,iconBlockFirst]=missionIconParts(m);
      const icon=mcIconImgHtml(iconMat,"mission__icon",iconBlockFirst);
      // mission--track reserva a la derecha el mismo hueco que ocupa el boton en
      // las misiones iniciales, para que la columna de XP cuadre en ambas listas.
      return `<div class="mission mission--track${m.completed?" is-done":""}">`
        +icon
        +`<div class="mission__body">`
        +`<div class="mission__top"><span class="mission__desc">${m.completed?"✅ ":""}${escapeHtml(m.desc)}</span>`
        +`<span class="mission__xp">+${m.xp} XP</span></div>`
        +`<div class="mission__bar"><div class="mission__fill" style="width:${pct}%"></div></div>`
        +`<div class="mission__count">${m.progress}/${m.amount}</div>`
        +`</div></div>`;
    }).join("");
  };
  renderList("missionsDaily",missions.daily||[]);
  renderList("missionsWeekly",missions.weekly||[]);
}

function initPassTabs(){
  const tabs=$("passTabs");
  if(!tabs||tabs._bound)return;
  tabs._bound=true;
  tabs.addEventListener("click",e=>{
    const btn=e.target.closest("[data-passtab]");
    if(!btn)return;
    const name=btn.dataset.passtab;
    tabs.querySelectorAll("[data-passtab]").forEach(b=>b.classList.toggle("is-active",b===btn));
    document.querySelectorAll("[data-passpanel]").forEach(p=>p.classList.toggle("is-active",p.dataset.passpanel===name));
  });
}

/** Tras entrar por código y sin contraseña, le ofrecemos crear una. */
function afterLogin(data){
  setToken(data.token);
  window._pendingName=data.name;
  if(data.has_password===false && data.via==="code") view("pwOfferView");
  else enterDashboard(data.name);
}

async function initDashboard(){
  if(!$("loginView"))return;                 // no estamos en el panel
  if(!API_BASE){
    toast("El panel aún no está conectado al servidor.");
    return;
  }
  if(!getToken()){view("loginView");return;}
  // Optimista: si ya sabemos quién eres, enseñamos el panel AL INSTANTE con lo
  // guardado, y validamos la sesión en segundo plano. Así no esperas a la red.
  const cached=localStorage.getItem("sillamc_name");
  if(cached) enterDashboard(cached);
  const {ok,data}=await api("/me",{auth:true});
  if(!ok){clearToken();view("loginView");return;}
  if(!cached || data.name!==cached) enterDashboard(data.name);
}

/** Cara de la skin, servida por NUESTRO backend (que la guarda en disco).
    Antes se pedia directamente a mc-heads.net y si ese servicio iba lento o caia
    las caras no salian; ahora el navegador solo habla con nuestro dominio y el
    backend siempre devuelve algo (cache, copia vieja o placeholder).
    Los de Bedrock llevan un punto delante que hay que quitar. */
function avatarUrl(name,size=64){
  const clean=(name||"").replace(/^\./,"")||"Steve";
  return (API_BASE||"")+"/avatar?name="+encodeURIComponent(clean)+"&size="+size;
}
/** Escapa por si un nombre de userdata trajera caracteres raros: nunca metemos
    texto del servidor en el HTML sin limpiar. */
const escapeHtml=s=>String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));

/* ---- Finder: clasificación con datos reales (público, sin login) ----
   El backend (/rankings) une dinero + stats vanilla (tiempo, kills, muertes),
   dedupado por nombre. Aquí solo ordenamos y pintamos; el #1/#2/#3 y el contorno
   oro/plata/bronce dependen del orden actual, no del jugador. */
const FINDER_COLS=[
  ["playtime_h","Tiempo"],
  ["kills","Kills"],
  ["pvp","PvP"],
  ["deaths","Muertes"],
  ["money","SC"]
];
// Por defecto SC, no tiempo jugado: tras el cambio de mundo del 23-jul todos
// tienen el tiempo jugado casi a cero (world/stats es por carpeta de mundo),
// asi que "Tiempo" no muestra variacion real todavia. Se arreglara solo segun
// la gente juegue el mundo nuevo; mientras tanto SC ya diferencia de verdad.
let finderSort="money";
let finderData=null;
function fmtStat(k,v){
  if(k==="playtime_h")return (Math.round(v*10)/10).toLocaleString(_coinLoc())+" h";
  if(k==="money")return Math.round(v).toLocaleString(_coinLoc())+" SC";
  return Math.round(v).toLocaleString(_coinLoc());
}
function renderFinderTabs(){
  const box=$("finderTabs");
  if(!box)return;
  box.innerHTML=FINDER_COLS.map(([k,l])=>`<button class="tab ${finderSort===k?'is-active':''}" data-sort="${k}">${l}</button>`).join("");
  const s=$("finderSearch"); if(s)s.placeholder=t("finder.search");
}
let finderQuery="";
function paintFinder(){
  const box=$("finderList");
  if(!box)return;
  if(finderData===null){box.innerHTML=`<li class="finder__msg">${t("finder.loading")}</li>`;return;}
  if(!finderData.length){box.innerHTML=`<li class="finder__msg">${t("finder.empty")}</li>`;return;}
  // Ordenamos la lista COMPLETA y guardamos la posición real, para que las
  // medallas y el #N sean el puesto de verdad (no el de la lista filtrada).
  const sorted=[...finderData].sort((a,b)=>(b[finderSort]||0)-(a[finderSort]||0));
  const q=finderQuery.trim().toLowerCase().replace(/^\./,"");
  let rows;
  if(q){
    rows=sorted.map((p,i)=>({p,pos:i+1}))
               .filter(o=>(o.p.name||"").toLowerCase().replace(/^\./,"").includes(q));
  }else{
    rows=sorted.slice(0,10).map((p,i)=>({p,pos:i+1}));   // por defecto: solo top 10
  }
  if(!rows.length){box.innerHTML=`<li class="finder__msg">${t("finder.noresult")}</li>`;return;}
  box.innerHTML=rows.map(({p,pos})=>{
    const nm=escapeHtml((p.name||"").replace(/^\./,""));   // sin el punto de Bedrock
    const chips=FINDER_COLS.map(([k,l])=>
      `<span class="fstat${finderSort===k?' is-active':''}"><i>${l}</i><b>${fmtStat(k,p[k]||0)}</b></span>`).join("");
    const medal=pos===1?"🥇":pos===2?"🥈":pos===3?"🥉":"#"+pos;
    return `<li class="finder__row${pos<=3?' finder__row--'+pos:''}">`
      +`<span class="finder__pos${pos<=3?' finder__pos--medal':''}">${medal}</span>`
      +`<img class="finder__avatar" src="${avatarUrl(p.name,32)}" alt="" width="32" height="32" loading="lazy"`
      +` onerror="this.onerror=null;this.src='${avatarUrl('Steve',32)}'" />`
      +`<a class="finder__name" href="profile?u=${encodeURIComponent(p.name)}">${nm}</a>`
      +`<span class="finder__stats">${chips}</span>`
      +`</li>`;
  }).join("");
}
async function renderFinder(){
  const box=$("finderList");
  if(!box)return;
  renderFinderTabs();
  paintFinder();                       // pinta "cargando" o lo que ya haya
  try{
    const r=await fetch(API_BASE+"/rankings",{cache:"no-store"});
    const d=await r.json();
    finderData=(d&&d.players)||[];
  }catch(e){
    if(finderData===null){box.innerHTML=`<li class="finder__msg">${t("finder.error")}</li>`;return;}
  }
  paintFinder();
}
function initFinder(){
  if(!$("finderList"))return;
  const s=$("finderSearch");
  if(s)s.addEventListener("input",()=>{finderQuery=s.value;paintFinder();});
  renderFinder();
  // Datos frescos sin que el jugador refresque, solo con la pestaña visible.
  setInterval(()=>{ if(document.visibilityState==="visible") renderFinder(); },20000);
}

/* ---- Perfil público de un jugador (profile?u=nombre) ---- */
const PROFILE_CATS=[
  ["playtime_h","Tiempo jugado"],
  ["money","SillaCoins"],
  ["kills","Kills (mobs)"],
  ["pvp","Bajas PvP"],
  ["deaths","Muertes"]
];
async function initProfile(){
  const box=$("profile"); if(!box)return;
  const u=(new URLSearchParams(location.search).get("u")||"").trim();
  if(!u){ box.innerHTML=`<p class="finder__msg">${t("prof.noname")}</p>`; return; }
  let d=null;
  try{ const r=await fetch((API_BASE||"")+"/profile?name="+encodeURIComponent(u)); if(r.ok)d=await r.json(); }catch(e){}
  if(!d||!d.name){ box.innerHTML=`<p class="finder__msg">${t("prof.notfound")} <a href="finder">${t("prof.back")}</a></p>`; return; }
  const clean=(d.name||"").replace(/^\./,"");
  document.title=clean+" — SillaMC";
  const cards=PROFILE_CATS.map(([k,l])=>{
    const pos=d.positions[k]||"—";
    return `<div class="pstat"><span class="pstat__lab">${l}</span>`
      +`<b class="pstat__val">${fmtStat(k,d.stats[k]||0)}</b>`
      +`<span class="pstat__pos">#${pos} <small>de ${d.total}</small></span></div>`;
  }).join("");
  box.innerHTML=`<div class="profile__head">`
    +`<img class="profile__face" src="${avatarUrl(d.name,96)}" alt="" width="96" height="96" onerror="this.onerror=null;this.src='${avatarUrl('Steve',96)}'"/>`
    +`<div><h1 class="profile__name">${escapeHtml(clean)}</h1>`
    +`<a class="profile__back" href="finder">${t("prof.back")}</a></div></div>`
    +`<div class="profile__grid">${cards}</div>`
    +`<p class="finder__foot">${t("prof.foot")}</p>`;
}

async function verifyCode(){
  const c=$("linkCode").value.trim();
  if(!/^\d{6}$/.test(c)){toast("El código son 6 dígitos");return;}
  try{
    // Sin nombre: el código ya identifica al jugador (mejor para los de Bedrock).
    const {ok,data}=await api("/auth/verify-code",{method:"POST",body:{code:c}});
    if(ok&&data.ok){data.via="code";afterLogin(data);toast("¡Hola, "+data.name+"!");}
    else toast(errMsg(data.error));
  }catch(e){toast("No se pudo contactar con el servidor.");}
}

async function loginPassword(){
  const u=$("passUser").value.trim(), p=$("passPw").value;
  if(!u||!p){toast("Rellena los dos campos");return;}
  try{
    const {ok,data}=await api("/auth/login-password",{method:"POST",body:{username:u,password:p}});
    if(ok&&data.ok){$("passPw").value="";afterLogin(data);}
    else toast(errMsg(data.error));
  }catch(e){toast("No se pudo contactar con el servidor.");}
}

async function savePassword(){
  const p=$("newPw").value;
  const email=$("newPwEmail")?$("newPwEmail").value.trim():"";
  const body=email?{password:p,email}:{password:p};
  const {ok,data}=await api("/auth/set-password",{method:"POST",body,auth:true});
  if(ok&&data.ok){
    $("newPw").value="";
    if($("newPwEmail"))$("newPwEmail").value="";
    toast("Contraseña guardada");
    enterDashboard(window._pendingName||"");
  } else {
    const err=(data&&data.error)||"";
    toast(err==="email_taken"?"Ese correo ya está en uso por otra cuenta.":(data&&data.error)||errMsg("x"));
  }
}

async function logout(){
  try{await api("/auth/logout",{method:"POST",auth:true});}catch(e){}
  clearToken();
  localStorage.removeItem("sillamc_name");
  location.reload();
}

/** En la landing: si hay sesión, el botón muestra la cara y "Mi panel". */
function updateAccessButton(){
  const btn=$("accessBtn");if(!btn)return;
  const name=localStorage.getItem("sillamc_name");
  const token=getToken();
  const head=btn.querySelector(".btn__head");
  const img=btn.querySelector(".btn__avatar");
  const label=btn.querySelector(".btn__label");
  if(name&&token){
    if(label)label.textContent="Mi panel";
    if(head)head.style.display="none";
    if(img){img.onerror=()=>{img.onerror=null;img.src=avatarUrl("Steve");};img.src=avatarUrl(name);img.style.display="inline-block";}
    btn.classList.add("btn--access-on");
  }else{
    if(label)label.textContent="Acceder";
    if(head)head.style.display="";
    if(img)img.style.display="none";
    btn.classList.remove("btn--access-on");
  }
}

/* ---- anuncio recompensado ----
   Monetag descartado: en web no da recompensado y sus anuncios son basura.
   El backend (/me/ads/start, /ads/postback, /me/ads/status) es reutilizable con
   ayeT-Studios (SDK HTML5 + callback S2S). Al conectar ayeT se rellena watchAd(). */
async function watchAd(){ /* pendiente de conectar ayeT-Studios */ }
function pollReward(nonce,reward,tries){
  const note=$("adNote"), btn=$("watchAd");
  api("/me/ads/status?nonce="+encodeURIComponent(nonce),{auth:true}).then(({data})=>{
    if(data && data.rewarded){
      if(note)note.textContent="";
      toast("+"+reward+" SC");
      loadBalance();
      if(btn)btn.disabled=false;
      return;
    }
    if(tries>=12){                                  // ~24s esperando el postback
      if(note)note.textContent="La recompensa puede tardar un momento en llegar.";
      if(btn)btn.disabled=false;
      return;
    }
    setTimeout(()=>pollReward(nonce,reward,tries+1),2000);
  }).catch(()=>{ if(btn)btn.disabled=false; });
}

document.addEventListener("click",e=>{
  const buy=e.target.closest("[data-buy]"),tab=e.target.closest("[data-tab]"),at=e.target.closest("[data-auth]"),sort=e.target.closest("[data-sort]"),claim=e.target.closest("[data-claim-tier]");
  if(sort){finderSort=sort.dataset.sort;renderFinderTabs();paintFinder();}
  if(buy){
    const it=STORE_ITEMS[buy.dataset.buy];
    if(it && it.cur==="coins" && it.id) redeemStoreItem(it,buy);
    else toast("La tienda se activa muy pronto.");
  }
  if(claim)claimPassTier(parseInt(claim.dataset.claimTier,10),claim);
  if(tab){storeFilter=tab.dataset.tab;renderStore();}
  if(at){
    authTab=at.dataset.auth;
    document.querySelectorAll("[data-auth]").forEach(b=>b.classList.toggle("is-active",b.dataset.auth===authTab));
    if($("authCode"))$("authCode").style.display=authTab==="code"?"":"none";
    if($("authPass"))$("authPass").style.display=authTab==="pass"?"":"none";
  }
});
if($("copyIp"))$("copyIp").onclick=()=>{navigator.clipboard?.writeText(SERVER.host);toast("¡IP copiada!");};
if($("verifyCode"))$("verifyCode").onclick=verifyCode;
if($("watchAd"))$("watchAd").onclick=watchAd;
if($("doLogin"))$("doLogin").onclick=loginPassword;
if($("savePw"))$("savePw").onclick=savePassword;
if($("skipPw"))$("skipPw").onclick=()=>enterDashboard(window._pendingName||"");
if($("logoutBtn"))$("logoutBtn").onclick=logout;
if($("passPw"))$("passPw").addEventListener("keydown",e=>{if(e.key==="Enter")loginPassword();});
if($("linkCode"))$("linkCode").addEventListener("keydown",e=>{if(e.key==="Enter")verifyCode();});

/** Menu de secciones a pantalla completa: se abre pulsando el logo, se
    cierra con la X, la tecla Escape, o clicando fuera de los enlaces. */
function initSiteMenu(){
  const menu=$("siteMenu"),toggle=$("menuToggle"),close=$("menuClose"),backdrop=$("siteMenuBackdrop");
  if(!menu||!toggle)return;
  const open=()=>{
    menu.classList.add("is-open");menu.setAttribute("aria-hidden","false");toggle.setAttribute("aria-expanded","true");
    if(backdrop)backdrop.classList.add("is-open");
  };
  const shut=()=>{
    menu.classList.remove("is-open");menu.setAttribute("aria-hidden","true");toggle.setAttribute("aria-expanded","false");
    if(backdrop)backdrop.classList.remove("is-open");
  };
  toggle.addEventListener("click",e=>{e.preventDefault();open();});
  if(close)close.addEventListener("click",shut);
  if(backdrop)backdrop.addEventListener("click",shut);
  document.addEventListener("keydown",e=>{if(e.key==="Escape"&&menu.classList.contains("is-open"))shut();});
  menu.querySelectorAll("a").forEach(a=>a.addEventListener("click",shut));
}

applyI18n();renderFeatures();renderAds();initDashboard();initStatus();updateAccessButton();initFinder();renderLeaderboard();initProfile();initSiteMenu();initPassTabs();addCommandCopyButtons();initLangSwitcher();
