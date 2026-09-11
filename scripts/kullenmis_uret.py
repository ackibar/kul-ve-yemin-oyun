"""Kullenmis: yukari cikip geri donen, kulun icini doldurdugu insan kaligi.

Kind 4 dusmani ve bosun (Kul Bekcisi) sprite'i. Insansi oldugu icin yon
gerekiyor; karakter v3 + yurume sablonu. Saldiri ve hasar kareleri
uretimden degil, yurume karelerinden turetiliyor (bkz. dusman_kur.py).
Maliyet: 2 + 3 = 5 uretim.
"""
import os, sys
sys.path.insert(0, os.path.dirname(__file__))
import pxl
from pxl_state import wait

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
TARIF = ('a gaunt humanoid figure crusted with grey ash, skin cracked like dry clay, '
         'hollow sockets glowing faint ember-orange, tattered burial wrappings, '
         'no weapon, arms hanging long, slight hunch, '
         'muted ash-grey palette with one dull ember accent, single dark outline, '
         'NO backpack, NO armour, NO modern clothing')

if __name__ == '__main__':
    b0 = pxl.balance()[0]
    if '--animasyon' in sys.argv:
        cid = open(f'{ROOT}/pixellab/id_kullenmis.txt').read().strip()
        rr = pxl.call('/characters/animations', {
            'character_id': cid, 'mode': 'template', 'template_animation_id': 'walking',
            'directions': ['south', 'north', 'east'], 'animation_name': 'Walk'})
        wait(rr.get('background_job_ids', []), 'Walk')
        print(f'  yurume hazir ({b0-pxl.balance()[0]:.0f} uretim)')
        sys.exit(0)
    r = pxl.call('/create-character-v3', {
        'description': TARIF, 'image_size': {'width': 64, 'height': 64},
        'view': 'low top-down', 'template_id': 'mannequin', 'no_background': True,
        'outline': 'single color black outline', 'detail': 'medium detail', 'seed': 89})
    cid = r['character_id']
    wait([r['background_job_id']], 'kullenmis')
    open(f'{ROOT}/pixellab/id_kullenmis.txt', 'w').write(cid)
    print(f'  karakter hazir id={cid[:8]} ({b0-pxl.balance()[0]:.0f} uretim)')
