"""Ucurumdan DUSME animasyonunu v3 ile uretir (ham kareler).

Neden ayri bir script: v3_anim.py'nin SETLER'i silah setlerine gore kurulu ve
kur() butun aksiyonlari yeniden isliyor. Dusus silahtan bagimsiz TEK bir
animasyon (dusen adam elindekini birakir); oyuncu icin taban karakterden
(silahsiz id), Tuhn icin kendi id'sinden uretilir.

kullanim:
  python3 scripts/dusus_uret.py south                  -> oyuncu, tek yon
  python3 scripts/dusus_uret.py south north east       -> oyuncu, uc yon
  python3 scripts/dusus_uret.py --kim tuhn east         -> Tuhn, tek yon
Ham kareler: _arsiv/uretim/pixellab/v3/dusus[_<kim>]/Dusus_<yon>_<nn>.png
"""
import base64, io, os, sys, time
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import pxl
from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
# kim -> (PixelLab id dosyasi, ham klasor)
KIM = {'oyuncu': ('_arsiv/uretim/pixellab/gezgin/id.txt', 'dusus'),
       # Tuhn'un PixelLab karakteri "kederli" adiyla uretildi (bkz. kederli_kur.py).
       'tuhn': ('_arsiv/uretim/pixellab/id_kederli.txt', 'dusus_tuhn')}
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


def uret(kim, yonler):
    id_yol, kl = KIM[kim]
    cid = open(f'{ROOT}/{id_yol}').read().strip()
    ham = f'{ROOT}/_arsiv/uretim/pixellab/v3/{kl}'
    os.makedirs(ham, exist_ok=True)
    once = pxl.balance()[0]
    joblar = []
    for y in yonler:
        r = pxl.call('/characters/animations', {
            'character_id': cid, 'mode': 'v3', 'animation_name': 'dusus',
            'action_description': OZEL.get(y, TARIF), 'directions': [y],
            'frame_count': KARE, 'keep_first_frame': True, 'seed': 21})
        ids = [j for j in (r.get('background_job_ids') or []) if j]
        print(f'{kim}/dusus [{y}]: {len(ids)} is kuyrukta', flush=True)
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
                 .convert('RGBA').save(f'{ham}/Dusus_{yon}_{i:02d}.png')
        print(f'  {yon}: {len(son.get("images") or [])} kare -> {ham}')
    time.sleep(4)
    print(f'bitti. maliyet={once-pxl.balance()[0]:.0f} uretim, kalan={pxl.balance()[0]:.0f}')


if __name__ == '__main__':
    a = sys.argv[1:]
    kim = 'oyuncu'
    if a[:1] == ['--kim']:
        kim, a = a[1], a[2:]
    uret(kim, a or ['south'])
