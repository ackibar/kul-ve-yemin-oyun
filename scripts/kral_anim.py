"""Kralin oturma animasyonlari: hafif bas sallama + taci cikarip geri takma.

Kral hic konusmuyor; tek ifadesi bu iki hareket. Duz gorselden
`/animate-with-text-v3` ile uretiliyor (karakter API'si oturan figuru
desteklemiyor). Sandalye ve govde her karede YERINDE kalmali - yoksa
figur kayiyor ve capa sasiyor; tarifte acikca yaziliyor.

kullanim: python3 scripts/kral_anim.py [idle|tac]
"""
import base64, io, os, sys, time
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import pxl
from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
HAM = f'{ROOT}/_arsiv/uretim/generated/kral'
KAYNAK = f'{HAM}/kral_sandalye_0.png'
SABIT = ('; the broken wooden chair and the whole body stay in exactly the same place in '
         'every frame, nothing slides sideways, the feet never move, same character, same '
         'colours, same muted ash-grey palette')
ISLER = {
    'idle': (6, 'sitting still on the chair, the head dips slowly forward once and lifts '
                'back up, a small tired nod, the shoulders rise and fall slightly with '
                'breathing, the hands stay resting on the knees'),
    'tac':  (14, 'slowly raises one hand, lifts the iron crown off his head, holds it in '
                 'front of his chest and looks down at it for a moment, then lifts it back '
                 'up and sets it on his head again and lowers the hand to his knee'),
}


def uret(ad):
    n, tarif = ISLER[ad]
    ham64 = base64.b64encode(open(KAYNAK, 'rb').read()).decode()
    once = pxl.balance()[0]
    r = pxl.call('/animate-with-text-v3', {
        'first_frame': {'type': 'base64', 'base64': ham64},
        'action': tarif + SABIT, 'frame_count': n,
        'no_background': True, 'seed': 41})
    job = r.get('background_job_id') or (r.get('background_job_ids') or [None])[0]
    print(f'kral/{ad}: is {job}', flush=True)
    for i in range(180):
        d = pxl.call(f'/background-jobs/{job}')
        if d.get('status') in ('completed', 'failed', 'error'):
            break
        if i % 6 == 0:
            print(f'  {i*5:3d}sn {d.get("status")}', flush=True)
        time.sleep(5)
    im = (d.get('last_response') or {}).get('images') or []
    for i, g in enumerate(im):
        Image.open(io.BytesIO(base64.b64decode(g['base64'].split(',')[-1]))) \
             .convert('RGBA').save(f'{HAM}/anim_{ad}_{i:02d}.png')
    time.sleep(4)
    print(f'  kral/{ad}: {len(im)} kare ({d.get("status")}) maliyet={once-pxl.balance()[0]:.0f}')


if __name__ == '__main__':
    for a in (sys.argv[1:] or list(ISLER)):
        uret(a)
