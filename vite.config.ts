import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath, URL } from 'node:url';
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';

const WORLD_TS = fileURLToPath(new URL('./lib/game/world.ts', import.meta.url));
const NESNE_DIR = fileURLToPath(new URL('./public/assets/nesne/', import.meta.url));
// Bu araç kendi eklediği decor'ları bu yorum sınırları arasında tutar -
// zone bloğundaki NPC/sandık/ateş gibi elle yazılmış diğer her şeye
// dokunmadan güvenle silip yeniden yazabilmek için (bkz. asağıdaki 'nesneler').
const NESNE_BAS = '\n  /* @harita-editor:nesneler */\n';
const NESNE_SON = '  /* @harita-editor:nesneler-son */\n';

// Dev-only yardimci: harita-editor.html'in "hazir mekan yukle" / "kaydet"
// ozellikleri icin. world.ts'i SSR modda yukleyip makeWorld() cagirir, o
// mekanin GERCEK tiles/blockers'ini JSON olarak doner - editor bos degil,
// oyundaki halini gosterir. Kaydetme ise o zone bloğu icindeki TEK
// `const ZEMIN=[...]` satirini metin duzeyinde degistirir (regex ile zone
// bloğunun sinirlarini bulup icinde arar) - sadece ZEMIN dizili mekanlarda
// (disari/cistern/tunel/haven'in zemin satiri) calisir; room()+blockers ile
// tanimlanan mekanlarda (magara/yikik) ZEMIN satiri olmadigi icin hata
// doner. Sadece `npm run dev` altinda calisir, build'e girmez.
function haritaEditoruEklentisi() {
  return {
    name: 'harita-editoru',
    configureServer(server: any) {
      server.middlewares.use(async (req: any, res: any, next: any) => {
        const url = req.url || '';
        if (req.method === 'GET' && /^\/__harita\/[a-z0-9]+$/.test(url)) {
          const zone = url.split('/').pop();
          try {
            const mod = await server.ssrLoadModule('/lib/game/world.ts');
            const world = mod.makeWorld(zone);
            // Sadece bu aracın kendi eklediği (overlay:true) decor'ları döner -
            // NPC/sandık/ateş gibi elle yazılmış diğer entity'lere karışmaz.
            const nesneler = world.entities.filter((e: any) => e.type === 'decor' && e.overlay)
              // NOT: -8 YOK (at()'in +8 merkezleme kaydırmasının tersini almıyoruz) -
              // editörün kendi x,y'si zaten "world-px/16" olarak tutuluyor (px=o.x*tp
              // ile doğrudan eşleşsin diye), +8 telafisi SAVE tarafında (sx=o.x-0.5)
              // yapılıyor. Y'de AYRICA +6 var: engine.ts'teki sprite(), decor (non-actor)
              // sprite'ları `top=-h*scale+6` ile çiziyor - yani decor'un ALT kenarı
              // dünya-y'den 6 birim AŞAĞIDA. Bu X'te yok (yatay ortalama simetrik,
              // stray sabit içermiyor) - sadece Y'ye özel. Bu unutulunca nesne
              // oyunda editörde göründüğünden hep biraz aşağıda çıkıyordu.
              .map((e: any) => ({ id: e.id, x: e.x / 16, y: (e.y + 6) / 16, asset: e.asset, s: e.s ?? 1, layer: e.layer ?? 0 }));
            res.setHeader('content-type', 'application/json');
            res.end(JSON.stringify({ w: world.w, h: world.h, tiles: world.tiles, blockers: world.blockers, nesneler }));
          } catch (e: any) {
            res.statusCode = 500;
            res.end(JSON.stringify({ error: String(e?.message || e) }));
          }
          return;
        }
        if (req.method === 'POST' && url === '/__harita/kaydet') {
          let body = '';
          req.on('data', (c: Buffer) => (body += c));
          req.on('end', () => {
            try {
              const { zone, kind, rows, list } = JSON.parse(body);
              const src = readFileSync(WORLD_TS, 'utf8');
              // ONEMLI: `zone==='${zone}'` tek basina ARANMAZ - dosyanin basindaki
              // w/h ternary'sinde de (ör. "zone==='tunel'?13:...") gecen bir alt
              // dizge, ilk eslesme o satiri bulup YANLIS blok sinirini verirdi
              // (bir kere gercekten oldu: haven'in ZEMIN'i tunel'inkiyle
              // ezildi). Dal acilisi ")){"ile bitiyor, ternary "?" ile - bu
              // yuzden sadece gercek `if`/`}else if` dalini eslestiriyoruz.
              const acilis = `zone==='${zone}'){`;
              const basIdx = src.indexOf(acilis);
              if (basIdx < 0) throw new Error(`zone==='${zone}'){ dalı bulunamadı (bu mekân farklı biçimde tanımlı olabilir)`);
              const sonrakiDal = src.indexOf(`}else if(zone===`, basIdx);
              const sonBlok = src.indexOf(`\n return {zone,w,h,tiles`, basIdx);
              const bitIdx = sonrakiDal > -1 && sonrakiDal < sonBlok ? sonrakiDal : sonBlok;
              if (bitIdx < 0) throw new Error('mekân bloğunun sonu bulunamadı');
              const blok = src.slice(basIdx, bitIdx);

              let yeniBlok: string;
              if (kind === 'blockers') {
                // list: number[][] - her eleman degisken uzunlukta: 4 sayi
                // dikdortgen, 5 sayi elips (son eleman etiket 1), >=7 tek sayi
                // cokgen (son eleman etiket 2) - bkz. World['blockers'] tipindeki
                // not. Ondalikli olabilir (alt-karo hassasiyet icin, bkz. walkable()).
                const fmt = (n: number) => Math.round(n * 100) / 100;
                const satir = (list as number[][])
                  .map((b) => `[${b.map(fmt).join(',')}]`)
                  .join(',');
                const yeniIfade = satir ? `blockers.push(${satir});` : '';
                const pushRe = /blockers\.push\([^;]*\);\n?/;
                if (pushRe.test(blok)) {
                  yeniBlok = blok.replace(pushRe, yeniIfade ? yeniIfade + '\n' : '');
                } else if (yeniIfade) {
                  // Hic blockers.push yoktu (ör. tunel/test100) - dal acilisinin
                  // hemen ardina ekle, sira onemli degil (blockers ustte tanimli).
                  const eklemeNoktasi = acilis.length;
                  yeniBlok = blok.slice(0, eklemeNoktasi) + '\n  ' + yeniIfade + blok.slice(eklemeNoktasi);
                } else {
                  yeniBlok = blok; // hem yeni liste bos hem eski yoktu - degisiklik yok
                }
              } else if (kind === 'nesneler') {
                // list: {id,x,y,asset,s,layer}[] - editordeki x/y "world-px/16" (yani
                // px=o.x*tp ekran ciziminde dogrudan kullanilan deger). at() +8 EKLEDIGI
                // icin burada -0.5 (=8/16) ile ONCEDEN telafi ediyoruz, yoksa at()'in
                // otomatik merkezlemesi yuzunden nesne oyunda editordeki gorunumunden
                // YARIM KARO kaymis cikardi (bkz. GET endpoint'indeki e.x/16 notu -
                // ikisi BIRLIKTE tutarli olmali).
                const fmt = (n: number) => Math.round(n * 100) / 100;
                const satirlar = (list as { id: string; x: number; y: number; asset: string; s?: number; layer?: number }[])
                  .map((o) => `  at({id:'${o.id}',type:'decor',x:${fmt(o.x - 0.5)},y:${fmt(o.y - 0.875)},asset:'${o.asset}',s:${fmt(o.s ?? 1)}${o.layer ? `,layer:${Math.round(o.layer)}` : ''},overlay:true});\n`)
                  .join('');
                // NESNE_BAS kendi basinda '\n' tasiyor, hem ilk eklemede hem de
                // eslesme aramasinda AYNI sabit kullaniliyor - boylece kaldirinca
                // (bos liste) o onceki bos satir da tek seferde temizleniyor.
                const yeniBolum = satirlar ? NESNE_BAS + satirlar + NESNE_SON : '';
                const marklıRe = new RegExp(NESNE_BAS.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '[\\s\\S]*?' + NESNE_SON.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
                if (marklıRe.test(blok)) {
                  yeniBlok = blok.replace(marklıRe, yeniBolum);
                } else if (yeniBolum) {
                  const eklemeNoktasi = acilis.length;
                  yeniBlok = blok.slice(0, eklemeNoktasi) + yeniBolum + blok.slice(eklemeNoktasi);
                } else {
                  yeniBlok = blok;
                }
              } else {
                const zeminRe = /const ZEMIN=\[[^\]]*\];/;
                if (!zeminRe.test(blok)) throw new Error(`'${zone}' bir ZEMIN dizisiyle tanımlı değil (room()+blockers kullanıyor olabilir) - bu araç onu düzenleyemez`);
                const yeni = `const ZEMIN=[${(rows as string[]).map((r) => `'${r}'`).join(',')}];`;
                yeniBlok = blok.replace(zeminRe, yeni);
              }
              const yeniKaynak = src.slice(0, basIdx) + yeniBlok + src.slice(bitIdx);
              writeFileSync(WORLD_TS, yeniKaynak);
              res.setHeader('content-type', 'application/json');
              res.end(JSON.stringify({ ok: true }));
            } catch (e: any) {
              res.statusCode = 400;
              res.end(JSON.stringify({ error: String(e?.message || e) }));
            }
          });
          return;
        }
        if (req.method === 'POST' && url === '/__harita/nesne-yukle') {
          let body = '';
          req.on('data', (c: Buffer) => (body += c));
          req.on('end', () => {
            try {
              const { filename, dataUrl } = JSON.parse(body);
              const ad = String(filename).toLowerCase().replace(/[^a-z0-9_-]/g, '') || 'nesne';
              const m = /^data:image\/png;base64,(.+)$/.exec(dataUrl);
              if (!m) throw new Error('sadece PNG (data URL) kabul edilir');
              mkdirSync(NESNE_DIR, { recursive: true });
              const dosyaAdi = `ed_${ad}.png`;
              writeFileSync(NESNE_DIR + dosyaAdi, Buffer.from(m[1], 'base64'));
              res.setHeader('content-type', 'application/json');
              res.end(JSON.stringify({ ok: true, asset: `nesne/ed_${ad}` }));
            } catch (e: any) {
              res.statusCode = 400;
              res.end(JSON.stringify({ error: String(e?.message || e) }));
            }
          });
          return;
        }
        next();
      });
    },
  };
}

export default defineConfig({
  plugins: [react(), haritaEditoruEklentisi()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./', import.meta.url)),
    },
  },
});
