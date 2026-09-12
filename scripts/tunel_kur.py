"""Tunel mekanini iki kaynak gorselden kurar: sahne + YESIL carpisma maskesi.

Kullanici iki kare gorsel veriyor (2048x2048):
  tunel.png        - sahnenin kendisi
  tunel_maske.png  - ayni sahne, YURUNEBILIR zemin parlak yesile boyanmis

Mekan yatay bir tunel ama oyunda DIKEY duracak (kapinin devami), o yuzden
ikisi de 90 derece cevriliyor. Cikti:
  public/assets/arkaplan/tunel.png  - motorun cizecegi arka plan
  ekrana: world.ts'e yapistirilacak ZEMIN dizisi

Zemin dogrudan yesil maskeden okunuyor - mekan_kur.py'deki parlaklik tahmini
gerekmiyor, cunku carpisma otoritesi elle boyanmis.

kullanim: python3 scripts/tunel_kur.py [saga|sola]     (cevirme yonu)
"""
import os, sys
import numpy as np
from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
KARO = 32                  # 1 karo = 16 dunya birimi x 2 px/birim
KAYNAK = f'{ROOT}/_arsiv/uretim/generated/tunel'   # kaynak gorseller arsivde
HEDEF = f'{ROOT}/public/assets/arkaplan/tunel.png'


def yesil(a):
    """Boyanan yesil KOYU geliyor - model sahnenin isigini uzerine uyguluyor
    (olculdu: en yaygin ton 51,71,43 yani g-r=20). Parlak yesil esigi (g-r>40)
    hicbir sey bulamiyordu. Esik dusuruluyor, sonra EN BUYUK BAGLI ALAN
    aliniyor: kayalardaki yosun lekeleri de yesil ama kucuk ve kopuk."""
    r, g, b = a[..., 0].astype(int), a[..., 1].astype(int), a[..., 2].astype(int)
    m = (g - r > 12) & (g - b > 12) & (g > 35)
    from collections import deque
    H, W = m.shape
    gor = np.zeros_like(m); en = None
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


def kur(yon='saga'):
    ac = Image.ROTATE_270 if yon == 'saga' else Image.ROTATE_90
    sahne = Image.open(f'{KAYNAK}/tunel.png').convert('RGBA').transpose(ac)
    maske = Image.open(f'{KAYNAK}/tunel_maske.png').convert('RGBA').transpose(ac)
    assert sahne.size == maske.size, 'iki gorsel ayni boyutta olmali'
    m = yesil(np.asarray(maske))
    ys, xs = np.where(m)
    print(f'  yesil alan: x {xs.min()}-{xs.max()}, y {ys.min()}-{ys.max()}')
    # Tuvali yurunebilir alanin cevresinden kirp (bos siyah kenarlar gitsin),
    # karo izgarasina hizala.
    pay = KARO * 2
    x1 = max(0, (xs.min() - pay) // KARO * KARO); y1 = max(0, (ys.min() - pay) // KARO * KARO)
    x2 = min(sahne.width, -(-(xs.max() + pay) // KARO) * KARO)
    y2 = min(sahne.height, -(-(ys.max() + pay) // KARO) * KARO)
    sahne = sahne.crop((x1, y1, x2, y2)); m = m[y1:y2, x1:x2]
    w, h = sahne.width // KARO, sahne.height // KARO
    print(f'  mekan {w}x{h} karo ({sahne.width}x{sahne.height} px)')
    os.makedirs(os.path.dirname(HEDEF), exist_ok=True)
    sahne.convert('RGB').save(HEDEF)
    zemin = []
    for j in range(h):
        sat = ''
        for i in range(w):
            blok = m[j*KARO:(j+1)*KARO, i*KARO:(i+1)*KARO]
            sat += '1' if blok.mean() >= .45 else '0'
        zemin.append(sat)
    # Yurunebilir alan tek parca mi?
    from collections import deque
    bas = next(((i, j) for j in range(h) for i in range(w) if zemin[j][i] == '1'), None)
    g = {bas}; q = deque([bas])
    while q:
        x, y = q.popleft()
        for dx, dy in ((1,0),(-1,0),(0,1),(0,-1)):
            n = (x+dx, y+dy)
            if n not in g and 0 <= n[0] < w and 0 <= n[1] < h and zemin[n[1]][n[0]] == '1':
                g.add(n); q.append(n)
    top = sum(r.count('1') for r in zemin)
    print(f'  yurunebilir karo {top}, tek parcada {len(g)}')
    print('\n  const ZEMIN=[' + ','.join(f"'{r}'" for r in zemin) + '];')
    return zemin


if __name__ == '__main__':
    kur(sys.argv[1] if len(sys.argv) > 1 else 'saga')
