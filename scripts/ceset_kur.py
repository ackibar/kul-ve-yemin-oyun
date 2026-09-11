"""Yesil fonlu ceset gorselini oyunun 64x64 hucresine kurar.

Anahtar rengi gorselin guclu yesil piksellerinden olculur (kenardan degil).
Spill, karisim cozulerek cikarilir: P = k*K + (1-k)*gercek. Ton kapisi var -
fonun yesili maviye calar, bu sahnedeki kan ve deri ona benzemez.
Olcek: karakter hucresi 64 px ve ayakta duran figur ~62 px boyunda; yatan
govde de o boyu EN olarak alir, yani ~60 px genisliginde oturtulur.
"""
import os, sys
import numpy as np
from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CELL = 64
HEDEF_EN = 60          # yatan govdenin hucre icindeki genisligi
T_LO, T_HI = 12, 55


def kur(kaynak, hedef):
    p = np.asarray(Image.open(kaynak).convert('RGB')).astype(float)
    yes = p[..., 1] - np.maximum(p[..., 0], p[..., 2])
    guclu = yes > 60
    if guclu.sum() < p[..., 0].size * .02:
        sys.exit('yesil fon bulunamadi')
    key = np.median(p[guclu], 0)
    alfa = np.clip((T_HI - yes) / (T_HI - T_LO), 0, 1)

    # spill: maviye calan yesil fon bulasigi, karisim cozulerek cikarilir
    r, b = p[..., 0], p[..., 2]
    ton = np.clip((b - r + 5) / 15, 0, 1)
    k = (np.clip(yes / (key[1] - max(key[0], key[2])), 0, .6) * ton)[..., None]
    rgb = np.clip((p - k * key) / np.maximum(1 - k, 1e-3), 0, 255)

    im = Image.fromarray(np.dstack([rgb.astype(np.uint8),
                                    (alfa * 255).astype(np.uint8)]), 'RGBA')
    # yari saydam gurultuyu at, sonra nesneye kirp
    a = np.asarray(im)[..., 3]
    im.putalpha(Image.fromarray(np.where(a < 40, 0, a).astype(np.uint8)))
    bb = im.getbbox()
    kirp = im.crop(bb)
    oran = HEDEF_EN / kirp.width
    yeni = kirp.resize((HEDEF_EN, max(1, round(kirp.height * oran))), Image.LANCZOS)
    out = Image.new('RGBA', (CELL, CELL), (0, 0, 0, 0))
    out.paste(yeni, (CELL // 2 - yeni.width // 2, CELL - 4 - yeni.height))
    out.save(hedef)
    print(f'  fon={key.round(0)}  kaynak kirpim={kirp.size} -> {yeni.size}  hucre={CELL}x{CELL}')
    print(f'-> {hedef}')


if __name__ == '__main__':
    kur(sys.argv[1], sys.argv[2])
