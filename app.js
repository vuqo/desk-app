let SR=localStorage.getItem('showRejects')==='1';function srT(){return`<a href="#" class="srt" onclick="SR=!SR;localStorage.setItem('showRejects',SR?'1':'0');render();return false">${SR?'Hide rejects':'Show rejects'}</a>`}
// Desk app. DATA_PATH comes from #d= (or a pasted link), lives only in localStorage. Polls public JSON every 15s.
// Every FOMO link shown here comes from the published JSON (made by links.py on the desk).
const DEMO0=/demo=sparkle/.test(location.hash);
const SUPA="https://alxvekhevjrehedmgpek.supabase.co/storage/v1/object/public/desk/d/";
(function(){const raw=location.hash.slice(1);if(!raw.includes("d="))return;const h=new URLSearchParams(raw);
 if(h.get("d")){localStorage.setItem("dp",h.get("d"));const b=h.get("b");if(b&&b.startsWith("http://localhost"))localStorage.setItem("base",b);else localStorage.removeItem("base");if(h.get("k"))localStorage.setItem("ck",h.get("k"));history.replaceState(null,"",location.pathname+"#/"+(h.get("r")||"home"));}})();
const DP=()=>localStorage.getItem("dp"),CK=()=>localStorage.getItem("ck"),BASE=()=>(localStorage.getItem("base")||SUPA)+DP()+"/";
const RM=matchMedia("(prefers-reduced-motion: reduce)").matches;
let COINMISS={},S=null,A=null,C=null,ERR=null,LAST=0,coinCache={},RANGE=localStorage.getItem("range")||"ALL",NEXT=Date.now()+15000,SEG="all";
const $=s=>document.querySelector(s),esc=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const f2=v=>Number(v||0).toLocaleString("en-US",{minimumFractionDigits:2,maximumFractionDigits:2});
const usd=v=>v==null?"—":(v<0?"-$":"$")+f2(Math.abs(v));
const kfmt=v=>v==null?"—":v>=1e6?(v/1e6).toFixed(1)+"M":v>=1e3?(v/1e3).toFixed(1)+"K":Number(v).toFixed(0);
const ext=(url,inner,cls="")=>url?`<a class="${cls}" href="${esc(url)}" target="_blank" rel="noopener">${inner}</a>`:inner;
const time=t=>t?new Date(t).toLocaleTimeString([], {hour:"numeric",minute:"2-digit"}):"—";
async function get(p){const r=await fetch(BASE()+p+"?t="+Date.now(),{cache:"no-store"});if(!r.ok)throw new Error("HTTP "+r.status);return r.json()}
async function poll(){if(!DP()){ERR="nolink";render();return}
 try{[S,A,C]=await Promise.all([get("state.json"),get("activity.json"),get("chart.json")]);ERR=null;LAST=Date.now();indexImgs();{const top=(A&&A.items||[]).filter(a=>a.kind==="buy"||(a.kind==="sell"&&!String(a.value).startsWith("-")));const mx=Math.max(0,...top.map(a=>+new Date(a.ts)||0));if(SEENTS&&mx>SEENTS)PENDBURST=1;SEENTS=Math.max(SEENTS||0,mx)||-1}
  const m=location.hash.match(/#\/(?:coin|replay)\/(\w+)/);if(m){const cd=await get("coin/"+m[1]+".json").catch(()=>null);if(cd)coinCache[m[1]]=cd;else COINMISS[m[1]]=1}
 }catch(e){ERR=e.message}NEXT=Date.now()+15000;render()}
let prevStack=0,BALDIR=0,PENDBURST=0,SEENTS=0,P=[],SHEET=0,SCRUB=null,CHSERIES=null,PAUSEBUSY=0,FEED=null,FEEDSEEN={},FEEDPREV={},FEEDTIMER=0;const DEMO=DEMO0;
function burstAt(sel){if(RM)return;const el=$(sel);if(!el)return;const r=el.getBoundingClientRect(),cx=r.left+Math.min(r.width,260)/2,cy=r.top+r.height/2,cols=["#00d35a","#64d2ff","#ffd60a","#ff6b9a","#fff","#00d35a"];
 for(let i=0;i<36;i++){const a=Math.random()*6.283,v=2+Math.random()*6;P.push({x:cx,y:cy,vx:Math.cos(a)*v,vy:Math.sin(a)*v-2.5,c:cols[i%6],s:2+Math.random()*3,l:1,st:Math.random()<.35,r:Math.random()*6})}fxKick()}
const TW=Array.from({length:22},()=>({x:Math.random(),y:Math.random(),s:.5+Math.random()*1.3,ph:Math.random()*6.28,v:.004+Math.random()*.008}));
function star(x,cx,cy,r){x.beginPath();for(let i=0;i<8;i++){const rr=i%2?r*.35:r,a=i*Math.PI/4;x.lineTo(cx+Math.cos(a)*rr,cy+Math.sin(a)*rr)}x.closePath();x.fill()}
let FX_ON=0;
function fxLoop(t){if(document.hidden||RM||(route()!=="home"&&!P.length)){FX_ON=0;const cv=$("#fx");if(cv){const x=cv.getContext("2d");x&&x.clearRect(0,0,cv.width,cv.height)}return}
 FX_ON=1;const cv=$("#fx"),dpr=devicePixelRatio||1;if(cv.width!==innerWidth*dpr){cv.width=innerWidth*dpr;cv.height=innerHeight*dpr}const x=cv.getContext("2d");x.setTransform(dpr,0,0,dpr,0,0);x.clearRect(0,0,innerWidth,innerHeight);
 P=P.filter(p=>p.l>0);P.forEach(p=>{p.x+=p.vx;p.y+=p.vy;p.vy+=.18;p.vx*=.97;p.l-=.017;x.globalAlpha=Math.max(0,p.l);x.fillStyle=p.c;if(p.st)star(x,p.x,p.y,p.s*1.8);else{x.save();x.translate(p.x,p.y);x.rotate(p.r+=.2);x.fillRect(-p.s,-p.s/2,p.s*2,p.s);x.restore()}});x.globalAlpha=1;
 requestAnimationFrame(fxLoop)}
function fxKick(){if(!RM&&!FX_ON&&!document.hidden)requestAnimationFrame(fxLoop)}
if(!RM)requestAnimationFrame(fxLoop);
if(DEMO){history.replaceState(null,"",location.pathname+"#/home");setInterval(()=>route()==="home"&&burstAt(".big"),1300);setTimeout(()=>burstAt(".big"),900)}
/* ---------- v4: logos, theme, sound ---------- */
const HUE=t=>{let h=0;for(const c of String(t||"?"))h=(h*31+c.charCodeAt(0))%360;return h};
function logo(name,img,mint,sz=40){const n=esc(((name||mint||"?").trim()[0]||"?").toUpperCase()),h=HUE(mint||name);
 const fb=`<span class="lg-i" style="background:hsl(${h} 70% 22%);color:hsl(${h} 90% 72%)">${n}</span>`;
 return `<span class="lg" style="width:${sz}px;height:${sz}px;font-size:${Math.round(sz*.42)}px">${fb}${img&&/^https:\/\//.test(img)?`<img src="${esc(img)}" alt="" loading="lazy" decoding="async" referrerpolicy="no-referrer" onerror="this.remove()">`:""}</span>`}
const IMG={};function imgOf(m){return IMG[m]||null}
function indexImgs(){(S?.scanner?.feed||[]).forEach(f=>{if(f.image)IMG[f.mint]=f.image});(S?.positions||[]).forEach(p=>{if(p.image)IMG[p.mint]=p.image});(FEED?.items||[]).forEach(f=>{if(f.img)IMG[f.m]=f.img})}
const THEME=()=>localStorage.getItem("theme")||"dark";function applyTheme(){document.documentElement.dataset.theme=THEME();document.querySelector('meta[name=theme-color]')?.setAttribute("content",THEME()==="neon"?"#07001a":"#000000")}applyTheme();
let ACX=null;const SOUND=()=>localStorage.getItem("sound")==="on";
function unlockAudio(){if(ACX)return;try{ACX=new (window.AudioContext||window.webkitAudioContext)();const b=ACX.createBuffer(1,1,22050),s=ACX.createBufferSource();s.buffer=b;s.connect(ACX.destination);s.start(0)}catch(e){}}
function chaChing(){if(!SOUND()||!ACX||document.hidden)return;if(ACX.state==="suspended")ACX.resume();const t=ACX.currentTime;
 [[1318.5,0,.09],[1975.5,.09,.5],[2637,.11,.45]].forEach(([f,d,len])=>{const o=ACX.createOscillator(),g=ACX.createGain();o.type="triangle";o.frequency.value=f;g.gain.setValueAtTime(0,t+d);g.gain.linearRampToValueAtTime(.22,t+d+.008);g.gain.exponentialRampToValueAtTime(.0008,t+d+len);o.connect(g).connect(ACX.destination);o.start(t+d);o.stop(t+d+len+.02)});
 const n=ACX.createBuffer(1,ACX.sampleRate*.06,ACX.sampleRate),dd=n.getChannelData(0);for(let i=0;i<dd.length;i++)dd[i]=(Math.random()*2-1)*(1-i/dd.length);const ns=ACX.createBufferSource(),ng=ACX.createGain(),hp=ACX.createBiquadFilter();hp.type="highpass";hp.frequency.value=5000;ns.buffer=n;ng.gain.value=.12;ns.connect(hp).connect(ng).connect(ACX.destination);ns.start(t)}
function buzz(){if(document.hidden)return;try{navigator.vibrate&&navigator.vibrate([18,40,28])}catch(e){}}
function win(){chaChing();buzz()}
addEventListener("pointerdown",()=>{if(SOUND())unlockAudio()},{once:false,passive:true});
const route=()=>(location.hash.match(/#\/(\w+)/)||[,"home"])[1];
/* ---------- odometer ---------- */
let prevBal=null,ODO_FIRST=1;
function odo(str,prev){let out="",p=(prev||"").padStart(str.length," "),k=0;
 const animate=!RM&&!ODO_FIRST&&prev!=null&&prev!==str;
 for(let i=0;i<str.length;i++){const ch=str[i];if(!/\d/.test(ch)){out+=`<span class="sym">${ch}</span>`;continue}
  const from=animate&&/\d/.test(p[i])?+p[i]:+ch;
  /* transform set in px by rollOdo after measure — start empty to avoid clamp/calc mismatch on iOS */
  out+=`<span class="odo"><i data-to="${ch}" data-from="${from}" data-d="${k++}" data-anim="${animate?1:0}">${[0,1,2,3,4,5,6,7,8,9].map(n=>`<b>${n}</b>`).join("")}</i></span>`}
 return out}
function rollOdo(){const nodes=[...document.querySelectorAll(".hero .odo i, .big .odo i, .odo i")];if(!nodes.length){ODO_FIRST=0;return}
 const h=Math.round(nodes[0].parentElement.getBoundingClientRect().height)||52;
 nodes.forEach(el=>{const to=+el.dataset.to,from=+el.dataset.from,anim=el.dataset.anim==="1";
  const setY=(n,hard)=>{if(hard){el.style.transition="none";el.style.transitionDelay="0ms"}el.style.transform=`translate3d(0,${-(n*h)}px,0)`};
  if(!anim){setY(to,1);return}
  setY(from,1);
  requestAnimationFrame(()=>requestAnimationFrame(()=>{el.style.transition="";el.style.transitionDelay=(+el.dataset.d*30)+"ms";setY(to,0)}));
  const done=ev=>{if(ev&&ev.propertyName&&!String(ev.propertyName).includes("transform"))return;el.removeEventListener("transitionend",done);setY(to,1)};
  el.addEventListener("transitionend",done);setTimeout(()=>done({propertyName:"transform"}),900+((+el.dataset.d)||0)*30)});
 ODO_FIRST=0}
/* ---------- chrome ---------- */
const ICON={search:'<path d="M10.5 18a7.5 7.5 0 1 1 0-15 7.5 7.5 0 0 1 0 15zm5.3-2.2L21 21"/>',bell:'<path d="M6 16V11a6 6 0 1 1 12 0v5l1.5 2h-15zM10 20.5a2 2 0 0 0 4 0"/>',back:'<path d="M15 4l-8 8 8 8"/>'};
const ic=(n,href="#/activity")=>`<a class="ic" href="${href}" aria-label="${n}"><svg viewBox="0 0 24 24">${ICON[n]}</svg></a>`;
function navbar(r){const h=$("#nav");
 if(r==="replay"){h.innerHTML=`${ic("back","javascript:history.back()")}<div class="ttl">Replay</div><div style="width:34px"></div>`;return}
 if(r==="coin"||r==="auditor"){h.innerHTML=`${ic("back",r==="coin"?"#/home":"#/agents")}<div class="ttl">${r==="coin"?"Coin":"Auditor"}</div><div style="width:34px"></div>`;return}
 const t={agents:"Agents",activity:"Activity",account:"Account",feed:"Live Feed"}[r];
 const handle=S?.settings?.["desk.fomo_handle"]||"";
 h.innerHTML=`<a class="av" href="#/account">${esc((handle[0]||"D").toUpperCase())}</a><a class="who" href="#/account">${t||'Grok Bot<span>›</span>'}</a>${ic("search","#/activity")}${ic("bell","#/activity")}`}
function upd(){const n=$("#nav");if(!n||!S)return;let u=$("#upd");if(!u){u=document.createElement("span");u.id="upd";n.appendChild(u)}const a=Math.max(0,Math.round((Date.now()-(+new Date(S.ts)||LAST))/1000));u.textContent=a<60?`updated ${a}s ago`:`updated ${Math.round(a/60)}m ago`;u.className=a>90?"old":""}
function errRow(){upd();const e=$("#err");if(ERR&&ERR!=="nolink"&&S){const n=Math.max(0,Math.round((NEXT-Date.now())/1000));e.hidden=false;e.textContent=`Desk offline · retrying in ${n}s · last update ${time(LAST||S.ts)}`}else e.hidden=true}
setInterval(errRow,1000);
let LAST_SIG="",LAST_ROUTE="",CHART_T=0;
function dataSig(){if(!S)return ERR||"0";
 /* omit S.ts — age label updates via errRow/upd without rebuilding DOM */
 const pos=(S.positions||[]).map(p=>p.mint+":"+p.status+":"+(p.pnl_usd||p.size_usd||0)).join(",");
 const feed=((FEED&&FEED.items)||[]).slice(0,12).map(i=>i.m+":"+i.st+":"+i.liq).join(",");
 return [S.stack,S.free,S.trading_paused,S.pnl_today,pos,(S.feed&&S.feed.n)||0,SHEET,SCRUB&&SCRUB.v,SEG,RANGE,(FEED&&FEED.ts)||"",feed,S.mode].join("|")}
function render(force){const r=route();navbar(r);errRow();
 document.querySelectorAll("#tabs a").forEach(a=>a.classList.toggle("on",a.dataset.t===r||(r==="auditor"&&a.dataset.t==="agents")||(r==="coin"&&a.dataset.t==="home")));
 const v=$("#view"),car=v.querySelector(".car"),sl=car?car.scrollLeft:0;const feedSl=v.querySelector("#feedList")?.scrollTop||0;
 if(ERR==="nolink"){v.innerHTML=pair();bindPair();LAST_SIG="";return}
 if(!S){v.innerHTML=ERR?`<div class="empty"><b>Desk offline</b>Can't reach your desk right now. Retrying every 15 seconds.</div>`:skeleton(r);LAST_SIG="";return}
 const sig=dataSig()+"|"+r+"|"+(location.hash||"");
 if(!force&&sig===LAST_SIG&&r===LAST_ROUTE&&v.dataset.r===r){/* ts-only / noop */return}
 LAST_SIG=sig;LAST_ROUTE=r;
 v.dataset.r=r;v.innerHTML=({home,agents,auditor,coin,activity,account,replay,feed}[r]||home)();
 const c2=v.querySelector(".car");if(c2){c2.scrollLeft=sl;c2.onscroll=()=>{const i=Math.round(c2.scrollLeft/(c2.firstElementChild.offsetWidth+12));v.querySelectorAll(".dots i").forEach((d,j)=>d.classList.toggle("on",j===i))}}const fl=v.querySelector("#feedList");if(fl)fl.scrollTop=feedSl;
 if(r==="home"){rollOdo();bindHome(v);drawChart(false);drawMiniCharts();if(BALDIR&&!RM){const b=$(".big");b.classList.add(BALDIR>0?"gu":"gd");setTimeout(()=>b.classList.remove("gu","gd"),1400);if(BALDIR>0)burstAt(".big");}BALDIR=0;if(PENDBURST){burstAt(".big");win();PENDBURST=0}v.querySelectorAll(".range button").forEach(b=>b.onclick=()=>{RANGE=b.dataset.r;localStorage.setItem("range",RANGE);v.querySelectorAll(".range button").forEach(x=>x.classList.toggle("on",x===b));drawChart(true)})}
 if(r==="coin")drawCandles();if(r==="replay")rpBind(v);bindStars(v);if(r==="auditor")drawDisc();
 if(r==="activity"||r==="home")bindFlip(v);bindAcct(v);v.querySelectorAll(".seg a").forEach(a=>a.onclick=e=>{e.preventDefault();SEG=a.dataset.s;render()});
 if(r==="feed"){bindFeed(v);startFeedPoll()}else stopFeedPoll()}
function skeleton(r){const b=(h,w,mt,br)=>`<div class="sk" style="height:${h}px;${w?"width:"+w+";":""}margin-top:${mt||0}px;${br?"border-radius:"+br+"px":""}"></div>`,rows=n=>`<div class="list nb">${Array.from({length:n},()=>`<div class="li"><div class="sk" style="width:32px;height:32px;border-radius:50%"></div><div class="m">${b(12,"60%")}${b(10,"35%",6)}</div>${b(12,"20%")}</div>`).join("")}</div>`;
 r=r||route();if(r==="coin")return`<div class="skw"><div style="display:flex;gap:12px;align-items:center;margin-top:4px"><div class="sk" style="width:48px;height:48px;border-radius:50%"></div><div style="flex:1">${b(22,"55%")}${b(12,"30%",6)}</div></div>${b(160,"",12,16)}${b(48,"",8,24)}${b(18,"30%",16)}${rows(4)}</div>`;
 if(r==="agents"||r==="auditor")return`<div class="skw">${b(28,"40%",4)}${b(200,"",12,24)}${b(18,"35%",16)}${rows(5)}</div>`;
 if(r==="activity")return`<div class="skw">${b(28,"40%",4)}${b(34,"",12,9)}${rows(7)}</div>`;
 if(r==="feed")return`<div class="skw">${b(28,"40%",4)}${rows(6)}</div>`;
 if(r==="account")return`<div class="skw">${b(28,"40%",4)}${b(110,"",12,16)}${b(160,"",16,16)}${b(200,"",16,16)}</div>`;
 return`<div class="skw">${b(26,"",4)}${b(46,"60%",8)}${b(16,"40%",8)}${b(120,"",12,16)}${b(30,"",8,10)}${b(18,"30%",12)}${rows(1)}${b(18,"35%",12)}${b(70,"",6,14)}${b(18,"40%",12)}${rows(2)}</div>`}
function pair(){return`<div class="pt">Link your desk</div><div class="list nb" style="padding:20px 16px"><div class="l2" style="font-size:var(--t2)">Paste the desk link from your chat. It ends in <span class="mono">#d=…</span> and is saved on this phone only.</div><input id="lnk" class="f" placeholder="Paste link" autocomplete="off" autocapitalize="off"><button id="lnkb" class="btn">Link desk</button></div>`}
function bindPair(){$("#lnkb").onclick=()=>{const raw=$("#lnk").value||"",m=raw.match(/[#&]d=([A-Za-z0-9_-]{32,})/);if(!m){alert("That link has no #d= part");return}localStorage.setItem("dp",m[1]);const k=(raw.match(/[#&]k=([A-Za-z0-9_-]+)/)||[])[1];if(k)localStorage.setItem("ck",k);location.hash="#/home";location.reload()}}
/* ---------- home ---------- */
function home(){const start=C?.start||S.settings?.["desk.paper_start_stack"]||S.stack;
 const tot=S.stack-start, tpct=start?100*tot/start:0, tdy=S.pnl_today||0;
 const bal="$"+f2(S.stack),html=odo(bal,prevBal);if(prevBal!=null&&prevBal!==bal)BALDIR=S.stack>prevStack?1:-1;prevBal=bal;prevStack=S.stack;
 const open=S.positions.filter(p=>p.status==="open"||p.status==="exiting");
 const age=Math.max(0,Math.round((Date.now()-(+new Date(S.ts)||LAST))/1000)),healthy=age<60;
 const paused=!!S.trading_paused, stats=S.stats||{};
 return `<div class="homev12">
 <div class="hrow slim">${healthDot(healthy,age)}<span class="hchip muted">${S.mode}</span>
 <a class="hchip feed-jump" href="#/feed">Live · ${(S.feed&&S.feed.n)||(FEED&&FEED.n)||"–"}</a>
 <button class="pause ${paused?"on":""}" id="pauseBtn" aria-pressed="${paused}">${paused?"▶ Resume":"⏸ Pause"}</button></div>
 <div class="hero" id="heroTap" role="button" tabindex="0" aria-label="Open balance details">
  <div class="hero-top"><div class="big num" aria-label="${bal}">${html}</div>${paused?'<span class="pill p-n">Paused</span>':""}</div>
  <div class="hero-pnl num ${tot>=0?"up":"dn"}">${tot>=0?"+":"-"}$${f2(Math.abs(tot))} <span class="hero-pct">${tpct>=0?"+":""}${tpct.toFixed(2)}%</span></div>
  <div class="hero-sub l2">All time · today <span class="num ${tdy>=0?"up":"dn"}">${tdy>=0?"+":"-"}$${f2(Math.abs(tdy))}</span>${SCRUB?` · <span class="scrub-inline">${esc(SCRUB.label)} <b class="${SCRUB.v>=start?"up":"dn"}">${usd(SCRUB.v)}</b></span>`:""}</div>
 </div>
 <div class="chwrap hero-ch"><canvas class="chart" id="ch"></canvas>
  <div class="range">${["LIVE","1H","4H","1D","1W","ALL"].map(r=>`<button data-r="${r}" class="${r===RANGE?"on":""}">${r}</button>`).join("")}</div>
  <div class="tap-hint">Drag chart for balance · tap balance for details</div>
 </div>
 <div class="car charts-car" id="chartCar">
  ${chartCard("Daily P&L",`<canvas id="cDaily" class="mini-c"></canvas>`)}
  ${chartCard("Win / loss",`<canvas id="cDonut" class="mini-c"></canvas><div class="donut-lbl num">${stats.win_rate!=null?stats.win_rate+"%":"—"}<span>win rate</span></div>`)}
  ${chartCard("Per trade",`<canvas id="cTrades" class="mini-c"></canvas>`)}
 </div>
 <div class="dots charts-dots"><i class="on"></i><i></i><i></i></div>
 ${open.length?`<div class="open-mini"><div class="sh"><h2>Open · ${open.length}</h2></div><div class="list">${open.slice(0,1).map(posRow).join("")}</div></div>`:""}
 </div>${SHEET?pnlSheet(start):""}`}
function chartCard(title,inner){return`<div class="ag chart-card"><div class="hd"><span class="nm">${title}</span></div><div class="cbody">${inner}</div></div>`}
function healthDot(ok,age){return`<span class="hchip health" title="Desk data age"><i class="dot" style="background:${ok?"var(--g)":"var(--o)"}"></i>${ok?"Live":age+"s"}</span>`}
function pnlSheet(start){const stats=S.stats||{},tot=S.stack-start,pct=start?100*tot/start:0,wr=stats.win_rate,inc=S.incubator||{},ds=S.daily_summary||{};
 const row=(k,v,cls="")=>`<div class="li"><div class="m l2" style="font-size:var(--t2)">${k}</div><div class="v num ${cls}">${v}</div></div>`;
 return`<div class="sheet" id="sheet"><div class="shdim" id="shdim"></div><div class="shpanel" role="dialog" aria-label="Balance details">
 <div class="shgrab"></div><div class="pt" style="font-size:var(--t4);margin:0 0 var(--s2)">Balance</div>
 <div class="sheet-charts"><canvas id="sDaily" class="sheet-c"></canvas><canvas id="sDonut" class="sheet-c"></canvas></div>
 <div class="list nb">${row("Balance",usd(S.stack))}${row("Free cash",usd(S.free))}${row("Starting",usd(start))}
 ${row("Total P&L",`${tot>=0?"+":"-"}$${f2(Math.abs(tot))} (${pct>=0?"+":""}${pct.toFixed(2)}%)`,tot>=0?"up":"dn")}
 ${row("Today's P&L",`${(S.pnl_today||0)>=0?"+":"-"}$${f2(Math.abs(S.pnl_today||0))}`,(S.pnl_today||0)>=0?"up":"dn")}
 ${row("Realised",usd(stats.realized),(stats.realized||0)>=0?"up":"dn")}${row("Open P&L",usd(stats.open_pnl),(stats.open_pnl||0)>=0?"up":"dn")}
 ${row("Win rate",wr!=null?wr+"% · "+(stats.wins||0)+"W/"+(stats.losses||0)+"L":"—")}
 ${row("Trades",stats.trades??"—")}
 ${row("Best",stats.best?`${esc(stats.best.name)} +$${f2(stats.best.pnl)}`:"—","up")}
 ${row("Worst",stats.worst?`${esc(stats.worst.name)} -$${f2(Math.abs(stats.worst.pnl))}`:"—","dn")}
 ${row("Max drawdown","-$"+f2(stats.max_dd||0),"dn")}
 ${row("Watching new",(inc.incubating||0)+" coins")}
 ${row("Today's trades",(ds.trades??stats.trades_today??0)+(ds.final?" · final":""))}</div>
 <button class="btn sec" id="shclose">Close</button></div></div>`}
function ticker(){const seen=new Set(),it=[];for(const p of S.positions)if((p.status==="open"||p.status==="exiting")&&!seen.has(p.mint)){seen.add(p.mint);it.push({mint:p.mint,name:p.name,image:p.image,tag:"holding",h1:null,live:1})}
 for(const f of S.scanner.feed)if(f.verdict==="pass"&&!seen.has(f.mint)&&it.length<14){seen.add(f.mint);it.push({mint:f.mint,name:f.name,image:f.image,h1:f.h1,liq:f.liq,pass:f.verdict==="pass"})}
 if(!it.length)return"";const one=it.map(c=>`<a class="tk" href="#/coin/${esc(c.mint)}">${logo(c.name,c.image||imgOf(c.mint),c.mint,20)}<b>${esc((c.name||c.mint.slice(0,5)).slice(0,16))}</b>${c.live?'<span class="up">● holding</span>':c.h1!=null?`<span class="${c.h1>=0?"up":"dn"} num">${c.h1>=0?"+":""}${Number(c.h1).toFixed(1)}%</span>`:`<span class="l3 num">$${kfmt(c.liq)}</span>`}</a>`).join("");
 return`<div class="tkr${RM?" still":""}" aria-label="Coins the desk is watching"><div class="tkt" style="--n:${it.length}">${one}${RM?"":one}</div></div>`}
function posRow(p){return`<div class="li"><a href="#/coin/${esc(p.mint)}" class="ico0">${logo(p.name,p.image||imgOf(p.mint),p.mint)}</a><a class="m" href="#/coin/${esc(p.mint)}"><div class="t">${esc(p.name)}</div><div class="s num">${usd(p.size_usd)} · stop <span class="mono">-${p.stop_pct}%</span></div></a>${ext(p.link,'Sell on FOMO','sell')}</div>`}
const RMS={LIVE:15*60e3,"1H":36e5,"4H":4*36e5,"1D":864e5,"1W":7*864e5,ALL:1e15};
let chartPrev=null;
function drawChart(anim){const cv=$("#ch");if(!cv)return;const dpr=devicePixelRatio||1,W=cv.clientWidth,H=cv.clientHeight;cv.width=W*dpr;cv.height=H*dpr;const x=cv.getContext("2d");x.scale(dpr,dpr);
 const start=C?.start||0,now=Date.now(),pts=((C&&C.points)||[]).map(p=>({t:+new Date(p.t),v:start+p.v})).filter(p=>now-p.t<=RMS[RANGE]);
 const t0=Math.min(now-(RANGE==="ALL"?(pts.length?now-pts[0].t+6e5:36e5):RMS[RANGE]),...pts.map(p=>p.t));
 const series=[{t:t0,v:pts.length?(pts[0].v-0):start},...pts,{t:now,v:S.stack}];
 const vs=series.map(p=>p.v).concat(start),mn=Math.min(...vs),mx=Math.max(...vs),span=Math.max(mx-mn,(start||1)*.04),mid=(mx+mn)/2,pad=0;const mn2=mid-span*.6,mx2=mid+span*.6;
 const sx=t=>(t-t0)/((now-t0)||1)*(W-8)+4,sy=v=>H-14-(v-mn2)/(mx2-mn2)*(H-28);
 const up=S.stack>=start,col=up?"#00d35a":"#ff453a";
 const target=series.map(p=>[sx(p.t),sy(p.v)]);CHSERIES=series.map(p=>({t:p.t,v:p.v}));const from=chartPrev&&chartPrev.length===target.length&&anim!==false?chartPrev:target;chartPrev=target;
 const t1=performance.now();
 function frame(){const k=RM?1:Math.min(1,(performance.now()-t1)/250),e=1-Math.pow(1-k,3),P=target.map((p,i)=>[p[0],from[i][1]+(p[1]-from[i][1])*e]);
  x.clearRect(0,0,W,H);
  x.setLineDash([2,4]);x.strokeStyle="rgba(235,235,245,.3)";x.lineWidth=1;x.beginPath();x.moveTo(0,sy(start));x.lineTo(W,sy(start));x.stroke();x.setLineDash([]);
  const g=x.createLinearGradient(0,0,0,H);g.addColorStop(0,up?"rgba(0,211,90,.28)":"rgba(255,69,58,.28)");g.addColorStop(1,"rgba(0,0,0,0)");
  x.beginPath();P.forEach((p,i)=>i?x.lineTo(p[0],p[1]):x.moveTo(p[0],p[1]));x.lineTo(P.at(-1)[0],H);x.lineTo(P[0][0],H);x.closePath();x.fillStyle=g;x.fill();
  x.beginPath();P.forEach((p,i)=>i?x.lineTo(p[0],p[1]):x.moveTo(p[0],p[1]));x.strokeStyle=col;x.lineWidth=2.25;x.lineJoin="round";x.stroke();
  P.slice(1,-1).forEach(p=>{x.beginPath();x.arc(p[0],p[1],3,0,7);x.fillStyle="#000";x.fill();x.lineWidth=2;x.strokeStyle=col;x.stroke()});
  const l=P.at(-1);x.beginPath();x.arc(l[0]-2,l[1],4.5,0,7);x.fillStyle=col;x.fill();
  if(k<1)requestAnimationFrame(frame)}
 frame()}
/* ---------- home binds + mini charts ---------- */
function bindHome(v){
 const hero=$("#heroTap");if(hero){const open=e=>{if(e.target.closest&&e.target.closest(".pause,#ch,.range,.charts-car,.open-mini"))return;SHEET=1;render()};hero.onclick=open;hero.onkeydown=e=>{if(e.key==="Enter"||e.key===" "){e.preventDefault();open(e)}}};
 const dim=$("#shdim"),cl=$("#shclose");if(dim)dim.onclick=()=>{SHEET=0;render()};if(cl)cl.onclick=()=>{SHEET=0;render()};
 const pb=$("#pauseBtn");if(pb)pb.onclick=e=>{e.preventDefault();e.stopPropagation();togglePause()};
 const car=v.querySelector("#chartCar");if(car){car.onscroll=()=>{const w=(car.firstElementChild?.offsetWidth||1)+12;const i=Math.round(car.scrollLeft/w);v.querySelectorAll(".charts-dots i").forEach((d,j)=>d.classList.toggle("on",j===i))}}
 const cv=$("#ch");if(cv&&CHSERIES&&CHSERIES.length){
  const hit=ev=>{const r=cv.getBoundingClientRect(),x=((ev.touches?ev.touches[0].clientX:ev.clientX)-r.left)/Math.max(1,r.width);
   const t0=CHSERIES[0].t,t1=CHSERIES.at(-1).t,tt=t0+Math.max(0,Math.min(1,x))*(t1-t0);
   const best=CHSERIES.reduce((a,p)=>Math.abs(p.t-tt)<Math.abs(a.t-tt)?p:a);
   const d=new Date(best.t),label=d.toLocaleString([],{month:"short",day:"numeric",hour:"numeric",minute:"2-digit"});
   SCRUB={v:best.v,label};const el=v.querySelector(".scrub-inline");const start=C?.start||200;
   if(el)el.innerHTML=`${esc(label)} <b class="${best.v>=start?"up":"dn"}">${usd(best.v)}</b>`; else render();
  };
  let dragging=0;
  cv.onpointerdown=ev=>{dragging=1;ev.stopPropagation();cv.setPointerCapture?.(ev.pointerId);hit(ev)};
  cv.onpointermove=ev=>{if(dragging)hit(ev)};
  cv.onpointerup=cv.onpointercancel=()=>{dragging=0};
 }
}
async function togglePause(){if(PAUSEBUSY)return;const k=CK();
 if(!k){alert("This phone is missing the pause key. Open the fresh desk link from Discord (it has &k=…), then Add to Home Screen.");return}
 PAUSEBUSY=1;const want=!S.trading_paused;
 const body=JSON.stringify({paused:want,k,ts:new Date().toISOString()});
 const putOnce=async()=>{const put=S?.control_put;if(!put)throw new Error("pause URL not ready");
  const r=await fetch(put,{method:"PUT",headers:{"Content-Type":"application/json","x-upsert":"true"},body});
  if(!r.ok)throw new Error("HTTP "+r.status);return r};
 try{
  try{await putOnce()}catch(e1){await tick();await putOnce()}
  S.trading_paused=want;render();setTimeout(()=>tick(),1200);
 }catch(e){alert("Couldn't update pause ("+e.message+"). Wait for Live, then try again.")}
 finally{PAUSEBUSY=0}}
function drawMiniCharts(){const stats=S?.stats||{},G=getComputedStyle(document.documentElement),cg=G.getPropertyValue("--g").trim()||"#00d35a",cr=G.getPropertyValue("--r").trim()||"#ff453a",cl=G.getPropertyValue("--l3").trim()||"rgba(235,235,245,.3)";
 const fit=(id)=>{const cv=$(id);if(!cv)return null;const dpr=devicePixelRatio||1,W=cv.clientWidth||(cv.parentElement&&cv.parentElement.clientWidth)||280,H=cv.clientHeight||100;cv.width=W*dpr;cv.height=H*dpr;const x=cv.getContext("2d");x.setTransform(dpr,0,0,dpr,0,0);return{x,W,H}};
 const bars=(id,items,key)=>{const c=fit(id);if(!c)return;if(!items||!items.length){c.x.fillStyle=cl;c.x.font="12px -apple-system,system-ui";c.x.textAlign="center";c.x.fillText("No trades yet",c.W/2,c.H/2);return}
  const vs=items.map(i=>i[key]),mx=Math.max(...vs.map(Math.abs),1),n=items.length,gap=4,bw=(c.W-gap*(n+1))/n,mid=c.H*0.55;
  c.x.strokeStyle=cl;c.x.setLineDash([3,4]);c.x.beginPath();c.x.moveTo(0,mid);c.x.lineTo(c.W,mid);c.x.stroke();c.x.setLineDash([]);
  items.forEach((it,i)=>{const v=it[key],h=Math.max(2,(Math.abs(v)/mx)*(c.H*0.4)),x0=gap+i*(bw+gap),y=v>=0?mid-h:mid;c.x.fillStyle=v>=0?cg:cr;c.x.fillRect(x0,y,bw,h)})};
 const donut=(id)=>{const c=fit(id);if(!c)return;const w=stats.wins||0,l=stats.losses||0,tot=w+l,cx=c.W/2,cy=c.H/2,R=Math.min(cx,cy)-8,r=R*0.62;
  const arc=(a0,a1,col)=>{c.x.beginPath();c.x.arc(cx,cy,R,a0,a1);c.x.arc(cx,cy,r,a1,a0,true);c.x.closePath();c.x.fillStyle=col;c.x.fill()};
  if(!tot){c.x.beginPath();c.x.arc(cx,cy,R,0,7);c.x.arc(cx,cy,r,7,0,true);c.x.fillStyle=cl;c.x.fill();return}
  const a=w/tot*Math.PI*2;arc(-Math.PI/2,-Math.PI/2+a,cg);arc(-Math.PI/2+a,-Math.PI/2+Math.PI*2,cr)};
 bars("#cDaily",stats.daily||[],"pnl");bars("#cTrades",stats.trade_pnls||[],"pnl");donut("#cDonut");
 if(SHEET){bars("#sDaily",stats.daily||[],"pnl");donut("#sDonut")}
}
/* ---------- agents ---------- */
function agentSt(a){const s=S.agents[a]||{};return s.paused?`<span class="pill p-n">Paused</span>`:s.alive?`<span class="pill p-g"><i class="dot" style="background:var(--g)"></i>Live</span>`:`<span class="pill p-r">Down</span>`}
const AC=["#64d2ff","#0a84ff","#ffd60a","#00d35a","#ff6b9a"];
function cards(){const au=S.auditor.live,an=S.analyst.live,ex=S.executor.live,sc=S.scanner;
 const feed=sc.feed.filter(f=>SR||f.verdict==="pass").slice(0,3).map(f=>f.verdict==="pass"?`<div class="r"><span>${ext(f.link,esc(f.name||f.mint.slice(0,6)))}</span><span class="up num">liq $${kfmt(f.liq)} · → auditor</span></div>`:`<div class="r"><span class="x">${esc(f.name||f.mint.slice(0,6))}</span><span class="dn">${esc(f.reason)}</span></div>`).join("");
 const ring=s=>{const r=40,c=2*Math.PI*r,f=(s||0)/100,ok=s>=S.settings["analyst.min_score"];return`<svg width="100" height="100" viewBox="0 0 100 100"><circle cx="50" cy="50" r="${r}" stroke="#2c2c2e" stroke-width="9" fill="none"/><circle cx="50" cy="50" r="${r}" stroke="${s==null?"#2c2c2e":ok?"#00d35a":"#ff9f0a"}" stroke-width="9" fill="none" stroke-linecap="round" stroke-dasharray="${c*f} ${c}" transform="rotate(-90 50 50)"/><text x="50" y="58" text-anchor="middle" fill="#fff" style="font:600 26px -apple-system,system-ui;font-variant-numeric:tabular-nums">${s??"–"}</text></svg>`};
 const strips=L=>`<div class="strips">${[1,2,3,4,5,6,7,8].map(n=>{const l=(L||[]).find(x=>x.n===n);return`<i class="${!l?"":l.pass===true?"ok":l.pass===false?"bad":""}"></i>`}).join("")}</div>`;
 return [
 `<div class="ag"><div class="hd"><span class="nm">Scanner</span>${agentSt("scanner")}</div><div class="k num">${sc.pools} pools</div><div class="ks num">${sc.waiting} in the waiting room</div><div class="ft feed">${feed||'<div class="l3" style="font-size:var(--t2)">Waiting for the first graduation tonight.</div>'}</div></div>`,
 `<a class="ag" href="#/auditor"><div class="hd"><span class="nm">Auditor</span>${agentSt("auditor")}</div><div class="k num">${S.auditor.taken} taken apart</div><div class="ks num">${S.auditor.rejected} rejected</div><div class="ft">${au?`<div style="font-size:var(--t2)">${esc(au.name||au.mint.slice(0,6))} <span class="${au.running?"l2":au.passed?"up":"dn"}">· ${au.running?"taking apart…":au.passed?"8/8 → Analyst":esc(au.reason)}</span></div>${strips(au.layers)}`:'<div class="l3" style="font-size:var(--t2)">Nothing to audit yet.</div>'+strips([])}</div></a>`,
 `<div class="ag"><div class="hd"><span class="nm">Researcher</span>${agentSt("researcher")}</div>${(()=>{const R=S.researcher||{taken:0,killed:0,incomplete:0},rl=R.live||(R.recent||[])[0];return`<div class="k num">${R.taken} researched</div><div class="ks num">${R.killed} killed · ${R.incomplete} incomplete</div><div class="ft" style="display:flex;align-items:center;gap:14px">${ring(rl?.score)}<div style="font-size:var(--t2)">${rl?`${esc(rl.name||(rl.mint||"").slice(0,6))}<div class="l2">${esc(rl.summary||"")}</div>`:'<span class="l3">Checks socials, dev history and copycats for coins that clear the Auditor.</span>'}</div></div>`})()}</div>`,
 `<div class="ag"><div class="hd"><span class="nm">Analyst${S.analyst.mode==="rules"?" · rules":""}</span>${agentSt("analyst")}</div><div class="k num">${S.analyst.scored} scored</div><div class="ks">Passes from <span class="mono">${S.settings["analyst.min_score"]}</span></div><div class="ft" style="display:flex;align-items:center;gap:14px">${ring(an?.score)}<div style="font-size:var(--t2)">${an?`${esc(an.name)}<div class="${an.passed?"up":"dn"}">${an.passed?"Pass":"Reject"}</div>`:'<span class="l3">Scoring the next coin that clears the Auditor.</span>'}</div></div></div>`,
 `<div class="ag"><div class="hd"><span class="nm">Executor</span>${agentSt("executor")}</div><div class="k num">${S.executor.trades} trades</div><div class="ks num">${ex?`$${f2(ex.size)} · ${ex.pct.toFixed(2)}% of stack`:`${S.executor.stack_pct}% of stack per ticket`}</div><div class="ft">${ex?`<div class="up" style="font-size:var(--t2)">✓ Filled · ${esc(ex.name)}</div><div class="bar"><i style="width:100%"></i></div>`:'<div class="l3" style="font-size:var(--t2)">No tickets yet tonight.</div><div class="bar"><i style="width:0"></i></div>'}</div></div>`,
 `<div class="ag"><div class="hd"><span class="nm">Risk</span>${agentSt("risk")}</div><div class="k">${S.risk.guarding?"Guarding":"Idle"}</div><div class="ks">Last exit · ${esc(S.risk.last_exit||"none yet")}</div><div class="ft" style="display:flex;gap:8px"><span class="pill p-r mono">stop -${S.risk.stop_pct}%</span><span class="pill p-g mono">trail ${S.risk.trail_pct}%</span></div></div>`].map((h,i)=>h.replace(/class="ag"/,`class="ag" style="--ac:${AC[i]}"`))}
function chips(){return`<a class="chips" href="#/agents">${["scanner","auditor","analyst","executor","risk"].map((a,i)=>{const g=S.agents[a]||{};return`<span class="chip" style="--ac:${AC[i]}"><i class="dot" style="background:${g.paused?"var(--l3)":g.alive?AC[i]:"var(--r)"}"></i>${a[0].toUpperCase()+a.slice(1)}</span>`}).join("")}</a>`}
function carousel(){const c=cards();return`<div class="car">${c.join("")}</div><div class="dots">${c.map((_,i)=>`<i class="${i?"":"on"}"></i>`).join("")}</div>`}
function agents(){return`<div class="pt">Agents</div>${carousel()}${watchSec()}<div class="sh"><h2>Scanner feed</h2>${srT()}</div>${S.scanner.feed.filter(f=>SR||f.verdict==="pass").length?`<div class="list nb fill">${S.scanner.feed.filter(f=>SR||f.verdict==="pass").slice(0,15).map(f=>`<a class="li" href="#/coin/${esc(f.mint)}">${star(f.mint,f.name,1)}${logo(f.name,f.image,f.mint,32)}<div class="m"><div class="t" style="${f.verdict==="pass"?"":"color:var(--l3);text-decoration:line-through;text-decoration-color:var(--r)"}">${esc(f.name||f.mint.slice(0,6))}</div></div><div class="v num ${f.verdict==="pass"?"up":"dn"}">${f.verdict==="pass"?`liq $${kfmt(f.liq)} · → auditor`:esc(f.reason)}</div></a>`).join("")}</div>`:`<div class="empty"><b>${S.scanner.feed.length?"No passes yet":"No pools yet"}</b>${S.scanner.feed.length?S.scanner.feed.length+" rejects hidden. Coins that pass show up here.":"Scanner is listening for coins graduating to PumpSwap."}</div>`}`}
/* ---------- activity ---------- */
function actIcon(k){return k==="buy"?["rgba(10,132,255,.2)","var(--b)","↗"]:k==="sell"?["rgba(0,211,90,.18)","var(--g)","$"]:k==="stop"?["rgba(255,69,58,.16)","var(--r)","!"]:["#2c2c2e","var(--l2)","×"]}
function actList(it,emptyText){if(!it.length)return`<div class="list nb"><div class="empty" style="padding:28px 20px">${emptyText}</div></div>`;
 return`<div class="list">${it.map(a=>{const[bg,fg,g]=actIcon(a.kind);if(FLIP&&(a.kind==="buy"||a.kind==="sell"||a.kind==="stop"))return flipCard(a,bg,fg,g);return`<a class="li" href="${a.mint?"#/coin/"+esc(a.mint):"#/activity"}"><div class="ico" style="background:${bg};color:${fg}">${g}</div><div class="m"><div class="t">${esc(a.title)}</div><div class="s">${esc(a.sub)}</div></div><div class="v num ${a.kind==="reject"?"l3":a.kind==="stop"?"dn":"up"}">${esc(a.value)}<div class="s l3">${time(a.ts)}</div></div></a>`}).join("")}</div>`}
let FLIP=false;const FLIPPED=new Set();
function flipCard(a,bg,fg,g){const d=coinCache[a.mint],L=d?.audit?.layers||[],an=d?.analysis,on=FLIPPED.has(a.id);
 const back=d===undefined?'<div class="l3" style="font-size:var(--t2)">Loading why…</div>':!L.length?'<div class="l3" style="font-size:var(--t2)">No audit saved for this coin.</div>':
  `<div class="why">${L.map(l=>`<div class="wy"><span class="ck ${l.pass===true?"ok":l.pass===false?"bad":""}">${l.pass===true?"✓":l.pass===false?"✕":l.n}</span><span class="wn">${esc(l.name)}</span><span class="wv num">${esc(l.value)}</span></div>`).join("")}</div>${an?`<div class="l2 num" style="font-size:var(--t1);margin-top:8px">Analyst score <b class="${an.passed?"up":"dn"}">${esc(an.score)}</b> · passes from ${esc(S.settings["analyst.min_score"])}</div>`:""}${a.mint?`<a class="rpb" href="#/replay/${esc(a.mint)}">▶ Replay</a>`:""}`;
 return`<div class="fc${on?" on":""}" data-id="${esc(a.id)}" data-m="${esc(a.mint)}" role="button" tabindex="0" aria-pressed="${on}"><div class="fi"><div class="ff li">${a.mint?logo(a.title.replace(/^(Bought|Sold|Stopped out of|Stop)\s+/,""),imgOf(a.mint)||d?.image,a.mint):`<div class="ico" style="background:${bg};color:${fg}">${g}</div>`}<div class="m"><div class="t">${esc(a.title)}</div><div class="s">${esc(a.sub)} · <span style="color:var(--cy)">tap for why</span></div></div><div class="v num ${a.kind==="stop"?"dn":"up"}">${esc(a.value)}<div class="s l3">${time(a.ts)}</div></div></div>
 <div class="fb"><div class="hd2"><b>Why the desk bought ${esc(a.title.replace(/^(Bought|Sold|Stopped out of|Stop)\s+/,""))}</b>${a.mint?`<a href="#/coin/${esc(a.mint)}" class="l2" style="font-size:var(--t1)">Coin ›</a>`:""}</div>${back}</div></div></div>`}
function bindFlip(v){v.querySelectorAll(".fc").forEach(el=>{const t=e=>{if(e.target.closest("a"))return;const id=+el.dataset.id,m=el.dataset.m;FLIPPED.has(id)?FLIPPED.delete(id):FLIPPED.add(id);el.classList.toggle("on");el.classList.remove("anim");void el.offsetWidth;el.classList.add("anim");el.setAttribute("aria-pressed",el.classList.contains("on"));
  if(m&&coinCache[m]===undefined){coinCache[m]=undefined;get("coin/"+m+".json").then(d=>{coinCache[m]=d;render()}).catch(()=>{coinCache[m]=null;render()})}};el.onclick=t;el.onkeydown=e=>{if(e.key==="Enter"||e.key===" "){e.preventDefault();t(e)}}})}
function activity(){FLIP=true;setTimeout(()=>FLIP=false);const it=(A&&A.items)||[],f=SEG==="all"?it.filter(a=>SR||a.kind!=="reject"):it.filter(a=>SEG==="trades"?a.kind!=="reject":a.kind==="reject");
 return`<div class="pt">Activity ${srT()}</div><div class="seg"><a href="#" data-s="all" class="${SEG==="all"?"on":""}">All</a><a href="#" data-s="trades" class="${SEG==="trades"?"on":""}">Trades</a><a href="#" data-s="rejects" class="${SEG==="rejects"?"on":""}">Rejects</a></div><div class="fillw">${actList(f,"Nothing here yet tonight.")}</div>`}
/* ---------- auditor ---------- */
function auditData(){const au=S.auditor.live,rec=S.auditor.recent;return au||rec[0]}
function auditor(){const a=auditData();if(!a)return`<div class="empty"><b>No audits yet</b>The Auditor takes apart every coin the Scanner passes, 8 layers deep.</div>`;
 const L=a.layers||[],rec=S.auditor.recent.find(x=>x.mint===a.mint);
 return`<div style="text-align:center;margin-top:6px"><div style="font:700 var(--t5) var(--disp)">${esc(a.name||a.mint.slice(0,6))}</div><div class="l2 num" style="margin-top:4px">${L.filter(l=>l.pass).length} of 8 layers clear${a.running?" · taking apart…":""}</div></div>
 <canvas id="disc" class="disc" style="width:300px;height:250px"></canvas>
 <div class="list nb">${[1,2,3,4,5,6,7,8].map(n=>{const l=L.find(x=>x.n===n)||{n,name:"",value:"not checked"};return`<div class="lay"><div class="ck ${l.pass===true?"ok":l.pass===false?"bad":""}">${l.pass===true?"✓":l.pass===false?"✕":n}</div><div style="flex:1;font-size:var(--t3)">${esc(l.name)}</div><div class="num ${l.pass===false?"dn":l.pass?"":"l3"}" style="font-size:var(--t2)">${esc(l.value)}</div></div>`}).join("")}</div>
 ${rec?`<a class="btn sec" href="#/coin/${esc(a.mint)}">Open coin</a>`:""}
 <div class="sh"><h2>Recent</h2></div><div class="list nb">${S.auditor.recent.map(r=>`<a class="li" href="#/coin/${esc(r.mint)}"><div class="m"><div class="t mono" style="font-size:var(--t2)">${esc(r.mint.slice(0,4)+"…"+r.mint.slice(-4))}</div></div><div class="v ${r.passed?"up":"dn"}">${esc(r.passed?"8/8":r.reason)}</div><span class="chev">›</span></a>`).join("")}</div>`}
function drawDisc(){const cv=$("#disc"),a=auditData();if(!cv||!a)return;const dpr=devicePixelRatio||1,W=300,H=250;cv.width=W*dpr;cv.height=H*dpr;const x=cv.getContext("2d");x.scale(dpr,dpr);
 const L=a.layers||[],cur=L.filter(l=>l.pass!==null&&l.pass!==undefined).length;const t0=performance.now();
 function f(){x.clearRect(0,0,W,H);for(let i=7;i>=0;i--){const l=L.find(z=>z.n===i+1),y=40+i*24,col=!l||l.pass==null?"#2c2c2e":l.pass?"#00d35a":"#ff453a";
   x.beginPath();x.ellipse(W/2,y+6,110-i*4,22,0,0,7);x.fillStyle="#1c1c1e";x.fill();x.beginPath();x.ellipse(W/2,y,110-i*4,22,0,0,7);x.fillStyle=col==="#2c2c2e"?"#2c2c2e":col;x.globalAlpha=col==="#2c2c2e"?1:.9;x.fill();x.globalAlpha=1;
   x.fillStyle=col==="#2c2c2e"?"rgba(235,235,245,.6)":"#000";x.font="600 12px -apple-system,system-ui";x.textAlign="center";x.fillText(String(i+1),W/2,y+4)}
  if(a.running||!RM){const i=Math.min(cur,7),y=40+i*24,ph=RM?0:((performance.now()-t0)/1400)%1,bx=W/2-100+200*(a.running?ph:.5);
   x.fillStyle="rgba(100,210,255,.85)";x.fillRect(bx-1,y-30,2,60);x.beginPath();x.ellipse(W/2,y,110-i*4,22,0,0,7);x.strokeStyle="#64d2ff";x.lineWidth=1.5;x.stroke()}
  if(a.running&&!RM&&route()==="auditor")requestAnimationFrame(f)}
 f()}
/* ---------- coin ---------- */
function coin(){const m=(location.hash.match(/#\/coin\/(\w+)/)||[])[1],d=coinCache[m];
 const fd=(S&&S.scanner.feed||[]).find(f=>f.mint===m),sp=(S&&S.positions||[]).find(p=>p.mint===m);
 if(!d&&!fd&&!sp)return COINMISS[m]?`<div class="empty"><b>No data for this coin yet</b>It shows up once the desk has read it.</div>`:skeleton("coin");
 const D=d||{},sc=D.scan||{},c=Object.assign({},fd||{},sp||{},D.coin||{}),pos=(D.positions||[])[0]||sp,held=pos&&(pos.status==="open"||pos.status==="exiting"),pr=D.prices||[],last=pr.at(-1)?.price||+sc.priceUsd||fd?.price,first=pr[0]?.price,ch=first?100*(last/first-1):0;
 const link=D.link||fd?.link||sp?.link,au=D.audit,an=D.analysis,L=(au&&au.layers)||[],lv=n=>(L.find(l=>l.n===n)||{}).value;
 const liq=sc.liquidityUsd??fd?.liq,row=(k,v,cls="")=>`<div class="li" style="min-height:40px"><div class="m l2" style="font-size:var(--t2)">${k}</div><div class="v num ${cls}">${v}</div></div>`;
 const pnl=pos?(pos.status==="closed"?pos.pnl_usd:(last&&pos.entry_price?pos.size_usd*(last/pos.entry_price-1):null)):null;
 const AQ={alive_6h:"Still alive 6h",organic:"Organic volume",flush:"Survived the flush",chase:"Not a chase"};
 return`<div class="cd"><div style="display:flex;gap:12px;align-items:center;margin-top:4px">${logo(c.name,D.image||c.image||imgOf(m),m,48)}<div style="min-width:0"><div style="font:700 var(--t5) var(--disp);letter-spacing:-.02em;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${esc(c.name||m.slice(0,6))}</div><div class="l2" style="font-size:var(--t1)">${esc(c.symbol||"")}${held?' · <span class="up">holding</span>':""}</div></div>
 <div style="margin-left:auto;text-align:right"><div class="num" style="font:600 20px var(--disp)">${last?"$"+Number(last).toPrecision(4):"—"}</div><div class="num ${ch>=0?"up":"dn"}" style="font-size:var(--t1)">${pr.length>1?(ch>=0?"+":"")+ch.toFixed(2)+"%":""}</div></div></div>
 <canvas id="cn" class="chart" style="height:160px"></canvas>
 <div class="cdb"><a class="btn sec rpbig" href="#/replay/${esc(m)}">▶ Replay</a>${star(m,c.name)}</div>${held?ext(link,"Sell on FOMO","btn"):`${ext(link,"Buy on FOMO","btn")}<div class="l3" style="font-size:var(--t1);text-align:center;margin-top:6px">Tell Grok Bot “bought ${esc(c.name||c.symbol||"this coin")}” to track it</div>`}
 ${pos?`<div class="sh"><h2>Position</h2></div><div class="list nb">${row("Entry",pos.entry_price?"$"+Number(pos.entry_price).toPrecision(4):"—")}${row("Size",usd(pos.size_usd))}${row("Stop",`<span class="mono">-${pos.stop_pct}%</span>`)}${pnl!=null?row(pos.status==="closed"?"P&L (closed)":"P&L (now)",`${pnl>=0?"+":"-"}$${f2(Math.abs(pnl))}`,pnl>=0?"up":"dn"):""}</div>`:""}
 <div class="sh"><h2>Market</h2></div><div class="list nb">${row("Liquidity",liq!=null?"$"+kfmt(liq):"—")}${row("Holders",au?.holders??c.holders??"—")}${row("Top 10 hold",lv(4)??(sc.top10Pct!=null?sc.top10Pct+"%":"—"))}${row("Dev wallet",lv(3)??"—")}${row("Insiders / bundles",lv(7)??"—")}</div>
 <div class="sh"><h2>Audit</h2><span class="l2" style="font-size:var(--t1)">${au?(au.passed?"8/8 clear":esc(au.reason||"failed")):"not audited"}</span></div>
 ${L.length?`<div class="list nb">${L.map(l=>`<div class="lay" style="min-height:40px"><span class="ck ${l.pass===true?"ok":l.pass===false?"bad":""}">${l.pass===true?"✓":l.pass===false?"✕":"·"}</span><div style="flex:1;font-size:var(--t2)">${esc(l.name)}</div><div class="l2 num" style="font-size:var(--t1)">${esc(l.value??"")}</div></div>`).join("")}</div>`:`<div class="l3" style="font-size:var(--t1)">${fd&&fd.verdict!=="pass"?"Scanner rejected: "+esc(fd.reason||""):"The Auditor hasn't taken this coin apart yet."}</div>`}
 ${(()=>{const R=D.research;if(!R)return`<div class="sh"><h2>Research</h2><span class="l2" style="font-size:var(--t1)">not researched</span></div>`;return`<div class="sh"><h2>Research</h2><span class="${R.hard?"dn":R.score>=60?"up":"l2"}" style="font-size:var(--t1)">${R.hard?"killed":`score ${esc(R.score)}`}${R.incomplete?" · incomplete":""}</span></div><div class="list nb">${row("Summary",esc(R.summary||""))}${(R.green_flags||[]).slice(0,4).map(f=>row("✓",esc(f),"up")).join("")}${(R.red_flags||[]).slice(0,4).map(f=>row("✕",esc(f),"dn")).join("")}${row("Sources",esc((R.sources||[]).join(", ")||"—"))}</div>`})()}
 <div class="sh"><h2>Analyst</h2><span class="${an?(an.passed?"up":"dn"):"l2"}" style="font-size:var(--t1)">${an?`score ${an.score}${an.passed?" · pass":" · reject"}`:"not scored"}</span></div>
 ${an?`<div class="list nb">${Object.entries(an.answers||{}).map(([k,v])=>row(AQ[k]||k,v>=1?"✓":v>0?Math.round(v*100)+"%":"✕",v>=1?"up":v>0?"l2":"dn")).join("")}</div>`:""}
 <div style="height:12px"></div></div>`}
function drawCandles(){const cv=$("#cn"),m=(location.hash.match(/#\/coin\/(\w+)/)||[])[1],d=coinCache[m];if(!cv||!d)return;
 const dpr=devicePixelRatio||1,W=cv.clientWidth,H=cv.clientHeight;cv.width=W*dpr;cv.height=H*dpr;const x=cv.getContext("2d");x.scale(dpr,dpr);
 const pr=(d.prices||[]).map(p=>p.price).filter(Boolean);if(pr.length<2){x.fillStyle="rgba(235,235,245,.3)";x.font="15px -apple-system,system-ui";x.textAlign="center";x.fillText("No candles yet",W/2,H/2);return}
 const per=Math.max(1,Math.ceil(pr.length/40)),cs=[];for(let i=0;i<pr.length;i+=per){const s=pr.slice(i?i-1:0,i+per);cs.push({o:s[0],c:s.at(-1),h:Math.max(...s),l:Math.min(...s)})}if(cs.length>8)cs.shift();
 const pos=(d.positions||[])[0],line=pos&&pos.exit_line,all=pr.concat(line?[line]:[]),q=pr.slice().sort((a,b)=>a-b),qa=q[Math.floor(q.length*.03)],qb=q[Math.ceil(q.length*.97)-1],mn=Math.min(qa,line||qa),mx=Math.max(qb,line||qb),sy=v=>8+(1-(v-mn)/((mx-mn)||1))*(H-16),cw=W/cs.length;
 cs.forEach((c,i)=>{const col=c.c>=c.o?"#00d35a":"#ff453a",cx=i*cw+cw/2;x.strokeStyle=col;x.fillStyle=col;x.lineWidth=1;x.beginPath();x.moveTo(cx,sy(c.h));x.lineTo(cx,sy(c.l));x.stroke();x.save();x.beginPath();x.rect(0,0,W,H);x.clip();const y1=sy(Math.max(c.o,c.c)),y2=sy(Math.min(c.o,c.c));x.fillRect(cx-cw*.32,y1,cw*.64,Math.max(1.5,y2-y1));x.restore()});
 if(line){x.setLineDash([6,5]);x.strokeStyle="#ff9f0a";x.lineWidth=1.5;x.beginPath();x.moveTo(0,sy(line));x.lineTo(W,sy(line));x.stroke();x.setLineDash([])}}
/* ---------- account ---------- */
function account(){const s=S.settings,sp=S.spec,row=(k,v,href)=>`${href?`<a class="li" href="${esc(href)}" target="_blank" rel="noopener">`:'<div class="li">'}<div class="m" style="font-size:var(--t3)">${k}</div><div class="v l2">${v}</div>${href?'<span class="chev">›</span></a>':"</div>"}`;
 const groups={scanner:"Scanner",auditor:"Auditor",analyst:"Analyst",executor:"Executor",risk:"Risk",desk:"Desk"};
 return`<div class="pt">Account</div><div class="list nb">${row("FOMO","@"+esc(s["desk.fomo_handle"]),S.profile_url)}${row("Invite a friend","Share",S.signup_url)}</div>
 <div class="sh"><h2>Look &amp; feel</h2></div><div class="list nb">
 <div class="li"><div class="m" style="font-size:var(--t3)">Theme</div><div class="seg2" role="radiogroup">${[["dark","Dark"],["neon","Neon"]].map(([k,t])=>`<button data-theme="${k}" class="${THEME()===k?"on":""}" role="radio" aria-checked="${THEME()===k}">${t}</button>`).join("")}</div></div>
 <div class="li"><div class="m"><div style="font-size:var(--t3)">Win sound</div><div class="s l3" style="font-size:var(--t1)">Cha-ching + buzz on a win, only while the app is open</div></div><button class="tg ${SOUND()?"on":""}" id="snd" role="switch" aria-checked="${SOUND()}" aria-label="Win sound"><i></i></button></div>
 <div class="li"><div class="m" style="font-size:var(--t3)">Test it</div><button class="mini" id="tst">Play win</button></div></div>
 <div class="sh"><h2>Desk</h2></div><div class="list nb">${row("Mode",`<span class="pill ${S.mode==="PAPER"?"p-o":"p-r"}">${S.mode}</span>`)}${row("Alerts",esc((S.notifier||"").split(" (")[0].replace(" webhook","")))}${row("Web push","Not available in plan B")}${row("Balance",`<span class="num">${usd(S.stack)}</span>`)}</div>
 <div class="l3" style="font-size:var(--t1);margin:10px 4px 0">To change a setting, tell Grok Bot, for example “set stop to -8%”.</div>
 ${Object.entries(groups).map(([g,t])=>`<div class="sh"><h2>${t}</h2></div><div class="list nb">${Object.keys(s).filter(k=>k.startsWith(g+".")).map(k=>{const v=s[k],r=sp[k];return`<div class="setrow"><div class="lb"><span>${esc(k.split(".")[1].replace(/_/g," "))}</span><span class="mono l2 num">${esc(v)}</span></div>${typeof v==="number"&&r&&r[0]!=null?`<input type="range" style="--pc:${Math.max(0,Math.min(100,100*(v-r[0])/((r[1]-r[0])||1)))}%" min="${r[0]}" max="${r[1]}" step="any" value="${v}" disabled>`:""}</div>`}).join("")}</div>`).join("")}
 <div class="foot">New to FOMO? ${ext(S.signup_url,esc(S.signup_url))}</div>`}
function bindAcct(v){v.querySelectorAll("[data-theme]").forEach(b=>b.onclick=()=>{localStorage.setItem("theme",b.dataset.theme);applyTheme();render()});
 const s=v.querySelector("#snd");if(s)s.onclick=()=>{const on=!SOUND();localStorage.setItem("sound",on?"on":"off");if(on){unlockAudio();chaChing()}render()};
 const t=v.querySelector("#tst");if(t)t.onclick=()=>{if(SOUND())unlockAudio();win();burstAt("#tst")}}
addEventListener("hashchange",()=>{LAST_SIG="";render(1);fxKick();const m=(location.hash.match(/#\/(?:coin|replay)\/(\w+)/)||[])[1];if(m&&!coinCache[m]&&DP())get("coin/"+m+".json").then(d=>{coinCache[m]=d;render(1)}).catch(()=>{COINMISS[m]=1;render(1)});tick()});addEventListener("resize",()=>{if(route()==="home"){drawChart(false);drawMiniCharts()}});
let BUSY=0;async function tick(){if(BUSY)return;BUSY=1;try{await poll()}finally{BUSY=0}}
(function(){const v=$("#view"),ind=document.createElement("div");ind.id="ptr";ind.innerHTML='<svg viewBox="0 0 24 24"><path d="M12 4v12m0 0-5-5m5 5 5-5"/></svg>';document.body.appendChild(ind);
 let y0=null,dy=0,act=0,pulling=0;const T=64,top=()=>{ind.style.top=(v.getBoundingClientRect().top)+"px"};
 const atTop=e=>{if(v.scrollTop>0)return 0;let el=e&&e.target;while(el&&el!==v){const st=getComputedStyle(el),oy=st.overflowY;if((oy==="auto"||oy==="scroll"||oy==="overlay")&&el.scrollHeight>el.clientHeight+1&&el.scrollTop>0)return 0;el=el.parentElement}return 1};
 v.addEventListener("touchstart",e=>{if(act||e.touches.length>1||!atTop(e)||route()==="home"){y0=null;pulling=0;return}y0=e.touches[0].clientY;dy=0;pulling=0;top()},{passive:true});
 v.addEventListener("touchmove",e=>{if(y0==null)return;dy=e.touches[0].clientY-y0;
  if(dy<12){if(pulling){pulling=0;ind.style.opacity=0}return} /* don't steal normal scroll */
  if(!atTop(e)){y0=null;pulling=0;ind.style.opacity=0;return}
  pulling=1;e.preventDefault();const d=Math.min(90,(dy-12)*.5);ind.style.transform=`translate(-50%,${d-36}px) rotate(${Math.min(180,d/T*180)}deg)`;ind.style.opacity=Math.min(1,d/T);ind.classList.toggle("go",d>=T*.8)},{passive:false});
 v.addEventListener("touchend",async()=>{if(y0==null)return;const go=pulling&&Math.min(90,Math.max(0,dy-12)*.5)>=T*.8;y0=null;pulling=0;if(!go){ind.style.opacity=0;ind.style.transform="translate(-50%,-36px)";return}
  act=1;ind.classList.add("spin");ind.style.transform="translate(-50%,16px)";const t0=Date.now();await tick();await new Promise(r=>setTimeout(r,Math.max(0,500-(Date.now()-t0))));ind.classList.remove("spin","go");ind.style.opacity=0;ind.style.transform="translate(-50%,-36px)";act=0});
 window.PTR_DEMO=()=>{top();ind.style.opacity=1;ind.classList.add("spin");ind.style.transform="translate(-50%,16px)"}})();
render();tick();setInterval(()=>{if(!document.hidden)tick()},15000);
addEventListener("visibilitychange",()=>{if(document.hidden){stopFeedPoll();P.length=0}else{tick();if(route()==="feed")startFeedPoll();fxKick()}});addEventListener("focus",tick);addEventListener("pageshow",tick);addEventListener("online",tick);

/* ---------- watchlist ---------- */
const WL=()=>{try{return JSON.parse(localStorage.getItem("stars")||"{}")}catch(e){return{}}};
function star(m,name,sm){const on=!!WL()[m],desk=(S?.watchlist||[]).some(w=>w.mint===m);return`<button class="star${on||desk?" on":""}${sm?" sm":""}" data-star="${esc(m)}" data-nm="${esc(name||"")}" aria-label="${on?"Unstar":"Star"}" ${desk&&!on?'title="On the desk watchlist"':""}>${on||desk?"★":"☆"}</button>`}
function bindStars(v){v.querySelectorAll("[data-star]").forEach(b=>b.onclick=e=>{e.preventDefault();e.stopPropagation();const w=WL(),m=b.dataset.star;if(w[m])delete w[m];else w[m]={name:b.dataset.nm,added:Date.now()};localStorage.setItem("stars",JSON.stringify(w));render()})}
function watchSec(){const w=WL(),dw=S.watchlist||[],ms=[...new Set([...dw.map(x=>x.mint),...Object.keys(w)])];if(!ms.length)return`<div class="sh"><h2>Watchlist</h2></div><div class="l3" style="font-size:var(--t1)">Tap ☆ on a coin to watch it here. Tell Grok Bot “watch &lt;coin&gt;” to have the desk check it first every scan.</div>`;
 const feed=S.scanner.feed||[],row=m=>{const d=dw.find(x=>x.mint===m)||{},f=feed.find(x=>x.mint===m)||{},cc=coinCache[m]||{},sc=cc.scan||{},name=d.name||f.name||cc.coin?.name||w[m]?.name||m.slice(0,6),pr=d.price??f.price??sc.priceUsd,lq=d.liq??f.liq??sc.liquidityUsd;
  return`<a class="li" href="#/coin/${esc(m)}">${star(m,name,1)}${logo(name,d.image||f.image||cc.image||imgOf(m),m,32)}<div class="m"><div class="t">${esc(name)}${d.mint?' <span class="pill p-n bdg">desk</span>':""}</div><div class="s num">${lq!=null?"liq $"+kfmt(lq):"liq —"}${d.verdict?` · ${esc(d.verdict==="pass"?"passed":d.reason||d.verdict)}`:""}</div></div><div class="v num">${pr?"$"+Number(pr).toPrecision(4):"—"}${d.h1!=null?`<div class="s ${d.h1>=0?"up":"dn"}">${d.h1>=0?"+":""}${Number(d.h1).toFixed(1)}% 1h</div>`:""}</div></a>`};
 return`<div class="sh"><h2>Watchlist · ${ms.length}</h2></div><div class="list nb wl">${ms.map(row).join("")}</div>`}
/* ---------- replay ---------- */
let RP={m:null,t:0,play:1,last:0,timer:null};
function rpSteps(m){const d=coinCache[m]||{},sc=d.scan||{},fd=(S.scanner.feed||[]).find(f=>f.mint===m)||{},au=d.audit,an=d.analysis,pos=(d.positions||[])[0]||(S.positions||[]).find(p=>p.mint===m),pr=(d.prices||[]).filter(p=>p.price),alerts=((A&&A.items)||[]).filter(a=>a.kind==="alert"&&a.mint===m);
 const st=[];const liq=sc.liquidityUsd??fd.liq;
 st.push({k:"scan",ic:"🔭",t:"Scanned",v:`${liq!=null?"liq $"+kfmt(liq):"liq —"} · ${esc(sc.source||fd.source||"migration")}`,d:900});
 (au?.layers||[]).forEach(l=>st.push({k:"layer",ok:l.pass,t:`${l.n}. ${esc(l.name)}`,v:esc(l.value??""),d:450}));
 if(!au)st.push({k:"layer",t:"Audit",v:"no audit saved",d:600});
 st.push({k:"an",ic:"🧠",t:"Analyst",v:an?`score ${an.score} · ${an.passed?"pass":"reject"}`:"not scored",ok:an?an.passed:null,d:900});
 if(pos){st.push({k:"buy",ic:"🟢",t:"Paper buy",v:`$${f2(pos.size_usd)} @ $${Number(pos.entry_price).toPrecision(4)}`,d:900});
  st.push({k:"path",ic:"📈",t:"Price path",v:`${pr.length} ticks${alerts.length?` · ${alerts.length} alert${alerts.length>1?"s":""}`:""}`,d:3000,pr,alerts,pos});
  const last=pr.at(-1)?.price,pnl=pos.status==="closed"?pos.pnl_usd:(last?pos.size_usd*(last/pos.entry_price-1):null),why=pos.status==="closed"?(pos.exit_reason||"exit"):"still open";
  st.push({k:"exit",ic:pos.status==="closed"?(pnl>=0?"🏁":"🛑"):"⏳",t:pos.status==="closed"?"Exit":"Still open",v:`${esc(why)}${pnl!=null?` · <b class="${pnl>=0?"up":"dn"}">${pnl>=0?"+":"-"}$${f2(Math.abs(pnl))}</b>`:""}`,d:1200})}
 else st.push({k:"exit",ic:"·",t:"No trade",v:"the desk didn't buy this coin",d:900});
 return st}
function rpAt(st,t){let a=0;for(let i=0;i<st.length;i++){if(t<a+st[i].d)return[i,(t-a)/st[i].d];a+=st[i].d}return[st.length-1,1]}
function replay(){const m=(location.hash.match(/#\/replay\/(\w+)/)||[])[1];if(!coinCache[m]&&!COINMISS[m])return skeleton("coin");
 if(RP.m!==m){RP={m,t:0,play:!RM,last:0,timer:null}}const st=rpSteps(m),tot=st.reduce((a,s)=>a+s.d,0);if(RM)RP.t=tot;const[cur]=rpAt(st,RP.t);
 const d=coinCache[m]||{},name=d.coin?.name||m.slice(0,6);
 return`<div class="rpw"><div style="display:flex;gap:var(--s3);align-items:center;margin:var(--s1) 0 var(--s2)">${logo(name,d.image||imgOf(m),m,40)}<div style="font:700 var(--t4) var(--disp)">${esc(name)}</div></div>
 <div class="tip"><b>How replay works</b><span>Tap <b>▶ Replay</b> on a trade card or coin page to start.</span><span>It plays scan → 8 audit checks → Analyst score → buy → price moves &amp; alerts → exit with P&amp;L.</span><span>⏯ play/pause · ⏭ next step · tap any step to jump.</span></div>
 <canvas id="rpc" class="chart" style="height:110px"></canvas>
 <div class="rpbar"><i style="width:${Math.min(100,100*RP.t/tot)}%"></i></div>
 <div class="rpctl"><button data-rp="restart" aria-label="Restart">⏮</button><button data-rp="play" class="pp" aria-label="Play or pause">${RP.play?"⏸":"▶"}</button><button data-rp="next" aria-label="Next step">⏭</button></div>
 <div class="list nb rps">${st.map((s,i)=>`<div class="li rpst ${i<cur||RM?"done":i===cur?"cur":"todo"}" data-i="${i}">${s.k==="layer"?`<span class="ck ${s.ok===true?"ok":s.ok===false?"bad":""}">${s.ok===true?"✓":s.ok===false?"✕":"·"}</span>`:`<span class="rpi">${s.ic}</span>`}<div class="m"><div class="t" style="font-size:var(--t2)">${s.t}</div></div><div class="v num l2">${s.v}</div></div>`).join("")}</div></div>`}
function rpDraw(st,t){const cv=$("#rpc");if(!cv)return;const dpr=devicePixelRatio||1,W=cv.clientWidth,H=cv.clientHeight;cv.width=W*dpr;cv.height=H*dpr;const x=cv.getContext("2d");x.scale(dpr,dpr);
 const pi=st.findIndex(s=>s.k==="path");const[cur,f]=rpAt(st,t);const P=pi>=0?st[pi]:null;if(!P||P.pr.length<2){x.fillStyle="rgba(235,235,245,.3)";x.font="13px -apple-system,system-ui";x.textAlign="center";x.fillText(P?"No price ticks saved":"No trade to chart",W/2,H/2);return}
 const frac=cur<pi?0:cur>pi?1:f,pr=P.pr,n=Math.max(1,Math.round(frac*pr.length)),v=pr.map(p=>p.price),e=P.pos.entry_price,mn=Math.min(...v,e),mx=Math.max(...v,e),sy=y=>6+(1-(y-mn)/((mx-mn)||1))*(H-12),sx=i=>i/(pr.length-1)*W;
 x.setLineDash([4,4]);x.strokeStyle="rgba(235,235,245,.3)";x.beginPath();x.moveTo(0,sy(e));x.lineTo(W,sy(e));x.stroke();x.setLineDash([]);
 if(n>1){x.strokeStyle=v[n-1]>=e?"#00d35a":"#ff453a";x.lineWidth=2;x.beginPath();for(let i=0;i<n;i++)i?x.lineTo(sx(i),sy(v[i])):x.moveTo(sx(i),sy(v[i]));x.stroke();x.fillStyle=x.strokeStyle;x.beginPath();x.arc(sx(n-1),sy(v[n-1]),3.5,0,7);x.fill()}
 const t0=pr[0].ts,t1=pr.at(-1).ts;P.alerts.forEach(a=>{const ts=(+new Date(a.ts))/1000,i=Math.round((ts-t0)/((t1-t0)||1)*(pr.length-1));if(i<0||i>=n)return;x.fillStyle="#ffd60a";x.beginPath();x.moveTo(sx(i),4);x.lineTo(sx(i)-5,13);x.lineTo(sx(i)+5,13);x.fill()})}
function rpBind(v){const m=RP.m,st=rpSteps(m),tot=st.reduce((a,s)=>a+s.d,0);rpDraw(st,RP.t);clearInterval(RP.timer);
 const upd=()=>{const[cur]=rpAt(st,RP.t);v.querySelectorAll(".rpst").forEach((el,i)=>el.className=`li rpst ${i<cur||RP.t>=tot?"done":i===cur?"cur":"todo"}`);const b=v.querySelector(".rpbar i");if(b)b.style.width=Math.min(100,100*RP.t/tot)+"%";const pp=v.querySelector(".pp");if(pp)pp.textContent=RP.play?"⏸":"▶";rpDraw(st,RP.t);const c=v.querySelector(".rpst.cur");if(c&&RP.play)c.scrollIntoView({block:"nearest"})};
 const start=a=>{let s=0;for(let i=0;i<a;i++)s+=st[i].d;return s};
 RP.timer=setInterval(()=>{if(!RP.play||route()!=="replay")return;RP.t=Math.min(tot,RP.t+100);if(RP.t>=tot)RP.play=0;upd()},100);
 v.querySelectorAll("[data-rp]").forEach(b=>b.onclick=()=>{const k=b.dataset.rp;if(k==="play"){if(RP.t>=tot)RP.t=0;RP.play=!RP.play}if(k==="restart"){RP.t=0;RP.play=1}if(k==="next"){const[c]=rpAt(st,RP.t);RP.t=c+1<st.length?start(c+1):tot}upd()});
 v.querySelectorAll(".rpst").forEach(el=>el.onclick=()=>{RP.t=start(+el.dataset.i)+1;upd()})}

/* ---------- v13 live feed ---------- */
const STLABEL={watching:"Watching",graduated:"Graduated",auditing:"Auditing",passed:"Passed",bought:"Bought",failed:"Failed",expired:"Expired"};
const CKLABEL={grad:"graduated",liq:"liquidity",mint:"mint/freeze",age:"pool age",lp:"LP locked",top10:"top10",dev:"dev %",bund:"bundled",score:"score"};
function ageTxt(s){s=Math.max(0,s|0);if(s<60)return s+"s";if(s<3600)return Math.floor(s/60)+"m";return Math.floor(s/3600)+"h"+Math.floor((s%3600)/60)+"m"}
function leftTxt(s){s=Math.max(0,s|0);const m=Math.floor(s/60),ss=s%60;return m+":"+String(ss).padStart(2,"0")}
function startFeedPoll(){stopFeedPoll();let first=!FEED;const go=async()=>{if(route()!=="feed"||!DP()||document.hidden)return;try{const d=await get("feed.json");const sig=(d.ts||"")+"|"+(d.n||0)+"|"+((d.items||[]).map(i=>i.m+":"+i.st+":"+i.liq).join(","));if(sig===startFeedPoll._sig&&FEED){FEED.ts=d.ts;return}startFeedPoll._sig=sig;const prev={...FEEDPREV};(d.items||[]).forEach(it=>{if(!(it.m in FEEDSEEN))FEEDSEEN[it.m]=first?2:1;FEEDPREV[it.m]=it.st});first=0;FEED=Object.assign(d,{_prev:prev});render(1)}catch(e){}};
 go();FEEDTIMER=setInterval(go,5000)}
function stopFeedPoll(){if(FEEDTIMER){clearInterval(FEEDTIMER);FEEDTIMER=0}if(bindFeed._t){clearInterval(bindFeed._t);bindFeed._t=0}}
function feed(){const d=FEED||{items:[],floor:(S.feed&&S.feed.floor)||10000,window_s:(S.feed&&S.feed.window_s)||3600,n:0,ts:S.feed&&S.feed.ts};
 const floor=d.floor||10000,items=d.items||[];
 if(!FEED&&DP())get("feed.json").then(x=>{FEED=x;(x.items||[]).forEach(it=>FEEDSEEN[it.m]=FEEDSEEN[it.m]||2);render()}).catch(()=>{});
 return `<div class="feed-view"><div class="feed-head"><div class="pt">Live Feed</div><div class="feed-meta num">${items.length} · $${kfmt(floor)} floor · 60m window</div></div>
 <div class="feed-list" id="feedList">${items.length?items.map(feedRow).join(""):`<div class="empty"><b>Waiting for new coins</b>pump.fun and other launchpads show up here as they appear.</div>`}</div></div>`}
function feedRow(it){
 const fresh=FEEDSEEN[it.m]===1; if(fresh) setTimeout(()=>{FEEDSEEN[it.m]=2},500);
 const stCh=FEED&&FEED._prev&&FEED._prev[it.m]&&FEED._prev[it.m]!==it.st;
 const pct=Math.max(0,Math.min(100,100*(it.liq||0)/(FEED&&FEED.floor||10000)));
 const hot=(it.left||0)<300&&(it.st==="watching"||it.st==="graduated");
 const checks=(it.ck||[]).map(c=>{const id=c[0],ok=c[1],why=c[2];const cls=ok===1?"ok":ok===0?"bad":"";
  return `<span class="fck ${cls}"><span class="id">${esc(CKLABEL[id]||id)}</span> ${ok===1?"✓":ok===0?"✕":"·"} ${esc(why)}</span>`}).join("");
 return `<a class="frow ${fresh?"fresh":""} ${stCh?"st-chg":""}" href="#/coin/${esc(it.m)}">
  ${logo(it.n,it.img||imgOf(it.m),it.m,40)}
  <div class="fmain"><div class="fname">${esc((it.s||it.n||"").slice(0,18))}<span class="fage">${ageTxt(it.age)} · ${esc(it.lp||"pump")}</span></div>
   <div class="fliq"><div class="bar ${pct<40?"low":""}"><i style="width:${pct.toFixed(1)}%"></i></div>
   <div class="lbl"><span>liq ${_escLiq(it.liq)}</span><span>$${kfmt(FEED&&FEED.floor||10000)}</span></div></div></div>
  <div class="fside"><span class="fpill ${esc(it.st)}">${STLABEL[it.st]||it.st}</span>
   ${(it.st==="watching"||it.st==="graduated"||it.st==="auditing")?`<span class="fcountdown ${hot?"hot":""}">${leftTxt(it.left)}</span>`:""}</div>
  <div class="fchecks">${checks}</div></a>`}
function _escLiq(v){return v==null?"—":"$"+kfmt(v)}
function bindFeed(v){/* list scrolls itself; countdown tick */ 
 const tickLeft=()=>{if(route()!=="feed"||!FEED)return;const now=Date.now();
  v.querySelectorAll(".frow").forEach((el,i)=>{const it=(FEED.items||[])[i];if(!it)return;const cd=el.querySelector(".fcountdown");if(!cd)return;
   /* left is absolute remaining from publish; approx by age drift using FEED.ts */
   const pub=+new Date(FEED.ts)||now; const elapsed=Math.max(0,(now-pub)/1000); const left=Math.max(0,(it.left||0)-elapsed);
   cd.textContent=leftTxt(left);cd.classList.toggle("hot",left<300&&(it.st==="watching"||it.st==="graduated"))})};
 clearInterval(bindFeed._t);bindFeed._t=setInterval(tickLeft,1000);tickLeft()}
