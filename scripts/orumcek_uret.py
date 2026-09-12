"""Orumcegi yeniden uretir. Onceki sprite "sacma duruyor" geri bildirimini aldi:
govde kocaman ve acik kahve, bacaklar kalin ve simetrik - oyuncakli duruyordu.
Yeni tarif: kucuk govde, uzun ince bacaklar, kul-gri koyu palet, tepeden.
"""
import os, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import pxl

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = f'{ROOT}/generated/dusman'
STIL = ('dark fantasy pixel art creature, muted ash-grey and cold charcoal palette, '
        'single dark outline, basic shading, centered single creature, '
        'no background, no text')
ISLER = {
    'orumcek2':  ('a small cave spider seen directly from above, tiny dark body, eight '
                  'long thin sprawling legs, pale joints, facing downward'),
    'orumcek2_vur': ('a small cave spider seen directly from above rearing up, front legs '
                     'lifted and spread wide, body low, facing downward'),
}

if __name__ == '__main__':
    os.makedirs(OUT, exist_ok=True)
    once = pxl.balance()[0]
    for ad, tarif in ISLER.items():
        r = pxl.call('/create-image-pixflux', {
            'description': f'{tarif}, {STIL}',
            'image_size': {'width': 48, 'height': 48}, 'no_background': True,
            'outline': 'single color black outline', 'shading': 'basic shading',
            'detail': 'medium detail', 'view': 'high top-down', 'seed': 77})
        got = pxl.walk_images(r, OUT, ad)
        if got:
            os.replace(got[0], f'{OUT}/{ad}.png')
            print('  ', ad, 'hazir')
    print(f'maliyet={once-pxl.balance()[0]:.0f} uretim')
