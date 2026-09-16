"""Kuru bir ses ornegine TAS KORIDOR yankisi ekler.

Neden burada uretiliyor: elimizde hazir bir impuls yaniti (IR) yok ve
ffmpeg'in `aecho`su gercek yanki degil, tek bir slapback. `afir` ise IR ile
gercek konvolusyon yapiyor - IR'yi burada sentezleyip ona veriyoruz.

IR tarifi (tas koridor):
  * DOGRUDAN ses YOK - kuru/yas dengesi ffmpeg tarafinda ayarlaniyor,
    IR'ye direkt darbe konursa kuru ses iki kez toplanir.
  * Erken yansimalar: duvar/tavan carpmalari, ilk ~40 ms icinde birkac ayrik
    vurus. Odanin BOYUTUNU bunlar duyuruyor.
  * Yayilan kuyruk: ustel sonumlu gurultu; tek kutuplu alcak geciren ile
    koyulastiriliyor (tas parlak degil, ogut gibi).

kullanim: python3 scripts/ses_oda.py <girdi.wav> <cikti.wav> [yas]
"""
import math, os, random, struct, subprocess, sys, tempfile, wave

SR = 44100
# Kuyrugun 60 dB sonme suresi (sn). 0.55 DENENDI ve kisa kaldi: kuru ses 0.61
# sn'de bitiyor, 0.7 sn'de kuyruk -68 dB'e dusuyordu, yani duyulmuyordu bile.
# 0.85 ile kuyruk sesin bitiminden sonra ~0.4 sn daha yasiyor - tas koridor.
RT60 = 0.85
ERKEN = [(0.011, .42), (0.019, .31), (0.027, .24), (0.038, .17), (0.049, .12)]
LP = 0.42            # tek kutuplu alcak geciren katsayisi (kucuk = daha koyu)


def ir_yaz(yol, tohum=7):
    rnd = random.Random(tohum)
    n = int(RT60 * SR)
    tau = RT60 / 6.9078                     # exp(-t/tau) -> -60 dB
    ork = [0.0] * n
    for t, g in ERKEN:
        i = int(t * SR)
        if i < n:
            ork[i] += g
    onceki = 0.0
    for i in range(n):
        g = math.exp(-(i / SR) / tau)
        ham = (rnd.random() * 2 - 1) * g * .5
        onceki = onceki + LP * (ham - onceki)   # koyulastir
        ork[i] += onceki
    tepe = max(abs(v) for v in ork) or 1.0
    with wave.open(yol, 'wb') as w:
        w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR)
        w.writeframes(b''.join(struct.pack('<h', int(v / tepe * 32000)) for v in ork))
    # Dosya TEPEYE gore olcekleniyor (int16 tasmasin), ama konvolusyonun getirdigi
    # kazanc ENERJIYE bagli. Telafi carpani doneriyor ki 'yas' gercek bir
    # kuru/yas orani olsun, IR'nin boyuna gore kaymasin.
    return math.sqrt(sum((v / tepe) ** 2 for v in ork)) or 1.0


if __name__ == '__main__':
    girdi, cikti = sys.argv[1], sys.argv[2]
    yas = float(sys.argv[3]) if len(sys.argv) > 3 else 0.42
    ir = os.path.join(tempfile.gettempdir(), 'ir_koridor.wav')
    enerji = ir_yaz(ir)
    # KURU/YAS ayri dallarda karistiriliyor. afir'in kendi dry/wet'i denendi
    # ve cikti ~44 dB'e dustu (olculdu: kuru -21, afir dry=1 ciktisi -65) -
    # gtype normalizasyonu tum yola uygulaniyor. Acik amix hem olculebilir
    # hem de yas oranini dogrudan veriyor.
    # apad SART: afir ciktiyi girdinin BOYUNDA kesiyor, kuyruk tamamen
    # uçuyordu (olculdu: cikti girdiyle ayni 0.612 sn).
    # irnorm KAPALI (-1) olmali: acik oldugunda afir IR'yi kendi normalize edip
    # yas dali ~54 dB'e dusuyordu (olculdu: irnorm=1 -> -61.9 dB, irnorm=-1 ->
    # -7.9 dB). Seviye artik bizim telafi carpanimizla belirleniyor.
    zincir = (f'[0:a]apad=pad_dur={RT60},asplit=2[d][w];'
              f'[w][1:a]afir=gtype=none:irnorm=-1,volume={1/enerji:.6f}[wet];'
              f"[d][wet]amix=inputs=2:weights='1 {yas}':normalize=0")
    subprocess.run(['ffmpeg', '-hide_banner', '-loglevel', 'error', '-y',
                    '-i', girdi, '-i', ir, '-filter_complex', zincir,
                    cikti], check=True)
    print(f'{cikti} hazir (yas={yas}, RT60={RT60}s)')
