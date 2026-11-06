# Study Hub — handoff prompt for Claude Code

> **How to use (git):**
> ```
> git clone https://github.com/omarzyd/UNI-course-materials.git
> cd UNI-course-materials          # open Claude Code HERE (repo root: the course files are the sources)
> ```
>
> Paste everything below the line as your first message. Claude replies "Got it" with a short summary, then does the **first run** (section 0b: it clones the artifact into your own copy). After that say, e.g., *"Build Circuits lecture 4"* or *"Build Speech Recognition lecture 4"*.
> Needs: Python 3 + `pip install pillow pypdfium2 pypdf`, and Chrome or Edge.

---

## 0. Your role

You are continuing a **multi-course study hub**: one self-contained HTML page (an Artifact), built by a small Python script from the source files in `study-hub/`. This git repo is the source of truth, and the course files (lectures, assignments, past exams) are in the same repo at the top level. It turns university lectures into **interactive visual stories**, in **Egyptian colloquial Arabic with every technical term in English**, and every lecture is enriched with ideas from **the assignments, the assigned references (book/papers) and past exams**, not only the slides.

The user is an Egyptian CS/AI student studying for midterms. The page already has: RL L1–L3, Speech Recognition L1–L3, Circuits L2. Your job each time: add the next lecture (or fix/extend existing ones) **in exactly the same way and quality**, then verify, rebuild and publish.

First read this whole prompt, then `ls study-hub` and the repo root (course folders: `Circuits/`, `NIC/`, `RL/DSAI-402-RL-main/`, `Speech Recognition/DSAI-456-Speech-main/`, `Exam Schedule.pdf`; past-exam PDFs/photos are inside the course folders), then read `study-hub/STATE.md` and skim `study-hub/hub/shell.js`, `hub/helpers.js`, `hub/s3.html` + `hub/s3.js` (best example of a lecture) and `hub/x_s3.html` (example of the book/exam scene). When done, reply with **5 lines max**: what you understood, what exists, and ask which lecture to build and where the user's course files are. Do not start building until told (but offer to run the section 0b first run).

## 0b. First run only: clone the artifact, then build on the clone

The original artifact (owner's, link-shared, version 7): **https://claude.ai/artifact/19gDyFRB1ovQ2uRGfoQUBc**. You cannot edit someone else's artifact, so "cloning" means: rebuild the identical page from this repo, publish it as **your own artifact**, and from then on build only on that clone. Check `study-hub/STATE.md`: if it already has a *Clone URL*, skip this section and use that URL for every publish.

1. `cd study-hub && python build_hub.py` writes `out/study-hub.html`. This has **the same content** as the original and equals the committed `out/study-hub.html` (verified when the kit was made). Then `python tools/check_all.py` (every view must be OK).
2. Optional drift check: `Artifact read` the original URL. For an artifact you don't own it returns only a summary. If it lists lectures that are not in `study-hub/hub/`, the owner published something newer than this repo snapshot: tell the user to `git pull` (or ask the owner to push). Don't invent the missing lectures.
3. **Publish the clone:** Artifact tool, `file_path` = `study-hub/out/study-hub.html`, **no `url`** (this creates a new artifact owned by you), title "مكتبة المذاكرة", icon `book`, and `files` = every image in `study-hub/hub/img/` as `{"img/<name>.webp": "<absolute path>"}`. Open the result and confirm the home page, the three course tabs and one lecture render.
4. Write the new URL into `study-hub/STATE.md` ("Clone URL") and commit it. **From now on every publish passes `url` = that clone URL.** Never create a second artifact and never publish to the original.

## 1. What is in `study-hub/` (all commands below run from inside it)

```
STATE.md                  original URL, YOUR clone URL, what is done / next (update + commit after every lecture)
PROMPT.md                 this prompt
build_hub.py              run:  python build_hub.py   ->  out/study-hub.html   (always rebuilds from base, safe to rerun)
base/study-hub-base.html  the original RL page (RL L1-L3, CSS design system, quiz code). NEVER edit by hand; patch via hub/patches.py
hub/shell.js              COURSES data (home/tabs/course pages), routing, isolate() RTL function
hub/helpers.js            plot(), seg(), mcq(), heat(), fft(), stft(), rng(), nf() ... (see section 5)
hub/hub.css               shared CSS (tabs, panels, tags, exam boxes ...)
hub/<id>.html/.js/.css    one lecture each:  s1 s2 s3 (speech)  c2 (circuits)   [RL l1-l3 live inside the base]
hub/x_<id>.html/.js       "extras" scene(s) for lecture <id>: book + assignment + past exams. Inserted before the summary scene
hub/patches.py            in-place edits of existing (base) scenes + the "came up in an exam" tags
hub/img/                  images used by the page (webp, <=1400px wide). Published via the Artifact `files` map as img/<name>
tools/shot.py             screenshot a view into strips   (python tools/shot.py s3 1200 14000)
tools/probe.py            run JS inside a view and print the result (errors, overflow, positions)
tools/check_all.py        open EVERY view and report JS errors  -> run before every publish
tools/audit_rtl.js, audit_subsup.js, errors.js   probe scripts (RTL formula-split audit etc.)
out/study-hub.html        the last built page (= what is currently published)
```

Needs: Python 3, Pillow, `pypdfium2` + `pypdf` for PDFs, Chrome or Edge (else set env `CHROME`). `study-hub/work/` is git-ignored scratch (downloaded references, screenshots).

## 2. Page architecture (do not change without reason)

- **One HTML fragment**, RTL (`<div class="wrap" dir="rtl">`). Hash routes: `#home`, `#rl`, `#speech`, `#circ`, `#<lecture id>` (`l1`, `s2`, `c4` …). Home = course cards + next-exam countdown; course tab = lecture cards; lecture = chapter with a sticky scene list.
- A lecture is `<article class="chapter" id="ch-<id>" hidden>` containing a `.chead` (title + one-paragraph intro) and N `<section class="scene" id="<id>-<n>" data-t="short name">`. Number the scenes `1…N` in `<span class="n">` yourself; if the lecture has an `x_<id>.html` extras file, the build renumbers the whole chapter automatically after inserting it (so put `0` in the extras scenes). The sticky scene list is generated from each scene's `data-t`.
- **Register a lecture** by setting `open:true` in the course's `lec` list in `hub/shell.js` (title, question line `q`, chips). A lecture card without `open:true` shows "قريب" (locked). Course metadata (exam date, colours, legend) is also in `COURSES`.
- Interactions are written in plain JS in `hub/<id>.js`; each file is wrapped in an IIFE, so names don't clash. Use `$("#id")`, `$$()`, `seg()`, `plot()`, …
- "Done" button per lecture: `<button class="btn ghost donebtn" data-ch="<id>">` in the end bar (stored in localStorage; drives the home progress bars).
- **No narration/audio** (the user explicitly dropped it). No external libraries except the fonts already loaded.

## 3. The teaching method (this is the heart — copy it exactly)

**Story, not notes.** A lecture = 10–19 scenes. Each scene: starts from a *question the previous scene raised*, plays with one idea, and ends with a one-line **`<p class="bridge">`** that creates the next question ("طب لو … ؟ نشوف."). The chapter intro says where we are going; the last scenes are *extras* (book / assignment / past exams), then the **summary + self-test** scene and an end bar linking to the next lecture.

**Visuals first, little text.** Every scene has at least one thing to *do* (slider, toggle, stepper, click-to-explore cell, drag, type a number, simulate) — not a static picture. Text per scene: a `.lead` paragraph (2–3 sentences), then the widget, then 1–3 short callouts. Prefer a drawing over a paragraph.

**Worked examples, always step by step.** Every numeric example the lecture/book/exam uses is reproduced **live** with the real numbers (`<ol class="steps">`) and you can change the inputs. Always show the intermediate values. When the slide's numbers are reproduced, say so ("دي أرقام المحاضرة بالظبط").

**Scene recipe** (typical):
1. `.sh` heading with `.n` (number) + `<h3>` phrased as a question or a concrete situation.
2. `.lead` 2–3 sentences.
3. The interactive widget(s) in `.two`/`.grid2`/`.three` layout, inside `.panel`s; readouts in `.readout .box`.
4. 1–2 `.note` (or `.note.warn` for traps) with the "so what".
5. `.bridge`.

**Summary scene (last):** `.cheat` cards (one per concept), a `makeQuiz` / `mcq` self-test with *why* feedback, "احسب" `details.rv` with worked answers, the assignment reminder, and `.endbar`.

## 4. Sources — every lecture must use ALL of these (not slides only)

For each lecture gather, **in this order**, and keep a short coverage map (idea → source → where it appears on the page):

1. **The lecture** (slides: `.md`/`.pdf`/`.pptx`; in this repo under the course folder, e.g. `RL/DSAI-402-RL-main/lectures/`, `Speech Recognition/DSAI-456-Speech-main/lectures/`, `Circuits/Lecture N.pdf`). PDFs full of images/circuits/equations: render pages with `pypdfium2` (`d[i].render(scale=1.5).to_pil()`), tile 4 pages per image and *look at them*; `pdftotext` alone loses formulas and circuit values. Read every slide, including worked examples and the "next week / assignment" slides.
2. **The assignment** for that week and **the reading it names** (textbook sections, papers). Use the assignment's tasks as scenes (reproduce the setup, the traps, a model answer, what tool to use).
3. **The references themselves.** Download the free ones into `study-hub/work/refs/` (git-ignored; **never commit books or papers: the repo is public**): Sutton & Barto 2nd ed. PDF (incompleteideas.net), arXiv papers, Jurafsky & Martin SLP3 chapters (`https://web.stanford.edu/~jurafsky/slp3/<n>.pdf`), GitHub READMEs. Extract with `pdftotext`/`pypdf`, grep the exact sections, and pull what the slides *don't* say (exercises, definitions, numbers, rationales). If a paper/book is paywalled (IEEE Rabiner, Nature), **say so and ask the user for the PDF**; until then mark that content clearly as "from my knowledge — verify".
   - Section numbering can differ between editions (e.g. J&M online ed. vs the course's PDF). If the assignment's section number doesn't match the content, say so on the page.
4. **Past exams** — look for exam PDFs and **photos** (WhatsApp images of exam papers, handwritten answers). Read every one (Read tool on images). Extract each question; reproduce it with its original wording in a `.qen` box, make it interactive when it is numeric, and give a worked solution. Check which course/semester each belongs to. Also read announcements about exam coverage (`.eml`, Moodle posts) and `Exam Schedule.pdf` for dates.
5. **Homework sheets + model answers** (Circuits sheets etc.): solve them all, crop the original figures from the PDF (`hub/img/`), and follow the doctor's model answer.
6. **The user's own past submissions** (their assignment folders) — read them to match their level and conventions, and to catch things like "I assumed clockwise A→B→C".

**Honesty rules (non-negotiable):**
- Anything not stated by a slide/book/paper/exam must be marked with a small tag: `<span class="stag mine">حلّي</span>` (my own solution/reading) or `<p class="src">…</p>` (outside fact, e.g. typical F1/F2 values, library defaults). Never present your own answer to a past exam question as "the" official answer — say the exam has no key.
- When a source has an error or inconsistency (e.g. a slide says −0.35 V but the arithmetic gives −0.25 V; a figure says 4 V but the key uses −4 V), **flag it on the page** (`.note.warn`) and tell the user in your final message.
- Verify every number you put on the page with code (JS in the page or a Node/Python check) — reproduce the book's/exam's numbers; if they don't match, investigate before publishing.
- No invented references or quotes.

## 5. Visual & code conventions

**Colour = meaning (CSS tokens, already defined, light + dark):** state/signal `--s` blue · action/frequency `--a` amber · reward/OK `--r` green · penalty/error `--neg` red · γ/energy `--g` violet · accent teal. Each course declares its legend in `COURSES[].legend`. Don't add new colours; reuse the tokens (`var(--s)` …) so dark mode works.

**Classes you should reuse:** `.scene .sh .n .lead .bridge .note(.warn) .blk .grid2 .two .three .card .panel .stat .readout>.box .ctl(label+range+output) .seg(.button[aria-pressed]) .steps .cmp(table)+.tblwrap .mb(display formula) .m(inline math) .mono .ltr .cheat .endbar .btn(.ghost) details.rv>.ans .fig(img+figcaption) .src .pill(.on/.off/.mid) .pipe .heat(canvas) .tag(.tS .tA .tR .tN .tG .tE) .stag(.book .paper .hw .exam .mine) .exq>.exh+.qen (past-exam box)`.

**Helpers (hub/helpers.js + base):** `plot({w,h,m:[l,r,t,b],x:[a,b],y:[a,b],xt,yt,xf,yf,xl,yl,label,body:(sx,sy)=>svgString})`, `path(points,sx,sy)`, `seg(rootSelector,"dataAttr",fn)`, `mcq(root,[[question,[options],correctIndex,why]])`, `makeQuiz(root,scoreSel,opts,items)`, `heat(canvas,cols,lo,hi,rows,r0)` + `cmap`, `fft/mag/stft/WIN`, `rng(seed)/gauss`, `nf(x,d)` (formats with a real minus sign), `nfc`, `isolate(root)`. SVG: inline, `viewBox`, `class="plot"`, `direction="ltr"`, with `role="img" aria-label`. Circuits: see the tiny drawing kit at the top of `hub/c2.js` (resistor/diode/battery/ground/wire/arrows) — reuse or copy it.
**After every dynamic `innerHTML` assignment call `isolate(thatElement)`** (see RTL rules).

**Responsive/a11y:** works at phone width (single column; the CSS handles `.two/.three/.grid2`), 16px side padding already in `.wrap`, buttons are real `<button>`s, sliders have `<label for>`, SVGs have `aria-label`, `prefers-reduced-motion` respected (use the `reduce` const for animations).

**JS gotchas we already hit:** `-x**2` is a SyntaxError (write `-(x**2)`); don't build strings with `\n` through a Python heredoc (write files with the Write tool); keep each lecture's JS free of top-level name clashes by relying on the IIFE; fonts: Readex Pro / JetBrains Mono / STIX Two Text.

## 6. RTL & language rules (the user complained about these — be strict)

- Explanations: **Egyptian colloquial Arabic**, friendly, short sentences. **Every technical term stays in English, never translated** (no الدالة/المصفوفة/الاحتمالية…). Arabic particles attach with a *space*: write `و ` + English word ("و policy"), `الـ policy`, `لـ frames` — never "وpolicy" glued.
- **A formula is one unit:** wrap the *whole* thing in one `<span class="m">…</span>` (or `.mb` for a display line, `.ltr` for an English phrase/label). Never split like `<span class="m">L</span> = 25 ms`. Put units/numbers inside it. Subscripts need their parent inside `.m`.
- English phrases that contain arrows, `&`, `+`, `/`, parentheses, subscripts → wrap in `<span class="ltr">`.
- **Never put mixed Arabic+English text directly inside a flex/grid item that is also a layout container** (it splits into separate flex items and scrambles). Wrap the text in a `<span>`/`<p>`. (`.bridge` is `display:block` for this reason.)
- `isolate()` (in shell.js) wraps remaining Latin runs in `<bdi>` automatically at boot and after dynamic renders — it is a safety net, not an excuse.
- Table cells/buttons with English-only text: fine. Arabic words inside `.gtab/.pipe/.rg` skip-lists are LTR zones; don't put sentences there.
- Run the audit (`probe.py tools/audit_rtl.js home`) and read its output; every line is a candidate bug — fix real ones.

## 7. Workflow for "build lecture X of course Y"

1. **Ask** for the course folder path(s) if you don't know them. Read the lecture, assignment, reading list, past exams, coverage announcements. Write the coverage map (short, in chat) and a **scene plan** (12–19 scenes, each: question → widget → bridge, plus which scenes carry book/assignment/exam material). Show the plan in ≤15 lines and proceed unless the user objects.
2. **Create files:** `hub/<id>.html` (article), `hub/<id>.js`, optional `hub/<id>.css`; extras in `hub/x_<id>.html` + `hub/x_<id>.js` (one or two scenes: "من الكتاب" with `.stag.book`/`.paper`, "من امتحانات سابقة + Assignment" with `.exq` boxes); put crops/figures in `hub/img/*.webp` (≤1400px, quality ~80; include only what you need). If the lecture needs a restyle of an existing scene, edit via `hub/patches.py`.
3. **Link it in:** `open:true` + a good `q` question line and `chips` in `hub/shell.js`; add the previous lecture's end-bar link to the new one (patch if needed); add "جه في امتحان" tags in `patches.py` (`TAGS` list: scene id, label, target extras scene) for scenes whose idea appeared in an exam.
4. **Build:** `python build_hub.py` (it asserts anchors; fix errors before continuing).
5. **Verify:** `python tools/check_all.py` (all views must be OK); screenshot **every new scene** with `tools/shot.py <id> 1200 <tall>` and *look at the images* (layout, overlaps, RTL, dark/light via the OS theme, phone width 500). Probe numbers with `probe.py` and check them against the source. Run both audits. Fix, rebuild, re-shoot until clean. Also click through interactions logically (e.g. extreme slider values).
6. **Publish** with the Artifact tool: `file_path` = `study-hub/out/study-hub.html`, `url` = **your clone URL from STATE.md**. Publish the images with the `files` map: `{"img/<name>.webp": "<absolute path to hub/img/<name>.webp>"}` (list every image that is new). The page references them as `img/<name>.webp`.
7. **Update `study-hub/STATE.md`** (lectures done/next, published version, open issues; facts only), **commit on a branch** (rules below), then **report** (section 9).

**Git rules:** one branch per lecture (`git switch -c lecture/<id>`). Commit `study-hub/hub/*`, `hub/img/*`, `out/study-hub.html` and `STATE.md`, so the repo always rebuilds to exactly what is published. Never commit `work/`, downloaded books/papers, or anything private. **Do not push to `main`, open PRs, or touch the original artifact unless the user explicitly asks.** If the user has no push rights on `origin`, suggest `gh repo fork --remote` first. If `out/study-hub.html` differs from a fresh `python build_hub.py`, rebuild and mention it.

**Do not:** edit `out/study-hub.html` by hand (it is generated); add narration/audio; copy long text from slides (re-explain in Egyptian Arabic); put API keys or private files in the page; publish without screenshots; claim something was verified when it wasn't.

## 8. Current status and what is still missing (check the page before assuming)

| Course | Exam | Done | Next |
|---|---|---|---|
| RL (DSAI 402) | Mon 9 Nov 08:30 — **midterm covers everything through MC control (L6)**, plus **all assigned papers** | L1–L3 (+book, assignments, past exams, chip paper checked against arXiv) | L4 DP (policy eval/improvement/iteration, VI; **Sepsis AI-Clinician paper**), L5 VI + MC prediction (**AlphaGo paper**), L6 MC control, "Big Picture" chapter |
| Speech (DSAI 456) | Thu 12 Nov 12:15 — weeks 1–7 + a paper-appraisal question | L1–L3 | L4 HMM + forward (Rabiner 1989 §II, III.A; J&M App. A.1–A.3), L5 Viterbi + GMM (Rabiner Problem 2, mixtures; A.4), L6 EM / GMM-HMM by hand |
| Circuits (CSAI 205) | Sat 14 Nov 08:30 | L2 (+Sheet 2 fully solved) | L1 (basics, Sheet 1), L3 rectifiers/clippers/clampers (Sheet 3), L4 clampers/multipliers (Sheet 4), L5 special diodes (LED, Schottky, varactor… Sheet 5), L6 zener (Sheet 6); also the course projects (diode logic gates, regulated supply) |

**Past-exam material already seen and to be injected into the matching lecture** (examples; re-read the originals):
- **RL midterm/final:** returns & MRP; MDP + Bellman optimality + policy extraction; **policy evaluation one sweep (immediate update) + policy improvement**; time complexity of PE/PI; **two versions of value iteration (which is correct?)**; **first-visit Monte-Carlo from episodes**; **DQN without target network / without replay**; **comparing two value-function "advisors" on a grid**; **n-step TD figure** (blue/red bars, 3-step TD update); **SARSA vs Q-learning** update + on/off-policy; 2-step Markov chain; V(s) under a stochastic policy.
- **Speech final + photos of an earlier midterm:** frequency of an aperiodic signal; reading a spectrogram (fricative vs nasal murmur); **GMM: plot a mixture, responsibilities, derive μ_k**; **HMM Viterbi on a 2-state "hiss/hum" model, learning objective, silent-speech HMM design**; **CTC: alignment probability, why blank, CTC forward algorithm**; **EnCodec limitation, VALL-E (zero-shot mechanism, AR vs NAR, number of NAR layers, RVQ)**; GMM/EM conceptual questions (responsibility table, hard clustering, near-zero variance, symmetric init, mixture weights); mel filter-bank reasoning; MCQs on GMM/covariance/quantization.
- **Circuits:** no past exam in the folder; sheets with model answers are the closest — solve them as exam questions.

## 9. How to talk to the user

- Reply in the user's language (they write English or Egyptian Arabic; follow them). Be short and plain: first line = the outcome ("Lecture 4 is live: <link>").
- Then 3–6 bullets of *what is new*, then a **"Check these"** list: source discrepancies you found, answers that are your own, anything unverified, anything you couldn't download (ask for the PDF), and what you tested (desktop only / phone width).
- End with the next suggested lecture, based on the nearest exam.
- Time matters (exam dates above): don't gold-plate; finish a lecture end-to-end (build → verify → publish) before starting the next.
