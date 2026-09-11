"""Pixel-art 9-dilim cerceveler (CSS border-image icin).

Tasarim notlari:
  * Kenarlar BILEREK duzgun degil: dis konturda tekrar eden kucuk centikler var,
    boylece cizgi cetvelle cizilmis gibi durmuyor, elle yirtilmis parsomen gibi.
    Desen 8px dilimde tekrar ettigi icin doseme bozulmaz.
  * Koseler basamakli (centikli) - keskin dik aci yok.
  * Palet krem tarafina cekildi: oyunun sicak kahve zemini uzerinde kontrast
    yaratmasi icin paneller ve HUD acik, metin koyu murekkep.
"""
import os
from PIL import Image

OUT = 'public/assets/ui'
S = 8
N = S * 3

# dis kenarda tekrar eden yirtik deseni (0 = duz, 1 = bir piksel iceri)
# cok seyrek: 8 pikselde bir tek centik. Yogun desen cerceveyi KIRIK
# gosteriyordu (ilk deneme), yirtik hissi icin bu kadari yetiyor.
YIRTIK = [0, 0, 0, 1, 0, 0, 0, 0]


def frame(path, ink, edge, paper, glow=None, notch=2):
    im = Image.new('RGBA', (N, N), (0, 0, 0, 0))
    px = im.load()
    for y in range(N):
        for x in range(N):
            cx, cy = min(x, N - 1 - x), min(y, N - 1 - y)
            # kose centigi: basamakli kesik
            if cx + cy < notch:
                px[x, y] = (0, 0, 0, 0); continue
            d = min(x, y, N - 1 - x, N - 1 - y)
            # yirtik: kenar boyunca dis konturu yer yer bir piksel iceri al
            if d == 0:
                along = (x if (y == 0 or y == N - 1) else y)
                if YIRTIK[along % len(YIRTIK)] and cx > 5 and cy > 5:
                    px[x, y] = (0, 0, 0, 0); continue
            if d <= 1:
                px[x, y] = ink
            elif d == 2:
                px[x, y] = edge
            elif d == 3 and glow:
                px[x, y] = glow
            else:
                px[x, y] = paper
    im.save(f'{OUT}/{path}')
    return im


if __name__ == '__main__':
    os.makedirs(OUT, exist_ok=True)
    INK   = (74, 53, 32, 255)      # sicak koyu kahve (saf siyaha yakin degil)
    EDGE  = (165, 129, 74, 255)
    KREM  = (243, 231, 203, 255)   # panel
    KREM_D= (228, 211, 172, 255)   # ic kart
    GOLD  = (190, 142, 58, 255)
    frame('frame.png',      INK, EDGE, KREM)
    frame('frame_in.png',   INK, EDGE, KREM_D)
    frame('frame_gold.png', INK, (214, 170, 86, 255), GOLD, glow=(228, 190, 118, 255))
    frame('frame_hud.png',  INK, EDGE, (238, 224, 192, 240))   # HUD: krem, hafif saydam
    print('4 cerceve uretildi ->', OUT)
