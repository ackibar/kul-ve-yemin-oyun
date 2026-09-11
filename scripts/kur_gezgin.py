"""PixelLab karakterini oyunun 32x32 sheet yapisina kurar.

Sheet metadata'sini okur: satir 0 rotasyonlar, digerleri animasyon.
Oyunun D/U/S yon semasina eslenir (S = dogu, sola bakarken motor aynaliyor).
"""
import glob, json, os, sys
sys.path.insert(0, os.path.dirname(__file__))
from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = 'pixellab/gezgin/sheet3'
DIR_MAP = {'south': 'D', 'north': 'U', 'east': 'S'}
# Kaynak sprite SAGA bakar (hem orijinal Craftpix seti hem PixelLab 'east' boyle).
# Motorun oyuncu cizimindeki ters aynalama engine.ts'te duzeltildi, burada cevirmiyoruz.
MIRROR_SIDE = False
# oyunun bekledigi kare sayilari
COUNTS = {'Idle': 4, 'Walk': 6, 'Attack': 4, 'Hurt': 2, 'Death': 8}

sheet = Image.open(glob.glob(f'{ROOT}/{SRC}/*.png')[0]).convert('RGBA')
meta = json.load(open(glob.glob(f'{ROOT}/{SRC}/*.json')[0]))
C = meta['spritesheet']['cell_size']['width']

# referans siluet: orijinal oyuncunun bbox'i -> ayni olcek ve ayak hizasi
ref = Image.open(f'{ROOT}/asset_backup_original/characters/1/D_Idle.png') \
    .convert('RGBA').crop((0, 0, 32, 32)).getbbox()
TH, FEET = ref[3] - ref[1], ref[3]


def fit32(f):
    bb = f.getbbox()
    if not bb:
        return Image.new('RGBA', (32, 32), (0, 0, 0, 0))
    sp = f.crop(bb)
    k = TH / sp.height
    nw, nh = max(1, round(sp.width * k)), max(1, round(sp.height * k))
    sp = sp.resize((nw, nh), Image.LANCZOS)
    px = sp.load()
    for y in range(nh):
        for x in range(nw):
            r, g, b, a = px[x, y]
            px[x, y] = (r, g, b, 255) if a >= 128 else (0, 0, 0, 0)
    out = Image.new('RGBA', (32, 32), (0, 0, 0, 0))
    out.paste(sp, (16 - nw // 2, FEET - nh))
    return out


def row_frames(r):
    y = r['row'] * C
    return [sheet.crop((i * C, y, i * C + C, y + C)) for i in range(r['frame_count'])]


rot, anims = {}, {}
for r in meta['spritesheet']['rows']:
    if r['type'] == 'rotations':
        for i, d in enumerate(r['directions']):
            rot[d] = sheet.crop((i * C, 0, i * C + C, C))
    else:
        name = r['animation'].split('_')[0].capitalize()   # walking_2 -> Walking
        name = 'Walk' if name.startswith('Walk') else name
        anims.setdefault(name, {})[r['direction']] = row_frames(r)

OUT = f'{ROOT}/pixellab/oyun_kurulum/characters/1'
os.makedirs(OUT, exist_ok=True)
made = []
for src_dir, g in DIR_MAP.items():
    idle = fit32(rot[src_dir])
    for action, n in COUNTS.items():
        frames = anims.get(action, {}).get(src_dir)
        if frames:
            fr = [fit32(f) for f in frames]
            fr = (fr * ((n // len(fr)) + 1))[:n]          # kare sayisini oyuna uydur
        else:
            fr = [idle] * n                               # henuz uretilmedi -> durus
        if g == 'S' and MIRROR_SIDE:
            fr = [f.transpose(Image.FLIP_LEFT_RIGHT) for f in fr]
        sh = Image.new('RGBA', (32 * n, 32), (0, 0, 0, 0))
        for i, f in enumerate(fr):
            sh.paste(f, (i * 32, 0))
        name = f'{g}_{action}.png'
        o = Image.open(f'{ROOT}/asset_backup_original/characters/1/{name}')
        assert sh.size == o.size, (name, sh.size, o.size)
        sh.save(f'{OUT}/{name}')
        made.append((name, 'ANIMASYONLU' if frames else 'durus (bekliyor)'))

for n, s in sorted(made):
    print(f'  {n:15s} {s}')
print(f'\n{len(made)} sheet uretildi -> {OUT}')
