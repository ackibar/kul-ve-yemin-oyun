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
STIL = ('dark fantasy pixel art game object, muted ash-grey and worn dark wood palette, '
        'soot stained iron bands, single dark outline, basic shading, centered single '
        'object, no background, no text, no shadow')

TARIF = {
    'sandik_kapali': ('a closed wooden treasure chest with a domed lid, dark scorched '
                      'planks, two iron bands and an iron lock plate'),
    'sandik_acik':   ('the same wooden treasure chest standing open, the domed lid '
                      'tipped back, the inside empty and dark'),
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
