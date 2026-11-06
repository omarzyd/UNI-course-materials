"""Build out/study-hub.html = base/study-hub-base.html (RL L1-L3 + design system) + everything in hub/.
Always starts from the base file, so it is safe to rerun. Usage: python build_hub.py"""
import os, re, sys
HERE = os.path.dirname(os.path.abspath(__file__)); HUB = os.path.join(HERE, "hub")
h = open(os.path.join(HERE, "base", "study-hub-base.html"), encoding="utf-8").read()
rd = lambda n: open(os.path.join(HUB, n), encoding="utf-8").read()
import glob
LECS = sorted((os.path.basename(f)[:-5] for f in glob.glob(os.path.join(HUB, "*.html")) if re.fullmatch(r"[a-z]{1,2}\d+", os.path.basename(f)[:-5])), key=lambda i: ("lsc".find(i[0]) if i[0] in "lsc" else 9, int(re.sub(r"\D", "", i))))  # lecture ids like s4, c3, l4; order: RL, Speech, Circuits

def cut(a, b, new, keep_b=True):
    """replace text from anchor a up to anchor b (b kept unless keep_b False)"""
    global h
    i = h.index(a); j = h.index(b, i)
    h = h[:i] + new + (h[j:] if keep_b else h[j + len(b):])

def rep(old, new):
    global h
    assert old in h, "anchor missing: " + old[:70]
    h = h.replace(old, new, 1)

rep("<title>حكاية RL</title>", "<title>مكتبة المذاكرة</title>")
css = rd("hub.css") + "".join(rd(x + ".css") for x in LECS if os.path.exists(os.path.join(HUB, x + ".css")))
cut("/* narration */", "@media (max-width:860px){\n  .chapter", css + "\n")

import html as _html
# Small burgundy dedication pill, top-left of the home page. Default text is in the repo (so a clone shows it).
# Override: environment variable HUB_DEDICATION="some text"; set it to empty to build WITHOUT the badge.
DEDICATION = os.environ.get("HUB_DEDICATION", "made for my love").strip()
DEDICATION_HTML = ('<div class="madefor" id="madefor" dir="ltr" hidden><span class="mf-heart" aria-hidden="true">♥</span>' + _html.escape(DEDICATION) + '</div>\n') if DEDICATION else ""
OUT_PATH = os.environ.get("HUB_OUT") or os.path.join(HERE, "out", "study-hub.html")  # HUB_OUT=<file> writes somewhere else (e.g. a private variant)

HEADER = DEDICATION_HTML + """<header class="top">
  <a class="brand" href="#home"><h1>مكتبة <span class="loopmark">المذاكرة</span></h1><p>كل كورس ليه tab، وكل lecture حكاية: بتبدأ بسؤال، وكل مشهد بيبني على اللي قبله.</p></a>
</header>
<nav class="tabs" id="tabs" aria-label="الكورسات"></nav>

<section id="v-home" hidden>
  <div class="hero">
    <div class="intro"><h2>هتذاكر إيه النهارده؟</h2><p>اختار الكورس من الـ tabs اللي فوق أو من الكروت اللي تحت. كل lecture فيها رسومات تلعب بيها، وأمثلة محلولة خطوة بخطوة، وأسئلة تختبر بيها نفسك في الآخر.</p></div>
    <div class="next" id="nextExam"></div>
  </div>
  <div class="courses" id="courseCards"></div>
</section>
<section id="v-course" hidden></section>
<nav class="crumbs" id="crumbs" aria-label="إنت فين" hidden></nav>
"""
cut('<header class="top">', '<nav class="map" id="map" aria-label="الـ chapters"></nav>', HEADER, keep_b=False)

arts = "".join("\n<!-- ======================= " + x.upper() + " ======================= -->\n" + rd(x + ".html") for x in LECS)
cut('\n</div>\n\n<div class="player"', '<audio id="aud" preload="none"></audio>', "\n" + arts + "\n</div>\n", keep_b=False)

cut("/* ---------- chapter map ---------- */", 'document.addEventListener("click",e=>{const a=e.target.closest("[data-go]")', rd("shell.js") + "\n" + rd("helpers.js") + "\n")
rep("renderMap(b.dataset.ch)", "refreshNav()")
js = "".join("\n/* ==================== " + x.upper() + " ==================== */\n(()=>{\n" + rd(x + ".js") + "\n})();\n" for x in LECS)
cut("/* ---------- narration: pre-recorded", "/* ---------- boot ---------- */", js + "\n")
rep('const start=location.hash.slice(1)||store.get("rl-story-last","l1");', 'const start=location.hash.slice(1)||"home";')

# ---- extra scenes (book / assignment / past exams) inserted before each chapter's summary scene ----
import glob
for xf in sorted(glob.glob(os.path.join(HUB, "x_*.html"))):
    cid = os.path.basename(xf)[2:-5]
    a = h.index('id="ch-' + cid + '"'); e = h.index("</article>", a)
    last = h.rindex('<section class="scene"', a, e)
    h = h[:last] + open(xf, encoding="utf-8").read() + "\n    " + h[last:]
    e = h.index("</article>", a); seg_ = h[a:e]; k = [0]
    def ren(m):
        k[0] += 1; return m.group(1) + str(k[0]) + "</span>"
    seg_ = re.sub(r'(<div class="sh"><span class="n">)\d+</span>', ren, seg_)
    h = h[:a] + seg_ + h[e:]
NL = "\n"
xjs = "".join(NL + "/* ==== extra " + os.path.basename(f) + " ==== */" + NL + "(()=>{" + NL + open(f, encoding="utf-8").read() + NL + "})();" + NL for f in sorted(glob.glob(os.path.join(HUB, "x_*.js"))))
rep("/* ---------- boot ---------- */", xjs + NL + "/* ---------- boot ---------- */")
xp = os.path.join(HUB, "patches.py")
if os.path.exists(xp):
    ns = {"h": h}; exec(open(xp, encoding="utf-8").read(), ns); h = ns["h"]

for bad in ["NARR", "CUES", "#aud", "renderMap(", "rl-story-last", 'id="map"']:
    assert bad not in h, "leftover: " + bad
os.makedirs(os.path.dirname(OUT_PATH), exist_ok=True)
NL = chr(10)
open(OUT_PATH, "w", encoding="utf-8", newline=NL).write(h)  # LF everywhere, same bytes on every OS
print("ok", len(h) // 1024, "KB, lectures:", LECS)
