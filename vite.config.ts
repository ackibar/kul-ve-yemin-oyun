import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath, URL } from 'node:url';
import { readFileSync, writeFileSync } from 'node:fs';

const WORLD_TS = fileURLToPath(new URL('./lib/game/world.ts', import.meta.url));

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
            res.setHeader('content-type', 'application/json');
            res.end(JSON.stringify({ w: world.w, h: world.h, tiles: world.tiles, blockers: world.blockers }));
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
                // list: [x1,y1,x2,y2][] - ondalikli olabilir (alt-karo hassasiyet icin,
                // bkz. walkable() - blockers duz aritmetikle okunuyor, tamsayi sarti yok).
                const fmt = (n: number) => Math.round(n * 100) / 100;
                const satir = (list as number[][])
                  .map(([x1, y1, x2, y2]) => `[${fmt(x1)},${fmt(y1)},${fmt(x2)},${fmt(y2)}]`)
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
