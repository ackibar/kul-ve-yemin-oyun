"""Fener tasiyan (kind 9) ve kralin cesedi: tek kare, duz pixflux (1'er uretim).

Fener tasiyan hareket etmez gibi durur, yaklasinca soner; yon sheet'i yok,
motor 'aynali' modda cizer. Ceset kralin oldurulmesinden sonra kosede kalir.
kullanim: python3 scripts/fener_uret.py [fener|ceset ...]   (--kur: yalniz kur)
"""
import glob, os, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import aktor_uyum, pxl
from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
HAM = f'{ROOT}/_arsiv/uretim/generated/fener'
STIL = ('dark fantasy pixel art game character, low top-down view, muted ash-grey palette, '
        'soot-stained, single dark outline, basic shading, no background')
IS = {
    'fener': ('a thin faceless hooded figure standing in blowing ash, holding up a small iron '
              'lantern with a warm orange glow, the lantern the only warm colour, the body a '
              'pale semi-transparent grey silhouette with tattered edges, ' + STIL, 57),
    'ceset': ('an old dead king lying on his side on the ground, long grey beard, grey ash-covered '
              'robe with a faint faded purple, a tarnished iron crown fallen on the ground beside '
              'his head, ' + STIL, 58),
}
CELL = 64


def uret(ad):
    os.makedirs(HAM, exist_ok=True)
    tarif, seed = IS[ad]
    r = pxl.call('/create-image-pixflux', {
        'description': tarif, 'image_size': {'width': 64, 'height': 64},
        'no_background': True, 'view': 'low top-down', 'seed': seed,
        'outline': 'single color black outline', 'shading': 'basic shading', 'detail': 'medium detail'})
    got = pxl.walk_images(r, HAM, ad)
    if not got:
        print('  !!', ad, 'gorsel donmedi'); sys.exit(1)
    print('  ham:', got[0])


def hucre(im, taban=62):
    bb = im.getbbox(); sp = im.crop(bb) if bb else im
    c = Image.new('RGBA', (CELL, CELL), (0, 0, 0, 0))
    c.paste(sp, (CELL // 2 - sp.width // 2, taban - sp.height))
    return c


def kur(ad):
    im = Image.open(sorted(glob.glob(f'{HAM}/{ad}*.png'))[-1]).convert('RGBA')
    if ad == 'fener':
        hedef = f'{ROOT}/public/assets/enemies/9'
        os.makedirs(hedef, exist_ok=True)
        c = hucre(im)
        for g in 'DUS':
            for isim, n in {'Idle': 4, 'Walk': 6, 'Attack': 4, 'Hurt': 2, 'Death': 8}.items():
                sh = Image.new('RGBA', (CELL * n, CELL), (0, 0, 0, 0))
                for i in range(n):
                    sh.paste(c, (i * CELL, 0))
                sh.save(f'{hedef}/{g}_{isim}.png')
        aktor_uyum.klasor(hedef, ham_yenile=True)
        print('  enemies/9 kuruldu')
    else:
        # Kralin cesedi: characters/13/D_Corpse.png (Rauf'unki gibi tek kare 64x64).
        yol = f'{ROOT}/public/assets/characters/13/D_Corpse.png'
        hucre(im, taban=60).save(yol)
        print('  ', yol)


if __name__ == '__main__':
    adlar = [a for a in sys.argv[1:] if a in IS] or list(IS)
    for ad in adlar:
        if '--kur' not in sys.argv:
            uret(ad)
        kur(ad)
