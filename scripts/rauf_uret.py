"""Rauf: Alf'in birliginden kacan, kizini kaybedip akli dengesini yitirmis asker.

Dovusulebilecegi icin yalnizca durus/yurume degil saldiri, hasar ve olum
animasyonlari da uretilir. Maliyet: 2 (karakter) + 4 animasyon x 3 yon = 14.
"""
import os, sys
sys.path.insert(0, os.path.dirname(__file__))
import pxl
from pxl_state import wait

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
TARIF = ('medieval deserter man-at-arms gone half-mad, torn quilted gambeson with the '
         'lord\'s badge cut away leaving a pale patch, a few rusted mail rings hanging loose '
         'at the shoulder, hood of coarse wool pushed back, filthy linen bandages around one '
         'leg and across the ribs, wild matted hair and hollow staring eyes, a chipped notched '
         'arming sword gripped too tightly, a small faded ribbon tied to his wrist, '
         'rough leather belt and cloth wraps on the shins, NO backpack, NO satchel, NO pouches, '
         'NO modern military coat, NO straps across the chest, '
         'muted charcoal and ash-grey palette, soot-stained, single dark outline, '
         'one muted rust accent, human, hunched and twitchy')

ANIM = [('walking', 'Walk'), ('cross-punch', 'Attack'),
        ('taking-punch', 'Hurt'), ('falling-back-death', 'Death')]


if __name__ == '__main__':
    b0 = pxl.balance()[0]
    if '--sadece-animasyon' in sys.argv:
        cid = open(f'{ROOT}/pixellab/id_rauf.txt').read().strip()
        for tmpl, ad in ANIM:
            b1 = pxl.balance()[0]
            rr = pxl.call('/characters/animations', {
                'character_id': cid, 'mode': 'template', 'template_animation_id': tmpl,
                'directions': ['south', 'north', 'east'], 'animation_name': ad})
            wait(rr.get('background_job_ids', []), ad)
            print(f'  {ad:7s} ({tmpl}) hazir  ({b1-pxl.balance()[0]:.0f} uretim)')
        print(f'toplam: {b0-pxl.balance()[0]:.0f}  bakiye: {pxl.balance()[0]:.0f}')
        sys.exit(0)
    r = pxl.call('/create-character-v3', {
        'description': TARIF, 'image_size': {'width': 64, 'height': 64},
        'view': 'low top-down', 'template_id': 'mannequin', 'no_background': True,
        'outline': 'single color black outline', 'detail': 'medium detail', 'seed': 53})
    cid = r['character_id']
    wait([r['background_job_id']], 'rauf')
    open(f'{ROOT}/pixellab/id_rauf.txt', 'w').write(cid)
    print(f'  karakter hazir id={cid[:8]}  ({b0-pxl.balance()[0]:.0f} uretim)')
    if '--sadece-karakter' in sys.argv:
        print('  (animasyonlar onay bekliyor)')
        sys.exit(0)
    for tmpl, ad in ANIM:
        b1 = pxl.balance()[0]
        rr = pxl.call('/characters/animations', {
            'character_id': cid, 'mode': 'template', 'template_animation_id': tmpl,
            'directions': ['south', 'north', 'east'], 'animation_name': ad})
        wait(rr.get('background_job_ids', []), ad)
        print(f'  {ad:7s} ({tmpl}) hazir  ({b1-pxl.balance()[0]:.0f} uretim)')
    print(f'\ntoplam: {b0-pxl.balance()[0]:.0f} uretim  bakiye: {pxl.balance()[0]:.0f}')
