/* L2 extras: backward returns, absorbing state, midterm Q1, final Q6 */
function xret(){
  const g=+$("#xg").value;$("#xgO").textContent=g.toFixed(2);
  const R=$("#xrw").value.split(/[,\s]+/).map(s=>s.replace("−","-")).filter(s=>s!=="").map(Number).filter(v=>!isNaN(v)).slice(0,12);
  const T=R.length,G=new Array(T+1).fill(0);for(let t=T-1;t>=0;t--)G[t]=R[t]+g*G[t+1];
  $("#xret").innerHTML=`<div class="tblwrap"><table class="gtab"><tr><th>t</th>${G.map((_,t)=>`<td>${t}</td>`).join("")}</tr><tr><th>R<sub>t+1</sub></th>${G.map((_,t)=>`<td>${t<T?nf(R[t],2):"–"}</td>`).join("")}</tr><tr><th>G<sub>t</sub></th>${G.map(v=>`<td class="sum">${nf(v,3)}</td>`).join("")}</tr></table></div>
    <ol class="steps" style="margin-top:8px">${[`<span class="m">G<sub>${T}</sub> = 0</span> (الـ episode خلصت)`].concat(Array.from({length:T},(_,i)=>{const t=T-1-i;return `<span class="m">G<sub>${t}</sub> = R<sub>${t+1}</sub> + γ G<sub>${t+1}</sub> = ${nf(R[t],2)} + ${g} × ${nf(G[t+1],3)} = ${nf(G[t],3)}</span>`})).map(x=>`<li><span>${x}</span></li>`).join("")}</ol>`;
}
["xrw","xg"].forEach(id=>$("#"+id).addEventListener("input",xret));xret();

/* absorbing state picture */
(function(){
  let s="";const xs=[40,150,260,370];["S0","S1","S2"].forEach((n,i)=>{s+=`<circle cx="${xs[i]}" cy="50" r="22" style="fill:var(--surface);stroke:var(--s);stroke-width:2"/><text x="${xs[i]}" y="55" text-anchor="middle" class="lb" style="font-weight:600">${n}</text><line x1="${xs[i]+24}" x2="${xs[i+1]-26}" y1="50" y2="50" style="stroke:var(--ink);stroke-width:1.6;marker-end:url(#xar)"/><text x="${(xs[i]+xs[i+1])/2}" y="40" text-anchor="middle" class="lb" style="fill:var(--r)">R = +1</text>`});
  s+=`<rect x="350" y="30" width="40" height="40" rx="6" style="fill:var(--ink)"/><path d="M372 30 C 400 -5, 430 25, 392 44" style="fill:none;stroke:var(--muted);stroke-width:1.6;marker-end:url(#xar)"/><text x="430" y="18" class="tk">R = 0 forever</text><text x="370" y="92" text-anchor="middle" class="tk">absorbing</text>`;
  $("#xabs").innerHTML=`<svg viewBox="0 0 470 100" class="plot" direction="ltr" style="max-width:520px" role="img" aria-label="episode ending in an absorbing state"><defs><marker id="xar" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0 0L10 5L0 10z" style="fill:var(--ink)"/></marker></defs>${s}</svg>`;
})();

/* midterm Q1 */
const XEP=[[["Home",0],["Bus Stop",-1],["Office",5],["Cafe",2]],[["Bus Stop",-2],["Office",3],["Cafe",1],["Home",3]]];
function xq1(){
  const g=+$("#xq1g").value;$("#xq1gO").textContent=g.toFixed(1);
  const all={};
  const eps=XEP.map(ep=>{const G=[];let acc=0;for(let i=ep.length-1;i>=0;i--){acc=ep[i][1]+g*acc;G[i]=acc}ep.forEach((e,i)=>{(all[e[0]]=all[e[0]]||[]).push(G[i])});return G});
  const order=["Home","Bus Stop","Office","Cafe"];
  $("#xq1").innerHTML=XEP.map((ep,k)=>`<div class="tblwrap"><table class="gtab"><tr><th>Episode ${k+1}</th>${ep.map(e=>`<th>${e[0]}</th>`).join("")}</tr><tr><th>reward after</th>${ep.map(e=>`<td>${e[1]}</td>`).join("")}</tr><tr><th>G</th>${eps[k].map(v=>`<td class="sum">${nf(v,3)}</td>`).join("")}</tr></table></div>`).join("")+
   `<div class="tblwrap"><table class="gtab"><tr><th>state</th>${order.map(s=>`<th>${s}</th>`).join("")}</tr><tr><th>v(s) = average</th>${order.map(s=>`<td class="sum">${nf(all[s].reduce((a,b)=>a+b,0)/all[s].length,3)}</td>`).join("")}</tr></table></div>
   <p class="small">مثال من Episode 1: <span class="m">G(Cafe) = 2</span>، وبعدين <span class="m">G(Office) = 5 + ${g}×2 = ${nf(5+g*2,3)}</span>، وبعدين <span class="m">G(Bus) = −1 + ${g}×${nf(5+g*2,3)} = ${nf(-1+g*(5+g*2),3)}</span>. وكل state ظهرت مرة في كل episode، فالـ v = متوسط رقمين.</p>`;
  isolate($("#xq1"));
}
$("#xq1g").addEventListener("input",xq1);xq1();

/* final Q6: two-step transition */
const XP=[[.4,.3,.3],[.2,.5,.3],[.1,.4,.5]],XN=["A","B","C"];let xf=0,xt=2;
(function(){
  const P=[[110,40],[330,40],[220,190]];let s="";
  const arc=(i,j,lab,dx,dy)=>{const[a,b]=P[i],[c,d]=P[j],mx=(a+c)/2+dx,my=(b+d)/2+dy;const L=Math.hypot(c-a,d-b),ex=c-(c-mx)/Math.hypot(c-mx,d-my)*24,ey=d-(d-my)/Math.hypot(c-mx,d-my)*24,sx_=a+(mx-a)/Math.hypot(mx-a,my-b)*24,sy_=b+(my-b)/Math.hypot(mx-a,my-b)*24;
    return `<path d="M${sx_.toFixed(1)} ${sy_.toFixed(1)} Q${mx} ${my} ${ex.toFixed(1)} ${ey.toFixed(1)}" style="fill:none;stroke:var(--muted);stroke-width:1.5;marker-end:url(#xar2)"/><text x="${(mx*2+a+c)/4}" y="${(my*2+b+d)/4+4}" text-anchor="middle" class="lb" style="font-weight:600">${lab}</text>`};
  s+=arc(0,1,"0.3",0,-38)+arc(1,0,"0.2",0,22)+arc(0,2,"0.3",-50,10)+arc(2,0,"0.1",30,-20)+arc(1,2,"0.3",50,10)+arc(2,1,"0.4",-30,-20);
  const loop=(i,lab,ox,oy)=>{const[a,b]=P[i];return `<path d="M${a+ox*.6-8} ${b+oy*.6} C ${a+ox*2-30} ${b+oy*2}, ${a+ox*2+30} ${b+oy*2}, ${a+ox*.6+8} ${b+oy*.6}" style="fill:none;stroke:var(--muted);stroke-width:1.5;marker-end:url(#xar2)"/><text x="${a+ox*2}" y="${b+oy*2+(oy>0?14:-4)}" text-anchor="middle" class="lb" style="font-weight:600">${lab}</text>`};
  s+=loop(0,"0.4",-22,-14)+loop(1,"0.5",22,-14)+loop(2,"0.5",0,24);
  P.forEach(([x,y],i)=>s+=`<circle cx="${x}" cy="${y}" r="22" style="fill:var(--surface);stroke:var(--s);stroke-width:2.2"/><text x="${x}" y="${y+6}" text-anchor="middle" style="font:700 17px var(--f-body);fill:var(--ink)">${XN[i]}</text>`);
  $("#xmc").innerHTML=`<svg viewBox="20 -20 400 270" class="plot" direction="ltr" role="img" aria-label="three-state Markov chain"><defs><marker id="xar2" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0 0L10 5L0 10z" style="fill:var(--muted)"/></marker></defs>${s}</svg>`;
})();
function xmc(){
  const terms=[0,1,2].map(k=>[k,XP[xf][k],XP[k][xt]]),tot=terms.reduce((a,t)=>a+t[1]*t[2],0);
  $("#xmcR").innerHTML=`<ol class="steps">${terms.map(([k,a,b])=>`<li><span><span class="m">${XN[xf]} → ${XN[k]} → ${XN[xt]}: ${a} × ${b} = ${nf(a*b,2)}</span></span></li>`).join("")}</ol>
    <div class="mb" style="font-size:1.05rem">P(${XN[xf]} → ${XN[xt]} in 2) = ${terms.map(t=>nf(t[1]*t[2],2)).join(" + ")} = ${nf(tot,2)}</div>`;
  isolate($("#xmcR"));
}
seg("#xmcF","s",v=>{xf=+v;xmc()});seg("#xmcT","s",v=>{xt=+v;xmc()});xmc();
