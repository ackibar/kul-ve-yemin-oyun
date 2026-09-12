"""Oyuncunun 'elinde avci yayi' varyantini uretir (create-character-state).

Neden ayri bir state: v3 animasyonu karakterin DONUS karesinden basliyor, yani
elinde ne varsa onu tasiyor. Kilicli karenin uzerine "yay cek" demek kilici
yayina donusturmuyor; yayli bir baslangic karesi sart. Olculen fiyat 20 uretim
(sekiz yonu birden basiyor), duruş karesi sonrasinda bedava geliyor.
"""
import json, os, sys, time
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import pxl

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
TARIF = ('holding a simple curved wooden hunting bow in the left hand, bowstring '
         'visible, a quiver of arrows strapped to the back; no sword')

if __name__ == '__main__':
    src = open(f'{ROOT}/pixellab/gezgin/id.txt').read().strip()
    once = pxl.balance()[0]
    r = pxl.call('/create-character-state', {
        'character_id': src, 'edit_description': TARIF, 'state_name': 'yay',
        'use_color_palette_from_reference': True, 'no_background': True, 'seed': 21})
    cid = r.get('character_id')
    print('yeni id:', cid, '| isler:', r.get('background_job_ids'))
    open(f'{ROOT}/pixellab/gezgin/id_yay.txt', 'w').write(cid or '')
    joblar = [j for j in (r.get('background_job_ids') or [r.get('background_job_id')]) if j]
    for i in range(240):
        st = [pxl.call(f'/background-jobs/{j}').get('status') for j in joblar]
        if i % 6 == 0: print(f'  {i*5:3d}sn yay {st}', flush=True)
        if all(s in ('completed','succeeded','done','failed','error') for s in st): break
        time.sleep(5)
    time.sleep(4)
    print(f'yay durumu bitti. maliyet={once-pxl.balance()[0]:.0f} uretim')
