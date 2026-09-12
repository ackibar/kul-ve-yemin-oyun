"""Uretilen yaratik animasyonlarini enemies/N sheet yapisina kurar.

dusman_kur.py'nin yerini aliyor: orada Walk/Attack tek durus gorselinden
1-2 piksellik kaydirmayla "turetiliyordu", yani yaratik yurumuyor titriyordu.
Burada kareler gercek animasyondan geliyor.

Motor yaratigi bakis yonune gore DONDURDUGU icin yon basina ayri sheet yok:
uc yonun (D/U/S) hepsine ayni kareler yaziliyor, cizimde D kullaniliyor.
Hizalama: kareler ortak bir merkeze oturtulur - bbox'a gore ortalamak kanat
acikken govdeyi kaydiriyordu, agirlik merkezi ise sabit kaliyor.
"""
import glob, os, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import aktor_uyum
from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
HAM = f'{ROOT}/generated/yaratik_anim'
CELL = 64
YON = ('D', 'U', 'S')
SLOT = {'fare': 1, 'orumcek2': 2, 'yarasa': 5}


def merkez(k):
    """Alfa agirlik merkezi. Kanat acilip kapandikca bbox degisiyor ama kutle
    merkezi govdede kaliyor; hizalamayi ona gore yapmak titremeyi onluyor."""
    px = k.load()
    tx = ty = n = 0
    for y in range(k.height):
        for x in range(k.width):
            a = px[x, y][3]
            if a:
                tx += x * a; ty += y * a; n += a
    return (tx / n, ty / n) if n else (k.width / 2, k.height / 2)


# Golge cizgisinin hucre icindeki KARSILIGI. Motor sprite'i `top = -capa*olcek`
# ile ciziyor ve 64 px'lik hucre 32 dunya birimine sigiyor, yani art satiri r
# ekranda `-capa + r*0.5` birime denk geliyor; golge (y=0) icin r = 2*capa.
# Kareler hucre ORTASINA (32) oturtulunca yaratik golgesinin 7 birim ustunde
# havada duruyordu - ekranda acikca ayriydi.
CAPA = {1: 22, 2: 21, 5: 21}          # engine.sprite() ile ayni
# Yerden yukseklik (art satiri). Yarasa UCUYOR: golgesi altinda gorunmeli,
# govdesi havada durmali. Yerdeki yaratiklarda 0, yani karin cizgisi zemine
# oturur ve golgenin yalnizca kenari disari tasar.
UCUS = {1: 0, 2: 0, 5: 13}


def otur(k, hedef_cy):
    """Kareyi kutle merkezine gore oturtur.

    Dikeyde ALT KENARA gore hizalamak dogru gorunurdu ama kare kare degisiyor
    (bacaklar/kanatlar) ve yaratik yerinde zipliyordu. Bu yuzden hedef satir
    bir kez ilk kareden hesaplanip butun karelere ayni sekilde uygulanir.
    """
    cx, cy = merkez(k)
    out = Image.new('RGBA', (CELL, CELL), (0, 0, 0, 0))
    out.paste(k, (round(CELL / 2 - cx), round(hedef_cy - cy)))
    return out


def hedef_satir(ilk, slot):
    """Kutle merkezinin oturacagi satir: sprite'in ALTI zemin cizgisine gelsin."""
    cy = merkez(ilk)[1]
    alt = ilk.getbbox()[3]
    return 2 * CAPA[slot] - (alt - cy) - UCUS[slot]


def kirmizi(k, guc=.45):
    px = k.load()
    for y in range(k.height):
        for x in range(k.width):
            r, g, b, a = px[x, y]
            if a:
                px[x, y] = (min(255, int(r + (255 - r) * guc)), int(g * (1 - guc * .6)),
                            int(b * (1 - guc * .6)), a)
    return k


def sayfa(kareler, yol):
    sh = Image.new('RGBA', (CELL * len(kareler), CELL), (0, 0, 0, 0))
    for i, k in enumerate(kareler):
        sh.paste(k, (i * CELL, 0))
    sh.save(yol)


# Yon basina AYRI kaynak olan yaratiklar. Orumcegin dondurmesi calismadigi
# icin (bacaklari alt yarida toplanmis) motorun D/U/S semasina gecti.
YON_KAYNAK = {'orumcek2': {'D': 'orumcek2', 'U': 'orumcek2u', 'S': 'orumcek2s'}}


def ham_kareler(ad, aksiyon):
    f = sorted(glob.glob(f'{HAM}/{ad}_{aksiyon}_*.png'))
    if not f:
        raise SystemExit(f'{ad}/{aksiyon} kareleri yok - once yaratik_anim.py')
    return [Image.open(x).convert('RGBA') for x in f]


def kur(ad):
    slot = SLOT[ad]
    klasor_yol = f'{ROOT}/public/assets/enemies/{slot}'
    os.makedirs(klasor_yol, exist_ok=True)
    kaynaklar = YON_KAYNAK.get(ad, {y: ad for y in YON})
    for y in YON:
        src = kaynaklar[y]
        hy = ham_kareler(src, 'Walk'), ham_kareler(src, 'Attack')
        hedef = hedef_satir(hy[0][0], slot)
        yuru = [otur(k, hedef) for k in hy[0]]
        vur = [otur(k, hedef) for k in hy[1]]
        sayfa(yuru, f'{klasor_yol}/{y}_Walk.png')
        sayfa(vur, f'{klasor_yol}/{y}_Attack.png')
        sayfa([kirmizi(yuru[0].copy()), kirmizi(yuru[0].copy(), .25)], f'{klasor_yol}/{y}_Hurt.png')
        # Motor cizmese de eksik gorsel uyarisi cikmasin diye
        sayfa([yuru[0]], f'{klasor_yol}/{y}_Idle.png')
        sayfa([yuru[0]], f'{klasor_yol}/{y}_Death.png')
    print(f'  enemies/{slot} <- {ad} ({"yon basina ayri" if ad in YON_KAYNAK else "tek kaynak"})')
    aktor_uyum.klasor(klasor_yol, ham_yenile=True)


if __name__ == '__main__':
    for a in sys.argv[1:] or SLOT:
        kur(a)
