"""Mevcut sheet'lerin hucre GENISLIGINI degistirir (icerigi bozmadan).

Oyuncunun kilic savurusu 64px hucreye sigmiyor (6px sola, 3px saga tasiyor).
Hucre 80'e cikarilir; kareler yeni ortaya, kafa merkezine gore yeniden oturur -
boylece Idle'dan Walk'a gecerken karakter yatayda ziplamaz.

Ham sheet uzerinde calisir (asset_backup_ton_oncesi) ve sonra ton uyumunu
yeniden uretir; dogrudan public/assets'e yazsak bir sonraki aktor_uyum
calismasi eski 64'luk hali geri getirirdi.

kullanim: python3 scripts/hucre_genislet.py <slot> <yeni_en>
          ornek:  python3 scripts/hucre_genislet.py characters/1sword 80
"""
import os, shutil, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import aktor_uyum
from PIL import Image
from v3_kur import capalar, BOY, FEET, OYUNCU_BOY

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
HAM = os.path.join(ROOT, '_arsiv/uretim/asset_backup_ton_oncesi')


def genislet(slot, yeni_en):
    ham = f'{HAM}/{slot}'
    if not os.path.isdir(ham):
        shutil.copytree(f'{ROOT}/public/assets/{slot}', ham)
    for f in sorted(os.listdir(ham)):
        if not f.endswith('.png'):
            continue
        yol = f'{ham}/{f}'
        im = Image.open(yol).convert('RGBA')
        if im.height not in (BOY, OYUNCU_BOY):
            continue                      # sheet degil (kaynak gorsel)
        boy = im.height
        eski = next((c for c in (yeni_en, 64, 80) if im.width % c == 0), None)
        if eski is None or eski == yeni_en:
            continue
        n = im.width // eski
        out = Image.new('RGBA', (yeni_en * n, boy), (0, 0, 0, 0))
        for i in range(n):
            k = im.crop((i * eski, 0, i * eski + eski, boy))
            c = capalar(k)
            dx = round(yeni_en / 2 - c[0]) if c else (yeni_en - eski) // 2
            hucre = Image.new('RGBA', (yeni_en, boy), (0, 0, 0, 0))
            hucre.paste(k, (dx, 0))
            out.paste(hucre, (i * yeni_en, 0))
        out.save(yol)
        print(f'  {slot}/{f}: {eski} -> {yeni_en} ({n} kare)')
    aktor_uyum.klasor(f'{ROOT}/public/assets/{slot}')


if __name__ == '__main__':
    genislet(sys.argv[1], int(sys.argv[2]))
