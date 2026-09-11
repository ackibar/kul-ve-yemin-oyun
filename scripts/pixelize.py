"""Kul ve Yemin - asset yeniden stillendirme ardisleme hatti.

1K uretilmis bir kareyi alir, oyunun sprite gridine birebir oturtur:
  chroma-key -> alfa -> alan-ortalamali kucultme -> kilitli palete kuantalama
  -> referans kareye gore yeniden hizalama -> sheet'e dizme
"""
import json, os
from PIL import Image

PALETTE = [tuple(c) for c in json.load(
    open(os.path.join(os.path.dirname(__file__), 'actor_palette.json')))]

FRAME = 32
ALPHA_CUT = 128


def _srgb_to_lab(rgb):
    def f(u):
        u = u / 255.0
        return u / 12.92 if u <= 0.04045 else ((u + 0.055) / 1.055) ** 2.4
    r, g, b = (f(v) for v in rgb)
    x = (0.4124 * r + 0.3576 * g + 0.1805 * b) / 0.95047
    y = (0.2126 * r + 0.7152 * g + 0.0722 * b)
    z = (0.0193 * r + 0.1192 * g + 0.9505 * b) / 1.08883
    def k(t):
        return t ** (1 / 3) if t > 0.008856 else 7.787 * t + 16 / 116
    fx, fy, fz = k(x), k(y), k(z)
    return (116 * fy - 16, 500 * (fx - fy), 200 * (fy - fz))


_LAB = [_srgb_to_lab(c) for c in PALETTE]
_CACHE = {}


def nearest(rgb):
    """Rengi kilitli paletteki en yakin girdiye oturtur (Lab mesafesi)."""
    if rgb in _CACHE:
        return _CACHE[rgb]
    l1, a1, b1 = _srgb_to_lab(rgb)
    best, bestd = PALETTE[0], float('inf')
    for col, (l2, a2, b2) in zip(PALETTE, _LAB):
        d = (l1 - l2) ** 2 + (a1 - a2) ** 2 + (b1 - b2) ** 2
        if d < bestd:
            bestd, best = d, col
    _CACHE[rgb] = best
    return best


def chroma_key(img, tol=100):
    """Duz arka plani alfaya cevirir.

    Global renk eslesmesi DEGIL, kenardan flood-fill kullanir: arka plan
    daima cerceveye baglidir. Boylece sprite'in icinde arka planla ayni
    renk bulunsa bile (ornegin yesil tunik / yesil ekran) silinmez.
    """
    img = img.convert('RGBA')
    w, h = img.size
    px = img.load()
    corners = [px[0, 0][:3], px[w - 1, 0][:3], px[0, h - 1][:3], px[w - 1, h - 1][:3]]
    bg = max(set(corners), key=corners.count)

    def is_bg(c):
        return abs(c[0] - bg[0]) + abs(c[1] - bg[1]) + abs(c[2] - bg[2]) < tol

    seen = bytearray(w * h)
    stack = []
    for x in range(w):
        stack.append((x, 0)); stack.append((x, h - 1))
    for y in range(h):
        stack.append((0, y)); stack.append((w - 1, y))
    while stack:
        x, y = stack.pop()
        i = y * w + x
        if seen[i]:
            continue
        seen[i] = 1
        c = px[x, y]
        if c[3] == 0:
            pass
        elif not is_bg(c):
            continue
        px[x, y] = (0, 0, 0, 0)
        if x > 0: stack.append((x - 1, y))
        if x < w - 1: stack.append((x + 1, y))
        if y > 0: stack.append((x, y - 1))
        if y < h - 1: stack.append((x, y + 1))

    # Ikinci gecis: sprite icinde kapali kalmis arka plan delikleri.
    # Flood-fill cerceveye bagli olmayan bosluga ulasamaz. Chroma rengi
    # palete Lab olarak cok uzak secildigi icin (bkz. scripts/chroma.txt)
    # baglantidan bagimsiz bu temizlik sprite pikselini yemez.
    bg_lab = _srgb_to_lab(bg)
    for y in range(h):
        for x in range(w):
            c = px[x, y]
            if c[3] == 0:
                continue
            l, a, b2 = _srgb_to_lab(c[:3])
            if ((l - bg_lab[0]) ** 2 + (a - bg_lab[1]) ** 2
                    + (b2 - bg_lab[2]) ** 2) < 35 ** 2:
                px[x, y] = (0, 0, 0, 0)
    return img


def downscale(img, size=FRAME):
    """Premultiply -> alan ortalamasi -> ikili alfa. Sacak birakmaz."""
    img = img.convert('RGBA')
    # saydam piksellerin siyah RGB'si kenarlari kirletmesin diye premultiply
    px = img.load()
    for y in range(img.height):
        for x in range(img.width):
            r, g, b, a = px[x, y]
            if a == 0:
                px[x, y] = (0, 0, 0, 0)
    small = img.resize((size, size), Image.BOX)
    out = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    sp, op = small.load(), out.load()
    for y in range(size):
        for x in range(size):
            r, g, b, a = sp[x, y]
            op[x, y] = (r, g, b, 255) if a >= ALPHA_CUT else (0, 0, 0, 0)
    return out


def quantize(img):
    """Kilitli palete oturtur."""
    img = img.convert('RGBA')
    px = img.load()
    for y in range(img.height):
        for x in range(img.width):
            r, g, b, a = px[x, y]
            if a:
                px[x, y] = nearest((r, g, b)) + (255,)
    return img


def fit_to_ref(img, ref_bbox, canvas=1024):
    """1K ham sprite'i referans karenin bbox'ina olcekleyerek oturtur.

    Nano Banana her karede karakteri farkli buyuklukte cizer; sadece
    kaydirmak yetmez, yoksa animasyon boyunca karakter buyuyup kuculur.
    Olcek normalizasyonu KUCULTMEDEN ONCE, 1K uzayinda yapilir - boylece
    yeniden orneklemeden kaynaklanan kayip en aza iner.
    """
    bb = img.getbbox()
    if not bb or not ref_bbox:
        return img
    s = canvas / FRAME                       # 32 -> 1024 olcek katsayisi
    tw, th = (ref_bbox[2] - ref_bbox[0]) * s, (ref_bbox[3] - ref_bbox[1]) * s
    sprite = img.crop(bb)
    # en-boy oranini koru, referans kutusuna sigdir
    k = min(tw / sprite.width, th / sprite.height)
    nw, nh = max(1, round(sprite.width * k)), max(1, round(sprite.height * k))
    sprite = sprite.resize((nw, nh), Image.LANCZOS)
    out = Image.new('RGBA', (canvas, canvas), (0, 0, 0, 0))
    # yatayda ortala, dikeyde ayaklari referansin altina otur
    x = round(ref_bbox[0] * s + (tw - nw) / 2)
    y = round(ref_bbox[3] * s - nh)
    out.paste(sprite, (x, y))
    return out


def reanchor(frame, ref_bbox):
    """32x32 uzayinda son rotus: ayak hizasi ve yatay merkezi referansa esitler."""
    bb = frame.getbbox()
    if not bb or not ref_bbox:
        return frame
    dx = round((ref_bbox[0] + ref_bbox[2]) / 2 - (bb[0] + bb[2]) / 2)
    dy = ref_bbox[3] - bb[3]
    out = Image.new('RGBA', frame.size, (0, 0, 0, 0))
    out.paste(frame, (dx, dy))
    return out


def process(raw_1k, ref_frame):
    """1K ham uretimi -> oyuna hazir 32x32 kare."""
    ref_bbox = ref_frame.convert('RGBA').getbbox()
    keyed = chroma_key(raw_1k)
    fitted = fit_to_ref(keyed, ref_bbox, canvas=keyed.width)
    return reanchor(quantize(downscale(fitted)), ref_bbox)


def compose_sheet(frames, path):
    """Kareleri yatay sheet'e dizip kaydeder."""
    sheet = Image.new('RGBA', (FRAME * len(frames), FRAME), (0, 0, 0, 0))
    for i, f in enumerate(frames):
        sheet.paste(f, (i * FRAME, 0))
    sheet.save(path, 'PNG')
    return sheet


def magnify(img, factor=8):
    return img.resize((img.width * factor, img.height * factor), Image.NEAREST)


def split_sheet(path):
    """Mevcut sheet'i 32x32 karelere ayirir."""
    im = Image.open(path).convert('RGBA')
    return [im.crop((i * FRAME, 0, i * FRAME + FRAME, FRAME))
            for i in range(im.width // FRAME)]
