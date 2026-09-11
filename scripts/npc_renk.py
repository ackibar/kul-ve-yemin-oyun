"""NPC'lere kendi rengini verir (deterministik, API'siz).

Uretken yol iki kez denendi ve ikisinde de hepsi gri cikti; ikili algisal
mesafe 1.6-4.8'de kaldi. Burada renk tahmin edilmiyor: sprite'in konturu ve
ten tonlari korunup GIYSI pikselleri hedef ton acisina cevriliyor. Parlaklik
oldugu gibi kalir, doygunluk sinirli tutulur - oyunun kul paletini bozmaz.
"""
import math, os, sys
sys.path.insert(0, os.path.dirname(__file__))
from PIL import Image
import pixelize as P
from tone_transfer import lab_to_srgb

# NPC: (slot, hedef ton acisi derece, doygunluk)
RENKLER = {
    'mira':  (3, 140, 15),   # solgun adacayi yesili
    'boran': (2,  28, 17),   # pasli kirmizi-kiremit
    'ekin':  (4, 255, 14),   # koyu lacivert
}
KONTUR_L = 16       # bunun altindaki her sey kontur/golge: dokunma
TEN_C = 11          # zaten renkli (ten, sakal) pikselleri koru


def renklendir(slot, hue_deg, chroma):
    kl = f'public/assets/characters/{slot}'
    hue = math.radians(hue_deg)
    n = 0
    for f in sorted(os.listdir(kl)):
        if not f.endswith('.png'):
            continue
        p = os.path.join(kl, f)
        im = Image.open(p).convert('RGBA')
        px = im.load()
        for y in range(im.height):
            for x in range(im.width):
                r, g, b, a = px[x, y]
                if not a:
                    continue
                L, aa, bb = P._srgb_to_lab((r, g, b))
                C = math.hypot(aa, bb)
                if L < KONTUR_L or C > TEN_C:
                    continue                     # kontur ve ten/sakal korunur
                # notr giysi pikseli: hedef tona cevir, parlakligi koru
                k = chroma * min(1.0, (L - KONTUR_L) / 45)
                px[x, y] = lab_to_srgb(L, k * math.cos(hue), k * math.sin(hue)) + (a,)
        im.save(p)
        n += 1
    return n


if __name__ == '__main__':
    for ad, (slot, h, c) in RENKLER.items():
        n = renklendir(slot, h, c)
        print(f'  {ad:6s} characters/{slot}  {n} sheet  ton={h}deg doygunluk={c}')
