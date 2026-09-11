"""Bolge icin tek parca arka plan gorseli uretir (Nano Banana).

Karo dosemek yerine mekanin tamami tek gorsel olarak cizilir; boylece tekrar
eden desen ve karo boyutu sorunu ortadan kalkar. Kritik nokta: uretilen gorsel
oyunun CARPISMA izgarasini bilmez, bu yuzden plan (beyaz=yurunebilir zemin,
siyah=duvar) yapi referansi olarak beslenir ve modele birebir uymasi soylenir.
"""
import base64, io, json, os, sys, urllib.request
from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MODEL = 'gemini-3-pro-image'

# BOS ODA tarifleri: mobilya YOK. Yatak/masa/sandik gibi her sey ayri sprite
# olarak uretilip ustune konuyor (scripts/nesne_uret.py); boylece carpisma ve
# derinlik siralamasi bizde kalir, bir nesneyi degistirmek duzeni bozmaz.
ZONE_DESC = {
    'haven': ('the empty stone floor of an underground shelter: warm lamplit flagstones, '
              'worn dirt patches, patches of moss in the corners, small cracks and pebbles, '
              'plain stone walls with wooden support beams, nothing else'),
    'cistern': ('a forgotten flooded cistern: damp dark stone, shallow water pools with reflections, '
                'dripping arches, thick moss and mould, broken pipes, cold and silent'),
    'forge': ('an ash forge deep underground: cracked scorched stone, glowing ember veins in the floor, '
              'soot stains, iron grates, dull orange light, smoke haze'),
}


def key():
    for l in open(f'{ROOT}/.env.local'):
        if l.startswith('GEMINI_API_KEY='):
            return l.split('=', 1)[1].strip()


def b64(img, fmt='PNG'):
    b = io.BytesIO(); img.save(b, fmt); return base64.b64encode(b.getvalue()).decode()


def generate(zone, size):
    plan = Image.open(f'{ROOT}/generated/plan/{zone}.png').convert('RGB')
    prompt = f"""IMAGE 1 is a STRUCTURE PLAN for a top-down 2D game level. It is not art.
WHITE = walkable floor. BLACK = solid wall / void the player can never enter.

Paint a single top-down pixel-art game background of {ZONE_DESC[zone]}.

ABSOLUTE LAYOUT RULE - this is the most important requirement:
Every WHITE pixel region in IMAGE 1 must become open walkable floor.
Every BLACK region must become solid wall or dark void.
Do not move, reshape, round off, add or remove any room, corridor or opening.
The silhouette of the walkable area must match IMAGE 1 exactly, edge for edge.

STYLE:
- Top-down view, straight down at a slight angle, like a 16-bit SNES action RPG.
- Chunky readable pixel art on a clear pixel grid. No blur, no soft gradients,
  no anti-aliasing, no painterly brush texture.
- Floor detail must be LARGE and calm: big stone slabs, not a fine busy grid.
  A player character stands about 1/14 of the image height, so keep every
  detail big enough to read at that size.
- Muted, desaturated palette so dark character sprites stay readable on top.
- Light the scene from scattered fire sources; keep corners darker.

DO NOT draw ANY furniture or props: no beds, tables, stools, crates, barrels, shelves,
chests, curtains, laundry, firewood, lanterns, fire pits, tools or sacks. They are added
separately as sprites. Draw ONLY the floor, the walls and fixed architecture.
DO NOT draw any characters, creatures, people, text, UI, icons, grid lines,
borders or frames."""
    body = {'contents': [{'parts': [
        {'inlineData': {'mimeType': 'image/png', 'data': b64(plan)}},
        {'text': prompt}]}],
        'generationConfig': {'responseModalities': ['IMAGE'],
                             'imageConfig': {'imageSize': size, 'aspectRatio': '1:1'}}}
    url = f'https://generativelanguage.googleapis.com/v1beta/models/{MODEL}:generateContent?key={key()}'
    req = urllib.request.Request(url, data=json.dumps(body).encode(),
                                 headers={'Content-Type': 'application/json'})
    res = json.load(urllib.request.urlopen(req, timeout=300))
    for c in res.get('candidates', []):
        for p in c.get('content', {}).get('parts', []):
            if 'inlineData' in p:
                return Image.open(io.BytesIO(base64.b64decode(p['inlineData']['data']))).convert('RGB')
    raise SystemExit('gorsel yok: ' + json.dumps(res)[:400])


if __name__ == '__main__':
    zone = sys.argv[1]
    size = sys.argv[2] if len(sys.argv) > 2 else '2K'
    world = {d['zone']: d for d in json.load(
        open('/tmp/claude-501/-Users-can/51650aa6-4bf1-4ab1-86e3-39d5ee0a1589/scratchpad/dunya.json'))}[zone]
    target = (world['w'] * 32, world['h'] * 32)          # 2x render yogunlugu
    raw = generate(zone, size)
    raw.save(f'{ROOT}/generated/arkaplan/{zone}_ham.png')
    out = raw.resize(target, Image.LANCZOS)
    out.save(f'{ROOT}/generated/arkaplan/{zone}.png')
    print(f'{zone}: ham {raw.size} -> oyun {out.size}  (plan {world["w"]}x{world["h"]} karo)')
