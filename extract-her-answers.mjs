/* Her OWN model answers sit in the graded captures as `quiz_comment` blocks (she posts them so students can mark themselves).
   The parser does not carry them. This walks each capture, pairs the i-th display_question block with the i-th bank question,
   and for every ESSAY writes her comment, VERBATIM, split only at line breaks and sentence ends, to content/her-answers.json.
   Nothing here authors a word. An essay with no comment is listed so a model answer can be authored and labelled as the tool's. */
import fs from 'node:fs';
import path from 'node:path';
const BANK = 'C:/Users/USER/Desktop/github/hs2-anki/m3/questions.json';
const CAP = 'C:/Users/USER/Desktop/github/_inbox/HS2 Module 3 Capture';
const norm = s => s.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
const strip = s => s.replace(/\[\[IMG[^\]]*\]\]/g, ' ').replace(/https?:\/\/\S+/g, ' ').replace(/\(?\s*Links to an external site\.?\s*\)?/gi, ' ')
  .replace(/This video may display YouTube ads\.?/gi, ' ').replace(/Continue to YouTube content\.?/gi, ' ').replace(/Minimize embedded content\.?/gi, ' ').replace(/\s+/g, ' ').trim();
const text = h => h.replace(/<\/t[dh]>\s*(?=<t[dh])/gi, ' — ').replace(/<\/tr>/gi, '\n').replace(/<(br|\/p|\/div|\/li)[^>]*>/gi, '\n').replace(/<li[^>]*>/gi, '\n• ').replace(/<[^>]+>/g, ' ')
  .replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;|&rsquo;|&apos;/g, "'")
  .replace(/[ \t]+/g, ' ').replace(/\s*\n\s*/g, '\n').trim();
const bank = JSON.parse(fs.readFileSync(BANK, 'utf8'));
const out = [], missing = [];
for (const z of bank.quizzes) {
  if (!z.questions.some(q => /essay/.test(q.type))) continue;
  const html = fs.readFileSync(path.join(CAP, path.basename(z.file)), 'utf8');
  const re = /<div[^>]*class="?[^">]*\bdisplay_question\b[^>]*>/g, starts = []; let m;
  while ((m = re.exec(html))) starts.push(m.index);
  if (starts.length !== z.questions.length) { console.log('BLOCK COUNT MISMATCH', z.file, starts.length, z.questions.length); continue; }
  z.questions.forEach((q, i) => {
    if (!/essay/.test(q.type)) return;
    const seg = html.slice(starts[i], i + 1 < starts.length ? starts[i + 1] : html.length);
    const cm = [...seg.matchAll(/class="?[^">]*\bquiz_comment\b[^>]*>([\s\S]*?)<\/div>/g)].map(x => text(x[1])).filter(t => t.length > 15);
    const stem = strip(q.q), quiz = (z.file.match(/\d{6}/) || [''])[0];
    if (!cm.length) { missing.push({ quiz, stem: stem.slice(0, 100) }); return; }
    const hers = cm.join('\n');
    const steps = hers.split(/\n+|(?<=[.!?])\s+(?=[A-Z(•])/).map(s => s.trim()).filter(s => s.length > 2);
    out.push({ quiz, k: norm(stem).slice(0, 70).trim(), steps, pts: q.points });
  });
}
fs.writeFileSync('content/her-answers.json', JSON.stringify(out, null, 1));
console.log('essays with HER answer:', out.length, '| essays with none:', missing.length);
for (const x of missing) console.log('  none:', x.quiz, x.stem);
console.log('sample:', JSON.stringify(out[0], null, 1).slice(0, 700));
