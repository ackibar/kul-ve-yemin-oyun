"""Firtina dusmanlari: Bogulmus (kind 8) ve Kralin son muhafizi (kind 10).

Ikisi de insansi -> karakter v3 (2 uretim) + v3_anim Walk/Attack 5 yon (10).
Akis: bu dosya (karakter) -> npc_sheet_kur.py <ad> enemies/N (donus tabani)
      -> v3_anim.py <ad> -> v3_kur.py <ad>
kullanim: python3 scripts/dusman_yeni_uret.py [bogulmus|muhafiz]
"""
import os, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import pxl
from pxl_state import wait

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ORTAK = ('muted ash-grey palette, soot-stained, single dark outline, '
         'NO backpack, NO satchel, NO modern clothing, human')
KISI = {
    'bogulmus': ('a drowned-looking human figure choked with ash, grey ash pouring from the '
                 'wide open mouth and nostrils, swollen grey skin, eyes rolled back white, a '
                 'drenched tattered cloak stiff with ash, shoulders heaving, both arms half '
                 'raised as if wading through deep water, no weapon, ' + ORTAK, 97),
    'muhafiz':  ('a tall royal knight in full battered plate armour caked with grey ash, a '
                 'closed great helm with a narrow eye slit, a long straight steel sword held '
                 'point-down in both hands in front of the body, a torn tabard with a faded '
                 'purple crown emblem, standing rigid at attention, ' + ORTAK, 98),
}

if __name__ == '__main__':
    b0 = pxl.balance()[0]
    for ad in (sys.argv[1:] or list(KISI)):
        tarif, seed = KISI[ad]
        r = pxl.call('/create-character-v3', {
            'description': tarif, 'image_size': {'width': 64, 'height': 64},
            'view': 'low top-down', 'template_id': 'mannequin', 'no_background': True,
            'outline': 'single color black outline', 'detail': 'medium detail', 'seed': seed})
        wait([r['background_job_id']], ad)
        open(f'{ROOT}/_arsiv/uretim/pixellab/id_{ad}.txt', 'w').write(r['character_id'])
        print(f'  {ad:8s} karakter hazir id={r["character_id"][:8]}', flush=True)
    print(f'bakiye {b0:.0f} -> {pxl.balance()[0]:.0f}')
