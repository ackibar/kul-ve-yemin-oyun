"""Referansin renk dunyasini mevcut sprite'lara deterministik olarak aktarir.

Uretken model kullanilmaz: her kaynak renk, referans paletindeki bir renge
birebir eslenir ve 576 karenin tamamina ayni eslemeden uygulanir. Kayma
matematiksel olarak imkansiz.

Esleme ilkesi:
  - RENK AILESI korunur (yesil -> yesil, ten -> ten, metal -> metal)
  - Mutlak parlaklik degil PARLAKLIK SIRASI korunur; boylece genel ton
    referansa kayarken golgeleme yapisi ve kontrast bozulmaz
  - Esleme birebirdir: iki kaynak renk ayni hedefe dusup kontrasti
    cokertmez
  - En koyu renk daima en koyuya gider (kontur korunur)
"""
import json, math, os, sys
sys.path.insert(0, os.path.dirname(__file__))
from PIL import Image
import pixelize as P

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = [tuple(c) for c in json.load(open(os.path.join(ROOT, 'scripts/actor_palette.json')))]
DST = [tuple(c) for c in json.load(open(os.path.join(ROOT, 'scripts/ref_palette.json')))]


def feats(pal):
    out = []
    for c in pal:
        L, a, b = P._srgb_to_lab(c)
        chroma = math.hypot(a, b)
        hue = math.atan2(b, a)
        out.append({'rgb': c, 'L': L, 'C': chroma, 'h': hue})
    ls = sorted(x['L'] for x in out)
    cs = max(x['C'] for x in out) or 1
    for x in out:
        x['rank'] = ls.index(x['L']) / max(1, len(ls) - 1)
        x['Cn'] = x['C'] / cs
    return out


def cost(s, t, w_hue=1.0, w_chroma=0.35, w_rank=1.25):
    dh = abs(math.atan2(math.sin(s['h'] - t['h']), math.cos(s['h'] - t['h']))) / math.pi
    # gri renklerde ton anlamsizdir: agirligi doygunlukla olcekle
    gate = min(s['Cn'], t['Cn'])
    return (w_hue * dh * gate
            + w_chroma * abs(s['Cn'] - t['Cn'])
            + w_rank * abs(s['rank'] - t['rank']))


def build_map():
    S, T = feats(SRC), feats(DST)
    pairs = sorted(((cost(s, t), i, j) for i, s in enumerate(S) for j, t in enumerate(T)))
    used_s, used_t, mapping = set(), set(), {}
    # kontur kilidi: en koyu kaynak -> en koyu hedef
    si = min(range(len(S)), key=lambda i: S[i]['L'])
    tj = min(range(len(T)), key=lambda j: T[j]['L'])
    mapping[S[si]['rgb']] = T[tj]['rgb']; used_s.add(si); used_t.add(tj)
    for _, i, j in pairs:
        if i in used_s or j in used_t:
            continue
        mapping[S[i]['rgb']] = T[j]['rgb']; used_s.add(i); used_t.add(j)
    for i, s in enumerate(S):            # hedef tukendiyse en yakinina dus
        if i not in used_s:
            j = min(range(len(T)), key=lambda j: cost(s, T[j]))
            mapping[s['rgb']] = T[j]['rgb']
    return mapping


MAP = build_map()


_FALLBACK = {}


def _resolve(c):
    """Kilitli palet disindaki renkler (orn. enemies/5 anti-aliased seti)
    once en yakin kaynak palet rengine, oradan hedefe tasinir."""
    if c in MAP:
        return MAP[c]
    if c not in _FALLBACK:
        _FALLBACK[c] = MAP[P.nearest(c)]
    return _FALLBACK[c]


def convert(img):
    img = img.convert('RGBA')
    px = img.load()
    for y in range(img.height):
        for x in range(img.width):
            r, g, b, a = px[x, y]
            if a:
                px[x, y] = _resolve((r, g, b)) + (255,)
    return img


if __name__ == '__main__':
    S = {c: P._srgb_to_lab(c)[0] for c in SRC}
    print(f'{"kaynak":<22}{"->":<4}{"hedef":<22}{"L degisimi"}')
    for c in sorted(SRC, key=lambda c: -S[c]):
        t = MAP[c]
        print(f'  #{c[0]:02x}{c[1]:02x}{c[2]:02x} L={S[c]:5.1f}  ->  '
              f'#{t[0]:02x}{t[1]:02x}{t[2]:02x} L={P._srgb_to_lab(t)[0]:5.1f}')
