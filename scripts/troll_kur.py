"""Yesil fonlu tek-ozne gorseli oyunun sprite olcegine indirir.

Uc adim:
  1. Kroma anahtarlama. Anahtar rengi KENARDAN degil, en yesil piksellerin
     ortalamasindan olculuyor (kenar her zaman fon olmayabilir). JPEG konturlara
     yesil sacak biraktigi icin sert esik yerine yumusak alfa rampasi, tutulan
     piksellerde de yesil bastirma (despill) var.
  2. Blok boyu tespiti. Kaynak piksel sanati ama 2752 px'e buyutulmus; her
     "piksel" N gercek pikselden olusuyor. N, yatay renk degisim noktalarinin
     en buyuk ortak boluneninden bulunuyor - yanlis tahmin sprite'i bulaniklastirir.
  3. Hucreye oturtma: 64x64, ayaklar tabanda.

kullanim: python3 scripts/troll_kur.py <jpeg> <cikti_adi>
"""
import math, os, sys
from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = f'{ROOT}/_arsiv/uretim/generated/dusman'
# Trol sopasiyla birlikte 64'e sigmiyor (110 px genis): kirpilinca sopa
# gidiyordu. Hucre GENISLIGI ayri bir parametre; motor bu dusmani fw=56
# (56*R=112) ile ciziyor. Yukseklik degismedi, ayaklar yine tabanda.
EN, BOY, FEET = 112, 64, 62


def anahtar(im):
    """Fon rengi: yesil kanali baskin piksellerin ortalamasi."""
    px = im.load(); top = [0, 0, 0]; n = 0
    for y in range(0, im.height, 7):
        for x in range(0, im.width, 7):
            r, g, b = px[x, y][:3]
            if g > 110 and g > r * 1.6 and g > b * 1.6:
                top[0] += r; top[1] += g; top[2] += b; n += 1
    return tuple(c // max(1, n) for c in top)


def anahtarla(im, yumusak=70.0, sert=34.0):
    key = anahtar(im)
    im = im.convert('RGBA'); px = im.load()
    for y in range(im.height):
        for x in range(im.width):
            r, g, b, _ = px[x, y]
            d = math.dist((r, g, b), key)
            if d <= sert:
                px[x, y] = (0, 0, 0, 0); continue
            a = 255 if d >= yumusak else int(255 * (d - sert) / (yumusak - sert))
            # Despill: yesil hala iki komsusunun ustundeyse geri cekilir.
            if g > max(r, b):
                g = int((r + b) / 2 + (g - (r + b) / 2) * .35)
            px[x, y] = (r, g, b, a)
    return im


def kenar_temizle(im):
    """Kucultmeden sonra kalan yesil sacak: yesili hala iki komsusundan belirgin
    yuksek olan yari saydam pikseller silinir. JPEG konturlarindan geliyor."""
    px = im.load()
    for y in range(im.height):
        for x in range(im.width):
            r, g, b, a = px[x, y]
            if a and g > r * 1.25 and g > b * 1.25 and a < 235:
                px[x, y] = (0, 0, 0, 0)
    return im


def blok_boyu(im, en_fazla=16):
    """Yatayda renk degisim noktalarinin arasindaki en kucuk mesafe."""
    px = im.load(); best = en_fazla
    for y in range(im.height // 4, im.height * 3 // 4, max(1, im.height // 40)):
        onceki = None; son = 0
        for x in range(im.width):
            c = px[x, y]
            if c[3] < 120:
                onceki = None; son = x; continue
            k = (c[0] // 12, c[1] // 12, c[2] // 12)
            if onceki is not None and k != onceki:
                d = x - son
                if 1 < d < best:
                    best = d
                son = x
            onceki = k
    return max(1, best)


def kur(kaynak, ad):
    os.makedirs(OUT, exist_ok=True)
    im = anahtarla(Image.open(kaynak).convert('RGB'))
    bb = im.getbbox()
    im = im.crop(bb)
    n = blok_boyu(im)
    kucuk = im.resize((max(1, im.width // n), max(1, im.height // n)), Image.NEAREST)
    # Hucreye sigsin: once boy, gerekirse en.
    k = min(FEET / kucuk.height, EN / kucuk.width, 1.0)
    if k < 1:
        kucuk = kucuk.resize((max(1, round(kucuk.width * k)), max(1, round(kucuk.height * k))), Image.NEAREST)
    kucuk = kenar_temizle(kucuk)
    out = Image.new('RGBA', (EN, BOY), (0, 0, 0, 0))
    out.paste(kucuk, (EN // 2 - kucuk.width // 2, FEET - kucuk.height))
    out.save(f'{OUT}/{ad}.png')
    print(f'  {ad}: kaynak {bb[2]-bb[0]}x{bb[3]-bb[1]}, blok {n}px -> {kucuk.size}')


if __name__ == '__main__':
    kur(sys.argv[1], sys.argv[2])
