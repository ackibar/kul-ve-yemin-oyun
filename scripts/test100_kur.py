"""TEST mekani: 100x100 karo olcekte nasil hissettirdigini gormek icin
gecici bir alan. Gercek sanat degil - haven.png'den kirpilan zemin/duvar/
sandik parcalari tekrarlanarak dolduruldu. Kullanici "ana oyunu bozmadan
bir bakayim" dedi; bu yuzden ayri bir Zone ('test100'), tek bir gecici
kapiyla siginaga baglaniyor - karar verilince tamamen silinecek.

Cikti:
  public/assets/arkaplan/test100.png  (3200x3200, 100x100 karo)
  ekrana: world.ts'e yapistirilacak blockers listesi (engel kutulari)
"""
import os, random
import numpy as np
from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
KARO = 32
N = 100  # 100x100 karo
HEDEF = f'{ROOT}/public/assets/arkaplan/test100.png'

random.seed(7)


def main():
    haven = Image.open(f'{ROOT}/public/assets/arkaplan/haven.png').convert('RGB')
    floor = haven.crop((400, 420, 528, 548))       # 128x128, ~4x4 karo
    wall = haven.crop((0, 0, 960, 64))              # 960x64, tekrar edilecek
    crate = haven.crop((330, 235, 410, 325)).convert('RGBA')  # 80x90 sandik+fener

    W = H = N * KARO
    canvas = Image.new('RGB', (W, H))
    fw, fh = floor.size
    for y in range(0, H, fh):
        for x in range(0, W, fw):
            canvas.paste(floor, (x, y))

    # Duvar seridi ust/alt/sol/sag kenarlara (1 karo kalinliginda, 32px).
    ww, wh = wall.size
    top = wall.resize((W, KARO))
    for x in range(0, W, ww):
        pass
    canvas.paste(wall.resize((W, KARO)), (0, 0))
    canvas.paste(wall.resize((W, KARO)), (0, H - KARO))
    left = wall.resize((W, KARO)).rotate(90, expand=True).resize((KARO, H))
    canvas.paste(left, (0, 0))
    canvas.paste(left, (W - KARO, 0))

    # Rastgele sandik kumeleri: engel test etmek icin. Karo hizali, 3 karo
    # (96px) araliklarla cakismasin diye basit bir izgara + atlama.
    blockers = []
    cw, ch = crate.size
    cols = (N - 6) // 3
    rows = (N - 6) // 3
    for j in range(rows):
        for i in range(cols):
            if random.random() > .12:
                continue
            tx = 3 + i * 3
            ty = 3 + j * 3
            px, py = tx * KARO, ty * KARO
            canvas.paste(crate, (px, py + KARO - ch), crate)
            # ayak izi: alt ~yarisi, 2x2 karoya yuvarla
            blockers.append((tx, ty + 1, tx + 2, ty + 2))

    canvas.save(HEDEF)
    print(f'-> {HEDEF}  {canvas.size}  {len(blockers)} engel kutusu')
    print('\nblockers.push(' + ','.join(f'[{a},{b},{c},{d}]' for a, b, c, d in blockers) + ');')


if __name__ == '__main__':
    main()
