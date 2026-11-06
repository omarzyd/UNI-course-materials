/* L3 extras: S&B gridworld, Ex 3.22, midterm Q2, final Q3, Hanoi */
const GW=(()=>{const N=5,g=.9,MV=[[-1,0],[1,0],[0,-1],[0,1]],AR=["↑","↓","←","→"];
  const step=(r,c,a)=>{if(r===0&&c===1)return[4,1,10];if(r===0&&c===3)return[2,3,5];const nr=r+MV[a][0],nc=c+MV[a][1];if(nr<0||nr>=N||nc<0||nc>=N)return[r,c,-1];return[nr,nc,0]};
  let v=Array.from({length:N},()=>new Array(N).fill(0));
  for(let it=0;it<2000;it++){const w=v.map(r=>r.slice());for(let r=0;r<N;r++)for(let c=0;c<N;c++){let s=0;for(let a=0;a<4;a++){const[nr,nc,rw]=step(r,c,a);s+=.25*(rw+g*v[nr][nc])}w[r][c]=s}v=w}
  let u=Array.from({length:N},()=>new Array(N).fill(0));
  for(let it=0;it<2000;it++){const w=u.map(r=>r.slice());for(let r=0;r<N;r++)for(let c=0;c<N;c++){let m=-1e9;for(let a=0;a<4;a++){const[nr,nc,rw]=step(r,c,a);m=Math.max(m,rw+g*u[nr][nc])}w[r][c]=m}u=w}
  return {N,g,step,AR,pi:v,star:u}})();
let gwK="pi",gwSel=[2,2];
function xgw(){
  const V=GW[gwK],[sr,sc]=gwSel,lab=(r,c)=>r===0&&c===1?"A":r===0&&c===3?"B":r===4&&c===1?"A′":r===2&&c===3?"B′":"";
  const best=(r,c)=>{const q=[0,1,2,3].map(a=>{const[nr,nc,rw]=GW.step(r,c,a);return rw+GW.g*GW.star[nr][nc]}),m=Math.max(...q);return q.map((x,a)=>Math.abs(x-m)<1e-6?GW.AR[a]:"").join("")};
  $("#xgw").innerHTML=`<div class="rg" style="grid-template-columns:repeat(5,minmax(0,1fr));max-width:360px">${V.map((row,r)=>row.map((x,c)=>`<button class="rc ${r===sr&&c===sc?"sel":""}" data-g="${r},${c}" aria-label="cell ${r+1},${c+1}"><span class="xs" style="color:var(--g);font-weight:700">${lab(r,c)}</span><span class="vv" style="font-weight:600">${nf(x,1)}</span>${gwK==="star"?`<span class="ar" style="font-size:.95rem">${best(r,c)}</span>`:""}</button>`).join("")).join("")}</div>`;
  const parts=[0,1,2,3].map(a=>{const[nr,nc,rw]=GW.step(sr,sc,a);return {a,rw,v:V[nr][nc],t:rw+GW.g*V[nr][nc]}});
  const val=gwK==="pi"?parts.reduce((s,p)=>s+.25*p.t,0):Math.max(...parts.map(p=>p.t));
  $("#xgwOut").innerHTML=`<h4>الخانة (${sr+1}, ${sc+1}) ${lab(sr,sc)?"= "+lab(sr,sc):""}</h4>
    <ol class="steps">${parts.map(p=>`<li><span>${GW.AR[p.a]}: <span class="m">r + γ v(s′) = ${p.rw} + 0.9 × ${nf(p.v,2)} = ${nf(p.t,2)}</span></span></li>`).join("")}</ol>
    <div class="mb" style="font-size:1rem">${gwK==="pi"?`v<sub>π</sub> = 0.25 × (${parts.map(p=>nf(p.t,2)).join(" + ")}) = ${nf(val,2)}`:`v<sub>*</sub> = max(${parts.map(p=>nf(p.t,2)).join(", ")}) = ${nf(val,2)}`}</div>
    <p class="small">${gwK==="pi"?"random policy: كل اتجاه باحتمال 0.25، فبناخد المتوسط.":"الـ optimal: بناخد أحسن action. والأسهم في الجدول هي π*، وأي action بيدّي الـ max يبقى optimal."}${gwK==="star"&&sr===0&&sc===1?` <b>Ex. 3.24:</b> <span class="m">v*(A) = 10 / (1 − 0.9⁵) = ${nf(10/(1-.9**5),3)}</span>`:""}</p>`;
  isolate($("#xgwOut"));
}
$("#xgw").addEventListener("click",e=>{const b=e.target.closest("[data-g]");if(b){gwSel=b.dataset.g.split(",").map(Number);xgw()}});seg("#xgwK","k",k=>{gwK=k;xgw()});xgw();

/* Ex 3.22 */
function xlr(){const g=+$("#xlrg").value;$("#xlrgO").textContent=g.toFixed(2);const L=1/(1-g*g),R=2*g/(1-g*g),w=Math.abs(L-R)<1e-9?"تعادل":L>R?"left":"right";
  $("#xlr").innerHTML=`<div class="readout"><span class="box"><span class="m">v<sub>left</sub> = 1 + γ² + γ⁴ + … = 1/(1−γ²)</span> <b>${nf(L,3)}</b></span><span class="box"><span class="m">v<sub>right</sub> = 2γ + 2γ³ + … = 2γ/(1−γ²)</span> <b>${nf(R,3)}</b></span><span class="box" style="border-color:var(--ink)">الأحسن <b>${w}</b></span></div>
  <p class="small">عند <span class="m">γ = 0</span>: left (الـ +1 دلوقتي). عند <span class="m">γ = 0.9</span>: right (الـ +2 تستاهل الاستنى). عند <span class="m">γ = 0.5</span>: <span class="m">1/0.75 = 2(0.5)/0.75 = 1.333</span>، فالاتنين optimal.</p>`;isolate($("#xlr"))}
$("#xlrg").addEventListener("input",xlr);xlr();

/* midterm Q2 */
function xq2(){
  const v1=+$("#xv1").value,v2=+$("#xv2").value,g=+$("#xvg").value;$("#xv1O").textContent=v1;$("#xv2O").textContent=v2;$("#xvgO").textContent=g.toFixed(2);
  const V={s1:v1,s2:v2},T={s1:{a1:[[.5,"s1",5],[.5,"s2",10]],a2:[[1,"s2",7]]},s2:{a1:[[1,"s1",0]],a2:[[1,"s2",8]]}};
  let html="";const pol={};
  ["s1","s2"].forEach(s=>{const q={};html+=`<h4 style="margin-top:6px">${s}</h4><ol class="steps">`;
    ["a1","a2"].forEach(a=>{q[a]=T[s][a].reduce((t,[p,n,r])=>t+p*(r+g*V[n]),0);
      html+=`<li><span><span class="m">q(${s},${a}) = ${T[s][a].map(([p,n,r])=>`${p}(${r} + ${g}×${V[n]})`).join(" + ")} = ${nf(q[a],2)}</span></span></li>`});
    const b=Math.abs(q.a1-q.a2)<1e-9?"a1 أو a2":q.a1>q.a2?"a1":"a2";pol[s]=b;html+=`</ol><p>إذن <span class="m">π(${s}) = ${b}</span></p>`});
  $("#xq2").innerHTML=html+`<div class="readout"><span class="box">π(s1) <b>${pol.s1}</b></span><span class="box">π(s2) <b>${pol.s2}</b></span></div>${v1===50&&v2===55&&g===.9?`<p class="small">أرقام الامتحان: <span class="m">q(s1,a1) = 54.75</span> و<span class="m">q(s1,a2) = 56.5</span>، فـ a2. و<span class="m">q(s2,a1) = 45</span> و<span class="m">q(s2,a2) = 57.5</span>، فـ a2.</p>`:""}`;
  isolate($("#xq2"));
}
["xv1","xv2","xvg"].forEach(id=>$("#"+id).addEventListener("input",xq2));xq2();

/* final Q3: advisors */
const VA=[[-2,2,5,9],[-3,-2,2,5],[-3,-3,-2,2],[-4,-3,-3,-2]],VB=[[3,-4,-4,-6],[5,3,-4,-4],[6,5,3,-4],[10,6,5,3]];
const VN=VA.map((r,i)=>r.map((x,j)=>Math.max(x,VB[i][j])));
let advK="A",advSel=[2,2];
function xadv(){
  const V=advK==="A"?VA:advK==="B"?VB:VN,MV=[[-1,0,"↑","Up"],[1,0,"↓","Down"],[0,-1,"←","Left"],[0,1,"→","Right"]];
  const nb=(r,c)=>MV.map(([dr,dc,ar,nm])=>{const nr=r+dr,nc=c+dc,ok=nr>=0&&nr<4&&nc>=0&&nc<4;return {ar,nm,v:ok?V[nr][nc]:V[r][c],wall:!ok}});
  const arrows=(r,c)=>{const n=nb(r,c),m=Math.max(...n.map(x=>x.v));return n.filter(x=>x.v===m).map(x=>x.ar).join("")};
  $("#xadvG").innerHTML=`<div class="rg" style="max-width:340px">${V.map((row,r)=>row.map((x,c)=>`<button class="rc ${r===advSel[0]&&c===advSel[1]?"sel":""}" data-a="${r},${c}"><span class="ar">${arrows(r,c)}</span><span class="vv">${x}</span></button>`).join("")).join("")}</div>`;
  const [r,c]=advSel,n=nb(r,c),m=Math.max(...n.map(x=>x.v));
  $("#xadvOut").innerHTML=`<h4>(R${r+1}, C${c+1})</h4><ul class="clean small">${n.map(x=>`<li>${x.ar} ${x.nm}: ${x.wall?"حيطة، بتفضل مكانك":"الجار"}، <span class="m">V = ${x.v}</span>${x.v===m?" ✓":""}</li>`).join("")}</ul>
    <p class="small">مع <span class="m">γ = 1</span> و<span class="m">r = 0</span>: <span class="m">q(s,a) = V(s′)</span>، فالـ greedy بيروح لأعلى جار.${advK==="B"&&r===2&&c===2?" <b>(b):</b> عند (R3,C3) الـ Down والـ Left الاتنين بيوصلوا لـ 5، يعني تعادل، والاتنين صح.":""}</p>`;
  isolate($("#xadvOut"));
}
$("#xadvG").addEventListener("click",e=>{const b=e.target.closest("[data-a]");if(b){advSel=b.dataset.a.split(",").map(Number);xadv()}});seg("#xadv","k",k=>{advK=k;xadv()});xadv();

/* Hanoi */
let HS=["A","A","A"];const CW={A:"B",B:"C",C:"A"};let hsteps=0;
function xhan(){
  const pegs={A:[],B:[],C:[]};[2,1,0].forEach(d=>pegs[HS[d]].push(d));
  let s="";["A","B","C"].forEach((p,i)=>{const x=70+i*130;s+=`<rect x="${x-3}" y="30" width="6" height="110" style="fill:var(--muted)"/><text x="${x}" y="164" text-anchor="middle" class="lb" style="font-weight:700">${p}</text>`;
    pegs[p].forEach((d,k)=>{const w=30+d*22;s+=`<rect x="${x-w/2}" y="${126-k*20}" width="${w}" height="16" rx="5" style="fill:${["var(--a)","var(--s)","var(--g)"][d]}"/><text x="${x}" y="${138-k*20}" text-anchor="middle" style="font:700 11px var(--f-mono);fill:#fff">${d+1}</text>`})});
  s+=`<rect x="0" y="140" width="400" height="4" style="fill:var(--line)"/>`;
  $("#xhan").innerHTML=`<svg viewBox="0 0 400 175" class="plot" direction="ltr" role="img" aria-label="tower of hanoi">${s}</svg>`;
  const goal=HS.join("")==="CCC",nxt=[CW[HS[0]],HS[1],HS[2]],r=nxt.join("")==="CCC"?1:0;
  $("#xhanR").innerHTML=`<span class="box">s <b>(${HS.join(",")})</b></span><span class="box">π(s) <b>disk 1: ${HS[0]} → ${CW[HS[0]]}</b></span><span class="box">R(s, π(s)) <b>${goal?"–":r}</b></span><span class="box">خطوات <b>${hsteps}</b></span>${goal?`<span class="pill on">وصلت الهدف</span>`:hsteps>=3&&HS[1]!=="C"?`<span class="pill off">رجعنا لنفس الدايرة، والـ disks 2 و3 ما اتحركوش</span>`:""}`;
  isolate($("#xhanR"));
}
$("#xhanStep").addEventListener("click",()=>{if(HS.join("")==="CCC")return;HS=[CW[HS[0]],HS[1],HS[2]];hsteps++;xhan()});
$("#xhan0").addEventListener("click",()=>{HS=["A","A","A"];hsteps=0;xhan()});$("#xhanB").addEventListener("click",()=>{HS=["B","C","C"];hsteps=0;xhan()});xhan();
