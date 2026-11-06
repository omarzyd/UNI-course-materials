/* S2 extras: consonant chart, mu-law, exam MCQs */
const PL=["bilabial","labiodental","dental","alveolar","palato-alveolar","palatal","velar","glottal"],MN=["stop","nasal","fricative","affricate","approximant","tap"];
const CC={"stop|bilabial":["p b","possum, bear"],"stop|alveolar":["t d","tiger, dog"],"stop|velar":["k g","kitten, goose"],"stop|glottal":["q","glottal stop"],
 "nasal|bilabial":["m","marmot"],"nasal|alveolar":["n","nest"],"nasal|velar":["ng","baking"],
 "fricative|labiodental":["f v","fossil, vase"],"fricative|dental":["th dh","thick, those"],"fricative|alveolar":["s z","sea, zoo"],"fricative|palato-alveolar":["sh zh","shrimp, beige"],"fricative|glottal":["h","hat"],
 "affricate|palato-alveolar":["ch jh","chicken, giraffe"],"approximant|bilabial":["w","wood"],"approximant|alveolar":["l r","like, red"],"approximant|palatal":["y","yak"],"tap|alveolar":["dx","water (US)"]};
const PLD={bilabial:"الشفتين مع بعض",labiodental:"السنان اللي فوق على الشفة اللي تحت",dental:"اللسان بين السنان",alveolar:"طرف اللسان على اللثة اللي ورا السنان",["palato-alveolar"]:"اللسان ورا اللثة شوية",palatal:"اللسان قريب من سقف البُق",velar:"آخر اللسان على الـ velum (سقف البُق الطري)",glottal:"عند الـ glottis في الزور"};
const MND={stop:"قفلة كاملة وبعدين فتحة فجأة (burst)",nasal:"البُق مقفول والهوا من المناخير، وطاقته واطية (nasal murmur)",fricative:"تضييق بيعمل turbulence، يعني hiss",affricate:"stop وبعده fricative",approximant:"تضييق خفيف، من غير turbulence",tap:"لمسة سريعة باللسان"};
let csel="fricative|alveolar";
function xcons(){
  $("#xcons").innerHTML=`<div class="tblwrap"><table class="gtab" style="min-width:640px"><tr><th></th>${PL.map(p=>`<th>${p}</th>`).join("")}</tr>${MN.map(m=>`<tr><th>${m}</th>${PL.map(p=>{const k=m+"|"+p,c=CC[k];return `<td>${c?`<button type="button" data-c="${k}" style="border:1px solid ${k===csel?"var(--accent)":"var(--line)"};background:${k===csel?"color-mix(in srgb,var(--accent) 18%,var(--surface))":"var(--surface)"};border-radius:7px;padding:2px 8px;font:inherit;font-weight:600">${c[0]}</button>`:""}</td>`}).join("")}</tr>`).join("")}</table></div>`;
  const [m,p]=csel.split("|"),c=CC[csel];
  $("#xconsOut").innerHTML=`<b class="ltr">[${c[0]}]</b> · <span class="ltr">${c[1]}</span><ul class="clean small" style="margin-top:6px"><li><b>${p}</b>: ${PLD[p]}.</li><li><b>${m}</b>: ${MND[m]}.</li></ul>`;
  isolate($("#xconsOut"));
}
$("#xcons").addEventListener("click",e=>{const b=e.target.closest("button[data-c]");if(b){csel=b.dataset.c;xcons()}});xcons();

/* mu-law curve */
(function(){const mu=255,F=x=>Math.sign(x)*Math.log(1+mu*Math.abs(x))/Math.log(1+mu),p=[],l=[];for(let i=-100;i<=100;i++){const x=i/100;p.push([x,F(x)]);l.push([x,x])}
  $("#xmulaw").innerHTML=plot({w:460,h:220,m:[36,10,12,26],x:[-1,1],y:[-1.05,1.05],yt:[-1,0,1],xt:[-1,-.5,0,.5,1],xl:"input x",yl:"F(x)",label:"mu-law curve",body:(sx,sy)=>`<path d="${path(l,sx,sy)}" style="fill:none;stroke:var(--muted);stroke-dasharray:4 4"/><path d="${path(p,sx,sy)}" style="fill:none;stroke:var(--g);stroke-width:2.4"/><text x="${sx(.08)}" y="${sy(-.55)}" class="tk" style="fill:var(--g)">small values get most levels</text>`});
  $("#xmulaw").style.maxWidth="520px"})();

mcq("#xspq",[["Most likely spoken words?",["A. MAM NAH","B. SAT MOM","C. Nah SAP","D. SAP SAT"],1,"أول كلمة فيها hiss عالي في الأول و burst في الآخر (SAT)، والتانية فيها nasal murmur واطي في الأول والآخر (MOM)."]]);
mcq("#xmcq2",[
 ["A spectrogram is most accurately described as a representation of which domain?",["A. Time-Frequency","B. Purely Frequency","C. Purely Time","D. Phase-Amplitude"],0,"الـ x وقت، والـ y frequency، واللون طاقة. يعني spectrum لكل frame جنب بعض."],
 ["During analog-to-digital conversion, what is the core function of quantization?",["A. Filter out high-frequency noise","B. Map continuous amplitude values into a set of discrete, finite levels","C. Shift the signal from time to frequency domain","D. Set the number of samples captured per second"],1,"الـ D ده الـ sampling (الوقت). الـ quantization على محور الـ amplitude. وفي الصور، الإجابة دي كانت متعلّمة غلط، فخد بالك من الفخ."]
]);
