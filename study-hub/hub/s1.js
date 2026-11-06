const FS=16000;
const V=(F1,F2,k=1)=>[[F1*k,90],[F2*k,120],[2500*k,200]];
/* segments: [t0,t1,type,param,gain]  v = voiced (formants), n = noise (lo/hi), b = burst, s = silence */
function synth(segs,o={}){
  const f0=o.f0||120,rate=o.rate||1,gain=o.gain==null?1:o.gain,r=rng(o.seed||7);
  const T=segs[segs.length-1][1]/rate,N=Math.round(T*FS),x=new Float32Array(N);
  let ph=0,pw=0;
  for(let i=0;i<N;i++){
    const t=i/FS*rate,s=segs.find(g=>t>=g[0]&&t<g[1]); if(!s||s[2]==="s")continue;
    const u=(t-s[0])/(s[1]-s[0]),env=Math.min(1,u/.18,(1-u)/.18);
    if(s[2]==="v"){ph+=TAU*f0*(1+.03*Math.sin(TAU*3*t))/FS;let v=0;for(let k=1;k*f0<4000;k++){const f=k*f0;let a=0;for(const[F,B]of s[3])a+=1/(1+((f-F)/B)**2);v+=a*Math.sin(k*ph)/Math.sqrt(k)}x[i]=v*.32*env*(s[4]||1)}
    else if(s[2]==="n"){const w=gauss(r),hp=w-pw;pw=w;x[i]=(s[3]==="hi"?hp*.42:w*.22)*env*(s[4]||1)}
    else if(s[2]==="b"){x[i]=gauss(r)*Math.exp(-u*7)*(s[4]||.8)*.6}
  }
  let mx=0;for(const v of x)mx=Math.max(mx,Math.abs(v));for(let i=0;i<N;i++)x[i]=x[i]/mx*gain;
  return x;
}
const SEG=[[0,.03,"s"],[.03,.08,"n","lo",.6],[.08,.16,"v",V(500,1500)],[.16,.20,"s"],[.20,.25,"b",0,.9],[.25,.40,"v",V(660,1720)],[.40,.45,"s"],[.45,.56,"n","hi",1.3],[.56,.72,"v",V(660,1720)],[.72,.77,"s"],[.77,.80,"b",0,.7],[.80,.84,"s"]];
const WORDS=[["the",.03,.16],["cat",.16,.45],["sat",.45,.80]];
const X1=synth(SEG);
let showWords=false;
function wavePlot(x,t0,t1,o={}){
  const W=900,H=o.h||170,i0=Math.max(0,Math.floor(t0*FS)),i1=Math.min(x.length,Math.ceil(t1*FS)),n=i1-i0;
  const ms=(t1-t0)*1000,step=ms>400?100:ms>150?50:ms>60?10:ms>15?5:1;
  const xt=[];for(let v=Math.ceil(t0*1000/step)*step;v<=t1*1000;v+=step)xt.push(v/1000);
  return plot({w:W,h:H,m:[36,10,18,26],x:[t0,t1],y:[-1.15,1.15],yt:[-1,0,1],xt,xf:v=>Math.round(v*1000)+(xt.length<3?" ms":""),xl:"time (ms)",label:"waveform",body:(sx,sy)=>{
    let s="";
    if(o.words)WORDS.forEach(([w,a,b],k)=>{if(b<t0||a>t1)return;const A=sx(Math.max(a,t0)),B=sx(Math.min(b,t1));s+=`<rect x="${A}" y="14" width="${B-A}" height="${H-40}" style="fill:${k%2?"var(--g)":"var(--s)"};opacity:.10"/><text x="${(A+B)/2}" y="12" text-anchor="middle" class="lb" style="font-weight:600">${w}</text>`});
    if(o.words)SEG.filter(g=>g[2]==="s"&&g[0]>0&&g[1]<.84).forEach(([a,b])=>{if(b<t0||a>t1)return;const A=sx(Math.max(a,t0)),B=sx(Math.min(b,t1));s+=`<rect x="${A}" y="${H/2-14}" width="${B-A}" height="28" style="fill:var(--neg);opacity:.18"/>${B-A>30?`<text x="${(A+B)/2}" y="${H-30}" text-anchor="middle" class="tk" style="fill:var(--neg)">silence</text>`:""}`});
    if(o.ghost){let d="";for(let i=0;i<o.ghost.length;i+=3)d+=(i?"L":"M")+sx(i/FS).toFixed(1)+" "+sy(o.ghost[i]).toFixed(1);s+=`<path d="${d}" style="fill:none;stroke:var(--muted);stroke-width:1;opacity:.35"/>`}
    if(n>W*2){let d="";const per=n/W;for(let p=0;p<W;p++){const a=i0+Math.floor(p*per),b=Math.min(i1,i0+Math.floor((p+1)*per));let lo=0,hi=0;for(let i=a;i<b;i++){if(x[i]<lo)lo=x[i];if(x[i]>hi)hi=x[i]}const xx=sx((a)/FS).toFixed(1);d+=`M${xx} ${sy(lo).toFixed(1)}L${xx} ${sy(hi).toFixed(1)}`}s+=`<path d="${d}" style="fill:none;stroke:${o.col||"var(--s)"};stroke-width:1.2"/>`}
    else{const pts=[];for(let i=i0;i<i1;i++)pts.push([i/FS,x[i]]);s+=`<path d="${path(pts,sx,sy)}" style="fill:none;stroke:${o.col||"var(--s)"};stroke-width:1.4"/>`;
      if(n<=140)pts.forEach(p=>{s+=`<circle cx="${sx(p[0]).toFixed(1)}" cy="${sy(p[1]).toFixed(1)}" r="2.6" style="fill:var(--a)"/>`})}
    return s}});
}
function s1wave(){
  const z=+$("#s1zoom").value,tot=X1.length/FS,win=tot*Math.pow(40/X1.length,z/100),c=.30;
  let t0=Math.max(0,c-win/2),t1=Math.min(tot,t0+win);t0=Math.max(0,t1-win);
  $("#s1wave").innerHTML=wavePlot(X1,t0,t1,{words:showWords});
  const ns=Math.round(win*FS);
  $("#s1zoomO").textContent=(win*1000).toFixed(win<.01?2:0)+" ms";
  $("#s1zmsg").textContent=ns<=140?`كل نقطة برتقاني = sample. ${ns} sample في ${(win*1000).toFixed(2)} ms، يعني واحدة كل 1/16000 ثانية.`:`ظاهر ${nfc(ns)} sample`;
  isolate($("#s1zmsg"));
}
$("#s1zoom").addEventListener("input",s1wave);
$("#s1words").addEventListener("click",e=>{showWords=!showWords;e.target.setAttribute("aria-pressed",showWords);e.target.textContent=showWords?"اخفي الكلمات":"ورّيني الكلمات فين";s1wave()});
s1wave();

/* scene 3: same word, many signals */
const CAT=[[0,.04,"b",0,.9],[.04,.19,"v",V(660,1720)],[.19,.24,"s"],[.24,.27,"b",0,.7]];
const BASE=synth(CAT);
const VAR={base:["نفس الكلمة، صوت راجل عادي.",()=>BASE],
 high:["صوت ست أو طفل: الـ pitch أعلى والـ vocal tract أقصر، فكل الـ formants بتطلع لفوق. الشكل اتغيّر خالص.",()=>synth([[0,.04,"b",0,.9],[.04,.19,"v",V(660,1720,1.18)],[.19,.24,"s"],[.24,.27,"b",0,.7]],{f0:225})],
 fast:["نفس الكلمة بسرعة أكبر: كل حاجة اتضغطت في وقت أقل.",()=>synth(CAT,{rate:1.5})],
 quiet:["الـ mic بعيد: نفس الشكل بس أصغر. ده الوحيد اللي مجرد scaling.",()=>synth(CAT,{gain:.3})],
 noise:["noise في الخلفية: الـ silence اتملى، والـ burst بقى صعب تلاقيه.",()=>{const x=Float32Array.from(BASE),r=rng(3);for(let i=0;i<x.length;i++)x[i]+=gauss(r)*.18;return x}],
 echo:["صدى الأوضة: نسخ متأخرة من الصوت بتتجمع عليه، فالـ silence بتاع الـ t اتملى.",()=>{const x=Float32Array.from(BASE),d1=Math.round(.03*FS),d2=Math.round(.06*FS);const y=new Float32Array(x.length+d2);for(let i=0;i<x.length;i++){y[i]+=x[i];y[i+d1]+=.55*x[i];y[i+d2]+=.3*x[i]}return y}]};
function s1var(k){const x=VAR[k][1]();$("#s1varPlot").innerHTML=wavePlot(x,0,.33,{h:150,ghost:k==="base"?null:BASE,col:k==="base"?"var(--s)":"var(--a)"});$("#s1varMsg").textContent=VAR[k][0];isolate($("#s1varMsg"))}
seg("#s1var","v",s1var);s1var("base");

/* scene 3: alignments */
const choose2=n=>n*(n-1)/2;
function s1align(){
  const T=+$("#s1T").value,r=Math.random;let a=1+Math.floor(r()*(T-2)),b=1+Math.floor(r()*(T-2));while(b===a&&T>3)b=1+Math.floor(r()*(T-2));[a,b]=[Math.min(a,b),Math.max(a,b)];if(T<=3){a=1;b=2}
  const lab=i=>i<a?"c":i<b?"a":"t",col={c:"var(--s)",a:"var(--a)",t:"var(--r)"};
  $("#s1align").innerHTML=`<div style="display:flex;gap:${T>40?1:2}px">${Array.from({length:T},(_,i)=>`<div title="frame ${i+1}" style="flex:1 1 0;min-width:0;height:30px;border-radius:3px;background:color-mix(in srgb,${col[lab(i)]} 70%,transparent);display:grid;place-items:center;font:600 11px var(--f-mono);color:#fff">${T<=30?lab(i):""}</div>`).join("")}</div>`;
  $("#s1TO").textContent=T;
  const n=choose2(T-1);
  $("#s1alignMsg").innerHTML=`ده alignment واحد من <b class="mono">${nfc(n)}</b> alignment ممكن لـ <span class="ltr">"cat"</span> على ${T} frame. القانون: <span class="m">C(T−1, 2)</span>`;
  isolate($("#s1alignMsg"));
}
$("#s1T").addEventListener("input",s1align);$("#s1reAlign").addEventListener("click",s1align);s1align();

/* scene 3: ambiguity */
const AMB=[[["ice cream",1],["I scream",0]],[["I scream",1],["ice cream",0]]];
function s1amb(c){$("#s1amb").innerHTML=AMB[c].map(([t,ok])=>`<div class="card" style="${ok?"border-color:var(--r)":"opacity:.6"}"><span class="ltr" style="font-size:1.15rem;font-weight:600">"${t}"</span><span class="small">نفس الصوت <span class="ltr">/aɪ skriːm/</span></span><span class="pill ${ok?"on":"off"}" style="align-self:flex-start">${ok?"منطقية هنا ✓":"مش منطقية هنا"}</span></div>`).join("");isolate($("#s1amb"))}
seg("#s1ctx","c",c=>s1amb(+c));s1amb(0);

/* scene 4: classification vs transduction picture */
(function(){
  const W=520,H=230;let s=`<svg viewBox="0 0 ${W} ${H}" class="plot" direction="ltr" role="img" aria-label="classification vs transduction">`;
  const box=(x,y,w,h,c,t,o="")=>`<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="6" style="fill:color-mix(in srgb,${c} 16%,var(--surface));stroke:${c}"${o}/>`+(t?`<text x="${x+w/2}" y="${y+h/2+4}" text-anchor="middle" class="lb" style="font-size:11px">${t}</text>`:"");
  s+=`<text x="8" y="16" class="lb" style="font-weight:600">Classification</text>`;
  s+=box(8,28,70,60,"var(--muted)","X-ray");
  s+=`<path d="M86 58H128" style="stroke:var(--ink);stroke-width:1.5;marker-end:url(#ah)"/>`;
  for(let i=0;i<14;i++){const x=140+(i%7)*52,y=30+Math.floor(i/7)*30;s+=box(x,y,46,24,i===4?"var(--r)":"var(--line)",i===4?"label":"")}
  s+=`<text x="140" y="104" class="tk">one label from a fixed set (you can count them)</text>`;
  s+=`<text x="8" y="136" class="lb" style="font-weight:600">Sequence transduction</text>`;
  let d="M8 186";for(let i=0;i<=150;i++)d+=`L${8+i} ${186+Math.sin(i*.55)*Math.sin(i*.07)*22}`;s+=`<path d="${d}" style="fill:none;stroke:var(--s);stroke-width:1.3"/>`;
  s+=`<path d="M166 186H206" style="stroke:var(--ink);stroke-width:1.5;marker-end:url(#ah)"/>`;
  ["the","cat","sat","?"].forEach((t,i)=>{s+=box(216+i*58,174,52,26,i<3?"var(--r)":"var(--line)",t)});
  s+=`<text x="216" y="222" class="tk">output length unknown, any string the language allows</text>`;
  s+=`<defs><marker id="ah" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0L10 5L0 10z" style="fill:var(--ink)"/></marker></defs></svg>`;
  $("#s1clsViz").innerHTML=s;
})();

/* scenes 5-6: WER */
function align(R,H){
  /* fewest edits; among ties, the most exact matches (so the lecture example gives 2S + 1D + 1I) */
  const n=R.length,m=H.length,C=[],M=[];
  for(let i=0;i<=n;i++){C.push(new Array(m+1).fill(0));M.push(new Array(m+1).fill(0));}
  for(let i=0;i<=n;i++)C[i][0]=i;for(let j=0;j<=m;j++)C[0][j]=j;
  const better=(c,mm,bc,bm)=>c<bc||(c===bc&&mm>bm);
  for(let i=1;i<=n;i++)for(let j=1;j<=m;j++){
    const eq=R[i-1]===H[j-1];let bc=C[i-1][j-1]+(eq?0:1),bm=M[i-1][j-1]+(eq?1:0);
    if(better(C[i-1][j]+1,M[i-1][j],bc,bm)){bc=C[i-1][j]+1;bm=M[i-1][j]}
    if(better(C[i][j-1]+1,M[i][j-1],bc,bm)){bc=C[i][j-1]+1;bm=M[i][j-1]}
    C[i][j]=bc;M[i][j]=bm}
  const ops=[],cells=new Set(["0,0"]);let i=n,j=m;
  while(i||j){cells.add(i+","+j);
    const eq=i&&j&&R[i-1]===H[j-1];
    const dg=i&&j&&C[i][j]===C[i-1][j-1]+(eq?0:1)&&M[i][j]===M[i-1][j-1]+(eq?1:0);
    if(dg&&eq){ops.push({t:"=",r:R[i-1],h:H[j-1]});i--;j--}
    else if(j&&C[i][j]===C[i][j-1]+1&&M[i][j]===M[i][j-1]){ops.push({t:"I",h:H[j-1]});j--}
    else if(i&&C[i][j]===C[i-1][j]+1&&M[i][j]===M[i-1][j]){ops.push({t:"D",r:R[i-1]});i--}
    else{ops.push({t:"S",r:R[i-1],h:H[j-1]});i--;j--}}
  ops.reverse();const c={S:0,D:0,I:0};ops.forEach(o=>{if(c[o.t]!=null)c[o.t]++});
  return {D:C,ops,cells,c,n,m};
}
const OPC={"=":"var(--line)",S:"var(--a)",D:"var(--neg)",I:"var(--g)"};
const isAr=t=>/[؀-ۿ]/.test(t);
function alignHTML(a){
  const dir=isAr(a.ops.map(o=>(o.r||"")+(o.h||"")).join(""))?"rtl":"ltr";
  return `<div class="tblwrap"><table class="gtab" style="width:auto;margin-inline:auto;direction:${dir}"><tr><th style="text-align:right">op</th>${a.ops.map(o=>`<td style="color:${o.t==="="?"var(--muted)":OPC[o.t]};font-weight:700">${o.t==="="?"✓":o.t}</td>`).join("")}</tr>
  <tr><th style="text-align:right">ref</th>${a.ops.map(o=>`<td style="border-bottom:3px solid ${OPC[o.t]}">${o.r||"·"}</td>`).join("")}</tr>
  <tr><th style="text-align:right">hyp</th>${a.ops.map(o=>`<td>${o.h||"·"}</td>`).join("")}</tr></table></div>`;
}
const toks=s=>s.trim().split(/\s+/).filter(Boolean);
$("#s1ex").innerHTML=alignHTML(align(toks("the committee approved the new budget today"),toks("the committee improved the budget to date")));
const PRE=[["the committee approved the new budget today","the committee improved the budget to date",false],
 ["turn left","turn it to the left now",false],
 ["ذهبَ أحمدُ إلى المدرسة","ذهب احمد الى المدرسه",false],
 ["وسيكتبونها","وسيكتبوها",true],
 ["i um the phone is i left the portable phone upstairs last night","i got it to the fullest i love to portable form of stores last night",false]];
function norm(s){return s.toLowerCase().replace(/[ً-ْٰـ]/g,"").replace(/[أإآٱ]/g,"ا").replace(/ة/g,"ه").replace(/ى/g,"ي").replace(/[.,!?؟،؛;:"'()\[\]«»]/g," ")}
function s1calc(){
  let R=$("#s1ref").value,H=$("#s1hyp").value;if($("#s1norm").checked){R=norm(R);H=norm(H)}
  const a=align(toks(R),toks(H)),N=a.n,w=N?(a.c.S+a.c.D+a.c.I)/N:NaN;
  const cr=[...R.replace(/\s+/g,"")],ch=[...H.replace(/\s+/g,"")],b=align(cr,ch),cer=cr.length?(b.c.S+b.c.D+b.c.I)/cr.length:NaN;
  $("#s1out").innerHTML=(N?alignHTML(a):"")+`<div class="readout" style="margin-top:8px">
    <span class="box">S <b class="cA">${a.c.S}</b></span><span class="box">D <b class="cN">${a.c.D}</b></span><span class="box">I <b class="cG">${a.c.I}</b></span><span class="box">N <b>${N}</b></span>
    <span class="box" style="border-color:var(--ink)">WER <b>${isNaN(w)?"–":nf(w*100,1)+"%"}</b></span><span class="box">CER <b>${isNaN(cer)?"–":nf(cer*100,1)+"%"}</b></span></div>
    <p class="small" style="margin-top:6px"><span class="m">WER = (${a.c.S} + ${a.c.D} + ${a.c.I}) / ${N}${isNaN(w)?"":" = "+nf(w*100,1)+"%"}</span> · الـ CER نفس الحسبة بس على الحروف (من غير مسافات): <span class="m">${b.c.S+b.c.D+b.c.I} / ${cr.length}</span></p>`;
  if(a.n<=10&&a.m<=10&&N){
    const Rt=toks(R),Ht=toks(H);
    $("#s1dp").innerHTML=`<table class="gtab" style="width:auto;direction:${isAr(R+H)?"rtl":"ltr"}"><tr><th></th><th>∅</th>${Ht.map(t=>`<th>${t}</th>`).join("")}</tr>${a.D.map((row,i)=>`<tr><th>${i?Rt[i-1]:"∅"}</th>${row.map((v,j)=>`<td style="${a.cells.has(i+","+j)?"background:color-mix(in srgb,var(--accent) 22%,transparent);font-weight:700":""}">${v}</td>`).join("")}</tr>`).join("")}</table>`;
  }else $("#s1dp").innerHTML=`<p class="small">الـ table بيظهر لما كل جملة تبقى 10 كلمات أو أقل.</p>`;
  isolate($("#s1out"));isolate($("#s1dp"));
}
function s1pre(k){const p=PRE[k];$("#s1ref").value=p[0];$("#s1hyp").value=p[1];$("#s1norm").checked=p[2];s1calc()}
seg("#s1pre","p",k=>s1pre(+k));["s1ref","s1hyp"].forEach(id=>$("#"+id).addEventListener("input",s1calc));$("#s1norm").addEventListener("change",s1calc);s1pre(0);

/* scene 7: the tail */
const GRP=[["رجالة بيقروا أخبار",40,3],["ستات بيقروا أخبار",30,4],["طلبة",15,8],["كبار السن",10,15],["لهجة",0,30]];
function s1tail(){
  const d=+$("#s1dia").value/100,base=GRP.slice(0,4).reduce((s,g)=>s+g[1],0);
  const sh=GRP.map((g,i)=>i<4?g[1]/base*(1-d):d),avg=GRP.reduce((s,g,i)=>s+sh[i]*g[2],0);
  $("#s1diaO").textContent=Math.round(d*100)+"%";
  $("#s1tail").innerHTML=`<div class="bars">${GRP.map((g,i)=>`<div class="barrow"><span>${g[0]} <span class="xs small">(${Math.round(sh[i]*100)}%)</span></span><div class="track"><div class="fill" style="width:${g[2]/30*100}%;background:${i===4?"var(--neg)":"var(--s)"}"></div></div><span class="val">${g[2]}%</span></div>`).join("")}
    <div class="barrow winner"><span>متوسط الـ corpus</span><div class="track"><div class="fill" style="width:${avg/30*100}%;background:var(--ink)"></div></div><span class="val">${nf(avg,1)}%</span></div></div>
    <p class="small">المتوسط ${nf(avg,1)}% شكله حلو، بس اللي بيتكلم باللهجة بيعاني من 30%. حتى لو نسبتهم بقت 20%، المتوسط بيطلع ${nf(GRP.slice(0,4).reduce((s,g)=>s+g[1]/base*.8*g[2],0)+.2*30,1)}% بس.</p>`;
  isolate($("#s1tail"));
}
$("#s1dia").addEventListener("input",s1tail);s1tail();

makeQuiz("#s1quiz","#s1quizS",["Classification","Transduction","WER","CER"],[
 ["تحويل تسجيل صوت لجملة مكتوبة طولها مش معروف.",1,"الـ input والـ output sequences بأطوال مختلفة ومش معروفة."],
 ["الصوت ده كلب ولا قطة ولا عربية؟",0,"label واحد من مجموعة معروفة تقدر تعدّها."],
 ["عايز تقيّم system عربي، ومش عايز غلطة حرف واحد تبوّظ الكلمة كلها.",3,"الـ CER بيعدّ الحروف، فبيتأثر أقل بالـ affixes."],
 ["معاك reference و hypothesis، وعايز تعدّ الكلمات الغلط وتقسم على طول الـ reference.",2,"ده تعريف الـ WER بالظبط."]
]);
