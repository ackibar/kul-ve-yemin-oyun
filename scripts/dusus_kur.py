"""Dusus ham karelerini D/U/S sheet olarak kurar (oyuncu: characters/1,
Tuhn: characters/6).

v3_kur.py'nin ayak-cizgisi/kafa-tepesi capalari DIK duran figur icin olculdu;
takla atan bir govdede "en alt genis satir" bir kare ayak, bir kare kafa olur
ve figur kareden kareye ziplar. Dususte dayanak bbox MERKEZI: donme zaten
govde merkezi etrafinda, merkezi sabit tutmak dogru olan. Oyuncu hucresi
80x80 (merkez 40,44), NPC hucresi 64x64 (ayak 62, merkez 32,36).

Yalnizca *_Dusus.png yazilir - slotun diger sheet'lerine dokunulmaz (v3_kur
butun aksiyonlari yeniden isler, burada istenmiyor). Ham kopya
asset_backup_ton_oncesi/ altina alinir, ton uyumu aktor_uyum.isle ile
yalnizca bu dosyaya uygulanir.

kullanim: python3 scripts/dusus_kur.py                  (oyuncu, mevcut yonler)
          python3 scripts/dusus_kur.py south            (oyuncu, tek yon)
          python3 scripts/dusus_kur.py --kim tuhn east  (Tuhn)
"""
import glob, os, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import aktor_uyum
from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
# kim -> (ham klasor, slot, hucre eni, hucre boyu, merkez x, merkez y)
KIM = {'oyuncu': ('dusus', 'characters/1', 80, 80, 40, 44),
       'tuhn':   ('dusus_tuhn', 'characters/6', 64, 64, 32, 36)}
YON = {'south': 'D', 'north': 'U', 'east': 'S'}


def otur(kare, en, boy, mx, my):
    out = Image.new('RGBA', (en, boy), (0, 0, 0, 0))
    bb = kare.getbbox()
    if not bb:
        return out
    cx, cy = (bb[0] + bb[2]) / 2, (bb[1] + bb[3]) / 2
    out.paste(kare, (round(mx - cx), round(my - cy)), kare)
    return out


def kur(kim, yonler):
    kl, slot, en, boy, mx, my = KIM[kim]
    ham = f'{ROOT}/_arsiv/uretim/pixellab/v3/{kl}'
    ham_kl = f'{ROOT}/_arsiv/uretim/asset_backup_ton_oncesi/{slot}'
    os.makedirs(ham_kl, exist_ok=True)
    for yon in yonler:
        g = YON[yon]
        dosyalar = sorted(glob.glob(f'{ham}/Dusus_{yon}_*.png'))
        if not dosyalar:
            print(f'  {kim}/{yon}: ham kare yok, atlandi'); continue
        kareler = [Image.open(f).convert('RGBA') for f in dosyalar]
        sh = Image.new('RGBA', (en * len(kareler), boy), (0, 0, 0, 0))
        for i, k in enumerate(kareler):
            sh.paste(otur(k, en, boy, mx, my), (i * en, 0))
        hamd = f'{ham_kl}/{g}_Dusus.png'
        sh.save(hamd)
        aktor_uyum.isle(hamd, f'{ROOT}/public/assets/{slot}/{g}_Dusus.png')
        print(f'  {slot}/{g}_Dusus.png: {len(kareler)} kare')


if __name__ == '__main__':
    a = sys.argv[1:]
    kim = 'oyuncu'
    if a[:1] == ['--kim']:
        kim, a = a[1], a[2:]
    kur(kim, a or list(YON))
