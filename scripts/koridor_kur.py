"""Terk edilmis tas koridor sahnesini test100 slotuna kurar.

Gorsel 2752x1536. Ham haliyle 86x48 karo olurdu ama o zaman karakter sahnede
minicik kaliyor (denendi: tas bloklar devasa gorunuyor). Karakter sprite'i
sahneye BINDIRILIP olculdu: dogru oran 43x24 karo - figur bir ficidan biraz
uzun, sutunlardan kisa.

43x24'te ham gorsel 64 px/karo olurdu; oyunun geri kalani 32 px/karo. Not
defterindeki kural: "Sprite YOGUNLUGU arka planla ayni olmali" - aksi halde
arka planin pikselleri karakterinkinin yarisi olur. Bu yuzden gorsel tam 2x
kucultulup (1376x768) oyle kaydedilir.

ZEMIN yalnizca ODANIN SILUETI: siyah cerceve disarisi, aydinlik ic kisim
oda. Duvar/sutun/moloz carpismasi BURADAN CIKARILMIYOR - denendi ve
ayrismadi (parlaklik: tas duvar ile zemin ayni bantta; sicaklik R-B:
mesale sutunlari da isittigi icin zemin kadar sicak cikiyor). Zaten not
defterindeki ders de bu: boyali sahnede carpisma ELLE yazilir, harita
editorunun "Engeller" araciyla.

kullanim: python3 scripts/koridor_kur.py
cikti: public/assets/arkaplan/test100.png + ekrana ZEMIN dizisi
"""
import os, sys
from collections import deque
from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
KAYNAK = os.path.expanduser('~/Desktop/Pixel_art_abandoned_stone_corridor_2K_20260916130810.jpeg')
HEDEF = f'{ROOT}/public/assets/arkaplan/test100.png'
KARO = 32
KUCULT = 2   # 2752x1536 -> 1376x768, yani 32 px/karo
ESIK = 30  # bu parlakligin altindaki karo = cerceve disi (siyah)


def main():
    im = Image.open(KAYNAK).convert('RGB')
    if KUCULT != 1:
        im = im.resize((im.size[0] // KUCULT, im.size[1] // KUCULT), Image.BOX)
    W, H = im.size
    if W % KARO or H % KARO:
        sys.exit(f'gorsel {W}x{H}, {KARO} px karoya tam bolunmuyor')
    w, h = W // KARO, H // KARO
    px = im.resize((w, h), Image.BOX).load()

    parlak = [[((px[x, y][0] * 299 + px[x, y][1] * 587 + px[x, y][2] * 114) // 1000) >= ESIK
               for x in range(w)] for y in range(h)]

    # Odanin govdesi: merkezden tasma (flood fill). Cerceve disindaki tek tuk
    # parlak benekler (jpeg gurultusu) boylece disarida kalir.
    zemin = [[False] * w for _ in range(h)]
    bas = (w // 2, h // 2)
    if not parlak[bas[1]][bas[0]]:
        sys.exit('merkez karo karanlik cikti - ESIK degerine bak')
    q = deque([bas]); zemin[bas[1]][bas[0]] = True
    while q:
        x, y = q.popleft()
        for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1)):
            nx, ny = x + dx, y + dy
            if 0 <= nx < w and 0 <= ny < h and parlak[ny][nx] and not zemin[ny][nx]:
                zemin[ny][nx] = True; q.append((nx, ny))

    im.save(HEDEF)
    n = sum(r.count(True) for r in zemin)
    print(f'{HEDEF} yazildi ({W}x{H} = {w}x{h} karo)')
    print(f'yurunebilir karo: {n} / {w*h}')

    # Kapi/dogma icin: soldaki ve sagdaki en ucdaki yurunebilir sutunlar,
    # odanin dikey ortasinda.
    orta = h // 2
    sol = next(x for x in range(w) if zemin[orta][x])
    sag = next(x for x in range(w - 1, -1, -1) if zemin[orta][x])
    print(f'orta satir (y={orta}) yurunebilir x araligi: {sol}..{sag}')
    print(f'onerilen: sol kapi ~({sol+2},{orta})  sag ~({sag-2},{orta})  merkez ({w//2},{orta})')

    satirlar = ','.join("'" + ''.join('1' if c else '0' for c in row) + "'" for row in zemin)
    yol = f'{ROOT}/_arsiv/uretim/generated/koridor_zemin.txt'
    os.makedirs(os.path.dirname(yol), exist_ok=True)
    open(yol, 'w').write(f'const ZEMIN=[{satirlar}];\n')
    print(f'ZEMIN dizisi -> {yol}')


if __name__ == '__main__':
    main()
