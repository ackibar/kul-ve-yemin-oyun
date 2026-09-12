"""Aktor sprite'larini sahnenin ton dunyasina yaklastirir - kimliklerini bozmadan.

Olculen sorun "renk yanlis" degil, "parlak": arkaplanlarin ust isik ucu
(L90) magara 28, sarnic 24, siginak 43.5'te kaliyor; kadronun sheet'leri ise
43-60 arasinda cikiyor. Yeni dusmanlarda buna bir de doygunluk ekleniyor
(C 17-25, sahnede hicbir sey 12'yi gecmiyor). Yani karakterler sahnenin
isigindan daha kuvvetli aydinlanmis gibi duruyor.

Yontem: palet takasi DEGIL, uc yumusak sikistirma.
  1. Isik omuzu  - KNEE ustundeki parlaklik sikisir, golgeler oldugu gibi kalir.
  2. Doygunluk omuzu - CKNEE ustundeki doygunluk sikisir; normal bir kostumun
     C'si zaten 3-6 oldugu icin hic dokunulmaz, yalnizca cigligi kesilir.
  3. Kul tonu nudge - notr renkler sahnenin sicak kul acisina cok az cevrilir;
     doygunluk arttikca etki azalir, boylece kirmizi/mavi okunabilirlik sinyali
     kaybolmaz (bkz. tone_transfer.py'daki ayni ders).

Silueti degistirmez: yalnizca alfasi olan piksellerin rengi yeniden esler.
"""
import math, os, shutil, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from PIL import Image
import pixelize as P
from tone_transfer import lab_to_srgb

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
KAYNAK = os.path.join(ROOT, 'asset_backup_ton_oncesi')   # daima pristine kaynak
HEDEF = os.path.join(ROOT, 'public/assets')
KLASORLER = ['characters', 'enemies']

KNEE, RATIO, GLOBAL = 30.0, 0.62, 0.94     # isik omuzu
CKNEE, CRATIO, CGLOBAL = 8.0, 0.50, 0.92   # doygunluk omuzu
KUL = math.radians(30.0)                   # sahnelerin sicak kul acisi
NUDGE_MAX, NUDGE_MIN, NUDGE_C = 0.18, 0.04, 20.0


def grade(c):
    L, a, b = P._srgb_to_lab(c)
    C, h = math.hypot(a, b), math.atan2(b, a)

    nL = (L if L <= KNEE else KNEE + (L - KNEE) * RATIO) * GLOBAL
    nC = (C if C <= CKNEE else CKNEE + (C - CKNEE) * CRATIO) * CGLOBAL

    # doygun renkler kimliklerini korur, notrler kule kayar
    t = min(1.0, C / NUDGE_C)
    w = NUDGE_MAX + (NUDGE_MIN - NUDGE_MAX) * t
    dh = math.atan2(math.sin(KUL - h), math.cos(KUL - h))
    nh = h + dh * w
    return lab_to_srgb(nL, nC * math.cos(nh), nC * math.sin(nh))


_C = {}


def isle(src, dst):
    im = Image.open(src).convert('RGBA')
    px = im.load()
    for y in range(im.height):
        for x in range(im.width):
            r, g, b, a = px[x, y]
            if not a:
                continue
            k = (r, g, b)
            if k not in _C:
                _C[k] = grade(k)
            px[x, y] = _C[k] + (a,)
    im.save(dst)


def main():
    if not os.path.isdir(KAYNAK):
        os.makedirs(KAYNAK)
        for k in KLASORLER:
            shutil.copytree(os.path.join(HEDEF, k), os.path.join(KAYNAK, k))
        print(f'pristine yedek alindi -> {os.path.relpath(KAYNAK, ROOT)}')
    n = 0
    for k in KLASORLER:
        for kok, _, dosyalar in os.walk(os.path.join(KAYNAK, k)):
            for f in dosyalar:
                if not f.endswith('.png'):
                    continue
                src = os.path.join(kok, f)
                dst = os.path.join(HEDEF, os.path.relpath(src, KAYNAK))
                os.makedirs(os.path.dirname(dst), exist_ok=True)
                isle(src, dst)
                n += 1
    print(f'{n} sheet islendi, {len(_C)} benzersiz renk')


if __name__ == '__main__':
    main()
