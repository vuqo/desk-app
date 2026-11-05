// Desk app. Reads DATA_PATH from #d= (kept in localStorage only), polls public JSON.
const SUPA = "https://alxvekhevjrehedmgpek.supabase.co/storage/v1/object/public/desk/d/";
const SIGNUP = "https://fomo.family/r/savipww";
(function(){const h=new URLSearchParams(location.hash.slice(1).split("/")[0].includes("=")?location.hash.slice(1):"");
  if(h.get("d")){localStorage.setItem("dp",h.get("d"));const b=h.get("b");if(b&&b.startsWith("http://localhost"))localStorage.setItem("base",b);else localStorage.removeItem("base");history.replaceState(null,"",location.pathname+"#/"+(h.get("r")||"home"));}})();
const DP=()=>localStorage.getItem("dp"); const BASE=()=>(localStorage.getItem("base")||SUPA)+DP()+"/";
let S=null,A=null,C=null,ERR=null,coinCache={};
const $=s=>document.querySelector(s), esc=s=>String(s??"").replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const usd=v=>v==null?"—":"$"+Number(v).toLocaleString(undefined,{maximumFractionDigits:2,minimumFractionDigits:2});
const k=v=>v==null?"—":v>=1e6?(v/1e6).toFixed(1)+"M":v>=1e3?(v/1e3).toFixed(1)+"K":Number(v).toFixed(0);
const link=(name,url)=>`<a href="${esc(url||SIGNUP)}" target="_blank" rel="noopener">${esc(name)}</a>`;
async function get(p){const r=await fetch(BASE()+p+"?t="+Date.now(),{cache:"no-store"});if(!r.ok)throw new Error("HTTP "+r.status);return r.json();}
async function poll(){ if(!DP()){ERR="nolink";render();return;}
  try{[S,A,C]=await Promise.all([get("state.json"),get("activity.json"),get("chart.json")]);ERR=null;
    const m=location.hash.match(/#\/coin\/(\w+)/); if(m) coinCache[m[1]]=await get("coin/"+m[1]+".json").catch(()=>null);
  }catch(e){ERR=e.message} render();}
function route(){return (location.hash.match(/#\/(\w+)/)||[,"home"])[1]}
function render(){const r=route();document.querySelectorAll("nav a").forEach(a=>a.classList.toggle("on",a.dataset.t===r||(r==="auditor"&&a.dataset.t==="agents")||(r==="coin"&&a.dataset.t==="home")));
  const md=$("#mode"); if(S){md.textContent=S.mode;md.className="pill "+S.mode.toLowerCase();$("#upd").textContent="updated "+new Date(S.ts).toLocaleTimeString()}
  const v=$("#view");
  if(ERR==="nolink"){v.innerHTML=`<div class="card err empty"><b>No desk linked</b><br>Open the desk link from your chat once (it ends in #d=…). It is saved on this phone only.</div>`;return}
  if(ERR&&!S){v.innerHTML=`<div class="card err empty"><b>Can't reach the desk</b><br>${esc(ERR)}<br>Retrying every 15s.</div>`;return}
  if(!S){v.innerHTML=`<div class="empty">Loading…</div>`;return}
  const banner=ERR?`<div class="card err">Last refresh failed (${esc(ERR)}). Showing data from ${new Date(S.ts).toLocaleTimeString()}.</div>`:"";
  v.innerHTML=banner+({home,agents,auditor,coin,activity,account}[r]||home)();}
function chart(){const pts=(C&&C.points)||[];if(!pts.length)return`<div class="muted">No closed trades yet tonight.</div>`;
  const vals=[0,...pts.map(p=>p.v)],mn=Math.min(...vals),mx=Math.max(...vals),W=340,H=90,sx=i=>i*W/(vals.length-1||1),sy=v=>H-(v-mn)/((mx-mn)||1)*H;
  return `<svg viewBox="0 0 ${W} ${H}" width="100%"><polyline fill="none" stroke="${vals.at(-1)>=0?'#2fd27a':'#ff5468'}" stroke-width="2" points="${vals.map((v,i)=>sx(i)+","+sy(v)).join(" ")}"/></svg>`}
function home(){const open=S.positions.filter(p=>p.status==="open"||p.status==="exiting");
  return `<div class="card"><h3>${S.mode==="PAPER"?"PAPER balance":"Stack"}</h3><div class="big">${usd(S.stack)}</div>
  <div class="${S.pnl_today>=0?'g':'rd'}">${S.pnl_today>=0?"+":""}${usd(S.pnl_today)} tonight</div>${chart()}</div>
  <div class="card"><h3>Open positions</h3>${open.length?open.map(p=>`<div class="row"><div><a href="#/coin/${p.mint}">${esc(p.name)}</a><div class="muted">${usd(p.size_usd)} · stop -${p.stop_pct}%</div></div><div class="r"><a class="btn" href="${esc(p.link)}" target="_blank">Sell on FOMO</a></div></div>`).join(""):`<div class="empty">Nothing open. Risk is idle.</div>`}</div>
  <div class="card"><h3>Pipeline</h3><div class="row"><span>Scanner</span><span>${S.scanner.pools} pools · ${S.scanner.waiting} waiting</span></div><div class="row"><span>Auditor</span><span>${S.auditor.taken} taken apart · ${S.auditor.rejected} rejected</span></div><div class="row"><span>Analyst</span><span>${S.analyst.scored} scored</span></div><div class="row"><span>Executor</span><span>${S.executor.trades} trades</span></div></div>`}
function strips(layers){return `<div class="strips">${[1,2,3,4,5,6,7,8].map(n=>{const l=(layers||[]).find(x=>x.n===n);return`<div class="strip ${!l?'':l.pass===true?'ok':l.pass===false?'bad':''}"></div>`}).join("")}</div>`}
function ring(score,pass){const r=34,c=2*Math.PI*r,f=(score||0)/100;return`<svg class="ring" width="90" height="90"><circle cx="45" cy="45" r="${r}" stroke="#2a3140" stroke-width="8" fill="none"/><circle cx="45" cy="45" r="${r}" stroke="${score>=(S.settings['analyst.min_score'])?'#2fd27a':'#ff9f3a'}" stroke-width="8" fill="none" stroke-dasharray="${c*f} ${c}" transform="rotate(-90 45 45)"/><text x="45" y="50" text-anchor="middle" style="fill:#e8ecf3;font-size:20px;font-weight:700">${score??"–"}</text></svg>`}
function dot(a){const s=S.agents[a]||{};return`<span class="pill ${s.paused?'':s.alive?'green':'red'}">${s.paused?"paused":s.alive?"live":"down"}</span>`}
function agents(){const au=S.auditor.live,an=S.analyst.live,ex=S.executor.live;
 return `<div class="card"><h3>1 · Scanner ${dot("scanner")}</h3><div class="big">${S.scanner.pools} pools</div>${S.scanner.feed.length?S.scanner.feed.slice(0,12).map(f=>f.verdict==="pass"?`<div class="row"><span>${link(f.name||f.mint.slice(0,6),f.link)}</span><span class="r g">liq $${k(f.liq)} · → auditor</span></div>`:`<div class="row kill"><span class="n">${esc(f.name||f.mint.slice(0,6))}</span><span class="r rd">${esc(f.reason)}</span></div>`).join(""):`<div class="empty">Waiting for the first graduation…</div>`}</div>
 <div class="card"><h3>2 · Auditor ${dot("auditor")}</h3><a href="#/auditor"><div class="big">${S.auditor.taken} taken apart</div></a>${au?`<div>${link(au.name||au.mint.slice(0,6),S.auditor.recent.find(x=>x.mint===au.mint)?.link)}</div>${strips(au.layers)}<div>${au.running?"taking apart...":au.passed?"8/8 → Analyst":`<span class="rd">${esc(au.reason)}</span>`}</div>`:`<div class="muted">idle</div>`}<div class="muted">${S.auditor.rejected} rejected</div></div>
 <div class="card"><h3>3 · Analyst ${S.analyst.mode==="rules"?"(rules)":""} ${dot("analyst")}</h3><div>Scoring</div>${ring(an?.score)}${an?`<div style="text-align:center">${esc(an.name)} · ${an.passed?'<span class="g">pass</span>':'<span class="rd">reject</span>'}</div>`:""}</div>
 <div class="card"><h3>4 · Executor ${dot("executor")}</h3><div class="big">${S.executor.trades} trades</div>${ex?`<div>${usd(ex.size)} · ${ex.pct.toFixed(1)}% of stack</div><div class="bar"><i style="width:100%"></i></div><div class="g">✓ Filled</div>`:`<div class="muted">${S.executor.stack_pct}% of stack per ticket</div>`}</div>
 <div class="card"><h3>5 · Risk ${dot("risk")}</h3><div class="big">${S.risk.guarding?"Guarding":"Idle"}</div><div class="muted">last exit: ${esc(S.risk.last_exit||"—")}</div><span class="pill red">stop -${S.risk.stop_pct}%</span> <span class="pill green">trail ${S.risk.trail_pct}%</span></div>`}
function auditor(){const au=S.auditor.live;const rec=S.auditor.recent;
 if(!au&&!rec.length)return`<div class="card empty">Auditor hasn't taken a coin apart yet tonight.</div>`;
 const a=au||rec[0];const L=a.layers||[];
 return `<div class="card"><h3>Auditor</h3><div class="big">${esc(a.name||core(a.mint))}</div><svg class="disc" viewBox="-110 -110 220 220">${[0,1,2,3,4,5,6,7].map(i=>{const l=L.find(x=>x.n===i+1),col=!l?'#2a3140':l.pass===true?'#2fd27a':l.pass===false?'#ff5468':'#2a3140';const a0=i*Math.PI/4-Math.PI/2+.05,a1=a0+Math.PI/4-.1;return`<path d="M${95*Math.cos(a0)} ${95*Math.sin(a0)} A95 95 0 0 1 ${95*Math.cos(a1)} ${95*Math.sin(a1)}" stroke="${col}" stroke-width="16" fill="none"/>`}).join("")}<text text-anchor="middle" y="6" style="font-size:22px;fill:#e8ecf3">${L.filter(l=>l.pass).length}/8</text></svg>
 ${[1,2,3,4,5,6,7,8].map(n=>{const l=L.find(x=>x.n===n)||{n,name:"",value:"not checked"};return`<div class="layer"><div class="dot ${l.pass===true?'ok':l.pass===false?'bad':''}">${l.pass===true?'✓':l.pass===false?'✕':n}</div><div style="flex:1">${esc(l.name)}</div><div class="${l.pass===false?'rd':l.pass?'':'muted'}">${esc(l.value)}</div></div>`}).join("")}</div>
 <div class="card"><h3>Recent</h3>${rec.map(r=>`<div class="row"><span>${link(r.mint.slice(0,6),r.link)} <a href="#/coin/${r.mint}" class="muted">chart</a></span><span class="r ${r.passed?'g':'rd'}">${esc(r.passed?"8/8":r.reason)}</span></div>`).join("")}</div>`}
function core(m){return (m||"").slice(0,6)}
function coin(){const m=(location.hash.match(/#\/coin\/(\w+)/)||[])[1];const d=coinCache[m];
 if(!d)return`<div class="card empty">No data for this coin yet.<br><a href="#/home">Back</a></div>`;
 const pr=d.prices||[],pos=(d.positions||[])[0];let svg=`<div class="muted">No candles yet.</div>`;
 if(pr.length>1){const W=340,H=160,ps=pr.map(p=>p.price),line=pos&&pos.exit_line,all=line?[...ps,line,pos.entry_price]:ps,mn=Math.min(...all),mx=Math.max(...all),sy=v=>H-(v-mn)/((mx-mn)||1)*H,sx=i=>i*W/(ps.length-1);
  svg=`<svg viewBox="0 0 ${W} ${H}" width="100%"><polyline fill="none" stroke="#36d6ff" stroke-width="2" points="${ps.map((v,i)=>sx(i)+","+sy(v)).join(" ")}"/>${line?`<line x1="0" x2="${W}" y1="${sy(line)}" y2="${sy(line)}" stroke="#ff9f3a" stroke-dasharray="6 4"/><text x="4" y="${sy(line)-4}" style="fill:#ff9f3a">Risk trailing stop</text>`:""}</svg>`}
 const c=d.coin||{};return `<div class="card"><h3>${esc(c.symbol||"")}</h3><div class="big">${esc(c.name||core(m))}</div>${svg}<a class="btn" href="${esc(d.link)}" target="_blank">${pos&&pos.status!=="closed"?"Sell on FOMO":"Open on FOMO"}</a></div>
 <div class="card"><h3>Facts</h3><div class="row"><span>Holders</span><span>${c.holders??"—"}</span></div><div class="row"><span>Audit</span><span>${d.audit?(d.audit.passed?"8/8":esc(d.audit.reason)):"—"}</span></div><div class="row"><span>Score</span><span>${d.analysis?d.analysis.score:"—"}</span></div>${pos?`<div class="row"><span>Entry</span><span>${pos.entry_price}</span></div><div class="row"><span>Stop</span><span>-${pos.stop_pct}%</span></div>`:""}</div>`}
function activity(){const it=(A&&A.items)||[];if(!it.length)return`<div class="card empty">No activity yet tonight.</div>`;
 return `<div class="card"><h3>Activity</h3>${it.map(a=>`<div class="row"><div>${a.mint?link(a.title,a.link):esc(a.title)}<div class="muted">${esc(a.sub)}</div></div><div class="r ${a.kind==='reject'?'muted':a.kind==='stop'?'rd':'g'}">${esc(a.value)}</div></div>`).join("")}</div>`}
function account(){const s=S.settings,sp=S.spec;
 return `<div class="card"><h3>FOMO</h3><div class="row"><span>Account</span>${link("@"+s["desk.fomo_handle"],S.profile_url)}</div><div class="row"><span>Invite</span>${link("Share invite",S.signup_url)}</div></div>
 <div class="card"><h3>Desk</h3><div class="row"><span>Mode</span><span>${S.mode}</span></div><div class="row"><span>Alerts</span><span>${esc(S.notifier)}</span></div><div class="row"><span>Web push</span><span class="muted">not available in plan B</span></div><div class="row"><span>Edit settings</span><span class="muted">tell Grok Bot, e.g. "set stop to -8%"</span></div></div>
 ${["scanner","auditor","analyst","executor","risk","desk"].map(g=>`<div class="card"><h3>${g}</h3>${Object.keys(s).filter(x=>x.startsWith(g+".")).map(x=>{const v=s[x],r=sp[x];return`<div class="set"><label><span>${x.split(".")[1]}</span><b>${esc(v)}</b></label>${typeof v==="number"&&r[0]!=null?`<input type="range" min="${r[0]}" max="${r[1]}" step="any" value="${v}" disabled>`:""}</div>`}).join("")}</div>`).join("")}
 <div class="card muted">New to FOMO? ${link(S.signup_url,S.signup_url)}</div>`}
addEventListener("hashchange",()=>{render();poll()});poll();setInterval(poll,15000);
