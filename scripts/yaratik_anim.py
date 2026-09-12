"""Tepeden cizilmis yaratiklara GERCEK animasyon uretir.

Onceki kareler tek durus gorselinden turetiliyordu: 1-2 piksellik kaydirma ve
kucuk bir olcek. Yani yarasa kanat cirpmiyor, fare kosmuyordu - yalnizca
titresiyordu. `/animate-with-text-v3` duz bir gorselden hareket uretiyor,
karakter olusturmaya gerek yok.

Sprite'i motor bakis yonune gore DONDURDUGU icin tariflerde yaratigin yonunu
degistirmemesi sart kosuluyor; yoksa donme ustune donme biner.

kullanim: python3 scripts/yaratik_anim.py [yarasa] [fare] [orumcek]
"""
import base64, io, os, sys, time
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import pxl
from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
KAYNAK = f'{ROOT}/generated/dusman'
HAM = f'{ROOT}/generated/yaratik_anim'
SABIT = (', seen from directly above, the creature keeps facing the same direction '
         'the whole time and never turns or rotates')

ISLER = {
    'yarasa': [('Walk', 8, 'flying forward while flapping its leathery wings up and '
                           'down in a steady beat, body bobbing slightly'),
               ('Attack', 6, 'swooping forward to bite, wings sweeping back and fangs '
                             'bared, then wings opening again')],
    'fare':   [('Walk', 8, 'scurrying forward quickly, legs stepping, body stretching '
                           'and compressing, tail swaying'),
               ('Attack', 6, 'lunging forward with its mouth open to bite, then pulling '
                             'back')],
    'orumcek2': [('Walk', 8, 'skittering forward, all eight legs stepping in sequence, '
                             'body held low and steady'),
                 ('Attack', 6, 'rearing up and striking forward with the front legs, '
                               'then settling back down')],
}
# Orumcek yon basina AYRI gorselden animasyonlaniyor (dondurme calismiyordu).
# Ayni tarifler, farkli baslangic karesi.
for _y in ('u', 's'):
    ISLER[f'orumcek2{_y}'] = ISLER['orumcek2']

# Trol onden cizilmis buyuk bir insansi: dondurulmez, yalnizca aynalanir.
# Sopa her karede elde kalmali, yoksa dev yaratik bos elle vuruyor gibi duruyor.
ISLER['troll'] = [
    ('Walk', 8, 'a huge troll lumbering forward with heavy slow steps, shoulders swaying '
                'and head bobbing, dragging its heavy spiked wooden club at its side; the '
                'club stays in its hand in every single frame'),
    ('Attack', 6, 'a huge troll raising its heavy spiked wooden club and smashing it down '
                  'in front of itself, body leaning into the blow, then hauling the club '
                  'back up; the club is out in front of the body in every single frame'),
]


def uret(ad):
    os.makedirs(HAM, exist_ok=True)
    ham64 = base64.b64encode(open(f'{KAYNAK}/{ad}.png', 'rb').read()).decode()
    once = pxl.balance()[0]
    kuyruk = []
    for aksiyon, n, tarif in ISLER[ad]:
        r = pxl.call('/animate-with-text-v3', {
            'first_frame': {'type': 'base64', 'base64': ham64},
            'action': tarif + SABIT, 'frame_count': n,
            'no_background': True, 'seed': 31})
        kuyruk.append((aksiyon, r.get('background_job_id') or (r.get('background_job_ids') or [None])[0]))
        print(f'{ad}/{aksiyon}: is {kuyruk[-1][1]}')
    for aksiyon, job in kuyruk:
        for i in range(180):
            d = pxl.call(f'/background-jobs/{job}')
            if d.get('status') in ('completed', 'failed', 'error'):
                break
            if i % 6 == 0:
                print(f'  {i*5:3d}sn {ad}/{aksiyon} {d.get("status")}', flush=True)
            time.sleep(5)
        im = (d.get('last_response') or {}).get('images') or []
        for i, g in enumerate(im):
            Image.open(io.BytesIO(base64.b64decode(g['base64'].split(',')[-1]))) \
                 .convert('RGBA').save(f'{HAM}/{ad}_{aksiyon}_{i:02d}.png')
        print(f'  {ad}/{aksiyon}: {len(im)} kare ({d.get("status")})')
    time.sleep(4)
    print(f'{ad} bitti. maliyet={once-pxl.balance()[0]:.0f} uretim')


if __name__ == '__main__':
    for a in sys.argv[1:]:
        uret(a)
