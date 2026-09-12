"""NPC'lere yurume animasyonu ekler (3 yon x 3 NPC = 9 uretim).

Daha once yalnizca breathing-idle uretilmisti; NPC'ler dolasirken pozisyonu
degisiyor ama bacaklari durdugu icin kayiyor gibi gorunuyordu.
"""
import os, sys
sys.path.insert(0, os.path.dirname(__file__))
import pxl
from pxl_state import wait

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

if __name__ == '__main__':
    b0 = pxl.balance()[0]
    for ad in ['mira', 'boran', 'ekin']:
        yol = f'{ROOT}/_arsiv/uretim/pixellab/id_{ad}.txt'
        if not os.path.exists(yol):
            print(f'  {ad}: id yok, atlandi'); continue
        cid = open(yol).read().strip()
        r = pxl.call('/characters/animations', {
            'character_id': cid, 'mode': 'template',
            'template_animation_id': 'walking',
            'directions': ['south', 'north', 'east'],
            'animation_name': 'Walk'})
        jobs = r.get('background_job_ids', [])
        print(f'  {ad}: {len(jobs)} yon kuyrukta')
        wait(jobs, ad)
        print(f'  {ad}: yurume hazir')
    print(f'\ntoplam maliyet: {b0-pxl.balance()[0]:.0f}  bakiye: {pxl.balance()[0]:.0f}')
