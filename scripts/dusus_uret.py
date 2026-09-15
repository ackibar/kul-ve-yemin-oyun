"""Oyuncunun ucurumdan DUSME animasyonunu v3 ile uretir (ham kareler).

Neden ayri bir script: v3_anim.py'nin SETLER'i silah setlerine gore kurulu ve
kur() butun aksiyonlari yeniden isliyor. Dusus silahtan bagimsiz TEK bir
animasyon (dusen adam elindekini birakir), taban karakterden (silahsiz id)
uretilir ve yalnizca oyuncunun '1' slotuna D/U/S olarak kurulur.

kullanim:
  python3 scripts/dusus_uret.py south          -> tek yon (fiyat/kalite probu)
  python3 scripts/dusus_uret.py south north east
Ham kareler: _arsiv/uretim/pixellab/v3/dusus/Dusus_<yon>_<nn>.png
"""
import base64, io, os, sys, time
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import pxl
from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CID = open(f'{ROOT}/_arsiv/uretim/pixellab/gezgin/id.txt').read().strip()
HAM = f'{ROOT}/_arsiv/uretim/pixellab/v3/dusus'
KARE = 8

# Tarif: ileri dogru sendeleyip bas asagi takla atarak bosluga dusme. Silah
# yasak (taban karakter zaten silahsiz ama model aliskanlikla el doldurur).
# "shrinking" istenmiyor - kuculme motorda yapiliyor, kare icinde figur tam
# boy kalmali ki ayak/kafa capalari ve kirpma tutarli olsun.
TARIF = ('stumbles forward off the edge of a cliff and falls: first leans and '
         'staggers forward with arms flailing, then tips over head first and '
         'tumbles head over heels through the air, the whole body rotating '
         'forward frame by frame - upright, then horizontal, then upside down, '
         'then horizontal again - cloak and hood whipping in the wind; both '
         'hands are completely empty, no weapon of any kind; the figure stays '
         'the same size in every frame and is never cut off by the frame edge')
# Arkadan bakista model yonu govdeye gore aliyor; kameradan uzaga dustugu
# acikca yazilir (kilic saldirisindaki "sirta savurma" dersi).
TARIF_ARKA = ('seen from behind, ' + TARIF.replace('falls:', 'falls away from the camera:'))
OZEL = {'north': TARIF_ARKA}


def uret(yonler):
    os.makedirs(HAM, exist_ok=True)
    once = pxl.balance()[0]
    joblar = []
    for y in yonler:
        r = pxl.call('/characters/animations', {
            'character_id': CID, 'mode': 'v3', 'animation_name': 'dusus',
            'action_description': OZEL.get(y, TARIF), 'directions': [y],
            'frame_count': KARE, 'keep_first_frame': True, 'seed': 21})
        ids = [j for j in (r.get('background_job_ids') or []) if j]
        print(f'dusus [{y}]: {len(ids)} is kuyrukta', flush=True)
        joblar += ids
    for i in range(240):
        d = [pxl.call(f'/background-jobs/{j}') for j in joblar]
        st = [x.get('status') for x in d]
        if i % 6 == 0:
            print(f'  {i*5:3d}sn {st}', flush=True)
        if all(s in ('completed', 'succeeded', 'done', 'failed', 'error') for s in st):
            break
        time.sleep(5)
    for x in d:
        son = x.get('last_response') or {}
        yon = son.get('direction')
        if x.get('status') != 'completed' or not yon:
            print(f'  !! {yon or "?"} basarisiz: {x.get("status")}')
            continue
        for i, g in enumerate(son.get('images') or []):
            Image.open(io.BytesIO(base64.b64decode(g['base64'].split(',')[-1]))) \
                 .convert('RGBA').save(f'{HAM}/Dusus_{yon}_{i:02d}.png')
        print(f'  {yon}: {len(son.get("images") or [])} kare -> {HAM}')
    time.sleep(4)
    print(f'bitti. maliyet={once-pxl.balance()[0]:.0f} uretim, kalan={pxl.balance()[0]:.0f}')


if __name__ == '__main__':
    uret(sys.argv[1:] or ['south'])
