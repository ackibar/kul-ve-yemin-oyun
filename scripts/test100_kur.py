"""TEST mekani: 100x100 karo olcegini denemek icin gecici bir alan.

v1 (ilk deneme) haven.png'den kucuk zemin/duvar/sandik parcalarini kirpip
binlerce kez tekrarlayarak doldurmustu - kullanici "tuhaf, bozuk duruyor"
dedi ve HAKLIYDI: kucuk bir dokuyu cok kucuk olcekte defalarca tekrarlamak
goz icin rastgele gurultu gibi okunuyor, tanidik hicbir sey yok.

v2 (bu script): TAMAMEN VAR OLAN bir mekanin (varsayilan: cistern, 54x30,
tek parca boyali sahne) kendisini 2x4 duzeninde tekrarlayip 100x100'e
kirpiyor. Her tekrar TANIDIK/TUTARLI bir sahne (merdiven, mantar, kaya
formasyonlari) - kucuk bir doku degil - bu yuzden goze "gercek bir yerin
kopyalari" gibi okunuyor, "bozuk" degil.

Tekrarlar arasindaki dikisler (satir/sutun sinirlari) ZEMIN'de elle acildi:
kaynak mekanin kendi duvarlari o sinirlarda kapali oldugu icin, acilmazsa
100x100 alan 8 ayri kapali odaya bolunurdu (BFS ile dogrulandi - onceki
halde 8453 zemin karosundan sadece 1239'u birbirine baaliydi).

Kullanim: python3 scripts/test100_kur.py [zone]   (varsayilan: cistern)

Cikti:
  public/assets/arkaplan/test100.png  (3200x3200, 100x100 karo)
  ekrana: world.ts'e yapistirilacak ZEMIN dizisi

Not: kaynak mekanin GERCEK tiles verisi (blockers dahil DEGIL - sadece
zemin sekli) `npm run dev` acikken /__harita/<zone> uzerinden okunmali,
bu script kendi icinde bir dev-server istemcisi tasimiyor - VITE_DEV_URL
degiskeniyle calisan bir sunucuya istek atar.
"""
import os, sys, json
import urllib.request
from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
KARO = 32
N = 100  # 100x100 karo
DEV_URL = os.environ.get('VITE_DEV_URL', 'http://localhost:5173')
HEDEF = f'{ROOT}/public/assets/arkaplan/test100.png'
# Kaynak mekanin tekrar duzeni: COLS x ROWS repeat, COLS*kaynak_w >= N ve
# ROWS*kaynak_h >= N olmali (sonra N'e kirpilir).
COLS, ROWS = 2, 4


def main():
    zone = sys.argv[1] if len(sys.argv) > 1 else 'cistern'
    with urllib.request.urlopen(f'{DEV_URL}/__harita/{zone}') as r:
        d = json.load(r)
    tiles = d['tiles']
    kw, kh = d['w'], d['h']
    assert COLS * kw >= N and ROWS * kh >= N, f'{zone} ({kw}x{kh}) 2x4 ile 100 karoyu doldurmuyor'

    img = Image.open(f'{ROOT}/public/assets/arkaplan/{zone}.png').convert('RGB')
    tiled = Image.new('RGB', (img.width * COLS, img.height * ROWS))
    for r in range(ROWS):
        for c in range(COLS):
            tiled.paste(img, (c * img.width, r * img.height))
    cropped = tiled.crop((0, 0, N * KARO, N * KARO))
    os.makedirs(os.path.dirname(HEDEF), exist_ok=True)
    cropped.save(HEDEF)
    print(f'-> {HEDEF}  {cropped.size}')

    grid = [[tiles[j % kh][i % kw] for i in range(N)] for j in range(N)]
    # Dikis koridorlari: tekrarlar arasindaki satir/sutun sinirlarini tam ac.
    for r in range(1, ROWS):
        y = r * kh
        for x in range(N):
            if 0 <= y - 1 < N: grid[y - 1][x] = 1
            if y < N: grid[y][x] = 1
    for c in range(1, COLS):
        x = c * kw
        for y in range(N):
            if 0 <= x - 1 < N: grid[y][x - 1] = 1
            if x < N: grid[y][x] = 1

    from collections import deque
    start = next((i, j) for j in range(N) for i in range(N) if grid[j][i] == 1)
    seen = {start}; q = deque([start])
    while q:
        x, y = q.popleft()
        for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1)):
            nx, ny = x + dx, y + dy
            if 0 <= nx < N and 0 <= ny < N and (nx, ny) not in seen and grid[ny][nx] == 1:
                seen.add((nx, ny)); q.append((nx, ny))
    total = sum(1 for j in range(N) for i in range(N) if grid[j][i] == 1)
    print(f'  BFS: {len(seen)}/{total} zemin karosu tek parcada'
          + ('' if len(seen) == total else '  !! IZOLE KARO VAR, dikis mantigini kontrol et'))

    zemin = [''.join(str(v) for v in row) for row in grid]
    print('\nconst ZEMIN=[' + ','.join(f"'{r}'" for r in zemin) + '];')


if __name__ == '__main__':
    main()
