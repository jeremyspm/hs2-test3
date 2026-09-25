/* Re-splice template.html onto the bank already inside index.html.
   For chrome-only changes (header, home screen, styles, sitting logic) when her Canvas
   archive is not on hand — or when you want to be certain no question moved. Anything
   that touches a QUESTION still needs `node build.mjs`. The SAQ Trainer's content
   (content/saq-*.json) is read fresh every time, through the same gates build.mjs uses.
   Gates: the bank must still be one JSON value, each marker must appear exactly once,
   and the spliced page's script must parse (a stray apostrophe in a template literal
   kills a single-file app silently — see estate memory "silent JS death"). */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadSaq, saqJSON } from './saq.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const html = fs.readFileSync(path.join(HERE, 'index.html'), 'utf8');
const m = html.match(/const DATA = (\{[\s\S]*?\});\n/);
if (!m) { console.error('RESPLICE FAILED: no bank found in index.html'); process.exit(1); }
JSON.parse(m[1]);
const tpl = fs.readFileSync(path.join(HERE, 'template.html'), 'utf8');
for (const marker of ['/*@BANK@*/', '/*@SAQD@*/'])
  if (tpl.split(marker).length !== 2) { console.error('RESPLICE FAILED: expected exactly one ' + marker); process.exit(1); }
const saq = loadSaq(HERE);
// function form: a `$'` inside the bank must not be a replacement pattern
const out = tpl.replace('/*@BANK@*/', () => m[1]).replace('/*@SAQD@*/', () => saqJSON(saq));
const script = (out.match(/<script>([\s\S]*?)<\/script>/) || [])[1];
if (!script) { console.error('RESPLICE FAILED: no <script> block'); process.exit(1); }
try { new Function(script); } catch (e) { console.error('RESPLICE FAILED: page script does not parse — ' + e.message); process.exit(1); }
fs.writeFileSync(path.join(HERE, 'index.html'), out);
console.log(`index.html re-spliced: ${m[1].length / 1024 | 0} KB bank · SAQ trainer ${saq.length} questions / ${saq.reduce((n, x) => n + x.mcq.length, 0)} drill questions · ${fs.statSync(path.join(HERE, 'index.html')).size / 1024 | 0} KB total · script parses`);
