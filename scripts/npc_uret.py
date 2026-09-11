"""Sigginak NPC'lerini PixelLab ile uretir ve nefes alan idle animasyonu ekler.

Tasarim capasi Gezgin ile ayni dunya: kul rengi, yipranmis, koyu kontur, kul
ve is lekeleri. Boyut da ayni (64x64 hucre, 8 yon) ki motorda tek olcek
(OYUNCU_OLCEK) hepsine uysun.

Maliyet: karakter basi 2 (v3, 8 yon) + animasyon yon basina 1.
NPC'ler yalnizca guney karesiyle ciziliyor, o yuzden animasyon tek yon.
"""
import json, os, sys, time
sys.path.insert(0, os.path.dirname(__file__))
import pxl
from pxl_state import wait

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ORTAK = ('muted charcoal and ash-grey palette, soot-stained worn cloth, '
         'single dark outline, grimy survivor of a buried shelter, '
         'one single muted accent colour on the garment, otherwise desaturated, human')

NPC = {
    'mira': ('wise elderly woman healer, grey hair tied back under a dark headscarf, '
             'long patched SAGE-GREEN apron with many small pouches, a satchel of dried herbs at '
             'her hip, round spectacles, calm steady posture, ' + ORTAK),
    'boran': ('exhausted veteran warrior, battered dented armour over layered rags, a RUST-RED sash across the chest, '
              'shoulders slumped with fatigue, a notched sword hanging at his side, '
              'bandaged forearm, grey-streaked beard, weary stance, ' + ORTAK),
    'ekin': ('frail old scholar, long threadbare DEEP INDIGO-BLUE robe, a heavy book clutched under one '
             'arm, rolled scrolls tucked in his belt, thin white beard, reading lenses '
             'on a cord, stooped studious posture, ' + ORTAK),
}


def uret(ad, tarif, seed):
    b0 = pxl.balance()[0]
    r = pxl.call('/create-character-v3', {
        'description': tarif, 'image_size': {'width': 64, 'height': 64},
        'view': 'low top-down', 'template_id': 'mannequin', 'no_background': True,
        'outline': 'single color black outline', 'detail': 'medium detail', 'seed': seed})
    cid = r['character_id']
    wait([r['background_job_id']], ad)
    open(f'{ROOT}/pixellab/id_{ad}.txt', 'w').write(cid)
    b1 = pxl.balance()[0]
    print(f'  {ad}: karakter hazir  id={cid[:8]}  maliyet={b0-b1:.0f}')
    return cid


def animasyon(ad, cid):
    b0 = pxl.balance()[0]
    r = pxl.call('/characters/animations', {
        'character_id': cid, 'mode': 'template',
        'template_animation_id': 'breathing-idle',
        'directions': ['south'], 'animation_name': 'Idle'})
    wait(r.get('background_job_ids', []), ad + ' idle')
    b1 = pxl.balance()[0]
    print(f'  {ad}: nefes animasyonu hazir  maliyet={b0-b1:.0f}')


if __name__ == '__main__':
    hedef = sys.argv[1:] or list(NPC)
    for i, ad in enumerate(hedef):
        cid = uret(ad, NPC[ad], 31 + i * 7)
        animasyon(ad, cid)
    print('\nkalan bakiye:', pxl.balance())
