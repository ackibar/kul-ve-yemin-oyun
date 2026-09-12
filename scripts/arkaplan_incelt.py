"""Mevcut arka planin ISCILIGINI inceltir, yerlesimini KORUR.

Yeni bir sahne uretmek mobilyayi yerinden oynatir ve elle cikarilmis 19 carpisma
kutusu gecersiz olur. Bu yuzden mevcut gorsel girdi olarak verilir ve modelden
yalnizca detay artirmasi istenir; her nesne ayni pikselde kalmalidir.
"""
import base64, io, json, os, sys, urllib.request
from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MODEL = 'gemini-3-pro-image'


def key():
    for l in open(f'{ROOT}/.env.local'):
        if l.startswith('GEMINI_API_KEY='):
            return l.split('=', 1)[1].strip()


def b64(img):
    b = io.BytesIO(); img.save(b, 'PNG'); return base64.b64encode(b.getvalue()).decode()


PROMPT = """This is a finished top-down pixel-art game map. Redraw it with FINER CRAFTSMANSHIP,
keeping the composition byte-for-byte in place.

WHAT MUST NOT CHANGE - this is the hard constraint:
- Every object stays at exactly the same position and the same size. Do not move, resize,
  add or remove any bed, table, stool, crate, barrel, shelf, cabinet, curtain, beam or fire pit.
- The room outline, wall thickness and all openings stay identical.
- The fire pits stay as glowing embers and coals with NO flame above them (flames are added
  separately by the game engine). Do not draw fire.

WHAT TO IMPROVE - add craft, not clutter:
- Beds: visible wooden frame rails, a folded blanket with fabric folds, a pillow with a dent,
  straw poking from the mattress edge.
- Tables and workbenches: plank seams along the top, visible joinery at the legs, a worn edge,
  tools and cups reading as distinct silhouettes rather than blobs.
- Stools: round or square seat clearly separated from three or four legs, a small shadow.
- Hanging laundry and curtains: cloth folds with light and shade, a sagging rope line,
  a couple of pegs.
- Firewood: individual logs with visible cut ends and bark texture, stacked believably.
- Crates and barrels: plank lines, iron bands, corner brackets.
- Floor: keep it calm. Do not add new debris or busy noise.

STYLE:
- 16-bit SNES action RPG pixel art, chunky readable pixels on a clear grid.
- No blur, no soft gradients, no anti-aliasing, no painterly texture.
- Keep the existing warm lamplit palette and the existing light directions.
- No characters, creatures, people, text, UI, grid lines or borders."""


def main():
    src = Image.open(f'{ROOT}/public/assets/arkaplan/haven.png').convert('RGB')
    body = {'contents': [{'parts': [
        {'inlineData': {'mimeType': 'image/png', 'data': b64(src)}},
        {'text': PROMPT}]}],
        'generationConfig': {'responseModalities': ['IMAGE'],
                             'imageConfig': {'imageSize': '2K', 'aspectRatio': '1:1'}}}
    url = f'https://generativelanguage.googleapis.com/v1beta/models/{MODEL}:generateContent?key={key()}'
    req = urllib.request.Request(url, data=json.dumps(body).encode(),
                                 headers={'Content-Type': 'application/json'})
    res = json.load(urllib.request.urlopen(req, timeout=300))
    for c in res.get('candidates', []):
        for p in c.get('content', {}).get('parts', []):
            if 'inlineData' in p:
                raw = Image.open(io.BytesIO(base64.b64decode(p['inlineData']['data']))).convert('RGB')
                raw.save(f'{ROOT}/_arsiv/uretim/generated/arkaplan/haven_ince_ham.png')
                out = raw.resize(src.size, Image.LANCZOS)
                out.save(f'{ROOT}/_arsiv/uretim/generated/arkaplan/haven_ince.png')
                print(f'ham {raw.size} -> {out.size}')
                return
    raise SystemExit('gorsel yok: ' + json.dumps(res)[:300])


if __name__ == '__main__':
    main()
