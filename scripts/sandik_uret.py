"""Sandik ve kapak gorsellerini oyunun estetiginde yeniden uretir.

Eskiler CraftPix zindan setinden kalmaydi: parlak ahsap, mavi-gri metal ve
farkli bir kontur dili. Boyali mekanlarin uzerinde yabanci duruyorlardi.
Yeniler ayni kul-gri/yipranmis deri paletinde, tek koyu kontur.

Sandik iki durum: KAPALI ve ACIK (kapagi arkaya devrilmis, ici bosalmis).
Ikisi de ayni acidan (low top-down) ki motorun cizimiyle otursun.
"""
import os, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import pxl
from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
HAM = f'{ROOT}/_arsiv/uretim/generated/nesne'
# 2. tur: kullanici "daha kahverengi olsun ve duz olsun, capraz olmasin" dedi.
# Eskisi kul grisi ve 3/4 acidan (koseden) cizilmisti.
STIL = ('dark fantasy pixel art game object, WARM BROWN wood planks with visible grain, '
        'dark iron bands, single dark outline, basic shading, centered single object, '
        'seen STRAIGHT FROM THE FRONT, symmetrical, flat front face square to the camera, '
        'NOT at an angle, NOT a three-quarter view, NOT rotated, '
        'no background, no text, no shadow')

TARIF = {
    'sandik_kapali': ('a closed wooden chest with a flat lid, warm brown planks, two dark '
                      'iron bands running down the front and a small iron lock plate in the '
                      'middle'),
    'sandik_acik':   ('the same warm brown wooden chest standing open, the flat lid tipped '
                      'straight back, the inside empty and dark'),
}


def uret(ad):
    os.makedirs(HAM, exist_ok=True)
    r = pxl.call('/create-image-pixflux', {
        'description': f'{TARIF[ad]}, {STIL}',
        'image_size': {'width': 48, 'height': 48}, 'no_background': True,
        'outline': 'single color black outline', 'shading': 'basic shading',
        'detail': 'medium detail', 'view': 'low top-down', 'seed': 41})
    got = pxl.walk_images(r, HAM, ad)
    if not got:
        print('  !!', ad, 'gorsel donmedi'); return None
    os.replace(got[0], f'{HAM}/{ad}.png')
    print(f'  {ad} hazir')
    return f'{HAM}/{ad}.png'


if __name__ == '__main__':
    once = pxl.balance()[0]
    for a in sys.argv[1:] or TARIF:
        uret(a)
    print(f'maliyet={once-pxl.balance()[0]:.0f} uretim')
