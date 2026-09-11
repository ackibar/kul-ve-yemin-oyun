"""Rauf'u oyuna kurar: characters/5 (NPC) ve enemies/6 (dovus).

Ayni sheet iki yere kurulur cunku motor NPC'yi characters<n>, dusmani
enemies<kind> anahtariyla ciziyor. Sprite dogal cozunurlukte kalir; ayak
hizasi ve govde ortalamasi digerleriyle ayni kurala tabi.
"""
import glob, json, os, shutil, sys, urllib.request, zipfile
sys.path.insert(0, os.path.dirname(__file__))
from PIL import Image
import pxl

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CELL, FEET = 64, 62
DIR_MAP = {'south': 'D', 'north': 'U', 'east': 'S'}
COUNTS = {'Idle': 4, 'Walk': 6, 'Attack': 4, 'Hurt': 2, 'Death': 8}
# Diz cokme yalnizca guney yonunde ve ayri dosyada (motor 15 standart
# sheet bekliyor, fazlasi yukleyiciyi bozmasin diye elle yukleniyor).
KNEEL_N = 4
AD_MAP = {'walking': 'Walk', 'cross punch attack': 'Attack', 'attack': 'Attack',
          'taking punch': 'Hurt', 'taking a punch': 'Hurt', 'crouching': 'Kneel', 'falling back death': 'Death'}


def fit(f):
    bb = f.getbbox()
    if not bb:
        return Image.new('RGBA', (CELL, CELL), (0, 0, 0, 0))
    sp = f.crop(bb)
    out = Image.new('RGBA', (CELL, CELL), (0, 0, 0, 0))
    out.paste(sp, (CELL // 2 - sp.width // 2, FEET - sp.height))
    return out


def indir(cid, kl):
    os.makedirs(kl, exist_ok=True)
    req = urllib.request.Request(
        f'https://api.pixellab.ai/v2/characters/{cid}/spritesheet',
        headers={'Authorization': 'Bearer ' + pxl.key()})
    open(f'{kl}/s.zip', 'wb').write(urllib.request.urlopen(req, timeout=120).read())
    with zipfile.ZipFile(f'{kl}/s.zip') as z:
        z.extractall(kl)


def main():
    cid = open(f'{ROOT}/pixellab/id_rauf.txt').read().strip()
    kl = f'{ROOT}/pixellab/rauf_kur'
    shutil.rmtree(kl, ignore_errors=True)
    indir(cid, kl)
    sheet = Image.open(glob.glob(f'{kl}/*.png')[0]).convert('RGBA')
    meta = json.load(open(glob.glob(f'{kl}/*.json')[0]))
    C = meta['spritesheet']['cell_size']['width']
    rot, anim = {}, {}
    for r in meta['spritesheet']['rows']:
        if r['type'] == 'rotations':
            for i, d in enumerate(r['directions']):
                rot[d] = sheet.crop((i * C, 0, i * C + C, C))
        else:
            ad = AD_MAP.get(r['animation'].rstrip('_0123456789').strip())
            if not ad:
                print(f"  ? bilinmeyen animasyon: {r['animation']!r}"); continue
            y = r['row'] * C
            anim.setdefault(ad, {})[r['direction']] = [
                sheet.crop((i * C, y, i * C + C, y + C)) for i in range(r['frame_count'])]
    print('  bulunan animasyonlar:', {k: list(v) for k, v in anim.items()})

    for hedef in (f'{ROOT}/public/assets/characters/5', f'{ROOT}/public/assets/enemies/6'):
        os.makedirs(hedef, exist_ok=True)
        for src_d, g in DIR_MAP.items():
            durus = fit(rot[src_d])
            for act, n in COUNTS.items():
                raw = anim.get(act, {}).get(src_d)
                if raw:
                    fr = [fit(x) for x in raw]
                    fr = [fr[round(i * (len(fr) - 1) / max(1, n - 1))] for i in range(n)]
                else:
                    fr = [durus] * n
                sh = Image.new('RGBA', (CELL * n, CELL), (0, 0, 0, 0))
                for i, x in enumerate(fr):
                    sh.paste(x, (i * CELL, 0))
                sh.save(f'{hedef}/{g}_{act}.png')
        print(f'  kuruldu -> {hedef.split("public/assets/")[1]}')
    diz = anim.get('Kneel', {}).get('south')
    if diz:
        fr = [fit(x) for x in diz]
        fr = [fr[round(i * (len(fr) - 1) / max(1, KNEEL_N - 1))] for i in range(KNEEL_N)]
        sh = Image.new('RGBA', (CELL * KNEEL_N, CELL), (0, 0, 0, 0))
        for i, x in enumerate(fr):
            sh.paste(x, (i * CELL, 0))
        sh.save(f'{ROOT}/public/assets/characters/5/D_Kneel.png')
        print(f'  diz cokme kuruldu ({len(diz)} kare -> {KNEEL_N})')
    else:
        print('  diz cokme animasyonu bulunamadi')


if __name__ == '__main__':
    main()
