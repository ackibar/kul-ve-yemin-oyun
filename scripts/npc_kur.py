"""Uretilen NPC karakterini oyunun characters/<n> yapisina kurar.

NPC'ler motorda yalnizca `characters<n>DIdle` ile ciziliyor ve kare sayisina
gore donuyor; yine de yukleyici 15 dosyanin hepsini bekledigi icin (eksikse
"gorseller yuklenemedi" uyarisi cikiyor) tum aksiyonlar yazilir.
Idle animasyonu varsa D_Idle ondan gelir, digerleri durus karesidir.
"""
import glob, json, os, sys, urllib.request
sys.path.insert(0, os.path.dirname(__file__))
from PIL import Image
import pxl

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DIR_MAP = {'south': 'D', 'north': 'U', 'east': 'S'}
COUNTS = {'Idle': 4, 'Walk': 6, 'Attack': 4, 'Hurt': 2, 'Death': 8}
CELL = 64

# Gezgin ile ayni siluet olcegi: orijinal 32'lik referanstan turetilir
# Sprite DOGAL boyunda kalir: kuculterek detay atmak yerine hucreye
# oldugu gibi oturur, ayaklar y=62'de. Motor anchor'i buna gore.
FEET = 62


def fit(f):
    bb = f.getbbox()
    if not bb:
        return Image.new('RGBA', (CELL, CELL), (0, 0, 0, 0))
    sp = f.crop(bb)
    nw, nh = sp.size          # olceklenmez
    out = Image.new('RGBA', (CELL, CELL), (0, 0, 0, 0))
    out.paste(sp, (CELL // 2 - nw // 2, FEET - nh))
    return out


def indir(cid, ad):
    kl = f'{ROOT}/_arsiv/uretim/pixellab/{ad}'
    os.makedirs(kl, exist_ok=True)
    req = urllib.request.Request(
        f'https://api.pixellab.ai/v2/characters/{cid}/spritesheet',
        headers={'Authorization': 'Bearer ' + pxl.key()})
    open(f'{kl}/sheet.zip', 'wb').write(urllib.request.urlopen(req, timeout=120).read())
    import zipfile
    with zipfile.ZipFile(f'{kl}/sheet.zip') as z:
        z.extractall(kl)
    return kl


def kur(ad, slot):
    cid = open(f'{ROOT}/_arsiv/uretim/pixellab/id_{ad}.txt').read().strip()
    kl = indir(cid, ad)
    sheet = Image.open(glob.glob(f'{kl}/*.png')[0]).convert('RGBA')
    meta = json.load(open(glob.glob(f'{kl}/*.json')[0]))
    C = meta['spritesheet']['cell_size']['width']
    rot, idle, walk = {}, {}, {}
    for r in meta['spritesheet']['rows']:
        if r['type'] == 'rotations':
            for i, d in enumerate(r['directions']):
                rot[d] = sheet.crop((i * C, 0, i * C + C, C))
        elif r['type'] == 'animation':
            y = r['row'] * C
            kare = [sheet.crop((i * C, y, i * C + C, y + C))
                    for i in range(r['frame_count'])]
            # PixelLab isimlendirmesi tutarsiz ('animating', 'walking', 'breathing idle');
            # yuruyus disindaki her sey durus/nefes sayilir.
            if 'walk' in r.get('animation', '').lower():
                walk[r['direction']] = kare
            else:
                idle[r['direction']] = kare
    out = f'{ROOT}/public/assets/characters/{slot}'
    os.makedirs(out, exist_ok=True)
    for src_d, g in DIR_MAP.items():
        durus = fit(rot[src_d])
        for act, n in COUNTS.items():
            raw = idle.get(src_d) if act == 'Idle' else walk.get(src_d) if act == 'Walk' else None
            if raw:
                fr = [fit(f) for f in raw]
                fr = [fr[round(i * (len(fr) - 1) / max(1, n - 1))] for i in range(n)]
                tag = f'{len(raw)} kareli nefes'
            else:
                fr, tag = [durus] * n, 'durus'
            sh = Image.new('RGBA', (CELL * n, CELL), (0, 0, 0, 0))
            for i, f in enumerate(fr):
                sh.paste(f, (i * CELL, 0))
            sh.save(f'{out}/{g}_{act}.png')



    kareler = Image.open(f'{out}/D_Idle.png').width // CELL
    print(f'  {ad} -> characters/{slot}  D_Idle {kareler} kare'
          f"  ({'nefes animasyonlu' if idle else 'durus'})")


if __name__ == '__main__':
    for ad, slot in [('mira', 3), ('boran', 2), ('ekin', 4)]:
        if os.path.exists(f'{ROOT}/_arsiv/uretim/pixellab/id_{ad}.txt'):
            kur(ad, slot)
        else:
            print(f'  {ad}: henuz uretilmedi, atlandi')
