"""Renk dunyasi aktarimini tum aktor setine uygular (generated/palette/)."""
import os, sys
sys.path.insert(0, os.path.dirname(__file__))
from PIL import Image
import argparse
import pixelize as P

ap = argparse.ArgumentParser()
ap.add_argument('--mode', choices=['palette', 'tone'], default='palette',
                help='palette=referans paletini kullan, tone=ton aktar renk ailesini koru')
MODE = ap.parse_args().mode
T = __import__('palette_transfer' if MODE == 'palette' else 'tone_transfer')

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ACTIONS = ['Idle', 'Walk', 'Attack', 'Hurt', 'Death']
n = 0
for kind, cnt in [('characters', 3), ('enemies', 5)]:
    for a in range(1, cnt + 1):
        actor = f'{kind}/{a}'
        out = os.path.join(ROOT, f'_arsiv/uretim/generated/{MODE}', actor)
        os.makedirs(out, exist_ok=True)
        for d in ['D', 'U', 'S']:
            for act in ACTIONS:
                name = f'{d}_{act}.png'
                src = os.path.join(ROOT, 'public/assets', actor, name)
                im = Image.open(src).convert('RGBA')
                conv = T.convert(im.copy())
                assert conv.size == im.size, name
                conv.save(os.path.join(out, name), 'PNG')
                n += 1
        # onay onizlemesi: ust=orijinal alt=yeni
        for name in ['D_Idle.png', 'D_Walk.png', 'S_Attack.png']:
            b = Image.open(os.path.join(ROOT, 'public/assets', actor, name)).convert('RGBA')
            c = Image.open(os.path.join(out, name)).convert('RGBA')
            cv = Image.new('RGBA', (b.width * 8, b.height * 16), (18, 14, 26, 255))
            cv.paste(P.magnify(b), (0, 0)); cv.paste(P.magnify(c), (0, b.height * 8))
            os.makedirs(os.path.join(ROOT, f'_arsiv/uretim/generated/{MODE}/_onizleme'), exist_ok=True)
            cv.save(os.path.join(ROOT, f'_arsiv/uretim/generated/{MODE}/_onizleme',
                                 f'{kind}{a}_{name}'))
print(f'{n} sheet donusturuldu -> generated/{MODE}/')
print('public/assets DOKUNULMADI.')
