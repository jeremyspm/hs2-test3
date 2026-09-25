/* saq-lint.mjs — the checks a gate cannot make hard, printed for a human to read.
   Shape leaks (the answer is spotted by its length before any physiology happens) and an
   answer word sitting in its own stem. Run: node saq-lint.mjs  (after saq.mjs gates pass). */
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadSaq } from './saq.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const all = loadSaq(HERE);
const words = s => String(s).toLowerCase().replace(/[^a-z0-9²⁺ ]+/g, ' ').split(/\s+/).filter(w => w.length > 4);
const STOP = new Set(['which', 'their', 'there', 'about', 'these', 'those', 'where', 'blood', 'cells', 'level', 'levels', 'would', 'after', 'first', 'called', 'because']);
let n = 0, flags = 0;
for (const x of all) x.mcq.forEach((m, i) => {
  n++;
  const lens = [m.a, ...m.d].map(s => s.length), a = lens[0], rest = lens.slice(1), mx = Math.max(...rest), avg = rest.reduce((p, c) => p + c, 0) / rest.length;
  const out = [];
  if (a > mx * 1.35 && a - mx > 8) out.push(`LONGEST by far (${a} vs max ${mx})`);
  if (a < avg * 0.55 && avg - a > 10) out.push(`SHORTEST by far (${a} vs avg ${avg | 0})`);
  const stem = new Set(words(m.q)), hit = words(m.a).filter(w => stem.has(w) && !STOP.has(w) && !m.d.some(d => words(d).includes(w)));
  if (hit.length) out.push(`answer word in stem, not in any distractor: ${hit.join(', ')}`);
  if (out.length) { flags++; console.log(`${x.id} #${i + 1}: ${m.q}\n   A: ${m.a}\n   D: ${m.d.join(' | ')}\n   → ${out.join('; ')}`); }
});
console.log(`\n${flags} flagged of ${n} drill questions over ${all.length} SAQs`);
