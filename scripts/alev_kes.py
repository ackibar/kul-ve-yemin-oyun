"""Boyali alevleri arka plandan KATMAN olarak ayirir.

Onceki deneme alevi silip yerini halkadan alinan rastgele tas renkleriyle
dolduruyordu; benekli ve kotu duruyordu. Burada iki fark var:
  1) Alev AYRI PNG olarak saklanir (katman) - istenirse geri konabilir.
  2) Bosluk, alevin hemen ALTINDAKI koz dokusundan dikey ornekleme ile
     doldurulur; koz zaten alevin altinda oldugu icin sonuc dogal gorunur.
     Sonra yalnizca doldurulan bolgeye hafif bulanikliK uygulanir, cizgilenme
     kalmasin diye.
"""
import os, sys
sys.path.insert(0, os.path.dirname(__file__))
from PIL import Image, ImageFilter

SRC = '_arsiv/uretim/generated/arkaplan/haven_zengin.png'
BG_OUT = '_arsiv/uretim/generated/arkaplan/haven_alevsiz.png'
LAYER_OUT = '_arsiv/uretim/generated/alev_katman'


def is_flame(c):
    r, g, b = c[:3]
    return (r > 195 and g > 125 and b < 165 and r - b > 65) or (r > 230 and g > 200 and b > 145)


def main(pits):
    im = Image.open(SRC).convert('RGB')
    px = im.load()
    W, H = im.size
    os.makedirs(LAYER_OUT, exist_ok=True)
    doldurulan = []
    for i, (cx, cy, R) in enumerate(pits):
        x0, y0 = max(0, cx - R), max(0, cy - R)
        x1, y1 = min(W, cx + R + 1), min(H, cy + R + 1)
        # 1) alev maskesi
        mask = [[False] * (x1 - x0) for _ in range(y1 - y0)]
        for y in range(y0, y1):
            for x in range(x0, x1):
                if (x - cx) ** 2 + (y - cy) ** 2 <= R * R and is_flame(px[x, y]):
                    mask[y - y0][x - x0] = True
        # 2) alevi katman olarak kaydet
        lay = Image.new('RGBA', (x1 - x0, y1 - y0), (0, 0, 0, 0))
        lp = lay.load()
        for y in range(y1 - y0):
            for x in range(x1 - x0):
                if mask[y][x]:
                    lp[x, y] = px[x0 + x, y0 + y] + (255,)
        lay.save(f'{LAYER_OUT}/alev{i}.png')
        # 3) bosluğu ALTTAN ornekleyerek doldur (koz alevin altinda)
        for y in range(y1 - y0):
            for x in range(x1 - x0):
                if not mask[y][x]:
                    continue
                sy = y
                while sy < y1 - y0 and mask[sy][x]:
                    sy += 1
                if sy < y1 - y0:
                    src = px[x0 + x, y0 + sy]
                else:                       # altta koz kalmadiysa yandan al
                    sx = x
                    while sx < x1 - x0 - 1 and mask[y][sx]:
                        sx += 1
                    src = px[x0 + sx, y0 + y]
                px[x0 + x, y0 + y] = tuple(int(v * .82) for v in src)
                doldurulan.append((x0 + x, y0 + y))
        print(f'  ocak{i}: {sum(r.count(True) for r in mask)} alev pikseli katmana alindi')
    # 4) yalnizca doldurulan bolgeyi yumusat
    blur = im.filter(ImageFilter.GaussianBlur(1.2))
    bp = blur.load()
    for x, y in doldurulan:
        px[x, y] = bp[x, y]
    im.save(BG_OUT)
    print(f'toplam {len(doldurulan)} piksel dolduruldu -> {BG_OUT}')


if __name__ == '__main__':
    # zengin gorseldeki ocak merkezleri (piksel, 960x896)
    main([(389, 299, 46), (643, 348, 38), (631, 588, 40)])
