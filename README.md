# HS2 · Paper Sim — Module 3 (work in progress · live, unlisted: https://jeremyspm.github.io/hs2-test3/)

Same pipeline as [hs2-test2](../hs2-test2) (ported from its files at `255d89b`, the only copy that reads his single-file Canvas saves).
Module 3 = reproduction · genetics · special senses · light & sound. Cold-start notes: `../HS2-M3-PAPER-SIM-HANDOFF.md`.

## State on 21 Sep 2026

- `node bind-images.mjs` then `node build.mjs` → **394 questions ship, 11 held**, from his 23 graded quiz pages
  (`../_inbox/HS2 Module 3 Capture`, bank `../hs2-anki/m3/questions.json`). 85 of her figures ship.
- **Her own model answers**: `extract-her-answers.mjs` lifts the `quiz_comment` block of every essay, word for word, into
  `content/her-answers.json` (26 of 27 essays). They ship labelled as HERS. Nothing the tool wrote is in here yet.
- `NO_IMAGE_OK` in `build.mjs`: 24 questions whose missing image was a video thumbnail or decoration, each read by eye.
- Held, with the reason on each row of `held.json` (11): **4 whose figure is genuinely gone** — he re-opened them on Canvas and the
  picture is "access denied" or a dead link (211071 the vasectomy diagram · 211086 one pedigree-links item · 211120 noise-induced
  hearing loss · 211121 the eye-defect mix and match); her two self-mark notices; the ovarian/uterine cycle essay (she posted no
  answer); and 4 parser oddities (two "key text not among options", one blank with no options, one empty stem).
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
3. "letter-only options" meant "shorter than 3 characters" (see above).
CHECK hs2-test2 and hs2-paper-m1 for 1 and 2: they were built with the same reader, and hs2-test2's `NO_IMAGE_OK` says six figures in
210998/213444 "did not make it".

- Checked at 375 px: renders, no console errors, no horizontal scroll, page is `noindex`.

## The focus checklist (21 Sep 2026)

37 rows, and every row is one of HER numbered criteria (Continuous Tests and Exam Focus Points, `Science 2 Detailed Content.docx`:
Genetics 1-9, Special senses 1-13, Reproductive 1-14) — `content/focus.js` says which. `content/topics.js` puts every shipped question
on exactly one row (rules over the stem and the CORRECT answer, then all 358 read in their groups, 98 moved by hand). The build counts
each row (questions, marks, quizzes, written), sets tiers 1-3 from the marks, and fails on a question with no row. Tier 0 is her own
words only: "PEDIGREE CHARTS WILL BE TESTED IN TEST 3". `done / ask / cap` are the tool's reading and say so on the page.
`node tag-topics.mjs [row|--none|--counts]` prints a row's questions for reading. When she posts a Test 3 focus list, a helpline or
revision sessions: move what she names to tier 0 and add the badge, as hs2-test2 does.

## Not done yet (in order)

1. The 4 parser oddities: read each capture by eye.
2. The 4 questions whose figure is gone from Canvas: read each one; if it can be answered without the picture add it to
   `NO_IMAGE_OK` with the reason, otherwise leave it held. Do NOT substitute a picture of our own.
3. Two matching questions sit under an embedded video, so their stem is YouTube page furniture: give them an authored stem.
4. Re-tier the checklist when she posts her Test 3 pointers; `qtopic` + helpline answers if she opens a Module 3 helpline.
5. Slides and passages for the explain row (re-harvest Canvas first), then caption-verified videos and the playlist page.
6. Case studies for Test 3 once he confirms which are in scope. Confirm the Test 3 date on Canvas (the page says 26 Oct).
