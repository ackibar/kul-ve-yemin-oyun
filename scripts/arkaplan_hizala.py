"""Uretilen arka plani carpisma haritasina hizalar.

Nano Banana odayi dogru cizer ama duvar halkasini bir karo kalin/ince
birakabiliyor. Boyali zeminin sinir kutusu ile gercek carpisma zemininin
sinir kutusu olculur ve arka plan tam oturacak sekilde olceklenip kaydirilir.
Carpisma AUTORITE; gorsel ona uyar.
"""
import json, os, sys
sys.path.insert(0, os.path.dirname(__file__))
from PIL import Image
import pixelize as P

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SC = '/tmp/claude-501/-Users-can/51650aa6-4bf1-4ab1-86e3-39d5ee0a1589/scratchpad'


def floor_bbox_from_tiles(tiles):
    ys = [y for y, r in enumerate(tiles) if 1 in r]
    xs = [x for r in tiles for x, v in enumerate(r) if v == 1]
    return min(xs), min(ys), max(xs) + 1, max(ys) + 1


def floor_bbox_from_image(img, W, H, floor_n):
    px = img.resize((W, H), Image.BOX).load()
    Ls = [[P._srgb_to_lab(px[x, y])[0] for x in range(W)] for y in range(H)]
    thr = sorted(l for r in Ls for l in r)[W * H - floor_n]
    pts = [(x, y) for y in range(H) for x in range(W) if Ls[y][x] >= thr]
    xs, ys = [p[0] for p in pts], [p[1] for p in pts]
    return min(xs), min(ys), max(xs) + 1, max(ys) + 1


def align(zone):
    world = {d['zone']: d for d in json.load(open(f'{SC}/dunya.json'))}[zone]
    W, H, tiles = world['w'], world['h'], world['tiles']
    floor_n = sum(r.count(1) for r in tiles)
    bg = Image.open(f'{ROOT}/generated/arkaplan/{zone}.png').convert('RGB')
    tw, th = W * 32, H * 32                       # 2x render yogunlugu

    tb = floor_bbox_from_tiles(tiles)             # karo biriminde
    ib = floor_bbox_from_image(bg, W, H, floor_n)
    sx = (tb[2] - tb[0]) / max(1, ib[2] - ib[0])
    sy = (tb[3] - tb[1]) / max(1, ib[3] - ib[1])
    print(f'{zone}: carpisma zemini {tb}  boyali zemin {ib}  olcek {sx:.3f}x{sy:.3f}')

    # boyali zemini hedef kutuya oturt
    k = 32
    src = bg.resize((int(round(bg.width * sx)), int(round(bg.height * sy))), Image.LANCZOS)
    off_x = int(round(tb[0] * k - ib[0] * sx * k))
    off_y = int(round(tb[1] * k - ib[1] * sy * k))
    out = Image.new('RGB', (tw, th), (6, 5, 9))
    out.paste(src, (off_x, off_y))
    out.save(f'{ROOT}/generated/arkaplan/{zone}_hizali.png')
    return out, world


def score(img, world):
    W, H, tiles = world['w'], world['h'], world['tiles']
    floor_n = sum(r.count(1) for r in tiles)
    px = img.resize((W, H), Image.BOX).load()
    Ls = [[P._srgb_to_lab(px[x, y])[0] for x in range(W)] for y in range(H)]
    thr = sorted(l for r in Ls for l in r)[W * H - floor_n]
    ok = sum(1 for y in range(H) for x in range(W)
             if (Ls[y][x] >= thr) == (tiles[y][x] == 1))
    return ok / (W * H) * 100


if __name__ == '__main__':
    zone = sys.argv[1]
    world = {d['zone']: d for d in json.load(open(f'{SC}/dunya.json'))}[zone]
    before = score(Image.open(f'{ROOT}/generated/arkaplan/{zone}.png').convert('RGB'), world)
    out, _ = align(zone)
    print(f'  uyum: %{before:.1f} -> %{score(out, world):.1f}')
