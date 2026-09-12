"""v3 (metin) animasyonu uretir ve ham kareleri diske yazar.

Neden sablon degil: iskelet sablonu eldeki nesneyi dusuruyor - kilicli
karakterde `cross-punch` kilici 48->30 px'e dusuruyor, oyunda Rauf'un
"kilicla yumruk atmasi" tam olarak bu. v3 karakterin DONUS karesinden
basladigi icin elindeki silah karede kaliyor. Olculdu: 1 uretim/yon,
yani sablonla ayni fiyat.

kullanim: python3 scripts/v3_anim.py <set>    (set: kilic | yay | rauf)
"""
import base64, io, json, os, sys, time
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import pxl
from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
# Motor batiyi 'east'in aynasi olarak ciziyor, bu yuzden yalnizca sag yarim
# uretilir. Caprazlar da ayni mantikla: south-east/north-east basilir,
# south-west/north-west aynalanir.
YONLER = ['south', 'north', 'east']
CAPRAZ = ['south-east', 'north-east']

# Tarifler dogrudan olculdu: "geniş yatay savurma" deyince model kilici isik
# huzmesine cevirdi. Silahin MADDESINI ("solid steel blade") ve elde kaldigini
# acikca yazmak gerekiyor.
KILIC_VUR = ('raises the sword overhead with both hands and chops straight down in '
             'front of the body, then lifts it back to a ready guard; the sword is a '
             'solid steel blade and stays gripped in the hand in every frame')
# Yandan bakista ayni tarif kilici asagidan yukari savurttu, ters ve tuhaf
# duruyordu. Yan gorunumde kesme yonunu acikca yazmak gerekiyor.
KILIC_VUR_YAN = ('lifts the sword high above the head and swings it down in a strong '
                 'overhead arc, the blade travelling from top to bottom and ending '
                 'pointed at the ground in front, then raises it back to guard; the '
                 'sword is a solid steel blade and stays gripped in the hand in '
                 'every frame')
KILIC_YUR = ('walks forward with a steady stride, legs alternating clearly, arms '
             'swinging slightly, the sword held down at the side in the right hand '
             'the whole time')
# Yay durumunun DONUS karesinde yay yok - sadece sirttaki okluk tuttu. Bu tarif
# tek yonle sinandi: v3 uretken oldugu icin yayi 2. kareden itibaren kendisi
# ciziyor, yani 20 uretimlik ikinci bir durum basmaya gerek kalmadi.
# Ilk surumde ilk uc kare yaysizdi; atis karesi basa alininca bu kareler ortaya
# dusup yay kayboluyormus gibi duruyordu. Yay artik HER karede elde sart.
YAY_VUR = ('already holding a large curved wooden hunting bow up in both hands, nocks '
           'an arrow, draws the bowstring back to the cheek and releases it, then '
           'lowers the bow slightly; the wooden bow with its taut string is fully '
           'visible in both hands in every single frame and is never put away')
# Ilk iki tarifte yay yuruyusun ancak IKINCI yarisinda beliriyordu (dogu
# karelerinde bbox 21 -> 52 px) ve guneyden kenarindan gorundugu icin cubuga
# donuyordu. Cozum: yayi yana degil GOGUS HIZASINDA capraz tutturmak ve iki
# ucunun siluetten tastigini sart kosmak.
YAY_YUR = ('walks forward with a steady stride, legs alternating clearly, holding a '
           'large curved wooden hunting bow up across the chest with both hands, the '
           'bow turned so its two limbs clearly stick out past the left and right of '
           'the body; the bow is fully visible in every single frame and is never '
           'lowered to the side or hidden behind the body')
# Arkadan bakista ilk denemede yay hic gorunmedi - yalnizca sirttaki okluk
# vardi. Yayin govdenin iki yanindan TASMASI gerektigi acikca yazildi.
YAY_VUR_ARKA = ('seen from behind, raises a curved wooden hunting bow and draws the '
                'string back, the bow held up in front of the body so its two limbs '
                'stick out clearly to the left and right of the silhouette, then '
                'releases the arrow forward away from the camera')

# Yandan bakista tek elle ok atiyordu (fiziksel olarak imkansiz) ve yay yatay
# durdugu icin arbalete benziyordu. Yan gorunum icin duruş acikca yazildi:
# yay DIKEY, sol kol ileri uzanmis, sag el kirişte.
YAY_VUR_YAN = ('seen from the side, holds a tall curved wooden bow UPRIGHT and VERTICAL '
               'in the outstretched left hand, and pulls the bowstring straight back to '
               'the cheek with the right hand, so BOTH hands are clearly on the weapon - '
               'one on the bow grip, one on the string - then releases the arrow '
               'forward; the bow is never held horizontally and never fired one-handed')
# NOT: ayni "dikey yay" tarifi YURUYUSTE ters tepti - yay tamamen kayboldu
# (dogu karelerinde bbox 21..35, yani govde kadar). Yuruyus genel tarifte
# (gogus hizasinda capraz) kaliyor; dikey duruş yalnizca saldiri icin.
# Caprazda "seen from the side" ifadesi kafa karistiriyor; iki el sarti aynen
# kaliyor, bakis acisi tarifi cikariliyor.
YAY_VUR_IKI_EL = ('holds a tall curved wooden bow UPRIGHT and VERTICAL in the '
                  'outstretched left hand and pulls the bowstring straight back to the '
                  'cheek with the right hand, so BOTH hands are clearly on the weapon - '
                  'one on the bow grip, one on the string - then releases the arrow '
                  'forward; the bow is never held horizontally and never fired '
                  'one-handed')

RAUF_VUR = ('swings the sword down and across in a diagonal cut in front of the body, '
            'then pulls it back to a ready guard; the sword is a solid steel blade and '
            'stays gripped in the hand in every frame')

# Arkadan bakista "onunde asagi kes" tarifi kilici SIRTA savurttu: model
# kamerayi degil govdeyi referans aliyor. Kuzeyde yonu kameraya gore yazmak
# gerekiyor - "ileri, kameradan UZAGA".
KILIC_VUR_ARKA = ('seen from behind, raises the sword above the head and swings it '
                  'forward and away from the camera, the blade going over the head and '
                  'down in front of the body; the blade never swings back toward the '
                  'viewer or behind the back; the sword is a solid steel blade and '
                  'stays gripped in the hand in every frame')

# BASLANGIC KARESI. v3 karakterin donus karesinden basliyor ve elindeki silahi
# koruyor - kilicin her yonde cikmasinin sebebi bu. Yayli sette donus karesinde
# yay YOK, bu yuzden model onu her seferinde yeniden uydurmak zorunda kaliyor ve
# caprazlarda iki kez basaramadi (asagi-caprazda hic cizmedi, yukari-caprazda
# kafanin ustune koydu). Cozum: baslangic karesi olarak SALDIRI setinden yayin
# elde oldugu bir kare verilir; boylece yay kilic gibi "zaten elde" olur.
# (set, aksiyon, yon) -> (kaynak aksiyon, kaynak yon, kare no)
BASLANGIC = {('yay', 'Walk', 'south-east'): ('Attack', 'south-east', 2),
             ('yay', 'Walk', 'north-east'): ('Attack', 'north-east', 5),
             # Ana yonler de ayni yola cekildi: yay gogus hizasinda capraz
             # tutuluyordu, capraz yonlerde ise elde. Donerken durus degismesin.
             ('yay', 'Walk', 'south'): ('Attack', 'south', 2),
             ('yay', 'Walk', 'east'): ('Attack', 'east', 5),
             ('yay', 'Walk', 'north'): ('Attack', 'north', 5)}
YAY_YUR_HAZIR = ('walks forward with a steady stride, legs alternating clearly, while '
                 'keeping the wooden bow held up in both hands exactly as in the '
                 'starting pose, ready to shoot; the bow never leaves the hands and is '
                 'fully visible in every single frame')

# Yon bazli tarif ezmesi: (set, aksiyon, yon) -> tarif
OZEL = {('kilic', 'Attack', 'east'): KILIC_VUR_YAN,
        ('rauf', 'Attack', 'east'): KILIC_VUR_YAN,
        ('kilic', 'Attack', 'north'): KILIC_VUR_ARKA,
        ('rauf', 'Attack', 'north'): KILIC_VUR_ARKA,
        ('yay', 'Attack', 'north'): YAY_VUR_ARKA,
        ('yay', 'Attack', 'east'): YAY_VUR_YAN,
        # Caprazlar: asagi-sag kameraya donuk, yukari-sag sirti donuk.
        ('yay', 'Attack', 'south-east'): YAY_VUR_IKI_EL,
        ('yay', 'Attack', 'north-east'): YAY_VUR_ARKA,
        ('kilic', 'Attack', 'north-east'): KILIC_VUR_ARKA}

SETLER = {
    'kilic': ('pixellab/gezgin/id_kilic.txt', [('Walk', 8, KILIC_YUR), ('Attack', 6, KILIC_VUR)]),
    'yay':   ('pixellab/gezgin/id_yay.txt',   [('Walk', 8, YAY_YUR),   ('Attack', 6, YAY_VUR)]),
    'rauf':  ('pixellab/id_rauf.txt',         [('Attack', 6, RAUF_VUR)]),
}


def bekle(joblar, etiket):
    for i in range(240):
        d = [pxl.call(f'/background-jobs/{j}') for j in joblar]
        st = [x.get('status') for x in d]
        if i % 6 == 0:
            print(f'  {i*5:3d}sn {etiket} {st}', flush=True)
        if all(s in ('completed', 'succeeded', 'done', 'failed', 'error') for s in st):
            return d
        time.sleep(5)
    return d


def uret(setad, sadece_yon=None, sadece_aksiyon=None):
    id_yol, isler = SETLER[setad]
    cid = open(f'{ROOT}/{id_yol}').read().strip()
    ham = f'{ROOT}/pixellab/v3/{setad}'
    os.makedirs(ham, exist_ok=True)
    once = pxl.balance()[0]
    kuyruk = []
    for aksiyon, n, tarif in isler:
        if sadece_aksiyon and aksiyon != sadece_aksiyon:
            continue
        # Ayni tarif her yonde ayni durmuyor; ozel tarifi olan yonler ayri basilir.
        gruplar = {}
        for y in (sadece_yon or YONLER):
            if (setad, aksiyon, y) in BASLANGIC:
                # custom_start_frame tek yon istiyor, bu yuzden ayri basilir.
                ka, ky, ki = BASLANGIC[(setad, aksiyon, y)]
                ham64 = base64.b64encode(
                    open(f'{ham}/{ka}_{ky}_{ki:02d}.png', 'rb').read()).decode()
                r = pxl.call('/characters/animations', {
                    'character_id': cid, 'mode': 'v3', 'animation_name': f'{setad}-{aksiyon}',
                    'action_description': YAY_YUR_HAZIR, 'directions': [y],
                    'custom_start_frame': {'type': 'base64', 'base64': ham64},
                    'frame_count': n, 'keep_first_frame': True, 'seed': 21})
                kuyruk.append((aksiyon, [j for j in (r.get('background_job_ids') or []) if j]))
                print(f'{setad}/{aksiyon} [{y}] baslangic={ka}_{ky}_{ki:02d}: '
                      f'{len(kuyruk[-1][1])} is kuyrukta')
                continue
            gruplar.setdefault(OZEL.get((setad, aksiyon, y), tarif), []).append(y)
        for t, yonler in gruplar.items():
            r = pxl.call('/characters/animations', {
                'character_id': cid, 'mode': 'v3', 'animation_name': f'{setad}-{aksiyon}',
                'action_description': t, 'directions': yonler,
                'frame_count': n, 'keep_first_frame': True, 'seed': 21})
            kuyruk.append((aksiyon, [j for j in (r.get('background_job_ids') or []) if j]))
            print(f'{setad}/{aksiyon} {yonler}: {len(kuyruk[-1][1])} is kuyrukta')
    for aksiyon, joblar in kuyruk:
        for d in bekle(joblar, f'{setad}/{aksiyon}'):
            son = d.get('last_response') or {}
            yon = son.get('direction')
            if d.get('status') != 'completed' or not yon:
                print(f'  !! {setad}/{aksiyon} {yon or "?"} basarisiz: {d.get("status")}')
                continue
            for i, g in enumerate(son.get('images') or []):
                Image.open(io.BytesIO(base64.b64decode(g['base64'].split(',')[-1]))) \
                     .convert('RGBA').save(f'{ham}/{aksiyon}_{yon}_{i:02d}.png')
            print(f'  {setad}/{aksiyon} {yon}: {len(son.get("images") or [])} kare')
    time.sleep(4)
    print(f'{setad} bitti. maliyet={once-pxl.balance()[0]:.0f} uretim')


if __name__ == '__main__':
    # python3 scripts/v3_anim.py kilic            -> tum set
    # python3 scripts/v3_anim.py kilic:Attack:east -> tek yon yeniden
    for arg in sys.argv[1:]:
        p = arg.split(':')
        uret(p[0], sadece_yon=p[2].split(',') if len(p) > 2 else None,
             sadece_aksiyon=p[1] if len(p) > 1 else None)
