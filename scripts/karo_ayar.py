"""Wang karolarini aydinlatir ve desen gurultusunu azaltir.

Iki sikayet, iki ayri kol:
  - PARLAKLIK: zemin karosu L=33.8, motorun bolge tonuyla ekranda 25.1'e
    dusuyor; karakter 21.2 -> algisal mesafe 4.8 (okunmuyor).
  - DESEN GURULTUSU: 32x32 karoda 294 belirgin kenar.

Yontem:
  * TOPLAMSAL L kaydirma (carpan degil): zemin hedefe tasinirken zemin-duvar
    parlaklik FARKI birebir korunur. Carpan kullanmak duvarlari da zemin
    seviyesine cikarip yapiyi siliyordu.
  * Karo ICI kontrast dusurme: her piksel kendi karosunun ortalamasina dogru
    cekilir; derz/leke cizgileri zayiflar, buyuk formlar durur. Palet indirgeme
    denendi ve TERS tepti (yumusak gecisler sert banda donusup kenari artirdi).
  * Butun islemler piksel bazli - karolarin kusursuz doslenmesi bozulmaz.
"""
import os, sys
sys.path.insert(0, os.path.dirname(__file__))
from PIL import Image
import pixelize as P
from tone_transfer import lab_to_srgb

SRC = os.environ.get('KARO_SRC', 'pixellab/tileset/wang')
DST = 'public/assets/dungeon/wang'
FLOOR = 0          # wang_0 = tam zemin, parlaklik capasi
WALL = 15


def mean_L(img):
    h = {}
    for n, c in img.convert('RGB').getcolors(99999):
        h[c] = h.get(c, 0) + n
    t = sum(h.values())
    return sum(P._srgb_to_lab(c)[0] * n / t for c, n in h.items())


def edges(img):
    px = img.convert('RGB').load(); w, h = img.size
    return sum(1 for y in range(h) for x in range(1, w)
               if sum(abs(px[x, y][i] - px[x - 1, y][i]) for i in range(3)) > 60)


def process(target_floor_L, contrast, chroma, mode='shift'):
    """mode='shift': toplamsal L kaydirma - zemin-duvar FARKINI birebir korur,
    aydinlatmak icin dogru arac. mode='scale': carpansal - ORANI korur ve dibe
    carpmaz; zaten parlak bir seti karartirken sart (toplamsal kaydirma zaten
    koyu duvari 0'a cakiyor)."""
    src = [Image.open(f'{SRC}/wang_{i}.png').convert('RGBA') for i in range(16)]
    f0 = mean_L(src[FLOOR])
    delta = target_floor_L - f0
    k = target_floor_L / max(1e-6, f0)
    out = []
    for im in src:
        m = mean_L(im)
        new = im.copy(); px = new.load()
        for y in range(new.height):
            for x in range(new.width):
                r, g, b, a = px[x, y]
                if not a:
                    continue
                L, aa, bb = P._srgb_to_lab((r, g, b))
                base = (m + delta) if mode == 'shift' else (m * k)
                nL = base + (L - m) * contrast * (1 if mode == 'shift' else k)
                px[x, y] = lab_to_srgb(max(0, min(100, nL)), aa * chroma, bb * chroma) + (a,)
        out.append(new)
    return out, delta


if __name__ == '__main__':
    tL, contrast, chroma = float(sys.argv[1]), float(sys.argv[2]), float(sys.argv[3])
    rest = sys.argv[4:]
    mode = 'scale' if 'scale' in rest else 'shift'
    apply = 'uygula' in rest
    tiles, delta = process(tL, contrast, chroma, mode)
    src = [Image.open(f'{SRC}/wang_{i}.png') for i in range(16)]
    print(f'mod: {mode}   L kaydirma: {delta:+.1f}   ic kontrast: {contrast}   doygunluk: {chroma}')
    for i, lab in [(FLOOR, 'zemin '), (WALL, 'duvar ')]:
        print(f'  {lab} L {mean_L(src[i]):5.1f} -> {mean_L(tiles[i]):5.1f}'
              f'   kenar {edges(src[i]):4d} -> {edges(tiles[i]):4d}')
    print(f'  zemin-duvar farki {mean_L(src[FLOOR])-mean_L(src[WALL]):5.1f} ->'
          f' {mean_L(tiles[FLOOR])-mean_L(tiles[WALL]):5.1f}')
    d = DST if apply else 'generated/karo_deneme'
    os.makedirs(d, exist_ok=True)
    for i, t in enumerate(tiles):
        t.save(f'{d}/wang_{i}.png')
    print('uygulandi' if apply else f'{d}/ altina yazildi (oyuna dokunulmadi)')
