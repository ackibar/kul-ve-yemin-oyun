"""Kul ve Yemin - Nano Banana Pro ile asset yeniden stillendirme.

Mevcut her 32x32 kareyi POZ referansi, kullanicinin verdigi gorseli STIL
referansi olarak besler. Boylece animasyon zamanlamasi, ayak hizasi ve
yon tutarliligi korunur; yalnizca gorunum degisir.

Uretilen hicbir sey public/assets altina YAZILMAZ. Cikti generated/ altinda
onay bekler; uygulama ayri bir adimdir (apply_assets.py).
"""
import argparse, base64, io, json, os, sys, threading, time, urllib.error, urllib.request
from concurrent.futures import ThreadPoolExecutor

sys.path.insert(0, os.path.dirname(__file__))
from PIL import Image
import pixelize as P

MODEL = 'gemini-3-pro-image'
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CHROMA = '#0000FF'          # palete Lab olarak en uzak renk (mesafe 99.4)
ACTIONS = ['Idle', 'Walk', 'Attack', 'Hurt', 'Death']
# Yon tanimlari dogrudan prompt'a giriyor; model 32x32 bloklu poz
# referansindan sirt/on ayrimini kendi basina cikaramadigi icin burada
# acikca ve olumsuzlamayla birlikte tarif ediliyor.
DIRS = {
    'D': ('FRONT VIEW, walking toward the viewer. The face is fully visible: '
          'both eyes and the front of the body face the camera.'),
    'U': ('BACK VIEW, walking away from the viewer. The character\'s BACK is turned '
          'to the camera. The face is COMPLETELY HIDDEN - no eyes, no facial features, '
          'no front of the torso are visible. You see the back of the head, the back '
          'of the hat and the backpack.'),
    'S': ('PURE SIDE VIEW (profile), facing RIGHT. Only ONE eye is visible. '
          'The body is seen edge-on from the side, NOT from the front.'),
}
_print_lock = threading.Lock()


def key():
    for line in open(os.path.join(ROOT, '.env.local')):
        if line.startswith('GEMINI_API_KEY='):
            return line.split('=', 1)[1].strip()
    raise SystemExit('.env.local icinde GEMINI_API_KEY yok')


def b64(img):
    buf = io.BytesIO()
    img.save(buf, 'PNG')
    return base64.b64encode(buf.getvalue()).decode()


def prompt_canon(direction, action):
    """1. ASAMA: stil referansindan tek kanonik karakter karesi."""
    return f"""IMAGE 1 is a STYLE REFERENCE. IMAGE 2 is a POSE REFERENCE: one frame of a
"{action}" animation for a top-down 2D game character.\n\nCAMERA ANGLE - this is mandatory: {DIRS[direction]}

Draw ONE definitive character design: take the visual style, costume, colour palette and
character concept from IMAGE 1, and put that character into the exact pose, silhouette,
proportions and canvas position of IMAGE 2.

This single image will become the master reference for an entire animation set, so the design
must be clear, distinctive and unambiguous - readable hat/hair, readable costume, readable
weapon.

ABSOLUTE REQUIREMENTS:
1. Match IMAGE 2's pose, silhouette, proportions, facing direction and canvas position exactly.
2. Background: a single flat uniform {CHROMA} (pure blue). No gradient, shadow, ground plane,
   glow or outline bleeding into the background.
3. Chunky, readable pixel art. No anti-aliasing, no blur, no painterly gradients. The result is
   downsampled to 32x32, so keep shapes bold and large.
4. One single character, no props, text, frames, borders or extra figures."""


def prompt_frame(direction, action, frame_i, frame_n):
    """2. ASAMA: onayli kanonik kareye kilitli kare uretimi."""
    return f"""IMAGE 1 is the DEFINITIVE CHARACTER DESIGN. IMAGE 2 is a POSE REFERENCE:
frame {frame_i + 1} of {frame_n} of a "{action}" animation.\n\nCAMERA ANGLE - this is mandatory: {DIRS[direction]}

Your task is to draw THE CHARACTER FROM IMAGE 1 in THE POSE FROM IMAGE 2.

IDENTITY - copy from IMAGE 1 with zero deviation:
- Exactly the same headwear shape, hair colour and hairstyle
- Exactly the same costume, its cut and every colour
- Exactly the same body proportions and build
- Exactly the same weapon or equipment
This must be recognisably the SAME individual character as IMAGE 1, not a similar one.
Do not redesign, do not reinterpret, do not add or remove any detail.

POSE - copy from IMAGE 2 with zero deviation:
- The same limb positions, body angle and silhouette
- The same facing direction. Do not mirror.
- The same size and the same position on the canvas. Do not rescale or re-centre.

ABSOLUTE REQUIREMENTS:
1. Background: a single flat uniform {CHROMA} (pure blue). No gradient, shadow, ground plane,
   glow or outline bleeding into the background.
2. Chunky, readable pixel art. No anti-aliasing, no blur, no painterly gradients. The result is
   downsampled to 32x32, so keep shapes bold and large.
3. One single character, no props, text, frames, borders or extra figures.
4. Keep the art style, line weight and shading logic identical to IMAGE 1."""


def pose_image(ref_frame, scale=12, canvas=1024, bg=(245, 245, 245)):
    """Poz referansini OKUNAKLI olcekte hazirlar.

    32x32'yi dogrudan 1024'e cikarmak her pikseli 32x32'lik bir bloga
    cevirir ve model figuru okuyamaz; yon talimatina uyar ama poza uymaz.
    12x buyutup duz zemine ortalamak sprite'i taninabilir kiliyor.
    """
    sp = ref_frame.convert('RGBA').resize(
        (32 * scale, 32 * scale), Image.NEAREST)
    out = Image.new('RGB', (canvas, canvas), bg)
    out.paste(sp, ((canvas - sp.width) // 2, (canvas - sp.height) // 2), sp)
    return out


def generate(ref_b64, ref_frame, direction, action, i, n, api_key, canon=True, tries=4):
    pose = pose_image(ref_frame)
    body = {
        'contents': [{'parts': [
            {'inlineData': {'mimeType': 'image/png', 'data': ref_b64}},
            {'inlineData': {'mimeType': 'image/png', 'data': b64(pose)}},
            {'text': (prompt_frame(direction, action, i, n) if canon
                      else prompt_canon(direction, action))},
        ]}],
        'generationConfig': {'responseModalities': ['IMAGE'],
                             'imageConfig': {'imageSize': '1K', 'aspectRatio': '1:1'}},
    }
    url = (f'https://generativelanguage.googleapis.com/v1beta/models/'
           f'{MODEL}:generateContent?key={api_key}')
    for attempt in range(tries):
        try:
            req = urllib.request.Request(
                url, data=json.dumps(body).encode(),
                headers={'Content-Type': 'application/json'})
            with urllib.request.urlopen(req, timeout=180) as r:
                res = json.load(r)
            for cand in res.get('candidates', []):
                for part in cand.get('content', {}).get('parts', []):
                    if 'inlineData' in part:
                        return Image.open(io.BytesIO(
                            base64.b64decode(part['inlineData']['data']))).convert('RGBA')
            raise RuntimeError('yanitta gorsel yok: ' + json.dumps(res)[:300])
        except Exception as e:
            if attempt == tries - 1:
                raise
            time.sleep(2 ** attempt * 2)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--style', help='1. asama: senin referans stil gorselin')
    ap.add_argument('--canon', help='2. asama: ONAYLANMIS kanonik kare')
    ap.add_argument('--make-canon', action='store_true',
                    help='sadece kanonik kareyi uret (D_Idle kare0) ve onaya sun')
    ap.add_argument('--actor', default='characters/1')
    ap.add_argument('--sheets', default='', help='virgullu liste, bos=hepsi')
    ap.add_argument('--workers', type=int, default=4)
    a = ap.parse_args()

    api_key = key()
    if a.make_canon:
        if not a.style:
            raise SystemExit('--make-canon icin --style gerekli')
        ref_b64, use_canon = b64(Image.open(a.style).convert('RGB')), False
    else:
        if not a.canon:
            raise SystemExit('once --make-canon ile kanonik kareleri uretip onaylat, '
                             'sonra --canon <kanonik_klasor> ile devam et')
        # Yon basina kanonik kare: kanonik ile hedef poz arasindaki fark
        # ne kadar kucukse kimlik kaymasi o kadar az olur.
        ref_b64, use_canon = {}, True
        for d in DIRS:
            fp = os.path.join(a.canon, f'{d}.png')
            if not os.path.exists(fp):
                raise SystemExit(f'kanonik kare eksik: {fp}')
            ref_b64[d] = b64(Image.open(fp).convert('RGB'))
    out = os.path.join(ROOT, 'generated', a.actor.replace('/', '_'))
    for sub in ('raw', 'frames', 'sheets', 'preview'):
        os.makedirs(os.path.join(out, sub), exist_ok=True)

    names = ([f'{d}_Idle' for d in DIRS] if a.make_canon else
             ([s.strip() for s in a.sheets.split(',') if s.strip()]
              or [f'{d}_{act}' for d in DIRS for act in ACTIONS]))

    jobs = []
    for name in names:
        d, action = name.split('_')
        src = os.path.join(ROOT, 'public/assets', a.actor, name + '.png')
        frames = P.split_sheet(src)
        for i, f in enumerate(frames):
            if a.make_canon and i != 0:
                continue
            jobs.append((name, d, action, i, len(frames), f))

    print(f'{len(jobs)} kare uretilecek ({len(names)} sheet) -> generated/{a.actor.replace("/","_")}/')
    done = [0]

    def work(job):
        name, d, action, i, n, ref = job
        who = ref_b64[d] if use_canon else ref_b64
        raw = generate(who, ref, d, action, i, n, api_key, canon=use_canon)
        raw.save(os.path.join(out, 'raw', f'{name}_{i}.png'))
        frame = P.process(raw, ref)
        frame.save(os.path.join(out, 'frames', f'{name}_{i}.png'))
        with _print_lock:
            done[0] += 1
            print(f'  [{done[0]}/{len(jobs)}] {name} kare{i}')
        return name, i, frame

    results = {}
    with ThreadPoolExecutor(max_workers=a.workers) as ex:
        for name, i, frame in ex.map(work, jobs):
            results.setdefault(name, {})[i] = frame

    for name, fr in results.items():
        frames = [fr[i] for i in sorted(fr)]
        sheet = P.compose_sheet(frames, os.path.join(out, 'sheets', name + '.png'))
        before = Image.open(os.path.join(ROOT, 'public/assets', a.actor,
                                         name + '.png')).convert('RGBA')
        cmp = Image.new('RGBA', (sheet.width * 8, sheet.height * 16), (20, 16, 30, 255))
        cmp.paste(P.magnify(before), (0, 0))
        cmp.paste(P.magnify(sheet), (0, sheet.height * 8))
        cmp.save(os.path.join(out, 'preview', name + '_karsilastirma.png'))

    tag = a.actor.replace('/', '_')
    if a.make_canon:
        cdir = os.path.join(out, 'canon')
        os.makedirs(cdir, exist_ok=True)
        strip = Image.new('RGBA', (32 * len(DIRS), 32), (0, 0, 0, 0))
        for j, d in enumerate(DIRS):
            os.replace(os.path.join(out, 'raw', f'{d}_Idle_0.png'),
                       os.path.join(cdir, f'{d}.png'))
            strip.paste(results[f'{d}_Idle'][0], (j * 32, 0))
        P.magnify(strip, 12).save(os.path.join(out, 'KANONIK_KARELER.png'))
        print('\n1. ASAMA bitti. Onayina sunulan kanonik kareler (D / U / S):')
        print(f'   generated/{tag}/KANONIK_KARELER.png   (12x buyutulmus)')
        print(f'   generated/{tag}/canon/               (1K hamlar)')
        print('\nOnaylarsan 2. asama:')
        print(f'   python3 scripts/restyle.py --actor {a.actor} '
              f'--canon generated/{tag}/canon')
    else:
        print(f'\nBitti. Onay icin: generated/{tag}/preview/')
    print('public/assets DOKUNULMADI.')


if __name__ == '__main__':
    main()
