"""Yeni sandik gorsellerini iki kareli sheet haline getirir.

Motor sandigi tek bir sheet'ten ciziyor: kare 0 kapali, kare 1 acik.
Hucre 48x48 (24x24 dunya birimi). Kareler ALT KENARA gore hizalanir - acik
sandigin kapagi yukari tastigi icin merkeze gore hizalamak sandigi yere
gomuyordu.

Ton uyumu uygulanir: gorseller sahnenin icinde duruyor, envanter ikonlari gibi
parlak kalmamalari gerekiyor.
"""
import glob, os, sys
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


# Ton uyumu sandigi KOMSULARINDAN cok koyu birakiyordu: olculdu, sandik
# parlaklik 0.271 / doygunluk 0.297 iken ayni sahnedeki fici 0.473/0.540,
# kasa 0.504/0.587. Sahnenin isik tinti de ustune binince kahverengi hic
# okunmuyordu ("daha kahverengi olsun").
# Ayrica uretilen gorselin %65'i MOR-MAVI cikmisti (model demir bantlari soguk
# mora boyamis); parlaklik kaldirilinca mor ortaya cikiyordu.
# ORAN hesabi (hedef/ortalama) kullanildi ve PATLADI: mor kirilinca ortalama
# doygunluk dustu, carpan buyudu, sandik turuncu bir alet kutusuna dondu.
# Artik SABIT ve SINIRLI katsayilar var.
PARLAK_KAT, PARLAK_TAVAN = 1.42, .62      # koyuluk acilir ama beyazlamaz
AHSAP_DOYGUN_TAVAN = .46                  # kahverengi okunur, cig olmaz
METAL_DOYGUN_KAT = .12                    # mor demir -> notr gri


def komsuya_uydur(im):
    import colorsys
    px = im.load()
    for y in range(im.height):
        for x in range(im.width):
            r, g, b, a = px[x, y]
            if not a:
                continue
            h, sa, v = colorsys.rgb_to_hsv(r/255, g/255, b/255)
            if .02 <= h <= .13:                    # ahsap kusagi
                sa = min(AHSAP_DOYGUN_TAVAN, sa * 1.35)
            elif .55 <= h <= .95:                  # mor-mavi metal
                sa *= METAL_DOYGUN_KAT
            v = min(PARLAK_TAVAN, v * PARLAK_KAT)
            px[x, y] = tuple(round(c*255) for c in colorsys.hsv_to_rgb(h, sa, v)) + (a,)
    return im


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
    # Acik hal AYRI URETIM DEGIL: kapali sandigin kendisinden animasyonla
    # turetildi (scripts/kral_anim.py'deki yontem; /animate-with-text-v3 ile
    # "kapak arkaya devriliyor"). Iki ayri uretimde sandigin govdesi, acisi ve
    # ahsap deseni tutmuyordu - kullanici "acikken baska kapaliyken baska" dedi.
    # Ilk kare kapali, son kare tam acik; ikisi de ayni cizimden.
    ac = sorted(glob.glob(f'{HAM}/sandik_ac_*.png'))
    kaynak = [ac[0], ac[-1]] if len(ac) >= 2 else [f'{HAM}/sandik_kapali.png', f'{HAM}/sandik_acik.png']
    kare = [komsuya_uydur(dereceler(oturt(Image.open(k).convert('RGBA')))) for k in kaynak]
    sh = Image.new('RGBA', (CELL * len(kare), CELL), (0, 0, 0, 0))
    for i, k in enumerate(kare):
        sh.paste(k, (i * CELL, 0))
    sh.save(f'{HEDEF}/sandik.png')
    print(f'  nesne/sandik.png hazir ({len(kare)} kare, {CELL}x{CELL})')
