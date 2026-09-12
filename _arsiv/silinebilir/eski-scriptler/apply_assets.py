"""Onaylanan sheet'leri generated/ -> public/assets/ altina uygular.

Guvenlik: olcu ve kare sayisi orijinalle birebir tutmayan hicbir dosya
uygulanmaz. Orijinaller asset_backup_original/ altinda durur.
"""
import argparse, os, shutil, sys
sys.path.insert(0, os.path.dirname(__file__))
from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--actor', required=True, help='orn. characters/1')
    ap.add_argument('--yes', action='store_true', help='gercekten uygula')
    a = ap.parse_args()

    tag = a.actor.replace('/', '_')
    src_dir = os.path.join(ROOT, '_arsiv/uretim/generated', tag, 'sheets')
    dst_dir = os.path.join(ROOT, 'public/assets', a.actor)
    if not os.path.isdir(src_dir):
        raise SystemExit(f'uretim yok: {src_dir}')
    if not os.path.isdir(os.path.join(ROOT, 'asset_backup_original')):
        raise SystemExit('asset_backup_original yok - once yedek al')

    plan, blocked = [], []
    for f in sorted(os.listdir(src_dir)):
        if not f.endswith('.png'):
            continue
        s, d = os.path.join(src_dir, f), os.path.join(dst_dir, f)
        if not os.path.exists(d):
            blocked.append((f, 'orijinali yok')); continue
        ss, ds = Image.open(s).size, Image.open(d).size
        if ss != ds:
            blocked.append((f, f'olcu uyusmuyor {ss} != {ds}')); continue
        plan.append((f, s, d, ss))

    for f, s, d, size in plan:
        print(f'  UYGULANACAK {a.actor}/{f}  {size[0]}x{size[1]}')
    for f, why in blocked:
        print(f'  ATLANDI     {f}  ({why})')

    if not a.yes:
        print(f'\n{len(plan)} dosya hazir. Gercekten uygulamak icin --yes ekle.')
        return
    for f, s, d, _ in plan:
        shutil.copy2(s, d)
    print(f'\n{len(plan)} sheet uygulandi. Geri almak icin:')
    print(f'  cp -R asset_backup_original/{a.actor}/. public/assets/{a.actor}/')


if __name__ == '__main__':
    main()
