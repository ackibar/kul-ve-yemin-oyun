"""v3 ham karelerini oyunun D/U/S sheet yapisina kurar.

HIZALAMA - burasi isin puf noktasi. Kareleri bbox'a gore ortalamak BOZUYOR:
saldirida kilic kafanin uzerine kalkinca bbox tepesi kilicin ucu oluyor, yana
savrulunca bbox genisliyor; govdeye gore ortalamak da kilic govdeyi kestigi icin
sapiyor. Olculdu ve iki dayanak SAGLAM cikti:
  * ayak cizgisi = en az 4 piksel genisligindeki EN ALT satir. Kilicin ucu ince
    (1-3 px) oldugu icin sayilmiyor; yuruyuste 76-78, saldirida 76'da sabit.
  * kafa tepesi = en az 6 piksel genisligindeki ILK satir. Kilic dik yukari
    kalktigi karede bile (bbox tepesi 2) kafa 16'da kaliyor.
Yatayda kafa kutlesinin merkezi kullanilir, dikeyde ayak cizgisi.

Referans hucrenin ortasi DEGIL, ayni yonun MEVCUT Idle karesi: silah degistirince
ya da duruştan yuruyuse gecince karakter zipliyordu (bkz. silah varyanti dersi).
Yeni set (1bow) icin referans kilicli setin Idle'i - iki mod arasinda gecis
puruzsuz olsun diye.

Ham sheet once asset_backup_ton_oncesi'ne yazilir, ton uyumu oradan uretilir;
yoksa aktor_uyum bir sonraki calismada yeni sheet'i eski haliyle ezerdi.

kullanim: python3 scripts/v3_kur.py <set>     (kilic | yay | rauf)
"""
import glob, json, os, shutil, sys, urllib.request, zipfile
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import aktor_uyum, pxl
from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
BOY, FEET = 64, 62
# Oyuncu 8 yonde ciziliyor: uc ana yon + iki capraz, bati tarafi motorda
# aynalaniyor. NPC'ler yalnizca ilk uc yonu kullaniyor.
YON = {'south': 'D', 'north': 'U', 'east': 'S',
       'south-east': 'DS', 'north-east': 'US'}
HAM = os.path.join(ROOT, 'asset_backup_ton_oncesi')

# Hucre GENISLIGI aksiyona gore degisiyor. Olculdu: kilic savurusunda kol disa
# aciliyor ve kare 64'e sigmiyor (D_Attack 6px sola, 3px saga tasiyor) - kilicin
# ucu kirpiliyordu. Oyuncunun setleri 80 genislikte tutulur; motor oyuncuyu
# fw=40 ile cizer (40*R=80). NPC'ler 64'te kalir, onlarin silahi savrulmuyor.
OYUNCU_EN, NPC_EN = 80, 64

# set -> (hedef slot, referans slot, hucre eni, donus karesinden uretilecekler)
# set -> (hedef slot, referans slot, hucre eni, {aksiyon: kare} durus isleri,
#         durus uretilecek yonler; None = hepsi)
# PixelLab karakter id'si: silahsiz set taban karakterin kendisi.
ID_DOSYA = {'kilic': 'pixellab/gezgin/id_kilic.txt',
            'kullenmis': 'pixellab/id_kullenmis.txt',
            'yay': 'pixellab/gezgin/id_yay.txt',
            'yumruk': 'pixellab/gezgin/id.txt',
            'balta': 'pixellab/gezgin/id.txt',
            'rauf': 'pixellab/id_rauf.txt',
            'rauf6': 'pixellab/id_rauf.txt'}

SETLER = {
    # Kilicli sette ana yonlerin Idle/Hurt/Death'i zaten var ve calisiyor;
    # yalnizca yeni caprazlar icin uretilir.
    'kilic': ('characters/1sword', 'characters/1sword', OYUNCU_EN,
              {'Idle': 4, 'Hurt': 2, 'Death': 8}, ['south-east', 'north-east']),
    'rauf':  ('characters/5',      'characters/5',      NPC_EN, {}, None),
    # Rauf hem NPC (characters/5) hem dusman (enemies/6) olarak ayni sanati
    # kullaniyor; ayni ham karelerden ikinci slot da kurulur.
    'rauf6': ('enemies/6',         'enemies/6',         NPC_EN, {}, None),
    # Silahsiz set. Ana yonlerin Idle/Hurt/Death'i eski boru hattindan zaten
    # var ve calisiyor; yalnizca yeni caprazlar icin uretilir.
    'balta': ('characters/1balta', 'characters/1sword', OYUNCU_EN,
              {'Idle': 4, 'Hurt': 2, 'Death': 8}, None),
    'yumruk': ('characters/1', 'characters/1', OYUNCU_EN,
               {'Idle': 4, 'Hurt': 2, 'Death': 8}, ['south-east', 'north-east']),
    # Insansi dusmanlar. Motor bunlardan Walk/Attack/Hurt ciziyor; capraz
    # yonlerin Hurt'u uretilmedi (0.17 sn goruntuleniyor, dusmanPoz ana yone
    # dusuyor). Idle/Death hic cizilmiyor ama eksik gorsel uyarisi cikmasin
    # diye ana yonlerde zaten var.
    'kullenmis': ('enemies/4', 'enemies/4', NPC_EN, {}, None),
    'yay':   ('characters/1bow',   'characters/1sword', OYUNCU_EN,
              {'Idle': 4, 'Hurt': 2, 'Death': 8}, None),
}


# Ok, tusa basildigi ANDA firlatiliyor; animasyon ise yayi once kaldirip sonra
# cekiyor, yani ok yay gerilmeden once cikip tuhaf duruyordu. Bu setlerde kareler
# ATIS karesi basa gelecek sekilde donduruluyor - kalan kareler yayin indirilmesi
# olarak okunuyor. Atis karesi sabit degil (guneyde 5., doguda 3.), bu yuzden
# elle yazilmiyor: en GENIS bbox'li kare atis anidir (yay + ucan ok).
ATIS_BASA = {('yay', 'Attack')}

# Yedek yon: bir yonun kareleri kullanilamazsa en yakin calisan yonunkiler
# kullanilir. Yayli caprazlar bir sure boyle idare edildi; artik BASLANGIC
# karesi yontemiyle kendi kareleri var, bu yuzden sozluk bos.
YEDEK_YON = {}

# keep_first_frame=True karakterin DONUS karesini kare 0 olarak sakliyor; yayli
# sette o karede yay yok ve model yayi ancak 2-3 kare sonra ciziyor. Sonuc:
# yururken yay arada kayboluyordu. Bu kareler atilir - uretim harcamadan.
# Esik bbox GENISLIGINDEN: yaysiz kare yalnizca govde kadar dar, yayli kare
# kollari disina tasiyor. Olculen guney yuruyusu 33..59, dogu 21..46.
ONDEN_AT = {('yay', 'Walk'), ('yay', 'Attack')}
# Esik 0.45'ti; saldirida yay DIKEY tutuldugu icin bbox'i genisletmiyor ve
# iyi kareler de atiliyordu. Piksel sayisi denendi ve DAHA KOTU ayirdi
# (yatay yayli kare 1532, yaysiz kare 1460 - %5 fark, siralamayi bile
# tutturmuyor). Genislik dogru olcut, pay dusuruldu.
AT_ESIK = 0.30


# Animasyon bu sayidan kisa birakilmaz: yukari-capraz yay saldirisinda yayin
# genisligi kademeli arttigi icin esik 7 kareden 2'sini birakmisti.
EN_AZ_KARE = 4


# Genislik araligi bundan darsa hic kirpilmaz: butun karelerde yay varken
# esik anlamsiz kaliyor ve saglam kareler atiliyordu (yukari-caprazda aralik
# yalnizca 33..37 px).
EN_AZ_ARALIK = 8


def yaysiz_onu_at(kareler):
    """Bastan VE sondan silahsiz kareleri atar.

    Sondan da atmak gerekiyor: kuzey yuruyusunde yay son iki karede soluyor,
    animasyon dongu oldugu icin her turda bir kez 'yanip sonuyor'."""
    en = [(lambda b: (b[2] - b[0]) if b else 0)(k.getbbox()) for k in kareler]
    if max(en) - min(en) < EN_AZ_ARALIK:
        return kareler, 0
    esik = min(en) + (max(en) - min(en)) * AT_ESIK
    i, j = 0, len(en)
    while j - i > EN_AZ_KARE and en[i] < esik:
        i += 1
    while j - i > EN_AZ_KARE and en[j - 1] < esik:
        j -= 1
    return kareler[i:j], i + (len(en) - j)


def atisi_basa_al(kareler):
    g = [k.getbbox() for k in kareler]
    en = [(b[2] - b[0]) if b else 0 for b in g]
    i = en.index(max(en))
    return kareler[i:] + kareler[:i]


def profil(im):
    px = im.load()
    return [sum(1 for x in range(im.width) if px[x, y][3] > 0) for y in range(im.height)]


def capalar(im):
    """(kafa merkezi x, ayak y). Silahtan etkilenmeyen iki dayanak."""
    p = profil(im)
    ust = next((y for y, n in enumerate(p) if n >= 6), None)
    alt = max((y for y, n in enumerate(p) if n >= 4), default=None)
    if ust is None or alt is None:
        return None
    px, top, agirlik = im.load(), 0.0, 0
    for y in range(ust, min(ust + 12, im.height)):
        for x in range(im.width):
            if px[x, y][3] > 0:
                top += x; agirlik += 1
    return (top / agirlik if agirlik else im.width / 2), alt


def otur(kare, hedef_x, hedef_y, en):
    c = capalar(kare)
    out = Image.new('RGBA', (en, BOY), (0, 0, 0, 0))
    if not c:
        return out, 0
    dx, dy = round(hedef_x - c[0]), round(hedef_y - c[1])
    out.paste(kare, (dx, dy))
    bb = kare.getbbox()
    tasan = 0
    if bb:
        tasan = max(0, -(bb[0] + dx)) + max(0, (bb[2] + dx) - en)
    return out, tasan


def referans(slot, g, en):
    """Mevcut Idle karesinin capalari; yoksa hucre ortasi + taban.

    Hucre ortasi DEGIL mevcut Idle'a hizalanir; yoksa duruştan yuruyuse
    gecerken karakter yatayda ziplar. Yeni genislige tasinirken kafa
    merkezi yeni ortaya kaydirilir."""
    yol = f'{ROOT}/public/assets/{slot}/{g}_Idle.png'
    if not os.path.exists(yol):
        # Yeni capraz yonun henuz Idle'i yok; kafa merkezi yonler arasi cok az
        # degistigi icin (olculdu: D 31.9, S 33.6) 'D' referans alinir.
        yol = f'{ROOT}/public/assets/{slot}/D_Idle.png'
    if os.path.exists(yol):
        k = Image.open(yol).convert('RGBA')
        if k.width % en:
            raise SystemExit(f'{yol} hucre eni {en} degil ({k.width}px). '
                             f'Once: python3 scripts/hucre_genislet.py {slot} {en}')
        c = capalar(k.crop((0, 0, en, BOY)))
        if c:
            return c
    return en / 2, FEET


def donus_kareleri(cid, kl):
    """Karakterin 8 yon donus karesi - yeni sette Idle/Hurt/Death bundan gelir."""
    os.makedirs(kl, exist_ok=True)
    if not os.path.exists(f'{kl}/s.zip'):
        req = urllib.request.Request(
            f'https://api.pixellab.ai/v2/characters/{cid}/spritesheet',
            headers={'Authorization': 'Bearer ' + pxl.key()})
        open(f'{kl}/s.zip', 'wb').write(urllib.request.urlopen(req, timeout=180).read())
        zipfile.ZipFile(f'{kl}/s.zip').extractall(kl)
    sheet = Image.open(glob.glob(f'{kl}/*.png')[0]).convert('RGBA')
    meta = json.load(open(glob.glob(f'{kl}/*.json')[0]))
    C = meta['spritesheet']['cell_size']['width']
    r = [x for x in meta['spritesheet']['rows'] if x['type'] == 'rotations'][0]
    return {d: sheet.crop((i * C, 0, i * C + C, C)) for i, d in enumerate(r['directions'])}


def kur(setad):
    slot, ref_slot, en, durus_isleri, durus_yonler = SETLER[setad]
    # rauf6 kendi uretimini yapmaz, rauf'un ham karelerini kullanir.
    kaynak = f'{ROOT}/pixellab/v3/{"rauf" if setad == "rauf6" else setad}'
    ham_kl = f'{HAM}/{slot}'
    os.makedirs(ham_kl, exist_ok=True)
    if not os.path.isdir(f'{ROOT}/public/assets/{slot}'):
        os.makedirs(f'{ROOT}/public/assets/{slot}')

    # Donus kareleri yalnizca bir yonun yuruyus karesi yoksa gerekiyor; pesin
    # indirmek silahsiz sette id dosyasi baska adda oldugu icin patliyordu.
    rot = {}

    def donusler():
        if not rot:
            cid = open(f'{ROOT}/{ID_DOSYA[setad]}').read().strip()
            rot.update(donus_kareleri(cid, f'{ROOT}/pixellab/v3/{setad}_sheet'))
        return rot

    aksiyonlar = sorted({os.path.basename(f).split('_')[0] for f in glob.glob(f'{kaynak}/*.png')})
    rapor = []
    for yon, g in YON.items():
        hx, hy = referans(ref_slot, g, en)
        isler = [(a, sorted(glob.glob(
            f'{kaynak}/{a}_{YEDEK_YON.get((setad, a, yon), yon)}_*.png'))) for a in aksiyonlar]
        # Durus/hasar/olum icin DONUS karesi kullanilamiyor: yayli sette o karede
        # yay yok, yani dururken yay kaybolup yuruyunce geri geliyordu. Bunun
        # yerine yaysiz onu atilmis yuruyusun ilk karesi kullanilir.
        durus_k = None
        if durus_isleri and (durus_yonler is None or yon in durus_yonler):
            y = sorted(glob.glob(f'{kaynak}/Walk_{YEDEK_YON.get((setad, "Walk", yon), yon)}_*.png'))
            if y:
                kk = [Image.open(x).convert('RGBA') for x in y]
                if (setad, 'Walk') in ONDEN_AT:
                    kk = yaysiz_onu_at(kk)[0]
                durus_k = kk[0]
            else:
                durus_k = donusler().get(yon)
        for ad, n in durus_isleri.items():
            if durus_k is not None:
                isler.append((ad, [durus_k] * n))
        for aksiyon, kareler in isler:
            if not kareler:
                continue
            kareler = [Image.open(k).convert('RGBA') if isinstance(k, str) else k for k in kareler]
            atilan = 0
            if (setad, aksiyon) in ONDEN_AT:
                kareler, atilan = yaysiz_onu_at(kareler)
            if (setad, aksiyon) in ATIS_BASA:
                kareler = atisi_basa_al(kareler)
            sh = Image.new('RGBA', (en * len(kareler), BOY), (0, 0, 0, 0))
            tasma = 0
            for i, k in enumerate(kareler):
                hucre, t = otur(k, hx, hy, en)
                tasma = max(tasma, t)
                sh.paste(hucre, (i * en, 0))
            sh.save(f'{ham_kl}/{g}_{aksiyon}.png')
            rapor.append((f'{g}_{aksiyon}', len(kareler), tasma, atilan))
    for ad, n, t, atilan in rapor:
        print(f'  {slot}/{ad:10s} {n} kare'
              + (f'  ({atilan} yaysiz kare atildi)' if atilan else '')
              + (f'  (silah ucu {t}px tasti)' if t else ''))
    aktor_uyum.klasor(f'{ROOT}/public/assets/{slot}')


if __name__ == '__main__':
    for s in sys.argv[1:]:
        kur(s)
