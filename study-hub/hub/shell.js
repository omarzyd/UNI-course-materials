/* ---------- courses (home → course tab → lecture) ---------- */
const COURSES=[
 {id:"rl",code:"DSAI 402",name:"Reinforcement Learning",short:"RL",cc:"var(--accent)",exam:"2026-11-09T08:30:00",examTxt:"الإتنين 9 نوفمبر · 8:30 الصبح",
  blurb:"إزاي agent يتعلم ياخد قرارات صح من التجربة.",
  legend:[["tS","state"],["tA","action"],["tR","reward"],["tN","penalty"],["tG","γ discount"]],
  lec:[
   {id:"l1",k:"L1",t:"Why RL",q:"إمتى أصلاً أستخدم RL؟",c:["loop","reward = spec"],open:true},
   {id:"l2",k:"L2",t:"RL Basics",q:"إزاي أوصف المشكلة بالأرقام؟",c:["S","A","R","G","γ","Markov"],open:true},
   {id:"l3",k:"L3",t:"MDP",q:"كل state تسوى قد إيه؟",c:["π","v","q","Bellman"],open:true},
   {id:"l4",k:"L4",t:"Dynamic Programming",q:"لو عارف الـ model، أطلّع أحسن policy إزاي؟",c:["evaluation","improvement","policy iteration"]},
   {id:"l5",k:"L5",t:"Value Iteration + MC",q:"ولو مش عارف الـ model؟ اتعلم من episodes",c:["value iteration","GPI","MC prediction"]},
   {id:"l6",k:"L6",t:"MC Control",q:"أتعلم الـ policy نفسها من التجربة",c:["q","ε-greedy","exploring starts"]},
   {id:"big",k:"★",t:"The Big Picture",q:"كل حاجة مع بعض قبل الامتحان",c:[]}]},
 {id:"speech",code:"DSAI 456",name:"Speech Recognition",short:"Speech",cc:"var(--g)",exam:"2026-11-12T12:15:00",examTxt:"الخميس 12 نوفمبر · 12:15 الضهر",
  blurb:"من موجة صوت لـ text: الإشارة، وبعدين الـ features، وبعدين الـ models.",
  legend:[["tS","time / signal"],["tA","frequency"],["tG","energy"],["tR","text"]],
  lec:[
   {id:"s1",k:"L1",t:"What is a Speech System?",q:"الـ machine بتستلم إيه، ونقيس غلطها إزاي؟",c:["ASR","WER","CER"],open:true},
   {id:"s2",k:"L2",t:"Foundations",q:"الـ 16,000 رقم دول جايين منين؟",c:["sampling","Nyquist","F0","formants"],open:true},
   {id:"s3",k:"L3",t:"Spectral Front End",q:"إزاي الصوت يتحوّل لـ features؟",c:["DFT","window","STFT","log-mel","MFCC"],open:true},
   {id:"s4",k:"L4",t:"Alignment & HMMs",q:"إزاي نربط الـ frames بالحروف؟",c:["HMM","forward"]},
   {id:"s5",k:"L5",t:"Viterbi & GMMs",q:"أحسن path، وموديل للصوت نفسه",c:["Viterbi","GMM"]},
   {id:"s6",k:"L6",t:"HMMs & GMMs by Hand",q:"نحلّها بإيدنا",c:["EM","GMM-HMM"]}]},
 {id:"circ",code:"CSAI 205",name:"Circuits and Electronics",short:"Circuits",cc:"var(--a)",exam:"2026-11-14T08:30:00",examTxt:"السبت 14 نوفمبر · 8:30 الصبح",
  blurb:"من الـ semiconductor للـ diode، وبعدين اللي بنبنيه بيه.",
  legend:[["tS","electron"],["tN","hole"],["tA","voltage V"],["tR","current I"]],
  lec:[
   {id:"c1",k:"L1",t:"Circuit Basics",q:"",c:["V","I","R","series / parallel"]},
   {id:"c2",k:"L2",t:"Semiconductors & Diodes",q:"إزاي حتة silicon تعدّي التيار في اتجاه واحد بس؟",c:["bands","doping","p-n","bias","models"],open:true},
   {id:"c3",k:"L3",t:"Diode Applications",q:"",c:["rectifiers","clippers","clampers"]},
   {id:"c4",k:"L4",t:"Diode Applications 2",q:"",c:["clampers","multipliers"]},
   {id:"c5",k:"L5",t:"Special-Purpose Diodes",q:"",c:["LED","photodiode","Schottky"]},
   {id:"c6",k:"L6",t:"Zener Diodes",q:"",c:["zener","regulator"]}]}
];
const LEC={};COURSES.forEach(c=>c.lec.forEach(l=>{l.course=c;LEC[l.id]=l}));
let done=store.get("rl-story-done",{});
const DAY=864e5;
function daysTo(iso){const d=new Date(iso),n=new Date();const a=Date.UTC(d.getFullYear(),d.getMonth(),d.getDate()),b=Date.UTC(n.getFullYear(),n.getMonth(),n.getDate());return Math.round((a-b)/DAY)}
function daysTxt(n){return n<0?"خلص":n===0?"النهارده":n===1?"بكرة":n===2?"بعد يومين":n<=10?`بعد ${n} أيام`:`بعد ${n} يوم`}
const ready=c=>c.lec.filter(l=>l.open), doneN=c=>c.lec.filter(l=>l.open&&done[l.id]).length;

function renderTabs(cur){
  $("#tabs").innerHTML=`<a href="#home" ${cur==="home"?'aria-current="page"':""}>الرئيسية<small>HOME</small></a>`+
    COURSES.map(c=>`<a href="#${c.id}" style="--cc:${c.cc}" ${cur===c.id?'aria-current="page"':""}>${c.short}<small>${c.code}</small></a>`).join("");
  isolate($("#tabs"));
}
function lecCard(l){
  const c=l.course, st=l.open?(done[l.id]?"✓ خلصت":"جاهز"):"قريب";
  const tag=l.open?`a href="#${l.id}"`:"div";
  return `<${tag} class="ch ${l.open?"open":"lock"} ${done[l.id]?"done":""}" style="--cc:${c.cc};text-decoration:none;color:inherit">
    <span class="st">${st}</span><span class="k">${c.short} · ${l.k}</span><b>${l.t}</b>${l.q?`<span class="q">${l.q}</span>`:""}
    ${l.c.length?`<span class="chips">${l.c.map(x=>`<span>${x}</span>`).join("")}</span>`:""}</${l.open?"a":"div"}>`;
}
function renderHome(){
  const up=COURSES.map(c=>({c,d:daysTo(c.exam)})).filter(x=>x.d>=0).sort((a,b)=>a.d-b.d)[0];
  $("#nextExam").style.setProperty("--cc",up?up.c.cc:"var(--accent)");
  $("#nextExam").innerHTML=up?`<span class="small">أقرب امتحان</span><span class="big">${up.c.short}</span><span>${up.c.examTxt}</span><b>${daysTxt(up.d)}</b>`:`<span class="big">خلصت الامتحانات</span>`;
  $("#courseCards").innerHTML=COURSES.map(c=>{
    const r=ready(c).length,dn=doneN(c),d=daysTo(c.exam);
    return `<a class="course" href="#${c.id}" style="--cc:${c.cc}">
      <span class="code">${c.code}</span><h3>${c.name}</h3><p class="small">${c.blurb}</p>
      <span class="exam"><span class="tag tE">امتحان</span>${c.examTxt} · <b>${daysTxt(d)}</b></span>
      <div class="prog" title="${dn} من ${r}"><i style="width:${r?dn/r*100:0}%"></i></div>
      <span class="small">جاهز ${r} من ${c.lec.length} lectures · خلّصت ${dn}</span>
      <span class="lchips">${c.lec.map(l=>`<span class="${l.open?(done[l.id]?"ok":"rd"):"lk"}">${l.k}</span>`).join("")}</span></a>`}).join("");
  isolate($("#v-home"));
}
function renderCourse(c){
  $("#v-course").innerHTML=`<div class="chero" style="--cc:${c.cc}"><div><span class="code">${c.code} · امتحان ${c.examTxt} · ${daysTxt(daysTo(c.exam))}</span><h2>${c.name}</h2><p>${c.blurb}</p></div>
    <div class="legend" aria-label="ألوان الرموز">${c.legend.map(([k,t])=>`<span class="tag ${k}">${t}</span>`).join("")}</div></div>
    <div class="lecs">${c.lec.map(lecCard).join("")}</div>
    <p class="small" style="margin-top:14px">الـ lectures اللي مكتوب عليها «قريب» لسه ما اتعملتش. كل lecture بتبني على اللي قبلها، فابدأ بالترتيب.</p>`;
  isolate($("#v-course"));
}
function refreshNav(){const id=location.hash.slice(1)||"home";if(!$("#v-home").hidden)renderHome();const c=COURSES.find(x=>x.id===id);if(c)renderCourse(c)}

/* ---------- RTL: isolate Latin runs so sentences read right-to-left ---------- */
const LAT="A-Za-z0-9γεπλνμµΩΔΣθαβωφτρσ°²³⁰¹⁴⁵⁶⁷⁸⁹₀₁₂₃₄₅₆₇₈₉ₐₑₒₓₖₘₙₚₛₜ★′";
const LATRE=new RegExp("["+LAT+"]");
function isolate(root){
  const w=document.createTreeWalker(root,NodeFilter.SHOW_TEXT,{acceptNode(n){
    const p=n.parentElement; if(!p||p.closest(".m,.mb,.mono,.ltr,svg,script,style,bdi,[dir=ltr],input,textarea,.tg,.pad,.trj,.seq,.tally,.hist,.gtab,.mat,.pg,.rg,.hist2,.chips2,.pipe,.picked"))return NodeFilter.FILTER_REJECT;
    return LATRE.test(n.nodeValue)?NodeFilter.FILTER_ACCEPT:NodeFilter.FILTER_REJECT}});
  const nodes=[];while(w.nextNode())nodes.push(w.currentNode);
  const TOK="[−+]?[("+LAT+"][\\-−+'’./×=()^,:!%–…~|\\[\\]_&"+LAT+"]*";
  const re=new RegExp(TOK+"(?:[  ]+(?:[=≈<>≤≥≠×→↔∝+−/&]|"+TOK+"))*","g");
  for(const n of nodes){
    const s=n.nodeValue; let last=0,m,frag=null; re.lastIndex=0;
    if(!/[؀-ۿ]/.test(s)){ /* no Arabic at all: keep the whole English phrase as one unit (arrows stay outside) */
      const mm=s.match(/^([\s←→]*)([\s\S]*?)([\s←→]*)$/);
      if(mm[2]&&LATRE.test(mm[2])){const b=document.createElement("bdi");b.textContent=mm[2];n.replaceWith(mm[1],b,mm[3]);continue}
    }
    while((m=re.exec(s))){
      let t=m[0]; while(/[.,:;'’=(\-!→+−×/·\s≈<>≤≥]$/.test(t))t=t.slice(0,-1);
      while((t.match(/\)/g)||[]).length>(t.match(/\(/g)||[]).length&&t.endsWith(")"))t=t.slice(0,-1);
      if(t.startsWith("(")&&(t.match(/\(/g)||[]).length>(t.match(/\)/g)||[]).length)t=t.slice(1),m.index++;
      if(!t||!LATRE.test(t)){continue}
      frag=frag||document.createDocumentFragment();
      frag.append(s.slice(last,m.index)); const b=document.createElement("bdi"); b.textContent=t; frag.append(b); last=m.index+t.length; re.lastIndex=last;
    }
    if(frag){frag.append(s.slice(last));n.replaceWith(frag)}
  }
}

/* ---------- routing ---------- */
function show(id,scroll){
  id=id||"home";
  let view="home",course=null,lec=null;
  if(LEC[id]&&LEC[id].open&&document.getElementById("ch-"+id)){view="lec";lec=LEC[id];course=lec.course}
  else if(COURSES.some(c=>c.id===id)){view="course";course=COURSES.find(c=>c.id===id)}
  else id="home";
  $("#v-home").hidden=view!=="home"; $("#v-course").hidden=view!=="course"; $("#crumbs").hidden=view!=="lec";
  $$(".chapter").forEach(a=>a.hidden=!(view==="lec"&&a.id==="ch-"+id));
  renderTabs(course?course.id:"home");
  if(view==="home")renderHome();
  if(view==="course")renderCourse(course);
  if(view==="lec"){
    const i=course.lec.indexOf(lec),prev=course.lec.slice(0,i).reverse().find(l=>l.open),next=course.lec.slice(i+1).find(l=>l.open);
    $("#crumbs").innerHTML=`<a href="#home">الرئيسية</a><span class="sep">/</span><a href="#${course.id}">${course.name}</a><span class="sep">/</span><b>Lecture ${lec.k.slice(1)} · ${lec.t}</b>`+
      `<span style="margin-inline-start:auto" class="row">${prev?`<a class="btn ghost" href="#${prev.id}" style="text-decoration:none;padding:2px 12px">→ ${prev.k}</a>`:""}${next?`<a class="btn ghost" href="#${next.id}" style="text-decoration:none;padding:2px 12px">${next.k} ←</a>`:""}</span>`;
    isolate($("#crumbs"));
    const art=$("#ch-"+id), toc=art.querySelector(".toc");
    if(!toc.dataset.built){
      toc.innerHTML=`<span class="tt">المشاهد</span>`+$$(".scene",art).map(s=>`<a href="#" data-go="${s.id}">${s.querySelector(".n").textContent} · ${s.dataset.t}</a>`).join("");
      toc.dataset.built=1; isolate(toc);
    }
    const hook=LAZY[id]; if(hook&&!hook.ran){hook.ran=1;hook()}
  }
  store.set("hub-last",id);
  if(scroll)window.scrollTo({top:0,behavior:reduce?"auto":"smooth"});
  spy();
}
const LAZY={};
