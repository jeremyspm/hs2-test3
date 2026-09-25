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
