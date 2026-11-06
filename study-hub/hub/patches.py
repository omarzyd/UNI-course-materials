# In-place improvements to existing RL scenes (run by build_hub.py with h = page html)
def P(old, new):
    global h
    assert old in h, "patch anchor missing: " + old[:80]
    h = h.replace(old, new, 1)

# L3 scene 14: chip paper answers, now checked against the paper text (arXiv 2004.10746)
P('<summary>إجابات مقترحة (من فهمي للـ paper، راجع التفاصيل معاه)</summary>',
  '<summary>إجابات مقترحة (اتراجعت مع نص الـ paper، نسخة arXiv 2020)</summary>')
P('الـ canvas بالـ blocks اللي اتحطت لحد دلوقتي + الـ netlist كـ graph (بيتحوّل لـ embeddings بـ graph neural network) + الـ block اللي دوره.</p>',
  'concatenation لـ: graph embedding للـ netlist كلها (اللي اتحط واللي لسه)، وembedding للـ macro اللي دوره، وmetadata عن الـ netlist والتكنولوجيا، و<b>mask</b> بيقول أنهي خانات في الـ grid ينفع تحط فيها.</p>')
P('تختار مربع في الـ grid بتاع الـ canvas وتحط فيه الـ block الحالي. الـ blocks بتتحط واحد ورا التاني.</p>',
  'تختار خانة من grid مقاسه <span class="m">m × n</span> (كام ألف خانة) وتحط فيها الـ macro رقم t. الخانات اللي هتكسر الـ density أو هتعمل overlap <b>بتتشال بالـ mask</b> قبل الاختيار. والـ macros بتترتب من الأكبر للأصغر (مع topological sort)، عشان الكبار يلاقوا مكان.</p>')
P('<p><b>3.</b> لما كل الـ blocks تتحط.</p>',
  '<p><b>3.</b> لما كل الـ macros تتحط، يعني <span class="m">T</span> = عدد الـ macros. وبعدها الـ standard cells (متجمّعة في clusters بـ hMETIS) بتتحط بطريقة force-directed، برّه الـ RL.</p>')
P('صفر طول الـ episode، وفي الآخر رقم سالب من طول الأسلاك والـ congestion (يعني كل ما كانوا أقل كان أحسن).</p>',
  'صفر لكل <span class="m">t &lt; T</span>. وفي الآخر: <span class="m">R = −(Wirelength + λ · Congestion)</span>. الـ wirelength هو الـ HPWL، والـ congestion هو متوسط أعلى 10% خانات زحمة. والـ density مش في الـ reward: معمولة <b>hard constraint</b> بالـ mask. يعني reward متأخر خالص (sparse)، زي مثال الـ 500 move. والتدريب بـ PPO.</p>')
P('جوه الـ MDP: وضع الـ macros. برّه: وضع باقي الـ cells والـ routing والتحقق، بأدوات تانية.</p>',
  'جوه الـ MDP: وضع الـ macros بس. برّه: الـ standard cells (force-directed)، والـ legalization، والتقييم النهائي بأدوات EDA تجارية.</p>')
P('محتاج بديل. الهدف الحقيقي (power, performance, area) بيتقاس بعد flow كامل بياخد وقت طويل، فاستخدموا proxy سريع من طول الأسلاك والـ congestion.</p>',
  'محتاج بديل. الهدف الحقيقي (PPA) بيطلع من أدوات EDA بتاخد ساعات، وساعات يوم كامل، للتقييم الواحد. والـ RL محتاج مئات الآلاف من الـ examples، فاستخدموا proxy بيتحسب في milliseconds ومرتبط إيجابياً بالهدف الحقيقي (الـ wirelength مرتبط بالـ power والـ timing).</p>')

# L3 scene 14: exam-style follow-up
P('''        <p><b>9.</b> إن الـ proxy فعلاً بيتناسب مع النتيجة الحقيقية بعد الـ flow الكامل، وإن النتيجة متكررة على chips و seeds كتير، ومقارنتها بمهندسين و baselines قوية.</p>
      </div></details>''','''        <p><b>9.</b> إن الـ proxy فعلاً بيتناسب مع النتيجة الحقيقية بعد الـ flow الكامل، وإن النتيجة متكررة على chips و seeds كتير، ومقارنتها بمهندسين و baselines قوية.</p>
      </div></details>
      <details class="rv"><summary><span class="stag exam">أسئلة بأسلوب الامتحان</span> «خد موقف» على الـ formulation</summary><div class="ans">
        <p><b>ليه mask بدل reward سالب للـ overlap؟</b> الـ mask بيشيل الـ actions المستحيلة خالص، فالـ search space بيصغر، والـ agent ما بيضيّعش episodes بيتعلم إن الـ overlap وحش. وكمان الـ reward الأخير بيفضل نضيف من غير penalties متخلطة.</p>
        <p><b>إيه مشكلة إن الـ reward في الآخر بس؟</b> الـ credit assignment صعب: الـ agent مش عارف أنهي macro بالظبط اللي بوّظ النتيجة. وده من «أخطاء شائعة» (reward متأخر خالص). والـ paper بيعوّض ده بالتدريب على chips كتير، وبـ encoder اتدرب supervised على توقّع جودة الـ placement.</p>
        <p><b>ليه ترتيب ثابت للـ macros، مش جزء من الـ action؟</b> لو الـ agent يختار كمان «مين اللي يتحط بعد كده»، الـ action space هيكبر جداً. والترتيب الثابت (الأكبر الأول) طلع شغال كويس. لو عايز تاخد موقف: الترتيب ده افتراض ممكن يحدّ من الحل الأمثل.</p>
        <p><b>الـ transition deterministic، طب فين الـ stochasticity؟</b> في الـ policy نفسها أثناء التدريب، وفي إن الـ netlist بتتغير من chip للتانية. الـ environment نفسه deterministic.</p>
      </div></details>''')

# L3 scene 8: R_max label split by <sub>
P('$("#gbMsg").innerHTML=`لو R<sub>max</sub> = 1:', '$("#gbMsg").innerHTML=`لو <span class="ltr">R<sub>max</sub> = 1</span>:')

# "came up in an exam" tags on the original scenes, jumping to the solved question
import re as _re
TAGS=[("l2-5","Midterm 2025 · Q1","l2-x2"),("l2-8","Final 2026 · Q6","l2-x2"),("l3-4","Final 2026 · Q3","l3-x2"),("l3-10","Final 2026 · Q7","l3-x2"),
 ("l3-11","Midterm 2025 · Q2","l3-x2"),("l3-3","S&B gridworld","l3-x1"),("s1-5","مثال الكتاب 76.9%","s1-x1"),("s2-6","Midterm · Q1(e)","s2-x2"),
 ("s2-12","Final 2026 · Q1(b)","s2-x2"),("s3-3","Final 2026 · Q1(a)","s2-x2"),("s3-12","Midterm · Q3(a)","s3-x2"),("c2-12","Sheet 2 · Q2–Q5","c2-x1"),
 ("c2-14","Sheet 2 · Q6–Q8","c2-x1"),("c2-15","Sheet 2 · Q9–Q10","c2-x1")]
for sid,lab,tgt in TAGS:
    i=h.index('id="'+sid+'"'); j=h.index('</h3>',i)+5
    h=h[:j]+'<a class="stag exam xtag" href="#" data-go="'+tgt+'" title="روح للسؤال المحلول">جه في امتحان · '+lab+'</a>'+h[j:]
