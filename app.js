// Desk app. DATA_PATH comes from #d= (or a pasted link), lives only in localStorage. Polls public JSON every 15s.
// Every FOMO link shown here comes from the published JSON (made by links.py on the desk).
const DEMO0=/demo=sparkle/.test(location.hash);
const SUPA="https://alxvekhevjrehedmgpek.supabase.co/storage/v1/object/public/desk/d/";
(function(){const raw=location.hash.slice(1);if(!raw.includes("d="))return;const h=new URLSearchParams(raw);
 if(h.get("d")){localStorage.setItem("dp",h.get("d"));const b=h.get("b");if(b&&b.startsWith("http://localhost"))localStorage.setItem("base",b);else localStorage.removeItem("base");history.replaceState(null,"",location.pathname+"#/"+(h.get("r")||"home"));}})();
const DP=()=>localStorage.getItem("dp"),BASE=()=>(localStorage.getItem("base")||SUPA)+DP()+"/";
const RM=matchMedia("(prefers-reduced-motion: reduce)").matches;
let S=null,A=null,C=null,ERR=null,LAST=0,coinCache={},RANGE=localStorage.getItem("range")||"ALL",NEXT=Date.now()+15000,SEG="all";
const $=s=>document.querySelector(s),esc=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const f2=v=>Number(v||0).toLocaleString("en-US",{minimumFractionDigits:2,maximumFractionDigits:2});
const usd=v=>v==null?"—":(v<0?"-$":"$")+f2(Math.abs(v));
const kfmt=v=>v==null?"—":v>=1e6?(v/1e6).toFixed(1)+"M":v>=1e3?(v/1e3).toFixed(1)+"K":Number(v).toFixed(0);
const ext=(url,inner,cls="")=>url?`<a class="${cls}" href="${esc(url)}" target="_blank" rel="noopener">${inner}</a>`:inner;
const time=t=>t?new Date(t).toLocaleTimeString([], {hour:"numeric",minute:"2-digit"}):"—";
async function get(p){const r=await fetch(BASE()+p+"?t="+Date.now(),{cache:"no-store"});if(!r.ok)throw new Error("HTTP "+r.status);return r.json()}
async function poll(){if(!DP()){ERR="nolink";render();return}
 try{[S,A,C]=await Promise.all([get("state.json"),get("activity.json"),get("chart.json")]);ERR=null;LAST=Date.now();indexImgs();{const top=(A&&A.items||[]).filter(a=>a.kind==="buy"||(a.kind==="sell"&&!String(a.value).startsWith("-")));const mx=Math.max(0,...top.map(a=>+new Date(a.ts)||0));if(SEENTS&&mx>SEENTS)PENDBURST=1;SEENTS=Math.max(SEENTS||0,mx)||-1}
  const m=location.hash.match(/#\/coin\/(\w+)/);if(m)coinCache[m[1]]=await get("coin/"+m[1]+".json").catch(()=>null);
 }catch(e){ERR=e.message}NEXT=Date.now()+15000;render()}
let prevStack=0,BALDIR=0,PENDBURST=0,SEENTS=0,P=[];const DEMO=DEMO0;
function burstAt(sel){if(RM)return;const el=$(sel);if(!el)return;const r=el.getBoundingClientRect(),cx=r.left+Math.min(r.width,260)/2,cy=r.top+r.height/2,cols=["#00d35a","#64d2ff","#ffd60a","#ff6b9a","#fff","#00d35a"];
 for(let i=0;i<70;i++){const a=Math.random()*6.283,v=2+Math.random()*6;P.push({x:cx,y:cy,vx:Math.cos(a)*v,vy:Math.sin(a)*v-2.5,c:cols[i%6],s:2+Math.random()*3,l:1,st:Math.random()<.35,r:Math.random()*6})}}
const TW=Array.from({length:22},()=>({x:Math.random(),y:Math.random(),s:.5+Math.random()*1.3,ph:Math.random()*6.28,v:.004+Math.random()*.008}));
function star(x,cx,cy,r){x.beginPath();for(let i=0;i<8;i++){const rr=i%2?r*.35:r,a=i*Math.PI/4;x.lineTo(cx+Math.cos(a)*rr,cy+Math.sin(a)*rr)}x.closePath();x.fill()}
function fxLoop(t){const cv=$("#fx"),dpr=devicePixelRatio||1;if(cv.width!==innerWidth*dpr){cv.width=innerWidth*dpr;cv.height=innerHeight*dpr}const x=cv.getContext("2d");x.setTransform(dpr,0,0,dpr,0,0);x.clearRect(0,0,innerWidth,innerHeight);
 P=P.filter(p=>p.l>0);P.forEach(p=>{p.x+=p.vx;p.y+=p.vy;p.vy+=.18;p.vx*=.97;p.l-=.017;x.globalAlpha=Math.max(0,p.l);x.fillStyle=p.c;if(p.st)star(x,p.x,p.y,p.s*1.8);else{x.save();x.translate(p.x,p.y);x.rotate(p.r+=.2);x.fillRect(-p.s,-p.s/2,p.s*2,p.s);x.restore()}});x.globalAlpha=1;
 const tw=$("#tw");if(tw){const W=tw.clientWidth,H=tw.clientHeight;if(tw.width!==W*dpr){tw.width=W*dpr;tw.height=H*dpr}const y=tw.getContext("2d");y.setTransform(dpr,0,0,dpr,0,0);y.clearRect(0,0,W,H);
  TW.forEach(s=>{s.y-=s.v/40;if(s.y<0)s.y=1;const a=.08+.22*(.5+.5*Math.sin(t/900+s.ph));y.globalAlpha=a;y.fillStyle=s.s>1.3?"#ffd60a":"#fff";star(y,s.x*W,s.y*H,s.s*2.2)})}
 requestAnimationFrame(fxLoop)}
if(!RM)requestAnimationFrame(fxLoop);
if(DEMO){history.replaceState(null,"",location.pathname+"#/home");setInterval(()=>route()==="home"&&burstAt(".big"),1300);setTimeout(()=>burstAt(".big"),900)}
/* ---------- v4: logos, theme, sound ---------- */
const HUE=t=>{let h=0;for(const c of String(t||"?"))h=(h*31+c.charCodeAt(0))%360;return h};
function logo(name,img,mint,sz=40){const n=esc(((name||mint||"?").trim()[0]||"?").toUpperCase()),h=HUE(mint||name);
 const fb=`<span class="lg-i" style="background:hsl(${h} 70% 22%);color:hsl(${h} 90% 72%)">${n}</span>`;
 return `<span class="lg" style="width:${sz}px;height:${sz}px;font-size:${Math.round(sz*.42)}px">${fb}${img&&/^https:\/\//.test(img)?`<img src="${esc(img)}" alt="" loading="lazy" referrerpolicy="no-referrer" onerror="this.remove()">`:""}</span>`}
const IMG={};function imgOf(m){return IMG[m]||null}
function indexImgs(){(S?.scanner?.feed||[]).forEach(f=>{if(f.image)IMG[f.mint]=f.image});(S?.positions||[]).forEach(p=>{if(p.image)IMG[p.mint]=p.image})}
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
let prevBal=null;
function odo(str,prev){let out="",p=(prev||"").padStart(str.length," "),k=0;
 for(let i=0;i<str.length;i++){const ch=str[i];if(!/\d/.test(ch)){out+=`<span class="sym">${ch}</span>`;continue}
  const from=/\d/.test(p[i])?+p[i]:0;out+=`<span class="odo"><i data-to="${ch}" data-d="${k++}" style="transform:translateY(-${(RM?+ch:from)*70}px)">${[0,1,2,3,4,5,6,7,8,9].map(n=>`<b>${n}</b>`).join("")}</i></span>`}
 return out}
function rollOdo(){document.querySelectorAll(".odo i").forEach(el=>{el.style.transitionDelay=(+el.dataset.d*30)+"ms";requestAnimationFrame(()=>requestAnimationFrame(()=>el.style.transform=`translateY(-${+el.dataset.to*70}px)`))})}
/* ---------- chrome ---------- */
const ICON={search:'<path d="M10.5 18a7.5 7.5 0 1 1 0-15 7.5 7.5 0 0 1 0 15zm5.3-2.2L21 21"/>',bell:'<path d="M6 16V11a6 6 0 1 1 12 0v5l1.5 2h-15zM10 20.5a2 2 0 0 0 4 0"/>',back:'<path d="M15 4l-8 8 8 8"/>'};
const ic=(n,href="#/activity")=>`<a class="ic" href="${href}" aria-label="${n}"><svg viewBox="0 0 24 24">${ICON[n]}</svg></a>`;
function navbar(r){const h=$("#nav");
 if(r==="coin"||r==="auditor"){h.innerHTML=`${ic("back",r==="coin"?"#/home":"#/agents")}<div class="ttl">${r==="coin"?"Coin":"Auditor"}</div><div style="width:34px"></div>`;return}
 const t={agents:"Agents",activity:"Activity",account:"Account"}[r];
 const handle=S?.settings?.["desk.fomo_handle"]||"";
 h.innerHTML=`<a class="av" href="#/account">${esc((handle[0]||"D").toUpperCase())}</a><a class="who" href="#/account">${t||'Grok Bot<span>›</span>'}</a>${ic("search","#/activity")}${ic("bell","#/activity")}`}
function errRow(){const e=$("#err");if(ERR&&ERR!=="nolink"&&S){const n=Math.max(0,Math.round((NEXT-Date.now())/1000));e.hidden=false;e.textContent=`Desk offline · retrying in ${n}s · last update ${time(LAST||S.ts)}`}else e.hidden=true}
setInterval(errRow,1000);
function render(){const r=route();navbar(r);errRow();
 document.querySelectorAll("#tabs a").forEach(a=>a.classList.toggle("on",a.dataset.t===r||(r==="auditor"&&a.dataset.t==="agents")||(r==="coin"&&a.dataset.t==="home")));
 const v=$("#view"),car=v.querySelector(".car"),sl=car?car.scrollLeft:0;
 if(ERR==="nolink"){v.innerHTML=pair();bindPair();return}
 if(!S){v.innerHTML=ERR?`<div class="empty"><b>Desk offline</b>Can't reach your desk right now. Retrying every 15 seconds.</div>`:skeleton();return}
 v.innerHTML=({home,agents,auditor,coin,activity,account}[r]||home)();
 const c2=v.querySelector(".car");if(c2){c2.scrollLeft=sl;c2.onscroll=()=>{const i=Math.round(c2.scrollLeft/(c2.firstElementChild.offsetWidth+12));v.querySelectorAll(".dots i").forEach((d,j)=>d.classList.toggle("on",j===i))}}
 if(r==="home"){drawChart(false);drawPnl();rollOdo();if(BALDIR&&!RM){const b=$(".big");b.classList.add(BALDIR>0?"gu":"gd");setTimeout(()=>b.classList.remove("gu","gd"),1400);if(BALDIR>0)burstAt(".big");}BALDIR=0;if(PENDBURST){burstAt(".big");win();PENDBURST=0}v.querySelectorAll(".range button").forEach(b=>b.onclick=()=>{RANGE=b.dataset.r;localStorage.setItem("range",RANGE);v.querySelectorAll(".range button").forEach(x=>x.classList.toggle("on",x===b));drawChart(true)})}
 if(r==="coin")drawCandles();if(r==="auditor")drawDisc();
 if(r==="activity"||r==="home")bindFlip(v);bindAcct(v);v.querySelectorAll(".seg a").forEach(a=>a.onclick=e=>{e.preventDefault();SEG=a.dataset.s;render()})}
function skeleton(){return`<div style="padding-top:18px"><div class="sk" style="height:70px;width:70%"></div><div class="sk" style="height:18px;width:40%;margin-top:12px"></div><div class="sk" style="height:220px;margin-top:20px;border-radius:16px"></div><div class="sk" style="height:44px;margin-top:12px"></div><div class="sk" style="height:300px;margin-top:26px;border-radius:32px"></div></div>`}
function pair(){return`<div class="pt">Link your desk</div><div class="list nb" style="padding:20px 16px"><div class="l2" style="font-size:15px">Paste the desk link from your chat. It ends in <span class="mono">#d=…</span> and is saved on this phone only.</div><input id="lnk" class="f" placeholder="Paste link" autocomplete="off" autocapitalize="off"><button id="lnkb" class="btn">Link desk</button></div>`}
function bindPair(){$("#lnkb").onclick=()=>{const m=($("#lnk").value||"").match(/[#&]d=([A-Za-z0-9_-]{32,})/);if(!m){alert("That link has no #d= part");return}localStorage.setItem("dp",m[1]);location.hash="#/home";location.reload()}}
/* ---------- home ---------- */
function home(){const start=C?.start||S.settings?.["desk.paper_start_stack"]||S.stack,pct=start?100*S.pnl_today/start:0,mult=start?S.stack/start:1;
 const bal="$"+f2(S.stack),html=odo(bal,prevBal);if(prevBal!=null&&prevBal!==bal)BALDIR=S.stack>prevStack?1:-1;prevBal=bal;prevStack=S.stack;
 const open=S.positions.filter(p=>p.status==="open"||p.status==="exiting");const running=Object.values(S.agents).filter(a=>a.alive&&!a.paused).length;
 return `${ticker()}<div class="bal"><canvas id="tw"></canvas><div class="row1"><div class="big num" aria-label="${bal}">${html}</div>${S.mode==="PAPER"?'<span class="pill p-o">PAPER</span>':'<span class="pill p-r">LIVE</span>'}</div>
 <div class="chg num"><span class="${S.pnl_today>=0?"up":"dn"}">${S.pnl_today>=0?"+":"-"}$${f2(Math.abs(S.pnl_today))} (${pct>=0?"+":""}${pct.toFixed(2)}%)</span><span class="l2">Today</span><span class="pill p-g num">${mult.toFixed(2)}×</span></div></div>
 <canvas class="chart" id="ch"></canvas>
 <div class="range">${["LIVE","1H","4H","1D","1W","ALL"].map(r=>`<button data-r="${r}" class="${r===RANGE?"on":""}">${r}</button>`).join("")}</div>
 ${open.length?`<div class="sh"><h2>Open</h2></div><div class="list">${open.map(posRow).join("")}</div>`:""}
 <div class="sh"><h2>Profit &amp; loss</h2><span class="l2 num" style="font-size:15px">from ${usd(start)}</span></div><div class="pnlc"><canvas id="pnl"></canvas><div class="pnll num ${S.stack>=start?"up":"dn"}">${S.stack>=start?"+":"-"}$${f2(Math.abs(S.stack-start))} all time</div></div>
 <div class="sh"><h2>Agents · ${running} running</h2><a href="#/agents">All</a></div>${carousel()}
 <div class="sh"><h2>Activity</h2><a href="#/activity">See all</a></div>${actList(((A&&A.items)||[]).slice(0,5),"No activity yet tonight. The desk writes here when a coin is rejected, bought or sold.")}`}
function ticker(){const seen=new Set(),it=[];for(const p of S.positions)if(!seen.has(p.mint)){seen.add(p.mint);it.push({mint:p.mint,name:p.name,image:p.image,tag:"holding",h1:null,live:1})}
 for(const f of S.scanner.feed)if(!seen.has(f.mint)&&it.length<14){seen.add(f.mint);it.push({mint:f.mint,name:f.name,image:f.image,h1:f.h1,liq:f.liq,pass:f.verdict==="pass"})}
 if(!it.length)return"";const one=it.map(c=>`<a class="tk" href="#/coin/${esc(c.mint)}">${logo(c.name,c.image||imgOf(c.mint),c.mint,20)}<b>${esc((c.name||c.mint.slice(0,5)).slice(0,16))}</b>${c.live?'<span class="up">● holding</span>':c.h1!=null?`<span class="${c.h1>=0?"up":"dn"} num">${c.h1>=0?"+":""}${Number(c.h1).toFixed(1)}%</span>`:`<span class="l3 num">$${kfmt(c.liq)}</span>`}</a>`).join("");
 return`<div class="tkr${RM?" still":""}" aria-label="Coins the desk is watching"><div class="tkt" style="--n:${it.length}">${one}${RM?"":one}</div></div>`}
function drawPnl(){const cv=$("#pnl");if(!cv)return;const dpr=devicePixelRatio||1,W=cv.clientWidth,H=cv.clientHeight;cv.width=W*dpr;cv.height=H*dpr;const x=cv.getContext("2d");x.scale(dpr,dpr);
 const start=C?.start||200,now=Date.now();let pts=((C&&C.points)||[]).map(p=>({t:+new Date(p.t),v:start+p.v}));const t0=pts.length?Math.min(pts[0].t-6e5,now-36e5):now-36e5;
 const s=[{t:t0,v:start},...pts,{t:now,v:S.stack}],vs=s.map(p=>p.v),mn=Math.min(...vs,start),mx=Math.max(...vs,start),sp=Math.max(mx-mn,start*.03),lo=mn-sp*.15,hi=mx+sp*.15;
 const X=t=>6+(t-t0)/((now-t0)||1)*(W-12),Y=v=>8+(hi-v)/(hi-lo)*(H-16),by=Y(start);
 // smooth path (monotone-ish catmull)
 const P=s.map(p=>[X(p.t),Y(p.v)]);const path=()=>{x.beginPath();x.moveTo(...P[0]);for(let i=0;i<P.length-1;i++){const p0=P[i-1]||P[i],p1=P[i],p2=P[i+1],p3=P[i+2]||p2,k=.18;x.bezierCurveTo(p1[0]+(p2[0]-p0[0])*k,p1[1]+(p2[1]-p0[1])*k,p2[0]-(p3[0]-p1[0])*k,p2[1]-(p3[1]-p1[1])*k,p2[0],p2[1])}};
 const G=getComputedStyle(document.documentElement),cg=G.getPropertyValue("--g").trim()||"#00d35a",cr=G.getPropertyValue("--r").trim()||"#ff453a";
 x.setLineDash([2,4]);x.strokeStyle="rgba(235,235,245,.28)";x.lineWidth=1;x.beginPath();x.moveTo(0,by);x.lineTo(W,by);x.stroke();x.setLineDash([]);
 x.fillStyle="rgba(235,235,245,.45)";x.font="11px -apple-system,system-ui";x.fillText("$"+start,6,by-5);
 for(const [col,clip] of [[cg,[0,0,W,by]],[cr,[0,by,W,H-by]]]){x.save();x.beginPath();x.rect(...clip);x.clip();
  path();x.lineTo(P.at(-1)[0],by);x.lineTo(P[0][0],by);x.closePath();const g=x.createLinearGradient(0,clip[1],0,clip[1]+clip[3]);const up=col===cg;g.addColorStop(up?0:1,col+"55");g.addColorStop(up?1:0,col+"00");x.fillStyle=g;x.fill();
  path();x.strokeStyle=col;x.lineWidth=2.5;x.lineJoin="round";x.lineCap="round";x.stroke();x.restore()}
 const l=P.at(-1);x.beginPath();x.arc(l[0],l[1],4,0,7);x.fillStyle=S.stack>=start?cg:cr;x.fill()}
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
 const target=series.map(p=>[sx(p.t),sy(p.v)]);const from=chartPrev&&chartPrev.length===target.length&&anim!==false?chartPrev:target;chartPrev=target;
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
/* ---------- agents ---------- */
function st(a){const s=S.agents[a]||{};return s.paused?`<span class="pill p-n">Paused</span>`:s.alive?`<span class="pill p-g"><i class="dot" style="background:var(--g)"></i>Live</span>`:`<span class="pill p-r">Down</span>`}
const AC=["#64d2ff","#0a84ff","#ffd60a","#00d35a","#ff6b9a"];
function cards(){const au=S.auditor.live,an=S.analyst.live,ex=S.executor.live,sc=S.scanner;
 const feed=sc.feed.slice(0,3).map(f=>f.verdict==="pass"?`<div class="r"><span>${ext(f.link,esc(f.name||f.mint.slice(0,6)))}</span><span class="up num">liq $${kfmt(f.liq)} · → auditor</span></div>`:`<div class="r"><span class="x">${esc(f.name||f.mint.slice(0,6))}</span><span class="dn">${esc(f.reason)}</span></div>`).join("");
 const ring=s=>{const r=40,c=2*Math.PI*r,f=(s||0)/100,ok=s>=S.settings["analyst.min_score"];return`<svg width="100" height="100" viewBox="0 0 100 100"><circle cx="50" cy="50" r="${r}" stroke="#2c2c2e" stroke-width="9" fill="none"/><circle cx="50" cy="50" r="${r}" stroke="${s==null?"#2c2c2e":ok?"#00d35a":"#ff9f0a"}" stroke-width="9" fill="none" stroke-linecap="round" stroke-dasharray="${c*f} ${c}" transform="rotate(-90 50 50)"/><text x="50" y="58" text-anchor="middle" fill="#fff" style="font:600 26px -apple-system,system-ui;font-variant-numeric:tabular-nums">${s??"–"}</text></svg>`};
 const strips=L=>`<div class="strips">${[1,2,3,4,5,6,7,8].map(n=>{const l=(L||[]).find(x=>x.n===n);return`<i class="${!l?"":l.pass===true?"ok":l.pass===false?"bad":""}"></i>`}).join("")}</div>`;
 return [
 `<div class="ag"><div class="hd"><span class="nm">Scanner</span>${st("scanner")}</div><div class="k num">${sc.pools} pools</div><div class="ks num">${sc.waiting} in the waiting room</div><div class="ft feed">${feed||'<div class="l3" style="font-size:14px">Waiting for the first graduation tonight.</div>'}</div></div>`,
 `<a class="ag" href="#/auditor"><div class="hd"><span class="nm">Auditor</span>${st("auditor")}</div><div class="k num">${S.auditor.taken} taken apart</div><div class="ks num">${S.auditor.rejected} rejected</div><div class="ft">${au?`<div style="font-size:15px">${esc(au.name||au.mint.slice(0,6))} <span class="${au.running?"l2":au.passed?"up":"dn"}">· ${au.running?"taking apart…":au.passed?"8/8 → Analyst":esc(au.reason)}</span></div>${strips(au.layers)}`:'<div class="l3" style="font-size:14px">Nothing to audit yet.</div>'+strips([])}</div></a>`,
 `<div class="ag"><div class="hd"><span class="nm">Analyst${S.analyst.mode==="rules"?" · rules":""}</span>${st("analyst")}</div><div class="k num">${S.analyst.scored} scored</div><div class="ks">Passes from <span class="mono">${S.settings["analyst.min_score"]}</span></div><div class="ft" style="display:flex;align-items:center;gap:14px">${ring(an?.score)}<div style="font-size:15px">${an?`${esc(an.name)}<div class="${an.passed?"up":"dn"}">${an.passed?"Pass":"Reject"}</div>`:'<span class="l3">Scoring the next coin that clears the Auditor.</span>'}</div></div></div>`,
 `<div class="ag"><div class="hd"><span class="nm">Executor</span>${st("executor")}</div><div class="k num">${S.executor.trades} trades</div><div class="ks num">${ex?`$${f2(ex.size)} · ${ex.pct.toFixed(2)}% of stack`:`${S.executor.stack_pct}% of stack per ticket`}</div><div class="ft">${ex?`<div class="up" style="font-size:15px">✓ Filled · ${esc(ex.name)}</div><div class="bar"><i style="width:100%"></i></div>`:'<div class="l3" style="font-size:14px">No tickets yet tonight.</div><div class="bar"><i style="width:0"></i></div>'}</div></div>`,
 `<div class="ag"><div class="hd"><span class="nm">Risk</span>${st("risk")}</div><div class="k">${S.risk.guarding?"Guarding":"Idle"}</div><div class="ks">Last exit · ${esc(S.risk.last_exit||"none yet")}</div><div class="ft" style="display:flex;gap:8px"><span class="pill p-r mono">stop -${S.risk.stop_pct}%</span><span class="pill p-g mono">trail ${S.risk.trail_pct}%</span></div></div>`].map((h,i)=>h.replace(/class="ag"/,`class="ag" style="--ac:${AC[i]}"`))}
function carousel(){const c=cards();return`<div class="car">${c.join("")}</div><div class="dots">${c.map((_,i)=>`<i class="${i?"":"on"}"></i>`).join("")}</div>`}
function agents(){return`<div class="pt">Agents</div>${carousel()}<div class="sh"><h2>Scanner feed</h2></div>${S.scanner.feed.length?`<div class="list nb">${S.scanner.feed.slice(0,15).map(f=>`<div class="li">${logo(f.name,f.image,f.mint,32)}<div class="m"><div class="t" style="${f.verdict==="pass"?"":"color:var(--l3);text-decoration:line-through;text-decoration-color:var(--r)"}">${f.verdict==="pass"?ext(f.link,esc(f.name||f.mint.slice(0,6))):esc(f.name||f.mint.slice(0,6))}</div></div><div class="v num ${f.verdict==="pass"?"up":"dn"}">${f.verdict==="pass"?`liq $${kfmt(f.liq)} · → auditor`:esc(f.reason)}</div></div>`).join("")}</div>`:`<div class="empty"><b>No pools yet</b>Scanner is listening for coins graduating to PumpSwap.</div>`}`}
/* ---------- activity ---------- */
function actIcon(k){return k==="buy"?["rgba(10,132,255,.2)","var(--b)","↗"]:k==="sell"?["rgba(0,211,90,.18)","var(--g)","$"]:k==="stop"?["rgba(255,69,58,.16)","var(--r)","!"]:["#2c2c2e","var(--l2)","×"]}
function actList(it,emptyText){if(!it.length)return`<div class="list nb"><div class="empty" style="padding:28px 20px">${emptyText}</div></div>`;
 return`<div class="list">${it.map(a=>{const[bg,fg,g]=actIcon(a.kind);if(FLIP&&(a.kind==="buy"||a.kind==="sell"||a.kind==="stop"))return flipCard(a,bg,fg,g);return`<a class="li" href="${a.mint?"#/coin/"+esc(a.mint):"#/activity"}"><div class="ico" style="background:${bg};color:${fg}">${g}</div><div class="m"><div class="t">${esc(a.title)}</div><div class="s">${esc(a.sub)}</div></div><div class="v num ${a.kind==="reject"?"l3":a.kind==="stop"?"dn":"up"}">${esc(a.value)}<div class="s l3">${time(a.ts)}</div></div></a>`}).join("")}</div>`}
let FLIP=false;const FLIPPED=new Set();
function flipCard(a,bg,fg,g){const d=coinCache[a.mint],L=d?.audit?.layers||[],an=d?.analysis,on=FLIPPED.has(a.id);
 const back=d===undefined?'<div class="l3" style="font-size:14px">Loading why…</div>':!L.length?'<div class="l3" style="font-size:14px">No audit saved for this coin.</div>':
  `<div class="why">${L.map(l=>`<div class="wy"><span class="ck ${l.pass===true?"ok":l.pass===false?"bad":""}">${l.pass===true?"✓":l.pass===false?"✕":l.n}</span><span class="wn">${esc(l.name)}</span><span class="wv num">${esc(l.value)}</span></div>`).join("")}</div>${an?`<div class="l2 num" style="font-size:13px;margin-top:8px">Analyst score <b class="${an.passed?"up":"dn"}">${esc(an.score)}</b> · passes from ${esc(S.settings["analyst.min_score"])}</div>`:""}`;
 return`<div class="fc${on?" on":""}" data-id="${esc(a.id)}" data-m="${esc(a.mint)}" role="button" tabindex="0" aria-pressed="${on}"><div class="fi"><div class="ff li">${a.mint?logo(a.title.replace(/^(Bought|Sold|Stopped out of|Stop)\s+/,""),imgOf(a.mint)||d?.image,a.mint):`<div class="ico" style="background:${bg};color:${fg}">${g}</div>`}<div class="m"><div class="t">${esc(a.title)}</div><div class="s">${esc(a.sub)} · <span style="color:var(--cy)">tap for why</span></div></div><div class="v num ${a.kind==="stop"?"dn":"up"}">${esc(a.value)}<div class="s l3">${time(a.ts)}</div></div></div>
 <div class="fb"><div class="hd2"><b>Why the desk bought ${esc(a.title.replace(/^(Bought|Sold|Stopped out of|Stop)\s+/,""))}</b>${a.mint?`<a href="#/coin/${esc(a.mint)}" class="l2" style="font-size:13px">Coin ›</a>`:""}</div>${back}</div></div></div>`}
function bindFlip(v){v.querySelectorAll(".fc").forEach(el=>{const t=e=>{if(e.target.closest("a"))return;const id=+el.dataset.id,m=el.dataset.m;FLIPPED.has(id)?FLIPPED.delete(id):FLIPPED.add(id);el.classList.toggle("on");el.classList.remove("anim");void el.offsetWidth;el.classList.add("anim");el.setAttribute("aria-pressed",el.classList.contains("on"));
  if(m&&coinCache[m]===undefined){coinCache[m]=undefined;get("coin/"+m+".json").then(d=>{coinCache[m]=d;render()}).catch(()=>{coinCache[m]=null;render()})}};el.onclick=t;el.onkeydown=e=>{if(e.key==="Enter"||e.key===" "){e.preventDefault();t(e)}}})}
function activity(){FLIP=true;setTimeout(()=>FLIP=false);const it=(A&&A.items)||[],f=SEG==="all"?it:it.filter(a=>SEG==="trades"?a.kind!=="reject":a.kind==="reject");
 return`<div class="pt">Activity</div><div class="seg"><a href="#" data-s="all" class="${SEG==="all"?"on":""}">All</a><a href="#" data-s="trades" class="${SEG==="trades"?"on":""}">Trades</a><a href="#" data-s="rejects" class="${SEG==="rejects"?"on":""}">Rejects</a></div>${actList(f,"Nothing here yet tonight.")}`}
/* ---------- auditor ---------- */
function auditData(){const au=S.auditor.live,rec=S.auditor.recent;return au||rec[0]}
function auditor(){const a=auditData();if(!a)return`<div class="empty"><b>No audits yet</b>The Auditor takes apart every coin the Scanner passes, 8 layers deep.</div>`;
 const L=a.layers||[],rec=S.auditor.recent.find(x=>x.mint===a.mint);
 return`<div style="text-align:center;margin-top:6px"><div style="font:700 28px var(--disp)">${esc(a.name||a.mint.slice(0,6))}</div><div class="l2 num" style="margin-top:4px">${L.filter(l=>l.pass).length} of 8 layers clear${a.running?" · taking apart…":""}</div></div>
 <canvas id="disc" class="disc" style="width:300px;height:250px"></canvas>
 <div class="list nb">${[1,2,3,4,5,6,7,8].map(n=>{const l=L.find(x=>x.n===n)||{n,name:"",value:"not checked"};return`<div class="lay"><div class="ck ${l.pass===true?"ok":l.pass===false?"bad":""}">${l.pass===true?"✓":l.pass===false?"✕":n}</div><div style="flex:1;font-size:16px">${esc(l.name)}</div><div class="num ${l.pass===false?"dn":l.pass?"":"l3"}" style="font-size:15px">${esc(l.value)}</div></div>`}).join("")}</div>
 ${rec?`<a class="btn sec" href="#/coin/${esc(a.mint)}">Open coin</a>`:""}
 <div class="sh"><h2>Recent</h2></div><div class="list nb">${S.auditor.recent.map(r=>`<a class="li" href="#/coin/${esc(r.mint)}"><div class="m"><div class="t mono" style="font-size:14px">${esc(r.mint.slice(0,4)+"…"+r.mint.slice(-4))}</div></div><div class="v ${r.passed?"up":"dn"}">${esc(r.passed?"8/8":r.reason)}</div><span class="chev">›</span></a>`).join("")}</div>`}
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
 if(!d)return`<div class="empty"><b>No data for this coin yet</b>Prices show up once the Scanner has read it.</div>`;
 const c=d.coin||{},pos=(d.positions||[])[0],pr=d.prices||[],last=pr.at(-1)?.price,first=pr[0]?.price,ch=first?100*(last/first-1):0;
 return`<div style="margin-top:6px"><div class="l2" style="font-size:15px">${esc(c.symbol||"")}</div><div style="font:700 34px var(--disp);letter-spacing:-.02em">${esc(c.name||m.slice(0,6))}</div>
 <div class="num" style="font:600 28px var(--disp);margin-top:6px">${last?"$"+Number(last).toPrecision(4):"—"}</div><div class="num ${ch>=0?"up":"dn"}" style="font-size:15px">${pr.length>1?(ch>=0?"+":"")+ch.toFixed(2)+"%":""}</div></div>
 <canvas id="cn" class="chart" style="height:240px"></canvas>
 ${pos&&pos.exit_line?`<div class="l2" style="font-size:13px;display:flex;gap:8px;align-items:center"><span style="width:18px;border-top:2px dashed var(--o)"></span>Risk trailing stop</div>`:""}
 ${ext(d.link,pos&&pos.status!=="closed"?"Sell on FOMO":"Open on FOMO","btn")}
 <div class="sh"><h2>Stats</h2></div><div class="list nb">
 ${[["Holders",c.holders??"—"],["Audit",d.audit?(d.audit.passed?"8/8 clear":esc(d.audit.reason)):"—"],["Score",d.analysis?d.analysis.score:"—"],...(pos?[["Entry","$"+Number(pos.entry_price).toPrecision(4)],["Size",usd(pos.size_usd)],["Stop",`<span class="mono">-${pos.stop_pct}%</span>`]]:[])].map(([k,v])=>`<div class="li" style="min-height:48px"><div class="m l2" style="font-size:15px">${k}</div><div class="v num">${v}</div></div>`).join("")}</div>`}
function drawCandles(){const cv=$("#cn"),m=(location.hash.match(/#\/coin\/(\w+)/)||[])[1],d=coinCache[m];if(!cv||!d)return;
 const dpr=devicePixelRatio||1,W=cv.clientWidth,H=cv.clientHeight;cv.width=W*dpr;cv.height=H*dpr;const x=cv.getContext("2d");x.scale(dpr,dpr);
 const pr=(d.prices||[]).map(p=>p.price).filter(Boolean);if(pr.length<2){x.fillStyle="rgba(235,235,245,.3)";x.font="15px -apple-system,system-ui";x.textAlign="center";x.fillText("No candles yet",W/2,H/2);return}
 const per=Math.max(1,Math.ceil(pr.length/40)),cs=[];for(let i=0;i<pr.length;i+=per){const s=pr.slice(i?i-1:0,i+per);cs.push({o:s[0],c:s.at(-1),h:Math.max(...s),l:Math.min(...s)})}if(cs.length>8)cs.shift();
 const pos=(d.positions||[])[0],line=pos&&pos.exit_line,all=pr.concat(line?[line]:[]),q=pr.slice().sort((a,b)=>a-b),qa=q[Math.floor(q.length*.03)],qb=q[Math.ceil(q.length*.97)-1],mn=Math.min(qa,line||qa),mx=Math.max(qb,line||qb),sy=v=>8+(1-(v-mn)/((mx-mn)||1))*(H-16),cw=W/cs.length;
 cs.forEach((c,i)=>{const col=c.c>=c.o?"#00d35a":"#ff453a",cx=i*cw+cw/2;x.strokeStyle=col;x.fillStyle=col;x.lineWidth=1;x.beginPath();x.moveTo(cx,sy(c.h));x.lineTo(cx,sy(c.l));x.stroke();x.save();x.beginPath();x.rect(0,0,W,H);x.clip();const y1=sy(Math.max(c.o,c.c)),y2=sy(Math.min(c.o,c.c));x.fillRect(cx-cw*.32,y1,cw*.64,Math.max(1.5,y2-y1));x.restore()});
 if(line){x.setLineDash([6,5]);x.strokeStyle="#ff9f0a";x.lineWidth=1.5;x.beginPath();x.moveTo(0,sy(line));x.lineTo(W,sy(line));x.stroke();x.setLineDash([])}}
/* ---------- account ---------- */
function account(){const s=S.settings,sp=S.spec,row=(k,v,href)=>`${href?`<a class="li" href="${esc(href)}" target="_blank" rel="noopener">`:'<div class="li">'}<div class="m" style="font-size:16px">${k}</div><div class="v l2">${v}</div>${href?'<span class="chev">›</span></a>':"</div>"}`;
 const groups={scanner:"Scanner",auditor:"Auditor",analyst:"Analyst",executor:"Executor",risk:"Risk",desk:"Desk"};
 return`<div class="pt">Account</div><div class="list nb">${row("FOMO","@"+esc(s["desk.fomo_handle"]),S.profile_url)}${row("Invite a friend","Share",S.signup_url)}</div>
 <div class="sh"><h2>Look &amp; feel</h2></div><div class="list nb">
 <div class="li"><div class="m" style="font-size:16px">Theme</div><div class="seg2" role="radiogroup">${[["dark","Dark"],["neon","Neon"]].map(([k,t])=>`<button data-theme="${k}" class="${THEME()===k?"on":""}" role="radio" aria-checked="${THEME()===k}">${t}</button>`).join("")}</div></div>
 <div class="li"><div class="m"><div style="font-size:16px">Win sound</div><div class="s l3" style="font-size:13px">Cha-ching + buzz on a win, only while the app is open</div></div><button class="tg ${SOUND()?"on":""}" id="snd" role="switch" aria-checked="${SOUND()}" aria-label="Win sound"><i></i></button></div>
 <div class="li"><div class="m" style="font-size:16px">Test it</div><button class="mini" id="tst">Play win</button></div></div>
 <div class="sh"><h2>Desk</h2></div><div class="list nb">${row("Mode",`<span class="pill ${S.mode==="PAPER"?"p-o":"p-r"}">${S.mode}</span>`)}${row("Alerts",esc((S.notifier||"").split(" (")[0].replace(" webhook","")))}${row("Web push","Not available in plan B")}${row("Balance",`<span class="num">${usd(S.stack)}</span>`)}</div>
 <div class="l3" style="font-size:13px;margin:10px 4px 0">To change a setting, tell Grok Bot, for example “set stop to -8%”.</div>
 ${Object.entries(groups).map(([g,t])=>`<div class="sh"><h2>${t}</h2></div><div class="list nb">${Object.keys(s).filter(k=>k.startsWith(g+".")).map(k=>{const v=s[k],r=sp[k];return`<div class="setrow"><div class="lb"><span>${esc(k.split(".")[1].replace(/_/g," "))}</span><span class="mono l2 num">${esc(v)}</span></div>${typeof v==="number"&&r&&r[0]!=null?`<input type="range" style="--pc:${Math.max(0,Math.min(100,100*(v-r[0])/((r[1]-r[0])||1)))}%" min="${r[0]}" max="${r[1]}" step="any" value="${v}" disabled>`:""}</div>`}).join("")}</div>`).join("")}
 <div class="foot">New to FOMO? ${ext(S.signup_url,esc(S.signup_url))}</div>`}
function bindAcct(v){v.querySelectorAll("[data-theme]").forEach(b=>b.onclick=()=>{localStorage.setItem("theme",b.dataset.theme);applyTheme();render()});
 const s=v.querySelector("#snd");if(s)s.onclick=()=>{const on=!SOUND();localStorage.setItem("sound",on?"on":"off");if(on){unlockAudio();chaChing()}render()};
 const t=v.querySelector("#tst");if(t)t.onclick=()=>{if(SOUND())unlockAudio();win();burstAt("#tst")}}
addEventListener("hashchange",()=>{render();poll()});addEventListener("resize",()=>{if(route()==="home"){drawChart(false);drawPnl()}});
render();poll();setInterval(poll,15000);
