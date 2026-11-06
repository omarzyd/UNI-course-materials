/* scene 1: syllables */
const SYL={
 banana:{w:"ba · na · na",s:[["b","a",""],["n","a",""],["n","a",""]],m:"3 syllables. كل واحدة onset + nucleus ومن غير coda."},
 cat:{w:"cat",s:[["c","a","t"]],m:"syllable واحدة كاملة: onset، و nucleus، و coda."},
 strengths:{w:"strengths",s:[["str","e","ngths"]],m:"9 حروف، وبرضه syllable واحدة بس، عشان فيها nucleus واحد. الـ onset والـ coda هنا طوال جداً."},
 button:{w:"but · ton",s:[["b","ʌ","t"],["","n̩",""]],m:"المقطع التاني ملوش vowel خالص. الـ nucleus بتاعه consonant، الـ n نفسها (syllabic n)."},
 madrasa:{w:"mad · ra · sa",ar:["مَدْ","رَ","سَة"],s:[["m","a","d"],["r","a",""],["s","a",""]],m:"3 syllables. الأولى فيها coda (الدال الساكنة)، والباقي onset + nucleus بس."}
};
function s2syl(k){
  const d=SYL[k],rtl=!!d.ar;
  $("#s2syl").innerHTML=`<div class="sylrow" style="direction:${rtl?"rtl":"ltr"}">${d.s.map((p,i)=>`<div class="syl">${rtl?`<div class="sylar">${d.ar[i]}</div>`:""}
    <div class="parts" dir="ltr">${p[0]?`<span class="on">${p[0]}</span>`:""}<span class="rime"><span class="nu">${p[1]}</span>${p[2]?`<span class="co">${p[2]}</span>`:""}<i class="rimebar">rime</i></span></div></div>`).join("")}</div>`;
  $("#s2sylMsg").textContent=d.m;isolate($("#s2sylMsg"));
}
seg("#s2w","w",s2syl);s2syl("banana");

/* scene 2: sound sorter */
const SND=[["a","vowel","voiced","—","البُق مفتوح خالص، ومفيش عائق."],["i","vowel","voiced","—","اللسان عالي ولقدّام."],["u","vowel","voiced","—","اللسان لورا، والشفايف مدوّرة."],
 ["b","consonant","voiced","plosive","الشفايف بتقفل وتفتح فجأة، والـ vocal folds شغالة."],["p","consonant","voiceless","plosive","نفس قفلة الـ b بالظبط، بس من غير اهتزاز."],
 ["s","consonant","voiceless","fricative","الهوا بيعدّي من فتحة ضيقة، فيطلع noise."],["z","consonant","voiced","fricative","نفس الـ s بس مع اهتزاز، يعني المصدرين مع بعض."],
 ["f","consonant","voiceless","fricative","السنان على الشفة اللي تحت."],["n","consonant","voiced","nasal","البُق مقفول، والهوا بيطلع من المناخير."],["m","consonant","voiced","nasal","الشفايف مقفولة، والهوا من المناخير."]];
$("#s2snd").innerHTML=SND.map((s,i)=>`<button type="button" data-i="${i}" aria-pressed="${i===0}"><span class="ltr">/${s[0]}/</span></button>`).join("");
function s2snd(i){const s=SND[i];$("#s2sndOut").innerHTML=`<div class="row"><b style="font-size:1.4rem" class="ltr">/${s[0]}/</b><span class="tag ${s[1]==="vowel"?"tA":"tS"}">${s[1]}</span><span class="tag ${s[2]==="voiced"?"tR":"tN"}">${s[2]}</span>${s[3]!=="—"?`<span class="tag tE">${s[3]}</span>`:""}</div><p class="small" style="margin-top:4px">${s[4]}</p>`;isolate($("#s2sndOut"))}
seg("#s2snd","i",i=>s2snd(+i));s2snd(0);

/* scene 3: sine */
function s2sine(){
  const A=+$("#s2A").value,f=+$("#s2f").value,T=1000/f;
  $("#s2AO").textContent=A.toFixed(2);$("#s2fO").textContent=f+" Hz";
  const pts=[];for(let i=0;i<=600;i++){const t=i/600*10;pts.push([t,A*Math.sin(TAU*f*t/1000)])}
  $("#s2sine").innerHTML=plot({w:520,h:240,m:[36,10,16,30],x:[0,10],y:[-1.1,1.1],yt:[-1,0,1],xt:[0,2,4,6,8,10],xl:"t (ms)",label:"sine wave",body:(sx,sy)=>{
    const p1=T/4,p2=p1+T;let s=`<path d="${path(pts,sx,sy)}" style="fill:none;stroke:var(--s);stroke-width:2"/>`;
    if(p2<=10)s+=`<line x1="${sx(p1)}" x2="${sx(p2)}" y1="${sy(A)-10}" y2="${sy(A)-10}" style="stroke:var(--a);stroke-width:2"/><line x1="${sx(p1)}" x2="${sx(p1)}" y1="${sy(A)-15}" y2="${sy(A)-5}" style="stroke:var(--a);stroke-width:2"/><line x1="${sx(p2)}" x2="${sx(p2)}" y1="${sy(A)-15}" y2="${sy(A)-5}" style="stroke:var(--a);stroke-width:2"/><text x="${(sx(p1)+sx(p2))/2}" y="${sy(A)-14}" text-anchor="middle" class="lb" style="fill:var(--a);font-weight:600">T</text>`;
    s+=`<line x1="${sx(0.15)}" x2="${sx(0.15)}" y1="${sy(0)}" y2="${sy(A)}" style="stroke:var(--g);stroke-width:2"/><text x="${sx(0.15)+5}" y="${(sy(0)+sy(A))/2}" class="lb" style="fill:var(--g);font-weight:600">A</text>`;return s}});
  $("#s2sineR").innerHTML=`<span class="box">f <b>${f} Hz</b></span><span class="box">T = 1/f <b>${T.toFixed(2)} ms</b></span><span class="box">في 10 ms <b>${(10/T).toFixed(1)}</b> cycle</span>`;isolate($("#s2sineR"));
}
["s2A","s2f"].forEach(id=>$("#"+id).addEventListener("input",s2sine));s2sine();

/* scene 4: voiced vs voiceless */
const FSv=16000;
function voicedWave(f0,forms,ms){const N=Math.round(ms/1000*FSv),x=new Float64Array(N);for(let i=0;i<N;i++){const t=i/FSv;let v=0;for(let k=1;k*f0<4000;k++){let a=0;for(const[F,B]of forms)a+=1/(1+((k*f0-F)/B)**2);v+=a*Math.sin(TAU*k*f0*t)/Math.sqrt(k)}x[i]=v}let m=0;x.forEach(v=>m=Math.max(m,Math.abs(v)));return Array.from(x,v=>v/m)}
const VW={tone:Array.from({length:480},(_,i)=>Math.sin(TAU*200*i/FSv)),voiced:voicedWave(120,[[730,90],[1090,110],[2440,170]],30),noise:(()=>{const r=rng(11);let p=0;return Array.from({length:480},()=>{const w=gauss(r),v=(w-p)*.45;p=w;return v})})()};
const VWM={tone:"pure tone عند 200 Hz: sine واحدة بتكرر نفسها بالظبط. ده مش كلام بني آدم.",voiced:"Voiced (vowel): شكله ملخبط، بس مش random. بيكرر نفسه كل T ≈ 8.3 ms (يعني F0 = 120 Hz). الخطوط المتقطعة بتعلّم كل period. ده مجموع harmonics عند مضاعفات الـ F0.",noise:"Voiceless (/s/): noise بجد. مفيش period ومفيش F0 خالص."};
function s2vv(k){const x=VW[k];
  $("#s2vvPlot").innerHTML=plot({w:900,h:180,m:[36,10,12,28],x:[0,30],y:[-1.15,1.15],yt:[-1,0,1],xt:[0,5,10,15,20,25,30],xl:"t (ms)",label:"waveform",body:(sx,sy)=>{
    let s="";if(k==="voiced")for(let t=0;t<=30;t+=1000/120)s+=`<line x1="${sx(t)}" x2="${sx(t)}" y1="${sy(1.1)}" y2="${sy(-1.1)}" style="stroke:var(--a);stroke-dasharray:3 4"/>`;
    return s+`<path d="${path(x.map((v,i)=>[i/FSv*1000,v]),sx,sy)}" style="fill:none;stroke:${k==="noise"?"var(--neg)":"var(--s)"};stroke-width:1.4"/>`}});
  $("#s2vvMsg").textContent=VWM[k];isolate($("#s2vvMsg"))}
seg("#s2vv","k",s2vv);s2vv("voiced");

/* scene 5: sampling + aliasing */
function s2samp(){
  const fs=+$("#s2fs").value,f=+$("#s2sf").value,ny=fs/2,k=Math.round(f/fs),fa=f-k*fs,alias=f>ny+1e-9,edge=Math.abs(f-ny)<1e-9;
  $("#s2fsO").textContent=fs+" Hz";$("#s2sfO").textContent=f+" Hz";
  const tr=[],rc=[],sm=[];for(let i=0;i<=800;i++){const t=i/800;tr.push([t,Math.sin(TAU*f*t)]);rc.push([t,Math.sin(TAU*fa*t)])}
  for(let n=0;n/fs<=1+1e-9;n++){const t=n/fs;sm.push([t,Math.sin(TAU*f*t)])}
  $("#s2samp").innerHTML=plot({w:900,h:230,m:[36,10,14,28],x:[0,1],y:[-1.2,1.2],yt:[-1,0,1],xt:[0,.2,.4,.6,.8,1],xf:v=>v+" s",label:"sampling",body:(sx,sy)=>
    `<path d="${path(tr,sx,sy)}" style="fill:none;stroke:var(--s);stroke-width:1.3;opacity:.55"/>`+
    `<path d="${path(rc,sx,sy)}" style="fill:none;stroke:${alias?"var(--neg)":"var(--r)"};stroke-width:2.2;stroke-dasharray:7 5"/>`+
    sm.map(p=>`<line x1="${sx(p[0])}" x2="${sx(p[0])}" y1="${sy(0)}" y2="${sy(p[1])}" style="stroke:var(--a);stroke-width:1"/><circle cx="${sx(p[0])}" cy="${sy(p[1])}" r="4.5" style="fill:var(--a)"/>`).join("")+
    `<text x="${sx(.995)}" y="18" text-anchor="end" class="lb"><tspan style="fill:var(--s)">— real ${f} Hz</tspan>   <tspan style="fill:var(--a)">● samples</tspan>   <tspan style="fill:${alias?"var(--neg)":"var(--r)"}">- - what the computer sees: ${Math.abs(fa)} Hz</tspan></text>`});
  $("#s2sampR").innerHTML=`<span class="box"><span class="ltr">Nyquist = f<sub>s</sub>/2</span> <b>${ny} Hz</b></span><span class="box">الموجة الحقيقية <b>${f} Hz</b></span><span class="box">اللي اتسجّل <b class="${alias?"cN":"cR"}">${Math.abs(fa)} Hz</b></span>`;
  $("#s2sampMsg").innerHTML=edge?`<span class="pill mid">بالظبط عند النص</span> الـ samples ممكن تيجي كلها على الصفر، فالموجة تختفي. عشان كده الشرط <b>أكبر من</b> الضعف، مش بيساويه.`:
    alias?`<span class="pill off">aliasing</span> <span class="m">${f} &gt; ${ny}</span>، فالموجة بتطلع مزيفة عند <span class="m">|${f} − ${k} × ${fs}| = ${Math.abs(fa)} Hz</span>. الـ samples البرتقاني هي هي، والكمبيوتر ما يقدرش يفرّق.`:
    `<span class="pill on">تمام</span> <span class="m">${f} &lt; ${ny}</span>، فالـ samples كفاية، والموجة اللي بتتفهم هي نفسها الحقيقية.`;
  isolate($("#s2sampR"));isolate($("#s2sampMsg"));
}
["s2fs","s2sf"].forEach(id=>$("#"+id).addEventListener("input",s2samp));s2samp();

/* scene 6: quantization */
function s2q(){
  const b=+$("#s2bits").value,L=2**b,st=2/(L-1),q=v=>Math.round((v+1)/st)*st-1;
  $("#s2bitsO").textContent=b+" bit";
  const orig=[],qq=[];for(let i=0;i<=240;i++){const t=i/240,v=.95*Math.sin(TAU*t);orig.push([t,v]);qq.push([t,q(v)])}
  const stair=[];qq.forEach((p,i)=>{if(i)stair.push([p[0],qq[i-1][1]]);stair.push(p)});
  const lv=[];if(L<=32)for(let i=0;i<L;i++)lv.push(-1+i*st);
  $("#s2q").innerHTML=plot({w:900,h:220,m:[36,10,12,24],x:[0,1],y:[-1.15,1.15],yt:[],zero:false,label:"quantization",body:(sx,sy)=>
    lv.map(v=>`<line x1="${sx(0)}" x2="${sx(1)}" y1="${sy(v)}" y2="${sy(v)}" style="stroke:var(--line);stroke-dasharray:2 4"/>`).join("")+
    `<path d="${path(orig,sx,sy)}" style="fill:none;stroke:var(--s);stroke-width:1.5;opacity:.6"/><path d="${path(stair,sx,sy)}" style="fill:none;stroke:var(--a);stroke-width:2.4"/>`});
  $("#s2qR").innerHTML=`<span class="box">مستويات <span class="m">2<sup>${b}</sup></span> <b>${L}</b></span><span class="box">المسافة بين المستويات <b>${nf(st,3)}</b></span><span class="box">أقصى غلطة <b>${nf(st/2,3)}</b></span><span class="box">16-bit <b>65,536</b></span>`;isolate($("#s2qR"));
}
$("#s2bits").addEventListener("input",s2q);s2q();

/* scene 7: framing */
const FRX=(()=>{const r=rng(5),N=1920,x=[];for(let i=0;i<N;i++){const t=i/FSv,f0=110+40*t*8,amp=.4+.5*Math.sin(Math.PI*i/N);x.push(amp*(Math.sin(TAU*f0*t)+.5*Math.sin(TAU*2*f0*t+1)+.3*Math.sin(TAU*3*f0*t))/1.6+gauss(r)*.03)}return x})();
function s2fr(){
  const L=+$("#s2L").value,H=+$("#s2H").value;$("#s2LO").textContent=L+" ms";$("#s2HO").textContent=H+" ms";
  const lanes=Math.max(1,Math.ceil(L/H)),fr=[];for(let s=0;s+L<=120;s+=H)fr.push(s);
  $("#s2fr").innerHTML=plot({w:900,h:150+lanes*30,m:[36,10,10,26],x:[0,120],y:[-(lanes*1.15)-.2,1.1],yt:[],xt:[0,20,40,60,80,100,120],xl:"t (ms)",label:"framing",zero:false,body:(sx,sy)=>{
    let s=`<path d="${path(FRX.map((v,i)=>[i/16,v]),sx,sy)}" style="fill:none;stroke:var(--s);stroke-width:1.1"/>`;
    fr.forEach((st,i)=>{const lane=i%lanes,base=-1.15*(lane+1),col=i===0?"var(--a)":i===1?"var(--g)":"var(--muted)";const pts=[];for(let n=0;n<=40;n++){const u=n/40;pts.push([st+u*L,base+(.54-.46*Math.cos(TAU*u))*.95])}
      s+=`<path d="${path(pts,sx,sy)}" style="fill:${col};fill-opacity:${i<2?.22:.08};stroke:${col};stroke-width:${i<2?2:1}"/>`});
    if(fr.length>1&&L>H){s+=`<rect x="${sx(H)}" y="${sy(1.1)}" width="${sx(L)-sx(H)}" height="${sy(-1.1)-sy(1.1)}" style="fill:var(--a);opacity:.10"/><text x="${(sx(H)+sx(L))/2}" y="${sy(1.1)+12}" text-anchor="middle" class="tk">overlap</text>`}
    return s}});
  $("#s2frR").innerHTML=`<span class="box">overlap <b>${Math.max(0,L-H)} ms</b></span><span class="box">عند 16 kHz <b>${16*L}</b> sample/frame</span><span class="box">hop <b>${16*H}</b> sample</span><span class="box">frames في الثانية <b>${1+Math.floor((1000-L)/H)}</b></span>`;isolate($("#s2frR"));
}
["s2L","s2H"].forEach(id=>$("#"+id).addEventListener("input",s2fr));s2fr();

/* scene 8: amplitude → intensity */
function s2amp(){const v=+$("#s2amp").value,m=2**v,I=m*m,db=20*Math.log10(m);$("#s2ampO").textContent="×"+nf(m,2);
  $("#s2ampR").innerHTML=`<span class="box">A <b>×${nf(m,2)}</b></span><span class="box">Intensity <span class="m">∝ A²</span> <b>×${nf(I,2)}</b></span><span class="box">بالـ dB <b>${db>=0?"+":""}${nf(db,1)} dB</b></span>`;isolate($("#s2ampR"))}
$("#s2amp").addEventListener("input",s2amp);s2amp();

/* scene 9: pitch contour */
function s2pc(k){
  const st=[],q=[];for(let i=0;i<=100;i++){const t=i/100;st.push([t,140-35*t]);q.push([t,120+55*t*t])}
  const cut=a=>[a.filter(p=>p[0]<=.30),a.filter(p=>p[0]>=.42)];
  $("#s2pcPlot").innerHTML=plot({w:900,h:240,m:[44,10,14,30],x:[0,1],y:[95,185],yt:[100,125,150,175],xt:[0,.2,.4,.6,.8,1],xl:"time (normalized)",yl:"F0 (Hz)",zero:false,label:"pitch contour",body:(sx,sy)=>{
    let s=`<rect x="${sx(.30)}" y="${sy(185)}" width="${sx(.42)-sx(.30)}" height="${sy(95)-sy(185)}" style="fill:var(--muted);opacity:.15"/><text x="${sx(.36)}" y="${sy(180)}" text-anchor="middle" class="tk">/k/ voiceless</text><text x="${sx(.36)}" y="${sy(173)}" text-anchor="middle" class="tk">no F0</text>`;
    if(k!=="q")cut(st).forEach(a=>s+=`<path d="${path(a,sx,sy)}" style="fill:none;stroke:var(--s);stroke-width:3"/>`);
    if(k!=="st")cut(q).forEach(a=>s+=`<path d="${path(a,sx,sy)}" style="fill:none;stroke:var(--neg);stroke-width:3"/>`);
    if(k!=="q")s+=`<text x="${sx(.02)}" y="${sy(100)}" class="lb" style="fill:var(--s)">"You're coming."  statement, falling</text>`;
    if(k!=="st")s+=`<text x="${sx(.98)}" y="${sy(178)}" text-anchor="end" class="lb" style="fill:var(--neg)">"You're coming?"  question, rising</text>`;
    return s}});
}
seg("#s2pc","k",s2pc);s2pc("both");

/* scene 10: source–filter */
const VOW={i:{n:"ee /i/",F:[270,2290,3010]},a:{n:"ah /ɑ/",F:[730,1090,2440]},u:{n:"oo /u/",F:[300,870,2240]}};
let curV="i";
const env=(f,F)=>{const B=[80,100,150];let a=0;F.forEach((Fi,i)=>a+=1/(1+((f-Fi)/B[i])**2));return a};
function s2sf(){
  const f0=+$("#s2f0").value,F=VOW[curV].F;$("#s2f0O").textContent=f0+" Hz";
  let mx=0;for(let f=0;f<=3500;f+=5)mx=Math.max(mx,env(f,F));
  const W=520,lane=(y0,title,col,body)=>`<text x="44" y="${y0+12}" class="lb" style="font-weight:600;fill:${col}">${title}</text>`+body(y0);
  const sx=f=>44+f/3500*(W-54),H=356;let s=`<svg viewBox="0 0 ${W} ${H}" class="plot" direction="ltr" role="img" aria-label="source filter model">`;
  const yb=[100,215,330],hh=62;
  const har=[];for(let k=1;k*f0<=3500;k++)har.push([k*f0,1/Math.pow(k,.75)]);
  s+=lane(8,"Source: harmonics at k·F0","var(--s)",()=>har.map(([f,a])=>`<line x1="${sx(f)}" x2="${sx(f)}" y1="${yb[0]}" y2="${yb[0]-a*hh}" style="stroke:var(--s);stroke-width:2"/>`).join(""));
  const ep=[];for(let f=0;f<=3500;f+=10)ep.push(`${sx(f).toFixed(1)},${(yb[1]-env(f,F)/mx*hh).toFixed(1)}`);
  s+=lane(123,"× Filter: vocal-tract envelope (formants)","var(--a)",()=>`<polyline points="${ep.join(" ")}" style="fill:none;stroke:var(--a);stroke-width:2.2"/>`+F.slice(0,2).map((Fi,i)=>`<text x="${sx(Fi)}" y="${yb[1]-hh-4}" text-anchor="middle" class="tk" style="fill:var(--a)">F${i+1}</text>`).join(""));
  const outs=har.map(([f,a])=>[f,a*env(f,F)/mx]);const om=Math.max(...outs.map(o=>o[1]));
  s+=lane(238,"= Output spectrum (harmonics × envelope)","var(--r)",()=>`<polyline points="${ep.map(p=>{const[x,y]=p.split(",");return x+","+(+y+(yb[2]-yb[1])).toFixed(1)}).join(" ")}" style="fill:none;stroke:var(--a);stroke-width:1.2;stroke-dasharray:4 4;opacity:.8"/>`+outs.map(([f,a])=>`<line x1="${sx(f)}" x2="${sx(f)}" y1="${yb[2]}" y2="${(yb[2]-a/om*hh).toFixed(1)}" style="stroke:var(--r);stroke-width:2"/>`).join(""));
  yb.forEach(y=>s+=`<line x1="44" x2="${W-10}" y1="${y}" y2="${y}" class="ax"/>`);
  [0,1000,2000,3000].forEach(f=>s+=`<text x="${sx(f)}" y="${H-8}" text-anchor="middle" class="tk">${f}</text>`);s+=`<text x="${W-10}" y="${H-8}" text-anchor="end" class="tk">Hz</text></svg>`;
  $("#s2sf3").innerHTML=s;
  $("#s2sfR").innerHTML=`<span class="box">F0 <b>${f0} Hz</b></span><span class="box">F1 <b>${F[0]} Hz</b></span><span class="box">F2 <b>${F[1]} Hz</b></span>`;isolate($("#s2sfR"));
}
$("#s2f0").addEventListener("input",s2sf);seg("#s2vow","v",v=>{curV=v;s2sf()});s2sf();

/* scene 11: vowel space */
const VS=[["i","beet",270,2290,"عالي","لقدّام","مش مدوّرة","زي الياء الطويلة في «فيل»"],["ɪ","bit",390,1990,"عالي شوية","لقدّام","مش مدوّرة",""],["ɛ","bet",530,1840,"في النص","لقدّام","مش مدوّرة",""],["æ","bat",660,1720,"واطي","لقدّام","مش مدوّرة",""],
 ["ɑ","father",730,1090,"واطي خالص","لورا","مش مدوّرة","قريبة من الألف الطويلة في «باب»"],["ɔ","bought",570,840,"في النص","لورا","مدوّرة",""],["ʊ","book",440,1020,"عالي شوية","لورا","مدوّرة",""],["u","boot",300,870,"عالي","لورا","مدوّرة","زي الواو الطويلة في «فول»"]];
let vsSel=0;
function s2vs(){
  $("#s2vs").innerHTML=plot({w:520,h:330,m:[48,14,20,34],x:[2500,700],y:[820,220],xt:[2400,2000,1600,1200,800],yt:[300,400,500,600,700,800],xl:"← F2 (Hz): front … back →",zero:false,label:"vowel space",body:(sx,sy)=>
    `<text transform="translate(12 ${sy(520)}) rotate(-90)" text-anchor="middle" class="tk">F1 (Hz) ↓</text><text x="${sx(2450)}" y="${sy(240)}" class="tk">high · front</text><text x="${sx(760)}" y="${sy(240)}" text-anchor="end" class="tk">high · back</text><text x="${sx(1600)}" y="${sy(805)}" text-anchor="middle" class="tk">low</text>`+
    VS.map((v,i)=>`<g data-vi="${i}" style="cursor:pointer"><circle cx="${sx(v[3])}" cy="${sy(v[2])}" r="${i===vsSel?15:12}" style="fill:${i===vsSel?"var(--a)":"var(--surface)"};stroke:var(--a);stroke-width:2"/><text x="${sx(v[3])}" y="${sy(v[2])+5}" text-anchor="middle" style="font:600 14px var(--f-math);fill:${i===vsSel?"var(--surface)":"var(--ink)"}">${v[0]}</text><text x="${sx(v[3])}" y="${sy(v[2])+28}" text-anchor="middle" class="tk">${v[1]}</text></g>`).join("")});
  const v=VS[vsSel];
  $("#s2vsOut").innerHTML=`<h4><span class="ltr">/${v[0]}/ as in "${v[1]}"</span></h4><div class="readout"><span class="box">F1 <b>${v[2]} Hz</b></span><span class="box">F2 <b>${v[3]} Hz</b></span></div>
    <ul class="clean small" style="margin-top:8px"><li>اللسان: <b>${v[4]}</b>، علشان كده F1 = ${v[2]}.</li><li>المكان: <b>${v[5]}</b>، علشان كده F2 = ${v[3]}.</li><li>الشفايف: <b>${v[6]}</b>.</li>${v[7]?`<li>${v[7]}.</li>`:""}</ul><p class="hint">دوس على أي vowel في الخريطة.</p>`;
  isolate($("#s2vsOut"));
}
$("#s2vs").addEventListener("click",e=>{const g=e.target.closest("[data-vi]");if(g){vsSel=+g.dataset.vi;s2vs()}});s2vs();

makeQuiz("#s2quizSp","#s2quizSpS",["Vowel","Nasal","Burst","Silence"],[
 ["خطوط رأسية كتير ورا بعض، وفيها شرايط أفقية غامقة تحت.",0,"الخطوط الرأسية = اهتزازات الـ vocal folds، والشرايط = الـ formants."],
 ["voiced بس ضعيف، والطاقة كلها في شريط واطي قريب من 250 Hz.",1,"ده شكل الـ nasal: صوت من المناخير، وطاقة قليلة فوق."],
 ["خط رأسي رفيع، لحظة واحدة، من تحت لفوق.",2,"الـ burst بيحصل لحظة ما بنفتح قفلة الـ plosive."],
 ["مساحة فاضية مفيهاش طاقة.",3,"غالباً قفلة قبل plosive، مش فاصل بين كلمتين."]
]);
