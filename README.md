# HS2 · Paper Sim — Module 3 (work in progress · live, unlisted: https://jeremyspm.github.io/hs2-test3/)

Same pipeline as [hs2-test2](../hs2-test2) (ported from its files at `255d89b`, the only copy that reads his single-file Canvas saves).
Module 3 = reproduction · genetics · special senses · light & sound. Cold-start notes: `../HS2-M3-PAPER-SIM-HANDOFF.md`.

## State on 21 Sep 2026

- `node bind-images.mjs` then `node build.mjs` → **402 questions ship, 3 held** (21 Sep 2026, evening), from his 23 graded quiz
  pages (`../_inbox/HS2 Module 3 Capture`, bank `../hs2-anki/m3/questions.json`). 82 of her figures ship.
- **Her own model answers**: `extract-her-answers.mjs` lifts the `quiz_comment` block of every essay, word for word, into
  `content/her-answers.json` (26 of 27 essays). They ship labelled as HERS. Nothing the tool wrote is in here yet.
- `NO_IMAGE_OK` in `build.mjs`: 18 rows, each read by eye. 15 are a video thumbnail or decoration that never loaded; 3 are figures
  **gone from Canvas itself** (he re-opened them: access denied / dead link) on questions every part of which is named in their own
  words: 211071 the vasectomy drop-downs, 211120 noise-induced hearing loss, 211121 the eye-defect match. A row whose question now
  ships its figure fails the build (9 such rows went when their figures came back).
- Held, with the reason on each row of `held.json` (3): the ovarian/uterine cycle essay (she posted no answer) and her two self-mark
  notices. Nothing is held for a figure or a parse any more.
- Two false holds fixed 21 Sep, which released 26 questions: the image binder only read `src="…"` and his saves write `src=data:…`
  with NO quotes (28 real figures were being ignored); and "letter-only options" meant "shorter than 3 characters", which in genetics
  catches real answers ("46", "Hh", "AO", "LH"). A bare letter is now one character A-H, and only if EVERY option is one.
  A placeholder (inline non-base64 SVG, or `data:,`) is rejected, so a question never ships with a blank picture.

## Three ways a figure went "missing" that were the BUILD's fault (all fixed 21 Sep 2026)

Nothing needs re-saving. Every "missing" figure that still exists on Canvas was already in his saved pages:
1. his saves write `src=data:…` with NO quote marks and the binder only read quoted ones (28 figures);
2. **SingleFile keeps a picture the page uses more than once in a CSS variable** — `--sf-img-N: url("data:…")` in a style block — and
   leaves the `<img>` holding an empty SVG plus `background-image:var(--sf-img-N)`. `inlineSfImages()` in `stem-html.mjs` puts the
   real data URI back at read time, for both `bind-images.mjs` and `build.mjs` (13 figures, 10 questions);
3. "letter-only options" meant "shorter than 3 characters" (see above);
4. (evening) SingleFile writes attributes in any order: `<img style="…var(--sf-img-24)…" src='…'>` (211086 Q11, the pedigree the
   handoff called gone from Canvas) was missed by a src-first regex. `inlineSfImages` v2 cuts each tag out with a quote-aware scan.
hs2-test2 and hs2-paper-m1 now carry the same reader, byte for byte (M1 got 14 figures back; hs2-test2 had nothing left to find).

## Three more traps found 21 Sep 2026 (evening), all fixed

- **A stray dot marked the answer (24 live questions).** An answer whose Canvas text is under 3 characters is read from its title:
  a wrong "Ee" has title "Ee." (used, dot and all), the right one "ee. This was the correct answer." cleaned to "ee" (bare). Every
  wrong option ended in "." and the key did not. `cleanTitle` now strips both of Canvas's marks and that dot, and a gate fails the
  build if an option or key ever carries either (it failed on all 24 before the fix).
- **YouTube channel logos shipped as figures (3).** SingleFile keeps an embedded player's whole page in `<iframe srcdoc="…">` with
  its tags literal, so once unquoted `src=data:` was read, the logo inside became a "figure" (211011 ear wax, 210994 fertilisation,
  211123 afterimage). `dropIframeDocs()` empties every srcdoc before a capture is read; the tag keeps its title.
- **The shared parser dropped a correct mark (1).** `hs2-test1/audit/parse-quizzes.mjs` skipped a duplicate option BEFORE reading
  its `correct_answer` class; her guinea-pig drop-down (211087 #20) offers "h" twice and the correct copy was the second. Re-parsing
  all three modules with the fix changed only that question.
- The empty-stem pedigree (211091 #19) has its question printed on her figure; an authored-stems entry keyed on the figure file copies
  the words in and the page says where they come from. Her one short-answer question (211121 #14, "…known as an [].") ships as a
  typed blank at her "[]". The eye-parts match (211011 #2) is only a video on Canvas, so its one question line is the tool's and says so.

- Checked at 375 px: renders, no console errors, no horizontal scroll, page is `noindex`.

## The focus checklist (21 Sep 2026)

37 rows, and every row is one of HER numbered criteria (Continuous Tests and Exam Focus Points, `Science 2 Detailed Content.docx`:
Genetics 1-9, Special senses 1-13, Reproductive 1-14) — `content/focus.js` says which. `content/topics.js` puts every shipped question
on exactly one row (rules over the stem and the CORRECT answer, then all 358 read in their groups, 98 moved by hand). The build counts
each row (questions, marks, quizzes, written), sets tiers 1-3 from the marks, and fails on a question with no row. Tier 0 is her own
words only: "PEDIGREE CHARTS WILL BE TESTED IN TEST 3". `done / ask / cap` are the tool's reading and say so on the page.
`node tag-topics.mjs [row|--none|--counts]` prints a row's questions for reading. When she posts a Test 3 focus list, a helpline or
revision sessions: move what she names to tier 0 and add the badge, as hs2-test2 does.

## Explain row (built 2026-09-21)

Same pipeline and gates as hs2-test2 and hs2-paper-m1. The scripts and my strike lists live in the estate's `scripts/text-refs`
and `scripts/video-captions` (branch `claude/test2-sim-prep-20a80f`); the work dirs are `_captions/work/refs-m3`, `vid-m3`,
`vid-m3-rescue`. No reference ships on a keyword or title match: each was judged from its own text, its quote re-found in the
source by a script, a second pass tried to refute it, and then I read every survivor and struck the weak ones, reasons recorded.
- `content/ref-matches.json` — 238 questions carry a judged reference: 131 her slide images, 125 her prose (learning pages,
  Anatomy Monday 12-14, the lab workbook, her help-board posts), 74 course files (decks and notes by other staff, shown as 📄 Course
  file), 147 Patton ch 1-48 (26 Patton-only). `units.py --module m3` → retrieve → judge (DeepSeek) → gate → refute → gate →
  `merge.py --strike strike-m3.json` (56 struck).
- `content/part-refs.json` — 328 parts referenced over 72 multi-part questions (`parts.py --per 3` → judge_parts → gate_parts;
  17 struck, `strike-parts-m3.json`).
- `img/slides/` — 77 of her slides as 960px JPGs (`compress-slides.py` over `slides-todo.json`, from the renders in
  `_inbox/HS2 Module 3 Capture/slides/`). A question with a figure of its own gets no slide image (no second figure).
- `content/video-matches.json` — 121 questions, 174 matches over 51 videos: match_transcripts → judge_flash → gate → refute →
  gate, then a rescue round over the 292 questions round 1 left bare. Every surviving match read by hand: 8 + 21 struck
  (`strike-video-m3.json`, `strike-video-m3-rescue.json`, applied with `strike-video.py`).
- `content/dmdm-all.json` — the Module 3 shelf, 67 videos (52 Dr Matt & Dr Mike + 15 gap-fillers from Ninja Nerd, Armando,
  AnatomyZone). Modules 1 and 2 inherited a shelf from a module hub; Module 3 has none, so `shelf-m3.py` declares it: every channel
  video whose title is on a Module 3 topic, plus every matched video. It fails if a matched video is left off.
- The playlist page is `hub/hs2-m3-videos.html` (jeremyspm.github.io/hs2-m3-videos.html), generated by
  `hub/hs2-m3-videos.build.mjs` from this repo's `content/dmdm-all.json` and built `index.html`; 13 topics, gated both ways.
  Re-run it after any change to the shelf or the matches.

## Not done yet (in order)

1. Re-tier the checklist when she posts her Test 3 pointers; `qtopic` + helpline answers if she opens a Module 3 helpline.
2. Case studies for Test 3 once he confirms which are in scope (they are gated on Canvas). Confirm the Test 3 date on Canvas
   (the page says 26 Oct).
3. The ovarian/uterine cycle essay needs a model answer (she posted none): author it in her marks-per-step shape, sourced.
