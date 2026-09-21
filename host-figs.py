"""Lift the pictures listed under "media" in content/hosted-figs.json out of her decks, at full resolution, into img/figs/.
The media name is checked against the slide's own relationships, so a deck that changes cannot hand over a different picture.
Transparent PNGs are laid on white (her labels are black text on nothing). Longest side capped at 1400 px. Run BEFORE build.mjs (the build checks the files exist)."""
import io, json, os, re, sys, zipfile
from PIL import Image
H = json.load(open(os.path.join('content', 'hosted-figs.json'), encoding='utf-8'))
os.makedirs(os.path.join('img', 'figs'), exist_ok=True)
for f in H['media']:
    z = zipfile.ZipFile(f['pptx'])
    rels = z.read(f"ppt/slides/_rels/slide{f['slide']}.xml.rels").decode('utf8')
    if f['media'] not in re.findall(r'Target="\.\./media/([^"]+)"', rels): sys.exit(f"{f['out']}: {f['media']} is not on slide {f['slide']} of {f['pptx']}")
    im = Image.open(io.BytesIO(z.read('ppt/media/' + f['media'])))
    if im.mode in ('RGBA', 'LA', 'P'):
        im = im.convert('RGBA'); bg = Image.new('RGBA', im.size, (255, 255, 255, 255)); bg.alpha_composite(im); im = bg
    im = im.convert('RGB'); im.thumbnail((1400, 1400), Image.LANCZOS)
    dest = os.path.join('img', 'figs', f['out'])
    if dest.endswith('.png'): im.save(dest, 'PNG', optimize=True)
    else: im.save(dest, 'JPEG', quality=85, optimize=True)
    print(f"{f['out']}: {im.size[0]}x{im.size[1]}, {os.path.getsize(dest) // 1024} KB")
