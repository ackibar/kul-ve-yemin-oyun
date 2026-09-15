"""Dusus ham karelerini oyuncunun '1' slotuna D/U/S sheet olarak kurar.

v3_kur.py'nin ayak-cizgisi/kafa-tepesi capalari DIK duran figur icin olculdu;
takla atan bir govdede "en alt genis satir" bir kare ayak, bir kare kafa olur
ve figur kareden kareye ziplar. Dususte dayanak bbox MERKEZI: donme zaten
govde merkezi etrafinda, merkezi sabit tutmak dogru olan. Hucre 80x80
(OYUNCU_EN/BOY=40, R=2), merkez (40, MERKEZ_Y).

Yalnizca *_Dusus.png yazilir - slotun diger sheet'lerine dokunulmaz (v3_kur
butun aksiyonlari yeniden isler, burada istenmiyor). Ham kopya
asset_backup_ton_oncesi/ altina alinir, ton uyumu aktor_uyum.isle ile
yalnizca bu dosyaya uygulanir.

kullanim: python3 scripts/dusus_kur.py            (mevcut tum yonler)
          python3 scripts/dusus_kur.py south      (tek yon)
"""
import glob, os, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import aktor_uyum
from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
HAM = f'{ROOT}/_arsiv/uretim/pixellab/v3/dusus'
SLOT = 'characters/1'
YON = {'south': 'D', 'north': 'U', 'east': 'S'}
EN, BOY = 80, 80
# Dik karakterin govde merkezi hucrede ~44. satirda (ayak 78, kafa ~16):
# dususun ilk karesi (dik durus) bununla ayni hizada baslasin diye.
MERKEZ_X, MERKEZ_Y = 40, 44


def otur(kare):
    out = Image.new('RGBA', (EN, BOY), (0, 0, 0, 0))
    bb = kare.getbbox()
    if not bb:
        return out
    cx, cy = (bb[0] + bb[2]) / 2, (bb[1] + bb[3]) / 2
    out.paste(kare, (round(MERKEZ_X - cx), round(MERKEZ_Y - cy)), kare)
    return out


def kur(yonler):
    ham_kl = f'{ROOT}/_arsiv/uretim/asset_backup_ton_oncesi/{SLOT}'
    os.makedirs(ham_kl, exist_ok=True)
    for yon in yonler:
        g = YON[yon]
        dosyalar = sorted(glob.glob(f'{HAM}/Dusus_{yon}_*.png'))
        if not dosyalar:
            print(f'  {yon}: ham kare yok, atlandi'); continue
        kareler = [Image.open(f).convert('RGBA') for f in dosyalar]
        sh = Image.new('RGBA', (EN * len(kareler), BOY), (0, 0, 0, 0))
        for i, k in enumerate(kareler):
            sh.paste(otur(k), (i * EN, 0))
        ham = f'{ham_kl}/{g}_Dusus.png'
        sh.save(ham)
        aktor_uyum.isle(ham, f'{ROOT}/public/assets/{SLOT}/{g}_Dusus.png')
        print(f'  {SLOT}/{g}_Dusus.png: {len(kareler)} kare')


if __name__ == '__main__':
    kur(sys.argv[1:] or list(YON))
