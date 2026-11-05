// Desk app. DATA_PATH comes from #d= (or a pasted link), lives only in localStorage. Polls public JSON every 15s.
// Every FOMO link shown here comes from the published JSON (made by links.py on the desk).
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
 try{[S,A,C]=await Promise.all([get("state.json"),get("activity.json"),get("chart.json")]);ERR=null;LAST=Date.now();
  const m=location.hash.match(/#\/coin\/(\w+)/);if(m)coinCache[m[1]]=await get("coin/"+m[1]+".json").catch(()=>null);
 }catch(e){ERR=e.message}NEXT=Date.now()+15000;render()}
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
 if(r==="home"){drawChart(false);rollOdo();v.querySelectorAll(".range button").forEach(b=>b.onclick=()=>{RANGE=b.dataset.r;localStorage.setItem("range",RANGE);v.querySelectorAll(".range button").forEach(x=>x.classList.toggle("on",x===b));drawChart(true)})}
 if(r==="coin")drawCandles();if(r==="auditor")drawDisc();
 v.querySelectorAll(".seg a").forEach(a=>a.onclick=e=>{e.preventDefault();SEG=a.dataset.s;render()})}
function skeleton(){return`<div style="padding-top:18px"><div class="sk" style="height:70px;width:70%"></div><div class="sk" style="height:18px;width:40%;margin-top:12px"></div><div class="sk" style="height:220px;margin-top:20px;border-radius:16px"></div><div class="sk" style="height:44px;margin-top:12px"></div><div class="sk" style="height:300px;margin-top:26px;border-radius:32px"></div></div>`}
function pair(){return`<div class="pt">Link your desk</div><div class="list nb" style="padding:20px 16px"><div class="l2" style="font-size:15px">Paste the desk link from your chat. It ends in <span class="mono">#d=…</span> and is saved on this phone only.</div><input id="lnk" class="f" placeholder="Paste link" autocomplete="off" autocapitalize="off"><button id="lnkb" class="btn">Link desk</button></div>`}
function bindPair(){$("#lnkb").onclick=()=>{const m=($("#lnk").value||"").match(/[#&]d=([A-Za-z0-9_-]{32,})/);if(!m){alert("That link has no #d= part");return}localStorage.setItem("dp",m[1]);location.hash="#/home";location.reload()}}
/* ---------- home ---------- */
function home(){const start=C?.start||S.settings?.["desk.paper_start_stack"]||S.stack,pct=start?100*S.pnl_today/start:0,mult=start?S.stack/start:1;
 const bal="$"+f2(S.stack),html=odo(bal,prevBal);prevBal=bal;
 const open=S.positions.filter(p=>p.status==="open"||p.status==="exiting");const running=Object.values(S.agents).filter(a=>a.alive&&!a.paused).length;
 return `<div class="bal"><div class="row1"><div class="big num" aria-label="${bal}">${html}</div>${S.mode==="PAPER"?'<span class="pill p-o">PAPER</span>':'<span class="pill p-r">LIVE</span>'}</div>
 <div class="chg num"><span class="${S.pnl_today>=0?"up":"dn"}">${S.pnl_today>=0?"+":"-"}$${f2(Math.abs(S.pnl_today))} (${pct>=0?"+":""}${pct.toFixed(2)}%)</span><span class="l2">Today</span><span class="pill p-g num">${mult.toFixed(2)}×</span></div></div>
 <canvas class="chart" id="ch"></canvas>
 <div class="range">${["LIVE","1H","4H","1D","1W","ALL"].map(r=>`<button data-r="${r}" class="${r===RANGE?"on":""}">${r}</button>`).join("")}</div>
 ${open.length?`<div class="sh"><h2>Open</h2></div><div class="list">${open.map(posRow).join("")}</div>`:""}
 <div class="sh"><h2>Agents · ${running} running</h2><a href="#/agents">All</a></div>${carousel()}
 <div class="sh"><h2>Activity</h2><a href="#/activity">See all</a></div>${actList(((A&&A.items)||[]).slice(0,5),"No activity yet tonight. The desk writes here when a coin is rejected, bought or sold.")}`}
function posRow(p){return`<div class="li"><a href="#/coin/${esc(p.mint)}" class="ico" style="background:rgba(10,132,255,.18);color:var(--b)">${esc((p.name||"?")[0])}</a><a class="m" href="#/coin/${esc(p.mint)}"><div class="t">${esc(p.name)}</div><div class="s num">${usd(p.size_usd)} · stop <span class="mono">-${p.stop_pct}%</span></div></a>${ext(p.link,'Sell on FOMO','sell')}</div>`}
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
function cards(){const au=S.auditor.live,an=S.analyst.live,ex=S.executor.live,sc=S.scanner;
 const feed=sc.feed.slice(0,3).map(f=>f.verdict==="pass"?`<div class="r"><span>${ext(f.link,esc(f.name||f.mint.slice(0,6)))}</span><span class="up num">liq $${kfmt(f.liq)} · → auditor</span></div>`:`<div class="r"><span class="x">${esc(f.name||f.mint.slice(0,6))}</span><span class="dn">${esc(f.reason)}</span></div>`).join("");
 const ring=s=>{const r=40,c=2*Math.PI*r,f=(s||0)/100,ok=s>=S.settings["analyst.min_score"];return`<svg width="100" height="100" viewBox="0 0 100 100"><circle cx="50" cy="50" r="${r}" stroke="#2c2c2e" stroke-width="9" fill="none"/><circle cx="50" cy="50" r="${r}" stroke="${s==null?"#2c2c2e":ok?"#00d35a":"#ff9f0a"}" stroke-width="9" fill="none" stroke-linecap="round" stroke-dasharray="${c*f} ${c}" transform="rotate(-90 50 50)"/><text x="50" y="58" text-anchor="middle" fill="#fff" style="font:600 26px -apple-system,system-ui;font-variant-numeric:tabular-nums">${s??"–"}</text></svg>`};
 const strips=L=>`<div class="strips">${[1,2,3,4,5,6,7,8].map(n=>{const l=(L||[]).find(x=>x.n===n);return`<i class="${!l?"":l.pass===true?"ok":l.pass===false?"bad":""}"></i>`}).join("")}</div>`;
 return [
 `<div class="ag"><div class="hd"><span class="nm">Scanner</span>${st("scanner")}</div><div class="k num">${sc.pools} pools</div><div class="ks num">${sc.waiting} in the waiting room</div><div class="ft feed">${feed||'<div class="l3" style="font-size:14px">Waiting for the first graduation tonight.</div>'}</div></div>`,
 `<a class="ag" href="#/auditor"><div class="hd"><span class="nm">Auditor</span>${st("auditor")}</div><div class="k num">${S.auditor.taken} taken apart</div><div class="ks num">${S.auditor.rejected} rejected</div><div class="ft">${au?`<div style="font-size:15px">${esc(au.name||au.mint.slice(0,6))} <span class="${au.running?"l2":au.passed?"up":"dn"}">· ${au.running?"taking apart…":au.passed?"8/8 → Analyst":esc(au.reason)}</span></div>${strips(au.layers)}`:'<div class="l3" style="font-size:14px">Nothing to audit yet.</div>'+strips([])}</div></a>`,
 `<div class="ag"><div class="hd"><span class="nm">Analyst${S.analyst.mode==="rules"?" · rules":""}</span>${st("analyst")}</div><div class="k num">${S.analyst.scored} scored</div><div class="ks">Passes from <span class="mono">${S.settings["analyst.min_score"]}</span></div><div class="ft" style="display:flex;align-items:center;gap:14px">${ring(an?.score)}<div style="font-size:15px">${an?`${esc(an.name)}<div class="${an.passed?"up":"dn"}">${an.passed?"Pass":"Reject"}</div>`:'<span class="l3">Scoring the next coin that clears the Auditor.</span>'}</div></div></div>`,
 `<div class="ag"><div class="hd"><span class="nm">Executor</span>${st("executor")}</div><div class="k num">${S.executor.trades} trades</div><div class="ks num">${ex?`$${f2(ex.size)} · ${ex.pct.toFixed(2)}% of stack`:`${S.executor.stack_pct}% of stack per ticket`}</div><div class="ft">${ex?`<div class="up" style="font-size:15px">✓ Filled · ${esc(ex.name)}</div><div class="bar"><i style="width:100%"></i></div>`:'<div class="l3" style="font-size:14px">No tickets yet tonight.</div><div class="bar"><i style="width:0"></i></div>'}</div></div>`,
 `<div class="ag"><div class="hd"><span class="nm">Risk</span>${st("risk")}</div><div class="k">${S.risk.guarding?"Guarding":"Idle"}</div><div class="ks">Last exit · ${esc(S.risk.last_exit||"none yet")}</div><div class="ft" style="display:flex;gap:8px"><span class="pill p-r mono">stop -${S.risk.stop_pct}%</span><span class="pill p-g mono">trail ${S.risk.trail_pct}%</span></div></div>`]}
function carousel(){const c=cards();return`<div class="car">${c.join("")}</div><div class="dots">${c.map((_,i)=>`<i class="${i?"":"on"}"></i>`).join("")}</div>`}
function agents(){return`<div class="pt">Agents</div>${carousel()}<div class="sh"><h2>Scanner feed</h2></div>${S.scanner.feed.length?`<div class="list nb">${S.scanner.feed.slice(0,15).map(f=>`<div class="li"><div class="m"><div class="t" style="${f.verdict==="pass"?"":"color:var(--l3);text-decoration:line-through;text-decoration-color:var(--r)"}">${f.verdict==="pass"?ext(f.link,esc(f.name||f.mint.slice(0,6))):esc(f.name||f.mint.slice(0,6))}</div></div><div class="v num ${f.verdict==="pass"?"up":"dn"}">${f.verdict==="pass"?`liq $${kfmt(f.liq)} · → auditor`:esc(f.reason)}</div></div>`).join("")}</div>`:`<div class="empty"><b>No pools yet</b>Scanner is listening for coins graduating to PumpSwap.</div>`}`}
/* ---------- activity ---------- */
function actIcon(k){return k==="buy"?["rgba(0,211,90,.16)","var(--g)","↗"]:k==="sell"?["rgba(10,132,255,.18)","var(--b)","↘"]:k==="stop"?["rgba(255,69,58,.16)","var(--r)","!"]:["#2c2c2e","var(--l2)","×"]}
function actList(it,emptyText){if(!it.length)return`<div class="list nb"><div class="empty" style="padding:28px 20px">${emptyText}</div></div>`;
 return`<div class="list">${it.map(a=>{const[bg,fg,g]=actIcon(a.kind);return`<a class="li" href="${a.mint?"#/coin/"+esc(a.mint):"#/activity"}"><div class="ico" style="background:${bg};color:${fg}">${g}</div><div class="m"><div class="t">${esc(a.title)}</div><div class="s">${esc(a.sub)}</div></div><div class="v num ${a.kind==="reject"?"l3":a.kind==="stop"?"dn":"up"}">${esc(a.value)}<div class="s l3">${time(a.ts)}</div></div></a>`}).join("")}</div>`}
function activity(){const it=(A&&A.items)||[],f=SEG==="all"?it:it.filter(a=>SEG==="trades"?a.kind!=="reject":a.kind==="reject");
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
 const per=Math.max(1,Math.ceil(pr.length/40)),cs=[];for(let i=0;i<pr.length;i+=per){const s=pr.slice(Math.max(0,i-1),i+per);cs.push({o:s[0],c:s.at(-1),h:Math.max(...s),l:Math.min(...s)})}
 const pos=(d.positions||[])[0],line=pos&&pos.exit_line,all=pr.concat(line?[line]:[]),mn=Math.min(...all),mx=Math.max(...all),sy=v=>8+(1-(v-mn)/((mx-mn)||1))*(H-16),cw=W/cs.length;
 cs.forEach((c,i)=>{const col=c.c>=c.o?"#00d35a":"#ff453a",cx=i*cw+cw/2;x.strokeStyle=col;x.fillStyle=col;x.lineWidth=1;x.beginPath();x.moveTo(cx,sy(c.h));x.lineTo(cx,sy(c.l));x.stroke();const y1=sy(Math.max(c.o,c.c)),y2=sy(Math.min(c.o,c.c));x.fillRect(cx-cw*.32,y1,cw*.64,Math.max(1.5,y2-y1))});
 if(line){x.setLineDash([6,5]);x.strokeStyle="#ff9f0a";x.lineWidth=1.5;x.beginPath();x.moveTo(0,sy(line));x.lineTo(W,sy(line));x.stroke();x.setLineDash([])}}
/* ---------- account ---------- */
function account(){const s=S.settings,sp=S.spec,row=(k,v,href)=>`${href?`<a class="li" href="${esc(href)}" target="_blank" rel="noopener">`:'<div class="li">'}<div class="m" style="font-size:16px">${k}</div><div class="v l2">${v}</div>${href?'<span class="chev">›</span></a>':"</div>"}`;
 const groups={scanner:"Scanner",auditor:"Auditor",analyst:"Analyst",executor:"Executor",risk:"Risk",desk:"Desk"};
 return`<div class="pt">Account</div><div class="list nb">${row("FOMO","@"+esc(s["desk.fomo_handle"]),S.profile_url)}${row("Invite a friend","Share",S.signup_url)}</div>
 <div class="sh"><h2>Desk</h2></div><div class="list nb">${row("Mode",`<span class="pill ${S.mode==="PAPER"?"p-o":"p-r"}">${S.mode}</span>`)}${row("Alerts",esc((S.notifier||"").split(" (")[0].replace(" webhook","")))}${row("Web push","Not available in plan B")}${row("Balance",`<span class="num">${usd(S.stack)}</span>`)}</div>
 <div class="l3" style="font-size:13px;margin:10px 4px 0">To change a setting, tell Grok Bot, for example “set stop to -8%”.</div>
 ${Object.entries(groups).map(([g,t])=>`<div class="sh"><h2>${t}</h2></div><div class="list nb">${Object.keys(s).filter(k=>k.startsWith(g+".")).map(k=>{const v=s[k],r=sp[k];return`<div class="setrow"><div class="lb"><span>${esc(k.split(".")[1].replace(/_/g," "))}</span><span class="mono l2 num">${esc(v)}</span></div>${typeof v==="number"&&r&&r[0]!=null?`<input type="range" min="${r[0]}" max="${r[1]}" step="any" value="${v}" disabled>`:""}</div>`}).join("")}</div>`).join("")}
 <div class="foot">New to FOMO? ${ext(S.signup_url,esc(S.signup_url))}</div>`}
addEventListener("hashchange",()=>{render();poll()});addEventListener("resize",()=>{if(route()==="home")drawChart(false)});
render();poll();setInterval(poll,15000);
