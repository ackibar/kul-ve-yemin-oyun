"""Karakterlerin diyalog portrelerini uretir (tam boy sprite -> bust portre).

Diyalogda simdiye kadar tam boy sprite kucultulerek gosteriliyordu; yuz
okunmuyordu. PixelLab'in portrait-character-pro ucu ayni kimligi ve kiyafeti
koruyarak bust portre cikariyor.
"""
import base64, io, json, os, sys, time
sys.path.insert(0, os.path.dirname(__file__))
from PIL import Image
import pxl
from pxl_state import wait

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = f'{ROOT}/public/assets/portre'
BOY = 128

KARAKTER = {'gezgin': 1, 'mirna': 3, 'alf': 2, 'undur': 4}


def b64(img):
    b = io.BytesIO(); img.save(b, 'PNG'); return base64.b64encode(b.getvalue()).decode()


def uret(ad, slot):
    src = Image.open(f'{ROOT}/public/assets/characters/{slot}/D_Idle.png').convert('RGBA')
    kare = src.crop((0, 0, 64, 64))
    b0 = pxl.balance()[0]
    r = pxl.call('/portrait-character-pro', {
        'direction': 'character_to_portrait',
        'image': {'type': 'base64', 'base64': b64(kare)},
        'view': 'low top-down', 'result_size': BOY, 'seed': 11})
    job = r.get('background_job_id') or (r.get('background_job_ids') or [None])[0]
    if job:
        wait([job], ad)
        r = pxl.call(f'/background-jobs/{job}')
    os.makedirs(OUT, exist_ok=True)
    got = pxl.walk_images(r, OUT, ad)
    if got:
        os.replace(got[0], f'{OUT}/{ad}.png')
        im = Image.open(f'{OUT}/{ad}.png')
        print(f'  {ad:7s} {im.size}  maliyet={b0-pxl.balance()[0]:.0f}')
    else:
        print(f'  {ad:7s} GORSEL YOK  yanit={json.dumps(r)[:200]}')


if __name__ == '__main__':
    for ad in (sys.argv[1:] or list(KARAKTER)):
        uret(ad, KARAKTER[ad])
    print('bakiye:', pxl.balance())
