"""PixelLab karakter sheet'ini oyunun 32x32 yapisina kurar (silah varyanti destekli).

kullanim: python3 scripts/kur_varyant.py <kaynak_klasor> <hedef_klasor>
"""
import glob, json, os, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import aktor_uyum
from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DIR_MAP = {'south': 'D', 'north': 'U', 'east': 'S'}
COUNTS = {'Idle': 4, 'Walk': 6, 'Attack': 4, 'Hurt': 2, 'Death': 8}
# PixelLab sablon adi -> oyun aksiyonu.
# 'cross punch attack' BILEREK disarida: iskelet tabanli sablon animasyonu
# karakteri poza gore yeniden kurarken elindeki kilici dusuruyor (bbox 48->30 px,
# 395 piksel kayip). Saldiri, kilicin gorundugu durus karesine duser; vurus
# hissini motorun zaten cizdigi kesme yayi veriyor.
ACTION_MAP = {'walking': 'Walk'}

# Hucre boyutu: 32 (eski dunya) veya 64 (2x render yogunlugu).
CELL = int(sys.argv[3]) if len(sys.argv) > 3 else 64
# Sprite DOGAL boyunda kalir: kuculterek detay atmak yerine hucreye oldugu gibi
# oturur, ayaklar tabanda. Motor anchor'i buna gore ayarli.
FEET = CELL - 2


def fit32(f):
    bb = f.getbbox()
    if not bb:
        return Image.new('RGBA', (CELL, CELL), (0, 0, 0, 0))
    sp = f.crop(bb)
    nw, nh = sp.size          # olceklenmez
    out = Image.new('RGBA', (CELL, CELL), (0, 0, 0, 0))
    out.paste(sp, (CELL // 2 - nw // 2, FEET - nh))
    return out


def resample(frames, n):
    """Kare sayisini oyunun bekledigine uydurur - bastan kesmek yerine
    esit araliklarla ornekler, boylece vurusun devami kaybolmaz."""
    if len(frames) == n:
        return frames
    return [frames[round(i * (len(frames) - 1) / max(1, n - 1))] for i in range(n)]


def build(src_dir, out_dir):
    sheet = Image.open(glob.glob(f'{src_dir}/*.png')[0]).convert('RGBA')
    meta = json.load(open(glob.glob(f'{src_dir}/*.json')[0]))
    C = meta['spritesheet']['cell_size']['width']
    rot, anims = {}, {}
    for r in meta['spritesheet']['rows']:
        if r['type'] == 'rotations':
            for i, d in enumerate(r['directions']):
                rot[d] = sheet.crop((i * C, 0, i * C + C, C))
        else:
            act = ACTION_MAP.get(r['animation'].rstrip('_0123456789').strip())
            if not act:
                continue
            y = r['row'] * C
            anims.setdefault(act, {})[r['direction']] = [
                sheet.crop((i * C, y, i * C + C, y + C)) for i in range(r['frame_count'])]

    os.makedirs(out_dir, exist_ok=True)
    log = []
    for src_d, g in DIR_MAP.items():
        idle = fit32(rot[src_d])
        for action, n in COUNTS.items():
            raw = anims.get(action, {}).get(src_d)
            if raw:
                fr = resample([fit32(f) for f in raw], n)
                tag = 'ANIMASYONLU'
            else:
                fr, tag = [idle] * n, 'durus'
            sh = Image.new('RGBA', (CELL * n, CELL), (0, 0, 0, 0))
            for i, f in enumerate(fr):
                sh.paste(f, (i * CELL, 0))
            sh.save(f'{out_dir}/{g}_{action}.png')
            log.append((f'{g}_{action}', tag))
    aktor_uyum.klasor(out_dir, ham_yenile=True)   # yeni kadro daima sahnenin tonuna oturtulur
    return log


if __name__ == '__main__':
    for n, t in build(sys.argv[1], sys.argv[2]):
        print(f'  {n:12s} {t}')
