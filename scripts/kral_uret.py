"""Kullerin Krali: kosede OTURAN, hic konusmayan adam.

Mannequin sablonu ayakta durur; oturan figur icin duz pixflux (1 uretim).
Karakter API'si olmadigi icin sheet'i bu dosya kurar: figur hucrenin
TEPESINE oturtulur (kafa ustte) ki portre kirpimi (D_Idle'in ust 24 satiri)
bos cikmasin; motor entity'deki `capa` ile zemin satirini ona gore alir.

kullanim: python3 scripts/kral_uret.py          (uretir + kurar)
          python3 scripts/kral_uret.py --kur    (eldeki ham gorseli kurar)
"""
import glob, os, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import aktor_uyum, pxl
from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
HAM = f'{ROOT}/_arsiv/uretim/generated/kral'
SLOT = 13
TARIF = ('an old broken king sitting on the ground with his knees drawn up, slumped, '
         'a tarnished dented iron crown on his head, long grey unkempt beard full of ash, '
         'a once-royal robe now grey with ash with only a faint faded purple left, hollow '
         'empty eyes staring ahead, thin hands resting on his knees, dark fantasy pixel art '
         'game character, muted ash-grey palette, soot-stained, single dark outline, '
         'basic shading, no background, human')
CELL, USTPAY = 64, 3
# Zemin satiri: figur tepeden USTPAY ile baslar, alt sinir figurun boyuna bagli.
# world.ts'teki capa = zemin_satiri / 2 (sprite() satir = 2*capa).


def uret():
    os.makedirs(HAM, exist_ok=True)
    r = pxl.call('/create-image-pixflux', {
        'description': TARIF, 'image_size': {'width': 64, 'height': 64},
        'no_background': True, 'view': 'low top-down', 'seed': 91,
        'outline': 'single color black outline', 'shading': 'basic shading',
        'detail': 'medium detail'})
    got = pxl.walk_images(r, HAM, 'kral')
    if not got:
        print('  !! kral gorsel donmedi'); sys.exit(1)
    print('  ham:', got[0])


def kur():
    im = Image.open(sorted(glob.glob(f'{HAM}/kral*.png'))[-1]).convert('RGBA')
    bb = im.getbbox(); sp = im.crop(bb)
    cell = Image.new('RGBA', (CELL, CELL), (0, 0, 0, 0))
    cell.paste(sp, (CELL // 2 - sp.width // 2, USTPAY))
    zemin = USTPAY + sp.height
    hedef = f'{ROOT}/public/assets/characters/{SLOT}'
    os.makedirs(hedef, exist_ok=True)
    for g in 'DUS':
        for isim, n in {'Idle': 4, 'Walk': 6, 'Attack': 4, 'Hurt': 2, 'Death': 8}.items():
            sh = Image.new('RGBA', (CELL * n, CELL), (0, 0, 0, 0))
            for i in range(n):
                sh.paste(cell, (i * CELL, 0))
            sh.save(f'{hedef}/{g}_{isim}.png')
    aktor_uyum.klasor(hedef, ham_yenile=True)
    print(f'  characters/{SLOT} kuruldu; figur {sp.width}x{sp.height}, zemin satiri {zemin} -> world.ts capa={zemin/2:g}')


if __name__ == '__main__':
    if '--kur' not in sys.argv:
        uret()
    kur()
