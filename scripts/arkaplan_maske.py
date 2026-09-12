"""Uretilen arka plani carpisma haritasiyla maskeler.

Hizalama denendi ve ise yaramadi (%90.5 -> %89.5): boyali duvar halkasinin
kalinligi carpisma izgarasiyla birebir tutmuyor ve sinir kutusu yaklasimi
koridorlarda yaniliyor.

Bunun yerine CARPISMA OTORITE yapilir: zemin karolarinda uretilen sanat
oldugu gibi kalir, zemin olmayan karolar karartilir. Boylece oyuncunun
gordugu ile yurudugu yer tanim geregi %100 ortusur; boyali duvar dokusu
zayif da olsa gorunmeye devam ettigi icin duz siyah kesik gibi durmaz.
"""
import json, os, sys
sys.path.insert(0, os.path.dirname(__file__))
from PIL import Image, ImageFilter
import pixelize as P

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SC = '/tmp/claude-501/-Users-can/51650aa6-4bf1-4ab1-86e3-39d5ee0a1589/scratchpad'
CELL = 32          # 2x render yogunlugunda bir karo


def mask(zone, wall_keep=0.26, edge_keep=0.5, feather=9):
    """Carpisma haritasina gore karartir.

    Maske karo karo SERT uygulaninca gorunur dikdortgen basamaklar biraktigi
    icin once piksel maskesi kurulur, hafifce bulaniklastirilir (feather),
    sonra carpilir. Karartma ayni kalir, kademe kaybolur.
    """
    world = {d['zone']: d for d in json.load(open(f'{SC}/dunya.json'))}[zone]
    W, H, tiles = world['w'], world['h'], world['tiles']
    bg = Image.open(f'{ROOT}/_arsiv/uretim/generated/arkaplan/{zone}.png').convert('RGB')
    if bg.size != (W * CELL, H * CELL):
        bg = bg.resize((W * CELL, H * CELL), Image.LANCZOS)

    def is_floor(x, y):
        return 0 <= x < W and 0 <= y < H and tiles[y][x] == 1

    # karo basina koruma katsayisi -> kucuk gri maske -> buyut + bulaniklastir
    small = Image.new('L', (W, H))
    sp = small.load()
    for ty in range(H):
        for tx in range(W):
            if is_floor(tx, ty):
                k = 1.0
            else:
                adj = any(is_floor(tx + dx, ty + dy)
                          for dx in (-1, 0, 1) for dy in (-1, 0, 1))
                k = edge_keep if adj else wall_keep
            sp[tx, ty] = int(k * 255)
    m = small.resize((W * CELL, H * CELL), Image.BILINEAR).filter(
        ImageFilter.GaussianBlur(feather))
    px, mp = bg.load(), m.load()
    for y in range(bg.height):
        for x in range(bg.width):
            k = mp[x, y] / 255
            if k >= 0.999:
                continue
            r, g, b = px[x, y]
            px[x, y] = (int(r * k), int(g * k), int(b * k))
    bg.save(f'{ROOT}/_arsiv/uretim/generated/arkaplan/{zone}_maskeli.png')
    return bg, world


def score(img, world):
    W, H, tiles = world['w'], world['h'], world['tiles']
    floor_n = sum(r.count(1) for r in tiles)
    p = img.resize((W, H), Image.BOX).load()
    Ls = [[P._srgb_to_lab(p[x, y])[0] for x in range(W)] for y in range(H)]
    thr = sorted(l for r in Ls for l in r)[W * H - floor_n]
    return sum(1 for y in range(H) for x in range(W)
               if (Ls[y][x] >= thr) == (tiles[y][x] == 1)) / (W * H) * 100


if __name__ == '__main__':
    zone = sys.argv[1]
    out, world = mask(zone)
    print(f'{zone}: maskelendi {out.size}  uyum %{score(out, world):.1f}')
