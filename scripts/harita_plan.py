"""Bolgenin carpisma haritasini Nano Banana'ya YAPI REFERANSI olarak cizer.

Uretilen arka plan gorseli oyunun carpisma izgarasini bilmez; bu yuzden once
mevcut world.tiles duzeni sade bir plan olarak cizilir ve modele "bu plana
birebir uy" denir. Poz referansi mantiginin aynisi.
"""
import json, os, re, subprocess, sys
from PIL import Image, ImageDraw

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


def tiles_for(zone):
    """world.ts'i Node ile calistirip gercek carpisma izgarasini alir -
    duzeni Python'da yeniden yazmak sapma riski dogurur."""
    js = f"""
    const ts=require('fs').readFileSync('{ROOT}/lib/game/world.ts','utf8');
    const body=ts.replace(/export /g,'').replace(/import[^;]+;/g,'')
      .replace(/:\\s*(Zone|World|Entity\\[\\]|EnemySpec\\[\\]|number|string|boolean)(\\[\\])?/g,'')
      .replace(/<[^<>]*>/g,'').replace(/as const/g,'');
    const f=new Function(body+'; return makeWorld("{zone}");');
    const w=f(); process.stdout.write(JSON.stringify({{w:w.w,h:w.h,tiles:w.tiles}}));
    """
    out = subprocess.run(['node', '-e', js], capture_output=True, text=True, cwd=ROOT)
    if out.returncode:
        raise SystemExit('world.ts okunamadi:\n' + out.stderr[:800])
    return json.loads(out.stdout)


def plan_image(world, cell=16):
    w, h, t = world['w'], world['h'], world['tiles']
    im = Image.new('RGB', (w * cell, h * cell), (0, 0, 0))
    d = ImageDraw.Draw(im)
    for y in range(h):
        for x in range(w):
            if t[y][x] == 1:
                d.rectangle([x * cell, y * cell, x * cell + cell - 1, y * cell + cell - 1],
                            fill=(255, 255, 255))
    return im


if __name__ == '__main__':
    zone = sys.argv[1] if len(sys.argv) > 1 else 'haven'
    wd = tiles_for(zone)
    floor = sum(r.count(1) for r in wd['tiles'])
    print(f'{zone}: {wd["w"]}x{wd["h"]} karo  zemin={floor}  duvar={wd["w"]*wd["h"]-floor}')
    print(f'  dunya birimi: {wd["w"]*16}x{wd["h"]*16}   2x piksel: {wd["w"]*32}x{wd["h"]*32}')
    os.makedirs(f'{ROOT}/generated/plan', exist_ok=True)
    p = f'{ROOT}/generated/plan/{zone}.png'
    plan_image(wd).save(p)
    print('  plan ->', p)
