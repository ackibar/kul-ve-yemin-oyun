"""Iskelet olunce ucusan KEMIK PARCALARI (kafatasi, kaburga, uzun kemik...).

Neden ayri gorsel: once olen iskeletin sprite'i 2x3 dilime bolunup
savruluyordu, ama dilimler dikdortgen oldugu icin "kesilmis gorsel parcasi"
gibi duruyordu, kemik gibi degil (kullanici: "daha gerceklci bir animasyon,
kucuk kafatasi ve kemik parcalari gorselleri uretelim"). Bunlar 16x16 tek
nesne; motor onlari kendi hizi + donusuyle savuruyor.

Ikonlarla ayni boru hatti (/create-image-pixflux) ama envanter ikonu DEGIL:
sahnede, karanlikta ucusacaklar.

NOT: API 16x16 kabul ETMIYOR ("Canvas must be size 32x32 area or larger"),
32x32 uretilip iceriğe gore kirpiliyor - zaten kucuk bir nesne, kirpinca
parca kendi olcusunde kaliyor.

kullanim: python3 scripts/kemik_uret.py [ad...]   (varsayilan: hepsi)
cikti: public/assets/nesne/kemik/<ad>.png
"""
import os, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import pxl
from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
HEDEF = f'{ROOT}/public/assets/nesne/kemik'
HAM = f'{ROOT}/_arsiv/uretim/generated/kemik'
# Iskelet sprite'iyla ayni dil: agarmis kemik, tek koyu kontur, kul paleti.
STIL = ('dark fantasy pixel art, single small object centered on empty space, '
        'bleached bone-white and pale grey palette, single dark outline, '
        'basic shading, no background, no text, no border, no ground, no shadow')
TARIF = {
    'kafatasi': 'a small human skull seen from the side, dark empty eye socket, cracked jaw',
    'kaburga':  'a curved broken rib bone fragment',
    'uyluk':    'a long thigh bone with knobbly rounded ends, snapped at one end',
    'omurga':   'a short piece of spine, three stacked vertebrae',
    'kirik':    'a jagged splinter of broken bone, sharp at both ends',
}


def uret(ad):
    os.makedirs(HAM, exist_ok=True); os.makedirs(HEDEF, exist_ok=True)
    r = pxl.call('/create-image-pixflux', {
        'description': f'{TARIF[ad]}, {STIL}',
        'image_size': {'width': 32, 'height': 32}, 'no_background': True,
        'outline': 'single color black outline', 'shading': 'basic shading',
        'detail': 'low detail', 'view': 'side', 'seed': 31})
    got = pxl.walk_images(r, HAM, ad)
    if not got:
        print('  !!', ad, 'gorsel donmedi'); return
    im = Image.open(got[0]).convert('RGBA')
    bb = im.getbbox()          # bos kenarlari at: parca kendi olcusunde kalsin
    if bb:
        im = im.crop(bb)
    im.save(f'{HEDEF}/{ad}.png')
    print(f'  nesne/kemik/{ad}.png hazir')


if __name__ == '__main__':
    once = pxl.balance()[0]
    for a in (sys.argv[1:] or list(TARIF)):
        uret(a)
    print(f'maliyet={once-pxl.balance()[0]:.0f} uretim, kalan={pxl.balance()[0]:.0f}')
