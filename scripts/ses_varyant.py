"""Bir efektin VARYASYONLARINI oyuna hazirlar: kirp, esit yukseklige getir, mp3.

Neden ayri adim: ayni efektin dort ayri kaydi farkli seviyelerde geliyor
(olculdu: kilic savurmalarinda ortalama -22.8 ile -25.4 arasi). Rastgele
secilince biri digerinden gozle gorulur yuksek duyulursa varyasyon "cesitlilik"
degil "hata" gibi algilaniyor. Her dosyaya AYRI kazanc verilip ayni ortalamaya
oturtuluyor.

Kirpma: kuyruk uzun ama SESSIZ - kilic savurmasinda govde ilk ~0.2 sn, 0.4'te
seviye -49 dB'e dusuyor. Uzun kuyruk oyunda birbirine binip camur yapiyor,
bu yuzden kesilip kisa bir sonumle bitiriliyor.

NOT: loudnorm (EBU R128) bu kisalikta CALISMIYOR - integrated olcum 3 sn'nin
altini kapiyla eliyor. Seviye `volumedetect` ortalamasindan hesaplaniyor.

kullanim: python3 scripts/ses_varyant.py <hedef_ad> <sure> <hedef_dB> <girdi...>
ornek:    python3 scripts/ses_varyant.py savurma 0.6 -30 "swish/Sword Swish "*.wav
cikti:    public/assets/audio/<hedef_ad>N.mp3
"""
import os, re, subprocess, sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
HEDEF = f'{ROOT}/public/assets/audio'
SONUM = 0.08          # sondaki yumusatma (sn) - kesme klik yapmasin


def olc(yol, ne='mean_volume'):
    p = subprocess.run(['ffmpeg', '-hide_banner', '-nostats', '-i', yol,
                        '-af', 'volumedetect', '-f', 'null', '-'],
                       capture_output=True, text=True)
    m = re.search(rf'{ne}:\s*(-?[\d.]+) dB', p.stderr)
    return float(m.group(1)) if m else None


def kur(ad, sure, hedef_db, girdiler):
    os.makedirs(HEDEF, exist_ok=True)
    gecici = f'/tmp/_varyant_{os.getpid()}.wav'
    for i, g in enumerate(girdiler, 1):
        kirp = (f'silenceremove=start_periods=1:start_threshold=-50dB:start_silence=0.01,'
                f'atrim=0:{sure},afade=t=out:st={sure - SONUM}:d={SONUM}')
        subprocess.run(['ffmpeg', '-hide_banner', '-loglevel', 'error', '-y', '-i', g,
                        '-af', kirp, '-ac', '1', '-ar', '44100', gecici], check=True)
        fark = hedef_db - olc(gecici)          # her dosyaya KENDI telafisi
        cikti = f'{HEDEF}/{ad}{i}.mp3'
        subprocess.run(['ffmpeg', '-hide_banner', '-loglevel', 'error', '-y', '-i', gecici,
                        '-af', f'volume={fark:.2f}dB', '-ac', '1', '-ar', '44100',
                        '-b:a', '128k', cikti], check=True)
        print(f'  {ad}{i}.mp3  telafi {fark:+.1f} dB  -> ort {olc(cikti):.1f} / tepe {olc(cikti, "max_volume"):.1f} dB')
    os.path.exists(gecici) and os.remove(gecici)


if __name__ == '__main__':
    kur(sys.argv[1], float(sys.argv[2]), float(sys.argv[3]), sys.argv[4:])
