/* ---------- tiny circuit drawing kit ---------- */
const INK="var(--ink)";
const wire=(pts,c=INK,w=2)=>`<polyline points="${pts.map(p=>p[0]+","+p[1]).join(" ")}" style="fill:none;stroke:${c};stroke-width:${w};stroke-linejoin:round"/>`;
function resistor(x1,y1,x2,y2,c=INK){const dx=x2-x1,dy=y2-y1,L=Math.hypot(dx,dy),ux=dx/L,uy=dy/L,nx=-uy,ny=ux,body=Math.min(44,L-10),a=(L-body)/2;
  const pts=[[x1,y1],[x1+ux*a,y1+uy*a]];for(let i=1;i<=6;i++){const t=a+body*(i-.5)/6,s=i%2?7:-7;pts.push([+(x1+ux*t+nx*s).toFixed(1),+(y1+uy*t+ny*s).toFixed(1)])}pts.push([x1+ux*(L-a),y1+uy*(L-a)],[x2,y2]);return wire(pts,c)}
function diode(x,y,ang,st){const c=st==="on"?"var(--r)":st==="off"?"var(--neg)":INK;
  return `<g transform="translate(${x} ${y}) rotate(${ang})"><line x1="-22" x2="-10" y1="0" y2="0" style="stroke:${c};stroke-width:2"/><line x1="10" x2="22" y1="0" y2="0" style="stroke:${c};stroke-width:2"/><path d="M-10 -10L-10 10L10 0Z" style="fill:${st==="on"?c:"var(--surface)"};stroke:${c};stroke-width:2"/><line x1="10" x2="10" y1="-11" y2="11" style="stroke:${c};stroke-width:2.6"/></g>`}
function battery(x,y,flip){const s=flip?-1:1;return `<g transform="translate(${x} ${y}) scale(1 ${s})"><line x1="0" x2="0" y1="-26" y2="-5" style="stroke:${INK};stroke-width:2"/><line x1="-15" x2="15" y1="-5" y2="-5" style="stroke:${INK};stroke-width:2.5"/><line x1="-8" x2="8" y1="3" y2="3" style="stroke:${INK};stroke-width:5"/><line x1="0" x2="0" y1="3" y2="26" style="stroke:${INK};stroke-width:2"/></g><text x="${x+18}" y="${y-8*s+4}" class="tk" style="font-size:13px">+</text>`}
const gnd=(x,y)=>`<g transform="translate(${x} ${y})"><line x1="0" x2="0" y1="0" y2="8" style="stroke:${INK};stroke-width:2"/><line x1="-12" x2="12" y1="8" y2="8" style="stroke:${INK};stroke-width:2"/><line x1="-7" x2="7" y1="12" y2="12" style="stroke:${INK};stroke-width:2"/><line x1="-3" x2="3" y1="16" y2="16" style="stroke:${INK};stroke-width:2"/></g>`;
const dot=(x,y)=>`<circle cx="${x}" cy="${y}" r="3.5" style="fill:${INK}"/>`,term=(x,y)=>`<circle cx="${x}" cy="${y}" r="4.5" style="fill:var(--surface);stroke:${INK};stroke-width:2"/>`;
const TX=(x,y,t,o={})=>`<text x="${x}" y="${y}" text-anchor="${o.a||"middle"}" class="${o.c||"lb"}" style="${o.s||""}">${t}</text>`;
const SVG=(w,h,body,lab)=>`<svg viewBox="0 0 ${w} ${h}" class="plot" direction="ltr" role="img" aria-label="${lab||"circuit"}"><defs><marker id="c2ar" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0 0L10 5L0 10z" style="fill:var(--r)"/></marker></defs>${body}</svg>`;
const curArrow=(x1,y1,x2,y2,lab)=>`<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" style="stroke:var(--r);stroke-width:2.2;marker-end:url(#c2ar)"/>`+(lab?TX((x1+x2)/2,Math.min(y1,y2)-6,lab,{s:"fill:var(--r);font-weight:600"}):"");
function amp(I){const a=Math.abs(I);if(a===0)return "0 A";const u=[[1,"A"],[1e-3,"mA"],[1e-6,"µA"],[1e-9,"nA"],[1e-12,"pA"],[1e-15,"fA"]];for(const[k,n]of u)if(a>=k*.9995)return nf(I/k,a/k>=100?1:2)+" "+n;return nf(I/1e-15,3)+" fA"}

/* scene 1: energy bands */
function c2bands(){
  const Eg=+$("#c2Eg").value;$("#c2EgO").textContent=nf(Eg,2)+" eV";
  const cls=Eg<=.05?["Conductor","var(--r)","الـ bands لازقة في بعض أو متداخلة، فالـ electrons بتلاقي مكان فاضي على طول. بيوصّل كويس جداً."]:Eg<3?["Semiconductor","var(--a)","الـ gap صغير: شوية حرارة أو نور بيخلّوا electrons تنط، فبيوصّل شوية. والتوصيل ده نقدر نتحكم فيه."]:["Insulator","var(--neg)","الـ gap كبير جداً: تقريباً ولا electron بيوصل للـ conduction band، فمبيوصّلش."];
  const W=520,H=270,gp=Math.min(150,Eg*30),vbT=200,cbB=vbT-gp-(Eg<=.05?-14:0),r=rng(4);
  let s=`<rect x="70" y="${vbT}" width="230" height="46" rx="6" style="fill:color-mix(in srgb,var(--s) 22%,var(--surface));stroke:var(--s)"/>`+TX(185,vbT+64,"Valence band",{c:"tk"});
  s+=`<rect x="70" y="${cbB-46}" width="230" height="46" rx="6" style="fill:color-mix(in srgb,var(--r) 18%,var(--surface));stroke:var(--r)"/>`+TX(185,cbB-52,"Conduction band",{c:"tk"});
  for(let i=0;i<16;i++)s+=`<circle cx="${84+(i%8)*28}" cy="${vbT+14+Math.floor(i/8)*18}" r="5" style="fill:var(--s)"/>`;
  const nCB=Eg<=.05?10:Math.max(0,Math.round(7*Math.exp(-Eg*1.6)));
  for(let i=0;i<nCB;i++)s+=`<circle cx="${84+r()*200}" cy="${cbB-34+r()*24}" r="5" style="fill:var(--s)"/>`;
  if(Eg>.05)s+=`<line x1="330" x2="330" y1="${cbB}" y2="${vbT}" style="stroke:var(--a);stroke-width:2"/><line x1="322" x2="338" y1="${cbB}" y2="${cbB}" style="stroke:var(--a);stroke-width:2"/><line x1="322" x2="338" y1="${vbT}" y2="${vbT}" style="stroke:var(--a);stroke-width:2"/>`+TX(344,(cbB+vbT)/2+4,"Eg = "+nf(Eg,2)+" eV",{a:"start",s:"fill:var(--a);font-weight:600"});
  s+=TX(185,22,cls[0],{s:`fill:${cls[1]};font-weight:700;font-size:16px`});
  $("#c2bands").innerHTML=SVG(W,H,s,"energy band diagram");
  const lam=Eg>.05?1240/Eg:Infinity,reg=lam>700?"infrared":lam>=400?"visible":"ultraviolet";
  $("#c2EgR").innerHTML=`<span class="box">النوع <b style="color:${cls[1]}">${cls[0]}</b></span>`+(Eg>.05?`<span class="box"><span class="m">λ = hc / E<sub>g</sub></span> <b>${nfc(lam)} nm</b></span><span class="box">الضوء <b>${reg}</b></span>`:"");
  $("#c2EgMsg").textContent=cls[2];isolate($("#c2EgR"));isolate($("#c2EgMsg"));
}
$("#c2Eg").addEventListener("input",c2bands);c2bands();

/* scene 2: Si atom */
(function(){
  let s=`<circle cx="160" cy="130" r="26" style="fill:var(--ink)"/>`+TX(160,136,"Si",{s:"fill:var(--surface);font-weight:700;font-size:16px"});
  [[50,2],[80,8],[110,4]].forEach(([R,n],k)=>{s+=`<circle cx="160" cy="130" r="${R}" style="fill:none;stroke:var(--line);stroke-width:1.5"/>`;for(let i=0;i<n;i++){const a=TAU*i/n-Math.PI/2+k*.3;s+=`<circle cx="${(160+R*Math.cos(a)).toFixed(1)}" cy="${(130+R*Math.sin(a)).toFixed(1)}" r="6" style="fill:${k===2?"var(--a)":"var(--s)"}"/>`}});
  s+=TX(160,258,"2 · 8 · 4   (4 valence electrons in orange)",{c:"tk"});
  $("#c2bohr").innerHTML=SVG(320,268,s,"Bohr model of silicon");
  const rows=[["3p",["↑","↑",""]],["3s",["↑↓"]],["2p",["↑↓","↑↓","↑↓"]],["2s",["↑↓"]],["1s",["↑↓"]]];
  let o="";rows.forEach(([n,b],i)=>{const y=34+i*44;o+=TX(40,y+6,n,{s:"font-weight:600;font-size:15px"});b.forEach((t,j)=>{const x=78+j*58;o+=`<line x1="${x}" x2="${x+44}" y1="${y+12}" y2="${y+12}" style="stroke:${i<2?"var(--a)":"var(--s)"};stroke-width:2"/>`+TX(x+22,y+6,t,{s:`font-size:17px;font-weight:700;fill:${i<2?"var(--a)":"var(--s)"}`})})});
  o+=TX(270,40,"needs 4 more",{a:"start",c:"tk",s:"fill:var(--a)"});
  $("#c2orb").innerHTML=SVG(360,250,o,"electron configuration of silicon");
})();

/* scene 3: doping lattice + levels */
let dop="pure",ion=false;
function c2dop(){
  const W=380,H=330,g=110,x0=80,y0=60;let s="";
  const cen=dop==="pure"?"+4":dop==="n"?"+5":"+3",cc=dop==="pure"?"var(--sunk)":dop==="n"?"color-mix(in srgb,var(--s) 35%,var(--surface))":"color-mix(in srgb,var(--neg) 30%,var(--surface))";
  for(let r=0;r<3;r++)for(let c=0;c<3;c++){const x=x0+c*g,y=y0+r*g;
    if(c<2){const hole=dop==="p"&&r===1&&c===1;s+=`<line x1="${x+22}" x2="${x+g-22}" y1="${y}" y2="${y}" style="stroke:var(--line);stroke-width:2"/><circle cx="${x+g/2-7}" cy="${y}" r="5" style="fill:var(--s)"/>`+(hole?`<circle cx="${x+g/2+7}" cy="${y}" r="6" style="fill:var(--surface);stroke:var(--neg);stroke-width:2.5"/>`:`<circle cx="${x+g/2+7}" cy="${y}" r="5" style="fill:var(--s)"/>`)}
    if(r<2)s+=`<line x1="${x}" x2="${x}" y1="${y+22}" y2="${y+g-22}" style="stroke:var(--line);stroke-width:2"/><circle cx="${x}" cy="${y+g/2-7}" r="5" style="fill:var(--s)"/><circle cx="${x}" cy="${y+g/2+7}" r="5" style="fill:var(--s)"/>`;}
  for(let r=0;r<3;r++)for(let c=0;c<3;c++){const x=x0+c*g,y=y0+r*g,mid=r===1&&c===1;s+=`<circle cx="${x}" cy="${y}" r="22" style="fill:${mid?cc:"var(--sunk)"};stroke:${mid&&dop!=="pure"?"var(--ink)":"var(--line)"};stroke-width:2"/>`+TX(x,y+5,mid?(dop==="n"?"P":dop==="p"?"B":"Si"):"Si",{s:"font-weight:700"})+TX(x,y+38,mid?cen:"+4",{c:"tk"})}
  if(dop==="n"){const fx=x0+g+38,fy=y0+g-40;s+=`<circle cx="${fx}" cy="${fy}" r="7" style="fill:var(--s);stroke:var(--surface);stroke-width:2"/>`+TX(fx+12,fy-10,"free electron",{a:"start",s:"fill:var(--s);font-weight:600"})}
  if(dop==="p")s+=TX(x0+g*1.5+7,y0+g+26,"hole",{s:"fill:var(--neg);font-weight:600"});
  $("#c2lat").innerHTML=SVG(W,H,s,"silicon crystal lattice");
  /* levels */
  const LW=320,LH=210;let l=`<rect x="20" y="20" width="200" height="34" rx="5" style="fill:color-mix(in srgb,var(--r) 16%,var(--surface));stroke:var(--r)"/>`+TX(120,42,"Conduction band",{c:"tk"})+`<rect x="20" y="156" width="200" height="34" rx="5" style="fill:color-mix(in srgb,var(--s) 18%,var(--surface));stroke:var(--s)"/>`+TX(120,178,"Valence band",{c:"tk"});
  if(dop==="n"){l+=`<line x1="20" x2="220" y1="74" y2="74" style="stroke:var(--s);stroke-dasharray:6 4;stroke-width:2"/>`+TX(228,78,"E_D (donor)",{a:"start",c:"tk"});for(let i=0;i<6;i++){const x=40+i*32;l+=ion?`<circle cx="${x}" cy="74" r="5" style="fill:var(--surface);stroke:var(--s);stroke-width:1.5"/><circle cx="${x}" cy="37" r="5" style="fill:var(--s)"/>`:`<circle cx="${x}" cy="74" r="5" style="fill:var(--s)"/>`}}
  if(dop==="p"){l+=`<line x1="20" x2="220" y1="136" y2="136" style="stroke:var(--neg);stroke-dasharray:6 4;stroke-width:2"/>`+TX(228,140,"E_A (acceptor)",{a:"start",c:"tk"});for(let i=0;i<6;i++){const x=40+i*32;l+=ion?`<circle cx="${x}" cy="136" r="5" style="fill:var(--s)"/><circle cx="${x}" cy="173" r="5" style="fill:var(--surface);stroke:var(--neg);stroke-width:2"/>`:`<circle cx="${x}" cy="136" r="5" style="fill:var(--surface);stroke:var(--neg);stroke-width:1.5"/>`}}
  if(dop==="pure")l+=TX(120,110,"no extra levels",{c:"tk"});
  $("#c2lev").innerHTML=SVG(LW,LH,l,"energy levels");
  $("#c2ion").hidden=dop==="pure";$("#c2ion").textContent=ion?"رجّع قبل الـ ionization":"اعمل ionization (حرارة الأوضة)";
  $("#c2dopMsg").textContent=dop==="pure"?"silicon نضيف: كل الـ electrons مربوطة في bonds، ومفيش carriers زيادة.":dop==="n"?(ion?"بعد الـ ionization: الـ electron الخامس اتنقل من E_D للـ conduction band، وبقى حر يوصّل. ده n-type: الـ majority carriers هي الـ electrons.":"الفوسفور فيه 5 valence electrons: 4 عملوا bonds، والخامس قاعد في مستوى E_D تحت الـ conduction band على طول. محتاج طاقة صغيرة جداً عشان ينط."):(ion?"بعد الـ ionization: electron من الـ valence band طلع ملا الـ acceptor، وساب hole في الـ valence band. ده p-type: الـ majority carriers هي الـ holes.":"البورون فيه 3 بس: bond ناقصة electron، يعني hole. ومستوى E_A فوق الـ valence band على طول، مستني electron.");
  isolate($("#c2dopMsg"));
}
seg("#c2dop","d",d=>{dop=d;ion=false;c2dop()});$("#c2ion").addEventListener("click",()=>{ion=!ion;c2dop()});c2dop();

/* scene 4: p-n junction */
let pnJoined=false;
function c2pn(){
  const W=900,H=200,mid=450,dw=pnJoined?110:0,r=rng(21);let s="";
  s+=`<rect x="60" y="30" width="${mid-60}" height="130" style="fill:color-mix(in srgb,var(--muted) 18%,var(--surface));stroke:var(--line)"/><rect x="${mid}" y="30" width="${W-60-mid}" height="130" style="fill:color-mix(in srgb,var(--s) 14%,var(--surface));stroke:var(--line)"/>`;
  if(pnJoined)s+=`<rect x="${mid-dw/2}" y="30" width="${dw}" height="130" style="fill:var(--surface);stroke:var(--a);stroke-dasharray:5 4"/>`+TX(mid,22,"depletion region",{s:"fill:var(--a);font-weight:600"});
  for(let i=0;i<70;i++){const p=i<35,x=p?75+r()*(mid-90):mid+15+r()*(W-90-mid),y=45+r()*100,inDep=pnJoined&&Math.abs(x-mid)<dw/2;
    s+=`<text x="${x.toFixed(0)}" y="${(y+5).toFixed(0)}" text-anchor="middle" style="font:700 15px var(--f-mono);fill:${p?"var(--neg)":"var(--s)"}">${p?"⊖":"⊕"}</text>`;
    if(!inDep){const cx=x+(p?10:-10),cy=y-8;s+=p?`<circle cx="${cx.toFixed(0)}" cy="${cy.toFixed(0)}" r="5" style="fill:var(--surface);stroke:var(--neg);stroke-width:1.6"/>`:`<circle cx="${cx.toFixed(0)}" cy="${cy.toFixed(0)}" r="5" style="fill:var(--s)"/>`}}
  s+=TX(200,185,"p-type: holes ○ + fixed acceptor ions ⊖",{c:"tk"})+TX(700,185,"n-type: electrons ● + fixed donor ions ⊕",{c:"tk"});
  if(pnJoined)s+=`<line x1="${mid+70}" x2="${mid-60}" y1="16" y2="16" style="stroke:var(--s);stroke-width:2;marker-end:url(#c2ar)"/>`+TX(mid+130,20,"electrons cross",{c:"tk",s:"fill:var(--s)"});
  $("#c2pnViz").innerHTML=SVG(W,H,s,"p-n junction");
}
$("#c2pn").addEventListener("click",()=>{pnJoined=true;c2pn()});$("#c2pn0").addEventListener("click",()=>{pnJoined=false;c2pn()});c2pn();

/* scene 5: bias */
const IS=1e-14,VT27=1.38e-23*300/1.6e-19;
function c2bias(){
  const V=+$("#c2VD").value;$("#c2VDO").textContent=(V>0?"+":"")+nf(V,2)+" V";
  const W=900,H=230,mid=450,dw=V<0?Math.min(260,60+14*-V):Math.max(6,60*(1-V/.72));let s="";
  s+=`<rect x="150" y="30" width="${mid-150}" height="90" style="fill:color-mix(in srgb,var(--muted) 18%,var(--surface));stroke:var(--line)"/><rect x="${mid}" y="30" width="300" height="90" style="fill:color-mix(in srgb,var(--s) 14%,var(--surface));stroke:var(--line)"/>`;
  s+=`<rect x="${mid-dw/2}" y="30" width="${dw}" height="90" style="fill:var(--surface);stroke:var(--a);stroke-dasharray:5 4"/>`+TX(300,140,"p (anode)",{c:"tk"})+TX(600,140,"n (cathode)",{c:"tk"});
  const r=rng(8);for(let i=0;i<26;i++){const p=i<13,x=p?160+r()*(mid-dw/2-175):mid+dw/2+12+r()*(300-dw/2-25),y=42+r()*66;if(x<155||x>745)continue;s+=p?`<circle cx="${x.toFixed(0)}" cy="${y.toFixed(0)}" r="5" style="fill:var(--surface);stroke:var(--neg);stroke-width:1.6"/>`:`<circle cx="${x.toFixed(0)}" cy="${y.toFixed(0)}" r="5" style="fill:var(--s)"/>`}
  s+=wire([[150,75],[110,75],[110,190],[424,190]])+wire([[476,190],[790,190],[790,75],[750,75]]);
  if(V!==0)s+=`<g transform="translate(450 190) rotate(90)">${battery(0,0,V>0).replace(/<text[^>]*>\+<\/text>/,"")}</g>`+TX(V>0?415:485,178,"+",{s:"font-weight:700;font-size:16px"})+TX(450,222,V>0?"+ on the p side (forward)":"+ on the n side (reverse)",{c:"tk"});else s+=wire([[424,190],[476,190]]);
  const I=V===0?0:IS*(Math.exp(V/VT27)-1);
  if(V>0.55)s+=curArrow(250,165,350,165,"I_D")+curArrow(550,165,650,165,"");
  $("#c2bias").innerHTML=SVG(W,H,s,"biased p-n junction");
  const st=V===0?["No bias","var(--muted)"]:V<0?["Reverse bias","var(--neg)"]:V<.6?["Forward، لسه قبل الـ knee","var(--a)"]:["Forward bias: بيوصّل","var(--r)"];
  $("#c2biasR").innerHTML=`<span class="box">الحالة <b style="color:${st[1]}">${st[0]}</b></span><span class="box">الـ depletion <b>${V<0?"أوسع":V>0?"أضيق":"صغيرة"}</b></span><span class="box"><span class="m">I<sub>D</sub></span> <b>${V>.78?"كبير جداً، الدايرة هي اللي بتحدده":amp(I)}</b></span>`;
  isolate($("#c2biasR"));
}
$("#c2VD").addEventListener("input",c2bias);c2bias();

/* scene 6: diode equation */
function c2iv(){
  const Tc=+$("#c2T").value,n=+$("#c2n").value,Is=10**(+$("#c2Is").value),Vq=+$("#c2Vq").value,TK=273+Tc,VT=1.38e-23*TK/1.6e-19;
  $("#c2TO").textContent=Tc+" °C";$("#c2nO").textContent=n.toFixed(1);$("#c2IsO").innerHTML=`10<sup>${$("#c2Is").value}</sup> A`;$("#c2VqO").textContent=nf(Vq,2)+" V";
  const f=V=>Is*(Math.exp(V/(n*VT))-1)*1000,pts=[];for(let V=-1;V<=.85;V+=.002){const i=f(V);if(i>22)break;pts.push([V,i])}
  const Iq=f(Vq);
  $("#c2iv").innerHTML=plot({w:520,h:280,m:[40,12,14,30],x:[-1,.85],y:[-2,20],yt:[0,5,10,15,20],xt:[-1,-.5,0,.3,.7],xf:v=>v+" V",yl:"I_D (mA)",label:"diode I-V curve",body:(sx,sy)=>
    `<line x1="${sx(0)}" x2="${sx(0)}" y1="${sy(-2)}" y2="${sy(20)}" class="ax"/><path d="${path(pts,sx,sy)}" style="fill:none;stroke:var(--s);stroke-width:2.6"/>`+(Iq<=20?`<circle cx="${sx(Vq)}" cy="${sy(Iq)}" r="6" style="fill:var(--a)"/>`:`<text x="${sx(Vq)}" y="${sy(19)}" text-anchor="middle" class="tk" style="fill:var(--a)">↑ off the chart</text>`)+
    TX(sx(-.55),sy(1.6),"reverse: I ≈ −Is",{c:"tk"})+TX(sx(.3),sy(1.6),"knee",{c:"tk"})});
  const ex=Vq/(n*VT);
  $("#c2ivSteps").innerHTML=`<li><span><span class="m">T = 273 + ${Tc} = ${TK} K</span></span></li><li><span><span class="m">V<sub>T</sub> = (1.38×10⁻²³ × ${TK}) / (1.6×10⁻¹⁹) = ${nf(VT*1000,2)} mV</span></span></li><li><span>الأُس: <span class="m">V<sub>D</sub> / nV<sub>T</sub> = ${nf(Vq,2)} / (${n.toFixed(1)} × ${nf(VT,5)}) = ${nf(ex,2)}</span></span></li><li><span><span class="m">I<sub>D</sub> = ${$("#c2Is").value==="-14"?"10⁻¹⁴":"I<sub>s</sub>"} × (e<sup>${nf(ex,2)}</sup> − 1) ≈ ${amp(Iq/1000)}</span></span></li>`;
}
["c2T","c2n","c2Is","c2Vq"].forEach(id=>$("#"+id).addEventListener("input",c2iv));c2iv();

/* scene 7: materials + temperature */
function c2mat(){
  const T=+$("#c2tmp").value,vk=.7-.0025*(T-25);$("#c2tmpO").textContent=T+" °C";
  const cur=(Vk,V)=>Math.exp((V-Vk)/.035),M=[["Ge",.3,"var(--g)"],["Si",.7,"var(--s)"],["GaAs",1.2,"var(--a)"]];
  const line=(Vk,dash,col,w)=>{const p=[];for(let V=0;V<=1.6;V+=.004){const i=cur(Vk,V);if(i>32)break;p.push([V,i])}return {p,dash,col,w}};
  const L=M.map(([n,k,c])=>line(k,"",c,2.4));if(T!==25)L.push(line(vk,"6 4","var(--s)",2));
  $("#c2mat").innerHTML=plot({w:520,h:270,m:[36,12,14,30],x:[0,1.6],y:[0,32],yt:[0,10,20,30],xt:[0,.3,.7,1.2,1.6],xf:v=>v+"",xl:"V_D (V)",yl:"I_D (mA)",label:"Ge Si GaAs forward curves",body:(sx,sy)=>
    L.map(o=>`<path d="${path(o.p,sx,sy)}" style="fill:none;stroke:${o.col};stroke-width:${o.w};${o.dash?"stroke-dasharray:"+o.dash:""}"/>`).join("")+M.map(([n,k,c])=>TX(sx(k)+14,sy(26),n,{s:`fill:${c};font-weight:700`,a:"start"})).join("")+(T!==25?TX(sx(vk)-6,sy(30),"Si @ "+T+"°C",{a:"end",s:"fill:var(--s)"}):"")});
  $("#c2tmpR").innerHTML=`<span class="box">الـ knee <b>${nf(vk,3)} V</b></span><span class="box">التغيير <span class="m">(${T} − 25) × (−2.5 mV)</span> <b>${T>=25?"−":"+"}${nf(Math.abs(.0025*(T-25))*1000,0)} mV</b></span>`;isolate($("#c2tmpR"));
}
$("#c2tmp").addEventListener("input",c2mat);c2mat();

/* scene 8: models */
const MDL={ideal:{t:"1. Ideal model",curve:[[-.9,0],[0,0],[0,1]],fw:"الـ diode = <b>short circuit</b> (سلك)",rv:"الـ diode = <b>open circuit</b>",ff:"V<sub>F</sub> = 0 V · I<sub>F</sub> = V<sub>BIAS</sub> / R<sub>LIMIT</sub>",rf:"I<sub>R</sub> = 0 A · V<sub>R</sub> = V<sub>BIAS</sub>"},
 prac:{t:"2. Practical model",curve:[[-.9,0],[.7,0],[.7,1]],fw:"الـ diode = <b>battery 0.7 V</b>",rv:"الـ diode = <b>open circuit</b>",ff:"V<sub>F</sub> = 0.7 V · I<sub>F</sub> = (V<sub>BIAS</sub> − 0.7) / R<sub>LIMIT</sub>",rf:"I<sub>R</sub> = 0 A · V<sub>R</sub> = V<sub>BIAS</sub>"},
 comp:{t:"3. Complete model",curve:[[-.9,-.06],[0,0],[.7,0],[1.05,1]],fw:"الـ diode = <b>battery 0.7 V + r′<sub>d</sub> = 10 Ω</b> (الميل جاي من الـ dynamic resistance)",rv:"الـ diode = <b>مقاومة كبيرة جداً</b>، والـ <span class='m'>I<sub>R</sub></span> صغير جداً (µA)",ff:"V<sub>F</sub> = 0.7 + I<sub>F</sub> r′<sub>d</sub> · I<sub>F</sub> = (V<sub>BIAS</sub> − 0.7) / (R<sub>LIMIT</sub> + r′<sub>d</sub>)",rf:"I<sub>R</sub> ≈ µA · V<sub>R</sub> = V<sub>BIAS</sub> − I<sub>R</sub> R<sub>LIMIT</sub>"}};
function c2mdl(k){
  const m=MDL[k];
  const curve=plot({w:300,h:200,m:[20,10,12,24],x:[-1,1.2],y:[-.2,1.1],yt:[],xt:[0,.7],xf:v=>v+" V",zero:true,label:"model characteristic",body:(sx,sy)=>`<line x1="${sx(0)}" x2="${sx(0)}" y1="${sy(-.2)}" y2="${sy(1.1)}" class="ax"/><path d="${path(m.curve,sx,sy)}" style="fill:none;stroke:var(--s);stroke-width:3"/>`+TX(sx(1.15),sy(.08),"V_F",{c:"tk",a:"end"})+TX(sx(.05),sy(1.02),"I_F",{c:"tk",a:"start"})});
  let eq="";const y=60;
  eq+=TX(20,24,"forward",{a:"start",c:"tk"})+wire([[20,y],[60,y]]);
  if(k==="ideal")eq+=wire([[60,y],[150,y]],"var(--r)",3);
  if(k==="prac"||k==="comp")eq+=`<line x1="60" x2="96" y1="${y}" y2="${y}" style="stroke:${INK};stroke-width:2"/><line x1="96" x2="96" y1="${y-14}" y2="${y+14}" style="stroke:${INK};stroke-width:2.5"/><line x1="104" x2="104" y1="${y-8}" y2="${y+8}" style="stroke:${INK};stroke-width:5"/>`+TX(100,y-20,"0.7 V",{c:"tk"})+(k==="comp"?wire([[104,y],[112,y]])+resistor(112,y,170,y)+TX(141,y-16,"r′d",{c:"tk"}):wire([[104,y],[150,y]]));
  eq+=wire([[k==="comp"?170:150,y],[200,y]]);
  const y2=150;eq+=TX(20,y2-36,"reverse",{a:"start",c:"tk"})+wire([[20,y2],[80,y2]])+(k==="comp"?resistor(80,y2,140,y2)+TX(110,y2-16,"very high R",{c:"tk"}):`<line x1="80" x2="118" y1="${y2}" y2="${y2-18}" style="stroke:${INK};stroke-width:2"/>`+term(80,y2)+term(140,y2))+wire([[140,y2],[200,y2]]);
  $("#c2mdlViz").innerHTML=`<div class="mdlv">${SVG(220,180,eq,"equivalent circuits")}${curve}</div>`;
  $("#c2mdlTxt").innerHTML=`<h4>${m.t}</h4><ul class="clean small"><li>Forward: ${m.fw}</li><li>Reverse: ${m.rv}</li></ul><div class="mb" style="font-size:.95rem;margin-top:8px">${m.ff}</div><div class="mb" style="font-size:.95rem;margin-top:6px">${m.rf}</div>`;
  isolate($("#c2mdlTxt"));
}
seg("#c2mdl","m",c2mdl);c2mdl("ideal");

/* scene 9: example 1 & 2 */
const RV=[.33,.68,1,2.2,4.7,10,22];let exDir="f";
const kohm=v=>(v<1?nf(v*1000,0)+" Ω":nf(v,v%1?1:0)+" kΩ");
function c2ex(){
  const V=+$("#c2exV").value,R=RV[+$("#c2exR").value]*1000,rd=10,IRr=1e-6;$("#c2exVO").textContent=nf(V,1)+" V";$("#c2exRO").textContent=kohm(R/1000);
  let s=`<g transform="translate(40 0)">`+battery(60,110)+TX(30,114,"V_BIAS",{a:"end",c:"tk"})+TX(30,128,nf(V,1)+" V",{a:"end",c:"tk"})+wire([[60,84],[60,40],[150,40]])+resistor(150,40,250,40)+TX(200,24,"R_LIMIT "+kohm(R/1000),{c:"tk"})+wire([[250,40],[330,40],[330,88]])+diode(330,110,exDir==="f"?90:-90,null)+wire([[330,132],[330,180],[60,180],[60,136]])+gnd(195,180)+`</g>`;
  $("#c2exViz").innerHTML=SVG(420,215,s,"example circuit");
  const rows=[];
  if(exDir==="f"){
    const on=V>.7;
    rows.push(["Ideal","0 V",amp(V/R),nf(V,2)+" V"]);
    rows.push(["Practical",on?"0.7 V":nf(V,2)+" V (off)",on?amp((V-.7)/R):"0 A",on?nf(V-.7,2)+" V":"0 V"]);
    const I=on?(V-.7)/(R+rd):0;rows.push(["Complete",on?nf(.7+I*rd,3)+" V":nf(V,2)+" V (off)",amp(I),nf(I*R,2)+" V"]);
  }else{
    rows.push(["Ideal",nf(V,2)+" V","0 A","0 V"]);rows.push(["Practical",nf(V,2)+" V","0 A","0 V"]);
    rows.push(["Complete",nf(V-IRr*R,4)+" V","1 µA",nf(IRr*R*1000,2)+" mV"]);
  }
  $("#c2exTbl").innerHTML=`<table class="cmp"><tr><th>Model</th><th>الـ voltage على الـ diode</th><th>التيار</th><th>الـ voltage على <span class="m">R<sub>LIMIT</sub></span></th></tr>${rows.map(r=>`<tr><td><b>${r[0]}</b></td><td class="mono">${r[1]}</td><td class="mono">${r[2]}</td><td class="mono">${r[3]}</td></tr>`).join("")}</table>`;
  const d=V===10&&R===1000;
  $("#c2exMsg").innerHTML=exDir==="f"?(d?`دي أرقام المحاضرة بالظبط: 10 mA و9.3 mA و9.21 mA، و<span class="m">V<sub>F</sub> = 0.7 + 9.21 mA × 10 Ω = 0.792 V</span>.`:`خلّي <span class="m">V<sub>BIAS</sub> = 10 V</span> و<span class="m">R = 1 kΩ</span> عشان ترجع لأرقام المحاضرة.`):
    (d?`أرقام المحاضرة: الـ complete بس فيه تيار صغير، <span class="m">V<sub>R</sub> = 1 µA × 1 kΩ = 1 mV</span>، فالـ diode عليه <span class="m">10 − 0.001 = 9.999 V</span>.`:`الـ diode في الـ reverse شايل كل الـ voltage تقريباً.`);
  isolate($("#c2exTbl"));isolate($("#c2exMsg"));
}
["c2exV","c2exR"].forEach(id=>$("#"+id).addEventListener("input",c2ex));seg("#c2exDir","d",d=>{exDir=d;c2ex()});c2ex();

/* scene 10: symbol + ohmmeter */
$("#c2sym").innerHTML=SVG(360,150,wire([[30,50],[150,50]])+diode(172,50,0,null)+wire([[194,50],[320,50]])+TX(60,30,"Anode (+)")+TX(290,30,"Cathode (−)")+
  `<rect x="110" y="96" width="140" height="34" rx="12" style="fill:#2b2b2b"/><rect x="226" y="96" width="14" height="34" style="fill:#cfcfcf"/>`+wire([[40,113],[110,113]],"var(--muted)",4)+wire([[250,113],[320,113]],"var(--muted)",4)+TX(233,146,"band = cathode",{c:"tk"}),"diode symbol and package");
let ohmFwd=true;
function c2ohm(){
  const ang=ohmFwd?35:-62;
  let s=`<path d="M60 140 A110 110 0 0 1 280 140" style="fill:none;stroke:var(--line);stroke-width:10"/>`+TX(70,160,"∞ (high R)",{c:"tk",a:"start"})+TX(270,160,"0 (low R)",{c:"tk",a:"end"});
  s+=`<g transform="translate(170 150) rotate(${ang})"><line x1="0" y1="0" x2="0" y2="-104" style="stroke:var(--neg);stroke-width:3"/></g><circle cx="170" cy="150" r="7" style="fill:var(--ink)"/>`;
  s+=diode(170,210,ohmFwd?0:180,ohmFwd?"on":"off")+wire([[60,210],[148,210]],"var(--neg)",3)+wire([[192,210],[280,210]],"var(--ink)",3)+TX(60,236,"red (+)",{a:"start",s:"fill:var(--neg)"})+TX(280,236,"black (COM)",{a:"end"});
  $("#c2ohm").innerHTML=SVG(340,250,s,"ohmmeter test");
  $("#c2ohmMsg").innerHTML=ohmFwd?`<span class="pill on">مقاومة واطية نسبياً</span> الـ red على الـ anode، فالـ diode forward.`:`<span class="pill off">مقاومة عالية نسبياً</span> الـ red على الـ cathode، فالـ diode reverse.`;
  isolate($("#c2ohmMsg"));
}
$("#c2flip").addEventListener("click",()=>{ohmFwd=!ohmFwd;c2ohm()});c2ohm();

/* scene 11: flow */
$("#c2flow").innerHTML=[["١","افترض الـ diode ON","حط مكانه battery <span class='m'>V<sub>K</sub></span>"],["٢","احسب التيار","بالـ KVL"],["٣","اتأكد","التيار طالع في اتجاه السهم؟ و<span class='m'>E &gt; ΣV<sub>K</sub></span>؟"],["٤","النتيجة","آه: ON ✓. لأ: OFF، open circuit، و<span class='m'>I = 0</span>"]].map(([n,a,b],i)=>`${i?'<span class="farr">←</span>':""}<div class="fbox"><span class="fn">${n}</span><b>${a}</b><span class="small">${b}</span></div>`).join("");

/* scene 12: series solver */
const VK={si:.7,ge:.3,red:1.8,green:2.2},DN={si:"Si",ge:"Ge",red:"red LED",green:"green LED"};
const RS=[.33,.68,1,1.2,2.2,4.7,5.6,10];
const SER={E:8,R:4,d1:"si",f1:true,d2:"none",f2:true};
const PRE=[{E:8,R:4,d1:"si",f1:true,d2:"none",f2:true},{E:8,R:4,d1:"si",f1:false,d2:"none",f2:true},{E:.5,R:3,d1:"si",f1:true,d2:"none",f2:true},{E:12,R:1,d1:"si",f1:true,d2:"red",f2:true},{E:20,R:6,d1:"si",f1:true,d2:"si",f2:false}];
function c2ser(){
  const E=SER.E,R=RS[SER.R]*1000,ds=[{t:SER.d1,f:SER.f1,n:"D1"}].concat(SER.d2!=="none"?[{t:SER.d2,f:SER.f2,n:"D2"}]:[]);
  $("#c2EO").textContent=nf(E,1)+" V";$("#c2RO").textContent=kohm(RS[SER.R]);
  const rev=ds.filter(d=>!d.f),sumK=ds.reduce((s,d)=>s+VK[d.t],0);
  let I=0,state,vd={},steps=[];
  steps.push(`افترض كل الـ diodes ON. اتجاه التيار من الـ + بتاع الـ battery: ${ds.map(d=>`${d.n} (${DN[d.t]}) ${d.f?"في اتجاه السهم ✓":"<b class='cN'>عكس السهم ✗</b>"}`).join("، و")}.`);
  if(rev.length){state="off";ds.forEach(d=>vd[d.n]=d.f?0:(rev.length===1?E:null));
    steps.push(`فيه diode عكس التيار، فهو <b>OFF = open circuit</b>، والدايرة مفتوحة: <span class="m">I<sub>D</sub> = 0 A</span>.`);
    steps.push(`<span class="m">V<sub>o</sub> = V<sub>R</sub> = I R = 0 V</span>.`);
    steps.push(rev.length===1?`KVL: <span class="m">E − ΣV<sub>D</sub> − V<sub>o</sub> = 0</span>، فالـ diode المقلوب عليه <span class="m">${nf(E,2)} V</span> (كل الـ E)، وأي diode forward من غير تيار عليه 0 V.`:`الاتنين مقلوبين: الـ E بيتقسم عليهم بشكل مش محدد في الـ model ده.`);}
  else if(E<=sumK){state="off";ds.forEach(d=>vd[d.n]=ds.length===1?E:null);
    steps.push(`محتاجين <span class="m">ΣV<sub>K</sub> = ${nf(sumK,1)} V</span> عشان نفتح، والـ E = ${nf(E,2)} V بس. <b>مش كفاية</b>، فالـ diode${ds.length>1?"s":""} OFF.`);
    steps.push(`<span class="m">I<sub>D</sub> = 0 A</span>، و<span class="m">V<sub>R</sub> = I R = 0 V</span>.`);
    steps.push(`KVL: ${ds.length===1?`<span class="m">V<sub>D</sub> = E = ${nf(E,2)} V</span>`:`الـ E كله على الـ diodes، بس تقسيمه بينهم مش محدد`}.`);}
  else{state="on";I=(E-sumK)/R;ds.forEach(d=>vd[d.n]=VK[d.t]);
    steps.push(`<span class="m">E = ${nf(E,2)} V &gt; ΣV<sub>K</sub> = ${ds.map(d=>VK[d.t]).join(" + ")} = ${nf(sumK,1)} V</span>، يبقى كلهم ON.`);
    steps.push(`<span class="m">V<sub>R</sub> = E − ΣV<sub>K</sub> = ${nf(E,2)} − ${nf(sumK,1)} = ${nf(E-sumK,2)} V</span> (وده <span class="m">V<sub>o</sub></span>).`);
    steps.push(`<span class="m">I<sub>D</sub> = V<sub>R</sub> / R = ${nf(E-sumK,2)} / ${kohm(R/1000)} = ${amp(I)}</span>.`);}
  /* drawing */
  let s=battery(60,140)+TX(36,144,"E",{a:"end"})+TX(36,160,nf(E,1)+" V",{a:"end",c:"tk"})+wire([[60,114],[60,60],[110,60]]);
  const xs=ds.length===1?[230]:[175,295];
  let x=110;ds.forEach((d,i)=>{s+=wire([[x,60],[xs[i]-22,60]])+diode(xs[i],60,d.f?0:180,state==="on"?"on":(d.f?(rev.length?null:"off"):"off"))+TX(xs[i],36,`${d.n} · ${DN[d.t]}`,{c:"tk"})+(vd[d.n]!=null?TX(xs[i],92,"V = "+nf(vd[d.n],2)+" V",{c:"tk",s:"fill:var(--a)"}):"");x=xs[i]+22});
  s+=wire([[x,60],[420,60]])+dot(420,60)+wire([[420,60],[470,60]])+term(474,60)+TX(492,64,"Vo",{a:"start",s:"font-weight:700"})+resistor(420,60,420,220)+TX(440,145,"R = "+kohm(RS[SER.R]),{a:"start",c:"tk"})+wire([[420,220],[60,220],[60,166]])+gnd(240,220);
  if(state==="on")s+=curArrow(80,42,140,42,"I = "+amp(I));
  $("#c2ser").innerHTML=SVG(560,250,s,"series diode circuit");
  $("#c2serR").innerHTML=`<span class="box">الحالة <b class="${state==="on"?"cR":"cN"}">${state==="on"?"ON":"OFF"}</b></span><span class="box"><span class="m">I<sub>D</sub></span> <b>${amp(I)}</b></span><span class="box"><span class="m">V<sub>o</sub> = V<sub>R</sub></span> <b>${nf(I*R,2)} V</b></span>`;
  $("#c2serSteps").innerHTML=steps.map(t=>`<li><span>${t}</span></li>`).join("");
  $("#c2E").value=E;$("#c2R").value=SER.R;$("#c2d1").value=SER.d1;$("#c2d2").value=SER.d2;
  isolate($("#c2serR"));isolate($("#c2serSteps"));
}
seg("#c2pre","p",p=>{Object.assign(SER,PRE[+p]);c2ser()});
$("#c2E").addEventListener("input",e=>{SER.E=+e.target.value;c2ser()});$("#c2R").addEventListener("input",e=>{SER.R=+e.target.value;c2ser()});
$("#c2d1").addEventListener("change",e=>{SER.d1=e.target.value;c2ser()});$("#c2d2").addEventListener("change",e=>{SER.d2=e.target.value;c2ser()});
$("#c2d1f").addEventListener("click",()=>{SER.f1=!SER.f1;c2ser()});$("#c2d2f").addEventListener("click",()=>{if(SER.d2!=="none"){SER.f2=!SER.f2;c2ser()}});c2ser();

/* scene 13: two sources */
const TWO=[`الـ diode ON؟ <span class="m">E<sub>1</sub> = +10 V</span> و<span class="m">E<sub>2</sub> = −5 V</span>، فالتيار هيمشي من <span class="m">E<sub>1</sub></span> لـ <span class="m">E<sub>2</sub></span>، في اتجاه السهم ✓. يبقى ON، و<span class="m">V<sub>D</sub> = 0.7 V</span>.`,
 `KVL على اللوب كلها: <span class="m">I = (E<sub>1</sub> + E<sub>2</sub> − V<sub>D</sub>) / (R<sub>1</sub> + R<sub>2</sub>) = (10 + 5 − 0.7) / (4.7k + 2.2k) = 14.3 / 6.9k ≈ 2.07 mA</span>`,
 `<span class="m">V<sub>1</sub> = I R<sub>1</sub> = 2.07 mA × 4.7 kΩ = 9.73 V</span>`,
 `<span class="m">V<sub>2</sub> = I R<sub>2</sub> = 2.07 mA × 2.2 kΩ = 4.55 V</span>`,
 `KVL على اللوب التانية: <span class="m">−E<sub>2</sub> + V<sub>2</sub> − V<sub>o</sub> = 0</span>، يعني <span class="m">V<sub>o</sub> = V<sub>2</sub> − E<sub>2</sub> = 4.55 − 5 = −0.45 V</span>. والإشارة السالبة معناها إن الـ polarity عكس اللي افترضناه.`];
let twoK=1;
function c2two(){
  let s=term(30,50)+TX(30,32,"E₁ = 10 V",{s:"font-weight:600"})+wire([[34,50],[80,50]])+resistor(80,50,180,50)+TX(130,34,"R₁ 4.7 kΩ",{c:"tk"})+TX(130,76,twoK>=3?"V₁ = 9.73 V":"",{c:"tk",s:"fill:var(--a)"})+wire([[180,50],[218,50]])+diode(240,50,0,twoK>=1?"on":null)+TX(240,30,"Si",{c:"tk"})+wire([[262,50],[330,50]])+dot(330,50)+wire([[330,50],[390,50]])+term(394,50)+TX(410,54,"Vo",{a:"start",s:"font-weight:700"})+(twoK>=5?TX(410,72,"−0.45 V",{a:"start",s:"fill:var(--neg);font-weight:700"}):"");
  s+=resistor(330,50,330,170)+TX(348,104,"R₂ 2.2 kΩ",{a:"start",c:"tk"})+TX(348,120,twoK>=4?"V₂ = 4.55 V":"",{a:"start",c:"tk",s:"fill:var(--a)"})+wire([[330,170],[330,190]])+term(330,194)+TX(330,220,"E₂ = −5 V",{s:"font-weight:600"});
  if(twoK>=2)s+=curArrow(60,20,130,20,"I = 2.07 mA");
  $("#c2two").innerHTML=SVG(460,232,s,"two source circuit");
  $("#c2twoSteps").innerHTML=TWO.slice(0,twoK).map(t=>`<li><span>${t}</span></li>`).join("");
  $("#c2twoNext").disabled=twoK>=TWO.length;isolate($("#c2twoSteps"));
}
$("#c2twoNext").addEventListener("click",()=>{twoK=Math.min(TWO.length,twoK+1);c2two()});$("#c2two0").addEventListener("click",()=>{twoK=1;c2two()});c2two();

/* scene 14: parallel */
const PAR=[
 {d:()=>{let s=battery(50,120)+TX(26,124,"10 V",{a:"end",c:"tk"})+wire([[50,94],[50,50],[90,50]])+resistor(90,50,190,50)+TX(140,34,"R 0.33 kΩ",{c:"tk"})+wire([[190,50],[380,50]])+dot(250,50)+dot(330,50)+wire([[380,50],[400,50]])+term(404,50)+TX(420,54,"Vo = 0.7 V",{a:"start",s:"font-weight:700"});
   s+=wire([[250,50],[250,98]])+diode(250,120,90,"on")+wire([[250,142],[250,190]])+wire([[330,50],[330,98]])+diode(330,120,90,"on")+wire([[330,142],[330,190]])+TX(232,124,"D1",{a:"end",c:"tk"})+TX(348,124,"D2",{a:"start",c:"tk"})+wire([[50,146],[50,190],[330,190]])+gnd(190,190)+curArrow(100,84,170,84,"")+TX(135,102,"I₁ = 28.18 mA",{s:"fill:var(--r);font-weight:600"});return SVG(520,220,s,"two parallel diodes")},
  st:[`الاتنين Si ومتوصلين parallel، فالـ voltage عليهم واحد: <span class="m">V<sub>o</sub> = 0.7 V</span>.`,`<span class="m">I<sub>1</sub> = V<sub>R</sub> / R = (E − V<sub>D</sub>) / R = (10 − 0.7) / 0.33 kΩ = 28.18 mA</span>`,`افترض إن الاتنين ليهم نفس الـ characteristics: <span class="m">I<sub>D1</sub> = I<sub>D2</sub> = I<sub>1</sub> / 2 = 14.09 mA</span>`],
  note:`<b>ليه نحط diode parallel؟</b>لو أقصى تيار للـ diode في الـ datasheet حوالي 20 mA، الـ 28.18 mA هتحرقه لو كان لوحده. ومع اتنين، كل واحد بياخد 14 mA بس، أقل من الحد. يعني ده protection للدايرة من التيار الزيادة.`},
 {d:()=>{let s=term(200,24)+TX(220,28,"12 V",{a:"start",s:"font-weight:600"})+wire([[200,28],[200,50],[150,50],[150,78]])+wire([[200,50],[260,50],[260,78]])+diode(150,100,90,"on")+diode(260,100,90,"off")+TX(130,104,"Si",{a:"end",c:"tk"})+TX(282,104,"green LED (2.2 V)",{a:"start",c:"tk"})+wire([[150,122],[150,150],[260,150],[260,122]])+dot(200,150)+wire([[200,150],[330,150]])+term(334,150)+TX(350,154,"Vo = 11.3 V",{a:"start",s:"font-weight:700"})+resistor(200,150,200,240)+TX(218,198,"2.2 kΩ",{a:"start",c:"tk"})+gnd(200,240);return SVG(520,270,s,"Si parallel with green LED")},
  st:[`شكلهم parallel، بس <b>الـ voltages مختلفة</b>: الـ Si محتاج 0.7 والـ LED محتاج 2.2. والـ parallel لازم يبقى الـ voltage عليه واحد.`,`الـ source مش بيوصل لقيمته في لحظة. ياخد وقت صغير جداً (µs)، والـ voltage بيطلع من الصفر. فأول ما يوصل <b>0.7 V</b>، الـ Si بيبقى ON قبل الـ LED.`,`الـ Si ON بيمسك الـ voltage اللي على الاتنين عند 0.7 V، والـ 0.7 أقل من الـ 2.2 اللي الـ LED محتاجها، فالـ LED بيفضل OFF (open circuit).`,`<span class="m">V<sub>o</sub> = 12 − 0.7 = 11.3 V</span>`],
  note:`<b>إضافة صغيرة مني</b>التيار في المقاومة: <span class="m">11.3 V / 2.2 kΩ ≈ 5.14 mA</span>، وكله بيعدّي في الـ Si.`},
 {d:()=>{let s=battery(50,130)+TX(26,134,"20 V",{a:"end",c:"tk"})+wire([[50,104],[50,50],[118,50]])+diode(140,50,0,"on")+TX(140,30,"D1 Si",{c:"tk"})+wire([[162,50],[240,50]])+dot(240,50)+wire([[240,50],[360,50],[360,98]])+resistor(360,98,360,180)+TX(378,140,"R₁ 3.3 kΩ",{a:"start",c:"tk"});
   s+=wire([[240,50],[240,98]])+diode(240,120,90,"on")+TX(222,124,"D2 Si",{a:"end",c:"tk"})+wire([[240,142],[240,200]])+wire([[360,180],[360,200],[240,200]])+dot(240,200)+wire([[240,200],[200,200]])+resistor(200,200,90,200)+TX(145,222,"R₂ 5.6 kΩ",{c:"tk"})+wire([[90,200],[50,200],[50,156]])+gnd(50,200)+curArrow(380,70,380,92,"")+TX(400,84,"I₁",{a:"start",s:"fill:var(--r);font-weight:700"})+curArrow(190,186,110,186,"I₂");return SVG(520,240,s,"series-parallel diodes")},
  st:[`D2 parallel مع R₁، فالـ voltage على R₁ هو <span class="m">V<sub>K2</sub> = 0.7 V</span>: <span class="m">I<sub>1</sub> = V<sub>K2</sub> / R<sub>1</sub> = 0.7 / 3.3 kΩ = 0.212 mA</span>`,`KVL على اللوب: <span class="m">−V<sub>2</sub> + E − V<sub>K1</sub> − V<sub>K2</sub> = 0</span>، يعني <span class="m">V<sub>2</sub> = 20 − 0.7 − 0.7 = 18.6 V</span>`,`<span class="m">I<sub>2</sub> = V<sub>2</sub> / R<sub>2</sub> = 18.6 / 5.6 kΩ = 3.32 mA</span>`,`KCL عند الـ node: <span class="m">I<sub>D2</sub> = I<sub>2</sub> − I<sub>1</sub> = 3.32 − 0.212 ≈ 3.11 mA</span>`],
  note:`<b>الفكرة</b>أي حاجة parallel مع diode ON بياخد نفس الـ 0.7 V بتاعه. ابدأ منها، وبعدين KVL للـ loop الكبيرة، وبعدين KCL للـ node.`}];
function c2par(k){const p=PAR[k];$("#c2parViz").innerHTML=p.d();$("#c2parSteps").innerHTML=p.st.map(t=>`<li><span>${t}</span></li>`).join("");$("#c2parNote").innerHTML=p.note;isolate($("#c2parSteps"));isolate($("#c2parNote"))}
seg("#c2par","p",p=>c2par(+p));c2par(0);

/* scene 15: logic gates */
const G={or:[10,0],and:[10,0]};
function gateTbl(kind,v){
  const rows=[[10,10],[10,0],[0,10],[0,0]].map(([a,b])=>{let d1,d2,vo;
    if(kind==="or"){d1=a>0?"Forward":"Reverse";d2=b>0?"Forward":"Reverse";vo=Math.max(a,b)>0?9.3:0}else{d1=a>0?"Reverse":"Forward";d2=b>0?"Reverse":"Forward";vo=a>0&&b>0?10:.7}
    return {a,b,d1,d2,vo,cur:a===v[0]&&b===v[1]}});
  return `<table class="gtab"><tr><th>V₁</th><th>V₂</th><th>D1</th><th>D2</th><th>Vo</th><th>level</th></tr>${rows.map(r=>`<tr style="${r.cur?"background:color-mix(in srgb,var(--accent) 20%,transparent);font-weight:700":""}"><td>${r.a}</td><td>${r.b}</td><td>${r.d1}</td><td>${r.d2}</td><td>${r.vo} V</td><td>${(kind==="or"?r.vo>5:r.vo>5)?1:0}</td></tr>`).join("")}</table>`;
}
function c2gate(kind){
  const [a,b]=G[kind];let s="",vo;
  if(kind==="or"){
    const on1=a>0,on2=b>0;vo=Math.max(a,b)>0?9.3:0;
    s+=term(30,40)+TX(30,24,"V₁ = "+a+" V",{s:"font-weight:600"})+wire([[34,40],[98,40]])+diode(120,40,0,on1?"on":"off")+wire([[142,40],[200,40]])+term(30,120)+TX(30,104,"V₂ = "+b+" V",{s:"font-weight:600"})+wire([[34,120],[98,120]])+diode(120,120,0,on2?"on":"off")+wire([[142,120],[200,120],[200,40]])+dot(200,80)+wire([[200,80],[260,80]])+term(264,80)+TX(270,66,"Vo = "+vo+" V",{a:"start",s:`font-weight:700;fill:${vo>5?"var(--r)":"var(--neg)"}`})+resistor(200,80,200,180)+TX(218,134,"1 kΩ",{a:"start",c:"tk"})+gnd(200,180);
  }else{
    const on1=a===0,on2=b===0;vo=a>0&&b>0?10:.7;
    s+=term(30,40)+TX(30,24,"V₁ = "+a+" V",{s:"font-weight:600"})+wire([[34,40],[98,40]])+diode(120,40,180,on1?"on":"off")+wire([[142,40],[200,40]])+term(30,120)+TX(30,104,"V₂ = "+b+" V",{s:"font-weight:600"})+wire([[34,120],[98,120]])+diode(120,120,180,on2?"on":"off")+wire([[142,120],[200,120],[200,40]])+dot(200,80)+wire([[200,80],[260,80]])+term(264,80)+TX(270,66,"Vo = "+vo+" V",{a:"start",s:`font-weight:700;fill:${vo>5?"var(--r)":"var(--neg)"}`})+resistor(200,80,200,170)+TX(218,128,"1 kΩ",{a:"start",c:"tk"})+term(200,174)+TX(200,198,"E = +10 V",{c:"tk"});
  }
  $(`#c2${kind}Viz`).innerHTML=SVG(360,205,s,kind+" gate");$(`#c2${kind}Tbl`).innerHTML=gateTbl(kind,G[kind]);
  [1,2].forEach(i=>{const bt=$(`#c2${kind}${i}`);bt.textContent=`V${i===1?"₁":"₂"} = ${G[kind][i-1]} V (${G[kind][i-1]?1:0})`;bt.setAttribute("aria-pressed",String(G[kind][i-1]>0))});
}
["or","and"].forEach(k=>[1,2].forEach(i=>$(`#c2${k}${i}`).addEventListener("click",()=>{G[k][i-1]=G[k][i-1]?0:10;c2gate(k)})));c2gate("or");c2gate("and");

makeQuiz("#c2quiz","#c2quizS",["بتزيد","بتقل","مش بتتغير"],[
 ["عرض الـ depletion region في الـ reverse bias…",0,"الـ electrons بتروح ناحية الـ + والـ holes ناحية الـ −، فالمنطقة الفاضية بتوسع."],
 ["عرض الـ depletion region في الـ forward bias…",1,"الـ carriers بيتزقّوا ناحية الـ junction، فالمنطقة بتضيق لحد ما يعدّوا."],
 ["لما الحرارة تزيد، الـ forward voltage بتاع الـ Si…",1,"حوالي −2.5 mV لكل °C."],
 ["لما الحرارة تزيد، الـ reverse current…",0,"الحرارة بتدّي طاقة، فبيتولد carriers أكتر."],
 ["في الـ practical model (Si forward)، لو كبّرت E من 5 لـ 10 V، الـ V_D…",2,"بيفضل 0.7 V. اللي بيتغير هو التيار والـ voltage على المقاومة."],
 ["في نفس الدايرة، لو كبّرت E، التيار…",0,"I = (E − 0.7) / R، فبيزيد مع E."]
]);
