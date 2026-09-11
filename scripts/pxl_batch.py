"""Mekan objeleri + esya ikonlari toplu uretimi.

Objeler: orijinal ayak izinin en kucuk cift kati (>=32 px kenar) boyutta uretilir.
  -> simdiki 16px dunyasi icin tam sayi oranla kucultulur (pixel art bozulmaz)
  -> 2x hali ileride 64x64 gecisi icin saklanir
Ikonlar: 32x32, saydam arka plan, tek seed (stil tutarliligi).
"""
import json, os, sys, time, urllib.request
sys.path.insert(0, os.path.dirname(__file__))
from PIL import Image
import pxl
from pxl_state import wait

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OBJ = os.path.join(ROOT, 'pixellab/objeler'); ICO = os.path.join(ROOT, 'pixellab/ikonlar')
os.makedirs(OBJ, exist_ok=True); os.makedirs(ICO, exist_ok=True)
SEED = 21
STYLE = 'worn dark wood, underground shelter, muted ash-grey and brown palette, top-down game prop'

OBJECTS = {  # ad: (orijinal dosya, tarif)
    'masa1':   ('2 Objects/Tables/1.png',    'long wooden workbench table with a few scattered tools'),
    'masa2':   ('2 Objects/Tables/2.png',    'plain wooden table with a folded map and a candle'),
    'sandalye':('2 Objects/Chairs/1.png',    'simple wooden stool chair'),
    'raf1':    ('2 Objects/Bookshelf/1.png', 'tall narrow bookshelf packed with old books and jars'),
    'raf2':    ('2 Objects/Bookshelf/2.png', 'tall narrow shelf with clay pots, rope and supplies'),
    'sandik1': ('2 Objects/Boxes/1.png',     'stack of wooden supply crates'),
    'sandik2': ('2 Objects/Boxes/2.png',     'wooden crate with a burlap sack on top'),
}
ICONS = {
    'rusty':    'rusty worn iron short sword',
    'guard':    'polished steel guard longsword with a crossguard',
    'ember':    'sword with a glowing ember-orange blade',
    'blood':    'black curved night-fang dagger with a dark blade',
    'bow':      'wooden hunting bow with a taut string',
    'arrow':    'bundle of three wooden arrows with iron tips',
    'leather':  'worn brown leather traveler jacket',
    'chain':    'chainmail armor shirt',
    'ash':      'ash-grey plate armor chestpiece',
    'copper':   'simple copper ring',
    'life':     'ring set with a small red gem',
    'wind':     'pale blue swirling wind seal amulet',
    'potion':   'round glass bottle of red healing potion with a cork',
    'tonic':    'small vial of glowing orange ember tonic',
    'wood':     'bundle of chopped firewood logs tied with rope',
    'torch':    'burning wooden torch',
    'medicine': 'small medicine bottle with a paper label',
    'ledger':   'old leather-bound ledger book with a clasp',
    'core':     'glowing ember heart crystal, ash and fire inside',
}


def factor(w, h):
    f = 2
    while min(w * f, h * f) < 32:
        f += 2
    return f


def main():
    b0 = pxl.balance()[0]; print(f'baslangic bakiye: {b0:.0f}')

    # --- 1) objeleri kuyruga at ---
    jobs = {}
    for name, (rel, desc) in OBJECTS.items():
        w, h = Image.open(f'{ROOT}/asset_backup_original/dungeon/{rel}').size
        f = factor(w, h)
        r = pxl.call('/map-objects', {
            'description': f'{desc}, {STYLE}', 'image_size': {'width': w * f, 'height': h * f},
            'view': 'low top-down', 'outline': 'single color outline',
            'shading': 'basic shading', 'detail': 'medium detail', 'seed': SEED})
        jobs[name] = (r['background_job_id'], r['object_id'], w, h, f)
        print(f'  obje kuyrukta: {name:9s} orijinal {w}x{h} -> uretim {w*f}x{h*f} (x{f})')

    # --- 2) objeler islenirken ikonlar (senkron) ---
    for iid, desc in ICONS.items():
        r = pxl.call('/create-image-pixflux', {
            'description': f'{desc}, game inventory item icon, centered single object, no text',
            'image_size': {'width': 32, 'height': 32}, 'no_background': True,
            'outline': 'single color black outline', 'shading': 'basic shading',
            'detail': 'medium detail', 'view': 'side', 'seed': SEED})
        got = pxl.walk_images(r, ICO, iid)
        if got:
            os.replace(got[0], f'{ICO}/{iid}.png')
        print(f'  ikon: {iid:9s} {"ok" if got else "GORSEL YOK"}', flush=True)
    b1 = pxl.balance()[0]; print(f'ikonlar sonrasi bakiye: {b1:.0f}')

    # --- 3) objeleri topla ---
    wait([j for j, *_ in jobs.values()], 'objeler')
    meta = {}
    for name, (job, oid, w, h, f) in jobs.items():
        o = pxl.call(f'/map-objects/{oid}')
        url = o.get('download_url')
        if not url:
            print(f'  {name}: download_url yok, durum={o.get("status")}'); continue
        raw = f'{OBJ}/{name}_raw.png'
        open(raw, 'wb').write(urllib.request.urlopen(url, timeout=60).read())
        im = Image.open(raw).convert('RGBA')
        meta[name] = {'orig': [w, h], 'factor': f, 'raw': im.size}
        print(f'  {name:9s} indirildi {im.size}')
    json.dump(meta, open(f'{OBJ}/meta.json', 'w'), indent=1)
    b2 = pxl.balance()[0]
    print(f'\nbitti. toplam harcanan: {b0-b2:.0f}  bakiye: {b2:.0f}')


if __name__ == '__main__':
    main()
