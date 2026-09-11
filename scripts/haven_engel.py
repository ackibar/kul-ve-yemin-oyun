"""Sigginak arka planindaki boyali mobilyanin carpisma kutulari.

Uretilen gorsel oyunun carpisma izgarasini bilmiyor; bu yuzden boyali
mobilyanin uzerinden yurunebiliyordu. Otomatik tespit denendi ve YETERSIZ
kaldi (zemin-mobilya renk uzakligi surekli dagiliyor, net esik yok), bu
yuzden kutular izgarali haritadan elle okundu.

Kutular karo biriminde: (x1, y1, x2, y2) - x2/y2 haric.
"""
# mobilya: uzerinden gecilemez
ENGELLER = [
    # --- sol ust ---
    (4, 7, 6, 10),    # komodin + sehpa
    (5, 8, 10, 11),   # buyuk yatak (turuncu ortu)
    (10, 7, 12, 9),   # ahsap dolap
    # --- sol alt ---
    (4, 16, 6, 18),   # sandik
    (5, 17, 10, 20),  # yatak
    (4, 18, 6, 22),   # konsol / cekmece
    (5, 20, 10, 23),  # ikinci yatak
    (10, 20, 12, 23), # fenerli sehpa
    # --- sag ust ---
    (17, 7, 19, 10),  # kasalar
    (19, 6, 25, 10),  # buyuk calisma tezgahi
    (24, 8, 26, 11),  # fici
    # --- sag ---
    (24, 10, 26, 12), # raf
    (22, 11, 25, 14), # sandik + fici
    (23, 17, 26, 21), # yatak
    (18, 21, 22, 23), # tezgah / bank
    (22, 20, 26, 23), # ficilar
    # --- ates cukurlari (tas halka) ---
    (11, 8, 14, 11),
    (19, 10, 22, 12),
    (18, 17, 21, 20),
]

# boyali ateslerin merkezleri (karo biriminde, animasyonlu sprite buraya oturacak)
ATESLER = [(12.2, 9.5), (20.1, 11.0), (19.7, 18.5)]  # gorselden olculdu
