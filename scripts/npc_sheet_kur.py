"""PixelLab karakterini oyunun characters/N yapisina kurar (durus + yurume).

Motor NPC'lerden Idle ve Walk cizer; Attack/Hurt/Death dosyalari da yazilir ki
eksik gorsel uyarisi cikmasin, icerikleri durus karesidir.
kullanim: npc_sheet_kur.py <id_adi> <slot>
"""
import glob, json, os, shutil, sys, urllib.request, zipfile
sys.path.insert(0, os.path.dirname(__file__))
import pxl
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import aktor_uyum
from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CELL, FEET = 64, 62
DIR = {'south': 'D', 'north': 'U', 'east': 'S'}
SAYI = {'Idle': 4, 'Walk': 6, 'Attack': 4, 'Hurt': 2, 'Death': 8}


def otur(f):
    bb = f.getbbox()
    sp = f.crop(bb) if bb else f
    out = Image.new('RGBA', (CELL, CELL), (0, 0, 0, 0))
    out.paste(sp, (CELL // 2 - sp.width // 2, FEET - sp.height))
    return out


def ornekle(k, n):
    return k if len(k) == n else [k[round(i * (len(k) - 1) / max(1, n - 1))] for i in range(n)]


def kur(ad, slot):
    cid = open(f'{ROOT}/pixellab/id_{ad}.txt').read().strip()
    kl = f'{ROOT}/pixellab/{ad}_kur'
    shutil.rmtree(kl, ignore_errors=True); os.makedirs(kl)
    req = urllib.request.Request(f'https://api.pixellab.ai/v2/characters/{cid}/spritesheet',
                                 headers={'Authorization': 'Bearer ' + pxl.key()})
    open(f'{kl}/s.zip', 'wb').write(urllib.request.urlopen(req, timeout=180).read())
    with zipfile.ZipFile(f'{kl}/s.zip') as z:
        z.extractall(kl)
    sheet = Image.open(glob.glob(f'{kl}/*.png')[0]).convert('RGBA')
    meta = json.load(open(glob.glob(f'{kl}/*.json')[0]))
    C = meta['spritesheet']['cell_size']['width']
    rot, anim = {}, {}
    for r in meta['spritesheet']['rows']:
        if r['type'] == 'rotations':
            for i, d in enumerate(r['directions']):
                rot[d] = sheet.crop((i * C, 0, i * C + C, C))
        elif 'walk' in r['animation'].lower():
            y = r['row'] * C
            anim.setdefault(r['direction'], []).extend(
                sheet.crop((i * C, y, i * C + C, y + C)) for i in range(r['frame_count']))
    hedef = f'{ROOT}/public/assets/characters/{slot}'
    os.makedirs(hedef, exist_ok=True)
    for src, g in DIR.items():
        durus = otur(rot[src])
        for isim, n in SAYI.items():
            ham = anim.get(src) if isim == 'Walk' else None
            kare = ornekle([otur(f) for f in ham], n) if ham else [durus] * n
            sh = Image.new('RGBA', (CELL * n, CELL), (0, 0, 0, 0))
            for i, f in enumerate(kare):
                sh.paste(f, (i * CELL, 0))
            sh.save(f'{hedef}/{g}_{isim}.png')
    print(f'  characters/{slot} <- {ad} (yurume {"var" if anim else "YOK"})')
    aktor_uyum.klasor(hedef)   # yeni kadro daima sahnenin tonuna oturtulur


if __name__ == '__main__':
    kur(sys.argv[1], sys.argv[2])
