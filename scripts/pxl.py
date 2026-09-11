"""PixelLab API yardimcisi. Deneme hakki sinirli - her cagri once loglanir."""
import base64, io, json, os, sys, time, urllib.error, urllib.request

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
BASE = 'https://api.pixellab.ai/v2'


def key():
    for l in open(os.path.join(ROOT, '.env.local')):
        if l.startswith('PIXELLAB_API_KEY='):
            return l.split('=', 1)[1].strip()
    raise SystemExit('PIXELLAB_API_KEY yok')


def call(path, body=None, method=None, timeout=300):
    m = method or ('POST' if body is not None else 'GET')
    req = urllib.request.Request(
        BASE + path, method=m,
        data=json.dumps(body).encode() if body is not None else None,
        headers={'Authorization': 'Bearer ' + key(),
                 'Content-Type': 'application/json'})
    try:
        with urllib.request.urlopen(req, timeout=timeout) as r:
            return json.load(r)
    except urllib.error.HTTPError as e:
        raise SystemExit(f'HTTP {e.code}: {e.read().decode()[:600]}')


def balance():
    b = call('/balance')['subscription']
    return b.get('generations'), b.get('total')


def save_b64(data, path):
    if isinstance(data, dict):
        data = data.get('base64') or data.get('image') or data.get('data')
    raw = base64.b64decode(data.split(',')[-1])
    open(path, 'wb').write(raw)
    return path


def walk_images(obj, out_dir, prefix='img', found=None):
    """Yanit agacindaki tum base64 gorselleri bulup kaydeder."""
    found = [] if found is None else found
    if isinstance(obj, dict):
        for k, v in obj.items():
            if k in ('base64', 'image', 'data') and isinstance(v, str) and len(v) > 500:
                p = os.path.join(out_dir, f'{prefix}_{len(found)}.png')
                save_b64(v, p); found.append(p)
            else:
                walk_images(v, out_dir, prefix, found)
    elif isinstance(obj, list):
        for v in obj:
            walk_images(v, out_dir, prefix, found)
    return found
