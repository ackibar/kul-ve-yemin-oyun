"""Kederli adami oyunun characters/6 yapisina kurar (durus + yurume)."""
import glob, json, os, shutil, sys, urllib.request, zipfile
sys.path.insert(0, os.path.dirname(__file__))
import pxl
from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CELL, FEET = 64, 62
DIR = {'south': 'D', 'north': 'U', 'east': 'S'}
SAYI = {'Idle': 4, 'Walk': 6, 'Attack': 4, 'Hurt': 2, 'Death': 8}


def otur(f):
    bb = f.getbbox()
    if not bb:
        return Image.new('RGBA', (CELL, CELL), (0, 0, 0, 0))
    sp = f.crop(bb)
    out = Image.new('RGBA', (CELL, CELL), (0, 0, 0, 0))
    out.paste(sp, (CELL // 2 - sp.width // 2, FEET - sp.height))
    return out


def ornekle(kare, n):
    if len(kare) == n:
        return kare
    return [kare[round(i * (len(kare) - 1) / max(1, n - 1))] for i in range(n)]


def main():
    cid = open(f'{ROOT}/pixellab/id_kederli.txt').read().strip()
    kl = f'{ROOT}/pixellab/kederli_kur'
    shutil.rmtree(kl, ignore_errors=True); os.makedirs(kl, exist_ok=True)
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
    hedef = f'{ROOT}/public/assets/characters/6'
    os.makedirs(hedef, exist_ok=True)
    for src, g in DIR.items():
        durus = otur(rot[src])
        for ad, n in SAYI.items():
            ham = anim.get(src) if ad == 'Walk' else None
            kare = ornekle([otur(f) for f in ham], n) if ham else [durus] * n
            sh = Image.new('RGBA', (CELL * n, CELL), (0, 0, 0, 0))
            for i, f in enumerate(kare):
                sh.paste(f, (i * CELL, 0))
            sh.save(f'{hedef}/{g}_{ad}.png')
        print(f'  {g}: durus + {"yurume" if anim.get(src) else "YURUME YOK"}')


if __name__ == '__main__':
    main()
