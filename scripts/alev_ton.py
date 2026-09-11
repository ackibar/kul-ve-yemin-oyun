"""Alev sheet'ini pixel-art disiplinine sokar ve sahneye gore yumusatir.

Iki sorun:
  1) Yeniden olceklemeden sonra 6762 renk olusmustu - pixel art degil.
  2) Cekirdek saf beyaz (L=100), sahne ortalamasi L=16.6; alev bir isik kaynagi
     oldugu icin parlak olmali ama bu kadar sert degil.

Cozum: dar bir ates paletine kuantalama + en parlak tonlarin bastirilmasi.
Kontur/govde/cekirdek ayrimi korunur, yalnizca tepe parlaklik dusurulur.
"""
import os, sys
sys.path.insert(0, os.path.dirname(__file__))
from PIL import Image
import pixelize as P
from tone_transfer import lab_to_srgb

SHEET = 'public/assets/dungeon/3 Animated objects/Fire1.png'
# sicak, bastirilmis ates paleti (koyudan acia)
PALET = [
    (74, 26, 14), (122, 42, 20), (170, 62, 24), (206, 92, 30),
    (228, 128, 42), (238, 160, 62), (244, 190, 96), (248, 216, 148),
    (250, 232, 190),
]


def main(tepe=88.0):
    im = Image.open(SHEET).convert('RGBA')
    px = im.load()
    onceki = len({px[x, y][:3] for y in range(im.height) for x in range(im.width)
                  if px[x, y][3] > 0})
    # paleti tepe parlakliga gore bastir
    pal = []
    for c in PALET:
        L, a, b = P._srgb_to_lab(c)
        pal.append(lab_to_srgb(min(L, tepe), a, b))
    labs = [P._srgb_to_lab(c) for c in pal]
    cache = {}
    for y in range(im.height):
        for x in range(im.width):
            r, g, b, al = px[x, y]
            if not al:
                continue
            t = (r, g, b)
            if t not in cache:
                l1, a1, b1 = P._srgb_to_lab(t)
                cache[t] = min(zip(pal, labs),
                               key=lambda pl: (l1 - pl[1][0]) ** 2 + (a1 - pl[1][1]) ** 2
                               + (b1 - pl[1][2]) ** 2)[0]
            px[x, y] = cache[t] + (255,)
    im.save(SHEET)
    h = {}
    for n, c in im.getcolors(99999):
        if c[3] > 0:
            h[c[:3]] = h.get(c[:3], 0) + n
    tot = sum(h.values())
    L = sum(P._srgb_to_lab(c)[0] * n / tot for c, n in h.items())
    print(f'renk {onceki} -> {len(h)}   ortalama L {L:.1f}   tepe L {max(P._srgb_to_lab(c)[0] for c in h):.0f}')


if __name__ == '__main__':
    main(float(sys.argv[1]) if len(sys.argv) > 1 else 88.0)
