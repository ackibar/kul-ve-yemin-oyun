"""Kullerin Krali: kosede OTURAN, hic konusmayan adam.

Mannequin sablonu ayakta durur; oturan figur icin duz pixflux (1 uretim).
Karakter API'si olmadigi icin sheet'i bu dosya kurar: figur hucrenin
TEPESINE oturtulur (kafa ustte) ki portre kirpimi (D_Idle'in ust 24 satiri)
bos cikmasin; motor entity'deki `capa` ile zemin satirini ona gore alir.

kullanim: python3 scripts/kral_uret.py          (uretir + kurar)
          python3 scripts/kral_uret.py --kur    (eldeki ham gorseli kurar)
"""
import glob, os, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import aktor_uyum, pxl
from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
HAM = f'{ROOT}/_arsiv/uretim/generated/kral'
SLOT = 13
# 1. surum yerde oturuyordu; kullanici kirik bir sandalye istedi. Sandalye
# figurun parcasi olarak URETILIYOR (ayri sprite degil): oturma pozu ve
# sandalye birbirine oturmali, ayri cizilince adam havada duruyor.
TARIF = ('an old broken king slumped on a broken wooden throne, one armrest snapped off '
         'and the chair back cracked, sitting upright with both hands resting on his knees, '
         'a tarnished dented iron crown on his head, long grey unkempt beard full of ash, '
         'a once-royal robe now grey with ash with only a faint faded purple left, hollow '
         'empty eyes staring ahead, dark fantasy pixel art game character, muted ash-grey '
         'palette, soot-stained, single dark outline, basic shading, no background, human')
CELL, USTPAY = 128, 3
# Zemin satiri: figur tepeden USTPAY ile baslar, alt sinir figurun boyuna bagli.
# world.ts'teki capa = zemin_satiri / 2 (sprite() satir = 2*capa).


def uret():
    os.makedirs(HAM, exist_ok=True)
    r = pxl.call('/create-image-pixflux', {
        'description': TARIF, 'image_size': {'width': 64, 'height': 64},
        'no_background': True, 'view': 'low top-down', 'seed': 91,
        'outline': 'single color black outline', 'shading': 'basic shading',
        'detail': 'medium detail'})
    got = pxl.walk_images(r, HAM, 'kral')
    if not got:
        print('  !! kral gorsel donmedi'); sys.exit(1)
    print('  ham:', got[0])


# Kral cok hizli oynuyordu; iki cozum birden: motor dusuk kare hizinda cizer
# (Engine.KRAL_FPS) ve taci ELINDEYKEN kareler cogaltilir - oyuncu onun taca
# baktigi ani gorsun diye. Taci elde olan kareler ALTIN pikselin y'sinden
# bulunur (baste ~12, kucaginda ~30).
# Bekleme artik SHEET'te degil motorda (Engine.KRAL_SALLA): kral oturdugu icin
# tekrar goze batiyor, dinlenme suresi kodda ayarlanabilir olmali.
DURAK_IDLE = 0
DURAK_TAC = 5       # taca bakarken her kare kac kat uzasin


# Bekletme: model her seferinde "kaldir -> tut -> geri tak" sirasini uretiyor,
# yani tutma evresi dizinin ORTASINDA. Taci renkten bulmayi iki kez denedim ve
# ikisi de tutmadi: 64'te sandalyenin sari ahsabi olcumu bastirdi, 128'de
# tacin tonu esigin disinda kaldi. Oran sabit ve guvenilir.
DURAK_ARALIK = (0.25, 0.68)


def bekletme(ks):
    n = len(ks)
    bas, son = int(n * DURAK_ARALIK[0]), int(n * DURAK_ARALIK[1])
    out = []
    for i, k in enumerate(ks):
        out.extend([k] * (DURAK_TAC if bas <= i < son else 1))
    return out


def kur():
    """Animasyon karelerinden characters/13 sheet'lerini kurar.

    Kareler ZATEN hizali (olculdu: her karede taban satiri 60, sandalye
    kaymiyor), bu yuzden bbox'a gore yeniden oturtulmaz - oturtulsaydi el
    kalkinca govde asagi kayardi. Cerceve 64x64 oldugu gibi hucreye konur.
    Idle = bas sallama, Tac = taci cikarip geri takma (motor arada bir oynatir).
    """
    kareler = {}
    for ad, hedef_ad in (('idle', 'Idle'), ('el', 'El'), ('tac', 'Tac')):
        fs = sorted(glob.glob(f'{HAM}/anim_{ad}_*.png'))
        if not fs:
            print(f'  !! {ad} kareleri yok'); sys.exit(1)
        ks = [Image.open(f).convert('RGBA') for f in fs]
        if hedef_ad == 'Tac':
            ks = bekletme(ks)
        kareler[hedef_ad] = ks
    hedef = f'{ROOT}/public/assets/characters/{SLOT}'
    os.makedirs(hedef, exist_ok=True)
    zemin = 0
    for isim, ks in kareler.items():
        sh = Image.new('RGBA', (CELL * len(ks), CELL), (0, 0, 0, 0))
        for i, k in enumerate(ks):
            sh.paste(k, (i * CELL, 0))
            bb = k.getbbox()
            if bb:
                zemin = max(zemin, bb[3])
        for g in 'DUS':                    # kral donmuyor; uc yon de ayni
            sh.save(f'{hedef}/{g}_{isim}.png')
    # Motor NPC'de Walk da arayabilir; duragan kare ile doldurulur.
    for g in 'DUS':
        tek = Image.new('RGBA', (CELL, CELL), (0, 0, 0, 0))
        tek.paste(kareler['Idle'][0], (0, 0))
        tek.save(f'{hedef}/{g}_Walk.png')
    aktor_uyum.klasor(hedef, ham_yenile=True)
    print('  characters/%d: %s; zemin satiri %d -> world.ts KRAL_CAPA=%g'
          % (SLOT, ', '.join(f'{k} {len(v)} kare' for k, v in kareler.items()), zemin, zemin / 2))


if __name__ == '__main__':
    if '--kur' not in sys.argv:
        uret()
    kur()
