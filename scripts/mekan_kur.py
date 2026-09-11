"""Yeni arka plan + prop sayfasindan oyun mekanini kurar (gorsel + carpisma).

Cikti:
  public/assets/arkaplan/haven.png   960x960, proplar zemine gomulu (motor tek
                                     arka plan gorseli ciziyor, mimariyi bozmuyoruz)
  generated/_YENI_ENGEL.png          dogrulama katmani
  ekrana: world.ts'e yapistirilacak oda + blockers satirlari

Carpisma nasil cikariliyor: prop sayfasinin ALFA'si zaten "nesne nerede" demek.
Once bagli bilesenlerle her nesne AYRI AYRI bulunuyor, sonra her nesnenin kendi
sinir kutusunun ALT %45'i ayak izi sayiliyor - ust kisim gorsel derinlik
(yatagin sirti, tezgahin arkaligi) oldugu icin serbest kaliyor.

Sutun sutun tarama denendi ve YETMEDI: ince parcalarda (perde sarkitlari, sepet
kulpu) kosu bir piksel olunca ayak izi de bir piksel kaliyor, kutular delik
delik cikiyordu. Nesneyi butun olarak gormek sart.

Piksel maskesi sonra karo izgarasina indirgeniyor ve komsu karolar
dikdortgenlere birlestiriliyor ki world.ts'te okunabilir kalsin.
"""
import os, sys
import numpy as np
from PIL import Image, ImageFilter

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
KARO = 32                 # 1 karo = 16 dunya birimi x 2 px/birim
N = 30                    # 30x30 karo
TUVAL = KARO * N          # 960
TABAN_ORAN = .45          # nesnenin alt bu orani ayak izi
TABAN_TAVAN = 72          # ayak izi en fazla bu kadar yuksek (px) ~2.2 karo
AYIR = 5                  # bilesen bulmadan once bu kadar asindir (nesneleri ayir)
KARO_ESIK = .30           # karonun bu kadari doluysa engel
ZEMIN_ISIK = 28           # bundan koyu = tuvalin disi (siyah kenar)
KORIDOR = [(12, 0, 19, 8), (12, 22, 19, 30)]   # ust ve alt gecit: hep acik


def bilesenler(op, en_az=180):
    """Bagli bilesenler: satir kosulari uzerinde birlestir-bul (scipy yok).

    Piksel piksel dolasmak yerine kosu bazli calisiyor - 900k piksel yerine
    ~15k kosu geziliyor, saniyenin altinda bitiyor.
    """
    h, w = op.shape
    ebeveyn = [0]
    def bul(a):
        while ebeveyn[a] != a:
            ebeveyn[a] = ebeveyn[ebeveyn[a]]; a = ebeveyn[a]
        return a
    def birlestir(a, b):
        a, b = bul(a), bul(b)
        if a != b: ebeveyn[max(a, b)] = min(a, b)

    onceki, kosular = [], []
    for y in range(h):
        d = np.diff(np.concatenate(([0], op[y].view(np.int8), [0])))
        bas, son = np.nonzero(d == 1)[0], np.nonzero(d == -1)[0]
        simdi = []
        for b, s in zip(bas, son):
            ebeveyn.append(len(ebeveyn)); et = len(ebeveyn) - 1
            for pb, ps, pe in onceki:           # ust satirla degiyor mu
                if pb < s and b < ps:
                    birlestir(et, pe)
            simdi.append((b, s, et))
            kosular.append((y, b, s, et))
        onceki = simdi

    kutu = {}
    for y, b, s, et in kosular:
        k = bul(et)
        if k in kutu:
            x1, y1, x2, y2, n = kutu[k]
            kutu[k] = (min(x1, b), min(y1, y), max(x2, s), max(y2, y + 1), n + s - b)
        else:
            kutu[k] = (b, y, s, y + 1, s - b)
    return [v for v in kutu.values() if v[4] >= en_az]


def ayak_izi(alfa):
    """Nesnelerin kapladigi alani engel maskesi olarak verir.

    "Alt %45" kurali denendi ve BU SANATTA ISE YARAMADI: yatak ile yanindaki
    camasirlik konturlarindan degip tek bilesen oluyor, alt %45 de yatagi
    atlayip camasira denk geliyordu. Tepeden bakan bir mekanda zaten nesnenin
    durdugu her piksel gecilemez - o yuzden dogrudan maske kullaniliyor.
    Bilesenler yalnizca tekil benekleri (toz, yere dusmus kagit) elemeye yariyor.
    """
    op = alfa > 128
    # Sinir kutusu DEGIL maskenin kendisi kullaniliyor: tepeden bakan bir
    # mekanda nesnenin durdugu her piksel zaten gecilemez, ve L seklindeki
    # kumelerde kutu bos koseleri de kapatiyordu.
    iz = op.copy()
    # tekil benekler (toz, kagit parcasi) engel olmasin
    nesneler = bilesenler(op)
    buyuk = np.zeros_like(op)
    for x1, y1, x2, y2, _ in nesneler:
        buyuk[y1:y2, x1:x2] |= op[y1:y2, x1:x2]
    print(f'  {len(nesneler)} nesne bulundu')
    return buyuk


def karolara(mask):
    t = mask[:N*KARO, :N*KARO].reshape(N, KARO, N, KARO).mean(axis=(1, 3))
    return t > KARO_ESIK


def dikdortgenler(grid):
    """Yatay kosulari birlestirip dikey olarak da ayni enli komsulari yutar."""
    kutular = []
    kalan = grid.copy()
    for y in range(N):
        x = 0
        while x < N:
            if not kalan[y, x]:
                x += 1; continue
            x2 = x
            while x2 + 1 < N and kalan[y, x2 + 1]:
                x2 += 1
            y2 = y
            while y2 + 1 < N and kalan[y2 + 1, x:x2+1].all():
                y2 += 1
            kalan[y:y2+1, x:x2+1] = False
            kutular.append((x, y, x2 + 1, y2 + 1))
            x = x2 + 1
    return kutular


def main(bg_yolu, prop_yolu):
    bg = Image.open(bg_yolu).convert('RGBA').resize((TUVAL, TUVAL), Image.LANCZOS)
    prop = Image.open(prop_yolu).convert('RGBA').resize((TUVAL, TUVAL), Image.LANCZOS)
    sahne = Image.alpha_composite(bg, prop)
    os.makedirs(f'{ROOT}/public/assets/arkaplan', exist_ok=True)
    sahne.convert('RGB').save(f'{ROOT}/public/assets/arkaplan/haven.png')
    print(f'-> public/assets/arkaplan/haven.png  {TUVAL}x{TUVAL} ({N}x{N} karo)')

    # yurunebilir alan: arka planin aydinlik kismi (siyah kenar = tuvalin disi)
    lum = np.asarray(bg.convert('L')).astype(float)
    zemin = karolara(lum > ZEMIN_ISIK)
    engel = karolara(ayak_izi(np.asarray(prop)[..., 3]))
    engel &= zemin                      # zemin disinda engel aramaya gerek yok
    # Koridor agizlarindaki dekoratif taslar gecisi kapatiyordu; iki gecit
    # bilerek acik tutuluyor (seviye tasarimi karari, otomatik cikarim degil).
    for x1, y1, x2, y2 in KORIDOR:
        engel[y1:y2, x1:x2] = False

    ek = dikdortgenler(engel)
    print(f'\nyurunebilir karo: {int(zemin.sum())}/{N*N}   engel karo: {int(engel.sum())}'
          f'   -> {len(ek)} dikdortgen')

    # dogrulama katmani
    kat = sahne.copy()
    px = np.asarray(kat).copy()
    for x1, y1, x2, y2 in ek:
        px[y1*KARO:y2*KARO, x1*KARO:x2*KARO, 0] = np.minimum(
            255, px[y1*KARO:y2*KARO, x1*KARO:x2*KARO, 0] + 70)
    Image.fromarray(px).convert('RGB').save(f'{ROOT}/generated/_YENI_ENGEL.png')
    print('-> generated/_YENI_ENGEL.png (kirmizi = gecilemez)')

    # Ocak merkezleri: prop katmanindaki sicak-parlak kumeler. Motor animasyonlu
    # alevi buraya koyacak; gorseldeki kor sabit kaliyor, boyali ALEV yok.
    pr = np.asarray(prop).astype(int)
    sicak = (pr[..., 3] > 128) & (pr[..., 0] > 170) & (pr[..., 1] > 90) & (pr[..., 2] < 90)
    ocaklar = [(int((x1+x2)/2), int((y1+y2)/2)) for x1, y1, x2, y2, n
               in bilesenler(sicak, en_az=120)]

    print('\n--- world.ts icin ---')
    print(' const ZEMIN=[' + ','.join(
        "'" + ''.join('1' if zemin[y, x] else '0' for x in range(N)) + "'"
        for y in range(N)) + '];')
    print(' blockers.push(' + ','.join(f'[{a},{b},{c},{d}]' for a, b, c, d in ek) + ');')
    print(f' // ocak merkezleri (dunya birimi): ' + ', '.join(
        f'({x/2:.1f},{y/2:.1f})' for x, y in ocaklar))
    np.save(f'{ROOT}/generated/_zemin_karo.npy', zemin)


if __name__ == '__main__':
    main(sys.argv[1] if len(sys.argv) > 1 else f'{ROOT}/background.jpeg',
         sys.argv[2] if len(sys.argv) > 2 else f'{ROOT}/generated/prop/prop_saydam.png')
