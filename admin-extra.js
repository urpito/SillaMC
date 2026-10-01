/* Panel de staff: estado del servidor, inicios de sesión y sanciones (vía SillaWeb).
   Se carga después del script del propio admin.html. */
(function(){
"use strict";

function fmtDate(ms){
  if(!ms)return "—";
  const d=new Date(ms);
  return d.toLocaleDateString("es-ES",{day:"numeric",month:"short"})+" "+d.toLocaleTimeString("es-ES",{hour:"2-digit",minute:"2-digit"});
}
function fmtUptime(s){
  const d=Math.floor(s/86400),h=Math.floor(s%86400/3600),m=Math.floor(s%3600/60);
  return (d?d+" d ":"")+h+" h "+m+" min";
}
function tpsClass(t){return t>=19?"is-plus":t>=15?"":"is-minus";}

/* ------------------------------------------------------------ estado */

async function loadEstado(){
  const box=$("estadoBox");
  if(!box)return;
  const {ok,data}=await api("/admin/panel/estado",{auth:true});
  if(!ok||!data.ok){box.innerHTML='<p class="finder__msg">SillaWeb no responde (¿servidor apagado o reiniciando?).</p>';return;}
  const tps=data.tps||[0,0,0];
  const ramPct=data.ramMaxMb?Math.round(data.ramUsedMb*100/data.ramMaxMb):0;
  box.innerHTML=`<div class="scbalance">
      <div class="scbalance__row"><span>TPS (1 · 5 · 15 min)</span><b><span class="${tpsClass(tps[0])}">${tps[0]}</span> · ${tps[1]} · ${tps[2]}</b></div>
      <div class="scbalance__row"><span>Milisegundos por tick</span><b>${data.mspt} ms</b></div>
      <div class="scbalance__row"><span>Memoria</span><b>${data.ramUsedMb} / ${data.ramMaxMb} MB (${ramPct} %)</b></div>
      <div class="scbalance__row"><span>Encendido desde hace</span><b>${fmtUptime(data.uptimeSec||0)}</b></div>
      <div class="scbalance__row"><span>Jugadores</span><b>${data.online} / ${data.max}</b></div>
    </div>
    <p class="admincard__hint">${(data.players||[]).length?"Conectados: "+data.players.map(escapeHtml).join(", "):"No hay nadie conectado."}</p>
    <div class="wllist">${(data.worlds||[]).map(w=>`<div class="wlrow"><span><b>${escapeHtml(w.name)}</b> — ${w.players} jugadores</span>`+
      `<code>${w.chunks} chunks · ${w.entities} entidades</code></div>`).join("")}</div>
    <p class="admincard__hint">${escapeHtml(data.version||"")}</p>`;
}

/* ------------------------------------------------------------ inicios de sesión */

async function loadLogins(){
  const box=$("loginsBox");
  if(!box)return;
  const {ok,data}=await api("/admin/panel/logins?limit=150",{auth:true});
  if(!ok||!data.ok){box.innerHTML='<p class="finder__msg">No se pudieron cargar.</p>';return;}
  if($("loginsFailed"))$("loginsFailed").textContent=data.failed24h||0;
  const rows=data.items||[];
  box.innerHTML=rows.length?rows.map(r=>`<div class="wlrow">
      <span>${r.ok?"✅":"❌"} <b>${escapeHtml(r.name||"?")}</b> · ${r.source==="web"?"web":"juego"} · ${fmtDate(r.t*1000)}</span>
      <span><code>${escapeHtml(r.ip||"?")}</code> ${r.ip?`<button class="btn btn--ghost" data-geo="${escapeHtml(r.ip)}">Ubicar</button>`:""}</span>
    </div>`).join(""):'<p class="finder__msg">Todavía no hay inicios de sesión registrados.</p>';
  box.querySelectorAll("[data-geo]").forEach(b=>b.addEventListener("click",async()=>{
    b.disabled=true;
    const res=await api("/admin/panel/geoip?ip="+encodeURIComponent(b.dataset.geo),{auth:true});
    const g=res.data||{};
    b.outerHTML=g.ok?`<small>${escapeHtml([g.city,g.region,g.country].filter(Boolean).join(", "))} · ${escapeHtml(g.isp||"")}${g.suspicious?" · ⚠ VPN o servidor":""}</small>`
      :"<small>"+(g.error==="private_ip"?"red local":"sin datos")+"</small>";
  }));
}

/* ------------------------------------------------------------ sanciones */

async function loadSanciones(){
  const box=$("sancionesBox"),log=$("sancionesLog");
  if(!box)return;
  const {ok,data}=await api("/admin/panel/sanciones",{auth:true});
  if(!ok||!data.ok){box.innerHTML='<p class="finder__msg">SillaWeb no responde.</p>';return;}
  const bans=data.bans||[],muted=data.muted||[];
  box.innerHTML=(bans.length||muted.length)?
    bans.map(b=>`<div class="wlrow"><span>⛔ <b>${escapeHtml(b.target)}</b> (${b.type==="ip"?"IP":"jugador"}) · ${escapeHtml(b.reason||"sin motivo")}`+
      ` · ${b.expires?"hasta "+fmtDate(b.expires):"permanente"}</span>`+
      `<button class="btn btn--ghost" data-undo="${b.type==="ip"?"unbanip":"unban"}" data-target="${escapeHtml(b.target)}">Quitar</button></div>`).join("")+
    muted.map(m=>`<div class="wlrow"><span>🔇 <b>${escapeHtml(m.target)}</b> silenciado${m.expires?" hasta "+fmtDate(m.expires):""}</span>`+
      `<button class="btn btn--ghost" data-undo="unmute" data-target="${escapeHtml(m.target)}">Quitar</button></div>`).join("")
    :'<p class="finder__msg">No hay nadie baneado ni silenciado.</p>';
  box.querySelectorAll("[data-undo]").forEach(b=>b.addEventListener("click",()=>sancionar(b.dataset.undo,b.dataset.target,"","")));
  if(log)log.innerHTML=(data.log||[]).length?data.log.map(l=>`<div class="wlrow"><span>${l.type==="alerta"?"🚨":"⚖️"} ${escapeHtml(l.text)}</span>`+
    `<code>${fmtDate(l.t*1000)}</code></div>`).join(""):'<p class="finder__msg">Sin movimientos todavía.</p>';
}

async function sancionar(action,target,duration,reason){
  if(!target)return toast("Pon el jugador o la IP.");
  const {ok,data}=await api("/admin/panel/sancion",{method:"POST",auth:true,body:{action,target,duration,reason}});
  const errors={bad_target:"Nombre o IP no válidos.",bad_duration:"Duración no válida (ej.: 30m, 12h, 7d).",
    bad_action:"Acción no válida.",unknown_player:"No conozco a ese jugador.",command_failed:"El servidor no aceptó el comando."};
  if(ok&&data.ok){toast("Hecho.");loadSanciones();}
  else toast(errors[data&&data.error]||"No se pudo aplicar.");
}

function bindForm(){
  const btn=$("sancionBtn");
  if(!btn||btn._bound)return;
  btn._bound=true;
  const actionSel=$("sancionAction"),dur=$("sancionDuration");
  const syncDur=()=>{const a=actionSel.value;dur.disabled=!(a==="tempban"||a==="mute");if(dur.disabled)dur.value="";};
  actionSel.addEventListener("change",syncDur);syncDur();
  btn.addEventListener("click",()=>{
    const action=actionSel.value,target=$("sancionTarget").value.trim(),reason=$("sancionReason").value.trim();
    if(action==="tempban"&&!dur.value.trim())return toast("Pon cuánto dura (ej.: 3d).");
    if(!confirm("¿Aplicar «"+actionSel.options[actionSel.selectedIndex].text+"» a "+target+"?"))return;
    sancionar(action,target,dur.value.trim(),reason);
  });
  if($("loginsRefresh"))$("loginsRefresh").addEventListener("click",loadLogins);
  if($("estadoRefresh"))$("estadoRefresh").addEventListener("click",loadEstado);
}

/* ------------------------------------------------------------ arranque */

function start(){
  bindForm();loadEstado();loadLogins();loadSanciones();
  setInterval(()=>{
    if(document.visibilityState!=="visible")return;
    if(adminSectionIsOpen("estado"))loadEstado();
    if(adminSectionIsOpen("logins"))loadLogins();
  },15000);
}
// El panel se muestra cuando adminInit() confirma el permiso: esperamos a ese momento.
const wait=setInterval(()=>{
  const body=$("adminBody");
  if(body&&body.style.display!=="none"){clearInterval(wait);start();}
},500);
})();
