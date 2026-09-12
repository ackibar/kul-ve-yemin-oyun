"""Uretilen yaratik animasyonlarini enemies/N sheet yapisina kurar.

dusman_kur.py'nin yerini aliyor: orada Walk/Attack tek durus gorselinden
1-2 piksellik kaydirmayla "turetiliyordu", yani yaratik yurumuyor titriyordu.
Burada kareler gercek animasyondan geliyor.

Motor yaratigi bakis yonune gore DONDURDUGU icin yon basina ayri sheet yok:
uc yonun (D/U/S) hepsine ayni kareler yaziliyor, cizimde D kullaniliyor.
Hizalama: kareler ortak bir merkeze oturtulur - bbox'a gore ortalamak kanat
acikken govdeyi kaydiriyordu, agirlik merkezi ise sabit kaliyor.
"""
import glob, os, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import aktor_uyum
from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
HAM = f'{ROOT}/generated/yaratik_anim'
CELL = 64
YON = ('D', 'U', 'S')
SLOT = {'fare': 1, 'orumcek2': 2, 'yarasa': 5}


def merkez(k):
    """Alfa agirlik merkezi. Kanat acilip kapandikca bbox degisiyor ama kutle
    merkezi govdede kaliyor; hizalamayi ona gore yapmak titremeyi onluyor."""
    px = k.load()
    tx = ty = n = 0
    for y in range(k.height):
        for x in range(k.width):
            a = px[x, y][3]
            if a:
                tx += x * a; ty += y * a; n += a
    return (tx / n, ty / n) if n else (k.width / 2, k.height / 2)


def otur(k):
    cx, cy = merkez(k)
    out = Image.new('RGBA', (CELL, CELL), (0, 0, 0, 0))
    out.paste(k, (round(CELL / 2 - cx), round(CELL / 2 - cy)))
    return out


def kirmizi(k, guc=.45):
    px = k.load()
    for y in range(k.height):
        for x in range(k.width):
            r, g, b, a = px[x, y]
            if a:
                px[x, y] = (min(255, int(r + (255 - r) * guc)), int(g * (1 - guc * .6)),
                            int(b * (1 - guc * .6)), a)
    return k


def sayfa(kareler, yol):
    sh = Image.new('RGBA', (CELL * len(kareler), CELL), (0, 0, 0, 0))
    for i, k in enumerate(kareler):
        sh.paste(k, (i * CELL, 0))
    sh.save(yol)


def kur(ad):
    slot = SLOT[ad]
    hedef = f'{ROOT}/public/assets/enemies/{slot}'
    os.makedirs(hedef, exist_ok=True)
    kare = {}
    for aksiyon in ('Walk', 'Attack'):
        f = sorted(glob.glob(f'{HAM}/{ad}_{aksiyon}_*.png'))
        if not f:
            raise SystemExit(f'{ad}/{aksiyon} kareleri yok - once yaratik_anim.py')
        kare[aksiyon] = [otur(Image.open(x).convert('RGBA')) for x in f]
    for y in YON:
        sayfa(kare['Walk'], f'{hedef}/{y}_Walk.png')
        sayfa(kare['Attack'], f'{hedef}/{y}_Attack.png')
        sayfa([kirmizi(kare['Walk'][0].copy()), kirmizi(kare['Walk'][0].copy(), .25)],
              f'{hedef}/{y}_Hurt.png')
        # Motor cizmese de eksik gorsel uyarisi cikmasin diye
        sayfa([kare['Walk'][0]], f'{hedef}/{y}_Idle.png')
        sayfa([kare['Walk'][0]], f'{hedef}/{y}_Death.png')
    print(f'  enemies/{slot} <- {ad} ({len(kare["Walk"])} yuruyus, {len(kare["Attack"])} saldiri karesi)')
    aktor_uyum.klasor(hedef, ham_yenile=True)


if __name__ == '__main__':
    for a in sys.argv[1:] or SLOT:
        kur(a)
