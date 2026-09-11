"""Ice aktariciyi denemek icin sentetik bir katmanli PSD uretir.

Gruplu senaryoyu da kurar: etiketsiz klasorun icine inilmeli, etiketli grup ise
tek nesne olarak duzlestirilmeli.
"""
from psd_tools import PSDImage
from PIL import Image, ImageDraw

W, H = 960, 896
psd = PSDImage.new('RGB', (W, H), color=0)

# zemin: tum tuvali kaplayan taban katmani
zemin = Image.new('RGBA', (W, H), (120, 86, 60, 255))
d = ImageDraw.Draw(zemin)
for y in range(0, H, 32):
    for x in range(0, W, 32):
        d.rectangle([x, y, x + 30, y + 30], outline=(96, 68, 46, 255))
psd.create_pixel_layer(zemin, name='zemin', top=0, left=0)


def kutu(w, h, renk):
    im = Image.new('RGBA', (w, h), (0, 0, 0, 0))
    dd = ImageDraw.Draw(im)
    dd.rounded_rectangle([2, 2, w - 3, h - 3], 4, fill=renk, outline=(40, 28, 18, 255), width=2)
    return im


def nesne(ad, x, y, w, h, renk):
    psd.create_pixel_layer(kutu(w, h, renk), name=ad, top=y, left=x)
    return (ad, x, y, w, h)


BEKLENEN = [
    nesne('yatak@engel', 140, 200, 96, 64, (170, 90, 50, 255)),
    nesne('tezgah@engel', 600, 180, 144, 72, (150, 110, 70, 255)),
    nesne('camasir@gecilir', 300, 120, 104, 48, (200, 195, 180, 255)),
    nesne('ocak@ates', 420, 420, 88, 88, (90, 80, 78, 255)),
]

# Etiketsiz klasor: icindeki katmanlar tek tek nesne olmali.
ic1 = psd.create_pixel_layer(kutu(64, 40, (140, 60, 60, 255)), name='sandik@engel', top=600, left=120)
ic2 = psd.create_pixel_layer(kutu(48, 48, (90, 140, 90, 255)), name='hali@gecilir', top=640, left=300)
psd.create_group([ic1, ic2], name='mobilya')
BEKLENEN += [('sandik@engel', 120, 600, 64, 40), ('hali@gecilir', 300, 640, 48, 48)]

# Etiketli grup: iki parca TEK nesne olarak duzlesmeli.
# govde (700,600)-(796,664), yorgan (716,588)-(796,620) => birlesik kutu
# sol=700 ust=588 sag=796 alt=664  => 96x76
g1 = psd.create_pixel_layer(kutu(96, 64, (160, 100, 60, 255)), name='govde', top=600, left=700)
g2 = psd.create_pixel_layer(kutu(80, 32, (210, 200, 190, 255)), name='yorgan', top=588, left=716)
psd.create_group([g1, g2], name='buyukyatak@engel')
BEKLENEN.append(('buyukyatak@engel', 700, 588, 96, 76))

psd.save('generated/test_mekan.psd')
print('-> generated/test_mekan.psd')
print('BEKLENEN:')
for ad, x, y, w, h in BEKLENEN:
    print(f'  {ad:22s} konum=({x},{y}) boyut={w}x{h}')
