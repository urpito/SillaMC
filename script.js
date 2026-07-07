/* ============================================================
   SillaMC Survival — funciona en index.html (landing) y dashboard.html
   · Recompensas: STORE_ITEMS · Textos: I18N
   · Backend verificación: API_BASE (vacío = DEMO, código válido 123456)
   ============================================================ */
const API_BASE = "";  // ej: "http://tu-dominio:8770"

const I18N = {
 es:{
  "nav.features":"Características","nav.start":"Cómo entrar","nav.discord":"Discord","nav.login":"Entrar","nav.home":"← Inicio",
  "hero.eyebrow":"SURVIVAL VANILLA++ · JAVA + BEDROCK · ESPAÑOL",
  "hero.tagline":"Economía viva, claims de terreno, trabajos y traductor de chat en tiempo real. Únete a la comunidad.",
  "hero.iplabel":"IP del servidor","hero.copy":"Copiar","hero.online":"En línea","hero.players":"jugadores",
  "hero.enter":"Entrar a mi panel","hero.more":"Ver más",
  "features.title":"Qué hace especial a SillaMC",
  "band.n1":"Cross-play","band.t1":"Java y Bedrock juntos: PC, consola y móvil.",
  "band.n2":"Español + EN","band.t2":"Traductor de chat con IA local. Elige idioma.",
  "band.n3":"Economía justa","band.t3":"Precios dinámicos, trabajos y SillaCoins.",
  "info.title":"Cómo entrar en 4 pasos","start.cta":"Entrar a mi panel de jugador",
  "footer.join":"Únete","footer.legal":"No afiliado a Mojang ni Microsoft. SillaMC es un servidor comunitario.",
  "link.title":"Entra: vincula tu cuenta","link.sub":"Te enviamos un código al chat del juego y lo pones aquí. Así sabemos que la cuenta es tuya.",
  "link.userlabel":"Tu nombre de usuario en el servidor","link.send":"Enviar código","link.hint1":"Tienes que estar conectado al servidor para recibir el código.",
  "link.codelabel":"Código recibido en el chat del juego","link.verify":"Verificar","link.hint2":"Mira el chat de Minecraft: te llegó un código de 6 dígitos.",
  "dash.logout":"Salir","dash.hi":"Hola,","dash.earn":"Gana SillaCoins","dash.earndesc":"Mira un anuncio corto y recibe SC al instante. 100% opcional.",
  "rewards.cta":"▶ Ver un anuncio","dash.rank":"Tu rango","dash.rankdesc":"Sube de rango en la tienda: Taburete → Sillón → Trono.",
  "store.title":"Tienda de recompensas","store.sub":"Todo cosmético y de comodidad — nada de pay-to-win. Gasta SC o apoya el server.","ad.label":"Publicidad"
 },
 en:{
  "nav.features":"Features","nav.start":"How to join","nav.discord":"Discord","nav.login":"Log in","nav.home":"← Home",
  "hero.eyebrow":"SURVIVAL VANILLA++ · JAVA + BEDROCK",
  "hero.tagline":"Living economy, land claims, jobs and real-time chat translation. Join the community.",
  "hero.iplabel":"Server IP","hero.copy":"Copy","hero.online":"Online","hero.players":"players",
  "hero.enter":"Go to my panel","hero.more":"See more",
  "features.title":"What makes SillaMC special",
  "band.n1":"Cross-play","band.t1":"Java and Bedrock together: PC, console, mobile.",
  "band.n2":"Spanish + EN","band.t2":"Local-AI chat translator. Pick your language.",
  "band.n3":"Fair economy","band.t3":"Dynamic prices, jobs and SillaCoins.",
  "info.title":"Join in 4 steps","start.cta":"Go to my player panel",
  "footer.join":"Join","footer.legal":"Not affiliated with Mojang or Microsoft. SillaMC is a community server.",
  "link.title":"Log in: link your account","link.sub":"We send a code to the game chat and you enter it here. That proves the account is yours.",
  "link.userlabel":"Your username on the server","link.send":"Send code","link.hint1":"You must be connected to the server to receive the code.",
  "link.codelabel":"Code received in the game chat","link.verify":"Verify","link.hint2":"Check Minecraft chat: you got a 6-digit code.",
  "dash.logout":"Log out","dash.hi":"Hi,","dash.earn":"Earn SillaCoins","dash.earndesc":"Watch a short ad and get SC instantly. 100% optional.",
  "rewards.cta":"▶ Watch an ad","dash.rank":"Your rank","dash.rankdesc":"Rank up in the store: Stool → Armchair → Throne.",
  "store.title":"Rewards store","store.sub":"All cosmetic & convenience — no pay-to-win. Spend SC or support the server.","ad.label":"Advertisement"
 }
};

const FEATURES=[
 {i:"💰",es:["Economía dinámica","Tienda con precios por oferta/demanda y restock diario."],en:["Dynamic economy","Supply/demand shop with daily restock."]},
 {i:"🛡️",es:["Claims de terreno","Protege tus construcciones con ProtectionStones."],en:["Land claims","Protect your builds with ProtectionStones."]},
 {i:"🌐",es:["Traductor de chat","Elige idioma con /idioma. IA local y privada."],en:["Chat translator","Pick language with /idioma. Local, private AI."]},
 {i:"🎮",es:["Java + Bedrock","PC, consola o móvil. Crossplay con Geyser."],en:["Java + Bedrock","PC, console or mobile. Crossplay via Geyser."]},
 {i:"⛏️",es:["Trabajos","Gana SC minando, talando, cultivando."],en:["Jobs","Earn SC mining, chopping, farming."]},
 {i:"🪑",es:["Rangos de sillas","De Taburete a Trono. Solo cosmético."],en:["Chair ranks","From Stool to Throne. Cosmetic only."]}
];
const STORE_ITEMS=[
 {cat:"rank",icon:"🪑",tag:"POPULAR",price:5,cur:"eur",es:["Rango Sillón","Prefijo [Sillón], color de chat, /hat y +2 homes."],en:["Sillón Rank","[Sillón] tag, chat color, /hat and +2 homes."]},
 {cat:"rank",icon:"👑",price:12,cur:"eur",es:["Rango Trono","Todo lo de Sillón + partículas, /nick y prefijo [Trono]."],en:["Trono Rank","Everything in Sillón + particles, /nick and [Trono] tag."]},
 {cat:"cosmetic",icon:"🎩",price:500,cur:"coins",es:["Sombreros /hat","Ponte cualquier bloque en la cabeza."],en:["/hat cosmetics","Wear any block on your head."]},
 {cat:"cosmetic",icon:"✨",price:800,cur:"coins",es:["Estelas de partículas","Deja un rastro al caminar."],en:["Particle trails","Leave a trail as you walk."]},
 {cat:"cosmetic",icon:"🪑",price:1000,cur:"coins",es:["Silla decorativa","Siéntate donde quieras."],en:["Sit-anywhere chair","Sit wherever you like."]},
 {cat:"coins",icon:"🪙",tag:"NUEVO",price:2,cur:"eur",es:["Pack 2.000 SC","Apoya el server y gasta en cosméticos."],en:["2,000 SC pack","Support the server and spend on cosmetics."]},
 {cat:"coins",icon:"💎",price:5,cur:"eur",es:["Pack 6.000 SC","Mejor relación."],en:["6,000 SC pack","Best value."]},
 {cat:"perk",icon:"🏠",price:1500,cur:"coins",es:["+1 Home extra","Un teletransporte más. Comodidad, no poder."],en:["+1 extra Home","One more teleport. Convenience, not power."]}
];
const INFO=[
 {n:"01",es:["Consigue Minecraft","Java (PC) o Bedrock (consola/móvil)."],en:["Get Minecraft","Java (PC) or Bedrock (console/mobile)."]},
 {n:"02",es:["Añade el servidor","<code>play.sillamc.com</code> · Bedrock puerto <code>25566</code>."],en:["Add the server","<code>play.sillamc.com</code> · Bedrock port <code>25566</code>."]},
 {n:"03",es:["Regístrate","<code>/register clave clave</code> · idioma <code>/idioma</code>."],en:["Register","<code>/register pass pass</code> · language <code>/idioma</code>."]},
 {n:"04",es:["Vincula y juega","Entra a tu panel y canjea recompensas."],en:["Link and play","Go to your panel and redeem rewards."]}
];

let lang=localStorage.getItem("sillamc_lang")||"es";
let coins=parseInt(localStorage.getItem("sillamc_coins")||"0");
let storeFilter="all";
const $=id=>document.getElementById(id);
const t=k=>(I18N[lang]&&I18N[lang][k])||k;
const L=o=>o[lang];
function toast(m){const el=$("toast");if(!el)return;el.textContent=m;el.classList.add("show");clearTimeout(el._t);el._t=setTimeout(()=>el.classList.remove("show"),2600);}

function applyI18n(){
  document.querySelectorAll("[data-i18n]").forEach(el=>el.innerHTML=t(el.dataset.i18n));
  document.documentElement.lang=lang;
  if($("langToggle"))$("langToggle").innerHTML=lang==="es"?"🇬🇧 EN":"🇪🇸 ES";
}
function renderFeatures(){if($("featuresGrid"))$("featuresGrid").innerHTML=FEATURES.map(f=>`<div class="fcard"><div class="fcard__icon">${f.i}</div><h3>${L(f)[0]}</h3><p>${L(f)[1]}</p></div>`).join("");}
function renderInfo(){if($("infoGrid"))$("infoGrid").innerHTML=INFO.map(s=>`<div class="icard"><div class="icard__step">${s.n}</div><h3>${L(s)[0]}</h3><p>${L(s)[1]}</p></div>`).join("");}
function renderStore(){
  if(!$("storeGrid"))return;
  const tabs=[["all",{es:"Todo",en:"All"}],["rank",{es:"Rangos",en:"Ranks"}],["cosmetic",{es:"Cosméticos",en:"Cosmetics"}],["coins",{es:"Monedas",en:"Coins"}],["perk",{es:"Comodidad",en:"Perks"}]];
  $("storeTabs").innerHTML=tabs.map(([k,l])=>`<button class="tab ${storeFilter===k?'is-active':''}" data-tab="${k}">${l[lang]}</button>`).join("");
  const items=STORE_ITEMS.filter(i=>storeFilter==="all"||i.cat===storeFilter);
  $("storeGrid").innerHTML=items.map(it=>{
    const price=it.cur==="coins"?`${it.price.toLocaleString()} <small>SC</small>`:`${it.price}€`;
    const buy=it.cur==="coins"?(lang==="es"?"Canjear":"Redeem"):(lang==="es"?"Comprar":"Buy");
    return `<div class="scard">${it.tag?`<span class="scard__tag">${it.tag}</span>`:""}<div class="scard__icon">${it.icon}</div><h3>${L(it)[0]}</h3><p>${L(it)[1]}</p><div class="scard__foot"><span class="scard__price">${price}</span><button class="btn btn--primary" data-buy="${STORE_ITEMS.indexOf(it)}">${buy}</button></div></div>`;
  }).join("");
}
function renderAds(){
  if(!$("adTop"))return;
  const ad=lang==="es"
    ?`<div class="demoad"><span class="demoad__ico">🎮</span><div><div class="demoad__t">Tu anuncio aquí</div><div class="demoad__d">Espacio patrocinado · se activa con AdSense o patrocinadores</div></div><span class="demoad__cta">Saber más</span></div>`
    :`<div class="demoad"><span class="demoad__ico">🎮</span><div><div class="demoad__t">Your ad here</div><div class="demoad__d">Sponsored slot · activates with AdSense or sponsors</div></div><span class="demoad__cta">Learn more</span></div>`;
  $("adTop").innerHTML=ad;if($("adBottom"))$("adBottom").innerHTML=ad;
}
function updateCoins(){if($("coinBalance")){$("coinBalance").textContent=coins.toLocaleString();}localStorage.setItem("sillamc_coins",coins);}

/* ---- login gate (dashboard) ---- */
function showDashboard(){
  const u=localStorage.getItem("sillamc_user")||"jugador";
  if($("loginView"))$("loginView").style.display="none";
  if($("dashView"))$("dashView").style.display="block";
  if($("dashUser"))$("dashUser").textContent=u;
  if($("logoutBtn"))$("logoutBtn").style.display="inline-flex";
  renderStore();renderAds();updateCoins();
}
function initDashboard(){
  if(!$("loginView"))return;              // no estamos en dashboard
  if(localStorage.getItem("sillamc_verified")==="1"){showDashboard();}
}
async function sendCode(){
  const u=$("linkUser").value.trim();
  if(!u){toast(lang==="es"?"Escribe tu usuario":"Enter your username");return;}
  toast(lang==="es"?"Enviando código…":"Sending code…");
  try{
    if(API_BASE){const r=await fetch(API_BASE+"/request-code",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({username:u})});if(!r.ok)throw 0;}
    else await new Promise(s=>setTimeout(s,700));
    $("linkStep1").classList.add("link__step--off");
    $("linkStep2").classList.remove("link__step--off");
    $("linkCode").focus();
    toast(lang==="es"?"Código enviado al chat del juego":"Code sent to the game chat");
  }catch(e){toast(lang==="es"?"No se pudo enviar (¿estás conectado?)":"Couldn't send (are you online?)");}
}
async function verifyCode(){
  const u=$("linkUser").value.trim(),c=$("linkCode").value.trim();
  if(c.length<6){toast(lang==="es"?"Código de 6 dígitos":"6-digit code");return;}
  try{
    let ok;
    if(API_BASE){const r=await fetch(API_BASE+"/verify",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({username:u,code:c})});ok=r.ok;}
    else ok=(c==="123456");
    if(ok){localStorage.setItem("sillamc_verified","1");localStorage.setItem("sillamc_user",u);toast(lang==="es"?"¡Verificado!":"Verified!");showDashboard();}
    else toast(lang==="es"?"Código incorrecto (demo: 123456)":"Wrong code (demo: 123456)");
  }catch(e){toast(lang==="es"?"Error de verificación":"Verification error");}
}

document.addEventListener("click",e=>{
  const buy=e.target.closest("[data-buy]"),tab=e.target.closest("[data-tab]");
  if(buy){const it=STORE_ITEMS[+buy.dataset.buy];
    if(it.cur==="coins"){if(coins>=it.price){coins-=it.price;updateCoins();toast((lang==="es"?"¡Canjeado! ":"Redeemed! ")+L(it)[0]);}else toast(lang==="es"?"No tienes suficientes SC":"Not enough SC");}
    else toast(lang==="es"?"Redirigiendo al pago (Tebex)…":"Redirecting to checkout (Tebex)…");}
  if(tab){storeFilter=tab.dataset.tab;renderStore();}
});
if($("langToggle"))$("langToggle").onclick=()=>{lang=lang==="es"?"en":"es";localStorage.setItem("sillamc_lang",lang);applyI18n();renderFeatures();renderInfo();renderStore();renderAds();};
if($("copyIp"))$("copyIp").onclick=()=>{navigator.clipboard?.writeText("play.sillamc.com");toast(lang==="es"?"¡IP copiada!":"IP copied!");};
if($("watchAd"))$("watchAd").onclick=e=>{e.preventDefault();toast(lang==="es"?"Cargando anuncio… (demo)":"Loading ad… (demo)");setTimeout(()=>{coins+=100;updateCoins();toast("+100 SC 🪙");},1200);};
if($("sendCode"))$("sendCode").onclick=sendCode;
if($("verifyCode"))$("verifyCode").onclick=verifyCode;
if($("logoutBtn"))$("logoutBtn").onclick=()=>{localStorage.removeItem("sillamc_verified");location.reload();};

applyI18n();renderFeatures();renderInfo();initDashboard();
if($("playerCount"))$("playerCount").textContent=Math.floor(Math.random()*6);
