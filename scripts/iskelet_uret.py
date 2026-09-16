"""Iskelet (kind 11): terk edilmis koridorda YERDEN CIKAN kalabalik.

Tek vurusta olen, kalabalik bir dusman. Akis dusman_yeni_uret.py ile ayni:
  bu dosya (karakter, 2 uretim)
  -> npc_sheet_kur.py iskelet enemies/11   (donus karesi tabani)
  -> v3_anim.py iskelet                    (Walk/Attack, 1 uretim/yon)
  -> v3_kur.py iskelet

kullanim: python3 scripts/iskelet_uret.py
"""
import os, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import pxl
from pxl_state import wait

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
# ORTAK tarif dusman_yeni_uret.py'dekiyle ayni cizgide: kul grisi palet, tek
# koyu kontur. "Human" YAZILMIYOR - mannequin govdesi zaten insan siluetinde;
# burada istenen etsiz bir iskelet, "human" deyince model et/deri ekliyor.
# "clawing its way up out of the ground" ifadesi KALDIRILDI: zemin yamasinin
# asil sebebi buydu - model "out of the ground" deyince ayaklarin altina
# toprak/cim ciziyordu. Yerden cikma zaten MOTORDA yapiliyor (gomulu liste +
# cikis animasyonu), gorselin bunu anlatmasina gerek yok.
TARIF = ('a bare skeleton warrior standing hunched and ready to fight, bleached '
         'bone-white skull and ribcage clearly visible with dark empty eye sockets, '
         'no skin and no flesh at all, tattered grey rags hanging off the bones, '
         'a short rusted iron sword in one bony hand, hunched forward, '
         'muted ash-grey palette, soot-stained, single dark outline, '
         'NO backpack, NO satchel, NO modern clothing')
# NOT: model ayaklarin altina bir TOPRAK/CIM yamasi ciziyor. Tarife
# "NO ground, NO soil, NO grass, NO base..." eklemek DENENDI (2 uretim) ve
# ISE YARAMADI: zemin yine geldi, ustune bir de tarifte ACIKCA yasaklanmis
# olan SIRT CANTASI eklendi. Yani bu modelde olumsuz talimatlar guvenilir
# degil. Zemin artik uretimden sonra scripts/iskelet_zemin_sil.py ile
# kesiliyor. Iyi karakterin id'si: 778b71aa (ikinci/cantali: 3feda690).

if __name__ == '__main__':
    b0 = pxl.balance()[0]
    r = pxl.call('/create-character-v3', {
        'description': TARIF, 'image_size': {'width': 64, 'height': 64},
        'view': 'low top-down', 'template_id': 'mannequin', 'no_background': True,
        'outline': 'single color black outline', 'detail': 'medium detail', 'seed': 111})
    wait([r['background_job_id']], 'iskelet')
    open(f'{ROOT}/_arsiv/uretim/pixellab/id_iskelet.txt', 'w').write(r['character_id'])
    print(f'  iskelet karakter hazir id={r["character_id"][:8]}', flush=True)
    print(f'bakiye {b0:.0f} -> {pxl.balance()[0]:.0f} (fark {b0-pxl.balance()[0]:.0f} uretim)')
