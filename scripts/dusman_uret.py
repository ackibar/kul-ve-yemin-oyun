"""Yeraltina uygun dusman sprite'lari uretir.

Ucuz tutmak icin iki numara:
  * Kucuk yaratiklar (yarasa, fare, orumcek, solucan) TEPEDEN goruluyor, yani
    tek gorunum uc yone de yetiyor - yon basina ayri uretim yok.
  * Motor dusmanlardan yalnizca Walk/Attack/Hurt istiyor (Death ve Idle hic
    cizilmiyor), o yuzden iki poz uretilip animasyonlar bunlardan turetiliyor.
"""
import os, sys
sys.path.insert(0, os.path.dirname(__file__))
import pxl

OUT = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))),
                   'generated', 'dusman')
STIL = ('dark fantasy pixel art creature, muted ash-grey and dull brown palette, '
        'single dark outline, basic shading, centered single creature, '
        'no background, no text')

# ad: (durus tarifi, saldiri tarifi)
YARATIK = {
    'yarasa': ('a cave bat with spread leathery wings seen from above, small body',
               'a cave bat lunging with wings swept forward and fangs bared, seen from above'),
    'fare':   ('a large mangy sewer rat seen from above, long tail curled',
               'a large mangy rat leaping forward with mouth open, seen from above'),
    'orumcek':('a hairy cave spider with eight legs seen from above, ash-dusted',
               'a hairy cave spider rearing up with front legs raised, seen from above'),
    'solucan':('a pale blind cave centipede coiled, many legs, seen from above',
               'a pale blind cave centipede striking forward, mandibles open, seen from above'),
}


def uret(ad, tarif, ek=''):
    r = pxl.call('/create-image-pixflux', {
        'description': f'{tarif}, {STIL}',
        'image_size': {'width': 48, 'height': 48}, 'no_background': True,
        'outline': 'single color black outline', 'shading': 'basic shading',
        'detail': 'medium detail', 'view': 'high top-down', 'seed': 31})
    got = pxl.walk_images(r, OUT, ad + ek)
    if got:
        os.replace(got[0], f'{OUT}/{ad}{ek}.png')
    print(f'  {ad+ek:14s} {"ok" if got else "GORSEL YOK"}', flush=True)


if __name__ == '__main__':
    os.makedirs(OUT, exist_ok=True)
    b0 = pxl.balance()[0]
    for ad, (durus, saldiri) in YARATIK.items():
        if not os.path.exists(f'{OUT}/{ad}.png'):
            uret(ad, durus)
        uret(ad, saldiri, '_vur')
    print(f'bakiye {b0:.0f} -> {pxl.balance()[0]:.0f}')
