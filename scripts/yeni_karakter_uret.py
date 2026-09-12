"""Nil, Ayaz ve Selvi icin karakter sprite'lari.

Uc karakter de baska NPC'lerin sheet'ini odunc aliyordu (Selvi oyuncunun,
Nil kucultulmus Mirna, Ayaz kucultulmus Tuhn). Herkes kendi gorunumunu alsin.
Maliyet: karakter basi 2 (v3) + 3 (yurume sablonu, uc yon) = 5, toplam 15.
"""
import os, sys
sys.path.insert(0, os.path.dirname(__file__))
import pxl
from pxl_state import wait

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ORTAK = ('muted ash-grey palette, soot-stained, single dark outline, '
         'NO backpack, NO satchel, NO straps across the chest, NO modern clothing, human')

KISI = {
    'nil': ('a small eight year old girl, short and slight, patched woolen dress over '
            'rough leggings, a thick shawl tied across her shoulders, hair in a messy '
            'braid, soot smudges on her cheeks, holding a short charred stick like a '
            'tally marker, stubborn set jaw, standing very straight, ' + ORTAK, 41),
    'ayaz': ('a thin fourteen year old boy, too-large hand-me-down coat with frayed '
             'cuffs hanging past his hands, cloth wrapped around his shins, tousled '
             'hair, hollow tired eyes, a dented metal canteen hanging from his belt, '
             'shoulders hunched from waiting, ' + ORTAK, 43),
    'selvi': ('a hard-faced woman in her late thirties, wrapped in many mismatched '
              'layers of cloth and blankets against cold, a scarf covering her neck, '
              'weathered wind-burned face, cracked lips, arms folded tight, standing '
              'guard-like and unmoving, one muted rust-red rag among the grey, ' + ORTAK, 47),
}


def uret(ad, tarif, seed):
    r = pxl.call('/create-character-v3', {
        'description': tarif, 'image_size': {'width': 64, 'height': 64},
        'view': 'low top-down', 'template_id': 'mannequin', 'no_background': True,
        'outline': 'single color black outline', 'detail': 'medium detail', 'seed': seed})
    wait([r['background_job_id']], ad)
    os.makedirs(f'{ROOT}/_arsiv/uretim/pixellab', exist_ok=True)
    open(f'{ROOT}/_arsiv/uretim/pixellab/id_{ad}.txt', 'w').write(r['character_id'])
    print(f'  {ad:6s} karakter hazir id={r["character_id"][:8]}', flush=True)


def animasyon(ad):
    cid = open(f'{ROOT}/_arsiv/uretim/pixellab/id_{ad}.txt').read().strip()
    rr = pxl.call('/characters/animations', {
        'character_id': cid, 'mode': 'template', 'template_animation_id': 'walking',
        'directions': ['south', 'north', 'east'], 'animation_name': 'Walk'})
    wait(rr.get('background_job_ids', []), f'{ad} yurume')
    print(f'  {ad:6s} yurume hazir', flush=True)


if __name__ == '__main__':
    b0 = pxl.balance()[0]
    hedef = sys.argv[1:] or list(KISI)
    if '--animasyon' in hedef:
        for ad in [x for x in hedef if x in KISI] or list(KISI):
            animasyon(ad)
    else:
        for ad in hedef:
            uret(ad, *KISI[ad])
    print(f'bakiye {b0:.0f} -> {pxl.balance()[0]:.0f}')
