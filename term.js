/* v22 · FOMO Desk Terminal (live event player): the Home view as a live terminal dashboard.
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
 if(!T.statSet){const tk=(S.agent_ticker||[])[0];if(tk)setStatus(tk,0)}
 const pb=document.getElementById("tPause");if(pb){const p=!!S.trading_paused;pb.textContent=p?"▶ resume":"⏸ pause";pb.classList.toggle("on",p);pb.setAttribute("aria-pressed",p)}
 clock()}
function clock(){if(!S)return;const age=Math.max(0,Math.round((Date.now()-(+new Date(S.ts)||LAST))/1000)),stale=age>90,p=!!S.trading_paused;
 const s0=+new Date(startTs());let el=D;if(s0){let d=Math.max(0,Math.floor((Date.now()-s0)/1000));const h=Math.floor(d/3600),m=Math.floor(d%3600/60),s=d%60;el=`${String(h).padStart(2,"0")}:${String(m).padStart(2,"0")}:${String(s).padStart(2,"0")}`}
 txt("tRun",stale?`offline · last data ${ago(age)} ago`:p?`paused entries · ${el}`:`running · ${el}`);
 const dot=document.getElementById("tDot");if(dot)dot.className="pdot "+(stale?"r":p?"o":"g");
 txt("tUpd",`· updated ${ago(age)} ago`);
 const cur=document.getElementById("tCur");if(cur){const n=new Date();cur.textContent=n.toTimeString().slice(0,8)}}


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

/* ---------- result ---------- */
function resUpd(){const st=S.stats||{},start=num(st.start)?st.start:(C&&C.start)||S.settings?.["desk.paper_start_stack"],now=S.stack;
 const mx=Math.max(+start||0,+now||0)||1,ws=num(start)?Math.max(2,100*start/mx):0,wn=num(now)?Math.max(2,100*now/mx):0,upx=now>=start;
 const h=`<div class="t-h"><span>RESULT · start vs now</span><span>paper · all trades</span></div>
 <div class="rs-row"><span>START</span><div class="bar"><i style="width:${ws.toFixed(1)}%" class="b0"></i></div><b>${money(start)}</b></div>
 <div class="rs-row"><span>NOW</span><div class="bar"><i style="width:${wn.toFixed(1)}%" class="${upx?"bg":"bp"}"></i></div><b class="${upx?"g":"pk"}">${money(now)}</b></div>
 <div class="rs-ft"><span><b class="g">${num(st.wins)?st.wins:D} W</b> / <b class="pk">${num(st.losses)?st.losses:D} L</b>${num(st.win_rate)?` · ${st.win_rate}% win rate`:""}</span><span>${num(start)&&num(now)?`<b class="${upx?"g":"pk"}">${smoney(now-start)}</b> (${((now-start)/start*100).toFixed(1)}%)`:D}</span></div>`;
 set("tRes",h)}


/* ---------- agents ---------- */
const SIG=["dip","breakout","copy","kol","trending","incubator","fomo_scan"];
const CARD_OF={scanner:"scanner",auditor:"auditor",researcher:"researcher",analyst:"analyst",executor:"executor",risk:"risk",exits:"risk",publisher:"publisher",dip:"signals",breakout:"signals",copy:"signals",kol:"signals",trending:"signals",incubator:"signals",fomo_scan:"signals",degen:"executor"};
const LBL={scanner:"SCANNER",auditor:"RUG CHECK",researcher:"RESEARCH",analyst:"SIZER",executor:"EXECUTOR",risk:"RISK",exits:"RISK",publisher:"LOGGER",dip:"DIP",breakout:"BREAKOUT",copy:"COPY",kol:"KOL",trending:"TRENDING",incubator:"INCUBATOR",fomo_scan:"FOMO SCAN"};
function agDefs(){const st=S.settings||{},g=k=>st[k];
 return[
 {k:"scanner",n:"SCANNER",role:"new pairs + volume spikes",tag:"flags only, never trades",c:"o",on:"SCAN"},
 {k:"auditor",n:"RUG CHECK",role:"filters suspicious tokens",tag:"nothing executes before a pass",c:"pk",on:"CHECK"},
 {k:"researcher",n:"RESEARCH",role:"socials + website check",tag:"adds context, never trades",c:"cy",on:"READ"},
 {k:"analyst",n:"SIZER",role:"scores + sizes each setup",tag:num(g("analyst.min_score"))?`score ≥ ${g("analyst.min_score")} · $${g("executor.fixed_ticket_usd")??D} ticket`:"buys only above the score bar",c:"lv",on:"SIZE"},
 {k:"executor",n:"EXECUTOR",role:"opens + closes paper trades",tag:"paper only · tracks every fill",c:"g",on:"LIVE"},
 {k:"risk",n:"RISK",role:"stops, trails, take-profit",tag:num(g("risk.stop_pct"))?`stop -${g("risk.stop_pct")}% · trail ${g("risk.trail_pct")??D}%`:"guards every open trade",c:"r",on:"GUARD",alt:"exits"},
 {k:"publisher",n:"LOGGER",role:"writes every decision",tag:"no trade without a reason",c:"o",on:"WRITE"},
 {k:"signals",n:"SIGNALS",role:"dip · breakout · copy · kol · trending",tag:"feeds the rug check",c:"b",on:"FLAG",multi:SIG}]}
const dataAge=()=>S&&S.ts?Math.max(0,(Date.now()-(+new Date(S.ts)))/1000):0;
function agState(d){const A=S.agents||{};let a=A[d.k];
 if(d.alt&&A[d.alt]&&(!a||(A[d.alt].act_age??1e9)<(a.act_age??1e9)))a=Object.assign({},a,{doing:A[d.alt].doing,act_age:A[d.alt].act_age,ok:A[d.alt].ok});
 if(d.multi){const xs=d.multi.map(k=>A[k]&&Object.assign({k},A[k])).filter(Boolean);if(!xs.length)return null;
  const best=xs.slice().sort((p,q)=>(p.act_age??1e9)-(q.act_age??1e9))[0];
  return{alive:xs.some(x=>x.alive),paused:xs.every(x=>x.paused),status:xs.some(x=>x.status==="working")?"working":best.status,doing:best.doing?`${best.k.replace("_"," ")}: ${best.doing}`:null,act_age:best.act_age,ok:best.ok}}
 return a||null}
/* most recent real line for a card: its last played event, or the agent's own 'doing' */
function cardLine(d,a){const ev=T.lastEv[d.k],now=Date.now();let line=null;
 const da=a&&num(a.act_age)?a.act_age+dataAge():null;
 if(a&&a.doing)line={txt:a.doing,ok:a.ok,age:da};
 if(ev){const ea=(now-ev.ms)/1000;if(!line||line.age==null||ea<=line.age)line={txt:ev.line,ok:ev.ok,age:ea}}
 return line}
function agentsBuild(){const box=document.getElementById("tAg");if(!box||box.children.length)return;
 box.innerHTML=agDefs().map(d=>`<div class="agc c-${d.c}" id="ag-${d.k}"><div class="agi">${ico(d.k)}</div><div class="agm"><div class="agt"><b>${d.n}</b><span class="tp" data-p></span></div><div class="agr">${d.role}</div><div class="agg" data-g></div><div class="agd"><span data-d></span><i data-m></i></div></div></div>`).join("")}
function agentsUpd(){agentsBuild();const A=S.agents||{},all=Object.values(A);
 txt("tOnline",all.length?`${all.filter(a=>a.alive!==false).length} online`:D);
 for(const d of agDefs()){const el=document.getElementById("ag-"+d.k);if(!el)continue;const a=agState(d);
  const g=el.querySelector("[data-g]");if(g.textContent!==d.tag)g.textContent=d.tag;
  const ln=cardLine(d,a),dd=el.querySelector("[data-d]");
  if(!el.classList.contains("spot")&&ln&&dd.dataset.v!==ln.txt){dd.dataset.v=ln.txt;dd.textContent=ln.txt;dd.className=ln.ok===0?"pk":ln.ok===1?"g":""}
  if(!ln&&dd.textContent!==D){dd.textContent=D;dd.dataset.v=""}
  agentTick(d,el,a,ln)}}
/* per-second: pill + "last Xs ago" from real ages */
function agentTick(d,el,a,ln){a=a||agState(d);ln=ln||cardLine(d,a);
 const age=ln&&ln.age!=null?ln.age:null,spot=el.classList.contains("spot"),active=spot||(age!=null&&age<60&&a&&a.alive!==false&&!a.paused);
 let pl,pc;if(!a){pl=D;pc="mu"}else if(a.alive===false){pl="DOWN";pc="r"}else if(a.paused){pl="PAUSED";pc="o"}else if(active){pl=d.on;pc=d.c}else{pl="IDLE";pc="mu"}
 const p=el.querySelector("[data-p]");if(p.textContent!==pl){p.textContent=pl;p.className="tp c-"+pc+(pc==="mu"?"":" pf")}
 const m=el.querySelector("[data-m]"),mt=age!=null?` · last ${ago(age)} ago`:"";if(m.textContent!==mt)m.textContent=mt;
 el.classList.toggle("hot",active&&!spot);el.classList.toggle("down",!!a&&a.alive===false)}
function agentsTick(){if(!S)return;for(const d of agDefs()){const el=document.getElementById("ag-"+d.k);if(el)agentTick(d,el)}}
function typeInto(el,text,cls){if(!el)return;clearInterval(el._tw);el.className=cls||"";el.dataset.v=text;
 if(RM){el.textContent=text;return}let i=0;el.textContent="";el.classList.add("typing");
 el._tw=setInterval(()=>{i+=2;el.textContent=text.slice(0,i);if(i>=text.length){clearInterval(el._tw);el.classList.remove("typing")}},22)}
function nowStrip(d,line,ok){const n=document.getElementById("tNow");if(!n||!d)return;n.className="fl-now c-"+d.c;
 n.querySelector(".nw-i").innerHTML=ico(d.k);n.querySelector(".nw-n").textContent=d.n;const p=n.querySelector(".nw-p");p.textContent=d.on;p.className="tp nw-p c-"+d.c+" pf";
 if(!RM){p.classList.remove("ping");void p.offsetWidth;p.classList.add("ping")}typeInto(n.querySelector(".nw-t"),line,ok===0?"nw-t pk":ok===1?"nw-t g":"nw-t")}
function spotlight(cardK,line,ok,ms){nowStrip(agDefs().find(d=>d.k===cardK),line,ok);const el=document.getElementById("ag-"+cardK);if(!el)return;
 document.querySelectorAll(".agc.spot").forEach(x=>{if(x!==el)x.classList.remove("spot")});
 el.classList.add("spot");typeInto(el.querySelector("[data-d]"),line,ok===0?"pk":ok===1?"g":"");
 const p=el.querySelector("[data-p]");if(p&&!RM){p.classList.remove("ping");void p.offsetWidth;p.classList.add("ping")}
 clearTimeout(el._sp);el._sp=setTimeout(()=>{el.classList.remove("spot");agentTick(agDefs().find(d=>d.k===cardK),el)},Math.max(1200,ms-150));
 agentTick(agDefs().find(d=>d.k===cardK),el);
 if(innerWidth<760)return; /* phone: cards are below the flow; no scrolling the page */}

/* ---------- build once ---------- */
function shell(){return`<div class="term" id="term">
<section class="t-card t-head" style="grid-area:head">
 <div class="th-l">
  <a class="th-av" href="#/account" aria-label="Account"><i></i><i></i></a>
  <div class="th-id">
   <div class="th-ttl"><b>FOMO Desk</b> Terminal <span class="tp tp-v">v22</span><span class="tp tp-p" id="tPaper">paper</span></div>
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
 <div class="fl-now" id="tNow"><span class="nw-i"></span><b class="nw-n">—</b><span class="tp c-mu nw-p">—</span><span class="nw-t"></span></div>
 <div class="fl-stage" id="tStage"><svg id="tSvg"></svg>
  <div class="fl-sm scan" id="st-scan"><i></i><b>SCAN</b></div>
  <div class="fl-node rug" id="tRug"><div class="nd"><span class="ring"></span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linejoin="round" stroke-linecap="round"><path d="M12 4 21 19H3z"/><path d="M12 10v4M12 16.5v.5"/></svg></div><b>RUG CHECK</b><span id="tRugS">—</span></div>
  <div class="fl-sm size" id="st-size"><i></i><b>SIZE</b></div>
  <div class="fl-node ex" id="tEx"><div class="nd"><span class="ring"></span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><rect x="4" y="5" width="16" height="14" rx="4"/><path d="M10 10v4M14 10v4"/></svg></div><b>EXECUTOR</b><span id="tExS">—</span></div>
  <div class="fl-sm log" id="st-log"><i></i><b>LOG</b></div>
  <div class="fl-pnl" id="tPnl"></div>
  <div class="fl-fx" id="tFx"></div>
 </div>
 <div class="fl-tiles">
  <div class="tile pk" id="tl-f"><div class="tl">▲ FILTERED</div><b id="kF">—</b><span id="kF2">—</span></div>
  <div class="tile lv" id="tl-s"><div class="tl">◆ SIZER</div><b id="kS">—</b><span id="kS2">—</span></div>
  <div class="tile o" id="tl-l"><div class="tl">≡ LOGGER</div><b id="kL">—</b><span>each with a reason</span></div>
  <div class="tile b" id="tl-e"><div class="tl">◎ EQUITY</div><b id="kE">—</b><span>last close</span></div>
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

/* ---------- flow ---------- */
function lastStage(e){const s=e.st||[];return s[s.length-1]||[]}
function chipsUpd(step){const box=document.getElementById("tChips");if(!box)return;const n=innerWidth<560?2:4,P=S.pipeline||[];
 if(!P.length){if(!box.querySelector(".tchip0"))box.innerHTML=`<div class="tchip0">waiting for coins…</div>`;return}
 if(step&&P.length>n)T.chipOff=(T.chipOff+1)%P.length;if(T.chipOff>=P.length)T.chipOff=0;
 const ev=Array.from({length:Math.min(n,P.length)},(_,i)=>P[(T.chipOff+i)%P.length]);
 const keys=ev.map(e=>e.k+"|"+(e.st||[]).length+"|"+e.done).join(",");if(keys===T.chipKeys&&box.children.length===ev.length)return;
 const prev=new Set((T.chipKeys||"").split(",").map(x=>x.split("|")[0]));T.chipKeys=keys;
 box.style.gridTemplateColumns=`repeat(${n},minmax(0,1fr))`;
 box.innerHTML=ev.map(e=>{const ls=lastStage(e),ok=ls[1],stg=up(ls[0]||"scan"),c=e.done?(ok?"g":"pk"):"o",nw=!prev.has(e.k);
  return`<div class="tchip cs-${c}${nw&&!RM?" tin":(step&&!RM?" tsh":"")}"><div class="ch1"><b>$${esc(e.sym||"?")}</b><i class="tcd ${c}"></i></div><div class="ch2">${esc(stg)} · ${esc(ls[2]||(e.done?(ok?"passed":"rejected"):"in flight"))}</div></div>`}).join("")}
function rugInfo(){const L=S.auditor&&S.auditor.live;if(!L){const a=(S.agents||{}).auditor;if(!a||!a.doing)return null;const m=String(a.doing).match(/^(\w+)\s+\$?([^\s:]+)/);return m?{name:m[2],v:a.ok===0?"fail":a.ok===1?"pass":m[1]}:null}
 const ly=L.layers||[];const fail=ly.find(x=>x.pass===false);const pend=ly.some(x=>x.pass==null);return{name:L.name||D,v:fail?"fail":pend?"checking":"pass"}}
/* station coordinates (px inside the stage) */
function geo(){const st=document.getElementById("tStage");if(!st)return null;const W=st.clientWidth,H=st.clientHeight;if(!W)return null;
 const ny=Math.round(H*.56),R=W<420?24:30;return{W,H,ny,R,
  scan:[Math.round(W*.07),ny],rug:[Math.round(W*.28),ny],size:[Math.round(W*.5),ny+R+16],exec:[Math.round(W*.72),ny],log:[Math.round(W*.93),ny]}}
function stageUpd(force){const svg=document.getElementById("tSvg"),G=geo();if(!svg||!G)return;T.G=G;
 const{W,H,ny,R}=G,n=innerWidth<560?2:4;
 const pts=((C&&C.points)||[]).slice(-60).map(p=>+p.v).filter(v=>isFinite(v));
 const sx0=W*.36,sx1=W*.64,sy0=H*.06,sy1=H*.34;let spark="",last=null,lp=null;
 if(pts.length>1){const mn=Math.min(...pts),mx=Math.max(...pts),rg=(mx-mn)||1;const P=pts.map((v,i)=>[sx0+(sx1-sx0)*i/(pts.length-1),sy1-(sy1-sy0)*(v-mn)/rg]);
  const d=P.map((p,i)=>(i?"L":"M")+p[0].toFixed(1)+","+p[1].toFixed(1)).join("");last=pts[pts.length-1];lp=P[P.length-1];const u=last>=pts[0];
  spark=`<path d="${d}L${sx1},${sy1+6}L${sx0},${sy1+6}Z" fill="url(#tg)" class="spa" opacity=".3"/><path class="spk" pathLength="1" d="${d}" fill="none" stroke="${u?"var(--tg)":"var(--tpk)"}" stroke-width="1.6"/><circle cx="${lp[0]}" cy="${lp[1]}" r="2.6" fill="${u?"var(--tg)":"var(--tpk)"}" class="spd"/>`}
 const[sc,rg,sz,ex,lg]=[G.scan,G.rug,G.size,G.exec,G.log];
 const path=`M${sc[0]+8},${ny} L${rg[0]-R-4},${ny} M${rg[0]+R*.8},${ny+R*.6} C${rg[0]+R*1.6},${sz[1]} ${sz[0]-40},${sz[1]} ${sz[0]-10},${sz[1]} M${sz[0]+10},${sz[1]} C${sz[0]+40},${sz[1]} ${ex[0]-R*1.6},${sz[1]} ${ex[0]-R*.8},${ny+R*.6} M${ex[0]+R+4},${ny} L${lg[0]-8},${ny}`;
 const full=`M${sc[0]},${ny} L${rg[0]},${ny} C${rg[0]+R*1.6},${sz[1]} ${sz[0]-40},${sz[1]} ${sz[0]},${sz[1]} C${sz[0]+40},${sz[1]} ${ex[0]-R*1.6},${sz[1]} ${ex[0]},${ny} L${lg[0]},${ny}`;
 const lines=Array.from({length:Math.min(n,(S.pipeline||[]).length)},(_,i)=>`<path d="M${(i+.5)*W/n},0 Q${(i+.5)*W/n},${ny-30} ${sc[0]},${ny-10}" class="cl"/>`).join("");
 const html=`<defs><linearGradient id="tg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="var(--tg)"/><stop offset="1" stop-color="var(--tg)" stop-opacity="0"/></linearGradient></defs>${lines}${spark}<path d="${path}" class="dp"/>${RM?"":[0,1,2].map(i=>`<circle r="2.2" class="flowdot"><animateMotion dur="4.5s" begin="${-i*1.5}s" repeatCount="indefinite" path="${full}"/></circle>`).join("")}`;
 const sig=W+"|"+H+"|"+pts.length+"|"+last+"|"+n+"|"+(S.pipeline||[]).length;
 if(force||sig!==T.svgSig){T.svgSig=sig;svg.setAttribute("viewBox",`0 0 ${W} ${H}`);svg.innerHTML=html}
 const pos=(id,p,oy)=>{const e=document.getElementById(id);if(e)e.style.transform=`translate(${p[0]}px,${p[1]-oy}px) translateX(-50%)`};
 pos("st-scan",sc,7);pos("st-size",sz,7);pos("st-log",lg,7);pos("tRug",rg,R);pos("tEx",ex,R);
 document.getElementById("tStage").style.setProperty("--R",R+"px");
 const ri=rugInfo();set("tRugS",ri?`<span class="${ri.v==="fail"?"pk":ri.v==="pass"?"g":"o"}">${ri.v} $${esc(String(ri.name).slice(0,12))}</span>`:D);
 exState();
 const pn=document.getElementById("tPnl");if(pn){if(last!=null&&lp){pn.hidden=false;pn.style.transform=`translate(${Math.min(W-70,lp[0]+6)}px,${Math.max(0,lp[1]-18)}px)`;pn.textContent=smoney(last);pn.className="fl-pnl "+(last>=0?"g":"pk")}else pn.hidden=true}
 txt("tChecked",num(S.scanner&&S.scanner.pools)?`scanned ${S.scanner.pools} pools`:D)}
function exState(){const open=(S.positions||[]).filter(p=>p.status==="open"||p.status==="exiting");const exn=document.getElementById("tEx");
 if(T.exFlash&&Date.now()<T.exFlash.until){set("tExS",`<span class="g">enter $${esc(T.exFlash.sym)}</span>`);exn&&exn.classList.add("live");return}
 set("tExS",open.length?`<span class="g">live $${esc((open[0].symbol||open[0].name||"?").slice(0,12))}${open.length>1?" +"+(open.length-1):""}</span>`:"flat");
 exn&&exn.classList.toggle("live",!!open.length)}

/* ---------- stage effects (transform/opacity only) ---------- */
function fxEl(cls,html,p){const fx=document.getElementById("tFx");if(!fx)return null;const e=document.createElement("div");e.className=cls;e.innerHTML=html;e.style.transform=`translate(${p[0]}px,${p[1]}px)`;fx.appendChild(e);return e}
function travel(sym,route,c){const G=T.G;if(!G||RM||!route.length)return 0;const pts=route.map(k=>G[k]);
 const e=fxEl("ftok t"+c,`<b>$${esc(String(sym).slice(0,10))}</b>`,pts[0]);if(!e)return 0;
 const seg=380,dur=Math.max(500,seg*(pts.length-1)+260);
 const an=e.animate(pts.map((p,i)=>({transform:`translate(${p[0]}px,${p[1]-22}px) translate(-50%,-50%) scale(${i===0?.6:1})`,opacity:i===0?0:1,offset:pts.length>1?i/(pts.length-1)*0.85:0})).concat([{transform:`translate(${pts[pts.length-1][0]}px,${pts[pts.length-1][1]-22}px) translate(-50%,-50%) scale(1)`,opacity:1,offset:1}]),{duration:dur,easing:"cubic-bezier(.45,.05,.35,1)",fill:"forwards"});
 an.onfinish=()=>{e.animate([{opacity:1},{opacity:0,transform:getComputedStyle(e).transform+" translateY(-8px)"}],{duration:500,delay:500,fill:"forwards"}).onfinish=()=>e.remove()};
 return dur}
function stamp(at,label,c,delay){const G=T.G;if(!G)return;const p=G[at];const go=()=>{const e=fxEl("fstamp t"+c,`<b>${esc(label)}</b>`,[Math.max(44,Math.min(G.W-44,p[0])),p[1]-(at==="rug"||at==="exec"?G.R+30:34)]);if(!e)return;
  if(RM){setTimeout(()=>e.remove(),1600);return}
  e.animate([{transform:e.style.transform+" translate(-50%,-50%) rotate(-6deg) scale(2.2)",opacity:0},{transform:e.style.transform+" translate(-50%,-50%) rotate(-6deg) scale(.92)",opacity:1,offset:.6},{transform:e.style.transform+" translate(-50%,-50%) rotate(-6deg) scale(1)",opacity:1}],{duration:420,easing:"cubic-bezier(.2,1.4,.4,1)",fill:"forwards"});
  setTimeout(()=>{e.animate([{opacity:1},{opacity:0}],{duration:400,fill:"forwards"}).onfinish=()=>e.remove()},1500)};
 delay?setTimeout(go,delay):go()}
function nodePulse(id,delay){const e=document.getElementById(id);if(!e||RM)return;setTimeout(()=>{e.classList.remove("blink");void e.offsetWidth;e.classList.add("blink")},delay||0)}
function flyPnl(val,delay){const G=T.G,st=document.getElementById("tStage"),tile=document.getElementById("tl-e");if(!G||!st||!tile)return;
 setTimeout(()=>{const sr=st.getBoundingClientRect(),tr=tile.getBoundingClientRect();const to=[tr.left-sr.left+tr.width/2,tr.top-sr.top+tr.height/2];
  const e=fxEl("fpnl "+(val>=0?"g":"pk"),smoney(val),G.exec);if(!e)return;
  if(RM){setTimeout(()=>e.remove(),1200);return}
  e.animate([{transform:`translate(${G.exec[0]}px,${G.exec[1]}px) translate(-50%,-50%) scale(1)`,opacity:1},{transform:`translate(${to[0]}px,${to[1]}px) translate(-50%,-50%) scale(.8)`,opacity:.9}],{duration:900,easing:"cubic-bezier(.5,0,.3,1)",fill:"forwards"}).onfinish=()=>{e.remove();tile.classList.remove("hit");void tile.offsetWidth;tile.classList.add("hit")}},delay||0)}
function tileHit(id,delay){const t=document.getElementById(id);if(!t||RM)return;setTimeout(()=>{t.classList.remove("hit");void t.offsetWidth;t.classList.add("hit")},delay||0)}

/* ---------- tail ---------- */
const tkey=x=>x.t+"|"+x.a+"|"+x.txt;
function tailLine(x,cls){return`<div class="tl-l${cls||""}"><span class="tm">${hm(x.t)}</span> <span class="ta">${esc(up(String(x.a).replace("_"," ")))}</span> <span data-x class="${x.ok===0?"pk":x.ok===1?"g":""}">${esc(x.txt)}</span>${x.sub?`<div class="ts">${esc(x.sub)}</div>`:""}</div>`}
function tailUpd(){const box=document.getElementById("tTail");if(!box)return;txt("tLines",`${(S.agent_ticker||[]).length} lines`);
 if(box.dataset.init)return;box.dataset.init=1;
 const it=(S.agent_ticker||[]).filter(x=>!T.pend.has(tkey(x))).slice(0,14).reverse();
 box.innerHTML=it.map(x=>tailLine(x)).join("")+`<div class="tl-l cur"><span class="tm" id="tCur"></span> <span class="caret">▌</span></div>`;box.scrollTop=box.scrollHeight;clock()}
function tailAppend(x){const box=document.getElementById("tTail");if(!box)return;const cur=box.querySelector(".cur");
 const w=document.createElement("div");w.innerHTML=tailLine(x,RM?"":" in");const ln=w.firstChild;box.insertBefore(ln,cur);
 const sp=ln.querySelector("[data-x]");if(sp)typeInto(sp,x.txt,sp.className);
 const rows=box.querySelectorAll(".tl-l:not(.cur)");if(rows.length>30)rows[0].remove();box.scrollTop=box.scrollHeight}

/* ---------- log ---------- */
const KM={buy:["ENTER","g"],sell:["EXIT","g"],stop:["EXIT","pk"],reject:["FILTERED","pk"],research:["SCORE","lv"],breakout:["SIGNAL","b"],dip:["SIGNAL","b"],copy:["COPY","cy"],kol:["KOL","cy"],alert:["ALERT","o"],wallet:["WALLET","cy"],skip:["SKIP","mu"]};
function logRow(a){const[k,c]=KM[a.kind]||[up(a.kind||"INFO").slice(0,8),"mu"];
 let tk=String(a.title||"").replace(/^(Desk bought|Desk sold|Bought|Sold|Rejected|Stopped|Researched|Breakout signal|Dip signal|Skipped)\s+/i,"").replace(/\s+near stop$/i,"");
 const hasM=!!a.mint;if(!hasM)tk=a.title||D;const why=(a.sub||"").replace(/^(Auditor|Executor|Risk|Researcher|Scanner|Analyst)\s*·\s*/,"");
 let why2=why;if(a.kind==="buy"){const ps=(S.positions||[]).find(p=>p.mint===a.mint);why2=ps&&ps.source?`${ps.source} signal · paper ticket`:(/^\d{1,2}:\d{2}$/.test(why)?"paper buy by executor":why)}
 const v=String(a.value??"");let out=D,oc="mu";
 if(a.kind==="reject"||/^skipped$/i.test(v)){out="not traded";oc="mu"}
 else if(/^[-−]/.test(v)){out=v;oc="pk"}else if(/^\+/.test(v)){out=v;oc="g"}
 else if(a.kind==="buy"){out="size "+v.split("·")[0].trim();oc="g"}
 else if(a.kind==="research"){out="score "+v;oc="lv"}
 else if(a.kind==="breakout"||a.kind==="dip"){out="→ rug check";oc="b"}
 else if(a.kind==="sell"&&v){out=v;oc=v.startsWith("-")?"pk":"g"}
 else if(v){out=v}
 const inner=`<span class="lt">${hm(a.ts)}</span><span class="tp c-${c} lk">${k}</span><span class="lsym">${hasM?"$":""}${esc(String(tk).slice(0,22))}</span><span class="lo ${oc}">${esc(out)}</span><span class="lr">reason: ${esc(why2||D)}</span>`;
 return hasM?`<a class="lrw" data-id="${a.id}" href="#/coin/${esc(a.mint)}">${inner}</a>`:`<div class="lrw" data-id="${a.id}">${inner}</div>`}
function logFiltered(){let it=((A&&A.items)||[]).filter(a=>!T.pendA.has(a.id));if(T.logMode==="trades")it=it.filter(a=>a.kind==="buy"||a.kind==="sell"||a.kind==="stop");return it.slice(0,40).reverse()}
function logUpd(force){const box=document.getElementById("tLog");if(!box)return;
 document.querySelectorAll(".lg-seg a[data-m]").forEach(a=>a.classList.toggle("on",a.dataset.m===T.logMode));
 const it=logFiltered(),key=T.logMode+"|"+it.map(a=>a.id).join(",");if(!force&&key===T.logKey)return;T.logKey=key;
 box.innerHTML=it.length?it.map(logRow).join(""):`<div class="tr-e">${T.logMode==="trades"?"No paper trades in the recent log.":"Nothing logged yet."}</div>`;
 const rows=box.querySelectorAll(".lrw");rows.length&&rows[rows.length-1].classList.add("now");box.scrollTop=box.scrollHeight}
function logAppend(a){T.pendA.delete(a.id);if(T.logMode==="trades"&&!(a.kind==="buy"||a.kind==="sell"||a.kind==="stop"))return;
 const box=document.getElementById("tLog");if(!box)return;const atB=box.scrollHeight-box.scrollTop-box.clientHeight<60;
 box.querySelector(".tr-e")?.remove();box.querySelectorAll(".lrw.now").forEach(r=>r.classList.remove("now"));
 const w=document.createElement("div");w.innerHTML=logRow(a);const r=w.firstChild;r.classList.add("now");if(!RM)r.classList.add("in");box.appendChild(r);
 const rows=box.querySelectorAll(".lrw");if(rows.length>40)rows[0].remove();T.logKey=T.logMode+"|"+logFiltered().map(x=>x.id).join(",");
 if(atB)box.scrollTop=box.scrollHeight}

/* ---------- event player: replays the desk's REAL events one by one ---------- */
const symOf=t=>String(t||"").replace(/^(Desk bought|Desk sold|Bought|Sold|Rejected|Passed|Stopped|Researched|Scored|Skipped|Killed|Flagged|Breakout signal|Dip signal|Took profit on|Trailed out of|Timed out)\s+/i,"").replace(/\s+(near stop|hit .*)$/i,"").trim();
function plan(x){const a=String(x.a||""),t=String(x.txt||"").toLowerCase(),s=symOf(x.txt);
 if(a==="scanner")return/^passed/.test(t)?{r:["scan","rug"],c:"g",sym:s}:{r:["scan"],st:["scan","SKIP","pk"],c:"pk",sym:s};
 if(a==="auditor"||/^rejected/.test(t))return/^rejected|fail|kill/.test(t)?{r:["scan","rug"],st:["rug","FILTERED","pk"],c:"pk",sym:s,tile:"tl-f"}:{r:["scan","rug","size"],c:"g",sym:s};
 if(a==="dip"||a==="breakout")return{r:["scan","rug"],c:"b",sym:s,st:["scan","SIGNAL","b"]};
 if(a==="researcher")return{r:["rug","size"],c:"cy",sym:s};
 if(a==="analyst")return{r:["rug","size"],c:"lv",sym:s,st:/reject|skip/.test(t)?["size","SKIP","pk"]:null,tile:"tl-s"};
 if(a==="executor"){if(/bought|enter|filled|open/.test(t))return{r:["scan","rug","size","exec","log"],c:"g",sym:s,st:["exec","ENTER","g"],enter:1};
  return{r:["size"],c:"pk",sym:s,st:["size","SKIP","pk"]}}
 if(a==="risk"||a==="exits"){if(/near stop|alert/.test(t))return{r:[],st:["exec","ALERT","o"],sym:s};return{r:["exec","log"],c:/^stopped/.test(t)?"pk":"g",sym:s,st:["exec","EXIT",/^stopped/.test(t)?"pk":"g"],exit:1}}
 return{r:[],sym:s}}
function setStatus(x,replay){const se=document.getElementById("tStat");if(!se)return;T.statSet=1;
 const t=`${replay?"↺ ":""}${LBL[x.a]||up(String(x.a).replace("_"," "))} · ${up(x.txt)}`;if(se.textContent===t)return;se.textContent=t;
 se.className="tp tp-s "+(x.ok===0?"pk":x.ok===1?"g":"mu")+(replay?" rp":"");if(!RM){se.classList.remove("pop");void se.offsetWidth;se.classList.add("pop")}}
function actFor(x){const AI=(A&&A.items)||[];return AI.find(a=>T.pendA.has(a.id)&&a.ts===x.t&&String(a.title||"").slice(0,40)===String(x.txt||"").slice(0,40))}
function playEv(x,replay,ms){if(!document.getElementById("term"))return;const card=CARD_OF[x.a]||"signals";
 const line=x.txt+(x.sub?" · "+x.sub:"");if(!replay)T.lastEv[card]={line,ok:x.ok,ms:+new Date(x.t)||Date.now()};
 spotlight(card,line,x.ok,ms);setStatus(x,replay);
 const P=plan(x);let d=0;
 if(P.r&&P.r.length)d=travel(P.sym||"?",P.r,P.c||"mu");
 if(P.r)P.r.forEach((k,i)=>nodePulse(k==="rug"?"tRug":k==="exec"?"tEx":"st-"+k,RM?0:i*380*.85+200));
 if(P.st)stamp(P.st[0],P.st[1],P.st[2],RM?0:Math.max(0,d-200));
 if(P.tile)tileHit(P.tile,d);
 if(P.enter&&!replay){T.exFlash={sym:(P.sym||"?").slice(0,12),until:Date.now()+5000};exState();setTimeout(exState,5100)}
 if(P.exit){const AI=(A&&A.items)||[],m=AI.find(a=>(a.kind==="sell"||a.kind==="stop")&&a.ts===x.t);const v=m?parseFloat(String(m.value).replace(/[^0-9.\-]/g,"")):NaN;if(isFinite(v))flyPnl(v,d)}
 nodePulse("st-log",d+150);tileHit("tl-l",d+150);
 if(!replay){T.pend.delete(tkey(x));tailAppend(x);
  const AI=(A&&A.items)||[];const mine=actFor(x);const older=AI.filter(a=>T.pendA.has(a.id)&&(+new Date(a.ts))<=(+new Date(x.t))&&a!==mine).sort((p,q)=>p.id-q.id);
  older.concat(mine?[mine]:[]).forEach(a=>logAppend(a))}}
function ingest(){const tk=S.agent_ticker||[],AI=(A&&A.items)||[];
 if(!T.seeded){T.seeded=1;tk.forEach(x=>T.seen.add(tkey(x)));AI.forEach(a=>T.seenA.add(a.id));
  /* start: play back the newest few real events so the page wakes up */
  const intro=tk.slice(0,5).reverse();intro.forEach(x=>{T.pend.add(tkey(x));T.q.push(x)});
  intro.forEach(x=>{const m=AI.find(a=>a.ts===x.t&&String(a.title||"").slice(0,40)===String(x.txt||"").slice(0,40));if(m)T.pendA.add(m.id)});return}
 const nw=tk.filter(x=>!T.seen.has(tkey(x))).sort((p,q)=>(+new Date(p.t))-(+new Date(q.t)));nw.forEach(x=>{T.seen.add(tkey(x));T.pend.add(tkey(x));T.q.push(x)});
 AI.forEach(a=>{if(!T.seenA.has(a.id)){T.seenA.add(a.id);T.pendA.add(a.id)}});
 if(T.q.length>40){const drop=T.q.splice(0,T.q.length-40);drop.forEach(x=>{T.pend.delete(tkey(x));tailAppend(x)})}}
function idleEv(){/* nothing new: slow replay of recent real events, mixed with agents' current real activity */
 const tk=(S.agent_ticker||[]).slice(0,12);T.idleN=(T.idleN||0)+1;
 if(T.idleN%3===0){const A_=S.agents||{};const live=Object.entries(A_).filter(([k,a])=>a&&a.doing&&a.alive!==false&&num(a.act_age)&&a.act_age+dataAge()<180).sort((p,q)=>p[1].act_age-q[1].act_age);
  if(live.length){const[k,a]=live[(T.idleN/3|0)%live.length];const card=CARD_OF[k]||"signals";spotlight(card,a.doing,a.ok,2600);setStatus({a:k,txt:a.doing,ok:a.ok},0);nodePulse("st-scan");return}}
 if(!tk.length)return;T.rpI=((T.rpI||0)+1)%tk.length;playEv(tk[tk.length-1-T.rpI],1,2600)}
function loop(){clearTimeout(T.timer);let wait=3400;
 if(S&&document.getElementById("term")&&!document.hidden){
  if(T.q.length){const x=T.q.shift();wait=T.q.length>8?900:T.q.length>3?1400:T.q.length?1900:2400;try{playEv(x,0,wait)}catch(e){console.warn(e)}
   if(!T.q.length&&T.pendA.size){const AI=(A&&A.items)||[];AI.filter(a=>T.pendA.has(a.id)).sort((p,q)=>p.id-q.id).forEach(a=>setTimeout(()=>logAppend(a),600))}}
  else{try{idleEv()}catch(e){console.warn(e)}}
  if(++T.chipN%2===0)chipsUpd(1)}
 T.timer=setTimeout(loop,wait)}

/* ---------- glue ---------- */
Object.assign(T,{q:[],seen:new Set(),seenA:new Set(),pend:new Set(),pendA:new Set(),lastEv:{},chipOff:0,chipN:0});
function termRender(){const v=$("#view");
 if(!document.getElementById("term")){v.innerHTML=shell();T.built=0;T.chipKeys=T.logKey=T.svgSig="";T.num={};bindT(v);
  try{const st=document.getElementById("tStage");if(window.ResizeObserver&&st){T.ro&&T.ro.disconnect();T.ro=new ResizeObserver(()=>{if(S&&document.getElementById("term")){T.chipKeys="";chipsUpd();stageUpd(true)}});T.ro.observe(st)}}catch(e){}}
 v.dataset.r="home";try{LAST_ROUTE="home";LAST_SIG=""}catch(e){}
 T.built++;try{ingest()}catch(e){console.warn("ingest",e)}
 const parts=[headerUpd,agentsUpd,()=>chipsUpd(0),()=>stageUpd(),tilesUpd,tradeUpd,tailUpd,resUpd,()=>logUpd()];
 for(const f of parts){try{f()}catch(e){console.warn("term",e)}}
 if(!T.timer)T.timer=setTimeout(loop,700);
 try{if(typeof PENDBURST!=="undefined"&&PENDBURST){burstAt("#nBal");win();PENDBURST=0}}catch(e){}}
function bindT(v){const pb=v.querySelector("#tPause");if(pb)pb.onclick=e=>{e.preventDefault();if(typeof togglePause==="function")togglePause()};
 v.querySelectorAll(".lg-seg a[data-m]").forEach(a=>a.onclick=e=>{e.preventDefault();T.logMode=a.dataset.m;localStorage.setItem("tlog",T.logMode);logUpd(1)})}
const R0=window.render;
window.render=render=function(force){const r=route();document.body.classList.toggle("term-home",r==="home"&&!!S&&ERR!=="nolink");
 if(r!=="home"||!S||ERR==="nolink"){if(document.getElementById("term")){/* leaving home: tail must re-init next time */}return R0(force)}
 navbar(r);errRow();document.querySelectorAll("#tabs a").forEach(a=>a.classList.toggle("on",a.dataset.t==="home"));
 try{stopFeedPoll()}catch(e){}
 termRender()};
setInterval(()=>{if(!document.hidden&&route()==="home"&&document.getElementById("term")){clock();agentsTick()}},1000);
if(S)render(1);
})();
