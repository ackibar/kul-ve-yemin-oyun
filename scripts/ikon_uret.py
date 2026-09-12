"""Envanter ikonu uretir (32x32) ve public/assets/icons/items/ altina kurar.

Mevcut ikonlarla ayni dil: tek nesne, ortalanmis, arka plan yok, kul paleti.
Ton uyumu UYGULANMAZ - ikonlar parsomen panelin uzerinde duruyor, sahnenin
karanligina cekilirse okunmuyorlar.

kullanim: python3 scripts/ikon_uret.py <item_id> [item_id...]
"""
import os, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import pxl
from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
HEDEF = f'{ROOT}/public/assets/icons/items'
HAM = f'{ROOT}/_arsiv/uretim/generated/ikon'
STIL = ('dark fantasy pixel art game inventory icon, single object centered, '
        'muted ash-grey and worn leather palette, single dark outline, '
        'basic shading, no background, no text, no border')

TARIF = {
    'tatar':  'a small steel crossbow seen from the side, short thick limbs, taut string',
    'kemik':  'a chest armour piece made of pale bone plates lashed with leather straps',
    'yelek':  'a light hunter vest of dark leather with a quiver strap across it',
    'gozu':   'a plain iron ring set with a dull grey ash-coloured eye-shaped stone',
    'bileme': 'a rectangular grey whetstone with a worn leather grip band',
    'mizrak':  'a long ash-grey spear with a narrow steel head and wrapped shaft',
    'balta':   'a heavy two-handed splitting axe with a broad chipped blade',
    'hancer':  'a slim dark dagger with a blackened blade and wrapped grip',
    'topuz':   'a heavy iron flanged mace with a short thick handle',
    'yemin':   'a straight knightly sword with a plain crossguard and a red cord tied to the grip',
    'uzunyay': 'a tall wooden longbow, slim curved limbs, taut string',
    'okates':  'a single arrow with a burning orange-tipped head',
    'tuzet':  'a thick slab of dark salted dried meat, coarse salt crystals on the surface, tied with twine',
    'durusu': 'a stoppered clay water flask with a clean pale blue water drop motif on its side',
    'petek':  'a golden honeycomb piece dripping honey, waxy hexagon cells',
    'muhur':  'a fat gold signet ring with a dark engraved crest stone, thick heavy band',
    'okzehir': 'a single arrow with a dripping green venom-coated head, faint sickly green glow',
    'okdelici':'a single arrow with a long narrow armour-piercing steel head',
    'okcengel':'a single arrow with a barbed hook head and a thin rope coiled at the shaft',
    'pelerin': 'a hooded grey travelling cloak folded, ash dusted',
    'ocakz':   'a heavy blackened plate cuirass with soot marks',
    'kanm':    'a dark iron ring set with a deep red blood-coloured stone',
    'yeminh':  'a plain pale silver ring with a thin engraved band, no stone',
    'merhem':  'a small clay jar of pale salve with a linen bandage wrapped round it',
    'kavanoz': 'a glass jar filled with glowing orange embers, cork stopper',
    'toz':     'a small leather pouch spilling fine grey ash powder',
}


def uret(ad):
    os.makedirs(HAM, exist_ok=True); os.makedirs(HEDEF, exist_ok=True)
    r = pxl.call('/create-image-pixflux', {
        'description': f'{TARIF[ad]}, {STIL}',
        'image_size': {'width': 32, 'height': 32}, 'no_background': True,
        'outline': 'single color black outline', 'shading': 'basic shading',
        'detail': 'low detail', 'view': 'side', 'seed': 19})
    got = pxl.walk_images(r, HAM, ad)
    if not got:
        print('  !!', ad, 'gorsel donmedi'); return
    im = Image.open(got[0]).convert('RGBA')
    if im.size != (32, 32):
        im = im.resize((32, 32), Image.NEAREST)
    im.save(f'{HEDEF}/{ad}.png')
    print(f'  icons/items/{ad}.png hazir')


if __name__ == '__main__':
    once = pxl.balance()[0]
    for a in sys.argv[1:]:
        uret(a)
    print(f'maliyet={once-pxl.balance()[0]:.0f} uretim')
