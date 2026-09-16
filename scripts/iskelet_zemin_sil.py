"""Iskelet sprite'larinin altindaki TOPRAK/CIM yamasini siler.

Uretimde (create-character-v3) figurun ayaklarinin altina kucuk bir toprak
tumsegi + cim + cakil cizildi; oyunda iskelet kendi tumsegi uzerinde duruyor
gibi oluyor. Tarifte "NO ground/grass/..." diye yasaklamak DENENDI ve ise
yaramadi (ustelik yeniden uretim sirt cantasi ekledi) - bu yuzden temizlik
goruntu isleme ile yapiliyor.

Yontem - ayirici KONTUR:
  1. Her piksel siniflanir: KEMIK (acik), KONTUR (cok koyu), ZEMIN (sicak
     koyu toprak ya da yesil cim), diger.
  2. Hucrenin ALT kenarindan baslayarak yalnizca ZEMIN sinifinda tasma
     doldurma yapilir. Kontur farkli sinif oldugu icin bariyerdir: dolgu
     bacaklarin/kilicin konturunu asip govdeyi yiyemez.
  3. Geriye kalan ONLY-zemin konturu (artik hicbir dolu komsusu olmayan koyu
     pikseller) temizlenir; kemiklerin konturu ise kemige komsu oldugu icin
     kalir.

Girdi/cikti: _arsiv/uretim/asset_backup_ton_oncesi/enemies/11/*.png (ham),
sonra aktor_uyum ile public/assets/enemies/11 yeniden uretilir.

kullanim: python3 scripts/iskelet_zemin_sil.py [--onizleme]
"""
import glob, os, sys
from collections import deque
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
HAM = f'{ROOT}/_arsiv/uretim/asset_backup_ton_oncesi/enemies/11'
HUCRE = 64


def lum(r, g, b):
    return (r * 299 + g * 587 + b * 114) // 1000


def zemin_mi(r, g, b):
    """Toprak (sicak koyu) ya da cim (yesil)."""
    L = lum(r, g, b)
    # OLCULDU: bu palette YESIL YOK - "cim" sanilan seritler de zeytuni
    # kahve. Kemik (L 111..207), pasli kilic (L=121) ve toprak (L 28..50)
    # ayni SICAK tonda; tek guvenilir ayirici PARLAKLIK. Ayri bir "cakil"
    # kurali denendi ve KILICI YEDI (soguk gri, dipten bagli) - kaldirildi.
    return L <= 58 and r - b >= 4


def temizle(kare):
    px = kare.load()
    W, H = kare.size
    # (0) Cim her yerde silinir: iskelette yesil hicbir sey yok, tereddutsuz.
    for y in range(H):
        for x in range(W):
            r, g, b, a = px[x, y]
            if a and g > r + 4 and g > b + 4:
                px[x, y] = (0, 0, 0, 0)
    sil = [[False] * W for _ in range(H)]
    q = deque()
    # Tohum: en alt 10 satirdaki zemin pikselleri
    for y in range(H - 10, H):
        for x in range(W):
            r, g, b, a = px[x, y]
            if a and zemin_mi(r, g, b) and not sil[y][x]:
                sil[y][x] = True; q.append((x, y))
    while q:
        x, y = q.popleft()
        for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1)):
            nx, ny = x + dx, y + dy
            if not (0 <= nx < W and 0 <= ny < H) or sil[ny][nx]:
                continue
            r, g, b, a = px[nx, ny]
            if a and zemin_mi(r, g, b):
                sil[ny][nx] = True; q.append((nx, ny))
    for y in range(H):
        for x in range(W):
            if sil[y][x]:
                px[x, y] = (0, 0, 0, 0)
    # Oksuz kalan kontur: koyu ve etrafinda dolu piksel yok
    for _ in range(3):
        gitti = []
        for y in range(H):
            for x in range(W):
                r, g, b, a = px[x, y]
                if not a or lum(r, g, b) > 40:
                    continue
                komsu = any(px[x + dx, y + dy][3] > 0 and lum(*px[x + dx, y + dy][:3]) > 40
                            for dx in (-1, 0, 1) for dy in (-1, 0, 1)
                            if 0 <= x + dx < W and 0 <= y + dy < H and (dx or dy))
                if not komsu:
                    gitti.append((x, y))
        for x, y in gitti:
            px[x, y] = (0, 0, 0, 0)
        if not gitti:
            break
    # (3) Yalnizca EN BUYUK bagli parca kalir. Iskelet (kemik+paçavra+kilic)
    #     tek bir kutle; artik kalan cakil/toprak kirintilari ayri ada oldugu
    #     icin bu adim onlari tek seferde temizler.
    gorulen = [[False] * W for _ in range(H)]
    parcalar = []
    for sy in range(H):
        for sx in range(W):
            if gorulen[sy][sx] or not px[sx, sy][3]:
                continue
            yigin = [(sx, sy)]; gorulen[sy][sx] = True; grup = []
            while yigin:
                x, y = yigin.pop(); grup.append((x, y))
                for dx in (-1, 0, 1):
                    for dy in (-1, 0, 1):
                        nx, ny = x + dx, y + dy
                        if 0 <= nx < W and 0 <= ny < H and not gorulen[ny][nx] and px[nx, ny][3]:
                            gorulen[ny][nx] = True; yigin.append((nx, ny))
            parcalar.append(grup)
    if parcalar:
        parcalar.sort(key=len, reverse=True)
        for grup in parcalar[1:]:
            for x, y in grup:
                px[x, y] = (0, 0, 0, 0)
    return kare


def isle(yol, yaz=True):
    sheet = Image.open(yol).convert('RGBA')
    n = sheet.width // HUCRE
    out = Image.new('RGBA', sheet.size, (0, 0, 0, 0))
    for i in range(n):
        out.paste(temizle(sheet.crop((i * HUCRE, 0, (i + 1) * HUCRE, HUCRE))), (i * HUCRE, 0))
    if yaz:
        out.save(yol)
    return out


if __name__ == '__main__':
    onizleme = '--onizleme' in sys.argv
    if onizleme:
        y = f'{HAM}/D_Idle.png'
        once = Image.open(y).convert('RGBA').crop((0, 0, HUCRE, HUCRE))
        sonra = isle(y, yaz=False).crop((0, 0, HUCRE, HUCRE))
        k = Image.new('RGBA', (HUCRE * 2, HUCRE), (40, 40, 46, 255))
        k.alpha_composite(once, (0, 0)); k.alpha_composite(sonra, (HUCRE, 0))
        k.resize((HUCRE * 12, HUCRE * 6), Image.NEAREST).convert('RGB').save('/tmp/zemin_onizleme.png')
        print('onizleme -> /tmp/zemin_onizleme.png (sol: once, sag: sonra)')
    else:
        import aktor_uyum
        for f in sorted(glob.glob(f'{HAM}/*.png')):
            isle(f)
        print(f'{HAM}: zemin silindi')
        aktor_uyum.klasor(f'{ROOT}/public/assets/enemies/11')
