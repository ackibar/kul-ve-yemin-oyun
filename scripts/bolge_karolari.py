"""Her bolge icin ayri wang karo seti uretir (API harcamadan).

Elimizdeki iki kaynak:
  wang_v1 - yosunlu yesil, koyu  -> nemli sarnica yakisir
  wang_v2 - temiz acik gri       -> bakimli siginak; ton dondurulunce kul ocagi

Islemler piksel bazli (L kaydirma/olcekleme, ic kontrast, ton dondurme), bu yuzden
karolarin kusursuz doslenmesi bozulmaz.
"""
import math, os, sys
sys.path.insert(0, os.path.dirname(__file__))
from PIL import Image
import pixelize as P
from tone_transfer import lab_to_srgb

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = f'{ROOT}/public/assets/dungeon/wang'
FLOOR, WALL = 0, 15

# bolge: (kaynak, zemin hedef L, ic kontrast, doygunluk, ton acisi derece|None, ton gucu)
ZONES = {
    'haven':   ('wang_v2', 52, 0.75, 0.85, None, 0.0),    # bakimli, notr gri - sicak bir tin
    'cistern': ('wang_v1', 40, 0.55, 1.05, 200, 0.45),    # nemli, yosunlu, maviye kacan
    'forge':   ('wang_v2', 44, 0.70, 1.30, 45, 0.85),     # kul ve koz, sicak turuncu
}


def mean_L(img):
    h = {}
    for n, c in img.convert('RGB').getcolors(99999):
        h[c] = h.get(c, 0) + n
    t = sum(h.values())
    return sum(P._srgb_to_lab(c)[0] * n / t for c, n in h.items())


def build(src_dir, target_L, contrast, chroma, hue_deg, hue_k):
    src = [Image.open(f'{ROOT}/pixellab/tileset/{src_dir}/wang_{i}.png').convert('RGBA')
           for i in range(16)]
    f0 = mean_L(src[FLOOR])
    # parlatirken toplamsal (zemin-duvar farki korunur), karartirken carpansal
    # (koyu duvar 0'a cakilmasin) - ikisi de denendi, secim buna gore.
    mode = 'shift' if target_L >= f0 else 'scale'
    delta, k = target_L - f0, target_L / max(1e-6, f0)
    tgt = math.radians(hue_deg) if hue_deg is not None else None
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
                base = (m + delta) if mode == 'shift' else m * k
                nL = base + (L - m) * contrast * (1 if mode == 'shift' else k)
                C, h = math.hypot(aa, bb) * chroma, math.atan2(bb, aa)
                if tgt is not None:
                    dh = math.atan2(math.sin(tgt - h), math.cos(tgt - h))
                    h += dh * hue_k
                px[x, y] = lab_to_srgb(max(0, min(100, nL)),
                                       C * math.cos(h), C * math.sin(h)) + (a,)
        out.append(new)
    return out, mode


if __name__ == '__main__':
    for zone, (src, tL, con, chr_, hue, hk) in ZONES.items():
        tiles, mode = build(f'{ROOT and src}', tL, con, chr_, hue, hk)
        d = f'{OUT}/{zone}'
        os.makedirs(d, exist_ok=True)
        for i, t in enumerate(tiles):
            t.save(f'{d}/wang_{i}.png')
        print(f'{zone:8s} <- {src}  mod={mode:5s}  zemin L={mean_L(tiles[FLOOR]):5.1f}'
              f'  duvar L={mean_L(tiles[WALL]):5.1f}  fark={mean_L(tiles[FLOOR])-mean_L(tiles[WALL]):5.1f}')
