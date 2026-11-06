/* L1 extra: is my problem RL? */
const XQ=[["lab","عندك الإجابة الصح (label) لكل input؟"],["rep","القرار بيتكرر كتير؟"],["fut","الـ action النهارده بيغيّر الـ state بكرة؟"],["rew","تقدر تكتب reward بتثق فيه؟"],["safe","الغلط رخيص، أو عندك simulator أو data قديمة؟"]];
const XS={lab:false,rep:true,fut:true,rew:true,safe:true};
const XEX={lab:false,rep:true,fut:true,rew:true,safe:true};
function x1(){
  let v;
  if(XS.lab)v=["Supervised learning","var(--s)","عندك الإجابة الصح، فمش محتاج تجرّب. درّب classifier أو regressor."];
  else if(!XS.rep)v=["مش RL","var(--muted)","قرار مرة واحدة ما بيتعلمش منه حاجة. ممكن optimization عادي."];
  else if(!XS.rew)v=["مش جاهز لسه","var(--a)","من غير reward بتثق فيه، الـ agent هيعمل optimize لحاجة غلط. حدّد الـ reward الأول."];
  else if(!XS.fut)v=["Contextual bandit","var(--g)","القرار بيتكرر وفيه feedback، بس مش بيغيّر اللي جاي. زي paper الأخبار في Lecture 2."];
  else if(!XS.safe)v=["RL، بس محتاج حذر","var(--a)","الغلط غالي: محتاج offline data أو simulator، زي معظم التطبيقات اللي في الـ survey."];
  else v=["Full RL","var(--r)","القرار بيتكرر، وبيأثر على المستقبل، وفيه reward، والتجربة ممكنة. ده RL."];
  $("#x1help").innerHTML=`<div class="grid2">${XQ.map(([k,q])=>`<div class="row" style="justify-content:space-between;gap:8px"><span class="small">${q}</span><span class="seg"><button type="button" data-x="${k}" data-v="1" aria-pressed="${XS[k]}">آه</button><button type="button" data-x="${k}" data-v="0" aria-pressed="${!XS[k]}">لأ</button></span></div>`).join("")}</div>
    <div class="note" style="margin-top:10px;border-color:${v[1]}"><b style="color:${v[1]}">${v[0]}</b>${v[2]}</div>
    <p class="hint">المثال المبدئي: الـ thermostat من Lecture 2. غيّر الإجابات وشوف الحكم بيتغير إزاي.</p>`;
  isolate($("#x1help"));
}
$("#x1help").addEventListener("click",e=>{const b=e.target.closest("button[data-x]");if(!b)return;XS[b.dataset.x]=b.dataset.v==="1";x1()});x1();
