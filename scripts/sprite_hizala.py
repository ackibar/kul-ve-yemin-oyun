"""Karakter sheet'lerini GOVDE merkezine gore hizalar.

Sorun: her sheet kendi bbox'ina gore ortalandigi icin sistematik kayiyordu.
Kilicli sette D_Walk kafa merkezi 37.5 (5.5px sagda), U_Walk 25 (7px solda);
bu hem golgeyi kacik gosteriyor hem yon degistirince titreme yaratiyordu.

Neden govde: kare kare salinimi en dusuk olan bolge (1.0-2.9px), ayak ise
1.1-5.2px zipliyor - yuruyusun dogal salinimi oradan geliyor, onu bozmak
istemiyoruz. Sheet'in ORTALAMA govde merkezi hucre ortasina tasinir; kare ici
salinim oldugu gibi kalir.
"""
import os, sys
from PIL import Image

CELL = 64


def govde_merkez(k):
    px = k.load()
    bb = k.getbbox()
    if not bb:
        return None
    h = bb[3] - bb[1]
    a, b = bb[1] + int(h * 0.15), bb[1] + int(h * 0.55)
    s = [sum(1 for y in range(a, b) if px[x, y][3] > 0) for x in range(CELL)]
    t = sum(s)
    return sum(x * n for x, n in enumerate(s)) / t if t else None


def hizala(klasor):
    rapor = []
    for f in sorted(os.listdir(klasor)):
        if not f.endswith('.png'):
            continue
        p = os.path.join(klasor, f)
        im = Image.open(p).convert('RGBA')
        n = im.width // CELL
        fr = [im.crop((i * CELL, 0, i * CELL + CELL, CELL)) for i in range(n)]
        m = [govde_merkez(k) for k in fr]
        m = [x for x in m if x is not None]
        if not m:
            continue
        dx = round(CELL / 2 - sum(m) / len(m))
        if dx:
            out = Image.new('RGBA', im.size, (0, 0, 0, 0))
            for i, k in enumerate(fr):
                kay = Image.new('RGBA', (CELL, CELL), (0, 0, 0, 0))
                kay.paste(k, (dx, 0))
                out.paste(kay, (i * CELL, 0))
            out.save(p)
        rapor.append((f, dx))
    return rapor


if __name__ == '__main__':
    for kl in sys.argv[1:] or ['public/assets/characters/1',
                               'public/assets/characters/1sword',
                               'public/assets/characters/2',
                               'public/assets/characters/3',
                               'public/assets/characters/4']:
        r = hizala(kl)
        kaydirilan = [f'{f.replace(".png","")}{d:+d}' for f, d in r if d]
        print(f'{kl.split("/")[-1]:8s} {len(r)} sheet, {len(kaydirilan)} kaydirildi'
              + (f'  [{", ".join(kaydirilan[:6])}]' if kaydirilan else ''))
