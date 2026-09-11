"""Zindan setini (tile + nesne + animasyonlu nesne) sicak tona cevirir."""
import argparse, os, sys
sys.path.insert(0, os.path.dirname(__file__))
from PIL import Image
import env_tone as E

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
BASE = os.path.join(ROOT, 'public/assets/dungeon')
ap = argparse.ArgumentParser(); ap.add_argument('--yes', action='store_true')
a = ap.parse_args()

if not os.path.isdir(os.path.join(ROOT, 'asset_backup_original')):
    raise SystemExit('yedek yok')

files = []
for root, _, fs in os.walk(BASE):
    for f in fs:
        if f.endswith('.png'):
            files.append(os.path.join(root, f))
print(f'{len(files)} zindan gorseli bulundu')
if not a.yes:
    print('uygulamak icin --yes')
    raise SystemExit(0)

for i, p in enumerate(files):
    # daima YEDEKTEN oku: ustuste donusum birikmesin
    rel = os.path.relpath(p, os.path.join(ROOT, 'public/assets'))
    src = os.path.join(ROOT, 'asset_backup_original', rel)
    im = Image.open(src if os.path.exists(src) else p).convert('RGBA')
    before = im.size
    out = E.convert(im)
    assert out.size == before, p
    out.save(p, 'PNG')
print(f'{len(files)} gorsel donusturuldu.')
print('geri alma: cp -R asset_backup_original/. public/assets/')
