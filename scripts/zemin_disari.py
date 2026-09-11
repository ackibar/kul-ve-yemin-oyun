"""Photoshop'ta calismak icin mevcut sigginak zeminini ve carpisma referansini disari verir.

Kutular world.ts'ten OKUNUR, elle kopyalanmaz - boylece referans bayatlamaz.
"""
import os, re, sys
from PIL import Image, ImageDraw

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
KARO = 32                      # 1 karo = 16 dunya birimi x 2 px/birim


def haven_bloklari():
    src = open(f'{ROOT}/lib/game/world.ts', encoding='utf-8').read()
    gov = src.split("if(zone==='haven'){")[1].split("}else if(zone==='cistern')")[0]
    odalar = [tuple(map(int, m)) for m in re.findall(
        r'room\((\d+),(\d+),(\d+),(\d+)\)', gov)]
    sat = re.search(r'blockers\.push\((.*?)\);', gov, re.S)
    engeller = [tuple(map(int, m)) for m in re.findall(
        r'\[(\d+),(\d+),(\d+),(\d+)\]', sat.group(1))] if sat else []
    return odalar, engeller


def main(hedef):
    os.makedirs(hedef, exist_ok=True)
    zemin = Image.open(f'{ROOT}/public/assets/arkaplan/haven.png').convert('RGB')
    zemin.save(f'{hedef}/haven_zemin.png')

    odalar, engeller = haven_bloklari()
    ref = zemin.convert('RGBA')
    kat = Image.new('RGBA', ref.size, (0, 0, 0, 0))
    d = ImageDraw.Draw(kat)
    # yuruunebilir oda sinirlari
    for x, y, w, h in odalar:
        d.rectangle([x*KARO, y*KARO, (x+w)*KARO-1, (y+h)*KARO-1],
                    outline=(90, 200, 255, 220), width=2)
    # carpisma kutulari
    for x1, y1, x2, y2 in engeller:
        d.rectangle([x1*KARO, y1*KARO, x2*KARO-1, y2*KARO-1],
                    fill=(255, 60, 60, 70), outline=(255, 60, 60, 230), width=2)
    # karo izgarasi
    for x in range(0, ref.width, KARO):
        d.line([(x, 0), (x, ref.height)], fill=(255, 255, 255, 28))
    for y in range(0, ref.height, KARO):
        d.line([(0, y), (ref.width, y)], fill=(255, 255, 255, 28))
    Image.alpha_composite(ref, kat).convert('RGB').save(f'{hedef}/haven_carpisma_referans.png')

    print(f'{hedef}/haven_zemin.png              {zemin.size[0]}x{zemin.size[1]} px'
          f'  ({zemin.size[0]//KARO}x{zemin.size[1]//KARO} karo)')
    print(f'{hedef}/haven_carpisma_referans.png  ayni olcu, '
          f'{len(odalar)} oda + {len(engeller)} carpisma kutusu + karo izgarasi')


if __name__ == '__main__':
    main(sys.argv[1] if len(sys.argv) > 1 else f'{os.path.expanduser("~")}/Desktop/Kul-ve-Yemin-zemin')
