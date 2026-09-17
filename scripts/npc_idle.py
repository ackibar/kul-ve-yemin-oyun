"""Durağan NPC'ye nefes alan idle animasyonu uretir ve kurar.

Neden sablon degil v3: `/characters/animations` mode=template (`breathing-idle`)
karakterin ELINDEKI nesneyi dusuruyor - Karga'nin mizragi ilk denemede kayboldu
(bkz. v3_anim.py basindaki ayni ders). mode=v3 + keep_first_frame karakterin
donus karesinden basladigi icin nesne her karede elde kaliyor. Fiyat ayni:
1 uretim/yon, NPC'ler yalniz guney cizildigi icin 1.

kullanim:
    python3 scripts/npc_idle.py uret <ad>          # <ad>: id_<ad>.txt
    python3 scripts/npc_idle.py kur  <ad> <slot>
"""
import base64, glob, io, os, sys, time
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import aktor_uyum
import pxl
from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
HAM = f'{ROOT}/_arsiv/uretim/asset_backup_ton_oncesi'
CELL, FEET = 64, 62
# 3-4. kareler nefes degil SAPMA (0. kareye uzaklik indisle tekduze buyuyor:
# obruk2'de 324/1295/1415/1936 piksel; ceket aciliyor, govde inceliyor).
# 0,1,2,1 hem nefes alip verme hem de sapma karelerine hic girmiyor.
SIRA = [0, 1, 2, 1]

# Ortak sart: v3 uretken, "dur" demezsen NPC yuruyor ya da doneriyor.
DUR = ('; the feet never move, the body never turns and never walks, the '
       'character stays in exactly the same spot and pose')
NEFES = ('stands still and breathes quietly, the chest and shoulders rising and '
         'falling slightly and the head barely moving')
# Elde ne varsa ADIYLA yazilmali; "whatever is held" yeterli olmadigi yerde
# nesnenin maddesi de yazilir (kilic tarifleri gibi).
TARIF = {
    'karga': (NEFES + '; the tall spear stays planted upright on the ground in the '
              'hand and the second spear stays strapped to the back in every single '
              'frame' + DUR),
    'cakal': (NEFES + '; the axe stays gripped in the hand down at the side in every '
              'single frame' + DUR),
    'kederli': (NEFES + '; whatever is held in the hands stays exactly where it is in '
                'every single frame' + DUR),
    'obruk2': (NEFES.replace('the chest and shoulders', 'the heavy chest and belly') +
               ', the arms hanging relaxed at the sides' + DUR),
}


def bekle(joblar, etiket):
    for i in range(240):
        d = [pxl.call(f'/background-jobs/{j}') for j in joblar]
        st = [x.get('status') for x in d]
        if i % 6 == 0:
            print(f'  {i*5:3d}sn {etiket} {st}', flush=True)
        if all(s in ('completed', 'succeeded', 'done', 'failed', 'error') for s in st):
            return d
        time.sleep(5)
    return d


def uret(ad):
    cid = open(f'{ROOT}/_arsiv/uretim/pixellab/id_{ad}.txt').read().strip()
    ham = f'{ROOT}/_arsiv/uretim/pixellab/v3/npc_{ad}'
    os.makedirs(ham, exist_ok=True)
    once = pxl.balance()[0]
    r = pxl.call('/characters/animations', {
        'character_id': cid, 'mode': 'v3', 'animation_name': f'npc-{ad}-Idle',
        'action_description': TARIF[ad], 'directions': ['south'],
        'frame_count': 4, 'keep_first_frame': True, 'seed': 21})
    for d in bekle([j for j in (r.get('background_job_ids') or []) if j], f'{ad}/Idle'):
        son = d.get('last_response') or {}
        if d.get('status') != 'completed':
            print(f'  !! {ad} basarisiz: {d.get("status")}')
            continue
        for i, g in enumerate(son.get('images') or []):
            Image.open(io.BytesIO(base64.b64decode(g['base64'].split(',')[-1]))) \
                 .convert('RGBA').save(f'{ham}/Idle_south_{i:02d}.png')
        print(f'  {ad}: {len(son.get("images") or [])} kare -> {ham}')
    time.sleep(3)
    print(f'{ad} bitti. maliyet={once-pxl.balance()[0]:.0f} uretim')


def kur(ad, slot):
    """Kareleri KENDI bbox'ina gore ortalamak yanlis: kol ya da nesne kipirdayinca
    govde yatayda kayiyor ve nefes yerine titreme okunuyor. Yalniz 0. kare
    otur() kuraliyla yerlesir, kalani AYNI otelemeyle basilir."""
    kare = [Image.open(p).convert('RGBA') for p in
            sorted(glob.glob(f'{ROOT}/_arsiv/uretim/pixellab/v3/npc_{ad}/Idle_south_*.png'))]
    bb = kare[0].getbbox()
    dx, dy = CELL // 2 - (bb[2] - bb[0]) // 2 - bb[0], FEET - bb[3]
    sh = Image.new('RGBA', (CELL * len(SIRA), CELL), (0, 0, 0, 0))
    for i, k in enumerate(SIRA):
        hucre = Image.new('RGBA', (CELL, CELL), (0, 0, 0, 0))
        hucre.paste(kare[k], (dx, dy), kare[k])
        sh.paste(hucre, (i * CELL, 0))
    hedef, yedek = f'{ROOT}/public/assets/characters/{slot}', f'{HAM}/characters/{slot}'
    eski = Image.open(f'{hedef}/D_Idle.png').crop((0, 0, CELL, CELL)).getbbox()
    yeni = sh.crop((0, 0, CELL, CELL)).getbbox()
    if eski != yeni:
        # Uyusmazlik genelde YANLIS KARAKTER demek: id_obruk / id_obruk2 gibi iki
        # surum duruyorsa kurulu olan hangisiyse ondan uretilmeli.
        print(f'  !! {ad}: bbox tutmadi {eski} -> {yeni}; yanlis karakterden mi uretildi?')
    assert os.path.isdir(yedek), yedek
    sh.save(f'{yedek}/D_Idle.png')     # ham kaynak yenilenir
    aktor_uyum.klasor(hedef)           # derece DAIMA ham yedekten uretilir
    print(f'  {ad} -> characters/{slot}  {len(SIRA)} kare  ofset=({dx},{dy})')


if __name__ == '__main__':
    if sys.argv[1] == 'uret':
        for a in sys.argv[2:]:
            uret(a)
        print('kalan bakiye:', pxl.balance())
    else:
        kur(sys.argv[2], sys.argv[3])
