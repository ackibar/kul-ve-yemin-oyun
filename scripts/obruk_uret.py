"""Obruk ve iki parali askerinin karakter sprite'lari.

Ucu de SABIT duran NPC (world.ts `sabit:true`), yani yurume animasyonu
gerekmiyor: npc_sheet_kur.py yurume yoksa durus karesini cogaltiyor - zaten
oyundaki butun NPC'lerin Idle'i boyle. Maliyet bu yuzden karakter basi
yalnizca 2 uretim (v3 donus sayfasi), toplam 6.

kullanim: python3 scripts/obruk_uret.py [obruk|karga|cakal ...]
"""
import os, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import pxl
from pxl_state import wait

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ORTAK = ('muted ash-grey palette, soot-stained, single dark outline, '
         'NO backpack, NO satchel, NO straps across the chest, NO modern clothing, human')

KISI = {
    # Soylu: zenginligi kul rengi dunyada TEK vurgu olarak okunmali, yoksa
    # sahneden kopuyor - solmus bordo ve matlasmis altin disinda renk yok.
    'obruk': ('a very fat obese nobleman, huge round belly straining a long fur-collared '
              'coat, heavy jowls and a double chin, thin greying hair combed over a bald '
              'crown, small narrowed suspicious eyes, thick rings on short fat fingers, '
              'a tarnished gold chain across the belly, short legs, standing with both '
              'hands folded on top of his belly, faded burgundy coat as the only colour, '
              + ORTAK, 61),
    # 1. deneme "sisman" degil "genis omuzlu sakalli adam" verdi: mannequin
    # govdesi standart insan siluetine cekiyor. Ise yarayan tarif GOBEGI
    # omuzlardan GENIS ilan etmek, kollari gobegin ustune koymak ve elindeki
    # nesneyi acikca yasaklamak.
    'obruk2': ('an extremely obese old merchant lord, enormous round belly bulging far '
               'wider than his shoulders, the belly is by far the widest part of the body, '
               'very short thick arms resting on top of the belly, small head sunk into a '
               'fat neck, heavy double chin, clean shaven with NO beard, thin combed-over '
               'hair, a fur-collared faded burgundy robe stretched tight over the stomach, '
               'a tarnished gold chain lying on the belly, short stubby legs, standing '
               'still, hands empty, holding nothing, no weapon, no staff, '
               + ORTAK, 71),
    'karga': ('a tall lean mercenary guard, long dark coat over patched leather armour, '
              'black cloth wrapped across the lower face, a short spear held upright at '
              'his side, a single dark feather tied at the shoulder, sunken watchful '
              'eyes, standing at ease on guard, ' + ORTAK, 62),
    'cakal': ('a short stocky mercenary guard, very broad shoulders and thick neck, '
              'dented iron chestplate over grey rags, shaved scarred head, a heavy '
              'cleaver hanging from the belt, arms crossed tight over the chest, '
              'expressionless silent face, ' + ORTAK, 63),
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


if __name__ == '__main__':
    b0 = pxl.balance()[0]
    for ad in (sys.argv[1:] or list(KISI)):
        uret(ad, *KISI[ad])
    print(f'bakiye {b0:.0f} -> {pxl.balance()[0]:.0f}')
