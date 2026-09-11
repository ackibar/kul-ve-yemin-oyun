"""Mekan nesnelerini TEK TEK uretir (Nano Banana) ve saydam PNG'ye cevirir.

Neden ayri: mobilyayi arka plana boyatmak carpismayi tersten cozmeyi gerektiriyordu
ve bir nesneyi degistirmek tum duzeni bozuyordu. Nesne ayri sprite olunca konumu
ve carpisma kutusu bizde kalir, biri begenilmezse yalnizca o yeniden uretilir,
ayrica karakter nesnenin arkasina gecebilir (derinlik siralamasi).

Akis: duz mavi zeminde uret -> flood-fill chroma key (pixelize.chroma_key,
palete Lab olarak en uzak renk mavi oldugu icin nesnenin rengini yemez)
-> bbox'a kirp -> hedef dunya genisligine olcekle (2x yogunluk).
"""
import base64, io, json, os, sys, urllib.request
sys.path.insert(0, os.path.dirname(__file__))
from PIL import Image
import pixelize as P

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MODEL = 'gemini-3-pro-image'
OUT = f'{ROOT}/public/assets/nesne'
RAW = f'{ROOT}/generated/nesne'
CHROMA = '#0000FF'
R = 2                     # render yogunlugu: 1 dunya birimi = 2 piksel

STIL = ('16-bit SNES action RPG pixel art, chunky readable pixels on a clear grid, '
        'no blur, no anti-aliasing, no soft gradients, muted warm lamplit palette, '
        'single dark outline, viewed straight down at a slight angle (top-down game prop)')

# ad: (tarif, dunya birimi genislik)  -- yukseklik orandan hesaplanir
NESNELER = {
    'yatak1':   ('a simple wooden bed with a rumpled orange-brown blanket, a dented pillow, '
                 'visible plank frame rails and straw at the mattress edge', 48),
    'yatak2':   ('a narrow wooden cot with a folded grey blanket, thin pillow, worn frame', 44),
    'tezgah':   ('a long sturdy workbench covered with blacksmith tools, a hammer, tongs and '
                 'small parts, plank seams along the top, visible joinery at the legs', 72),
    'masa':     ('a small square wooden table with a candle and a rolled map on it', 40),
    'tabure':   ('a small round wooden stool with three legs', 18),
    'sandik':   ('a closed wooden chest with iron bands and a latch', 26),
    'kasa':     ('a stack of two wooden crates with plank lines and corner brackets', 30),
    'fici':     ('a wooden barrel with iron hoops, standing upright', 22),
    'raf':      ('a tall narrow wooden shelf holding clay jars, folded cloth and supplies', 26),
    'odun':     ('a neat stack of chopped firewood logs, cut ends and bark texture visible', 30),
    'camasir':  ('a sagging rope washing line with two hanging cloths and wooden pegs', 52),
    'fener':    ('an old oil lantern with warm glowing glass, standing on the ground', 14),
    # Ocak BILEREK alevsiz: hareketli alevi motor ayri sprite olarak ustune ciziyor.
    # Onceki denemede boyali alev programatik silinmeye calisildi ve kotu duruyordu.
    'ocak':     ('a circular fire pit built from rough stones, filled with charred logs and '
                 'glowing orange embers and ash, NO flame and no fire above it, just embers', 34),
}


def key():
    for l in open(f'{ROOT}/.env.local'):
        if l.startswith('GEMINI_API_KEY='):
            return l.split('=', 1)[1].strip()


def uret(ad, tarif, genislik):
    prompt = f"""Draw ONE single game object: {tarif}.

{STIL}

REQUIREMENTS:
- The object fills most of the frame, centred, seen from a top-down game camera.
- Background must be a single flat uniform {CHROMA} (pure blue). Nothing else in the
  frame: no floor, no shadow on the ground, no scenery, no second object, no text,
  no border, no grid.
- No characters, creatures or people.
- Keep detail bold and readable: this is shrunk to about {genislik * R} pixels wide."""
    body = {'contents': [{'parts': [{'text': prompt}]}],
            'generationConfig': {'responseModalities': ['IMAGE'],
                                 'imageConfig': {'imageSize': '1K', 'aspectRatio': '1:1'}}}
    url = f'https://generativelanguage.googleapis.com/v1beta/models/{MODEL}:generateContent?key={key()}'
    req = urllib.request.Request(url, data=json.dumps(body).encode(),
                                 headers={'Content-Type': 'application/json'})
    res = json.load(urllib.request.urlopen(req, timeout=300))
    for c in res.get('candidates', []):
        for p in c.get('content', {}).get('parts', []):
            if 'inlineData' in p:
                return Image.open(io.BytesIO(base64.b64decode(p['inlineData']['data']))).convert('RGBA')
    raise RuntimeError(ad + ': gorsel yok')


def isle(raw, genislik):
    keyed = P.chroma_key(raw)
    bb = keyed.getbbox()
    if not bb:
        raise RuntimeError('bos nesne')
    sp = keyed.crop(bb)
    tw = genislik * R
    th = max(1, round(sp.height * tw / sp.width))
    sp = sp.resize((tw, th), Image.LANCZOS)
    px = sp.load()
    for y in range(th):
        for x in range(tw):
            r, g, b, a = px[x, y]
            px[x, y] = (r, g, b, 255) if a >= 128 else (0, 0, 0, 0)
    return sp


if __name__ == '__main__':
    os.makedirs(OUT, exist_ok=True); os.makedirs(RAW, exist_ok=True)
    hedef = sys.argv[1:] or list(NESNELER)
    for ad in hedef:
        tarif, gen = NESNELER[ad]
        try:
            raw = uret(ad, tarif, gen)
            raw.save(f'{RAW}/{ad}_ham.png')
            sp = isle(raw, gen)
            sp.save(f'{OUT}/{ad}.png')
            print(f'  {ad:9s} {sp.size}  ({gen} dunya birimi genislik)')
        except Exception as e:
            print(f'  {ad:9s} HATA: {e}')
