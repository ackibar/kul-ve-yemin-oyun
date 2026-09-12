"""Nil, Ayaz ve Selvi icin karakter sprite'lari.

Uc karakter de baska NPC'lerin sheet'ini odunc aliyordu (Selvi oyuncunun,
Nil kucultulmus Mirna, Ayaz kucultulmus Tuhn). Herkes kendi gorunumunu alsin.
Maliyet: karakter basi 2 (v3) + 3 (yurume sablonu, uc yon) = 5, toplam 15.
"""
import os, sys
sys.path.insert(0, os.path.dirname(__file__))
import pxl
from pxl_state import wait

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ORTAK = ('muted ash-grey palette, soot-stained, single dark outline, '
         'NO backpack, NO satchel, NO straps across the chest, NO modern clothing, human')
# Kafa orani: ilk turda Lin ve Uslu'nun kafasi govdeye gore cok buyuk cikti
# (kullanici: "anime kizi gibi"). Mannequin sablonu kucuk figurlerde kafayi
# buyutuyor; oran acikca yazilmali.
ORAN = (', realistic body proportions with a SMALL head, the head is small compared to the '
        'shoulders, NOT chibi, NOT big-headed, NOT anime, narrow face')

KISI = {
    # 3. tur: 2. tur tamamen griydi (olculdu: doygunluk 0.025, Mirna 0.143).
    # "muted ash-grey" tek basina yazilinca model hic renk koymuyor; vurgu
    # ACIKCA istenmeli. Lin atesi sondurmeyen cocuk - vurgusu koz turuncusu.
    'nil3': ('a thin eight year old girl, small and slight, a plain patched woolen dress '
             'over rough leggings, a FADED EMBER-ORANGE knitted shawl tied across her '
             'shoulders - the shawl is the ONLY colour on her and everything else stays '
             'ash-grey, hair pulled back in a tight messy braid, soot smudges on her face, '
             'holding a short charred stick like a tally marker, stubborn set jaw, standing '
             'very straight' + ORAN + ', ' + ORTAK, 151),
    'ayaz': ('a thin fourteen year old boy, too-large hand-me-down coat with frayed '
             'cuffs hanging past his hands, cloth wrapped around his shins, tousled '
             'hair, hollow tired eyes, a dented metal canteen hanging from his belt, '
             'shoulders hunched from waiting, ' + ORTAK, 43),
    # Uslu: kulun icinden donen deli. Herkes cok ciddi; o degil. Dolasir,
    # o yuzden yurume sablonu da gerekiyor (2 + 3 = 5 uretim).
    # 2. tur: ilki "orman kackini" gibi cikti (kulaginda kuru bitki, kabarik sac
    # kutlesi kafayi buyutuyordu). Bu sefer SIGINAK delisi: sac dagnik ama yatik,
    # kiyafet sokak kiyafeti, bitki yok.
    # 3. tur: iki kolu iki yana acik duruş karikaturlestiriyordu. Artik sakin
    # duruyor, tek eli yaninda kucuk bir SELAM veriyor; tuhafligi durusunda
    # degil yuzunde kalsin.
    'uslu3': ('a scrawny man in his forties, gaunt narrow face with sunken cheeks and '
              'restless wide eyes, a crooked half-smile, unkempt greasy hair full of ash in '
              'flat tangled strands close to the skull, a torn city coat over a ragged shirt '
              'with one sleeve missing, bare feet, standing calmly upright with one hand '
              'raised beside his shoulder in a small friendly greeting wave and the other arm '
              'hanging loose at his side; NO leaves, NO plants, NO twigs, NOT a forest hermit, '
              'NOT a druid, arms are NOT flung out wide' + ORAN + ', ' + ORTAK, 193),
    'selvi': ('a hard-faced woman in her late thirties, wrapped in many mismatched '
              'layers of cloth and blankets against cold, a scarf covering her neck, '
              'weathered wind-burned face, cracked lips, arms folded tight, standing '
              'guard-like and unmoving, one muted rust-red rag among the grey, ' + ORTAK, 47),
}


def uret(ad, tarif, seed):
    r = pxl.call('/create-character-v3', {
        'description': tarif, 'image_size': {'width': 64, 'height': 64},
        'view': 'low top-down', 'template_id': 'mannequin', 'no_background': True,
        'outline': 'single color black outline', 'detail': 'medium detail', 'seed': seed})
    wait([r['background_job_id']], ad)
    os.makedirs(f'{ROOT}/_arsiv/uretim/pixellab', exist_ok=True)
    open(f'{ROOT}/_arsiv/uretim/pixellab/id_{ad}.txt', 'w').write(r['character_id'])
    print(f'  {ad:6s} karakter hazir id={r["character_id"][:8]}', flush=True)


def animasyon(ad):
    cid = open(f'{ROOT}/_arsiv/uretim/pixellab/id_{ad}.txt').read().strip()
    rr = pxl.call('/characters/animations', {
        'character_id': cid, 'mode': 'template', 'template_animation_id': 'walking',
        'directions': ['south', 'north', 'east'], 'animation_name': 'Walk'})
    wait(rr.get('background_job_ids', []), f'{ad} yurume')
    print(f'  {ad:6s} yurume hazir', flush=True)


if __name__ == '__main__':
    b0 = pxl.balance()[0]
    hedef = sys.argv[1:] or list(KISI)
    if '--animasyon' in hedef:
        for ad in [x for x in hedef if x in KISI] or list(KISI):
            animasyon(ad)
    else:
        for ad in hedef:
            uret(ad, *KISI[ad])
    print(f'bakiye {b0:.0f} -> {pxl.balance()[0]:.0f}')
