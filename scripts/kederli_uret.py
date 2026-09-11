"""Ucurumun basindaki adam: kederli, elinde sise, kendini atmayi dusunuyor.

Yalnizca durus ve yurume gerekiyor (dovusmuyor, ucuruma yuruyup atliyor).
Maliyet: 2 (karakter) + 1 x 3 yon (yurume) = 5 uretim.
"""
import os, sys
sys.path.insert(0, os.path.dirname(__file__))
import pxl
from pxl_state import wait

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
TARIF = ('grieving medieval commoner man in his forties, slumped shoulders and lowered head, '
         'long worn woolen cloak with frayed hem, plain linen shirt, leather belt, '
         'unkempt beard and sunken red-rimmed eyes, holding a clay drinking jug in one hand '
         'down at his side, the other hand hanging empty, no weapon, no armour, '
         'NO backpack, NO satchel, NO straps, '
         'muted ash-grey and faded plum palette, single dark outline, human, defeated posture')

if __name__ == '__main__':
    b0 = pxl.balance()[0]
    if '--animasyon' in sys.argv:
        cid = open(f'{ROOT}/pixellab/id_kederli.txt').read().strip()
        rr = pxl.call('/characters/animations', {
            'character_id': cid, 'mode': 'template', 'template_animation_id': 'walking',
            'directions': ['south', 'north', 'east'], 'animation_name': 'Walk'})
        wait(rr.get('background_job_ids', []), 'Walk')
        print(f'  yurume hazir  ({b0-pxl.balance()[0]:.0f} uretim)')
        sys.exit(0)
    r = pxl.call('/create-character-v3', {
        'description': TARIF, 'image_size': {'width': 64, 'height': 64},
        'view': 'low top-down', 'template_id': 'mannequin', 'no_background': True,
        'outline': 'single color black outline', 'detail': 'medium detail', 'seed': 71})
    cid = r['character_id']
    wait([r['background_job_id']], 'kederli')
    os.makedirs(f'{ROOT}/pixellab', exist_ok=True)
    open(f'{ROOT}/pixellab/id_kederli.txt', 'w').write(cid)
    print(f'  karakter hazir id={cid[:8]}  ({b0-pxl.balance()[0]:.0f} uretim)')
