"""Zindan ortamini referansin ton dunyasina tasir.

Aktor sprite'lari ekranin yalnizca %0.44'u; havayi belirleyen zemin,
duvar ve nesneler. Olculen fark:
    oyun zemini    ton acisi -82.4deg (soguk mavi), L=50.1
    referans sahne ton acisi +36.6deg (sicak kahve), L=25.0
Yani ~119deg ton dondurme ve belirgin karartma gerekiyor.

Aktorlerdeki gibi sadece doygunluk oynamak yetmez: burada TON ACISI
dondurulur, cunku mavi tasi sicak tasa cevirmenin baska yolu yok.
"""
import math, os, sys
sys.path.insert(0, os.path.dirname(__file__))
from PIL import Image
import pixelize as P
from tone_transfer import lab_to_srgb

# Hedef, sahnenin GENEL ortalamasi degil referansin TAS ZEMINI olmali:
# genel ortalama (36.6deg) bol turuncu ahsaptan besleniyor ve zemini
# kirmiziya bogduruyor. Oyuncunun cevresindeki acik zemin olculdu:
#     L=31.5  ton=47.7deg  doygunluk C=9.8
# oyunun mevcut zemini ise L=50.1, C=16.3. Yani referans zemin daha
# koyu VE daha az doygun - neredeyse notr gri, yalnizca sicak tinili.
REF_HUE = math.radians(47.7)
WARMTH = 1.00                   # ton acisini hedefe tam cevir
DARKEN = 0.72                   # secilen: referansin L=31.5 hedefine en yakin
CHROMA = 0.60                   # 9.8 / 16.3


def grade(c, warmth=None, darken=None, chroma=None):
    w = WARMTH if warmth is None else warmth
    d = DARKEN if darken is None else darken
    k = CHROMA if chroma is None else chroma
    L, a, b = P._srgb_to_lab(c)
    C, h = math.hypot(a, b), math.atan2(b, a)
    # ton acisini referansa dogru en kisa yoldan cevir
    dh = math.atan2(math.sin(REF_HUE - h), math.cos(REF_HUE - h))
    nh = h + dh * w
    nL = L * d
    nC = C * k
    return lab_to_srgb(nL, nC * math.cos(nh), nC * math.sin(nh))


_C = {}


def convert(img, **kw):
    img = img.convert('RGBA')
    px = img.load()
    key = tuple(sorted(kw.items()))
    cache = _C.setdefault(key, {})
    for y in range(img.height):
        for x in range(img.width):
            r, g, b, a = px[x, y]
            if a:
                t = (r, g, b)
                if t not in cache:
                    cache[t] = grade(t, **kw)
                px[x, y] = cache[t] + (a,)
    return img
