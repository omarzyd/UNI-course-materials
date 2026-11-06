const db=v=>20*Math.log10(Math.max(v,1e-9));
/* scene 2: sum of sines */
function s3sum(){
  const a=[+$("#s3a1").value,+$("#s3a2").value,+$("#s3a3").value],F=[200,600,1000],C=["var(--s)","var(--g)","var(--r)"];
  a.forEach((v,i)=>$(`#s3a${i+1}O`).textContent=v.toFixed(2));
  const comp=F.map((f,i)=>{const p=[];for(let j=0;j<=500;j++){const t=j/500*10;p.push([t,a[i]*Math.sin(TAU*f*t/1000)])}return p});
  const sum=comp[0].map((p,j)=>[p[0],comp.reduce((s,c)=>s+c[j][1],0)]);
  $("#s3sum").innerHTML=plot({w:520,h:250,m:[36,10,14,28],x:[0,10],y:[-2.4,2.4],yt:[-2,-1,0,1,2],xt:[0,2,4,6,8,10],xl:"t (ms)",label:"sum of sines",body:(sx,sy)=>
    comp.map((c,i)=>`<path d="${path(c,sx,sy)}" style="fill:none;stroke:${C[i]};stroke-width:1.2;opacity:.45"/>`).join("")+`<path d="${path(sum,sx,sy)}" style="fill:none;stroke:var(--ink);stroke-width:2.4"/>`});
  $("#s3sumSp").innerHTML=plot({w:420,h:150,m:[36,10,10,28],x:[0,1200],y:[0,1.05],yt:[0,.5,1],xt:[0,200,600,1000],xl:"Hz",label:"spectrum",body:(sx,sy)=>
    F.map((f,i)=>`<rect x="${sx(f)-9}" y="${sy(a[i])}" width="18" height="${sy(0)-sy(a[i])}" rx="3" style="fill:${C[i]}"/>`).join("")});
}
["s3a1","s3a2","s3a3"].forEach(id=>$("#"+id).addEventListener("input",s3sum));s3sum();

/* scene 3: DFT probe */
const ND=32,XD=Array.from({length:ND},(_,n)=>Math.cos(TAU*3*n/ND)+.5*Math.cos(TAU*7*n/ND));
const XK=Array.from({length:ND/2+1},(_,k)=>{let re=0,im=0;for(let n=0;n<ND;n++){re+=XD[n]*Math.cos(TAU*k*n/ND);im-=XD[n]*Math.sin(TAU*k*n/ND)}return Math.hypot(re,im)});
function s3dft(){
  const k=+$("#s3k").value;$("#s3kO").textContent=k;
  const prb=n=>Math.cos(TAU*k*n/ND),prod=XD.map((v,n)=>v*prb(n)),sum=prod.reduce((s,v)=>s+v,0);
  const cur=[];for(let j=0;j<=400;j++){const n=j/400*(ND-1);cur.push([n,prb(n)])}
  const W=520,top=plot({w:W,h:170,m:[30,10,16,20],x:[-.5,ND-.5],y:[-1.7,1.7],yt:[-1,0,1],label:"frame and probe",body:(sx,sy)=>
    `<path d="${path(cur,sx,sy)}" style="fill:none;stroke:var(--a);stroke-width:1.6;opacity:.85"/>`+XD.map((v,n)=>`<line x1="${sx(n)}" x2="${sx(n)}" y1="${sy(0)}" y2="${sy(v)}" style="stroke:var(--s);stroke-width:2"/><circle cx="${sx(n)}" cy="${sy(v)}" r="3" style="fill:var(--s)"/>`).join("")+
    `<text x="${sx(31)}" y="12" text-anchor="end" class="lb"><tspan style="fill:var(--s)">● x[n]</tspan>   <tspan style="fill:var(--a)">— probe cos(2π·${k}·n/N)</tspan></text>`});
  const bot=plot({w:W,h:150,m:[30,10,16,20],x:[-.5,ND-.5],y:[-1.7,1.7],yt:[-1,0,1],label:"product",body:(sx,sy)=>
    prod.map((v,n)=>`<rect x="${sx(n)-5}" y="${Math.min(sy(v),sy(0))}" width="10" height="${Math.abs(sy(v)-sy(0))}" style="fill:${v>=0?"var(--r)":"var(--neg)"}"/>`).join("")+
    `<text x="${sx(31)}" y="12" text-anchor="end" class="lb">x[n] × probe  →  Σ = ${nf(sum,2)}</text>`});
  $("#s3dft").innerHTML=top+bot;
  $("#s3dftSp").innerHTML=plot({w:420,h:150,m:[30,10,10,24],x:[-.5,16.5],y:[0,17],yt:[0,8,16],xt:[0,3,7,10,16],xl:"k",label:"magnitude spectrum",body:(sx,sy)=>
    XK.map((v,i)=>`<rect x="${sx(i)-7}" y="${sy(v)}" width="14" height="${Math.max(0,sy(0)-sy(v))}" rx="2" style="fill:${i===k?"var(--a)":"var(--line)"}"/>`).join("")+`<rect x="${sx(k)-9}" y="${sy(17)}" width="18" height="${sy(0)-sy(17)}" style="fill:none;stroke:var(--a);stroke-dasharray:3 3"/>`});
  $("#s3dftR").innerHTML=`<span class="box"><span class="ltr">|X[${k}]|</span> <b>${nf(XK[k],2)}</b></span>`;
  $("#s3dftMsg").textContent=XK[k]>4?`الـ probe لقى الـ frequency دي: الضرب موجب في أغلب الأماكن، والمجموع كبير. وده بيحصل بس عند k = 3 وk = 7.`:`مفيش حاجة هنا: الموجب والسالب لغوا بعض، فالـ |X| قريب من الصفر.`;
  isolate($("#s3dftR"));isolate($("#s3dftMsg"));
}
$("#s3k").addEventListener("input",s3dft);s3dft();

/* scene 4: FFT cost + bins */
function s3cost(){
  const e=+$("#s3N").value,N=2**e,d=N*N,f=N*e;$("#s3NO").textContent=nfc(N);
  $("#s3cost").innerHTML=`<div class="bars" style="margin-top:6px"><div class="barrow"><span><span class="m">N²</span> (DFT)</span><div class="track"><div class="fill" style="width:100%;background:var(--neg)"></div></div><span class="val">${nfc(d)}</span></div>
   <div class="barrow"><span><span class="m">N log₂N</span> (FFT)</span><div class="track"><div class="fill" style="width:${Math.max(.6,f/d*100)}%;background:var(--r)"></div></div><span class="val">${nfc(f)}</span></div></div>
   <p class="small">الـ FFT أسرع بحوالي <b>${nfc(d/f)}×</b>. وعند <span class="m">N = 512</span>: <span class="m">262,144</span> عملية قصاد <span class="m">4,608</span>.</p>`;isolate($("#s3cost"));
}
function s3bin(){
  const fs=+$("#s3fs").value,N=+$("#s3NN").value,kk=$("#s3kk");kk.max=N/2;if(+kk.value>N/2)kk.value=N/2;const k=+kk.value;$("#s3kkO").textContent=k;
  $("#s3binR").innerHTML=`<span class="box">spacing <span class="m">f<sub>s</sub>/N</span> <b>${nf(fs/N,2)} Hz</b></span><span class="box">bins <span class="m">N/2 + 1</span> <b>${N/2+1}</b></span><span class="box">bin ${k} عند <b>${nf(k*fs/N,1)} Hz</b></span><span class="box">آخر bin <b>${fs/2} Hz</b></span>`;isolate($("#s3binR"));
}
$("#s3N").addEventListener("input",s3cost);["s3fs","s3NN"].forEach(id=>$("#"+id).addEventListener("change",s3bin));$("#s3kk").addEventListener("input",s3bin);s3cost();s3bin();

/* scene 5: one DFT hides time */
const F5=8000,A5=Array.from({length:512},(_,n)=>Math.sin(TAU*(n<256?500:1500)*n/F5)),B5=A5.slice(256).concat(A5.slice(0,256));
(function(){
  const mA=mag(A5,512),mB=mag(B5,512);
  const wv=(x,y0,lab,col)=>({x,y0,lab,col});
  $("#s3whole").innerHTML=plot({w:520,h:230,m:[30,10,14,26],x:[0,64],y:[-3.6,1.3],yt:[],xt:[0,16,32,48,64],xl:"t (ms)",zero:false,label:"two signals",body:(sx,sy)=>
    [wv(A5,0,"A: low → high","var(--s)"),wv(B5,-2.4,"B: high → low","var(--a)")].map(o=>`<path d="${path(o.x.map((v,n)=>[n/8,o.y0+v]),sx,sy)}" style="fill:none;stroke:${o.col};stroke-width:1"/><text x="${sx(0.5)}" y="${sy(o.y0+1.22)}" class="lb" style="fill:${o.col};font-weight:600">${o.lab}</text>`).join("")});
  const mx=Math.max(...mA);
  $("#s3wholeSp").innerHTML=plot({w:420,h:230,m:[30,10,14,26],x:[0,4000],y:[0,1.05],yt:[0,.5,1],xt:[0,1000,2000,3000,4000],xl:"Hz",label:"magnitude spectra",body:(sx,sy)=>
    `<path d="${path(Array.from(mA,(v,k)=>[k*F5/512,v/mx]),sx,sy)}" style="fill:none;stroke:var(--s);stroke-width:4;opacity:.5"/><path d="${path(Array.from(mB,(v,k)=>[k*F5/512,v/mx]),sx,sy)}" style="fill:none;stroke:var(--a);stroke-width:1.6;stroke-dasharray:5 4"/><text x="${sx(3900)}" y="22" text-anchor="end" class="lb"><tspan style="fill:var(--s)">— |A|</tspan>  <tspan style="fill:var(--a)">- - |B|</tspan>  identical</text>`});
  const sA=stft(A5,64,16,64),sB=stft(B5,64,16,64),hi=Math.max(...sA.flat());
  heat($("#s3cvA"),sA,hi-60,hi);heat($("#s3cvB"),sB,hi-60,hi);
})();

/* scene 6: framing numbers */
function s3fr(){
  const d=+$("#s3dur").value,Lm=+$("#s3Lm").value,Hm=+$("#s3Hm").value,L=16*Lm,H=16*Hm,N=Math.round(d*16000),T=1+Math.floor((N-L)/H);
  $("#s3durO").textContent=d+" s";$("#s3LmO").textContent=Lm+" ms";$("#s3HmO").textContent=Hm+" ms";
  $("#s3frSteps").innerHTML=`<li><span>الـ frame بالـ samples: <span class="m">L = ${Lm} ms × 16 = ${L}</span>، والـ hop: <span class="m">H = ${Hm} × 16 = ${H}</span>.</span></li>
   <li><span>عدد الـ samples: <span class="m">N<sub>tot</sub> = ${d} × 16000 = ${nfc(N)}</span>.</span></li>
   <li><span>عوّض في القانون:<span class="mb" style="font-size:1.02rem;padding:8px 10px;margin-top:4px">T = 1 + ⌊(${nfc(N)} − ${L}) / ${H}⌋ = 1 + ⌊${nf((N-L)/H,2)}⌋ = <b>${nfc(T)}</b> frames</span></span></li>
   <li><span>الـ frames اللي جنب بعض متداخلة بـ <span class="m">${Math.max(0,Lm-Hm)} ms</span>.${d===2&&Lm===25&&Hm===10?" وده رقم المحاضرة: <b>198</b>.":""}</span></li>`;
  isolate($("#s3frSteps"));
}
["s3dur","s3Lm","s3Hm"].forEach(id=>$("#"+id).addEventListener("input",s3fr));s3fr();

/* scene 7: leakage */
let s3w="rect";
function s3leak(){
  const c=+$("#s3cyc").value,N=32,w=WIN[s3w];$("#s3cycO").textContent=c.toFixed(1);
  const y=Array.from({length:N},(_,n)=>w(n,N)*Math.cos(TAU*c*n/N));
  const pts=[];for(let r=0;r<3;r++)for(let n=0;n<N;n++)pts.push([r*N+n,y[n]]);
  const jump=Math.abs(y[N-1]-y[0])>.35;
  $("#s3tile").innerHTML=plot({w:520,h:200,m:[30,10,12,22],x:[0,96],y:[-1.25,1.25],yt:[-1,0,1],xt:[0,32,64,96],xl:"n",label:"periodic extension",body:(sx,sy)=>
    [32,64].map(b=>`<line x1="${sx(b-.5)}" x2="${sx(b-.5)}" y1="${sy(1.2)}" y2="${sy(-1.2)}" style="stroke:var(--muted);stroke-dasharray:3 4"/>`+(jump?`<circle cx="${sx(b-.5)}" cy="${sy((y[N-1]+y[0])/2)}" r="11" style="fill:none;stroke:var(--neg);stroke-width:2.5"/>`:"")).join("")+
    `<path d="${path(pts,sx,sy)}" style="fill:none;stroke:var(--s);stroke-width:1.6"/>`+pts.map(p=>`<circle cx="${sx(p[0])}" cy="${sy(p[1])}" r="1.8" style="fill:var(--s)"/>`).join("")});
  const m=mag(y,N),mx=Math.max(...m),dbs=Array.from(m,v=>Math.max(-60,db(v/mx)));
  const k0=Math.floor(c),e=Array.from(m,v=>v*v),tot=e.reduce((s,v)=>s+v,0),inn=(e[k0]||0)+(e[k0+1]||0)*(Math.abs(c-k0)>1e-9?1:0),leak=Math.max(0,1-inn/tot);
  $("#s3leak").innerHTML=plot({w:420,h:200,m:[36,10,12,22],x:[-.5,16.5],y:[-60,3],yt:[-60,-40,-20,0],xt:[0,2,4,6,8,10,12,14,16],xl:"k",zero:false,label:"spectrum in dB",body:(sx,sy)=>
    dbs.map((v,k)=>`<rect x="${sx(k)-7}" y="${sy(v)}" width="14" height="${sy(-60)-sy(v)}" rx="2" style="fill:${k===k0||(k===k0+1&&c!==k0)?"var(--a)":"var(--neg)"};opacity:${k===k0||(k===k0+1&&c!==k0)?1:.7}"/>`).join("")});
  $("#s3leakMsg").innerHTML=`${Number.isInteger(c)?`<span class="pill on">${c} cycles بالظبط</span> الطرفين راكبين على بعض، فطلع spike واحد.`:jump?`<span class="pill off">قفزة</span> فيه قفزة بين النسخ، والطاقة سرّبت في الـ bins كلها.`:`<span class="pill mid">الـ window قرّب الأطراف للصفر</span> فالقفزة اختفت تقريباً.`} الطاقة اللي بره أقرب 2 bins: <b>${nf(leak*100,1)}%</b>.`;
  isolate($("#s3leakMsg"));
}
seg("#s3win","w",w=>{s3w=w;s3leak()});$("#s3cyc").addEventListener("input",s3leak);s3leak();

/* scene 8: window shapes and their spectra */
(function(){
  const L=32,Z=1024,ks=["rect","hann","hamming"],col={rect:"var(--muted)",hann:"var(--s)",hamming:"var(--a)"};
  $("#s3wshape").innerHTML=plot({w:460,h:200,m:[30,10,12,24],x:[0,L],y:[-.05,1.1],yt:[0,.5,1],xt:[0,8,16,24,32],xl:"n",zero:false,label:"window shapes",body:(sx,sy)=>
    ks.map(k=>`<path d="${path(Array.from({length:L+1},(_,n)=>[n,n===L?WIN[k](0,L):WIN[k](n,L)]),sx,sy)}" style="fill:none;stroke:${col[k]};stroke-width:2.2"/>`).join("")+
    `<text x="${sx(31)}" y="${sy(1.06)}" text-anchor="end" class="lb"><tspan style="fill:var(--muted)">rect</tspan>  <tspan style="fill:var(--s)">Hann</tspan>  <tspan style="fill:var(--a)">Hamming</tspan></text>`});
  const sp={},sl={};
  ks.forEach(k=>{const w=Array.from({length:L},(_,n)=>WIN[k](n,L)),m=mag(w,Z),mx=m[0];sp[k]=Array.from(m,v=>Math.max(-80,db(v/mx)));
    let i=1;while(i<Z/2&&sp[k][i]<=sp[k][i-1])i++;let best=-200;for(let j=i;j<Z/2&&j<i+80;j++)best=Math.max(best,sp[k][j]);sl[k]=best});
  $("#s3wspec").innerHTML=plot({w:460,h:200,m:[36,10,12,24],x:[0,8],y:[-80,3],yt:[-80,-60,-40,-20,0],xt:[0,1,2,3,4,5,6,7,8],xl:"bins",zero:false,label:"window spectra",body:(sx,sy)=>
    ks.map(k=>`<path d="${path(sp[k].slice(0,8*Z/L+1).map((v,i)=>[i*L/Z,v]),sx,sy)}" style="fill:none;stroke:${col[k]};stroke-width:2"/>`).join("")});
  $("#s3wR").innerHTML=`<span class="box">أول side lobe · rect <b>${nf(sl.rect,0)} dB</b></span><span class="box">Hann <b>${nf(sl.hann,0)} dB</b></span><span class="box">Hamming <b>${nf(sl.hamming,0)} dB</b></span><span class="box">عرض الـ main lobe <b>2 → 4 bins</b></span>`;
})();

/* scene 9: STFT stepper */
const F9=8000,X9=(()=>{const r=rng(9),x=[];let pw=0;for(let i=0;i<F9;i++){const t=i/F9;let v=0;
  if(t<.4)v=.8*Math.sin(TAU*(300*t+1700*t*t/.8));else if(t<.7)v=.6*Math.sin(TAU*800*t)+.35*Math.sin(TAU*2400*t);else{const w=gauss(r);v=(w-pw)*.3;pw=w}
  const e=Math.min(1,(t%1)/.01);x.push(v*e)}return x})();
const L9=200,H9=80,N9=256,C9=stft(X9,L9,H9,N9,"hann"),T9=C9.length,HI9=Math.max(...C9.flat());
let m9=0;
function s3st(){
  const cols=C9.map((c,i)=>i<m9?c:c.map(()=>-999));heat($("#s3stCv"),cols,HI9-70,HI9);
  const cur=Math.max(0,m9-1),s0=cur*H9;
  const env=[];for(let p=0;p<300;p++){const a=Math.floor(p/300*F9),b=Math.floor((p+1)/300*F9);let lo=0,hi=0;for(let i=a;i<b;i++){lo=Math.min(lo,X9[i]);hi=Math.max(hi,X9[i])}env.push([a/F9,lo,hi])}
  $("#s3stWave").innerHTML=plot({w:900,h:130,m:[30,10,10,24],x:[0,1],y:[-1.3,1.3],yt:[],xt:[0,.2,.4,.6,.8,1],xf:v=>v+" s",label:"signal with current window",body:(sx,sy)=>
    env.map(e=>`<line x1="${sx(e[0])}" x2="${sx(e[0])}" y1="${sy(e[1])}" y2="${sy(e[2])}" style="stroke:var(--s);stroke-width:2;opacity:.75"/>`).join("")+
    (m9?`<rect x="${sx(s0/F9)}" y="${sy(1.25)}" width="${Math.max(2,sx((s0+L9)/F9)-sx(s0/F9))}" height="${sy(-1.25)-sy(1.25)}" style="fill:var(--a);opacity:.25;stroke:var(--a)"/>`:"")});
  const sp=m9?C9[cur]:null;
  $("#s3stSp").innerHTML=plot({w:420,h:200,m:[36,10,12,24],x:[0,4000],y:[HI9-70,HI9+3],yt:[],xt:[0,1000,2000,3000,4000],xl:"Hz",zero:false,label:"current frame spectrum",body:(sx,sy)=>
    sp?`<path d="${path(sp.map((v,k)=>[k*F9/N9,Math.max(HI9-70,v)]),sx,sy)}" style="fill:none;stroke:var(--a);stroke-width:1.8"/>`:`<text x="${sx(2000)}" y="100" text-anchor="middle" class="tk">press "next frame"</text>`});
  $("#s3stR").innerHTML=`<span class="box">frame <b>m = ${cur}</b></span><span class="box">من sample <b>${m9?s0:"–"}</b></span><span class="box">اتعمل <b>${m9} / ${T9}</b></span>`;isolate($("#s3stR"));
}
$("#s3st1").addEventListener("click",()=>{if(m9<T9){m9++;s3st()}});
$("#s3stAll").addEventListener("click",()=>{if(reduce){m9=T9;s3st();return}const go=()=>{if(m9<T9){m9=Math.min(T9,m9+2);s3st();requestAnimationFrame(go)}};go()});
$("#s3st0").addEventListener("click",()=>{m9=0;s3st()});s3st();

/* scene 10: time–frequency trade-off */
const X10=(()=>{const x=[];for(let i=0;i<4800;i++){const t=i/8000;x.push(.5*Math.sin(TAU*1000*t)+.5*Math.sin(TAU*1150*t))}[.15,.3,.45].forEach(t=>{const i=Math.round(t*8000);x[i]+=6;x[i+1]-=3});return x})();
const TFM={5:"الـ clicks خطوط رفيعة وواضحة جداً، بس النغمتين (1000 و1150 Hz) بقوا شريط واحد عريض: الـ frequency مغبّشة.",25:"حل وسط: النغمتين منفصلين، والـ clicks لسه واضحين. عشان كده الـ 25 ms هو الـ default في الكلام.",100:"النغمتين خطين رفاع جداً ومنفصلين، بس كل click اتمطّ على 100 ms: الوقت مغبّش."};
function s3tf(ms){
  const L=ms*8,pad=new Array(L/2).fill(0),x=pad.concat(X10,pad),cols=stft(x,L,20,1024,"hann"),r0=77,rows=128,hi=Math.max(...cols.map(c=>Math.max(...c.slice(r0,r0+rows))));
  heat($("#s3tfCv"),cols,hi-55,hi,rows,r0);
  $("#s3tfR").innerHTML=`<span class="box">دقة الوقت ≈ <b>${ms} ms</b></span><span class="box">دقة الـ frequency ≈ <span class="m">f<sub>s</sub>/L</span> <b>${8000/L} Hz</b></span><span class="box">بين النغمتين <b>150 Hz</b></span><span class="box">المحور الرأسي <b>600–1600 Hz</b></span>`;
  $("#s3tfMsg").textContent=TFM[ms];isolate($("#s3tfR"));isolate($("#s3tfMsg"));
}
seg("#s3tf","l",l=>s3tf(+l));s3tf(25);

/* scene 11: mel */
const mel=f=>1127*Math.log(1+f/700),imel=m=>700*(Math.exp(m/1127)-1);
const MP=[[200,300],[6200,6300]];
function s3mel(){
  const f1=+$("#s3m1").value,f2=+$("#s3m2").value;$("#s3m1O").textContent=f1+" Hz";$("#s3m2O").textContent=f2+" Hz";
  const cur=[];for(let f=0;f<=8000;f+=50)cur.push([f,mel(f)]);
  $("#s3mel").innerHTML=plot({w:520,h:270,m:[44,10,14,28],x:[0,8000],y:[0,3000],yt:[0,1000,2000,2840],xt:[0,1000,2000,4000,6000,8000],xl:"Hz",yl:"mel",zero:false,label:"mel curve",body:(sx,sy)=>
    `<path d="${path(cur,sx,sy)}" style="fill:none;stroke:var(--g);stroke-width:2.4"/>`+[[f1,"var(--s)"],[f2,"var(--a)"]].map(([f,c])=>`<line x1="${sx(f)}" x2="${sx(f)}" y1="${sy(0)}" y2="${sy(mel(f))}" style="stroke:${c};stroke-dasharray:3 3"/><line x1="${sx(0)}" x2="${sx(f)}" y1="${sy(mel(f))}" y2="${sy(mel(f))}" style="stroke:${c};stroke-dasharray:3 3"/><circle cx="${sx(f)}" cy="${sy(mel(f))}" r="5" style="fill:${c}"/>`).join("")});
  $("#s3melR").innerHTML=`<span class="box">mel(f₁) <b>${nf(mel(f1),1)}</b></span><span class="box">mel(f₂) <b>${nf(mel(f2),1)}</b></span><span class="box">Δf <b>${Math.abs(f2-f1)} Hz</b></span><span class="box" style="border-color:var(--g)">Δmel <b>${nf(Math.abs(mel(f2)-mel(f1)),1)}</b></span>`;isolate($("#s3melR"));
}
["s3m1","s3m2"].forEach(id=>$("#"+id).addEventListener("input",s3mel));seg("#s3melP","p",p=>{$("#s3m1").value=MP[p][0];$("#s3m2").value=MP[p][1];s3mel()});s3mel();

/* scene 12: filterbank */
let fbSel=-1;
function s3fb(){
  const M=+$("#s3M").value;$("#s3MO").textContent=M;if(fbSel>=M)fbSel=-1;
  const top=mel(8000),pts=Array.from({length:M+2},(_,i)=>imel(i*top/(M+1)));
  $("#s3fb").innerHTML=plot({w:900,h:200,m:[30,10,12,26],x:[0,8000],y:[0,1.1],yt:[0,1],xt:[0,1000,2000,3000,4000,5000,6000,7000,8000],xl:"Hz",zero:true,label:"mel filterbank",body:(sx,sy)=>
    pts.slice(0,M).map((_,m)=>{const a=pts[m],b=pts[m+1],c=pts[m+2],on=m===fbSel,col=m%2?"var(--g)":"var(--accent)";
      return `<path data-m="${m}" d="M${sx(a)} ${sy(0)}L${sx(b)} ${sy(1)}L${sx(c)} ${sy(0)}Z" style="cursor:pointer;fill:${col};fill-opacity:${on?.55:.14};stroke:${col};stroke-width:${on?2.5:1.3}"/>`}).join("")});
  $("#s3fbR").innerHTML=`<span class="box">نقط <span class="m">M + 2</span> <b>${M+2}</b></span><span class="box">الخطوة في الـ mel <b>${nf(top/(M+1),1)}</b></span>`+(fbSel>=0?`<span class="box" style="border-color:var(--accent)">filter ${fbSel+1}: <b>${Math.round(pts[fbSel])} → ${Math.round(pts[fbSel+1])} → ${Math.round(pts[fbSel+2])} Hz</b></span><span class="box">العرض <b>${Math.round(pts[fbSel+2]-pts[fbSel])} Hz</b></span>`:`<span class="box">دوس على أي مثلث</span>`);
  $("#s3fbPts").innerHTML=M<=16?`النقط بالـ Hz: <span class="mono">${pts.map(p=>Math.round(p)).join(", ")}</span>`:"";
  $("#s3fbMat").textContent=`(198 × 257) · (257 × ${M}) → 198 × ${M}`;
  isolate($("#s3fbR"));isolate($("#s3fbPts"));
}
$("#s3M").addEventListener("input",s3fb);$("#s3fb").addEventListener("click",e=>{const p=e.target.closest("[data-m]");if(p){fbSel=+p.dataset.m;s3fb()}});s3fb();

/* scene 13: linear vs log */
const E13=(()=>{const T=150,C=80,cols=[],r=rng(13);for(let t=0;t<T;t++){const col=[];for(let c=0;c<C;c++){let e=1e-7*(1+r());
  if((t>=10&&t<55)||(t>=95&&t<140)){const f1=12+3*Math.sin(t/9),f2=30+4*Math.cos(t/11);e+=Math.exp(-(((c-f1)/3)**2))+.35*Math.exp(-(((c-f2)/3.5)**2))+.02*Math.exp(-c/20)}
  if(t>=62&&t<88&&c>45)e+=1e-3*(.6+.8*r());col.push(e)}cols.push(col)}return cols})();
function s3lg(s){
  const mx=Math.max(...E13.flat());
  if(s==="lin"){heat($("#s3lgCv"),E13.map(c=>c.map(v=>v/mx)),0,1);$("#s3lgMsg").textContent="Linear: الـ vowels بس هي اللي باينة. الـ fricative اللي في النص (الـ /s/ في الـ channels العالية) طاقته أقل بـ 1000 مرة، فاختفى.";}
  else{heat($("#s3lgCv"),E13.map(c=>c.map(v=>10*Math.log10(v/mx))),-70,0);$("#s3lgMsg").textContent="Log (dB): كل حاجة بانت، الـ formants في الـ vowels، والـ fricative العالي في النص كمان. ده اللي الـ model محتاجه.";}
  isolate($("#s3lgMsg"));
}
seg("#s3lg","s",s3lg);s3lg("lin");

/* scene 14: MFCC = truncated DCT of the log-mel frame */
const C14=64,ENV=Array.from({length:C14},(_,c)=>-30+28*Math.exp(-(((c-9)/4)**2))+20*Math.exp(-(((c-24)/5)**2))+10*Math.exp(-(((c-42)/6)**2))-c*.15),
  RIP=Array.from({length:C14},(_,c)=>5*Math.cos(TAU*c/(3+c*.06))*Math.exp(-c/45)),ORG=ENV.map((v,c)=>v+RIP[c]);
const dct=x=>{const N=x.length;return Array.from({length:N},(_,k)=>x.reduce((s,v,n)=>s+v*Math.cos(Math.PI/N*(n+.5)*k),0))};
const idct=(X,K)=>{const N=X.length;return Array.from({length:N},(_,n)=>{let s=X[0]/N;for(let k=1;k<K;k++)s+=2/N*X[k]*Math.cos(Math.PI/N*(n+.5)*k);return s})};
const D14=dct(ORG);
function s3mf(){
  const K=+$("#s3K").value,rec=idct(D14,K);$("#s3KO").textContent=K;
  $("#s3mf").innerHTML=plot({w:520,h:250,m:[36,10,14,28],x:[0,C14-1],y:[-45,8],yt:[-40,-20,0],xt:[0,16,32,48,63],xl:"mel channel",yl:"log energy",zero:false,label:"MFCC reconstruction",body:(sx,sy)=>
    `<path d="${path(ORG.map((v,c)=>[c,v]),sx,sy)}" style="fill:none;stroke:var(--muted);stroke-width:1.2"/><path d="${path(ENV.map((v,c)=>[c,v]),sx,sy)}" style="fill:none;stroke:var(--r);stroke-width:1.4;stroke-dasharray:5 4"/><path d="${path(rec.map((v,c)=>[c,v]),sx,sy)}" style="fill:none;stroke:var(--s);stroke-width:2.6"/>`+
    `<text x="${sx(63)}" y="20" text-anchor="end" class="lb"><tspan style="fill:var(--muted)">— log-mel frame</tspan>  <tspan style="fill:var(--r)">- - envelope</tspan>  <tspan style="fill:var(--s)">— from ${K} coeffs</tspan></text>`});
  $("#s3mfMsg").textContent=K<6?"coefficients قليلة قوي: فاضل الميل العام بس، والـ formants ضاعت.":K<=20?"حوالي 13: الـ envelope (الـ formants) رجعت، والـ ripple بتاع الـ pitch اترمى. ده اللي الـ MFCC بيحتفظ بيه.":"coefficients كتير: الـ ripple بتاع الـ pitch رجع تاني. ودي تفاصيل مش محتاجينها عشان نعرف الـ phone.";
  isolate($("#s3mfMsg"));
}
$("#s3K").addEventListener("input",s3mf);s3mf();

/* scene 15: shapes */
function s3sh(){
  const d=+$("#s3pd").value,N=Math.round(d*16000),T=1+Math.floor((N-400)/160);$("#s3pdO").textContent=d+" s";
  $("#s3shapes").innerHTML=[["waveform",`(${nfc(N)},)`],["frames",`${T}×400`],["|DFT|²",`${T}×257`],["mel",`${T}×80`],["log",`${T}×80`],["DCT",`${T}×13`],["+Δ, ΔΔ",`${T}×39`]].map(([a,b],i)=>`${i?"<i>→</i>":""}<span>${a} <b>${b}</b></span>`).join("");
}
$("#s3pd").addEventListener("input",s3sh);s3sh();

/* scene 16: order the steps */
const ORD=["frame","window","|DFT|²","mel filterbank","log","DCT"];let ordP=[];
const ORDS=[3,0,5,2,4,1].map(i=>ORD[i]);
function s3ord(){
  $("#s3ord").innerHTML=ORDS.map(s=>`<button type="button" data-s="${s}" ${ordP.includes(s)?"disabled":""}>${s}</button>`).join("");
  $("#s3ordP").innerHTML=ordP.length?ordP.map((s,i)=>`<span class="${s===ORD[i]?"ok":"bad"}">${i+1}. ${s}</span>`).join(""):`<span style="opacity:.6">…</span>`;
  const bad=ordP.findIndex((s,i)=>s!==ORD[i]);
  $("#s3ordMsg").textContent=bad>=0?`الخطوة ${bad+1} غلط. الصح: ${ORD[bad]}.`:ordP.length===ORD.length?"صح كله! والـ DCT للـ MFCC بس، والـ log-mel بيقف عند الـ log.":"";
  isolate($("#s3ordMsg"));
}
$("#s3ord").addEventListener("click",e=>{const b=e.target.closest("button[data-s]");if(b&&ordP.length<ORD.length){ordP.push(b.dataset.s);s3ord()}});
$("#s3ord0").addEventListener("click",()=>{ordP=[];s3ord()});s3ord();
$("#s3pipe").addEventListener("keydown",e=>{if((e.key==="Enter"||e.key===" ")&&e.target.dataset.go){e.preventDefault();e.target.click()}});
