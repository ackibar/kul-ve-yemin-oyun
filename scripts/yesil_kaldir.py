"""Yesil fonlu prop sayfasindan fonu kaldirir ve arka planla birlestirir.

Neden duz "yesile yakin pikseli sil" yetmiyor:
  1. Dosya JPEG. JPEG renk bilgisini yariya indirerek sikistirdigi icin her
     konturun uzerine yesil sacak biniyor; sert esik ya sacagi birakiyor ya da
     nesnenin kenarini yiyor. Bu yuzden yumusak gecisli alfa rampasi var.
  2. Fonun yesili nesnelerin uzerine de vuruyor (spill). Alfa duzelse bile renk
     yesile caliyor; tutulan piksellerde yesil kanali bastiriliyor.
  3. Uretici sayfanin ortasina fondan sizmis iki buyuk zemin parcasi birakmis.
     Onlar yesil DEGIL, anahtarlamayla gitmiyor. Bulma yontemi renk esiği degil
     KARISIM MODELI: sizan bolge, arka plan gorselinin uzerine degisen yogunlukta
     yesil ortu binmis halidir, yani P = a*B + (1-a)*K. Her kanaldan a cozulup
     kanallarin ayni a'da uzlasip uzlasmadigina bakiliyor. Uzlasiyorsa piksel
     "arka plan + yesil" diye aciklanabiliyor demektir -> sizinti. Gercek bir
     yatak pikseli bu denklemi saglamaz. Duz renk esigi lekenin cevresindeki
     yesil halkayi kaciriyordu, bu model onu da yakaliyor. Propların konturunda
     cikan ince yanlis pozitifler morfolojik acmayla eleniyor.
"""
import os, sys
import numpy as np
from PIL import Image, ImageFilter

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
T_LO, T_HI = 12, 55        # g-max(r,b): altinda tam nesne, ustunde tam fon
A_SAPMA = .12              # kanallarin cozdugu ortu orani bu kadar uzlasirsa sizinti
KUCULT = 8                 # morfolojiyi bu oranda kucuk calistir (hiz + gurultu)


def yesillik(a):
    return a[..., 1] - np.maximum(a[..., 0], a[..., 2])


def spill_sil(a, yes, key):
    """Fondan bulasan yesili KARISIMI COZEREK cikarir: P = k*K + (1-k)*gercek.

    Iki incelik:
      * Renk tonuna bakiliyor. Fonun yesili maviye calan bir bahar yesili
        (b>r); mekandaki gercek yosun ise sariya calan zeytin yesili (r>b).
        Sadece "yesil baskin mi" diye bakan bir temizlik yosunu da griye
        cevirirdi. Olculdu: bulasik piksellerde b-r ortalama +15, yosunda -14.
      * Bulasiklik MUTLAK degil GORECE. Konturlar koyu oldugu icin oradaki 10
        birimlik yesil, parlak bir yuzeydeki 10 birimden cok daha belli
        oluyordu; esik bu yuzden dusuk tutuldu.
    """
    a = a.astype(float)
    r, b = a[..., 0], a[..., 2]
    ton = np.clip((b - r + 5) / 15, 0, 1)            # maviye calan yesil = fon
    k = np.clip(yes / (key[1] - max(key[0], key[2])), 0, .6) * ton
    k = k[..., None]
    return np.clip((a - k * key) / np.maximum(1 - k, 1e-3), 0, 255)


def genis_lekeler(mask, kucult=KUCULT, ac=3, yay=5):
    """Sadece GENIS lekeleri birakir; tekil benekleri atar (morfolojik acma)."""
    h, w = mask.shape
    kucuk = Image.fromarray((mask * 255).astype(np.uint8), 'L') \
                 .resize((w // kucult, h // kucult), Image.BOX)
    kucuk = kucuk.point(lambda v: 255 if v > 127 else 0)
    kucuk = kucuk.filter(ImageFilter.MinFilter(ac))    # kucult: benekler olur
    kucuk = kucuk.filter(ImageFilter.MaxFilter(yay))   # buyut: leke sinirina don
    buyuk = kucuk.resize((w, h), Image.BILINEAR)
    return np.asarray(buyuk) > 127


def sizinti_maskesi(p, bg, key):
    """P = a*B + (1-a)*K denklemini kanal kanal cozup uzlasmaya bakar."""
    pay, payda = p - key, bg - key
    kul = np.abs(payda) > 30                      # paydasi kucuk kanal guvenilmez
    with np.errstate(invalid='ignore', divide='ignore'):
        a = np.where(kul, pay / np.where(kul, payda, 1), np.nan)
        ort, sap = np.nanmean(a, 2), np.nanstd(a, 2)
    return np.nan_to_num((np.sum(kul, 2) >= 2) & (sap < A_SAPMA)
                         & (ort > -.05) & (ort < 1.08)).astype(bool)


def main(prop_yolu, bg_yolu, hedef_dir):
    p = np.asarray(Image.open(prop_yolu).convert('RGB')).astype(float)
    bg = np.asarray(Image.open(bg_yolu).convert('RGB')).astype(float)
    if p.shape != bg.shape:
        sys.exit(f'olculer tutmuyor: {p.shape} / {bg.shape}')
    h, w = p.shape[:2]
    print(f'{os.path.basename(prop_yolu)} {w}x{h}')

    yes = yesillik(p)
    alfa = np.clip((T_HI - yes) / (T_HI - T_LO), 0, 1)


    # Fon rengi KENARDAN degil, gorselin guclu yesil piksellerinden olculur.
    # Kenar orneklemesi sigginak sayfasinda calisiyordu cunku fon tuvalin
    # tamamiydi; dis dunya sayfasinda kenarlar gokyuzu, yesil ortada kaliyor
    # ve kenardan bakinca fon "koyu gri" sanildi.
    guclu = yesillik(p) > 60
    if guclu.sum() < p[..., 0].size * .01:
        sys.exit('yeterince yesil fon bulunamadi')
    key = np.median(p[guclu], 0)
    print(f'  fon rengi = {key.round(0)}')
    rgb = spill_sil(p, yes, key)
    sizinti = genis_lekeler((alfa > .5) & sizinti_maskesi(p, bg, key))
    alfa[sizinti] = 0
    print(f'  fon temizlendi   -> opak piksel %{(alfa > .5).mean()*100:.1f}')
    print(f'  sizan zemin atildi: {int(sizinti.sum())} px')

    os.makedirs(hedef_dir, exist_ok=True)
    prop = np.dstack([rgb.astype(np.uint8), (alfa * 255).astype(np.uint8)])
    Image.fromarray(prop, 'RGBA').save(f'{hedef_dir}/prop_saydam.png')

    # onizleme: proplar arka plana oturuyor mu
    birlesik = Image.alpha_composite(
        Image.fromarray(bg.astype(np.uint8)).convert('RGBA'),
        Image.fromarray(prop, 'RGBA'))
    birlesik.convert('RGB').save(f'{hedef_dir}/onizleme.png')
    print(f'-> {hedef_dir}/prop_saydam.png  ve  onizleme.png')


if __name__ == '__main__':
    main(sys.argv[1], sys.argv[2],
         sys.argv[3] if len(sys.argv) > 3 else f'{ROOT}/generated/prop')
