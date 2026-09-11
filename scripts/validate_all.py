"""Tum aktor setinde ardisleme hattini dogrular."""
import sys, os
sys.path.insert(0, os.path.dirname(__file__))
from PIL import Image
import pixelize as P

BG = (0, 0, 255)
ACTIONS = ['Idle', 'Walk', 'Attack', 'Hurt', 'Death']
rows = []
for kind, count in [('characters', 3), ('enemies', 5)]:
    for n in range(1, count + 1):
        tot = ok = 0
        for d in ['D', 'U', 'S']:
            for a in ACTIONS:
                path = f'public/assets/{kind}/{n}/{d}_{a}.png'
                for ref in P.split_sheet(path):
                    big = ref.resize((1024, 1024), Image.NEAREST)
                    canvas = Image.new('RGBA', (1024, 1024), BG + (255,))
                    canvas.paste(big, (0, 0), big)
                    out = P.process(canvas, ref)
                    rp, op = ref.convert('RGBA').load(), out.load()
                    bad = 0
                    for y in range(32):
                        for x in range(32):
                            ra, oa = rp[x, y][3] > 0, op[x, y][3] > 0
                            if ra != oa or (ra and rp[x, y][:3] != op[x, y][:3]):
                                bad += 1
                    tot += 1
                    ok += (bad == 0)
        rows.append((f'{kind}/{n}', ok, tot))

print(f'{"aktor":<14}{"birebir":>12}')
T = K = 0
for name, ok, tot in rows:
    flag = '' if ok == tot else '   <-- sapma'
    print(f'{name:<14}{ok:>6}/{tot:<5}{flag}')
    T += tot; K += ok
print(f'{"TOPLAM":<14}{K:>6}/{T}')
