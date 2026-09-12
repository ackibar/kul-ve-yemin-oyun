"""Ates animasyonunu daha yuksek cozunurlukte yeniden uretir.

Sorun: mevcut Fire1.png karesi 16 dunya birimi icin 32 piksel, yani arka planla
AYNI yogunlukta. Ocagi doldurmak icin 2x olcekleyince her piksel arka planinkinin
iki kati oluyor ve blok blok duruyor.

Cozum: her kare, eski karenin kendisi YAPI REFERANSI verilerek yeniden cizilir.
Boylece alevin kare kare sekli ve animasyon zamanlamasi korunur, yalnizca
cozunurluk artar. Cikti 32 dunya birimi (64x64 px) => olcek 1.0'da tam oturur.
"""
import base64, io, json, os, sys, urllib.request
sys.path.insert(0, os.path.dirname(__file__))
from PIL import Image
import pixelize as P

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MODEL = 'gemini-3-pro-image'
SRC = f'{ROOT}/public/assets/dungeon/3 Animated objects/Fire1.png'
OUT = f'{ROOT}/public/assets/dungeon/3 Animated objects/Fire1.png'
RAW = f'{ROOT}/_arsiv/uretim/generated/alev'
CHROMA = '#0000FF'
CELL = 64          # hedef: 32 dunya birimi x 2 yogunluk


def key():
    for l in open(f'{ROOT}/.env.local'):
        if l.startswith('GEMINI_API_KEY='):
            return l.split('=', 1)[1].strip()


def b64(img):
    b = io.BytesIO(); img.save(b, 'PNG'); return base64.b64encode(b.getvalue()).decode()


def uret(ref, i, n):
    poz = Image.new('RGB', (512, 512), (245, 245, 245))
    big = ref.resize((384, 384), Image.NEAREST)
    poz.paste(big, (64, 64), big)
    prompt = f"""IMAGE 1 is frame {i+1} of {n} of a looping campfire flame animation,
shown as a low-resolution reference on a light background.

Redraw this SAME flame shape at higher resolution.

KEEP:
- The silhouette, height, lean and overall shape of the flame in IMAGE 1.
- The same moment of the animation: do not invent a different flame pose.

IMPROVE:
- More resolution and finer pixel detail: a bright yellow-white core, an orange
  body, darker red-orange edges, a few small sparks rising.

REQUIREMENTS:
- Background must be a single flat uniform {CHROMA} (pure blue). No embers,
  no logs, no stones, no ground, no glow bleeding into the background.
- Only the flame itself, centred, filling most of the frame.
- 16-bit SNES pixel art, chunky readable pixels on a clear grid, no blur,
  no anti-aliasing, no soft gradients. No text, no border."""
    body = {'contents': [{'parts': [
        {'inlineData': {'mimeType': 'image/png', 'data': b64(poz)}},
        {'text': prompt}]}],
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
    raise RuntimeError(f'kare {i}: gorsel yok')


def main():
    os.makedirs(RAW, exist_ok=True)
    src = Image.open(SRC).convert('RGBA')
    n = src.width // 32
    kareler = []
    for i in range(n):
        ref = src.crop((i * 32, 0, i * 32 + 32, 32))
        raw = uret(ref, i, n)
        raw.save(f'{RAW}/ham{i}.png')
        keyed = P.chroma_key(raw)
        bb = keyed.getbbox()
        sp = keyed.crop(bb) if bb else keyed
        # kareyi CELL tuvaline, tabani sabit kalacak sekilde otur
        k = min(CELL / sp.width, CELL / sp.height)
        nw, nh = max(1, round(sp.width * k)), max(1, round(sp.height * k))
        sp = sp.resize((nw, nh), Image.LANCZOS)
        px = sp.load()
        for y in range(nh):
            for x in range(nw):
                r, g, b, a = px[x, y]
                px[x, y] = (r, g, b, 255) if a >= 128 else (0, 0, 0, 0)
        cel = Image.new('RGBA', (CELL, CELL), (0, 0, 0, 0))
        cel.paste(sp, ((CELL - nw) // 2, CELL - nh))     # taban hizali
        kareler.append(cel)
        print(f'  kare {i+1}/{n} hazir')
    sheet = Image.new('RGBA', (CELL * n, CELL), (0, 0, 0, 0))
    for i, c in enumerate(kareler):
        sheet.paste(c, (i * CELL, 0))
    sheet.save(OUT)
    print(f'-> {OUT}  {sheet.size}  ({n} kare x {CELL}px = {CELL//2} dunya birimi)')


if __name__ == '__main__':
    main()
