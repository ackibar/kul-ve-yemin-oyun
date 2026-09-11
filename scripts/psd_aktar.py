"""Photoshop dosyasini oyuna aktarir: katmanlar -> zemin + nesne sprite'lari + carpisma.

Neden bu yol iyi: katman sinirlari nesnenin nerede basladigini/bittigini zaten
soyluyor, yani carpisma kutusunu gorselden geri muhendislik etmeye gerek kalmiyor.
Konum da katmanin PSD icindeki yerinden geliyor.

KATMAN ADI SOZLESMESI
  zemin                -> tabana cizilir, carpisma yok (ad 'zemin' veya 'background')
  <ad>@engel           -> sprite + ayak izi carpismasi (yatak, masa, sandik...)
  <ad>@gecilir         -> sprite, carpisma YOK (hali, camasir, golge, yosun)
  <ad>@ates            -> sprite + carpisma + uzerine animasyonlu alev
  <ad>@ust             -> sprite, karakterin HEP ustunde (kiris, asma perde)
Ad ayraci olarak '@' yoksa varsayilan '@engel'.

KATMAN TURU FARK ETMEZ. Akilli nesne (smart object), sekil (shape), metin ve
normal piksel katmani ayni sekilde okunur: Photoshop her katmanin ekranda
gorunen halini dosyaya rasterize edilmis olarak yaziyor, biz de onu aliyoruz.
Akilli nesnenin icindeki olceklendirme/dondurme zaten bu goruntuye islenmis
oluyor, yani serbestce donusturebilirsin.

GRUPLAR
  Adinda '@' OLMAYAN grup sadece duzenleme klasoru sayilir, icine inilir.
  Adinda '@' OLAN grup TEK nesne olarak duzlestirilir - bir yatagi govde+yorgan
  +golge diye ayri katmanlara bolup 'yatak@engel' grubuna koymak en temiz yol.

Ayak izi: sprite'in alt %45'i (ust kisim gorsel derinlik icin serbest kalir).
"""
import json, os, re, sys
from psd_tools import PSDImage
from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
R = 2                       # render yogunlugu: 1 dunya birimi = 2 piksel
TABAN_ORAN = 0.45           # ayak izi: sprite yuksekliginin alt bu orani
ZEMIN_ADLARI = ('zemin', 'background', 'arkaplan', 'floor')


def temiz(ad):
    return re.sub(r'[^a-zA-Z0-9_]', '', ad) or 'nesne'


def tur_adi(lay):
    """Raporda gorunsun diye katmanin Photoshop turu."""
    k = type(lay).__name__
    return {'PixelLayer': 'piksel', 'SmartObjectLayer': 'akilli nesne',
            'ShapeLayer': 'sekil', 'TypeLayer': 'metin', 'Group': 'grup'}.get(k, k)


def _duz_katmanlar(kapsayici, yol=''):
    """Gorunur katmanlari sirayla verir; etiketsiz gruplarin icine iner.

    Etiketsiz grup = sadece duzenleme klasoru. Etiketli grup ('yatak@engel')
    tek parca olarak dondurulur, cunku kullanici onu bilerek bir nesne olarak
    isaretlemis demektir.
    """
    for lay in kapsayici:
        if not lay.is_visible():
            print(f'  atlandi (gizli): {yol}{lay.name}')
            continue
        ad = lay.name.strip()
        if lay.is_group() and '@' not in ad and ad.lower() not in ZEMIN_ADLARI:
            print(f'  klasor: {yol}{ad}/  (icine iniliyor)')
            yield from _duz_katmanlar(lay, f'{yol}{ad}/')
        else:
            yield lay, ad, yol


def aktar(psd_yolu, zone='haven', out_dir=None):
    psd = PSDImage.open(psd_yolu)
    W, H = psd.width, psd.height
    tuval = (0, 0, W, H)
    out_dir = out_dir or f'{ROOT}/public/assets/psd/{zone}'
    os.makedirs(out_dir, exist_ok=True)
    print(f'PSD {W}x{H}  =>  dunya {W//R}x{H//R} birim ({W//(R*16)}x{H//(R*16)} karo)')

    zemin_img = None
    nesneler = []
    gorulen = {}
    for lay, ad, yol in _duz_katmanlar(psd):
        kok, _, tur = ad.partition('@')
        tur = (tur or 'engel').lower()
        # TUM TUVAL viewport'u: donen goruntunun sol ust kosesi (0,0) demek,
        # yani konum dogrudan bbox'tan geliyor. lay.left/top'a guvenmek katman
        # efektlerinde (golge, kontur, parlama) ve maskelerde kaydiriyordu -
        # efekt kutunun disina tasiyor, bbox ise onu kapsamiyor.
        im = lay.composite(viewport=tuval)
        if im is None:
            print(f'  atlandi (bos): {yol}{ad}'); continue
        im = im.convert('RGBA')
        if kok.lower() in ZEMIN_ADLARI:
            zemin_img = im
            print(f'  ZEMIN: {yol}{ad}  ({tur_adi(lay)})')
            continue
        bb = im.getbbox()
        if not bb:
            print(f'  atlandi (saydam): {yol}{ad}'); continue
        kirp = im.crop(bb)
        gx, gy = bb[0], bb[1]                          # mutlak konum
        slug = temiz(kok)
        if slug in gorulen:
            print(f'  !! ayni ad iki kez: "{ad}" -> {slug} '
                  f'(onceki: {gorulen[slug]}). Ikisini de istiyorsan farkli adlandir.')
        gorulen[slug] = f'{yol}{ad}'
        kirp.save(f'{out_dir}/{slug}.png')
        nesneler.append({'id': slug, 'tur': tur,
                         'px': gx, 'py': gy, 'w': kirp.width, 'h': kirp.height})
        print(f'  {tur:9s} {slug:14s} konum=({gx},{gy}) boyut={kirp.width}x{kirp.height}'
              f'  [{tur_adi(lay)}]')

    if zemin_img is not None:
        Image.alpha_composite(Image.new('RGBA', (W, H), (0, 0, 0, 255)),
                              zemin_img).convert('RGB').save(f'{out_dir}/_zemin.png')

    meta = {'zone': zone, 'psd': os.path.basename(psd_yolu), 'w': W, 'h': H,
            'R': R, 'nesneler': nesneler}
    json.dump(meta, open(f'{out_dir}/_meta.json', 'w'), indent=1)
    print(f'\n{len(nesneler)} nesne + {"zemin" if zemin_img else "ZEMIN YOK"} -> {out_dir}')
    return meta


def ts_uret(meta):
    """world.ts'e yapistirilacak yerlestirme kodunu uretir."""
    sat = []
    for n in meta['nesneler']:
        # sprite tabandan hizali cizilir; entity konumu = ayak izinin ALT ORTASI
        cx = (n['px'] + n['w'] / 2) / meta['R']
        by = (n['py'] + n['h']) / meta['R']
        fw = n['w'] / meta['R'] / 16
        fh = n['h'] * TABAN_ORAN / meta['R'] / 16
        if n['tur'] == 'gecilir':
            sat.append(f"  psdObj('{n['id']}',{cx:.1f},{by:.1f},0,0);")
        elif n['tur'] == 'ust':
            sat.append(f"  psdObj('{n['id']}',{cx:.1f},{by:.1f},0,0,true);")
        else:
            sat.append(f"  psdObj('{n['id']}',{cx:.1f},{by:.1f},{fw:.2f},{fh:.2f});")
            if n['tur'] == 'ates':
                sat.append(f"  entities.push({{id:'alev_{n['id']}',type:'fire',"
                           f"x:{cx:.1f},y:{by - n['h']/meta['R']/2 + 10:.1f}}});")
    return '\n'.join(sat)


if __name__ == '__main__':
    m = aktar(sys.argv[1], sys.argv[2] if len(sys.argv) > 2 else 'haven')
    print('\n--- world.ts icin uretilen yerlestirme ---')
    print(ts_uret(m))
