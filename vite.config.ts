import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath, URL } from 'node:url';
import { readFileSync, writeFileSync, mkdirSync, readdirSync } from 'node:fs';

const WORLD_TS = fileURLToPath(new URL('./lib/game/world.ts', import.meta.url));
const NESNE_DIR = fileURLToPath(new URL('./public/assets/nesne/', import.meta.url));
const CHARACTERS_DIR = fileURLToPath(new URL('./public/assets/characters/', import.meta.url));
// Bu araç kendi eklediği decor'ları bu yorum sınırları arasında tutar -
// zone bloğundaki NPC/sandık/ateş gibi elle yazılmış diğer her şeye
// dokunmadan güvenle silip yeniden yazabilmek için (bkz. asağıdaki 'nesneler').
const NESNE_BAS = '\n  /* @harita-editor:nesneler */\n';
const NESNE_SON = '  /* @harita-editor:nesneler-son */\n';
const KARAKTER_BAS = '\n  /* @harita-editor:karakterler */\n';
const KARAKTER_SON = '  /* @harita-editor:karakterler-son */\n';
// Bu aracin ekledigi NPC'ler bu on-ekle ayirt edilir (marker blogu icindeki
// TUM satirlar zaten bu araca ait oldugu icin blok-tabanli yonetim yetiyor,
// on-ek sadece GET yanitinda "hangi npc'ler duzenlenebilir" diye
// isaretlemek icin - elle yazilmis diğer NPC'lere asla dokunulmuyor).
const KARAKTER_ONEK = 'kd_';

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
              .map((e: any) => ({ id: e.id, x: (e.x - 8) / 16, y: (e.y - 8) / 16, asset: e.asset, s: e.s ?? 1 }));
            // TUM npc'ler referans icin (salt-okunur nokta+isim), sadece bu
            // aracin eklediyi (kd_ on-ekli) olanlar duzenlenebilir listede.
            const tumNpcler = world.entities.filter((e: any) => e.type === 'npc')
              .map((e: any) => ({ id: e.id, x: (e.x - 8) / 16, y: (e.y - 8) / 16, name: e.name, portrait: e.portrait, sabit: !!e.sabit, duzenlenebilir: String(e.id).startsWith(KARAKTER_ONEK) }));
            // Ozel silah-varyanti klasorleri (bu aracin sprite-kaydet ile
            // urettikleri) - numara olmayan ve oyuncunun kendi kusanma
            // setleri (1sword vb.) olmayan her klasor bu araca ait sayilir.
            let ozelKarakterler: string[] = [];
            try {
              ozelKarakterler = readdirSync(CHARACTERS_DIR, { withFileTypes: true })
                .filter((d) => d.isDirectory() && !/^\d+$/.test(d.name) && !/^1(sword|bow|balta|mesale|swordmesale)$/.test(d.name))
                .map((d) => d.name);
            } catch { /* klasor yoksa sorun degil */ }
            res.setHeader('content-type', 'application/json');
            res.end(JSON.stringify({ w: world.w, h: world.h, tiles: world.tiles, blockers: world.blockers, nesneler, npcler: tumNpcler, ozelKarakterler }));
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
              } else if (kind === 'nesneler') {
                // list: {id,x,y,asset,s}[] - x/y karo biriminde (ondalikli olabilir).
                // at() zaten *16+8 uyguluyor, o yuzden BURADA CARPMA YOK - world.ts'teki
                // diger tum at({...}) cagrilari da karo birimi aliyor, tutarli kalsin.
                const fmt = (n: number) => Math.round(n * 100) / 100;
                const satirlar = (list as { id: string; x: number; y: number; asset: string; s?: number }[])
                  .map((o) => `  at({id:'${o.id}',type:'decor',x:${fmt(o.x)},y:${fmt(o.y)},asset:'${o.asset}',s:${fmt(o.s ?? 1)},overlay:true});\n`)
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
              } else if (kind === 'karakterler') {
                // list: {id,x,y,name,portrait,sabit}[] - id KARAKTER_ONEK ile
                // baslamak zorunda (istemci zaten oyle uretiyor), yoksa GET
                // yanitinda "duzenlenebilir" olarak isaretlenmez.
                const fmt = (n: number) => Math.round(n * 100) / 100;
                // portrait cogunlukla numara ama oyuncunun silah varyanti
                // setleri de gecerli STRING'ler ('1sword' gibi, bkz. Entity
                // tipindeki not) - o yuzden turune gore tirnakli/tirnaksiz yaz.
                const portreIfade = (p: number | string) => typeof p === 'number' ? String(Math.round(p)) : `'${String(p).replace(/'/g, "\\'")}'`;
                const satirlar = (list as { id: string; x: number; y: number; name: string; portrait: number | string; sabit?: boolean }[])
                  .map((o) => `  at({id:'${o.id.startsWith(KARAKTER_ONEK) ? o.id : KARAKTER_ONEK + o.id}',type:'npc',x:${fmt(o.x)},y:${fmt(o.y)},name:'${o.name.replace(/'/g, "\\'")}',portrait:${portreIfade(o.portrait)}${o.sabit ? ',sabit:true' : ''}});\n`)
                  .join('');
                const yeniBolum = satirlar ? KARAKTER_BAS + satirlar + KARAKTER_SON : '';
                const marklıRe = new RegExp(KARAKTER_BAS.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '[\\s\\S]*?' + KARAKTER_SON.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
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
        if (req.method === 'POST' && url === '/__harita/sprite-kaydet') {
          // Silah-katmani araci: bir karakterin D/U/S Idle+Walk sheet'lerine
          // istemci tarafinda (canvas ile) bir silah gorseli komposit edip
          // buraya YENI bir varyant klasoru olarak yolluyor. Orijinal
          // karakter klasorune ASLA yazilmiyor - kullanici acikca "yeni
          // varyant olarak kaydet, orijinale dokunma" istedi.
          let body = '';
          req.on('data', (c: Buffer) => (body += c));
          req.on('end', () => {
            try {
              const { variant, files } = JSON.parse(body);
              const ad = String(variant).replace(/[^a-zA-Z0-9_-]/g, '');
              if (!ad) throw new Error('geçersiz varyant adı');
              const dir = CHARACTERS_DIR + ad + '/';
              mkdirSync(dir, { recursive: true });
              for (const f of files as { name: string; dataUrl: string }[]) {
                const dosyaAdi = String(f.name).replace(/[^a-zA-Z0-9_.-]/g, '');
                const m = /^data:image\/png;base64,(.+)$/.exec(f.dataUrl);
                if (!m) throw new Error(`${dosyaAdi}: sadece PNG kabul edilir`);
                writeFileSync(dir + dosyaAdi, Buffer.from(m[1], 'base64'));
              }
              res.setHeader('content-type', 'application/json');
              res.end(JSON.stringify({ ok: true, portrait: ad }));
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
