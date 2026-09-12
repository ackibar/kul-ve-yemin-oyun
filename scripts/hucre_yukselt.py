"""Oyuncu sheet'lerinin hucre YUKSEKLIGINI 64 -> 80 yapar (icerik +16 satir asagi).

Sebep: figur bazi yuruyus karelerinde 65-70 satir, 64'luk hucrede kafa tepeden
kesiliyordu. Ayak 62 -> 78, motor capasi 31 -> 39 (Engine.OYUNCU_BOY/capa).
Ham sheet uzerinde calisir (asset_backup_ton_oncesi), sonra ton uyumu yeniden
uretilir. Eski 64'luk D_Idle `portre.png` olarak saklanir: HUD/portre kirpimi
64 satirlik hucreye gore ayarli, oyuncu portresi oradan okunur.

Kirpilmis kareler bu kaydirmayla GERI GELMEZ; Walk/Attack'i v3_kur ham
karelerden yeniden kurar (raw kareler tam). Sira: yukselt -> v3_kur <set>.
kullanim: python3 scripts/hucre_yukselt.py characters/1sword [...]
"""
import os, shutil, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import aktor_uyum
from PIL import Image
from v3_kur import BOY, OYUNCU_BOY

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
HAM = os.path.join(ROOT, '_arsiv/uretim/asset_backup_ton_oncesi')
KAYDIR = OYUNCU_BOY - BOY


def yukselt(slot):
    ham = f'{HAM}/{slot}'
    if not os.path.isdir(ham):
        shutil.copytree(f'{ROOT}/public/assets/{slot}', ham)
    n = 0
    for f in sorted(os.listdir(ham)):
        if not f.endswith('.png') or f == 'portre.png':
            continue
        yol = f'{ham}/{f}'
        im = Image.open(yol).convert('RGBA')
        if im.height != BOY:
            continue
        if f == 'D_Idle.png' and not os.path.exists(f'{ham}/portre.png'):
            im.save(f'{ham}/portre.png')
        out = Image.new('RGBA', (im.width, OYUNCU_BOY), (0, 0, 0, 0))
        out.paste(im, (0, KAYDIR))
        out.save(yol); n += 1
    aktor_uyum.klasor(f'{ROOT}/public/assets/{slot}')
    print(f'  {slot}: {n} sheet 64 -> {OYUNCU_BOY} satir')


if __name__ == '__main__':
    for s in sys.argv[1:]:
        yukselt(s)
