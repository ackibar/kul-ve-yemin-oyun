"""Zengin (mobilyali) arka plani izgarali onizlemeden geri kurtarir.

haven.png bos-oda surumuyle uzerine yazilmisti; ama generated/_IZGARA.png onun
2x NEAREST hali ve uzerinde yalnizca DUZ camgobegi izgara cizgileri + etiketler
var. Bunlar sicak zindan paletinde bulunmayan bir renk oldugu icin guvenle
tespit edilip komsu piksellerle doldurulabiliyor.
"""
import os
from PIL import Image

SRC = 'generated/_IZGARA.png'
DST = 'generated/arkaplan/haven_zengin.png'


def is_overlay(c):
    r, g, b = c[:3]
    return g > 150 and b > 150 and r < g - 40 and r < b - 40


def main():
    im = Image.open(SRC).convert('RGB')
    px = im.load()
    W, H = im.size
    hedef = [(x, y) for y in range(H) for x in range(W) if is_overlay(px[x, y])]
    print(f'kaplama pikseli: {len(hedef)}  (%{len(hedef)/(W*H)*100:.2f})')
    # komsulardan doldur: artan yaricapla ilk kaplamasiz rengi al
    for x, y in hedef:
        for r in (1, 2, 3, 5, 8):
            aday = []
            for dy in (-r, 0, r):
                for dx in (-r, 0, r):
                    nx, ny = x + dx, y + dy
                    if 0 <= nx < W and 0 <= ny < H and not is_overlay(px[nx, ny]):
                        aday.append(px[nx, ny])
            if aday:
                px[x, y] = tuple(sum(c[i] for c in aday) // len(aday) for i in range(3))
                break
    os.makedirs('generated/arkaplan', exist_ok=True)
    out = im.resize((W // 2, H // 2), Image.BOX)   # 2x -> oyun cozunurlugu
    out.save(DST)
    print('kurtarildi ->', DST, out.size)
    return out


if __name__ == '__main__':
    main()
