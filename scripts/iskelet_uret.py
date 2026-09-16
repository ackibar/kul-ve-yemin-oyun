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
         'no skin and no flesh at all, bare shoulders and bare spine, '
         'a torn grey loincloth around its hips, '
         'a short rusted iron sword in one bony hand, hunched forward, '
         'muted ash-grey palette, soot-stained, single dark outline')
# TARIHCE - bu modelde OLUMSUZ talimat ise yaramiyor, cozum hep tarifin
# kendi POZITIF ifadesini degistirmek oldu:
#  v1 778b71aa: "clawing its way up out of the ground" -> ayaklarin altinda
#     toprak/cim yamasi. "NO ground/soil/grass" eklemek (2 uretim) ISE
#     YARAMADI, ustelik tarifte yasakli SIRT CANTASI'ni getirdi (3feda690).
#  v2 8bacd212: "out of the ground" silindi -> zemin TAMAMEN gitti. Ama
#     "tattered rags HANGING OFF the bones" yan/arka gorunumde sirt cantasi
#     gibi bir bohca olarak cizildi; "NO backpack" satiri bunu engellemedi.
#  v3 (bu): asilan pacavralar yerine "bare shoulders and bare spine" +
#     kalcada "torn grey loincloth". Sirta bir sey asilmasini ISTEYEN ifade
#     kalmadi; NO-listesi de kaldirildi (fayda yok, zarari olcüldu).
# Zemin temizligi yine de scripts/iskelet_zemin_sil.py ile yapiliyor.

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
