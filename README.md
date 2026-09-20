# HS2 · Paper Sim — Module 3 (work in progress, NOT published)

Same pipeline as [hs2-test2](../hs2-test2) (ported from its files at `255d89b`, the only copy that reads his single-file Canvas saves).
Module 3 = reproduction · genetics · special senses · light & sound. Cold-start notes: `../HS2-M3-PAPER-SIM-HANDOFF.md`.

## State on 21 Sep 2026

- `node bind-images.mjs` then `node build.mjs` → **360 questions ship, 45 held**, from his 23 graded quiz pages
  (`../_inbox/HS2 Module 3 Capture`, bank `../hs2-anki/m3/questions.json`). 52 of her figures ship.
- **Her own model answers**: `extract-her-answers.mjs` lifts the `quiz_comment` block of every essay, word for word, into
  `content/her-answers.json` (26 of 27 essays). They ship labelled as HERS. Nothing the tool wrote is in here yet.
- `NO_IMAGE_OK` in `build.mjs`: 24 questions whose missing image was a video thumbnail or decoration, each read by eye.
- Held, with the reason on each row of `held.json`: 30 that truly need a figure that did not load when the page was saved
  (pedigrees, karyotypes, label-the-diagram: re-save those pages with the images showing), 9 letter-only MC questions,
  the ovarian/uterine cycle essay (she posted no answer), and 5 parser oddities.
- Checked at 375 px: renders, no console errors, no horizontal scroll, page is `noindex`.

## Not done yet (in order)

1. The 9 letter-only questions and the 5 parser oddities: read each capture by eye.
2. Re-save the pages whose figures did not load; re-run `bind-images.mjs`. One figure is an SVG data URI and lands as
   `img/HS2DATA-01fa88c8b230659f.svgxml`: teach `dataImgFile` in `stem-html.mjs` to name it `.svg`.
3. Two matching questions sit under an embedded video, so their stem is YouTube page furniture: give them an authored stem.
4. Focus checklist (HIS RULE: Test-2-grade, done / ask / cap), `qtopic` / `qrow`.
5. Slides and passages for the explain row (re-harvest Canvas first), then caption-verified videos and the playlist page.
6. Case studies for Test 3 once he confirms which are in scope. Confirm the Test 3 date on Canvas (the page says 26 Oct).
7. Ask him before creating the public repo and pushing.
