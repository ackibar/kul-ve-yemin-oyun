"""Yeni sandik gorsellerini iki kareli sheet haline getirir.

Motor sandigi tek bir sheet'ten ciziyor: kare 0 kapali, kare 1 acik.
Hucre 48x48 (24x24 dunya birimi). Kareler ALT KENARA gore hizalanir - acik
sandigin kapagi yukari tastigi icin merkeze gore hizalamak sandigi yere
gomuyordu.

Ton uyumu uygulanir: gorseller sahnenin icinde duruyor, envanter ikonlari gibi
parlak kalmamalari gerekiyor.
"""
import os, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import aktor_uyum
from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
HAM = f'{ROOT}/_arsiv/uretim/generated/nesne'
HEDEF = f'{ROOT}/public/assets/nesne'
CELL = 48


def oturt(im):
    bb = im.getbbox()
    sp = im.crop(bb)
    if sp.width > CELL or sp.height > CELL:
        k = min(CELL / sp.width, CELL / sp.height)
        sp = sp.resize((max(1, round(sp.width * k)), max(1, round(sp.height * k))), Image.NEAREST)
    out = Image.new('RGBA', (CELL, CELL), (0, 0, 0, 0))
    out.paste(sp, (CELL // 2 - sp.width // 2, CELL - sp.height))
    return out


def dereceler(im):
    px = im.load()
    for y in range(im.height):
        for x in range(im.width):
            r, g, b, a = px[x, y]
            if a:
                px[x, y] = aktor_uyum.grade((r, g, b)) + (a,)
    return im


if __name__ == '__main__':
    os.makedirs(HEDEF, exist_ok=True)
    kare = [dereceler(oturt(Image.open(f'{HAM}/sandik_{a}.png').convert('RGBA')))
            for a in ('kapali', 'acik')]
    sh = Image.new('RGBA', (CELL * len(kare), CELL), (0, 0, 0, 0))
    for i, k in enumerate(kare):
        sh.paste(k, (i * CELL, 0))
    sh.save(f'{HEDEF}/sandik.png')
    print(f'  nesne/sandik.png hazir ({len(kare)} kare, {CELL}x{CELL})')
