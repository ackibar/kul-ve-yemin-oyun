"""Ocak bolgesini alevsiz olarak YENIDEN URETIR ve arka plana yerlestirir.

Neden: boyali gorsel duz PNG, alevin "altinda" saklanmis koz yok. Alevi silip
bosluğu tahmin etmek denendi - halkadan rastgele renk (benekli) ve alttan
dikey ornekleme (lekeli) ikisi de kotu sonuc verdi. Bu yuzden bosluk
uydurulmuyor: ocagin cevresiyle birlikte kirpilip modele "ayni ocak, alevsiz"
dedirtiliyor, donen yama kenarlari yumusatilarak geri konuyor.
"""
import base64, io, json, os, sys, urllib.request
sys.path.insert(0, os.path.dirname(__file__))
from PIL import Image, ImageFilter

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MODEL = 'gemini-3-pro-image'
SRC = f'{ROOT}/generated/arkaplan/haven_zengin.png'
OUT = f'{ROOT}/generated/arkaplan/haven_alevsiz.png'

PROMPT = """This is a crop from a top-down pixel-art game map: a stone fire pit with a flame.

Redraw this exact crop with the FLAME REMOVED.

KEEP IDENTICAL:
- The ring of stones: same stones, same shapes, same positions, same shading.
- The floor, dirt, moss and every object around the pit, pixel for pixel.
- The overall warm lamplit palette and the light direction.
- The image size and framing.

CHANGE ONLY the inside of the pit: instead of a flame, show charred logs and
glowing orange embers with grey ash, as if the fire has just burned down.
The embers still glow warmly but NO flame, no fire, no smoke rises above the stones.

STYLE: 16-bit SNES pixel art, chunky pixels on a clear grid, no blur, no
anti-aliasing, no gradients. No text, no border, no grid lines."""


def key():
    for l in open(f'{ROOT}/.env.local'):
        if l.startswith('GEMINI_API_KEY='):
            return l.split('=', 1)[1].strip()


def b64(img):
    b = io.BytesIO(); img.save(b, 'PNG'); return base64.b64encode(b.getvalue()).decode()


def uret(crop):
    big = crop.resize((512, 512), Image.NEAREST)   # model kucuk kirpimi iyi okusun
    body = {'contents': [{'parts': [
        {'inlineData': {'mimeType': 'image/png', 'data': b64(big)}},
        {'text': PROMPT}]}],
        'generationConfig': {'responseModalities': ['IMAGE'],
                             'imageConfig': {'imageSize': '1K', 'aspectRatio': '1:1'}}}
    url = f'https://generativelanguage.googleapis.com/v1beta/models/{MODEL}:generateContent?key={key()}'
    import time, urllib.error
    for deneme in range(6):          # 429 (hiz siniri) icin ustel bekleme
        try:
            req = urllib.request.Request(url, data=json.dumps(body).encode(),
                                         headers={'Content-Type': 'application/json'})
            res = json.load(urllib.request.urlopen(req, timeout=300))
            break
        except urllib.error.HTTPError as e:
            if e.code != 429 or deneme == 5:
                raise
            bekle = 12 * (deneme + 1)
            print(f'    429 - {bekle}sn bekleniyor')
            time.sleep(bekle)
    for c in res.get('candidates', []):
        for p in c.get('content', {}).get('parts', []):
            if 'inlineData' in p:
                return Image.open(io.BytesIO(base64.b64decode(p['inlineData']['data']))).convert('RGB')
    raise RuntimeError('gorsel yok')


def main(pits, feather=6):
    im = Image.open(SRC).convert('RGB')
    os.makedirs(f'{ROOT}/generated/ocak', exist_ok=True)
    for i, (cx, cy, R) in enumerate(pits):
        box = (cx - R, cy - R, cx + R, cy + R)
        crop = im.crop(box)
        yama = uret(crop).resize(crop.size, Image.LANCZOS)
        yama.save(f'{ROOT}/generated/ocak/yama{i}.png')
        # kenarlari yumusak maske ile birlestir: kirpim sinirinda dikis olmasin
        m = Image.new('L', crop.size, 0)
        inner = int(min(crop.size) * 0.5) - feather
        m.paste(255, (crop.size[0] // 2 - inner, crop.size[1] // 2 - inner,
                      crop.size[0] // 2 + inner, crop.size[1] // 2 + inner))
        m = m.filter(ImageFilter.GaussianBlur(feather))
        im.paste(yama, box, m)
        print(f'  ocak{i} alevsiz yama yerlestirildi {crop.size}')
    im.save(OUT)
    print('->', OUT)


if __name__ == '__main__':
    main([(389, 299, 56), (643, 348, 48), (631, 588, 50)])
