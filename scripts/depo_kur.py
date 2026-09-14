"""Depo mekanini iki kaynak gorselden kurar: sahne + YESIL carpisma maskesi.

Kaynaklar (masaustunde, kullanici verdi):
  ~/Desktop/map store.jpeg        - sahnenin kendisi (2752x1536)
  ~/Desktop/map store green.jpeg  - ayni sahne, yurunebilir zemin yesile boyanmis

Sahne disari/cistern ile ayni "genis tek parca" olculere (54x30 karo,
1728x960 px) indirgeniyor - kaynak daha yuksek cozunurlukte geldi ama en/boy
orani (1.79) o iki mekanla neredeyse ayni (1.80), yani ayni karo yogunluguna
kucultuluyor. Kullanici kapilarin eslesmesi icin 180 derece cevrilmesini
istedi (siginagin solundaki yeni kapidan girilecek).

Cikti:
  public/assets/arkaplan/depo.png
  ekrana: world.ts'e yapistirilacak ZEMIN dizisi
"""
import os
import numpy as np
from PIL import Image
from collections import deque

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
NX, NY = 54, 30
KAYNAK_SAHNE = os.path.expanduser('~/Desktop/map store.jpeg')
KAYNAK_MASKE = os.path.expanduser('~/Desktop/map store green.jpeg')
HEDEF = f'{ROOT}/public/assets/arkaplan/depo.png'


def en_buyuk_bilesen(m):
    """Yesil maskede en buyuk bagli alani doner (yosun/parlak lekeler disarida kalir)."""
    H, W = m.shape
    gor = np.zeros_like(m)
    en = None
    ys, xs = np.where(m)
    for y0, x0 in zip(ys, xs):
        if gor[y0, x0]:
            continue
        q = deque([(y0, x0)]); gor[y0, x0] = True; pts = []
        while q:
            y, x = q.popleft(); pts.append((y, x))
            for dy in (-1, 0, 1):
                for dx in (-1, 0, 1):
                    yy, xx = y + dy, x + dx
                    if 0 <= yy < H and 0 <= xx < W and m[yy, xx] and not gor[yy, xx]:
                        gor[yy, xx] = True; q.append((yy, xx))
        if en is None or len(pts) > len(en):
            en = pts
    out = np.zeros_like(m)
    for y, x in en:
        out[y, x] = True
    return out


def main():
    sahne = Image.open(KAYNAK_SAHNE).convert('RGB')
    maske = Image.open(KAYNAK_MASKE).convert('RGB')
    assert sahne.size == maske.size, 'iki gorsel ayni boyutta olmali'
    a = np.asarray(maske).astype(int)
    r, g, b = a[..., 0], a[..., 1], a[..., 2]
    m = (g - r > 12) & (g - b > 12) & (g > 35)
    m = en_buyuk_bilesen(m)
    print(f'  yesil karo orani: {m.mean():.2%}')

    # 180 derece cevir (kapi eslesmesi icin), SONRA hedef karo izgarasina kucult.
    sahne180 = sahne.transpose(Image.ROTATE_180)
    maske_im = Image.fromarray((m * 255).astype('uint8')).transpose(Image.ROTATE_180)

    sahne_kucuk = sahne180.resize((NX * 32, NY * 32), Image.LANCZOS)
    maske_kucuk = maske_im.resize((NX, NY), Image.BOX)
    grid = np.asarray(maske_kucuk) > (255 * 0.4)

    os.makedirs(os.path.dirname(HEDEF), exist_ok=True)
    sahne_kucuk.save(HEDEF)
    print(f'-> {HEDEF}  {sahne_kucuk.size} ({NX}x{NY} karo)')

    zemin = [''.join('1' if grid[y, x] else '0' for x in range(NX)) for y in range(NY)]

    # tek parca mi kontrol
    bas = next(((i, j) for j in range(NY) for i in range(NX) if zemin[j][i] == '1'), None)
    gset = {bas}; q = deque([bas])
    while q:
        x, y = q.popleft()
        for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1)):
            n = (x + dx, y + dy)
            if n not in gset and 0 <= n[0] < NX and 0 <= n[1] < NY and zemin[n[1]][n[0]] == '1':
                gset.add(n); q.append(n)
    top = sum(row.count('1') for row in zemin)
    print(f'  yurunebilir karo: {top}, tek parcada: {len(gset)}')
    print('\nconst ZEMIN=[' + ','.join(f"'{row}'" for row in zemin) + '];')


if __name__ == '__main__':
    main()
