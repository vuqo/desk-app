/* v21 · FOMO Desk Terminal: the Home view as a live terminal dashboard.
   Uses only the desk's published JSON (state/activity/chart). Missing values show "—". */
(function(){
const T={built:0,chips:{},logSeen:{},tailKey:"",lastFilt:"",num:{},W:0,logMode:localStorage.getItem("tlog")||"all"};
const D="—";
const S_=()=>S, num=v=>v!=null&&isFinite(+v);
const fx=(v,d=2)=>num(v)?Number(v).toLocaleString("en-US",{minimumFractionDigits:d,maximumFractionDigits:d}):D;
const money=v=>num(v)?(v<0?"-$":"$")+fx(Math.abs(v)):D;
const smoney=v=>num(v)?(v>=0?"+$":"-$")+fx(Math.abs(v)):D;
const price=v=>{if(!num(v))return D;v=+v;return v>=1?v.toFixed(4):v>=0.001?v.toFixed(6):v.toPrecision(4)};
const hm=t=>{const d=new Date(t);return isNaN(d)?"--:--":String(d.getHours()).padStart(2,"0")+":"+String(d.getMinutes()).padStart(2,"0")};
const ago=s=>!num(s)?D:s<60?Math.round(s)+"s":s<3600?Math.round(s/60)+"m":s<86400?Math.floor(s/3600)+"h":Math.floor(s/86400)+"d";
const up=s=>String(s??"").toUpperCase();
const set=(id,html)=>{const e=document.getElementById(id);if(e&&e.innerHTML!==html)e.innerHTML=html;return e};
const txt=(id,t)=>{const e=document.getElementById(id);if(e&&e.textContent!==t)e.textContent=t;return e};

const IC={
 scanner:'<path d="M4 8V5a1 1 0 0 1 1-1h3M16 4h3a1 1 0 0 1 1 1v3M20 16v3a1 1 0 0 1-1 1h-3M8 20H5a1 1 0 0 1-1-1v-3M8 12h8"/>',
 auditor:'<path d="M12 4 21 19H3z"/><path d="M12 10v4M12 16.5v.5"/>',
 researcher:'<circle cx="11" cy="11" r="6"/><path d="m16 16 4 4"/>',
 analyst:'<path d="M12 3 20 12 12 21 4 12z"/><path d="M12 8v8"/>',
 executor:'<rect x="4" y="5" width="16" height="14" rx="4"/><path d="M10 10v4M14 10v4"/>',
 risk:'<path d="M12 3 19 6v6c0 4-3 7-7 9-4-2-7-5-7-9V6z"/>',
 publisher:'<path d="M5 6h14M5 10h14M5 14h9M5 18h6"/>',
 signals:'<path d="M3 12h4l3-7 4 14 3-7h4"/>'};
const ico=k=>`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${IC[k]||IC.signals}</svg>`;
const SIG=["dip","breakout","copy","kol","trending","incubator","fomo_scan"];
function agDefs(){const st=S.settings||{},g=k=>st[k];
 return[
 {k:"scanner",n:"SCANNER",role:"new pairs + volume spikes",tag:"flags only, never trades",c:"o",on:"SCAN"},
 {k:"auditor",n:"RUG CHECK",role:"filters suspicious tokens",tag:"nothing executes before a pass",c:"pk",on:"CHECK"},
 {k:"researcher",n:"RESEARCH",role:"socials + website check",tag:"adds context, never trades",c:"cy",on:"READ"},
 {k:"analyst",n:"ANALYST",role:"scores every setup",tag:num(g("analyst.min_score"))?`buys only at score ≥ ${g("analyst.min_score")}`:"buys only above the score bar",c:"lv",on:"SCORE"},
 {k:"executor",n:"EXECUTOR",role:"opens + closes paper trades",tag:num(g("executor.fixed_ticket_usd"))?`fixed $${g("executor.fixed_ticket_usd")} ticket · paper`:"paper tickets only",c:"g",on:"LIVE"},
 {k:"risk",n:"RISK",role:"stops, trails, take-profit",tag:num(g("risk.stop_pct"))?`stop -${g("risk.stop_pct")}% · trail ${g("risk.trail_pct")??D}%`:"guards every open trade",c:"r",on:"GUARD",alt:"exits"},
 {k:"publisher",n:"LOGGER",role:"writes every decision",tag:"no trade without a reason",c:"o",on:"WRITE"},
 {k:"signals",n:"SIGNALS",role:"dip · breakout · copy · kol · trending",tag:"feeds the rug check",c:"b",on:"FLAG",multi:SIG}]}
function agState(d){const A=S.agents||{};let a=A[d.k];
 if(d.alt&&A[d.alt]&&(!a||(A[d.alt].act_age??1e9)<(a.act_age??1e9)))a=Object.assign({},a,{doing:A[d.alt].doing,act_age:A[d.alt].act_age,status:a&&a.status==="working"?"working":A[d.alt].status});
 if(d.multi){const xs=d.multi.map(k=>A[k]&&Object.assign({k},A[k])).filter(Boolean);if(!xs.length)return null;
  const best=xs.slice().sort((p,q)=>(p.act_age??1e9)-(q.act_age??1e9))[0];
  return{alive:xs.some(x=>x.alive),paused:xs.every(x=>x.paused),status:xs.some(x=>x.status==="working")?"working":best.status,doing:best.doing?`${best.k.replace("_"," ")}: ${best.doing}`:null,act_age:best.act_age,ok:best.ok,subs:xs}}
 return a||null}
function pillOf(d,a){if(!a)return["—","mu"];if(a.alive===false)return["DOWN","r"];if(a.paused)return["PAUSED","o"];
 if(a.status==="working")return[d.on,d.c];if(a.status==="idle")return["IDLE","mu"];return[up(a.status||D),"mu"]}
function hot(a){return a&&a.alive!==false&&!a.paused&&a.status==="working"&&num(a.act_age)&&a.act_age<90}

/* ---------- build once ---------- */
function shell(){return`<div class="term" id="term">
<section class="t-card t-head" style="grid-area:head">
 <div class="th-l">
  <a class="th-av" href="#/account" aria-label="Account"><i></i><i></i></a>
  <div class="th-id">
   <div class="th-ttl"><b>FOMO Desk</b> Terminal <span class="tp tp-v">v21</span><span class="tp tp-p" id="tPaper">paper</span></div>
   <div class="th-run"><span class="pdot" id="tDot"></span><span id="tRun">running · --:--:--</span></div>
   <div class="th-st"><span class="tp tp-s" id="tStat">—</span></div>
   <div class="th-tag">every trade gets a reason <span id="tUpd" class="th-upd"></span></div>
  </div>
 </div>
 <div class="th-r">
  <div class="th-n th-bal"><b id="nBal">—</b><span>balance <em id="tToday"></em></span></div>
  <div class="th-n"><b id="nTr" class="mu2">—</b><span>trades</span></div>
  <div class="th-n"><b id="nW" class="g">—</b><span>wins</span></div>
  <div class="th-n"><b id="nL" class="pk">—</b><span>losses</span></div>
  <button class="t-btn" id="tPause" type="button">—</button>
 </div>
</section>
<aside class="t-agents" style="grid-area:agents"><div class="t-h"><span>AGENTS</span><span id="tOnline">—</span></div><div class="ag-list" id="tAg"></div></aside>
<section class="t-card t-flow" style="grid-area:flow">
 <div class="t-h"><span>LIVE FLOW · SCAN → CHECK → SIZE → EXEC → LOG</span><span id="tChecked">—</span></div>
 <div class="fl-chips" id="tChips"></div>
 <div class="fl-stage" id="tStage"><svg id="tSvg"></svg>
  <div class="fl-node rug" id="tRug"><div class="nd"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linejoin="round" stroke-linecap="round"><path d="M12 4 21 19H3z"/><path d="M12 10v4M12 16.5v.5"/></svg></div><b>RUG CHECK</b><span id="tRugS">—</span></div>
  <div class="fl-node ex" id="tEx"><div class="nd"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><rect x="4" y="5" width="16" height="14" rx="4"/><path d="M10 10v4M14 10v4"/></svg></div><b>EXECUTOR</b><span id="tExS">—</span></div>
  <div class="fl-tag" id="tFilt" hidden></div>
  <div class="fl-pnl" id="tPnl"></div>
 </div>
 <div class="fl-tiles">
  <div class="tile pk"><div class="tl">▲ FILTERED</div><b id="kF">—</b><span id="kF2">—</span></div>
  <div class="tile lv"><div class="tl">◆ SIZER</div><b id="kS">—</b><span id="kS2">—</span></div>
  <div class="tile o"><div class="tl">≡ LOGGER</div><b id="kL">—</b><span>each with a reason</span></div>
  <div class="tile b"><div class="tl">◎ EQUITY</div><b id="kE">—</b><span>last close</span></div>
 </div>
</section>
<section class="t-card t-trade" style="grid-area:trade" id="tTrade"></section>
<section class="t-card t-tail" style="grid-area:tail"><div class="t-h tl-h"><span>$ tail -f night.log</span><span id="tLines">—</span></div><div class="tail" id="tTail"></div></section>
<section class="t-card t-res" style="grid-area:res" id="tRes"></section>
<section class="t-card t-log" style="grid-area:log">
 <div class="t-h"><span>LOG</span><span class="lg-seg"><a href="#" data-m="all">all</a><a href="#" data-m="trades">trades</a><a href="#/activity">activity ›</a></span></div>
 <div class="tlg" id="tLog"></div>
</section>
</div>`}

/* ---------- number tick-up ---------- */
function tick(id,val,fmt,cls){const e=document.getElementById(id);if(!e)return;if(!num(val)){e.textContent=D;T.num[id]=null;return}
 const from=T.num[id];T.num[id]=+val;if(cls)e.className=cls;
 if(RM||from==null||from===+val){e.textContent=fmt(+val);return}
 e.classList.remove("bump");void e.offsetWidth;e.classList.add("bump");
 const t0=performance.now(),dur=900;cancelAnimationFrame(e._r);
 const step=t=>{const k=Math.min(1,(t-t0)/dur),q=1-Math.pow(1-k,3);e.textContent=fmt(from+(val-from)*q);if(k<1)e._r=requestAnimationFrame(step)};e._r=requestAnimationFrame(step)}

/* ---------- header ---------- */
function startTs(){return S.desk_started||(S.last_restart&&S.last_restart.ts)||null}
function headerUpd(){const st=S.stats||{};
 tick("nBal",S.stack,v=>"$"+fx(v));tick("nTr",st.trades,v=>String(Math.round(v)));tick("nW",st.wins,v=>String(Math.round(v)));tick("nL",st.losses,v=>String(Math.round(v)));
 const td=S.pnl_today;const te=document.getElementById("tToday");if(te){te.textContent=num(td)?`· today ${smoney(td)}`:"";te.className=num(td)?(td>=0?"g":"pk"):""}
 txt("tPaper",String(S.mode||"paper").toLowerCase());
 const tk=(S.agent_ticker||[])[0],L={scanner:"SCANNER",auditor:"RUG CHECK",researcher:"RESEARCH",analyst:"ANALYST",executor:"EXECUTOR",risk:"RISK",exits:"RISK",publisher:"LOGGER"};
 const se=txt("tStat",tk?`${L[tk.a]||up(String(tk.a).replace("_"," "))} · ${up(tk.txt)}`:"WAITING FOR FIRST ACTION");
 if(se){const c=tk?(tk.ok===0?"pk":tk.ok===1?"g":"mu"):"mu";se.className="tp tp-s "+c;if(T.statKey!==(tk&&tk.t+tk.txt)){T.statKey=tk&&tk.t+tk.txt;se.classList.remove("pop");void se.offsetWidth;se.classList.add("pop")}}
 const pb=document.getElementById("tPause");if(pb){const p=!!S.trading_paused;pb.textContent=p?"▶ resume":"⏸ pause";pb.classList.toggle("on",p);pb.setAttribute("aria-pressed",p)}
 clock()}
function clock(){if(!S)return;const age=Math.max(0,Math.round((Date.now()-(+new Date(S.ts)||LAST))/1000)),stale=age>90,p=!!S.trading_paused;
 const s0=+new Date(startTs());let el=D;if(s0){let d=Math.max(0,Math.floor((Date.now()-s0)/1000));const h=Math.floor(d/3600),m=Math.floor(d%3600/60),s=d%60;el=`${String(h).padStart(2,"0")}:${String(m).padStart(2,"0")}:${String(s).padStart(2,"0")}`}
 txt("tRun",stale?`offline · last data ${ago(age)} ago`:p?`paused entries · ${el}`:`running · ${el}`);
 const dot=document.getElementById("tDot");if(dot)dot.className="pdot "+(stale?"r":p?"o":"g");
 txt("tUpd",`· updated ${ago(age)} ago`);
 const cur=document.getElementById("tCur");if(cur){const n=new Date();cur.textContent=n.toTimeString().slice(0,8)}}

/* ---------- agents ---------- */
function agentsUpd(){const box=document.getElementById("tAg");if(!box)return;const defs=agDefs(),A=S.agents||{};
 const all=Object.values(A);txt("tOnline",all.length?`${all.filter(a=>a.alive!==false).length} online`:D);
 if(!box.children.length)box.innerHTML=defs.map(d=>`<div class="agc c-${d.c}" id="ag-${d.k}"><div class="agi">${ico(d.k)}</div><div class="agm"><div class="agt"><b>${d.n}</b><span class="tp" data-p></span></div><div class="agr">${d.role}</div><div class="agg" data-g></div><div class="agd" data-d></div></div></div>`).join("");
 for(const d of defs){const el=document.getElementById("ag-"+d.k);if(!el)continue;const a=agState(d),[pl,pc]=pillOf(d,a);
  const p=el.querySelector("[data-p]");if(p.textContent!==pl){p.textContent=pl;p.className="tp c-"+pc+(pc==="mu"?"":" pf")}
  const g=el.querySelector("[data-g]");if(g.textContent!==d.tag)g.textContent=d.tag;
  let det=a&&a.doing?a.doing:D;const cn=a&&!d.multi&&typeof lvCounts==="function"?lvCounts(d.k,a):"";
  const dd=el.querySelector("[data-d]"),h=`<span class="${a&&a.ok===0?"pk":a&&a.ok===1?"g":""}">${esc(det)}</span>${a&&num(a.act_age)?` <i>· ${ago(a.act_age)}</i>`:""}${cn?` <i>· 15m ${esc(cn)}</i>`:""}`;
  if(dd.innerHTML!==h){dd.innerHTML=h;if(T.built>1&&!RM){dd.classList.remove("flash");void dd.offsetWidth;dd.classList.add("flash")}}
  el.classList.toggle("hot",hot(a));el.classList.toggle("down",!!a&&a.alive===false)}}

/* ---------- flow ---------- */
function lastStage(e){const s=e.st||[];return s[s.length-1]||[]}
function chipsUpd(){const box=document.getElementById("tChips");if(!box)return;const n=innerWidth<560?2:4,ev=(S.pipeline||[]).slice(0,n);
 if(!ev.length){box.innerHTML=`<div class="tchip0">waiting for coins…</div>`;return}
 const keys=ev.map(e=>e.k+"|"+(e.st||[]).length+"|"+e.done).join(",");if(keys===T.chipKeys&&box.children.length===ev.length)return;T.chipKeys=keys;
 box.style.gridTemplateColumns=`repeat(${n},1fr)`;
 box.innerHTML=ev.map(e=>{const ls=lastStage(e),ok=ls[1],fresh=!T.chips[e.k];T.chips[e.k]=1;const stg=up(ls[0]||"scan"),c=e.done?(ok?"g":"pk"):"o";
  return`<div class="tchip t${c}${fresh&&T.built>1?" in":""}"><div class="ch1"><b>$${esc(e.sym||"?")}</b><i class="tcd ${c}"></i></div><div class="ch2">${esc(stg)} · ${esc(ls[2]||(e.done?(ok?"passed":"rejected"):"in flight"))}</div></div>`}).join("")}
function rugInfo(){const L=S.auditor&&S.auditor.live;if(!L){const a=(S.agents||{}).auditor;if(!a||!a.doing)return null;const m=String(a.doing).match(/^(\w+)\s+\$?([^\s:]+)/);return m?{name:m[2],v:a.ok===0?"fail":a.ok===1?"pass":m[1],why:""}:null}const ly=L.layers||[];const fail=ly.find(x=>x.pass===false);const pend=ly.some(x=>x.pass==null);
 return{name:L.name||D,v:fail?"fail":pend?"checking":"pass",why:fail?fail.value:""}}
function stageUpd(force){const st=document.getElementById("tStage"),svg=document.getElementById("tSvg");if(!st||!svg)return;
 const W=st.clientWidth,H=st.clientHeight;if(!W)return;const n=innerWidth<560?2:4;
 const rx=Math.round(W*.2),ex=Math.round(W*.8),ny=Math.round(H*.55),r=Math.min(30,W*.07);
 const pts=((C&&C.points)||[]).slice(-60).map(p=>+p.v).filter(v=>isFinite(v));
 const sx0=W*.34,sx1=W*.66,sy0=H*.14,sy1=H*.44;let spark="",last=null,lp=null;
 if(pts.length>1){const mn=Math.min(...pts),mx=Math.max(...pts),rg=(mx-mn)||1;const P=pts.map((v,i)=>[sx0+(sx1-sx0)*i/(pts.length-1),sy1-(sy1-sy0)*(v-mn)/rg]);
  const d=P.map((p,i)=>(i?"L":"M")+p[0].toFixed(1)+","+p[1].toFixed(1)).join("");last=pts[pts.length-1];lp=P[P.length-1];const up_=last>=pts[0];
  spark=`<path d="${d}L${sx1},${sy1+6}L${sx0},${sy1+6}Z" fill="url(#tg)" opacity=".35"/><path class="spk" d="${d}" fill="none" stroke="${up_?"var(--tg)":"var(--tpk)"}" stroke-width="1.6"/><circle cx="${lp[0]}" cy="${lp[1]}" r="2.6" fill="${up_?"var(--tg)":"var(--tpk)"}" class="spd"/>`}
 const path=`M${rx+r+4},${ny+6} C${W*.4},${ny+r+38} ${W*.6},${ny+r+38} ${ex-r-4},${ny+6}`;
 const lines=Array.from({length:Math.min(n,(S.pipeline||[]).length)},(_,i)=>`<path d="M${(i+.5)*W/n},0 Q${(i+.5)*W/n},${ny-r-20} ${rx},${ny-r-4}" class="cl"/>`).join("");
 const exHot=hot((S.agents||{}).executor);
 svg.setAttribute("viewBox",`0 0 ${W} ${H}`);
 const html=`<defs><linearGradient id="tg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="var(--tg)"/><stop offset="1" stop-color="var(--tg)" stop-opacity="0"/></linearGradient></defs>${lines}${spark}<path id="tPath" d="${path}" class="dp"/>
 <text x="${W/2}" y="${ny+r+34}" text-anchor="middle" class="pl">pass + size → enter</text>${RM?"":`<circle r="3" class="tok${exHot?" hot":""}"><animateMotion dur="2.6s" repeatCount="indefinite" path="${path}"/></circle>`}`;
 const sig=W+"|"+H+"|"+html.length+"|"+(pts.slice(-1)[0])+"|"+exHot;if(force||sig!==T.svgSig){T.svgSig=sig;svg.innerHTML=html}
 const rug=document.getElementById("tRug"),exn=document.getElementById("tEx");
 rug.style.left=rx+"px";rug.style.top=ny+"px";exn.style.left=ex+"px";exn.style.top=ny+"px";
 const ri=rugInfo();set("tRugS",ri?`<span class="${ri.v==="fail"?"pk":ri.v==="pass"?"g":"o"}">${ri.v} $${esc(String(ri.name).slice(0,12))}</span>`:D);
 rug.classList.toggle("hot",hot((S.agents||{}).auditor));exn.classList.toggle("hot",exHot);
 const open=(S.positions||[]).filter(p=>p.status==="open"||p.status==="exiting");
 set("tExS",open.length?`<span class="g">live $${esc((open[0].symbol||open[0].name||"?").slice(0,12))}${open.length>1?" +"+(open.length-1):""}</span>`:"flat");
 const pn=document.getElementById("tPnl");if(pn){if(last!=null&&lp){pn.hidden=false;pn.style.left=Math.min(W-70,lp[0]+6)+"px";pn.style.top=Math.max(0,lp[1]-18)+"px";pn.textContent=smoney(last);pn.className="fl-pnl "+(last>=0?"g":"pk")}else pn.hidden=true}
 // FILTERED / PASSED tag from the newest finished decision
 const fe=(S.pipeline||[]).find(e=>e.done||(e.st||[]).some(s=>s[1]===0));const tg=document.getElementById("tFilt");
 if(tg){if(!fe){tg.hidden=true}else{const ls=lastStage(fe),bad=ls[1]===0,k=fe.k+"|"+bad;
   tg.hidden=false;tg.style.left=Math.max(4,rx-r-6)+"px";tg.style.top=Math.max(2,ny-r-58)+"px";
   const h=`<b>${bad?"FILTERED":"PASSED"}</b><span>$${esc(fe.sym||"?")} · ${esc(up(ls[0]||""))}${ls[2]?": "+esc(ls[2]):""}</span>`;
   if(tg.innerHTML!==h)tg.innerHTML=h;tg.className="fl-tag "+(bad?"pk":"g");if(k!==T.lastFilt){T.lastFilt=k;if(T.built>1&&!RM){tg.classList.add("pop");setTimeout(()=>tg.classList.remove("pop"),900)}}}}
 txt("tChecked",num(S.scanner&&S.scanner.pools)?`scanned ${S.scanner.pools} pools`:D)}
function tilesUpd(){const au=S.auditor||{},st=S.settings||{},AI=(A&&A.items)||[];
 tick("kF",au.rejected,v=>String(Math.round(v)));txt("kF2",num(au.taken)?`of ${au.taken} checked`:D);
 const tk=st["executor.fixed_ticket_usd"];txt("kS",num(tk)?`$${tk}`:D);txt("kS2",num(tk)&&num(S.stack)&&S.stack>0?`${(100*tk/S.stack).toFixed(1)}% of balance`:D);
 const top=AI[0];txt("kL",top&&num(top.id)?`line #${top.id}`:D);
 const cl=(S.positions||[]).filter(p=>p.status==="closed"&&num(p.pnl_usd)).sort((a,b)=>(b.closed_at||0)-(a.closed_at||0))[0];
 tick("kE",cl?cl.pnl_usd:null,smoney,cl?(cl.pnl_usd>=0?"g":"pk"):"")}

/* ---------- trade card ---------- */
function tradeUpd(){const el=document.getElementById("tTrade");if(!el)return;const ps=S.positions||[];
 const open=ps.filter(p=>p.status==="open"||p.status==="exiting"),p=open[0]||ps.slice().sort((a,b)=>(b.closed_at||b.opened_at||0)-(a.closed_at||a.opened_at||0))[0];
 if(!p){set("tTrade",`<div class="t-h"><span>TRADE · ENTRY vs EXIT</span><span class="tp c-mu">FLAT</span></div><div class="tr-e">No paper trades yet. The executor waits for a pass from rug check and the analyst.</div>`);return}
 const isO=p.status!=="closed",pc=num(p.live_pct)?+p.live_pct:p.pct,pnl=num(p.live_pnl)?p.live_pnl:p.pnl_usd,sym=p.symbol||p.name||"?";
 const rs=[["entry",price(p.entry_price)],["exit",isO?'<span class="g">open</span>':price(p.exit_price)],["pnl",`<span class="${pnl>=0?"g":"pk"}">${smoney(pnl)}</span>`],["size",num(p.size_usd)?money(p.size_usd)+(num(p.orig_size)?` <i>of ${money(p.orig_size)}</i>`:""):D],["fees",num(p.fees_usd)?money(p.fees_usd):D],["held",num(p.held_s)?heldTxt(p.held_s):D]];
 const reason=`<div class="tr-r"><span>reason:</span> ${p.source?esc(p.source)+" signal":D}${num(p.stop_pct)?` · stop -${p.stop_pct}%`:""}<br><span>exit:</span> ${isO?(p.exit_status?esc(p.exit_status):"waiting"):esc(p.exit_reason||p.exit_status||D)}</div>`;
 set("tTrade",`<div class="t-h"><span>TRADE · ENTRY vs EXIT</span><span class="tp ${isO?"c-g pf":"c-mu"}">${isO?"OPEN":"CLOSED"}</span></div>
 <div class="tr-top"><a class="tr-sym" href="#/coin/${esc(p.mint)}">$${esc(sym.slice(0,14))}</a><span class="tp c-g">LONG</span><b class="tr-pc ${pc>=0?"g":"pk"}">${num(pc)?(pc>=0?"+":"")+(+pc).toFixed(2)+"%":D}${isO?' <i>live</i>':""}</b></div>
 <div class="tr-rows">${rs.map(r=>`<div><span>${r[0]}</span><b>${r[1]}</b></div>`).join("")}</div>${reason}
 ${p.link?`<div class="tr-l">${ext(p.link,"open on FOMO ↗","tlink")}</div>`:""}`)}

/* ---------- tail ---------- */
function tailUpd(){const box=document.getElementById("tTail");if(!box)return;const it=(S.agent_ticker||[]).slice(0,14).reverse();
 txt("tLines",`${(S.agent_ticker||[]).length} lines`);const key=it.map(x=>x.t+x.txt).join("|");
 if(key!==T.tailKey){const old=new Set((T.tailKey||"").split("|"));T.tailKey=key;
  box.innerHTML=it.map(x=>`<div class="tl-l${T.built>1&&!old.has(x.t+x.txt)&&!RM?" in":""}"><span class="tm">${hm(x.t)}</span> <span class="ta">${esc(up(String(x.a).replace("_"," ")))}</span> <span class="${x.ok===0?"pk":x.ok===1?"g":""}">${esc(x.txt)}</span>${x.sub?`<div class="ts">${esc(x.sub)}</div>`:""}</div>`).join("")+`<div class="tl-l cur"><span class="tm" id="tCur"></span> <span class="caret">▌</span></div>`;
  box.scrollTop=box.scrollHeight;clock()}}

/* ---------- result ---------- */
function resUpd(){const st=S.stats||{},start=num(st.start)?st.start:(C&&C.start)||S.settings?.["desk.paper_start_stack"],now=S.stack;
 const mx=Math.max(+start||0,+now||0)||1,ws=num(start)?Math.max(2,100*start/mx):0,wn=num(now)?Math.max(2,100*now/mx):0,upx=now>=start;
 const h=`<div class="t-h"><span>RESULT · start vs now</span><span>paper · all trades</span></div>
 <div class="rs-row"><span>START</span><div class="bar"><i style="width:${ws.toFixed(1)}%" class="b0"></i></div><b>${money(start)}</b></div>
 <div class="rs-row"><span>NOW</span><div class="bar"><i style="width:${wn.toFixed(1)}%" class="${upx?"bg":"bp"}"></i></div><b class="${upx?"g":"pk"}">${money(now)}</b></div>
 <div class="rs-ft"><span><b class="g">${num(st.wins)?st.wins:D} W</b> / <b class="pk">${num(st.losses)?st.losses:D} L</b>${num(st.win_rate)?` · ${st.win_rate}% win rate`:""}</span><span>${num(start)&&num(now)?`<b class="${upx?"g":"pk"}">${smoney(now-start)}</b> (${((now-start)/start*100).toFixed(1)}%)`:D}</span></div>`;
 set("tRes",h)}

/* ---------- log ---------- */
const KM={buy:["ENTER","g"],sell:["EXIT","g"],stop:["EXIT","pk"],reject:["FILTERED","pk"],research:["SCORE","lv"],breakout:["SIGNAL","b"],dip:["SIGNAL","b"],copy:["COPY","cy"],kol:["KOL","cy"],alert:["ALERT","o"],wallet:["WALLET","cy"],skip:["SKIP","mu"]};
function logRow(a){const[k,c]=KM[a.kind]||[up(a.kind||"INFO").slice(0,8),"mu"];
 let tk=String(a.title||"").replace(/^(Desk bought|Desk sold|Bought|Sold|Rejected|Stopped|Researched|Breakout signal|Dip signal|Skipped)\s+/i,"").replace(/\s+near stop$/i,"");
 const hasM=!!a.mint;if(!hasM)tk=a.title||D;const why=(a.sub||"").replace(/^(Auditor|Executor|Risk|Researcher|Scanner|Analyst)\s*·\s*/,"");
 const v=String(a.value??"");let out=D,oc="mu";
 if(a.kind==="reject"||/^skipped$/i.test(v)){out="not traded";oc="mu"}
 else if(/^[-−]/.test(v)){out=v;oc="pk"}else if(/^\+/.test(v)){out=v;oc="g"}
 else if(a.kind==="buy"){out="size "+v.split("·")[0].trim();oc="g"}
 else if(a.kind==="research"){out="score "+v;oc="lv"}
 else if(a.kind==="breakout"||a.kind==="dip"){out="→ rug check";oc="b"}
 else if(a.kind==="sell"&&v){out=v;oc=v.startsWith("-")?"pk":"g"}
 else if(v){out=v}
 const inner=`<span class="lt">${hm(a.ts)}</span><span class="tp c-${c} lk">${k}</span><span class="lsym">${hasM?"$":""}${esc(String(tk).slice(0,22))}</span><span class="lo ${oc}">${esc(out)}</span><span class="lr">reason: ${esc(why||D)}</span>`;
 return hasM?`<a class="lrw" data-id="${a.id}" href="#/coin/${esc(a.mint)}">${inner}</a>`:`<div class="lrw" data-id="${a.id}">${inner}</div>`}
function logUpd(){const box=document.getElementById("tLog");if(!box)return;let it=((A&&A.items)||[]).slice();
 if(T.logMode==="trades")it=it.filter(a=>a.kind==="buy"||a.kind==="sell"||a.kind==="stop");
 it=it.slice(0,40).reverse();
 document.querySelectorAll(".lg-seg a[data-m]").forEach(a=>a.classList.toggle("on",a.dataset.m===T.logMode));
 const key=T.logMode+"|"+it.map(a=>a.id).join(",");if(key===T.logKey)return;
 const atBottom=box.scrollHeight-box.scrollTop-box.clientHeight<40||!T.logKey;
 const prevIds=new Set([...box.querySelectorAll(".lrw")].map(e=>e.dataset.id));const sameMode=T.logKey&&T.logKey.split("|")[0]===T.logMode;T.logKey=key;
 box.innerHTML=it.length?it.map(logRow).join(""):`<div class="tr-e">Nothing logged yet.</div>`;
 const rows=box.querySelectorAll(".lrw");rows.forEach(r=>{if(sameMode&&!prevIds.has(r.dataset.id)&&!RM)r.classList.add("in")});rows.length&&rows[rows.length-1].classList.add("now");
 if(atBottom)box.scrollTop=box.scrollHeight}

/* ---------- glue ---------- */
function termRender(){const v=$("#view");
 if(!document.getElementById("term")){v.innerHTML=shell();T.built=0;T.chipKeys=T.tailKey=T.logKey=T.svgSig="";T.num={};bindT(v);try{const st=document.getElementById("tStage");if(window.ResizeObserver&&st){T.ro&&T.ro.disconnect();T.ro=new ResizeObserver(()=>{if(S&&document.getElementById("term")){T.chipKeys="";chipsUpd();stageUpd(true)}});T.ro.observe(st)}}catch(e){}}
 v.dataset.r="home";try{LAST_ROUTE="home";LAST_SIG=""}catch(e){}
 T.built++;
 const parts=[headerUpd,agentsUpd,chipsUpd,()=>stageUpd(),tilesUpd,tradeUpd,tailUpd,resUpd,logUpd];
 for(const f of parts){try{f()}catch(e){console.warn("term",e)}}
 try{if(typeof PENDBURST!=="undefined"&&PENDBURST){burstAt("#nBal");win();PENDBURST=0}}catch(e){}}
function bindT(v){const pb=v.querySelector("#tPause");if(pb)pb.onclick=e=>{e.preventDefault();if(typeof togglePause==="function")togglePause()};
 v.querySelectorAll(".lg-seg a[data-m]").forEach(a=>a.onclick=e=>{e.preventDefault();T.logMode=a.dataset.m;localStorage.setItem("tlog",T.logMode);logUpd()})}
const R0=window.render;
window.render=render=function(force){const r=route();document.body.classList.toggle("term-home",r==="home"&&!!S&&ERR!=="nolink");
 if(r!=="home"||!S||ERR==="nolink"){return R0(force)}
 navbar(r);errRow();document.querySelectorAll("#tabs a").forEach(a=>a.classList.toggle("on",a.dataset.t==="home"));
 try{stopFeedPoll()}catch(e){}
 termRender()};
setInterval(()=>{if(!document.hidden&&route()==="home"&&document.getElementById("term"))clock()},1000);
let rz=0;addEventListener("resize",()=>{clearTimeout(rz);rz=setTimeout(()=>{if(document.getElementById("term")){T.chipKeys="";chipsUpd();stageUpd(true)}},120)});
if(S)render(1);
})();
