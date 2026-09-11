"""Referansin TONUNU aktarir, paletini degil.

Palet komple degistirilince (palette_transfer.py) referansin dar karakter
paleti kadroyu yassiltiyordu: algisal ayirt edilebilirlik 34.7 -> 21.0.

Burada her rengin RENK AILESI (Lab ton acisi) korunur; referanstan yalnizca
  - doygunluk seviyesi
  - parlaklik dagilimi (quantile eslemesi)
  - kontur koyulugu
aktarilir. Ayirt edilebilirlik yapisi geregi korunur, mod referansa kayar.
"""
import json, math, os, sys
sys.path.insert(0, os.path.dirname(__file__))
from PIL import Image
import pixelize as P

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = [tuple(c) for c in json.load(open(os.path.join(ROOT, 'scripts/actor_palette.json')))]
DST = [tuple(c) for c in json.load(open(os.path.join(ROOT, 'scripts/ref_palette.json')))]


def lab_to_srgb(L, a, b):
    fy = (L + 16) / 116; fx = fy + a / 500; fz = fy - b / 200
    def inv(t):
        return t ** 3 if t ** 3 > 0.008856 else (t - 16 / 116) / 7.787
    x, y, z = inv(fx) * 0.95047, inv(fy), inv(fz) * 1.08883
    r = 3.2406 * x - 1.5372 * y - 0.4986 * z
    g = -0.9689 * x + 1.8758 * y + 0.0415 * z
    bb = 0.0557 * x - 0.2040 * y + 1.0570 * z
    def enc(u):
        u = max(0.0, min(1.0, u))
        u = 12.92 * u if u <= 0.0031308 else 1.055 * u ** (1 / 2.4) - 0.055
        return int(round(u * 255))
    return (enc(r), enc(g), enc(bb))


def stats(pal):
    lab = [P._srgb_to_lab(c) for c in pal]
    Ls = sorted(x[0] for x in lab)
    Cs = [math.hypot(x[1], x[2]) for x in lab]
    return Ls, sum(Cs) / len(Cs)


_SL, _SC = stats(SRC)
_DL, _DC = stats(DST)

MEASURED_K = _DC / _SC        # referansin olculen doygunlugu (~0.644)

# Secilen deger. Olculen 0.644 dogrudan uygulandiginda kadro yassiliyordu
# (algisal ayirt edilebilirlik 34.7 -> 23.3, en dusuk cift 3.5 -> 1.8).
# Odunlesim taramasi sonucu 0.85 secildi: referansin sicak/yumusak modu
# geliyor, ayirt edilebilirlik 29.8'de kaliyor ve kirmizi/mavi/pembe gibi
# oyun okunabilirligi tasiyan sinyaller korunuyor.
CHROMA_K = 0.85


def _quantile_L(L):
    """Kaynak parlaklik dagilimini referansinkine tasir (monoton)."""
    lo = sum(1 for x in _SL if x < L)
    q = lo / max(1, len(_SL) - 1)
    pos = q * (len(_DL) - 1)
    i = min(int(pos), len(_DL) - 2)
    f = pos - i
    return _DL[i] * (1 - f) + _DL[i + 1] * f


def grade(c):
    L, a, b = P._srgb_to_lab(c)
    C, h = math.hypot(a, b), math.atan2(b, a)
    nL = _quantile_L(L)
    nC = C * CHROMA_K
    return lab_to_srgb(nL, nC * math.cos(h), nC * math.sin(h))


MAP = {c: grade(c) for c in SRC}
_FB = {}


def _resolve(c):
    if c in MAP:
        return MAP[c]
    if c not in _FB:
        _FB[c] = MAP[P.nearest(c)]
    return _FB[c]


def convert(img):
    img = img.convert('RGBA')
    px = img.load()
    for y in range(img.height):
        for x in range(img.width):
            r, g, b, a = px[x, y]
            if a:
                px[x, y] = _resolve((r, g, b)) + (255,)
    return img


if __name__ == '__main__':
    print(f'doygunluk katsayisi: {CHROMA_K:.3f}')
    for c in sorted(SRC, key=lambda c: -P._srgb_to_lab(c)[0]):
        t = MAP[c]
        print(f'  #{c[0]:02x}{c[1]:02x}{c[2]:02x} L={P._srgb_to_lab(c)[0]:5.1f}  ->  '
              f'#{t[0]:02x}{t[1]:02x}{t[2]:02x} L={P._srgb_to_lab(t)[0]:5.1f}')
