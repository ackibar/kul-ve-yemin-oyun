/**
 * KUL VE YEMIN - regresyon testleri.
 *
 * Calistirma:  node scripts/test/regression.mjs      (ya da: npm test)
 *
 * Neden var: bu depoda dogrulama tek seferlik Playwright betikleriyle yapiliyor
 * ve sonra atiliyor. Kalici bir ag olmayinca sessiz bozulmalar gozden kaciyor -
 * ornekler: uretim tezgahi state'in KOPYASINI degistiriyordu (uretilen esya
 * kayboluyordu, v16.0'da bulundu) ve onaylanmis bir plan adimi yeniden
 * numaralandirma sirasinda tamamen dusmustu (v16.9'da bulundu). Ikisi de
 * burada bir test olsa aninda yakalanirdi.
 *
 * Yapi: TS dosyalari gecici bir klasore derlenip import ediliyor (tarayici
 * yok, bundler yok). Motor testleri icin sahte tuval/Image/rAF kuruluyor.
 *
 * KURAL: bir test kirilirsa once GERCEGIN degistigini dogrula. Hikaye metni
 * degistiyse test guncellenir; davranis degistiyse kod duzeltilir. Testi
 * "gecsin diye" gevsetme - bu dosya v4.3'te tam olarak oyle terk edilmisti
 * (yanlis import yolu + eskimis hikaye iddialari + artik olmayan 'forge'
 * bolgesi), 13 surum boyunca kimse calistirmadi.
 */
import assert from 'node:assert/strict';
import {readFile,mkdtemp,writeFile} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {pathToFileURL} from 'node:url';
import ts from 'typescript';

const dir=await mkdtemp(join(tmpdir(),'kul-yemin-test-'));
for(const name of ['data','world','audio','engine']){
 const src=await readFile(new URL(`../../lib/game/${name}.ts`,import.meta.url),'utf8');
 const js=ts.transpileModule(src,{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.ES2022}})
   .outputText.replace(/from '(\.\/\w+)'/g,"from '$1.mjs'");
 await writeFile(join(dir,name+'.mjs'),js);
}
const D=await import(pathToFileURL(join(dir,'data.mjs')));
const W=await import(pathToFileURL(join(dir,'world.mjs')));

let gecti=0,kaldi=0;
const test=(ad,fn)=>{try{fn();gecti++;console.log('  PASS',ad);}
 catch(e){kaldi++;console.log('  FAIL',ad,'\n        ',String(e.message).split('\n')[0]);}};
const grup=ad=>console.log(`\n${ad}`);

/* ============ VERI: esyalar, tarifler, fiyatlar ============ */
grup('Veri bütünlüğü');
test('Her tarifin çıktısı ve malzemesi geçerli bir eşya',()=>{
 for(const t of D.TARIFLER){
  assert.ok(D.ITEMS[t.id],'gecersiz cikti: '+t.id);
  assert.ok(t.adet>0);
  for(const k of Object.keys(t.malzeme))assert.ok(D.ITEMS[k],'gecersiz malzeme: '+k);
 }});
test('Üretilebilen bir eşya aynı anda "sadece satın/hikaye" olamaz',()=>{
 const uretilen=new Set(D.TARIFLER.map(t=>t.id));
 for(const i of Object.values(D.ITEMS))
  if(i.sadece)assert.ok(!uretilen.has(i.id),i.id+' hem uretiliyor hem sadece:'+i.sadece);
});
test('Düşürme tablosundaki her eşya geçerli; Rauf ve fenerci bir şey düşürmez',()=>{
 for(const [kind,liste] of Object.entries(D.DUSURME)){
  assert.ok(![6,9].includes(Number(kind)),'kind '+kind+' dusurmemeli');
  for(const g of liste){assert.ok(D.ITEMS[g.id],'gecersiz ganimet: '+g.id);
   assert.ok(g.sans>0&&g.sans<=1&&g.az>=1&&g.cok>=g.az);}
 }});
test('Satıcıların listesindeki her eşya var ve fiyatı pozitif',()=>{
 for(const [ad,v] of Object.entries(D.SATICILAR))
  for(const id of v.liste){assert.ok(D.ITEMS[id],ad+' gecersiz esya: '+id);
   assert.ok(D.ITEMS[id].price>0,id+' fiyati yok');}
});

/* ============ BASLANGIC ve ILK SILAH ============ */
grup('Açılış');
test('Oyun silahsız başlıyor',()=>{
 const s=D.newState();
 assert.equal(s.equipment.weapon,'yumruk');
 assert.equal(s.inventory.rusty,undefined);
 assert.equal(D.stats(s).attack,D.ITEMS.yumruk.attack);
});
test('Alf ilk kılıcı bir kez verir, sonra teklif kalkar',()=>{
 const s=D.newState();
 assert.ok(D.dialogue(s,'boran').choices.some(c=>c.action==='alf_kilic'));
 D.choose(s,'alf_kilic');
 assert.equal(s.equipment.weapon,'rusty');
 assert.equal(D.choose(s,'alf_kilic').message,'','ikinci kez vermemeli');
 assert.ok(!D.dialogue(s,'boran').choices.some(c=>c.action==='alf_kilic'));
});

/* ============ URETIM ============ */
grup('Üretim tezgâhı');
test('Boş envanterle hiçbir tarif yapılamaz (önce avlanmak gerek)',()=>{
 const s=D.newState();
 assert.equal(D.TARIFLER.filter(t=>D.tarifDurum(s,t).olur).length,0);
});
test('Üretim malzemeyi harcar ve eşyayı verir',()=>{
 const s=D.newState();Object.assign(s.inventory,{wood:2,pacavra:2});
 const t=D.TARIFLER.find(x=>x.id==='torch');
 assert.equal(D.tarifUygula(s,t),true);
 assert.equal(s.inventory.torch,t.adet);
 assert.equal(s.inventory.wood,1);assert.equal(s.inventory.pacavra,1);
});
test('Kuşanılır eşyanın ikincisi üretilemez',()=>{
 const s=D.newState();Object.assign(s.inventory,{celik:4,post:2});
 const t=D.TARIFLER.find(x=>x.id==='hancer');
 assert.equal(D.tarifUygula(s,t),true);
 assert.equal(D.tarifDurum(s,t).zaten,true);
 assert.equal(D.tarifUygula(s,t),false);
});
test('Eksik malzemeyle üretim yapılmaz ve envanter bozulmaz',()=>{
 const s=D.newState();s.inventory.wood=1;
 const t=D.TARIFLER.find(x=>x.id==='torch');
 assert.equal(D.tarifUygula(s,t),false);
 assert.equal(s.inventory.wood,1);
});

/* ============ GUN ve ERZAK ============ */
grup('Gün ve erzak');
test('Uyumak günü ilerletir',()=>{
 const s=D.newState();assert.equal(s.gun,1);D.gunGec(s);assert.equal(s.gun,2);
});
test('Depo her gün azalır; boşalınca can kaybı başlar',()=>{
 const s=D.newState();
 const bas=s.erzak.yiyecek;
 for(let i=0;i<bas;i++)D.gunGec(s);
 assert.equal(s.erzak.yiyecek,0);
 assert.equal(s.kayip,0,'depo yeni bosaldi, henuz kayip olmamali');
 const r=D.gunGec(s);
 assert.equal(r.acliktan,2,'yiyecek ve su ayri ayri birer can');
 assert.equal(s.kayip,2);
});
test('Depoya bırakmak iki gün ekler ve eşyayı harcar',()=>{
 const s=D.newState();s.inventory.tuzet=1;
 const once=s.erzak.yiyecek;
 assert.equal(D.depoBirak(s,'tuzet'),true);
 assert.equal(s.erzak.yiyecek,once+2);
 assert.equal(s.inventory.tuzet,undefined);
 assert.equal(D.depoBirak(s,'tuzet'),false,'elde yokken birakilamaz');
});
test('Gün olayı bir kez çalışır ve koşulu tutmazsa ertelenir',()=>{
 const s=D.newState();
 for(let i=0;i<8;i++)D.gunGec(s);
 assert.equal(s.flags.kral,undefined,'kral gorulmeden tetiklenmemeli');
 s.flags.kralGoruldu=true;
 const r=D.gunGec(s);
 assert.ok(r.olay,'kosul saglaninca ilk uyanista calismali');
 assert.equal(s.flags.kral,'oldu');
 const r2=D.gunGec(s);
 assert.equal(r2.olay,null,'ayni olay tekrar calismamali');
});

/* ============ KRAL CINAYETI ============ */
grup('Kral cinayeti');
const cinayet=()=>{const s=D.newState();s.flags.kralGoruldu=true;
 for(let i=0;i<5;i++)D.gunGec(s);return s;};
test('Olaydan sonra altı ifade de alınabilir',()=>{
 const s=cinayet();
 for(const a of ['ifade_mirna','ifade_alf','ifade_obruk','ifade_karga','ifade_cakal','ifade_lin'])
  assert.notEqual(D.choose(s,a).message,'',a+' bos dondu');
});
test('"Kendi eliyle" seçeneği yalnız Mirna’nın ifadesiyle açılır',()=>{
 const s=cinayet();D.choose(s,'ifade_lin');
 const yok=D.dialogue(s,'mira').choices.map(c=>c.action);
 assert.ok(!yok.includes('karar_kendi'));
 assert.ok(yok.includes('karar_karga'),'digerleri acik olmali');
 D.choose(s,'ifade_mirna');
 assert.ok(D.dialogue(s,'mira').choices.some(c=>c.action==='karar_kendi'));
});
test('Karar bir kez verilir',()=>{
 const s=cinayet();D.choose(s,'ifade_mirna');
 D.choose(s,'karar_kendi');
 assert.equal(s.flags.kralKarar,'kendi');
 assert.equal(D.choose(s,'karar_karga').message,'');
 assert.equal(s.flags.kralKarar,'kendi');
});
test('Suçlanan tüccar satmaz; Karga sürgün edilince haritadan kalkar',()=>{
 const a=cinayet();D.choose(a,'ifade_obruk');D.choose(a,'karar_obruk');a.gold=999;
 assert.equal(D.buy(a,'tuzet','obruk'),false);
 const b=cinayet();D.choose(b,'ifade_alf');D.choose(b,'karar_alf');b.gold=999;
 assert.equal(D.buy(b,'potion','boran'),false);
 assert.ok(W.makeWorld('haven',b.flags).entities.some(e=>e.id==='boran'),
  'Alf dunyada KALMALI - defter gorevi onunla kapaniyor');
 const c=cinayet();D.choose(c,'ifade_cakal');D.choose(c,'karar_karga');
 assert.ok(!W.makeWorld('magara',c.flags).entities.some(e=>e.id==='karga'));
});

/* ============ FINALLER ============ */
grup('Üç final');
test('Başlangıçta hiçbir final hazır değil ve Undur teklif etmez',()=>{
 const s=D.newState();
 assert.equal(D.finalDurum(s).filter(f=>f.hazir).length,0);
 assert.equal(D.dialogue(s,'ekin').choices.filter(c=>c.action?.startsWith('final_')).length,0);
});
test('Adımları biten final seçilebilir, hazır olmayan reddedilir',()=>{
 const s=D.newState();
 s.killed.push('warden');s.flags.muhafiz='gecti';
 s.inventory.balta=1;s.inventory.chain=1;s.equipment.armor='chain';
 const av=D.finalDurum(s).find(f=>f.id==='av');
 assert.equal(av.hazir,true,'eksik: '+av.adimlar.filter(a=>!a.bitti).map(a=>a.id));
 assert.ok(D.dialogue(s,'ekin').choices.some(c=>c.action==='final_av'));
 assert.equal(D.choose(s,'final_goc').message,'Henüz değil. Eksiklerini günlükten görebilirsin.');
 D.choose(s,'final_av');
 assert.equal(s.ending,'av');
 assert.equal(D.choose(s,'final_gercek').message,'','ikinci final secilememeli');
});
test('Her finalin metni yazılı ve kayıpları hatırlatıyor',()=>{
 for(const id of ['goc','gercek','av']){
  const s=D.newState();s.ending=id;s.kayip=2;
  const m=D.sonMetni(s);
  assert.ok(m.length>80,id+' metni cok kisa');
  assert.ok(m.includes('2 kez boş kaldı'),id+' kayiplari anmiyor');
 }});

/* ============ KAYIT ============ */
grup('Kayıt');
test('Kayıt gidip geri geliyor',()=>{
 const s=D.newState();assert.deepEqual(D.parseSave(JSON.stringify(s)),s);
});
test('Bozuk kayıt reddediliyor',()=>{
 const s=D.newState();
 for(const raw of ['bad','{}',
  JSON.stringify({...s,level:9}),JSON.stringify({...s,hp:-1}),
  JSON.stringify({...s,inventory:{hile:1}}),JSON.stringify({...s,x:Infinity}),
  JSON.stringify({...s,equipment:{weapon:'potion',armor:'leather',ring:null}})])
  assert.equal(D.parseSave(raw),null,'kabul etmemeli: '+raw.slice(0,30));
});
test('Eski kayıtta gün ve erzak yoksa varsayılana çekiliyor',()=>{
 const s=D.newState();delete s.gun;delete s.erzak;delete s.kayip;
 const y=D.parseSave(JSON.stringify(s));
 assert.equal(y.gun,1);assert.equal(y.kayip,0);
 assert.ok(y.erzak.yiyecek>0&&y.erzak.su>0);
});

/* ============ DUNYA ============ */
grup('Dünya');
test('Bölgedeki hedefler aynı yürünebilir alanda; kimse ayrı cepte kalmıyor',()=>{
 /* Zone.spawn'dan tasma doldurma YAPILMIYOR: 'yikik'in spawn alani yurunmez
    bir karoyu gosteriyor (oyuncu oraya kapidan giriyor, o alani hic
    kullanmiyor) ve test yanlis yerde hata veriyordu. Dogru degismez su:
    butun hedefler AYNI bagli alanda olmali, yani hicbiri ayri bir cepte
    mahsur kalmamali. */
 for(const zone of ['haven','cistern','magara','yikik','disari','tunel']){
  const w=W.makeWorld(zone);
  const anahtar=(x,y)=>x+','+y;
  const gorulen=new Set(),parcalar=[];
  for(let y=0;y<w.h;y++)for(let x=0;x<w.w;x++){
   if(w.tiles[y][x]!==1||gorulen.has(anahtar(x,y)))continue;
   const grup=new Set([anahtar(x,y)]),kuyruk=[[x,y]];gorulen.add(anahtar(x,y));
   while(kuyruk.length){const [cx,cy]=kuyruk.pop();
    for(const [dx,dy] of [[0,1],[0,-1],[1,0],[-1,0]]){
     const nx=cx+dx,ny=cy+dy,k=anahtar(nx,ny);
     if(w.tiles[ny]?.[nx]===1&&!gorulen.has(k)){gorulen.add(k);grup.add(k);kuyruk.push([nx,ny]);}}}
   parcalar.push(grup);
  }
  parcalar.sort((a,b)=>b.size-a.size);
  const ana=parcalar[0]??new Set();
  for(const e of w.entities.filter(e=>!['decor','fire','trap'].includes(e.type)))
   assert.ok(ana.has(anahtar(Math.floor(e.x/16),Math.floor(e.y/16))),
    `${zone}: ${e.id} ana alanda degil`);
 }});
test('Harita dışı yürünemez',()=>{
 assert.equal(W.walkable(W.makeWorld('haven'),-10,-10),false);
});

/* ============ MOTOR ============
   Tarayici yok: rAF, localStorage, Image ve tuval sahte. Engine yalnizca
   update() ile surulur - loop() cagirilmaz, yani donma (hit-stop) bu
   testleri etkilemez. */
globalThis.requestAnimationFrame=()=>1;
globalThis.cancelAnimationFrame=()=>{};
globalThis.localStorage={setItem(){},getItem(){return null;}};
globalThis.Image=class{naturalWidth=128;width=128;height=32;set src(v){queueMicrotask(()=>this.onload?.());}};
const {Engine}=await import(pathToFileURL(join(dir,'engine.mjs')));
const ses={play(){},setZone(){},start(){},setFire(){},setVolumes(){}};
const kur=()=>{const g=new Engine({getContext:()=>({})},D.newState(),ses,()=>{},()=>{});
 g.ready=true;g.paused=false;return g;};

grup('Motor');
test('Sandık ganimeti bir kez verir',()=>{
 const g=kur();const sandik=g.world.entities.find(e=>e.type==='chest');
 g.state.x=sandik.x;g.state.y=sandik.y;
 g.interact();const ilk=JSON.stringify(g.state.inventory);
 g.interact();assert.equal(JSON.stringify(g.state.inventory),ilk);
 g.destroy();
});
test('Kamera harita sınırında duruyor, dar haritada ortalanıyor',()=>{
 /* Kullanici "sinira gelince kamera pan yapmayi biraksin, siyah alanlari
    gormeyelim" dedi. render() sahte tuvalle calismadigi icin sinirlama
    matematigi dogrudan sinaniyor. */
 const k=Engine.kis;
 assert.equal(k(-40,544),0,'sol/ust kenarda 0da durmali');
 assert.equal(k(700,544),544,'sag/alt kenarda sinirda durmali');
 assert.equal(k(272,544),272,'ic bolgede kamera serbest');
 assert.equal(k(9,-112),-56,'harita pencereden darsa ortalanir');
});
test('Çıplak elde kılıç sesi çalmıyor',()=>{
 /* Kullanici yumruk kayitlarini verdi; ciplak elde kilicin metalik savurmasi
    calmamali. Savurma sesi hedef bulunmadan tetiklendigi icin bu test
    dusmana ihtiyac duymuyor. */
 const cald=[];
 const kayit={play(n){cald.push(n);},setZone(){},start(){},setFire(){},setVolumes(){}};
 const g=new Engine({getContext:()=>({})},D.newState(),kayit,()=>{},()=>{});
 g.ready=true;g.paused=false;
 g.state.equipment.weapon='yumruk';g.attackTimer=0;g.attack();
 assert.ok(cald.includes('yumrukSavur'),'ciplak elde yumruk savurmasi calmali');
 assert.ok(!cald.includes('swing'),'ciplak elde kilic savurmasi calmamali');
 cald.length=0;
 g.state.equipment.weapon='rusty';g.attackTimer=0;g.attack();
 assert.ok(cald.includes('swing'),'kilicla swing calmali');
 assert.ok(!cald.includes('yumrukSavur'),'kilicla yumruk sesi calmamali');
 g.destroy();
});
test('Çizim konumu tam tuval pikseline oturuyor',()=>{
 /* Piksel-tamligin sarti: oteleme TAM SAYIDA tuval pikseli olsun. Tam dunya
    birimine yuvarlamak da bu sarti saglardi ama izgara dort kat kabaydi ve
    kamera kenarda kilitlenince oyuncunun adimlari titreme gibi okunuyordu. */
 for(const v of [0,.1,.49,.5,3.37,-2.6,123.456]){
  const g=Engine.izgara(v);
  assert.ok(Number.isInteger(g*Engine.PIKSEL),`${v} -> ${g} tuval pikseline oturmuyor`);
  assert.ok(Math.abs(g-v)<=.5/Engine.PIKSEL,`${v} -> ${g} cok uzaga kaydi`);
 }
});
test('Canı doluyken iksir harcanmaz',()=>{
 const g=kur();
 assert.equal(g.useItem('potion'),false);
 g.state.hp=30;
 assert.equal(g.useItem('potion'),true);
 g.destroy();
});
test('Duvar hasarı engelliyor',()=>{
 const g=kur();g.state.zone='cistern';g.world=W.makeWorld('cistern');g.resetMobs();
 g.state.x=15*16;g.state.y=15*16;
 const m=g.mobs[0];m.x=g.state.x+20;m.y=g.state.y;const can=m.hp;
 g.attack();
 assert.equal(m.hp,can,'duvarin ardindaki dusman hasar almamali');
 g.destroy();
});
test('Yay ok harcar, ok bitince uyarır',()=>{
 const g=kur();g.state.inventory.bow=1;g.state.inventory.arrow=3;
 g.state.equipment.weapon='bow';
 g.attack();assert.equal(g.state.inventory.arrow,2);
 g.state.inventory.arrow=1;g.update(1);g.attack();
 assert.equal(g.state.inventory.arrow,undefined);
 g.update(1);g.attack();
 assert.equal(g.state.inventory.arrow,undefined,'ok yokken atis olmamali');
 g.destroy();
});
test('Düşmanlar yalnız yürünür zeminde doğuyor',()=>{
 for(const zone of ['disari','cistern','tunel','test100']){
  const g=kur();g.state.zone=zone;g.world=W.makeWorld(zone);g.resetMobs();
  for(const m of [...g.mobs,...g.gomulu])
   assert.ok(W.walkable(g.world,m.x,m.y),zone+':'+m.id+' engelde dogdu');
  g.destroy();
 }});
test('Hit-stop kilitlenmiyor: donma sayacı update dışında iniyor',()=>{
 const g=kur();
 /* update() icinden dusen sayac listesine donma EKLENIRSE oyun kalici
    kilitlenir (bkz. v15.6). Bu test tam olarak onu yakalar. */
 assert.ok(!('donma' in g)||g.donma===0);
 g.donma=1;
 for(let i=0;i<10;i++)g.update(.02);
 assert.equal(g.donma,1,'update() donmayi azaltmamali - o is loop()`in');
 g.destroy();
});

console.log(`\n${gecti} test geçti, ${kaldi} kaldı.`);
if(kaldi)process.exit(1);
