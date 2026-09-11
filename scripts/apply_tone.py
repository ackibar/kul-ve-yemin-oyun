"""generated/<mod>/ altindaki sheet'leri public/assets'e uygular.

Her dosya once dogrulanir: olcu birebir tutmali ve SILUET degismemeli
(renk disinda hicbir sey degismemeli). Tek bir dosya bile bu testi
gecemezse hicbir sey yazilmaz.
"""
import argparse, os, shutil, sys
sys.path.insert(0, os.path.dirname(__file__))
from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ACTIONS = ['Idle', 'Walk', 'Attack', 'Hurt', 'Death']

ap = argparse.ArgumentParser()
ap.add_argument('--mode', default='tone')
ap.add_argument('--yes', action='store_true')
a = ap.parse_args()

if not os.path.isdir(os.path.join(ROOT, 'asset_backup_original')):
    raise SystemExit('asset_backup_original yok - once yedek al')

plan, bad = [], []
for kind, cnt in [('characters', 3), ('enemies', 5)]:
    for n in range(1, cnt + 1):
        for d in ['D', 'U', 'S']:
            for act in ACTIONS:
                name = f'{d}_{act}.png'
                src = os.path.join(ROOT, 'generated', a.mode, kind, str(n), name)
                dst = os.path.join(ROOT, 'public/assets', kind, str(n), name)
                if not os.path.exists(src):
                    bad.append((src, 'uretim yok')); continue
                s, o = Image.open(src).convert('RGBA'), Image.open(dst).convert('RGBA')
                if s.size != o.size:
                    bad.append((name, f'olcu {s.size} != {o.size}')); continue
                sp, op = s.load(), o.load()
                diff = sum(1 for y in range(o.height) for x in range(o.width)
                           if (sp[x, y][3] > 0) != (op[x, y][3] > 0))
                if diff:
                    bad.append((name, f'siluet {diff}px degismis')); continue
                plan.append((src, dst))

print(f'dogrulanan: {len(plan)}   reddedilen: {len(bad)}')
for n, why in bad[:10]:
    print(f'  RED {n}: {why}')
if bad:
    raise SystemExit('dogrulama basarisiz - hicbir sey yazilmadi')
if not a.yes:
    print(f'{len(plan)} sheet hazir. Uygulamak icin --yes ekle.')
    raise SystemExit(0)
for s, d in plan:
    shutil.copy2(s, d)
print(f'{len(plan)} sheet uygulandi.')
print('geri alma:  cp -R asset_backup_original/. public/assets/')
