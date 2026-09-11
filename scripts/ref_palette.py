"""Referans gorseldeki KARAKTER renk dunyasini cikarir.

Kirpimlar arka plan da icerdigi icin, kenar halkasinda baskin olan renkler
zemin kabul edilip elenir.
"""
import json, os, sys, collections
sys.path.insert(0, os.path.dirname(__file__))
from PIL import Image
import pixelize as P

CROPS = ['oyuncu', 'mira', 'boran']
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


def crop_palette(path, n=24, border=0.12):
    im = Image.open(path).convert('RGB')
    q = im.quantize(colors=n, method=Image.MEDIANCUT).convert('RGB')
    w, h = q.size
    bw, bh = max(1, int(w * border)), max(1, int(h * border))
    px = q.load()
    inner, edge = collections.Counter(), collections.Counter()
    for y in range(h):
        for x in range(w):
            c = px[x, y]
            if x < bw or x >= w - bw or y < bh or y >= h - bh:
                edge[c] += 1
            else:
                inner[c] += 1
    out = {}
    for c, k in inner.items():
        e = edge.get(c, 0)
        # kenarda ic bolgeden daha yogunsa zemindir
        if e / max(1, (2 * bw * h + 2 * bh * w)) > k / max(1, w * h):
            continue
        out[c] = k
    return out


def build():
    total = collections.Counter()
    for name in CROPS:
        p = os.path.join(ROOT, 'refs', name + '.png')
        if not os.path.exists(p):
            continue
        for c, k in crop_palette(p).items():
            total[c] += k
    pal = [list(c) for c, _ in total.most_common()]
    json.dump(pal, open(os.path.join(ROOT, 'scripts', 'ref_palette.json'), 'w'))
    return total


if __name__ == '__main__':
    t = build()
    print(f'referans karakter paleti: {len(t)} renk')
    for c, k in t.most_common():
        l = P._srgb_to_lab(c)[0]
        print(f'  #{c[0]:02x}{c[1]:02x}{c[2]:02x}  L={l:5.1f}  {k}px')
