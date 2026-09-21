/* Assemble index.html from the parsed Module 3 question bank (pipeline ported from hs2-test2 @255d89b).
   Nothing here authors questions — stems, options and keys come from the capture
   verbatim; authored content lives in content/ and is joined by gates that fail
   the build in BOTH directions (an unmatched answer file entry is as fatal as an
   unanswered essay). */
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { CHAINS } from './content/chains.js';
import { CASE7 } from './content/case7.js';
import { SAQ_ANSWERS, norm } from './content/saq-answers.js';
import { loadVideos, loadVideoMatches, loadRefMatches, loadPartRefs, matchVideo, matchRefs, matchParts } from './content/explain.mjs';
import { structuredStems, plainText } from './stem-html.mjs';
import { OVERRIDES } from './content/overrides.js';
import { AUTHORED_STEMS } from './content/authored-stems.js';
import { FOCUS } from './content/focus.js';
import { HELPLINE } from './content/helpline.js';
import { QTOPIC } from './content/qtopic.js';
import { QROW } from './content/qrow.js';
import { rowOf } from './content/topics.js';

const HERE = path.dirname(fileURLToPath(import.meta.url));
/* HER OWN model answers, lifted verbatim from the quiz_comment blocks of his graded captures by extract-her-answers.mjs */
const HER_ANSWERS = JSON.parse(fs.readFileSync(path.join(HERE, 'content/her-answers.json'), 'utf8'));
const herUsed = new Set();
const M2 = 'C:/Users/USER/Desktop/github/hs2-anki/m3';      // name kept from the port: it is the parsed bank dir
const CAP = 'C:/Users/USER/Desktop/github/_inbox/HS2 Module 3 Capture';

const bank = JSON.parse(fs.readFileSync(path.join(M2, 'questions.json'), 'utf8'));
const imgBind = JSON.parse(fs.readFileSync(path.join(HERE, 'images.json'), 'utf8'));
const readOr = (f, d) => fs.existsSync(f) ? JSON.parse(fs.readFileSync(f, 'utf8')) : d;      // his single-file saves carry no manifests: every figure is a data: URI
const manifest = readOr(path.join(CAP, 'images/manifest.json'), {});
const extManifest = readOr(path.join(CAP, 'images/ext-manifest.json'), {});
/* the same captures, read a second way: structure kept, blanks and images in place.
   `q` (flat, hers verbatim) stays the id + search text; `qh` is what the student sees. */
const STEMS = structuredStems(CAP, manifest, extManifest);

/* quiz id -> name + system (titles in the capture are the noscript banner, so
   names are declared here, matching Canvas titles) */
const QUIZ = {
  /* Module 3, captured 21 Sep 2026 from his own graded attempts. Systems: repro · gen(etics) · senses (special senses + light & sound) · mixed */
  210994:['repro','Reproduction MC (30 mk)'],211054:['repro','Formative: Female Reproduction'],211071:['repro','Formative: Male Reproduction'],
  211050:['repro','Cases: Fertility Quiz'],
  211014:['gen','Pedigree Pop Quiz'],211017:['gen','Patterns of Inheritance'],211029:['gen','Formative: Genetics MC'],
  211041:['gen','Formative: Genotypes & Phenotypes'],211053:['gen','Pedigree Charts'],211062:['gen','Formative: Genetics Vocabulary'],
  211086:['gen','Karyotypes & Pedigree Review'],211087:['gen','Genetics Basics & Punnett Squares'],211091:['gen','Formative: Genetic Exercises'],
  211114:['gen','Genetics Terms'],211135:['gen','Co- & Incomplete Dominance, Polygenic, Karyotypes'],
  211011:['senses','Formative: Special Senses (diagrams)'],211022:['senses','Sound and Hearing'],211094:['senses','The Eye'],
  211100:['senses','Formative: Special Senses (21 mk)'],211121:['senses','Light & Sound'],211123:['senses','SAQ: Light & Sound'],
  211104:['mixed','SAQ, student-marked: Genetics, SS & Repro'],211120:['mixed','Revision: SS, Genetics & Reproduction'],
};

/* Questions the pipeline cannot render truthfully, held on purpose rather than
   shipped broken. Matched by quiz + normalised stem prefix. (211112 #1 "Label the
   glands" used to live here; it now has an authored image-stem in
   content/authored-stems.js, so it ships.) */
const EXCLUDE = [
  /* not questions: her notice at the top of the two self-mark quizzes, captured as a 1-mark true/false */
  { quiz: '211104', k: 'this is a self mark quiz', why: 'her notice to students, not a question' },
  { quiz: '211123', k: 'this is a self mark quiz', why: 'her notice to students, not a question' },
];

/* Questions held as "image did not survive" whose only image is a dead or decorative
   reference (a failed external image, an empty [[IMG]]) and which are fully answerable
   from their own text or pairs. Shipped as text rather than held on a phantom figure.
   Matched by quiz + normalised stem prefix; a stale entry fails the build. */
const NO_IMAGE_OK = [
  /* Module 3 — each row read by eye on 21 Sep 2026. His single-file saves inline only the images that had LOADED; these
     did not, and each question below is fully answerable from its own words. Anything that truly needs its figure
     (pedigrees, karyotypes, label-the-diagram) stays HELD until that page is re-saved with the image showing. */
  { quiz: '210994', k: '13 in a female which of the following structures houses the oocytes' },   // MCQ; decoration
  { quiz: '210994', k: '22 a woman who wants to ensure conception' },   // MCQ on the LH surge; decoration
  { quiz: '210994', k: 'fertilization process virtual reality' },   // drop-downs under an embedded YouTube video; the "image" is its thumbnail
  { quiz: '211011', k: 'anatomy and function of the eye' },   // matching under an embedded video; every pair is a self-contained description
  { quiz: '211011', k: 'the refraction of light is the bending of light' },   // statement about refraction; the figure only illustrated it
  { quiz: '211011', k: 'ear anatomy inside the ear' },   // matching under an embedded video; every pair is a self-contained description
  { quiz: '211011', k: 'sound waves travel as vibrations of particles' },   // T/F from the sentence itself
  { quiz: '211011', k: 'ear wax is made by' },   // fill-in from the sentence itself
  { quiz: '211022', k: 'sounds with low frequencies' },   // statement about the basilar membrane; the tonotopic figure ships with the neighbouring question
  { quiz: '211041', k: 'blood types are inherited by different combinations' },   // her genotype table is TEXT in the stem; the image was a decoration
  { quiz: '211091', k: 'blood types are inherited by different combinations' },   // same question in the second quiz
  { quiz: '211120', k: 'erection is a process' },   // ordering question; every step is written out
  { quiz: '211120', k: 'complete the sentences using the appropriate items from the drop box' },   // her sperm table: every blank sits in a worded sentence
  { quiz: '211120', k: 'mix and match a b o blood types' },   // matching; every pair is self-contained
  { quiz: '211121', k: 'fill the spaces using words from the drop down menu the lens in the eye' },   // drop-downs in worded sentences
  /* GONE FROM CANVAS (he re-opened each on 21 Sep 2026: access denied / dead link), so no save can bring the figure back.
     Each ships because every part is named in its own words; never with a picture of ours in its place. */
  { quiz: '211071', k: 'in the diagram the place where a vasectomy' },   // drop-downs: each letter carries its name in the prose ("cutting A (the ___)", "from B … and from the prostate", "the gland with citric acid")
  { quiz: '211120', k: 'study the images and choose the correct answer noise induced hearing loss' },   // MCQ: the stem describes the damage in full; options pair structure + type
  { quiz: '211121', k: 'mix and match the conditions with the cause of the defect' },   // matching: each cause is a self-contained sentence (image in front of / behind / on the retina)
];
const noImgOkUsed = new Set(), noImgOkStale = [];

/* A blank her KEY defines but her STEM never shows: in the PNS receptor table she printed "Photo receptors" as plain text
   and left its dropdown out, so Canvas itself shows three dropdowns for a four-blank key. A blank the student cannot see
   cannot be asked — it is dropped here, by name, and the rest renumbered. Explicit on purpose: the general rule stays
   "every key blank must be inline", so a blank the READER lost still fails the build. A stale entry fails it too. */
const ORPHAN_BLANKS = [
];
const orphanUsed = new Set();

/* deal-weight routing for mixed-quiz questions — coarse by design; used for
   stratification only, never for a coverage claim. APPEND rules, never insert. */
const ROUTE = [
  ['gen', /\b(allele|genotype|phenotype|homozyg|heterozyg|pedigree|karyotype|chromosom|dominant|recessive|punnett|inherit|mutation|trisomy|x-linked|autosom|gene)/i],
  ['repro', /\b(sperm|ovar|uter|testis|testes|oocyte|follicle|ovulat|menstrua|endometri|placenta|fertilis|fertiliz|semen|prostate|estrogen|progesterone|testosterone|lactat|pregnan)/i],
  ['senses', /\b(eye|retina|cornea|lens|pupil|iris|cone|rods?|cochlea|ear|hearing|sound|deaf|tympan|ossicle|light|refract|wavelength|frequency|pitch|decibel|vision|myopi|hyperopi)/i],
];
const routeSys = (txt) => (ROUTE.find(([, re]) => re.test(txt)) || ['mixed'])[0];

/* id hashes the CONTENT (stem + key), not the position — Canvas renumbers, and a
   review quiz can carry the same stem twice; identical content dedupes silently. */
const qid = (quiz, stem, content) =>
  'q' + crypto.createHash('sha1').update(quiz + '|' + stem + '|' + JSON.stringify(content ?? '')).digest('hex').slice(0, 10);

const stripImgRefs = (s) => s
  .replace(/\[\[IMG[^\]]*\]\]/g, ' ')
  /* Canvas page furniture that leaks into stems — never part of the question */
  .replace(/https?:\/\/\S+/g, ' ')
  .replace(/\(?\s*Links to an external site\.?\s*\)?/gi, ' ')
  .replace(/This video may display YouTube ads\.?/gi, ' ')
  .replace(/Continue to YouTube content\.?/gi, ' ')
  .replace(/Minimize embedded content\.?/gi, ' ')
  .replace(/\s+/g, ' ').trim();

const questions = [], held = [], quizzes = [];
const saqUsed = new Set();
const structFails = []; let nInline = 0;
const overridesUsed = new Set();
const authoredUsed = new Set();

for (const z of bank.quizzes) {
  const fid = (z.file.match(/HS2CAP-(\d+)/) || [])[1];
  const [qsys, qname] = QUIZ[fid] || ['mixed', 'Quiz ' + fid];
  let kept = 0;
  z.questions.forEach((q, idx) => {
    if (q.type === 'text_only_question' || q.type === 'unknown') return;
    const stemRaw = q.q || '';
    let stem = stripImgRefs(stemRaw);
    /* Some of her matching questions have NO stem in Canvas itself — the content
       is entirely in the pairs. A synthesised stem keeps them dealable; it is
       labelled generic on purpose, never invented content. */
    if (!stem && q.key && q.key.kind === 'pairs' && q.key.pairs.length >= 2)
      stem = 'Match each item with its correct partner.';
    /* her question printed INSIDE her figure, with no stem text on Canvas at all (211091 #19: the pedigree carries "What pattern
       of inheritance does this trait follow?"). An authored-stems entry keyed on THAT figure file copies the printed words in;
       nothing is invented, the page says where the words come from, and a stale entry fails the build like any other. */
    if (!stem) {
      const fig = AUTHORED_STEMS.find(a => a.quiz === fid && a.fig && ((imgBind[path.basename(z.file)] || {})[idx] || []).includes(a.fig));
      if (fig) stem = fig.stem;
    }
    if (!stem) { held.push({ quiz: qname, why: 'empty stem' }); return; }
    const ex = EXCLUDE.find(e => e.quiz === fid && norm(stem).startsWith(e.k));
    if (ex) { held.push({ quiz: qname, why: ex.why, q: stem.slice(0, 80) }); return; }
    const imgs = ((imgBind[path.basename(z.file)] || {})[idx] || []);
    const okNoImg = NO_IMAGE_OK.find(e => e.quiz === fid && norm(stem).startsWith(e.k));
    if (okNoImg) noImgOkUsed.add(okNoImg);
    if (okNoImg && imgs.length) noImgOkStale.push(`no-image-ok row is stale, the question ships its figure: ${fid} "${okNoImg.k}"`);
    const needsImg = !okNoImg && (/\[\[IMG/.test(stemRaw) || /\b(image|diagram|picture|micrograph|labell?ed|figure) (above|below|shown)\b/i.test(stem));
    if (needsImg && !imgs.length) { held.push({ quiz: qname, why: 'image did not survive capture', q: stem.slice(0, 80) }); return; }
    const sys = qsys === 'mixed' ? routeSys(stem + ' ' + (q.answers || []).map(a => a.text).join(' ')) : qsys;
    const base = { id: qid(fid, stem, q.key), quiz: fid, sys, pts: +q.points || 1, q: stem, imgs };
    /* structured stem: only images this question actually ships may be placed inline;
       blank markers are validated per type below, so a stem can never show a blank
       the key does not have, or hide one it does. */
    const authoredSt = AUTHORED_STEMS.find(a => a.quiz === fid && norm(stem).startsWith(a.k));
    if (authoredSt) authoredUsed.add(authoredSt);
    const st = authoredSt ? authoredSt.st : (STEMS[path.basename(z.file)] || {})[idx];
    if (st && st.html) {
      base.qh = st.html.replace(/\[\[IMG:([^\]]+)\]\]/g, (m, f) => imgs.includes(f) ? m : '');
      if (!/<(?:p|ul|ol|div)\b/.test(base.qh)) base.qh = '<p>' + base.qh + '</p>';
    } else base.qh = '<p>' + stem.replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c])) + '</p>'; // synthesised stem
    /* one-line text of the SAME stem for titles and the Ask-AI prompt — the flat
       capture split words at inline tags ("a nta gonist") and carries "[ Select ]" */
    base.qt = plainText(base.qh);
    const blankMarkers = (h) => [...(h || '').matchAll(/\[\[BLANK:(\d+|\?)\]\]/g)].map(m => m[1]);
    const placeBlanks = (n) => {
      const ks = blankMarkers(base.qh);
      const ok = base.qh && ks.length === n && !ks.includes('?') && new Set(ks).size === n && ks.every(k => +k < n);
      if (!ok) { structFails.push(`${qname} #${idx + 1}: ${n} blanks in key, markers [${ks.join(',')}] in stem — "${stem.slice(0, 60)}"`); base.qh = (base.qh || '').replace(/\[\[BLANK:[^\]]*\]\]/g, '____'); return null; }
      nInline++;
      return st.ctx;
    };
    if (base.qh && q.type !== 'multiple_dropdowns_question' && q.type !== 'fill_in_multiple_blanks_question' && blankMarkers(base.qh).length) {
      structFails.push(`${qname} #${idx + 1}: blank markers in a ${q.type}`); base.qh = base.qh.replace(/\[\[BLANK:[^\]]*\]\]/g, '____');
    }
    /* her one short-answer question (211121 #14, "…is known as an [].") is a typed blank: she wrote "[]" where the answer goes and
       Canvas's accepted answers are its key. It ships as a one-blank typed cloze at her "[]", graded on exactly those answers.
       Only when her stem carries exactly one "[]": anything else stays on the old path (and is held there). */
    if (q.type === 'short_answer_question' && q.key && q.key.kind === 'options' && q.key.correct.length && (base.qh.match(/\[\]/g) || []).length === 1) {
      base.qh = base.qh.replace('[]', '[[BLANK:0]]');
      base.qt = plainText(base.qh);
      q = { ...q, type: 'fill_in_multiple_blanks_question', key: { kind: 'blanks', blanks: [{ label: null, options: q.key.correct, correct: q.key.correct[0] }] } };
    }

    if (q.type === 'essay_question') {
      const hers = HER_ANSWERS.find(a => a.quiz === fid && norm(stem).startsWith(a.k));
      if (hers) { herUsed.add(hers);
        questions.push({ ...base, type: 'essay', pts: base.pts || Math.min(6, hers.steps.length), saq: { steps: hers.steps, src: 'HER own model answer, word for word · from the feedback on her quiz' } });
        kept++; return; }
      const hit = SAQ_ANSWERS.find(a => norm(stem).startsWith(a.k) || norm(stem).includes(a.k));
      if (!hit) { held.push({ quiz: qname, why: 'essay with no authored model answer', q: stem.slice(0, 80) }); return; }
      saqUsed.add(hit.k);
      questions.push({ ...base, type: 'essay', pts: Math.max(base.pts, hit.steps.length ? Math.min(6, hit.steps.length) : base.pts), saq: { steps: hit.steps, src: 'Model answer is the tool’s · from ' + hit.src } });
      kept++; return;
    }
    if (!q.key) { held.push({ quiz: qname, why: 'no extracted key', q: stem.slice(0, 80) }); return; }
    if (q.key.kind === 'pairs') {
      if (q.key.pairs.length < 2) { held.push({ quiz: qname, why: 'matching with <2 recovered pairs', q: stem.slice(0, 80) }); return; }
      questions.push({ ...base, type: 'match', pairs: q.key.pairs, pts: Math.max(base.pts, q.key.pairs.length) });
      kept++; return;
    }
    if (q.key.kind === 'blanks') {
      if (q.key.blanks.some(b => !b.options.length || !b.correct)) { held.push({ quiz: qname, why: 'blank with no options/correct', q: stem.slice(0, 80) }); return; }
      /* bk: how the blank is answered — 'dd' = her dropdown (options are choices, ONE
         is right), 'fib' = typed (options are the accepted spellings, ALL are right).
         The two must grade differently; the old single path marked any dropdown
         choice correct. */
      const bk = q.type === 'multiple_dropdowns_question' ? 'dd' : 'fib';
      let keyBlanks = q.key.blanks, keptIdx = null;
      const orphan = ORPHAN_BLANKS.find(e => e.quiz === fid && norm(stem).startsWith(e.k));
      if (orphan) {
        const present = new Set(blankMarkers(base.qh));
        keptIdx = keyBlanks.map((b, k) => k).filter(k => present.has(String(k)) || !orphan.drop.includes(keyBlanks[k].correct));
        if (keptIdx.length < keyBlanks.length) orphanUsed.add(orphan);
        const remap = new Map(keptIdx.map((k, n) => [String(k), n]));
        base.qh = base.qh.replace(/\[\[BLANK:(\d+)\]\]/g, (m, k) => remap.has(k) ? `[[BLANK:${remap.get(k)}]]` : m);
        keyBlanks = keptIdx.map(k => keyBlanks[k]);
      }
      const ctx0 = placeBlanks(keyBlanks.length);
      const ctx = ctx0 && keptIdx ? Object.fromEntries(keptIdx.map((k, n) => [n, ctx0[k]])) : ctx0;
      const blanks = keyBlanks.map((b, k) => ({ ...b, ctx: ctx ? (ctx[k] || '') : '' }));
      /* extra accepted answers, declared in content/overrides.js and matched here by
         id + blank + her correct answer — a stale override fails the build below */
      for (const o of OVERRIDES.filter(o => o.id === base.id)) {
        const b = blanks[o.blank];
        if (!b || b.correct !== o.correct) continue;
        b.also = [...new Set([...(b.also || []), ...o.also])];
        overridesUsed.add(o);
      }
      questions.push({ ...base, type: 'cloze', bk, blanks, pts: Math.max(base.pts, blanks.length) });
      kept++; return;
    }
    /* options family. Some of her MCQs store options as bare letters (a/b/c/d)
       with the real text only in each answer's title attribute — enrich from the
       title, keys re-derived through the SAME rule so they can never diverge. */
    /* Canvas's title = the answer + "." + its marks ("You selected this answer.", "This was the correct answer."). Strip the marks
       AND that dot: a wrong "23." beside a bare right "92" marked the answer by its shape (2 live in hs2-test2, 24 in hs2-test3). */
    const cleanTitle = t => (t || '').replace(/(?:\.?\s*(?:This was the correct answer|You selected this answer)\.?)+\s*$/i, '').replace(/\.$/, '').trim();
    const enrich = a => { const t = (a.text || '').trim(), ti = cleanTitle(a.titleAttr);
      return (t.length < 3 && ti.length >= 3) ? ti : t; };
    const ans = (q.answers || []).filter(a => (a.text || '').trim() || cleanTitle(a.titleAttr));
    let opts = [...new Set(ans.map(enrich).filter(Boolean))];
    /* "All/None of the above" only means what it says when it IS below the others —
       the capture holds them in Canvas's per-attempt shuffle order. Display order only. */
    const above = o => /^(?:all|none|both) of (?:the above|these)/i.test(o);
    opts = [...opts.filter(o => !above(o)), ...opts.filter(above)];
    const key = [...new Set(ans.filter(a => a.correctClass || a.weight === '100').map(enrich))];
    /* a BARE LETTER is one character A-H. "Shorter than 3" held real answers as letters: genetics' "46", "Hh", "AO", "LH", "0%",
       Module 2's "6" (skeletal muscles), Module 1's "7" (blood pH) and "1"-"4" (O2 per haemoglobin). */
    const bare = o => /^[A-Ha-h]$/.test(o.trim());
    /* her lettered list may be in either case: "A. Calcitonin B. Parathyroid hormone C. Oestrogen" */
    const lettered = opts.every(bare) && /\b[a-d]\.\s/i.test(stem);
    if (!opts.length || opts.length < 2 || !key.length || !key.every(k => opts.includes(k))) {
      held.push({ quiz: qname, why: 'key text not among options', q: stem.slice(0, 80) }); return;
    }
    if (opts.every(bare) && !lettered && !imgs.length) {      /* EVERY option a bare letter: blood types A · B · AB · O are answers, not letters */
      held.push({ quiz: qname, why: 'letter-only options with no lettered stem or image', q: stem.slice(0, 80) }); return;
    }
    const type = q.type === 'true_false_question' ? 'tf'
      : q.type === 'multiple_answers_question' ? 'multi' : 'mcq';
    /* bare-letter options (a/b/c/d) get their text from the stem's own lettered list,
       so the card reads "b. Fibula" instead of "b" — display only; the key stays hers.
       Only when every option letter is found exactly once in the stem. */
    let ol = null;
    if (lettered) {
      const found = {};
      for (const m of stem.matchAll(/(?:^|\s)([a-d])\.\s*(.+?)(?=\s+[a-d]\.\s*\S|$)/gi)) { const L = m[1].toLowerCase(); if (found[L]) { found.__dup = true; } found[L] = m[2].trim(); }
      if (!found.__dup && opts.every(o => found[o.toLowerCase()])) ol = Object.fromEntries(opts.map(o => [o, found[o.toLowerCase()]]));
    }
    questions.push({ ...base, type, opts, key, ...(ol ? { ol } : {}) });
    kept++;
  });
  if (kept) quizzes.push({ id: fid, name: qname, sys: qsys, n: kept });
}

/* ── the explain layer: video + judged text references per question ── */
const videos = loadVideos(path.join(HERE, 'content'));
const vmatches = loadVideoMatches(path.join(HERE, 'content'), videos);
const rmatches = loadRefMatches(path.join(HERE, 'content'));
const pmatches = loadPartRefs(path.join(HERE, 'content'));
let nPartQ = 0, nPartRefs = 0; const pmUsed = new Set();
const SLIDESRC = path.join(CAP, 'slides');
let nVid = 0, nRef = 0, nSlide = 0, nSlideText = 0, nHer = 0, nCourse = 0, nPat = 0, nPatOnly = 0;
const usedSlides = new Set(), vmUsed = new Set(), rmUsed = new Set();
for (const q of questions) {
  const v = matchVideo(q, videos, vmatches); if (v) { q.vid = v; nVid++; vmUsed.add(q.id); }
  const refs = [];
  for (const r of matchRefs(q, rmatches)) {
    rmUsed.add(q.id);
    if (r.k === 'slide') {
      /* A question that carries its OWN image is its own authority — a retrieved
         slide with a different letter/label scheme beside it contradicts the
         figure the student just answered on (the label-the-glands bug). Such
         questions keep text references only, never a second figure. */
      if (q.imgs.length) continue;
      const png = path.join(SLIDESRC, r.slug, `slide-${r.n}.png`);
      if (fs.existsSync(png)) {
        const name = `${r.slug}-${r.n}.jpg`;
        usedSlides.add(JSON.stringify([png, name]));
        refs.push({ k: 'slide', src: r.src, slide: name }); nSlide++;
      } else if (r.t) { refs.push({ k: 'slide', src: r.src, t: r.t }); nSlideText++; }   /* deck not rendered: quote the slide's own words — never point at a picture we can't show */
    } else {
      refs.push(r);
      if (r.k === 'her') nHer++; else if (r.k === 'course') nCourse++; else nPat++;
    }
  }
  if (refs.length) { q.refs = refs; nRef++; if (refs.every(r => r.k === 'patton')) nPatOnly++; }
  const prefs = matchParts(q, pmatches);
  if (prefs.length) { q.prefs = prefs; nPartQ++; nPartRefs += prefs.length; pmUsed.add(q.id); }
}
console.log(`references per part: ${nPartRefs} parts referenced over ${nPartQ} multi-part questions`);
console.log(`explain layer: ${nVid}/${questions.length} questions matched a video (${Math.round(100 * nVid / questions.length)}%); ` +
  `${nRef} carry a judged reference (${nSlide} her slide images + ${nSlideText} slides quoted as text, ${nHer} her prose, ${nCourse} course files, ${nPat} Patton excerpts; ${nPatOnly} Patton-only) — from ${videos.length} videos`);
/* compress + ship only the referenced slides */
const SLIDEOUT = path.join(HERE, 'img', 'slides');
fs.mkdirSync(SLIDEOUT, { recursive: true });
fs.writeFileSync(path.join(HERE, 'slides-todo.json'),
  JSON.stringify([...usedSlides].map(s => JSON.parse(s)), null, 1));

/* her worked helpline answer, under the question: q.hl = the focus topic whose section
   teaches this question (content/qtopic.js, read by hand). Both directions gated: an id
   that matches no live question is stale, a topic with no section would render nothing. */
let nHl = 0; const hlUsed = new Set();
for (const q of questions) if (QTOPIC[q.id]) { q.hl = QTOPIC[q.id]; nHl++; hlUsed.add(q.id); }
/* ── gates ─────────────────────────────────────────────────────────── */
const fails = [];
for (const [qid, t] of Object.entries(QTOPIC)) {
  if (!hlUsed.has(qid)) fails.push('qtopic entry matched NO question: ' + qid);
  if (!HELPLINE[t]) fails.push(`qtopic topic has no helpline section: ${t} (${qid})`);
}
/* an essay HELD for another reason (its figure did not capture) keeps her answer on file without failing the build */
for (const a of HER_ANSWERS) if (!herUsed.has(a) && !held.some(h => h.q && a.k.startsWith(norm(h.q).slice(0, 50)))) fails.push('her-answers entry matched NO essay: ' + a.quiz + ' "' + a.k + '"');
for (const a of SAQ_ANSWERS) if (!saqUsed.has(a.k)) fails.push('saq-answers entry matched NO essay: "' + a.k + '"');
/* a verified video match whose question id no longer exists is stale evidence,
   not a harmless extra — same rule as an override that matched nothing */
for (const qid of Object.keys(vmatches)) if (!vmUsed.has(qid)) fails.push('video-matches entry matched NO question: ' + qid);
for (const qid of Object.keys(rmatches)) if (!rmUsed.has(qid)) fails.push('ref-matches entry matched NO question: ' + qid);
for (const qid of Object.keys(pmatches)) if (!pmUsed.has(qid)) fails.push('part-refs entry matched NO question: ' + qid);
/* identical content captured twice (review quizzes repeat questions) — keep one */
const dup = new Set(); let dropped = 0;
for (let i = questions.length - 1; i >= 0; i--) {
  if (dup.has(questions[i].id)) { questions.splice(i, 1); dropped++; }
  else dup.add(questions[i].id);
}
if (dropped) console.log('deduped', dropped, 'identical duplicate captures');
/* the shipped bank as plain text, for the topic tagger (tag-topics.mjs) and for reading by eye — never shipped */
fs.writeFileSync(path.join(HERE, 'bank-dump.json'), JSON.stringify(questions.map(q => ({ id: q.id, quiz: q.quiz, sys: q.sys, type: q.type, pts: q.pts, t: [q.q, (Array.isArray(q.key) ? q.key : q.key != null ? [q.key] : []).join(' | ')      /* the CORRECT answer only: distractors would drag a question onto the wrong row */, (q.pairs || []).map(p => (p.left || '') + ' => ' + (p.right || '')).join(' | '), (q.blanks || []).map(x => x.correct).join(' | '), q.saq ? q.saq.steps.join(' ') : ''].join(' ## ').replace(/\s+/g, ' ') })), null, 0));
/* "Learn her N questions on this": each focus row named in content/qrow.js carries `qs`,
   the ids it deals. Gated both ways like every other join; exact repeats (one question
   captured in two quizzes) are dropped so the button's count is what he will actually sit,
   and one-tap questions lead so a run starts in the shallow end and ends on the written ones. */
const TYPE_RANK = { mcq: 0, tf: 0, multi: 1, match: 2, cloze: 3, essay: 4 };
/* THE FOCUS CHECKLIST IS COUNTED HERE, never by hand. content/topics.js puts each shipped question on ONE row (a row = one of her
   numbered criteria); a question with no row, or a row that is not in focus.js, fails the build. */
const ASSIGN = {}, dumpText = q => [q.q, (Array.isArray(q.key) ? q.key : q.key != null ? [q.key] : []).join(' | '), (q.pairs || []).map(p => (p.left || '') + ' => ' + (p.right || '')).join(' | '), (q.blanks || []).map(x => x.correct).join(' | '), q.saq ? q.saq.steps.join(' ') : ''].join(' ## ').replace(/\s+/g, ' ');
for (const q of questions) { const r = rowOf({ id: q.id, t: dumpText(q) }); if (!r) { fails.push('question on NO focus row: ' + q.id + ' "' + q.q.slice(0, 60) + '"'); continue; } if (!FOCUS.some(f => f.id === r)) { fails.push('topics.js names a row that focus.js does not have: ' + r); continue; } (ASSIGN[r] = ASSIGN[r] || []).push(q.id); }
const sigOf = q => q.type + '|' + norm(q.q) + '|' + JSON.stringify(q.key || q.pairs || (q.blanks || []).map(b => b.correct));      /* the SAME repeat rule the Learn-by-row button uses below, so a row's count and its button agree */
for (const f of FOCUS) { const qs = (ASSIGN[f.id] || []).map(id => questions.find(q => q.id === id)), uniq = new Map(); for (const q of qs) if (!uniq.has(sigOf(q))) uniq.set(sigOf(q), q);
  f.all = qs.length; f.n = uniq.size; f.pts = +[...uniq.values()].reduce((a, q) => a + (q.pts || 0), 0).toFixed(1); f.qz = new Set(qs.map(q => q.quiz)).size; f.saq = [...uniq.values()].filter(q => q.type === 'essay' || q.type === 'cloze').length;
  if (f.tier !== 0) f.tier = f.pts >= 30 ? 1 : f.pts >= 12 ? 2 : 3; }
const byId = new Map(questions.map(q => [q.id, q]));
const rowQs = {}; let nRowQ = 0;
for (const [rid, ids] of Object.entries({ ...ASSIGN, ...QROW })) {
  if (!FOCUS.some(f => f.id === rid)) { fails.push('qrow row is not a focus row: ' + rid); continue; }
  const seenId = new Set(), seenSig = new Set(), keep = [];
  for (const id of ids) {
    const q = byId.get(id);
    if (!q) { fails.push(`qrow entry matched NO question: ${id} (${rid})`); continue; }
    if (seenId.has(id)) { fails.push(`qrow lists ${id} twice under ${rid}`); continue; }
    seenId.add(id);
    const sig = q.type + '|' + norm(q.q) + '|' + JSON.stringify(q.key || q.pairs || (q.blanks || []).map(b => b.correct));
    if (seenSig.has(sig)) continue;
    seenSig.add(sig); keep.push(q);
  }
  if (!keep.length) fails.push('qrow row deals nothing: ' + rid);
  rowQs[rid] = keep.map((q, i) => [q, i]).sort((a, b) => (TYPE_RANK[a[0].type] ?? 5) - (TYPE_RANK[b[0].type] ?? 5) || a[1] - b[1]).map(x => x[0].id);
  nRowQ += rowQs[rid].length;
}
const focusOut = FOCUS.map(f => rowQs[f.id] ? { ...f, qs: rowQs[f.id] } : f);
for (const q of questions) for (const f of q.imgs) if (!fs.existsSync(path.join(CAP, 'images', f))) fails.push('missing image file ' + f);
for (const c of CHAINS) if (c.beads.filter(b => b.t).length < 4) fails.push('chain too short: ' + c.id);
/* every blank-type question must carry every one of its blanks inline, once, in the
   stem the student sees — a blank the key has but the stem lacks is the exact bug this
   layer exists to kill, so it fails the build rather than falling back quietly */
for (const s of structFails) fails.push('stem structure: ' + s);
for (const o of OVERRIDES) if (!overridesUsed.has(o)) fails.push(`override matched nothing: ${o.id} blank ${o.blank} "${o.correct}"`);
for (const a of AUTHORED_STEMS) if (!authoredUsed.has(a)) fails.push(`authored-stem matched NO question: ${a.quiz} "${a.k}"`);
for (const e of ORPHAN_BLANKS) if (!orphanUsed.has(e)) fails.push(`orphan-blank rule dropped nothing: ${e.quiz} "${e.k}"`);
for (const e of NO_IMAGE_OK) if (!noImgOkUsed.has(e)) fails.push(`no-image-ok matched NO question: ${e.quiz} "${e.k}"`);
fails.push(...noImgOkStale);
/* an option must not carry Canvas's marks or the dot its title appends: either one tells the answer apart by its shape */
for (const q of questions) for (const o of [...(q.opts || []), ...(q.key || [])]) if (typeof o === 'string' && (/you selected this answer|this was the correct answer/i.test(o) || /^[^\s.]{2}\.$/.test(o))) fails.push(`option carries a Canvas title mark: ${q.id} "${o}"`);
for (const q of questions) if (!q.qh) fails.push('no structured stem for ' + q.id + ' "' + q.q.slice(0, 60) + '"');
for (const q of questions) if (q.qh && /\[\[(?!IMG:|BLANK:\d+\]\])/.test(q.qh)) fails.push('stray marker in ' + q.id);
if (fails.length) { console.error('BUILD FAILED:\n  ' + fails.join('\n  ')); process.exit(1); }
console.log(`her worked helpline answer under ${nHl} questions`);
console.log(`learn-by-row: ${Object.keys(rowQs).length} focus rows deal ${nRowQ} question slots — ` + Object.entries(rowQs).map(([r, a]) => r + ' ' + a.length).join(' · '));
console.log(`structured stems: ${questions.filter(q => q.qh).length}/${questions.length} · blanks placed inline in ${nInline} cloze questions`);

/* ── emit ──────────────────────────────────────────────────────────── */
/* video reach is a stat, not a sentence: the template reads these so the home
   screen can never quote a count the bank has moved past */
const reached = new Set();
for (const q of questions) if (q.vid) { reached.add(q.vid.id); if (q.vid.alt) reached.add(q.vid.alt.id); }
const DATA = {
  built: new Date().toISOString().slice(0, 10),
  stats: { n: questions.length, held: held.length, videos: videos.length, videosReached: reached.size,
    videosFill: videos.filter(v => v.ch).length,
    withVideo: questions.filter(q => q.vid).length,
    withRef: nRef, withHer: questions.filter(q => q.refs && q.refs.some(r => r.k === 'slide' || r.k === 'her')).length, withCourse: nCourse,
    withPatton: nPat, pattonOnly: nPatOnly, partQ: nPartQ, partRefs: nPartRefs, withHl: nHl },
  quizzes: quizzes.sort((a, b) => a.sys.localeCompare(b.sys) || a.name.localeCompare(b.name)),
  questions, chains: CHAINS, case7: CASE7, focus: focusOut, helpline: HELPLINE, held,
};
const tpl = fs.readFileSync(path.join(HERE, 'template.html'), 'utf8');
/* An unbalanced <details> fails silently: a stray </details> closed the focus checklist right after its intro, so
   all 37 rows sat outside it and the card could not be folded (hs2-test3 and hs2-paper-m1, 2026-09-21). */
{
  const open = (tpl.match(/<details\b/g) || []).length, shut = (tpl.match(/<\/details>/g) || []).length;
  if (open !== shut) { console.error(`BUILD FAILED: template.html opens ${open} <details> and closes ${shut}`); process.exit(1); }
}
const marker = '/*@BANK@*/';
if (tpl.split(marker).length !== 2) { console.error('BUILD FAILED: expected exactly one ' + marker); process.exit(1); }
const out = tpl.replace(marker, JSON.stringify(DATA));
fs.writeFileSync(path.join(HERE, 'index.html'), out);

/* Parse-check the page's own inline script before it ships. A single bad escape
   kills the whole app with nothing but a blank page and exit code 0 - this is the
   cheapest possible guard against that. */
{
  const scripts = [...out.matchAll(/<script(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/g)].map(m => m[1]);
  if (!scripts.length) { console.error('BUILD FAILED: no inline script found to verify'); process.exit(1); }
  scripts.forEach((src, i) => {
    try { new Function(src); }
    catch (e) {
      console.error(`BUILD FAILED: inline script #${i + 1} does not parse - ${e.message}`);
      const line = (e.lineNumber || 0);
      console.error(src.split('\n').slice(Math.max(0, line - 3), line + 2).join('\n'));
      process.exit(1);
    }
  });
  console.log(`script parse check: ${scripts.length} inline script(s) OK`);
}

/* images ship beside the page */
const IMGDIR = path.join(HERE, 'img');
fs.mkdirSync(IMGDIR, { recursive: true });
const used = new Set(questions.flatMap(q => q.imgs));
for (const f of used) fs.copyFileSync(path.join(CAP, 'images', f), path.join(IMGDIR, f));

fs.writeFileSync(path.join(HERE, 'held.json'), JSON.stringify(held, null, 1));
const by = {}; for (const q of questions) by[q.sys] = (by[q.sys] || 0) + 1;
const byT = {}; for (const q of questions) byT[q.type] = (byT[q.type] || 0) + 1;
console.log('bank:', questions.length, 'questions ·', quizzes.length, 'quizzes ·', used.size, 'images ·', held.length, 'held');
console.log('by system:', JSON.stringify(by), '\nby type:', JSON.stringify(byT));
console.log('index.html', (fs.statSync(path.join(HERE, 'index.html')).size / 1024 | 0) + ' KB');
