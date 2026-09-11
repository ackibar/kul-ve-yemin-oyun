"""Kullenmis'i enemies/4 yapisina kurar (yurume uretildi, saldiri/hasar turetildi)."""
import glob, json, os, shutil, sys, urllib.request, zipfile
sys.path.insert(0, os.path.dirname(__file__))
import pxl
from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CELL, FEET = 64, 62
DIR = {'south': 'D', 'north': 'U', 'east': 'S'}


def otur(f, kaydir=(0, 0), olcek=1.0):
    bb = f.getbbox()
    sp = f.crop(bb) if bb else f
    if olcek != 1.0:
        sp = sp.resize((max(1, round(sp.width*olcek)), max(1, round(sp.height*olcek))), Image.NEAREST)
    out = Image.new('RGBA', (CELL, CELL), (0, 0, 0, 0))
    out.paste(sp, (CELL//2 - sp.width//2 + kaydir[0], FEET - sp.height + kaydir[1]))
    return out


def kirmizi(im, guc=.4):
    px = im.load()
    for y in range(im.height):
        for x in range(im.width):
            r, g, b, a = px[x, y]
            if a:
                px[x, y] = (min(255, int(r+(255-r)*guc)), int(g*(1-guc*.6)), int(b*(1-guc*.6)), a)
    return im


def sayfa(k, yol):
    sh = Image.new('RGBA', (CELL*len(k), CELL), (0, 0, 0, 0))
    for i, f in enumerate(k):
        sh.paste(f, (i*CELL, 0))
    sh.save(yol)


def main():
    cid = open(f'{ROOT}/pixellab/id_kullenmis.txt').read().strip()
    kl = f'{ROOT}/pixellab/kullenmis_kur'
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
                rot[d] = sheet.crop((i*C, 0, i*C+C, C))
        elif 'walk' in r['animation'].lower():
            y = r['row']*C
            anim.setdefault(r['direction'], []).extend(
                sheet.crop((i*C, y, i*C+C, y+C)) for i in range(r['frame_count']))
    hedef = f'{ROOT}/public/assets/enemies/4'
    os.makedirs(hedef, exist_ok=True)
    for src, g in DIR.items():
        durus = otur(rot[src])
        yuru = [otur(f) for f in anim.get(src, [rot[src]]*4)][:6] or [durus]
        sayfa(yuru, f'{hedef}/{g}_Walk.png')
        # saldiri: one dogru hamle + hafif buyume
        sayfa([durus, otur(rot[src], (0, -2), 1.06), otur(rot[src], (0, -3), 1.12), durus],
              f'{hedef}/{g}_Attack.png')
        sayfa([kirmizi(otur(rot[src], (0, 2), .95)), kirmizi(otur(rot[src], (0, 1), .98), .22)],
              f'{hedef}/{g}_Hurt.png')
        sayfa([durus], f'{hedef}/{g}_Idle.png')
        sayfa([otur(rot[src], (0, 3), .9)], f'{hedef}/{g}_Death.png')
        print(f'  {g}: yurume {len(yuru)} kare')


if __name__ == '__main__':
    main()
