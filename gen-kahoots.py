# Rebuilds content/kahoots.js from each Kahoot's public data. Fetch each snapshot first (read-only, no login):
#   curl -s "https://create.kahoot.it/rest/kahoots/<uuid>/card/?includeKahoot=true" > <dir>/<uuid>.json
# then:  python -I gen-kahoots.py <dir> content/kahoots.js     (uuids, holds and the one fix are listed below)
# Writes hs2-test3/content/kahoots.js from the public Kahoot snapshots (scratchpad/kahoot/<uuid>.json). Run with -I.
import json, sys, re, html
D, OUT = sys.argv[1], sys.argv[2]
def clean(s): return re.sub(r'\s+', ' ', html.unescape(re.sub(r'<[^>]+>', '', s or '')).replace('\u00a0', ' ')).strip()
KS = [
  ('kh-m23rev', '18f54734-c112-4a5f-9a4b-0c1a1eaab6b1', 'exam-revision-kahoot', 'Her Kahoot · Module 2 & 3 revision', 'her'),
  ('kh-m3prac', '5f810ccb-c81f-4f38-9580-ffe82a971dfa', 'hs2-module-3-practice-2021', 'Her Kahoot · Module 3 practice', 'her'),
  ('kh-genetics', '1c9c0185-820c-4547-8b09-04a3cd246601', 'basic-genetics', 'Her Kahoot · Basic genetics', 'her'),
  ('kh-emma-prep', 'e9b00ff4-fb20-4fec-b25b-b7c36ce4f99f', 'health-science-2-prep-for-exam-quiz', 'Emma’s Kahoot · Prep for exam', 'emma'),
]
HOLD = {('kh-genetics', 4): 'needs its flower picture (red + white parents → pink, or red-and-white patches): unanswerable without it, and the picture is Getty stock',
        ('kh-genetics', 5): 'needs its flower picture (red + white parents → pink, or red-and-white patches): unanswerable without it, and the picture is Getty stock',
        ('kh-genetics', 12): '"This is the ___ of a normal ___" asks about its picture (a karyotype), which is Getty stock'}
FIX = {('kh-m23rev', 2): {'from': 'Nitrous oxide', 'to': 'Nitric oxide',
        'note': 'Her Kahoot says “Nitrous oxide” (that is laughing gas). Her own Module 3 revision deck, slide 6, says “Nitric oxide released”: nitric oxide is the answer, so the option reads that here.'}}
out = []
for qid, uuid, slug, name, by in KS:
    k = json.load(open(f'{D}/{uuid}.json', encoding='utf-8'))['kahoot']
    items = []
    for n, q in enumerate(k['questions'], 1):
        opts = [clean(c.get('answer')) for c in q['choices']]
        key = [clean(c.get('answer')) for c in q['choices'] if c.get('correct')]
        typ = 'tf' if sorted(opts) == ['False', 'True'] else ('multi' if len(key) > 1 else 'mcq')
        it = {'n': n, 'type': typ, 'q': clean(q['question']), 'opts': opts, 'key': key}
        if (qid, n) in FIX:
            f = FIX[(qid, n)]
            assert f['from'] in opts, (qid, n)
            it['opts'] = [f['to'] if o == f['from'] else o for o in opts]
            it['key'] = [f['to'] if o == f['from'] else o for o in key]
            it['orig'] = f['from']; it['note'] = f['note']
        if (qid, n) in HOLD: it['hold'] = HOLD[(qid, n)]
        items.append(it)
    out.append({'quiz': qid, 'name': name, 'by': by, 'title': k['title'],
                'url': f'https://create.kahoot.it/share/{slug}/{uuid}', 'items': items})
hdr = '''/* KAHOOTS — the Module 3 Kahoots linked from Canvas, as their OWN category in this tool (his call 12 Oct 2026: "give it its own
   category … I feel like it's lower yield"). They never enter Learn-the-whole-bank, the mock tests, the misses pile, the per-system
   sets or her question counts; they live in their own section under Pick my rep, each question tagged 🎮, and a checklist row only
   says how many of them land on it.
   Source: Canvas page "MODULE 3 KAHOOT (4 FOR MOD 3 + EXAM)" lists her three (account Han123_123) and Emma's "Module 2&3 Part 2";
   Emma's "Health Science 2 Prep for Exam Quiz" is linked from "Anatomy Mondays 15 Exam Prep" and her EXAM CASE STUDY HELPLINE.
   Emma's "Module 2&3 Part 2" (3bbeb5ad…) is NOT shipped: its Module 3 questions are all in her Prep for Exam quiz (two differ by a
   typo) and its other two are Module 2 reflexes. Canvas links "Basic genetics" with the last character of its id missing; the
   full id was recovered against Kahoot's public API.
   Snapshot of each Kahoot's public data, 12 Oct 2026: stems, options and the key marked correct, word for word (their spelling kept).
   Their pictures are all Getty stock from Kahoot's library: decorative, and not ours to copy, so none ship. A question that cannot
   be answered without its picture carries `hold` and does not ship. `orig` + `note` = an option corrected here; the page shows
   both. Regenerate with gen-kahoots.py if they edit them. */
export const KAHOOTS = '''
open(OUT, 'w', encoding='utf-8', newline='\n').write(hdr + json.dumps(out, ensure_ascii=False, indent=1) + ';\n')
print(sum(len(x['items']) for x in out), 'items,', sum(1 for x in out for i in x['items'] if 'hold' in i), 'held')
