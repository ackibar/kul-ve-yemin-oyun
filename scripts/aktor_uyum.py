"""Aktor sprite'larini sahnenin ton dunyasina yaklastirir - kimliklerini bozmadan.

Olculen sorun "renk yanlis" degil, "parlak": arkaplanlarin ust isik ucu
(L90) magara 28, sarnic 24, siginak 43.5'te kaliyor; kadronun sheet'leri ise
43-60 arasinda cikiyor. Yeni dusmanlarda buna bir de doygunluk ekleniyor
(C 17-25, sahnede hicbir sey 12'yi gecmiyor). Yani karakterler sahnenin
isigindan daha kuvvetli aydinlanmis gibi duruyor.

Yontem: palet takasi DEGIL, uc yumusak sikistirma.
  1. Isik omuzu  - KNEE ustundeki parlaklik sikisir, golgeler oldugu gibi kalir.
  2. Doygunluk omuzu - CKNEE ustundeki doygunluk sikisir; normal bir kostumun
     C'si zaten 3-6 oldugu icin hic dokunulmaz, yalnizca cigligi kesilir.
  3. Kul tonu nudge - notr renkler sahnenin sicak kul acisina cok az cevrilir;
     doygunluk arttikca etki azalir, boylece kirmizi/mavi okunabilirlik sinyali
     kaybolmaz (bkz. tone_transfer.py'daki ayni ders).

Silueti degistirmez: yalnizca alfasi olan piksellerin rengi yeniden esler.

Kullanim:
    python3 scripts/aktor_uyum.py                       tum kadroyu yeniden isler
    python3 scripts/aktor_uyum.py public/assets/characters/10   tek klasor

Her iki durumda da HAM sheet asset_backup_ton_oncesi/ altina alinir ve derece
daima oradan uretilir, yani ayni klasoru tekrar calistirmak tonu ust uste
bindirmez. Yeni bir karakter kurulduktan sonra klasor modu cagrilmalidir -
npc_sheet_kur.py / dusman_kur.py / kur_varyant.py bunu kendiliginden yapiyor.
"""
import math, os, shutil, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from PIL import Image
import pixelize as P
from tone_transfer import lab_to_srgb

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
KAYNAK = os.path.join(ROOT, 'asset_backup_ton_oncesi')   # daima pristine kaynak
HEDEF = os.path.join(ROOT, 'public/assets')
KLASORLER = ['characters', 'enemies']

KNEE, RATIO, GLOBAL = 30.0, 0.62, 0.94     # isik omuzu
CKNEE, CRATIO, CGLOBAL = 8.0, 0.50, 0.92   # doygunluk omuzu
KUL = math.radians(30.0)                   # sahnelerin sicak kul acisi
NUDGE_MAX, NUDGE_MIN, NUDGE_C = 0.18, 0.04, 20.0


def grade(c):
    L, a, b = P._srgb_to_lab(c)
    C, h = math.hypot(a, b), math.atan2(b, a)

    nL = (L if L <= KNEE else KNEE + (L - KNEE) * RATIO) * GLOBAL
    nC = (C if C <= CKNEE else CKNEE + (C - CKNEE) * CRATIO) * CGLOBAL

    # doygun renkler kimliklerini korur, notrler kule kayar
    t = min(1.0, C / NUDGE_C)
    w = NUDGE_MAX + (NUDGE_MIN - NUDGE_MAX) * t
    dh = math.atan2(math.sin(KUL - h), math.cos(KUL - h))
    nh = h + dh * w
    return lab_to_srgb(nL, nC * math.cos(nh), nC * math.sin(nh))


_C = {}


def isle(src, dst):
    im = Image.open(src).convert('RGBA')
    px = im.load()
    for y in range(im.height):
        for x in range(im.width):
            r, g, b, a = px[x, y]
            if not a:
                continue
            k = (r, g, b)
            if k not in _C:
                _C[k] = grade(k)
            px[x, y] = _C[k] + (a,)
    im.save(dst)


def _derece(ham_kok):
    """ham_kok altindaki her png'yi public/assets'teki esine dereceler."""
    n = 0
    for kok, _, dosyalar in os.walk(ham_kok):
        for f in sorted(dosyalar):
            if not f.endswith('.png'):
                continue
            src = os.path.join(kok, f)
            dst = os.path.join(HEDEF, os.path.relpath(src, KAYNAK))
            os.makedirs(os.path.dirname(dst), exist_ok=True)
            isle(src, dst)
            n += 1
    return n


def klasor(yol):
    """Tek bir aktor klasorunu dereceler. Yeni kurulan karakter icin bu cagrilir.

    Klasor pristine yedekte yoksa ONCE oraya alinir: public/assets'teki kopya o
    anda hala ham oldugu icin dogru kaynak odur. Zaten varsa yedege dokunulmaz,
    derece yine ham halden uretilir - tekrar cagirmak guvenlidir.
    """
    yol = os.path.abspath(yol)
    ilgi = os.path.relpath(yol, HEDEF)
    ham = os.path.join(KAYNAK, ilgi)
    yeni = not os.path.isdir(ham)
    if yeni:
        os.makedirs(os.path.dirname(ham), exist_ok=True)
        shutil.copytree(yol, ham)
    n = _derece(ham)
    print(f'  ton uyumu: {ilgi} ({n} sheet{", ham yedege alindi" if yeni else ""})')


def main():
    if not os.path.isdir(KAYNAK):
        os.makedirs(KAYNAK)
        for k in KLASORLER:
            shutil.copytree(os.path.join(HEDEF, k), os.path.join(KAYNAK, k))
        print(f'pristine yedek alindi -> {os.path.relpath(KAYNAK, ROOT)}')
    n = sum(_derece(os.path.join(KAYNAK, k)) for k in KLASORLER)
    print(f'{n} sheet islendi, {len(_C)} benzersiz renk')


if __name__ == '__main__':
    if len(sys.argv) > 1:
        for y in sys.argv[1:]:
            klasor(y)
    else:
        main()
