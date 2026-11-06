/* S3 extras: log + gain, mel vs linear filterbank */
const XE=Array.from({length:40},(_,c)=>Math.exp(-(((c-6)/3)**2))+.4*Math.exp(-(((c-16)/3.5)**2))+.002);
function xlogp(){
  const gdb=+$("#xgain").value,g=10**(gdb/10);$("#xgainO").textContent=(gdb>=0?"+":"")+gdb+" dB";
  const base=XE.map(v=>10*Math.log10(v)),sc=base.map(v=>v+gdb),mn=a=>a.reduce((s,v)=>s+v,0)/a.length,nb=base.map(v=>v-mn(base)),ns=sc.map(v=>v-mn(sc));
  const L=a=>a.map((v,c)=>[c,v]);
  $("#xlogp").innerHTML=`<div class="grid2">${plot({w:420,h:200,m:[36,10,14,26],x:[0,39],y:[-50,25],yt:[-40,-20,0,20],xt:[0,10,20,30,39],xl:"mel channel",yl:"log energy (dB)",zero:false,label:"log mel before and after gain",body:(sx,sy)=>`<path d="${path(L(base),sx,sy)}" style="fill:none;stroke:var(--muted);stroke-width:2"/><path d="${path(L(sc),sx,sy)}" style="fill:none;stroke:var(--g);stroke-width:2.4"/><text x="${sx(38)}" y="22" text-anchor="end" class="lb"><tspan style="fill:var(--muted)">— original</tspan>  <tspan style="fill:var(--g)">— ×g (${gdb>=0?"+":""}${gdb} dB)</tspan></text>`})}
  ${plot({w:420,h:200,m:[36,10,14,26],x:[0,39],y:[-35,35],yt:[-20,0,20],xt:[0,10,20,30,39],xl:"mel channel",yl:"after mean normalization",zero:false,label:"after normalization",body:(sx,sy)=>`<path d="${path(L(nb),sx,sy)}" style="fill:none;stroke:var(--muted);stroke-width:5;opacity:.5"/><path d="${path(L(ns),sx,sy)}" style="fill:none;stroke:var(--g);stroke-width:2;stroke-dasharray:6 4"/><text x="${sx(38)}" y="22" text-anchor="end" class="lb" style="fill:var(--r)">identical after normalization</text>`})}</div>`;
}
$("#xgain").addEventListener("input",xlogp);xlogp();

const xmel=f=>1127*Math.log(1+f/700),ximel=m=>700*(Math.exp(m/1127)-1);let fbk="mel";
function xfb(){
  const M=12,pts=fbk==="mel"?Array.from({length:M+2},(_,i)=>ximel(i*xmel(8000)/(M+1))):Array.from({length:M+2},(_,i)=>i*8000/(M+1));
  const inF=pts.slice(1,M+1).filter(p=>p>=250&&p<=2500).length,below1k=pts.slice(1,M+1).filter(p=>p<1000).length;
  $("#xfb").innerHTML=plot({w:900,h:190,m:[30,10,12,26],x:[0,8000],y:[0,1.1],yt:[0,1],xt:[0,1000,2000,3000,4000,5000,6000,7000,8000],xl:"Hz",label:"filterbank comparison",body:(sx,sy)=>
    `<rect x="${sx(250)}" y="${sy(1.1)}" width="${sx(2500)-sx(250)}" height="${sy(0)-sy(1.1)}" style="fill:var(--a);opacity:.12"/><text x="${sx(1375)}" y="${sy(1.03)}" text-anchor="middle" class="tk" style="fill:var(--a)">F1 + F2 region</text>`+
    pts.slice(0,M).map((_,m)=>`<path d="M${sx(pts[m])} ${sy(0)}L${sx(pts[m+1])} ${sy(1)}L${sx(pts[m+2])} ${sy(0)}Z" style="fill:${m%2?"var(--g)":"var(--accent)"};fill-opacity:.18;stroke:${m%2?"var(--g)":"var(--accent)"};stroke-width:1.4"/>`).join("")});
  $("#xfbR").innerHTML=`<span class="box">قمم جوه منطقة الـ formants <b>${inF} من 12</b></span><span class="box">قمم تحت 1 kHz (منطقة F1) <b>${below1k}</b></span><span class="box">عرض أول filter <b>${Math.round(pts[2]-pts[0])} Hz</b></span>`;
  isolate($("#xfbR"));
}
seg("#xfbK","k",k=>{fbk=k;xfb()});xfb();
