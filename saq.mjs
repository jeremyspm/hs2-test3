/* saq.mjs — the SAQ Trainer's content, loaded and gated for build.mjs and resplice.mjs.
   Ported from hs2-test2/saq.mjs (same gates, same output shape). Module 3 has no "POSSIBLE SAQ" list yet, so the list is
   built from what she has given: her student-marked SAQ quiz (211104), the two test cases she names (11 Lactation,
   L Noise-induced hearing loss), her "HELP WITH MODULE 3 TOPICS" board and her "PEDIGREE CHARTS WILL BE TESTED".
   content/saq-senses.json = special senses · content/saq-gen.json = genetics · content/saq-repro.json = reproduction
   The page shows them in ORDER below: her own signals first (the two cases, pedigrees, her help-board topics), then
   the rest of her student-marked SAQ quiz.
   Module 3 only: `her` names her OWN model answers (content/her-answers.json, lifted word for word from the feedback on
   her quiz) by the start of their key; each must match exactly one, and the page shows them under the tool's answer.
   Every gate is a hard failure: a drill question with its answer missing, a duplicate option, a mark point no question
   teaches or a `her` key that finds nothing would each ship a broken rung on test night. */
import fs from 'node:fs';
import path from 'node:path';

const ORDER = ['nihl-case', 'lactation-case', 'pedigree', 'glaucoma-cataract', 'huntingtons',
  'hearing', 'ear-regions', 'eye-layers', 'accommodation', 'refraction-errors', 'equilibrium', 'waves',
  'punnett', 'inheritance-patterns', 'karyotype', 'gene-tech',
  'gametogenesis', 'cycles', 'male-female-table', 'male-hormones', 'ovary-hormones'];

export function loadSaq(HERE) {
  const read = f => { const p = path.join(HERE, 'content', f); return fs.existsSync(p) ? JSON.parse(fs.readFileSync(p, 'utf8')) : []; };
  const all = [...read('saq-senses.json'), ...read('saq-gen.json'), ...read('saq-repro.json')];
  const HERS = read('her-answers.json');
  const rank = id => { const i = ORDER.indexOf(id); return i < 0 ? ORDER.length : i; };
  all.sort((a, b) => rank(a.id) - rank(b.id));
  const fails = [], seen = new Set();
  const low = s => String(s).toLowerCase().replace(/\*\*/g, '').replace(/\s+/g, ' ').trim();
  for (const x of all) {
    const at = `SAQ ${x.id}`;
    if (seen.has(x.id)) fails.push(`${at}: duplicate id`); seen.add(x.id);
    if (!ORDER.includes(x.id)) fails.push(`${at}: not in ORDER`);
    if (!['repro', 'gen', 'senses'].includes(x.sys)) fails.push(`${at}: bad sys ${x.sys}`);
    for (const k of ['title', 'ask', 'hook', 'src']) if (!String(x[k] || '').trim()) fails.push(`${at}: empty ${k}`);
    if (!(x.marks > 0)) fails.push(`${at}: marks must be > 0`);
    if (!Array.isArray(x.steps) || x.steps.length < 3) fails.push(`${at}: needs 3+ steps`);
    if (!Array.isArray(x.traps)) fails.push(`${at}: traps must be a list`);
    for (const g of x.same || []) if (!g.every(i => Number.isInteger(i) && i >= 0 && i < x.steps.length)) fails.push(`${at}: bad 'same' group ${JSON.stringify(g)}`);
    x.herAns = (x.her || []).map(k => {
      const hit = HERS.filter(h => h.k.startsWith(k));
      if (hit.length !== 1) { fails.push(`${at}: her key "${k}" matched ${hit.length} of her answers (needs exactly 1)`); return null; }
      return { pts: hit[0].pts, steps: hit[0].steps };
    }).filter(Boolean);
    delete x.her;
    /* the short version (26 Sep 2026: the full answers were too big to remember). One fact a line, a few words each,
       grouped under the question's own parts; each line names the long mark point it condenses (`of`). Every bold word
       must be found in THAT point and every long point must have a short line, so the short version can neither invent
       a fact nor drop a point. Every SAQ ships one: the trainer is built around it. */
    if (!x.short) fails.push(`${at}: no short version (every SAQ needs one: one fact a line, about two lines a mark)`);
    if (x.short) {
      const s = x.short, flat = [];
      const norm = t => ' ' + String(t).toLowerCase().replace(/\*\*/g, '').replace(/[^a-z0-9]+/g, ' ').trim() + ' ';
      if (!String(s.hook || '').trim()) fails.push(`${at}: short.hook empty`);
      if (!Array.isArray(s.groups) || !s.groups.length) fails.push(`${at}: short.groups empty`);
      for (const g of s.groups || []) {
        if (!String(g.q || '').trim()) fails.push(`${at}: a short group has no question`);
        if (!Array.isArray(g.facts) || !g.facts.length) fails.push(`${at}: short group "${g.q}" has no lines`);
        flat.push(...(g.facts || []));
      }
      for (const f of flat) {
        if (!Number.isInteger(f.of) || f.of < 0 || f.of >= x.steps.length) { fails.push(`${at}: short line "${f.t}" cites point ${f.of}, out of range`); continue; }
        const bold = [...String(f.t).matchAll(/\*\*(.+?)\*\*/g)].map(m => m[1]);
        if (!bold.length) fails.push(`${at}: short line "${f.t}" has no bold mark word`);
        for (const b of bold) if (!norm(x.steps[f.of]).includes(norm(b))) fails.push(`${at}: short line's bold "${b}" is not in long point ${f.of + 1}`);
        if (String(f.t).split(/\s+/).length > 14) fails.push(`${at}: short line "${f.t}" is over 14 words`);
      }
      x.steps.forEach((_, i) => { if (!flat.some(f => f.of === i)) fails.push(`${at}: long point ${i + 1} has no short line`); });
    }
    const covered = new Set();
    (x.mcq || []).forEach((m, i) => {
      const mt = `${at} mcq ${i + 1}`;
      if (!String(m.q || '').trim() || !String(m.a || '').trim() || !String(m.why || '').trim()) fails.push(`${mt}: empty q/a/why`);
      if (!Array.isArray(m.d) || m.d.length !== 3) fails.push(`${mt}: needs exactly 3 distractors`);
      const opts = [m.a, ...(m.d || [])].map(low);
      if (new Set(opts).size !== opts.length) fails.push(`${mt}: duplicate option (${opts.join(' | ')})`);
      if (!Number.isInteger(m.step) || m.step < 0 || m.step >= x.steps.length) fails.push(`${mt}: step ${m.step} out of range`);
      else covered.add(m.step);
    });
    if ((x.mcq || []).length < 4) fails.push(`${at}: needs 4+ drill questions`);
    x.steps.forEach((s, i) => { if (!covered.has(i)) fails.push(`${at}: mark point ${i + 1} has no drill question`); });
  }
  for (const id of ORDER) if (!seen.has(id)) fails.push(`SAQ ${id}: in ORDER but in no content file`);
  if (fails.length) { console.error('SAQ GATES FAILED:\n  ' + fails.join('\n  ')); process.exit(1); }
  return all;
}

/* JSON for an inline <script>: a "</" inside it would end the script block early */
export const saqJSON = all => JSON.stringify(all).replace(/<\//g, '<\\/');
