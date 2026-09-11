"""Ardisleme hattini dogrular: mevcut kareyi 1K'ya buyutup geri indirir.

Saydam pikselde RGB anlamsizdir (indexed PNG palet rengi tasir),
o yuzden once alfa maskesi, sonra sadece opak piksellerin rengi karsilastirilir.
"""
import sys, os
sys.path.insert(0, os.path.dirname(__file__))
from PIL import Image
import pixelize as P

BG = (255, 0, 255)
total = perfect = 0
report = []

for sheet in ['D_Idle', 'D_Walk', 'D_Attack', 'D_Hurt', 'D_Death',
              'S_Idle', 'S_Walk', 'S_Attack', 'U_Walk', 'U_Death']:
    frames = P.split_sheet(f'public/assets/characters/1/{sheet}.png')
    for i, ref in enumerate(frames):
        big = ref.resize((1024, 1024), Image.NEAREST)
        canvas = Image.new('RGBA', (1024, 1024), BG + (255,))
        canvas.paste(big, (0, 0), big)
        out = P.process(canvas, ref)

        total += 1
        rp, op = ref.convert('RGBA').load(), out.load()
        a_diff = c_diff = 0
        for y in range(32):
            for x in range(32):
                ra, oa = rp[x, y][3], op[x, y][3]
                if (ra > 0) != (oa > 0):
                    a_diff += 1
                elif ra > 0 and rp[x, y][:3] != op[x, y][:3]:
                    c_diff += 1
        if a_diff == 0 and c_diff == 0:
            perfect += 1
        else:
            report.append((sheet, i, a_diff, c_diff))

print(f'Test edilen kare: {total}')
print(f'BIREBIR yeniden uretilen: {perfect}/{total}')
if report:
    print('\nSapan kareler (silüet hatasi / renk hatasi):')
    for s, i, a, c in report[:20]:
        print(f'   {s} kare{i}: silüet {a}px, renk {c}px')
