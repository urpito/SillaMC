/* SillaWeb en la web: avisos, evento flash en curso, historial de SillaCoins, casa de
   subastas, "aparecer en", nombre y mapa de las protecciones, y la página de precios.
   Se carga después de script.js y amplía sus funciones sin tocarlas. */
(function(){
"use strict";

const AV={unread:0,lastTopId:0,timer:null,evTimer:null,event:null,started:false};
const AV_ICON={login:"🔑",login_fallido:"⚠️",proteccion:"🛡️",subasta:"🏷️",evento:"⚡",pase:"🎫"};

// Nombres en español de lo que se vende en la tienda (el mapa general de script.js no los tiene todos).
const ES_NAMES={andesite:"Andesita",apple:"Manzana",azalea:"Azalea",bamboo:"Bambú",birch_log:"Tronco de abedul",
  blaze_rod:"Vara de blaze",bone:"Hueso",cactus:"Cactus",carrot:"Zanahoria",cherry_log:"Tronco de cerezo",
  cobbled_deepslate:"Pizarra profunda labrada",cobblestone:"Adoquín",dirt:"Tierra",ender_pearl:"Perla de ender",
  glowstone_dust:"Polvo de piedra luminosa",gunpowder:"Pólvora",moss_block:"Bloque de musgo",
  nether_wart:"Verruga del Nether",oak_log:"Tronco de roble",ochre_froglight:"Luz de rana ocre",
  pearlescent_froglight:"Luz de rana perlada",verdant_froglight:"Luz de rana verde",potato:"Patata",
  quartz:"Cuarzo del Nether",rotten_flesh:"Carne podrida",saddle:"Silla de montar",sand:"Arena",
  sea_pickle:"Pepino de mar",snow_block:"Bloque de nieve",soul_sand:"Arena de almas",spider_eye:"Ojo de araña",
  spruce_log:"Tronco de abeto",spyglass:"Catalejo",sugar_cane:"Caña de azúcar",tuff:"Toba",
  wind_charge:"Carga de viento",stone:"Piedra",wheat_seeds:"Semillas de trigo",bread:"Pan",leather:"Cuero",
  torch:"Antorcha",water_bucket:"Cubo de agua",iron_ingot:"Lingote de hierro",coal:"Carbón",diamond:"Diamante",
  totem_of_undying:"Tótem de la inmortalidad"};
function nameOf(m){m=String(m||"").toLowerCase();return ES_NAMES[m]||humanMaterial(m);}

function fmtSC(n){return (Math.round(Number(n||0)*100)/100).toLocaleString("es-ES");}
function fmtWhen(t){
  const diff=Date.now()/1000-t;
  if(diff<60)return "ahora mismo";
  if(diff<3600)return "hace "+Math.floor(diff/60)+" min";
  if(diff<86400)return "hace "+Math.floor(diff/3600)+" h";
  const d=new Date(t*1000);
  return d.toLocaleDateString("es-ES",{day:"numeric",month:"short"})+", "+d.toLocaleTimeString("es-ES",{hour:"2-digit",minute:"2-digit"});
}

/* ------------------------------------------------------------ avisos */

async function loadAvisos(quiet){
  const box=$("avisosList");
  if(!box)return;
  const {ok,data}=await api("/me/avisos?limit=30",{auth:true});
  if(!ok||!data.ok){box.innerHTML='<p class="finder__msg">No se pudieron cargar los avisos.</p>';return;}
  const items=data.items||[];
  const top=items.length?items[0].id:0;
  if(!quiet&&AV.lastTopId&&top>AV.lastTopId){
    const fresh=items.find(i=>!i.read&&i.id>AV.lastTopId);
    if(fresh)toast((AV_ICON[fresh.type]||"🔔")+" "+fresh.title);
  }
  AV.lastTopId=top;
  AV.unread=data.unread||0;
  paintBadge();
  box.innerHTML=items.length?items.map(i=>{
    const loginType=i.type==="login"||i.type==="login_fallido";
    let action=!loginType?"":(i.data&&i.data.reported?'<span class="aviso__done">Avisado ✔</span>'
      :`<button class="btn btn--ghost btn--danger" data-nofui="${i.id}">No fui yo</button>`);
    // Las recompensas del pase se reclaman en su tarjeta, más arriba en el panel.
    if(i.type==="pase")action='<button class="btn btn--ghost" data-gopase="1">Ir al pase ↑</button>';
    return `<div class="aviso${i.read?"":" aviso--new"}">
      <span class="aviso__icon">${AV_ICON[i.type]||"🔔"}</span>
      <div class="aviso__body"><b>${escapeHtml(i.title)}</b><span>${escapeHtml(i.body||"")}</span><small>${fmtWhen(i.t)}</small></div>
      ${action}</div>`;
  }).join(""):'<p class="finder__msg">Aún no tienes avisos. Aquí verás quién entra en tus protecciones, tus ventas en la subasta, '+
    'los eventos flash, tus subidas de nivel del pase y cada inicio de sesión en tu cuenta.</p>';
  box.querySelectorAll("[data-nofui]").forEach(b=>b.addEventListener("click",()=>noFuiYo(Number(b.dataset.nofui),b)));
  box.querySelectorAll("[data-gopase]").forEach(b=>b.addEventListener("click",()=>{
    const card=$("passCard");
    if(card&&card.offsetParent)card.scrollIntoView({behavior:"smooth",block:"start"});
    else toast("El pase de temporada no está disponible ahora mismo.");
  }));
}

function paintBadge(){
  const b=$("avisosBadge");
  if(!b)return;
  b.textContent=AV.unread>99?"99+":String(AV.unread);
  b.style.display=AV.unread?"inline-flex":"none";
}

async function readAllAvisos(){
  await api("/me/avisos/leer",{method:"POST",auth:true,body:{all:true}});
  loadAvisos(true);
}

async function noFuiYo(id,btn){
  if(!confirm("¿Seguro que no fuiste tú?\n\n"+
    "· Si fue en el juego: se cierra esa sesión y esa IP no podrá entrar en 24 horas.\n"+
    "· Si fue en la web: se cierran todas tus demás sesiones de la web.\n\n"+
    "Después cambia tu contraseña (en el juego: /changepassword)."))return;
  btn.disabled=true;
  const {ok,data}=await api("/me/avisos/nofuiyo",{method:"POST",auth:true,body:{id}});
  if(ok&&data.ok){
    let msg="Hecho. El staff ya está avisado.";
    if(data.kicked)msg+=" Se cerró esa sesión.";
    if(data.ipBanned)msg+=" IP bloqueada 24 h.";
    if(data.sessionsClosed!==undefined)msg+=" Sesiones web cerradas: "+data.sessionsClosed+".";
    toast(msg);
  }else toast("No se pudo avisar. Inténtalo otra vez.");
  loadAvisos(true);
}

/* ------------------------------------------------------------ evento flash en curso */

async function loadEvento(){
  const {ok,data}=await api("/evento-activo");
  AV.event=ok&&data.ok?data.event:null;
  paintEvento();
}

function paintEvento(){
  const el=$("eventoBanner");
  if(!el)return;
  const ev=AV.event;
  const left=ev?Math.max(0,Math.floor(ev.until-Date.now()/1000)):0;
  if(!ev||!left){el.style.display="none";return;}
  el.style.display="flex";
  el.innerHTML=`<b>⚡ Evento flash:</b> ${escapeHtml(ev.desc||"")}`+
    `<span>· El primero gana ${escapeHtml(String(ev.reward||"?"))} SC · Quedan ${Math.floor(left/60)}:${String(left%60).padStart(2,"0")}</span>`;
}

/* ------------------------------------------------------------ historial de SC */

async function loadHistorial(){
  const box=$("historialList");
  if(!box)return;
  const {ok,data}=await api("/me/historial?limit=60",{auth:true});
  if(!ok||!data.ok){box.innerHTML='<p class="finder__msg">No se pudo cargar el historial.</p>';return;}
  const items=data.items||[];
  box.innerHTML=items.length?'<div class="hist">'+items.map(r=>
    `<div class="hist__row"><span class="hist__when">${fmtWhen(r.t)}</span>`+
    `<span class="hist__label">${escapeHtml(r.label||"")}</span>`+
    `<span class="hist__delta ${r.delta>=0?"is-plus":"is-minus"}">${r.delta>=0?"+":""}${fmtSC(r.delta)}</span>`+
    `<span class="hist__bal">${r.balance!=null?fmtSC(r.balance)+" SC":""}</span></div>`).join("")+'</div>'
    :'<p class="finder__msg">Todavía no hay movimientos. A partir de ahora verás aquí todo lo que ganas y gastas.</p>';
}

/* ------------------------------------------------------------ casa de subastas */

async function loadSubastas(){
  const box=$("subastasList");
  if(!box)return;
  const {ok,data}=await api("/me/subastas",{auth:true});
  if(!ok||!data.ok){box.innerHTML='<p class="finder__msg">La casa de subastas no está disponible ahora mismo.</p>';return;}
  const me=(localStorage.getItem("sillamc_name")||"").toLowerCase();
  const items=data.items||[];
  box.innerHTML=items.length?'<div class="things">'+items.map(a=>{
    const mine=String(a.seller||"").toLowerCase()===me;
    const h=Math.floor(a.timeLeft/3600),m=Math.floor(a.timeLeft%3600/60);
    const name=a.name&&a.name.toLowerCase()!==String(a.material).replace(/_/g," ")?a.name:nameOf(a.material);
    let action=`<button class="btn btn--primary" data-buyah="${escapeHtml(a.id)}">Comprar</button>`;
    if(mine)action='<span class="thing__role thing__role--guest">Tuya</span>';
    else if(a.bid)action='<span class="thing__role thing__role--guest">De pujas: en el juego</span>';
    return `<div class="thing">${mcIconImgHtml(a.material,"thing__icon")}
      <div class="thing__body"><b>${a.amount}× ${escapeHtml(name)}</b>${a.enchanted?'<span class="thing__role">Encantado</span>':""}
        <span class="thing__meta">Vende ${escapeHtml(a.seller||"?")} · quedan ${h} h ${m} min</span></div>
      <div class="thing__actions"><b class="subasta__price">${fmtSC(a.price)} SC</b>${action}</div></div>`;
  }).join("")+'</div>'
    :'<p class="finder__msg">Ahora mismo no hay nada a la venta. En el juego puedes vender lo que tengas en la mano con <code>/vender &lt;precio&gt;</code>.</p>';
  box.querySelectorAll("[data-buyah]").forEach(b=>b.addEventListener("click",()=>buySubasta(items.find(x=>x.id===b.dataset.buyah),b)));
}

async function buySubasta(a,btn){
  if(!a)return;
  if(!confirm(`¿Comprar ${a.amount}× ${a.name||nameOf(a.material)} por ${fmtSC(a.price)} SC?\n\n`+
    "Tienes que estar conectado al juego: el objeto va directo a tu inventario."))return;
  btn.disabled=true;
  const {ok,data}=await api("/me/subastas/comprar",{method:"POST",auth:true,body:{id:a.id}});
  const errors={offline:"Entra al juego para comprar: el objeto va directo a tu inventario.",
    no_money:"No tienes suficientes SillaCoins.",not_available:"Alguien se te adelantó: ya no está a la venta.",
    own_auction:"Es tu propia subasta.",bid_auction:"Esta subasta es de pujas: solo se puja dentro del juego."};
  if(ok&&data.ok){toast("¡Comprado! Ya lo tienes en tu inventario.");if(typeof loadBalance==="function")loadBalance();}
  else toast(errors[data&&data.error]||"No se pudo comprar.");
  loadSubastas();
}

/* ------------------------------------------------------------ aparecer en */

/* Sección propia con un desplegable: no depende de cómo se pinte la lista de casas. */
async function loadAparecer(){
  const sel=$("aparecerSelect"),msg=$("aparecerMsg");
  if(!sel)return;
  const {ok,data}=await api("/me/aparecer",{auth:true});
  if(!ok||!data.ok){
    if(msg)msg.textContent="No se pudo cargar: el servidor se está reiniciando. Prueba en un minuto.";
    return;
  }
  const homes=data.homes||[];
  sel.innerHTML='<option value="">Donde me desconecté (lo normal)</option><option value="spawn">En el spawn</option>'+
    homes.map(h=>`<option value="${escapeHtml(h)}">En mi casa «${escapeHtml(h)}»</option>`).join("");
  sel.value=data.value||"";
  if(msg)msg.textContent=homes.length?"":"Cuando tengas casas (/sethome nombre) también podrás elegirlas aquí.";
}

async function saveAparecer(){
  const sel=$("aparecerSelect"),btn=$("aparecerGuardar");
  if(!sel)return;
  const value=sel.value;
  if(btn)btn.disabled=true;
  const {ok,data}=await api("/me/aparecer",{method:"POST",auth:true,body:{value}});
  if(btn)btn.disabled=false;
  if(ok&&data.ok){
    toast(!value?"Guardado: apareces donde te desconectes.":
      "Guardado: al entrar al juego aparecerás "+(value==="spawn"?"en el spawn.":"en tu casa «"+value+"»."));
  }else{
    toast(data&&data.error==="unknown_home"?"Esa casa ya no existe.":"No se pudo guardar. Prueba otra vez en un minuto.");
    loadAparecer();
  }
}

/* ------------------------------------------------------------ tienda: precios reales */

// Presentación de lo que se vende y no está en la lista fija de script.js.
const STORE_EXTRA={
  proteccion_20x20:{cat:"perk",icon:"🛡️",mat:"emerald_ore",t:["Protección 20×20","Un bloque protector: nadie más podrá romper ni construir en tu terreno."]},
  cubo_agua:{cat:"pack",icon:"🪣",mat:"water_bucket",t:["Cubo de agua","Para tu granja, un pozo o apagar un fuego."]},
  cama_blanca:{cat:"pack",icon:"🛏️",mat:"white_bed",t:["Cama blanca","Para dormir por la noche y guardar tu punto de reaparición."]},
  cama_roja:{cat:"pack",icon:"🛏️",mat:"red_bed",t:["Cama roja","Para dormir por la noche y guardar tu punto de reaparición."]},
  cama_azul:{cat:"pack",icon:"🛏️",mat:"blue_bed",t:["Cama azul","Para dormir por la noche y guardar tu punto de reaparición."]},
  cama_negra:{cat:"pack",icon:"🛏️",mat:"black_bed",t:["Cama negra","Para dormir por la noche y guardar tu punto de reaparición."]}
};

/* La lista de la tienda de script.js tiene precios escritos a mano y se había quedado
   vieja. Aquí se ajusta a lo que dice el servidor (que es lo que de verdad se cobra):
   precios reales, fuera lo que ya no se vende y dentro lo nuevo. */
async function syncStore(){
  if(!$("storeGrid")||typeof STORE_ITEMS==="undefined")return;
  const {ok,data}=await api("/store/items");
  if(!ok||!data||!Array.isArray(data.items))return;
  const live=new Map(data.items.map(i=>[i.id,i]));
  for(let i=STORE_ITEMS.length-1;i>=0;i--){
    const it=STORE_ITEMS[i];
    if(it.cur!=="coins")continue;
    if(!live.has(it.id)){STORE_ITEMS.splice(i,1);continue;}
    it.price=live.get(it.id).price;
  }
  for(const item of data.items){
    if(STORE_ITEMS.some(it=>it.id===item.id))continue;
    const extra=STORE_EXTRA[item.id]||{cat:"pack",icon:"📦",t:[item.label,""]};
    STORE_ITEMS.push(Object.assign({id:item.id,price:item.price,cur:"coins"},extra));
  }
  renderStore();
}

/* ------------------------------------------------------------ protecciones: nombre y mapa */

if(typeof protectionLabel==="function"){
  const baseLabel=protectionLabel;
  protectionLabel=function(p,i){return p&&p.name?"«"+p.name+"»":baseLabel(p,i);};
}

if(typeof openProtectionMenu==="function"){
  const baseMenu=openProtectionMenu;
  openProtectionMenu=function(p,idx){
    baseMenu(p,idx);
    const anchor=document.querySelector("#psMsg");
    if(!anchor||!p)return;
    const block=document.createElement("div");
    block.className="onbmodal__step";
    block.innerHTML=`<h4 class="pass-track__title">Nombre y mapa</h4>
      <div class="psaddrow"><input type="text" id="psNameInput" maxlength="20" autocomplete="off"
        placeholder="Nombre (letras, números, - y _)" value="${escapeHtml(p.name||"")}" />
        <button class="btn btn--primary" id="psNameBtn">Guardar nombre</button></div>
      <div class="psmap"><canvas id="psMapCanvas" width="256" height="256"></canvas>
        <p class="finder__msg" id="psMapMsg">Cargando el mapa…</p></div>`;
    anchor.parentNode.insertBefore(block,anchor);
    block.querySelector("#psNameBtn").addEventListener("click",async()=>{
      const name=block.querySelector("#psNameInput").value.trim();
      if(name&&!/^[A-Za-z0-9_-]{1,20}$/.test(name))return toast("Solo letras, números, - y _ (máximo 20).");
      const {ok,data}=await api("/me/protections/rename",{method:"POST",auth:true,body:{world:p.world,region:p.id,name}});
      if(ok&&data.ok){toast(name?"Nombre guardado.":"Nombre quitado.");loadMyThings();}
      else toast(data&&data.error==="name_taken"?"Ese nombre ya lo usa otra protección.":"No se pudo cambiar el nombre.");
    });
    drawProtectionMap(p);
  };
}

async function drawProtectionMap(p){
  const {ok,data}=await api(`/me/protections/map?world=${encodeURIComponent(p.world)}&region=${encodeURIComponent(p.id)}`,{auth:true});
  const cv=$("psMapCanvas"),msg=$("psMapMsg");
  if(!cv||!msg)return;
  if(!ok||!data.ok){msg.textContent="No se pudo dibujar el mapa ahora mismo.";cv.style.display="none";return;}
  const w=data.width,h=data.height,raw=atob(data.rgb);
  const img=new ImageData(w,h);
  for(let i=0,j=0;i<w*h;i++,j+=3){
    img.data[i*4]=raw.charCodeAt(j);img.data[i*4+1]=raw.charCodeAt(j+1);img.data[i*4+2]=raw.charCodeAt(j+2);img.data[i*4+3]=255;
  }
  const off=document.createElement("canvas");
  off.width=w;off.height=h;off.getContext("2d").putImageData(img,0,0);
  const scale=Math.max(1,Math.floor(256/Math.max(w,h)));
  cv.width=w*scale;cv.height=h*scale;
  const ctx=cv.getContext("2d");
  ctx.imageSmoothingEnabled=false;
  ctx.drawImage(off,0,0,w*scale,h*scale);
  const px=v=>v/data.step*scale;
  const pts=data.points||[];
  if(pts.length){
    const xs=pts.map(q=>q[0]),zs=pts.map(q=>q[1]);
    const x1=Math.min(...xs),x2=Math.max(...xs)+1,z1=Math.min(...zs),z2=Math.max(...zs)+1;
    ctx.strokeStyle="#f4b63a";ctx.lineWidth=2;
    ctx.strokeRect(px(x1-data.x0),px(z1-data.z0),px(x2-x1),px(z2-z1));
  }
  if(data.home){
    ctx.fillStyle="#ff5d6c";ctx.beginPath();
    ctx.arc(px(data.home[0]-data.x0+0.5),px(data.home[1]-data.z0+0.5),Math.max(3,scale*1.5),0,Math.PI*2);ctx.fill();
  }
  msg.textContent="Vista desde arriba, con el norte hacia arriba. Borde dorado: la protección. Punto rojo: su casa.";
}

/* ------------------------------------------------------------ enganche con el panel */

function dashVisible(){const d=$("dashView");return !!d&&d.style.display!=="none"&&!!getToken();}

function startExtras(){
  loadAvisos(true);loadEvento();loadHistorial();loadSubastas();loadAparecer();syncStore();
  if(AV.started)return;
  AV.started=true;
  AV.timer=setInterval(()=>{
    if(document.visibilityState!=="visible"||!dashVisible())return;
    loadAvisos(false);loadEvento();
  },20000);
  AV.evTimer=setInterval(paintEvento,1000);
}

/* script.js puede entrar al panel antes de que este archivo termine de cargar (si la
   API responde antes que la descarga), así que no basta con envolver enterDashboard:
   arrancamos en cuanto el panel esté visible, ahora o cuando se muestre. */
let _wasVisible=false;
function syncVisibility(){
  const v=dashVisible();
  if(v&&!_wasVisible)startExtras();
  _wasVisible=v;
}
syncVisibility();
if($("dashView")&&window.MutationObserver){
  new MutationObserver(syncVisibility).observe($("dashView"),{attributes:true,attributeFilter:["style"]});
}
if($("aparecerGuardar"))$("aparecerGuardar").addEventListener("click",saveAparecer);

if($("avisosReadAll"))$("avisosReadAll").addEventListener("click",readAllAvisos);
if($("subastasRefresh"))$("subastasRefresh").addEventListener("click",loadSubastas);
if($("historialRefresh"))$("historialRefresh").addEventListener("click",loadHistorial);

/* ------------------------------------------------------------ página de precios */

async function initPrecios(){
  const box=$("preciosBox");
  if(!box)return;
  const {ok,data}=await api("/precios");
  if(!ok||!data.ok){box.innerHTML='<p class="finder__msg">Los precios no están disponibles ahora mismo. Vuelve a intentarlo en un rato.</p>';return;}
  const items=(data.items||[]).slice().sort((a,b)=>nameOf(a.material).localeCompare(nameOf(b.material),"es"));
  const side=s=>s?`${fmtSC(s.price)} SC <span class="precios__unit">${s.qty} ud. · ${fmtSC(s.unit)} SC/ud.</span>`:"—";
  box.innerHTML=`<table class="precios"><thead><tr><th>Objeto</th><th class="num">Compras (pagas)</th><th class="num">Vendes (te pagan)</th></tr></thead><tbody>`+
    items.map(i=>`<tr><td><span class="precios__item">${mcIconImgHtml(i.material,"")}${escapeHtml(nameOf(i.material))}</span></td>`+
      `<td class="num">${side(i.buy)}</td>`+
      `<td class="num">${i.soloCompra&&!i.sell?'<span class="precios__solo">No se vende</span>':side(i.sell)}</td></tr>`).join("")+
    `</tbody></table>`;
  const upd=$("preciosUpdated");
  if(upd&&data.updated)upd.textContent="Leído de los carteles de la tienda "+fmtWhen(Math.floor(data.updated/1000))+"."+
    (data.stale?" El servidor se está reiniciando: son los últimos precios conocidos.":"");
}
/* ------------------------------------ primera vez: «¿Quieres crear una contraseña?» */

// Con Intro en cualquiera de los dos campos se guarda, igual que al entrar.
["newPw","newPwEmail"].forEach(id=>{
  const el=$(id);
  if(el)el.addEventListener("keydown",e=>{if(e.key==="Enter"&&$("savePw"))$("savePw").click();});
});

initPrecios();
syncStore();   // la tienda con los precios reales desde el primer momento
})();
