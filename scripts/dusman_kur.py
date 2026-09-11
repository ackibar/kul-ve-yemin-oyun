"""Uretilen dusman gorsellerini oyunun enemies/N yapisina kurar.

Motor dusmanlardan yalnizca Walk / Attack / Hurt istiyor (Death ve Idle hic
cizilmiyor), o yuzden yalnizca iki poz uretildi ve animasyonlar bunlardan
TURETILIYOR:
  Walk   : durus pozunun 1 piksel inip cikmasi (kucuk yaratik icin yeterli,
           uretimden kare kare yurume istemek bosuna maliyet olurdu)
  Attack : durus -> saldiri pozu -> durus, saldiri karesi one dogru kayar
  Hurt   : durus pozu ezilmis ve kirmiziya calmis hali

Kucuk yaratiklar TEPEDEN gorulduğu icin ayni gorunum uc yone de veriliyor;
motor yan yonu zaten aynaliyor.
"""
import os, sys
from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
KAYNAK = f'{ROOT}/generated/dusman'
CELL, FEET = 64, 62
YON = ('D', 'U', 'S')
# ad -> enemies/N
SLOT = {'fare': 1, 'orumcek': 2, 'solucan': 3, 'yarasa': 5}


def otur(im, kaydir=(0, 0), olcek=1.0):
    bb = im.getbbox()
    sp = im.crop(bb) if bb else im
    if olcek != 1.0:
        sp = sp.resize((max(1, round(sp.width*olcek)), max(1, round(sp.height*olcek))), Image.NEAREST)
    out = Image.new('RGBA', (CELL, CELL), (0, 0, 0, 0))
    out.paste(sp, (CELL//2 - sp.width//2 + kaydir[0], FEET - sp.height + kaydir[1]))
    return out


def kirmizi(im, guc=.45):
    px = im.load()
    for y in range(im.height):
        for x in range(im.width):
            r, g, b, a = px[x, y]
            if a:
                px[x, y] = (min(255, int(r + (255-r)*guc)), int(g*(1-guc*.6)),
                            int(b*(1-guc*.6)), a)
    return im


def sayfa(kareler, yol):
    sh = Image.new('RGBA', (CELL*len(kareler), CELL), (0, 0, 0, 0))
    for i, f in enumerate(kareler):
        sh.paste(f, (i*CELL, 0))
    sh.save(yol)


def kur(ad, slot):
    durus = Image.open(f'{KAYNAK}/{ad}.png').convert('RGBA')
    vur = Image.open(f'{KAYNAK}/{ad}_vur.png').convert('RGBA')
    hedef = f'{ROOT}/public/assets/enemies/{slot}'
    os.makedirs(hedef, exist_ok=True)
    yuru = [otur(durus, (0, 0)), otur(durus, (0, -1)), otur(durus, (0, 0)), otur(durus, (0, 1))]
    for y in YON:
        sayfa(yuru, f'{hedef}/{y}_Walk.png')
        sayfa([otur(durus), otur(vur, (0, -2), 1.05), otur(vur, (0, -3), 1.1), otur(durus)],
              f'{hedef}/{y}_Attack.png')
        sayfa([kirmizi(otur(durus, (0, 2), .94)), kirmizi(otur(durus, (0, 1), .97), .25)],
              f'{hedef}/{y}_Hurt.png')
        # motor cizmese de eksik dosya uyarisi olmasin diye
        sayfa([otur(durus)], f'{hedef}/{y}_Idle.png')
        sayfa([otur(durus, (0, 3), .9)], f'{hedef}/{y}_Death.png')
    print(f'  enemies/{slot:<2} <- {ad}')


if __name__ == '__main__':
    for ad, slot in SLOT.items():
        kur(ad, slot)
