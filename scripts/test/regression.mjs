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
grup('Hikâye bütünlüğü');
/* Bu grup gercek bir hatayi yakaladigi icin var: 'ayaz:asagi' dugumunun
   data.ts icinde hicbir 'to' hedefi yok - girisi MOTOR kuruyor
   (engine.ts, flags.talk). Yalniz data.ts'e bakan bir temizlik onu olu sanip
   sildi ve Tiga'nin sigginaga inisinin karsiligi sessizce kayboldu. */
const storyKaynak=(await readFile(new URL('../../lib/game/data.ts',import.meta.url),'utf8'))
 +(await readFile(new URL('../../lib/game/engine.ts',import.meta.url),'utf8'));
/* choose() icinde dugum ARANMADAN yakalanan hedefler (dovuse dallananlar). */
/* 'ekin:sonSayfa' son panelini acar (bkz. data.ts choose). */
const KESILEN=new Set(['muhafiz:dovus','rauf:zorla','tuhn:atladi','ekin:sonSayfa']);
/* Sablonla kurulan girisler: `story:uslu:${SIRA[i]}` duz aramayla bulunmaz. */
const SABLON=new Set(['uslu:d1','uslu:d2','uslu:d3','uslu:d4']);
test('Her diyalog seçeneği var olan bir düğüme gidiyor',()=>{
 const kirik=[];
 for(const [npc,dugumler] of Object.entries(D.STORY))
  for(const [ad,n] of Object.entries(dugumler))
   for(const c of n.choices)
    if(c.to&&!dugumler[c.to]&&!KESILEN.has(`${npc}:${c.to}`))kirik.push(`${npc}:${ad} -> ${c.to}`);
 assert.deepEqual(kirik,[],'kırık bağlantı');
});
test('Her diyalog düğümüne bir giriş var',()=>{
 const ulasilmaz=[];
 for(const [npc,dugumler] of Object.entries(D.STORY)){
  const hedef=new Set();
  for(const n of Object.values(dugumler))for(const c of n.choices)if(c.to)hedef.add(c.to);
  for(const ad of Object.keys(dugumler)){
   const giris=storyKaynak.includes(`story:${npc}:${ad}`)||storyKaynak.includes(`'${npc}:${ad}'`)||SABLON.has(`${npc}:${ad}`);
   if(!hedef.has(ad)&&!giris)ulasilmaz.push(`${npc}:${ad}`);
  }
 }
 assert.deepEqual(ulasilmaz,[],'ulaşılamayan düğüm');
});
test('Uslu tanıklığı sırayla açılıyor ve üç bayrak bırakıyor',()=>{
 /* Uslu eskiden sonucu olmayan sekiz bilmece sorardi (24 dugumun 15'i etkisiz
    yaprak). Artik disariyi goren tek tanik: uc bilgi + getirdigi tas. */
 const s=D.newState();
 const alinan=[];
 for(let i=0;i<5;i++){
  const d=D.dialogue(s,'uslu');
  const anlat=d.choices.find(c=>c.action.startsWith('story:uslu:'));
  if(!anlat)break;
  alinan.push(anlat.action.slice(11));
  D.choose(s,anlat.action);D.choose(s,'story:bitir');
 }
 assert.deepEqual(alinan,['d1','d2','d3','d4'],'anlatım sırası');
 for(const k of ['usluDisari','usluMuhafiz','usluSara'])assert.ok(s.flags[k],k+' kurulmadı');
 assert.equal(D.bekleyen(s,'uslu'),false,'anlatacağı kalmayınca ünlem sönmeli');
});
test('Uslu’nun tanıklığı Tuhn’da ikinci bir yol açıyor',()=>{
 /* Tiga hic bulunmadan da Tuhn ucurumdan cekilebilmeli; iki kanit birden
    gorunmemeli (Tiga varsa o daha kuvvetli). */
 const a=D.newState();a.flags.usluSara='anlatti';a.flags.talk='tuhn:3';
 const kol=D.dialogue(a,'tuhn').choices.find(c=>c.action==='story:tuhn:sareUslu');
 assert.ok(kol,'Uslu kolu görünmeli');
 D.choose(a,kol.action);
 const son=D.dialogue(a,'tuhn');
 D.choose(a,son.choices[0].action);
 assert.equal(a.flags.tuhn,'kaldi','Tuhn geri çekilmeli');
 const b=D.newState();b.flags.usluSara='anlatti';b.flags.ayaz='kaldi';b.flags.talk='tuhn:3';
 const bk=D.dialogue(b,'tuhn').choices.map(c=>c.action);
 assert.ok(!bk.includes('story:tuhn:sareUslu'),'Tiga varken Uslu kolu gizlenmeli');
 assert.ok(bk.includes('story:tuhn:sare'),'Tiga kolu görünmeli');
});

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
grup('İki son');
/* Birinci bolumde iki son var: Goc ve Gercek. Av gizli (Bekci yok). Son
   secilince once soz dugumu acilir; son, soz verilince yazilir. */
const gercekHazir=()=>{const s=D.newState();
 for(const k of ['kralMirna','kralAlf','kralUndur','kralLin','kralObruk'])s.flags[k]=true;
 s.flags.alfSir='soylendi';s.flags.gordu_tunel=true;s.flags.gordu_cistern=true;s.flags.ledgerDone=true;
 return s;};
const gocHazir=()=>{const s=D.newState();
 s.gun=4;s.kayip=0;s.erzak={yiyecek:8,su:8};s.flags.gordu_yikik=true;
 s.flags.medicineDone=true;s.flags.ledgerDone=true;return s;};
test('Başlangıçta hiçbir son hazır değil ve Undur teklif etmez',()=>{
 const s=D.newState();
 assert.equal(D.finalDurum(s).filter(f=>f.hazir).length,0);
 assert.equal(D.dialogue(s,'ekin').choices.filter(c=>c.action?.startsWith('final_')).length,0);
});
test('Av gizli: listede yok, seçilemez',()=>{
 const s=D.newState();
 s.killed.push('warden');s.flags.muhafiz='gecti';
 s.inventory.balta=1;s.inventory.chain=1;s.equipment.armor='chain';
 assert.deepEqual(D.finalDurum(s).map(f=>f.id),['goc','gercek']);
 assert.ok(!D.dialogue(s,'ekin').choices.some(c=>c.action==='final_av'));
 assert.equal(D.choose(s,'final_av').message,'Henüz değil. Eksiklerini günlükten görebilirsin.');
 assert.equal(s.ending,null);
});
test('Göç yolu test koridoruna değil Yıkık Ev’e bağlı',()=>{
 const s=gocHazir();delete s.flags.gordu_yikik;s.flags.gordu_test100=true;
 assert.equal(D.finalDurum(s).find(f=>f.id==='goc').hazir,false);
 s.flags.gordu_yikik=true;
 assert.equal(D.finalDurum(s).find(f=>f.id==='goc').hazir,true);
});
test('Gerçek: son seçimi → söz düğümü → sayfa → son paneli',()=>{
 const s=gercekHazir();
 assert.equal(D.choose(s,'final_goc').message,'Henüz değil. Eksiklerini günlükten görebilirsin.');
 assert.ok(D.dialogue(s,'ekin').choices.some(c=>c.action==='final_gercek'));
 const r=D.choose(s,'final_gercek');
 assert.equal(r.special,undefined,'son hemen açılmamalı, önce söz');
 assert.equal(s.ending,null);
 const d=D.dialogue(s,'ekin');
 const etiket=d.choices.map(c=>c.label);
 assert.ok(etiket.includes('Bir daha ‘bilmiyoruz’ demeyeceğim.'),'Gerçek yemini görünmeli');
 assert.ok(!etiket.includes('Kimseyi geride bırakmayacağım.'),'Göç yemini görünmemeli');
 assert.ok(etiket.includes('Söz vermem.'));
 D.choose(s,d.choices.find(c=>c.label.startsWith('Bir daha')).action);
 assert.equal(s.ending,'gercek');assert.equal(s.flags.yemin,'gercek');
 assert.equal(s.inventory.sayfa,1,'Undur’un sayfası verilmeli');
 const cevap=D.dialogue(s,'ekin');
 assert.equal(cevap.text,'Benim yüküm. Sen taşırsın, ben yazarım demiştim; işte.');
 const son=D.choose(s,cevap.choices[0].action);
 assert.equal(son.special,'ending');assert.equal(s.flags.talk,'');
 assert.equal(D.choose(s,'final_goc').message,'','ikinci son seçilememeli');
 assert.equal(D.choose(s,'son_sayfa').special,'ending','son sayfa yeniden açılabilmeli');
 assert.ok(D.dialogue(s,'ekin').choices.some(c=>c.action==='son_sayfa'));
 assert.equal(D.yeminCumlesi(s),'Sen taşırsın, ben yazarım demiştim. Taşıdın. Yazıyorum.');
 const sat=D.defterSatirlari(s);
 assert.ok(sat.at(-1).startsWith('Sen. Yetmiş ikinci.'),'son satır Sen olmalı');
 assert.ok(sat[0].startsWith('Mirna.'));
 const p=D.sonMetni(s).split('\n\n');
 assert.equal(p.length,3);assert.ok(p[0].startsWith('Undur son sayfayı yazdı'));
 assert.ok(D.yeminler(s).some(y=>y.soz==='Bir daha ‘bilmiyoruz’ demeyeceğim.'&&y.not==='yazıldı, sınanmadı'));
});
test('Göç: "Söz vermem" de sonu yazar; Alf kalınca yemin ilk gün sınanır',()=>{
 const s=gocHazir();
 D.choose(s,'final_goc');
 D.choose(s,'story:ekin:sozYok');
 assert.equal(s.ending,'goc');assert.equal(s.flags.yemin,'yok');
 assert.equal(D.yeminCumlesi(s),'Söz yok. Boşluk yazıldı.');
 const t=gocHazir();D.choose(t,'final_goc');
 /* Goc'te Gercek yemini secilemez */
 D.choose(t,'story:ekin:sozGercek');assert.equal(t.ending,null);
 D.choose(t,'story:ekin:sozGoc');assert.equal(t.ending,'goc');
 assert.ok(D.yeminCumlesi(t).includes('Yemin ilk gün sınandı'));
 assert.ok(D.yeminler(t).some(y=>y.not==='ilk gün sınandı'));
 t.flags.alfSir='soylendi';
 assert.ok(D.yeminCumlesi(t).startsWith('Mirna’nın ilk yemini'));
 const m=D.sonMetni(t);
 assert.ok(m.startsWith('Kapıyı arkanızdan kapatmadınız'));
 assert.ok(m.includes('Alf en arkada yürüdü.'));
});
test('Söz verilmeden kapatılırsa Undur sözü yeniden sorar',()=>{
 const s=gercekHazir();D.choose(s,'final_gercek');D.choose(s,'story:bitir');
 s.flags.talk='';
 const d=D.dialogue(s,'ekin');
 assert.ok(!d.choices.some(c=>c.action?.startsWith('final_')),'son yeniden seçilmemeli');
 assert.ok(d.choices.some(c=>c.action==='story:ekin:sonSoz'));
});
test('Her sonun metni yazılı ve kayıpları hatırlatıyor',()=>{
 for(const id of ['goc','gercek']){
  const s=D.newState();s.ending=id;s.kayip=2;
  const m=D.sonMetni(s);
  assert.ok(m.length>80,id+' metni cok kisa');
  assert.ok(m.includes('2 kez boş kaldı'),id+' kayiplari anmiyor');
 }
 const s=D.newState();s.kayip=3;
 assert.ok(D.defterSatirlari(s).includes('Depo 3 gece boş kaldı. O geceleri ayrı sayfaya yazdım; bu sayfaya sığmazlar.'));
});
test('Son ekranında koşulsuz ya da eski satır yok',()=>{
 const s=gercekHazir();s.ending='gercek';s.flags.yemin='gercek';
 const hepsi=[D.sonMetni(s),...D.defterSatirlari(s),...D.yeminler(s).map(y=>y.not),D.yeminCumlesi(s)].join(' ');
 for(const yasak of ['ikinci bölüm','İkinci bölüm','hastalarına umut','Tutulan yemin','Yeni bir ateş'])
  assert.ok(!hepsi.includes(yasak),yasak);
});

grup('Rauf yolda ölürse');
test('Alf defteri alır; iki son da açılabilir',()=>{
 const s=D.newState();s.flags.rauf='oldu';s.flags.fugitive='dead';s.flags.ledgerStarted=true;s.inventory.ledger=1;
 s.flags.alfKilic=true;
 const d=D.dialogue(s,'boran');
 assert.ok(d.text.includes('Defter döndü, adam dönmedi. Bu sefer kaçtığı için değil.'));
 const ver=d.choices.find(c=>c.action==='boran_deliver');
 assert.ok(ver,'teslim seçeneği olmalı');
 D.choose(s,'boran_deliver');
 assert.equal(s.flags.ledgerDone,true);assert.equal(s.inventory.life,1,'yüzük verilmeli');
 assert.ok(!s.inventory.ledger);
 assert.ok(D.questList(s).find(q=>q.id==='ledger').step.startsWith('Rauf yolda düştü.'));
 for(const k of ['kralMirna','kralAlf','kralUndur','kralLin','kralObruk'])s.flags[k]=true;
 s.flags.alfSir='soylendi';s.flags.gordu_tunel=true;s.flags.gordu_cistern=true;
 assert.equal(D.finalDurum(s).find(f=>f.id==='gercek').hazir,true);
 s.ending='gercek';
 assert.ok(D.defterSatirlari(s).some(l=>l.startsWith('Rauf. Yolda düştü, seni korurken.')));
 assert.ok(D.sonMetni(s).includes('İkincisini Alf yazdı.'));
});
test('Eski kayıt: Rauf ölmüş ama defter yoksa açılışta verilir',()=>{
 const s=D.newState();s.flags.rauf='oldu';s.ending='av';
 const y=D.parseSave(JSON.stringify(s));
 assert.equal(y.flags.fugitive,'dead');assert.equal(y.inventory.ledger,1);
 assert.equal(y.ending,null,'gizli son kayıtta kalmamalı');
});

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
test('NPC nefesi yavaş ve her birinde farklı ritimde',()=>{
 /* Kullanici: "cok hizli ve cok ayni ritimde". Once 5 kare/sn sabitti -
    dort karelik dongu 0.8 sn, ve time GLOBAL oldugu icin ayni odadaki
    herkesin gogsu ayni anda inip kalkiyordu. */
 const g=kur();
 const kimlik=['karga','cakal','obruk','tuhn'];
 const dongu=id=>{const k=[];for(let t=0;t<12;t+=1/60)k.push(g.nefesKare(id,t)%4);
  let don=0;for(let i=1;i<k.length;i++)if(k[i]===k[0]&&k[i-1]!==k[0])don++;
  return 12/Math.max(1,don);};
 for(const id of kimlik){const d=dongu(id);
  assert.ok(d>1.8&&d<3.6,`${id} nefes dongusu ${d.toFixed(2)}sn - 1.8-3.6 araliginda olmali`);}
 let esit=0,toplam=0;
 for(let t=0;t<60;t+=1/60){const k=kimlik.map(i=>g.nefesKare(i,t)%4);
  toplam++;if(k.every(v=>v===k[0]))esit++;}
 assert.ok(esit/toplam<.15,`NPC'ler zamanin %${(esit/toplam*100).toFixed(0)}'inda ayni karede - ritim ayrismamis`);
 g.destroy();
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
 /* v19.1: eski hali (15,15)+20 noktasinda aslinda duvar yoktu; test yalniz
    yakindaki baska bir dusman (c23) hedef alindigi icin geciyordu. Yeni
    yerlesimde bu tesaduf bozuldu. Gercek duvarli cift olculerek secildi ve
    on kosul olarak sinaniyor; sahnede tek dusman birakiliyor. */
 g.state.x=5*16+8;g.state.y=20*16+8;
 const m=g.mobs[0];m.x=g.state.x+28;m.y=g.state.y;g.mobs=[m];const can=m.hp;
 assert.equal(W.lineOfSight(g.world,g.state.x,g.state.y,m.x,m.y),false,'on kosul: arada duvar olmali');
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
test('Rauf yolda düşünce defter düşer, fugitive dead olur',()=>{
 const g=kur();const s=g.state;
 s.flags.rauf='takip';s.flags.raufCan='1';s.flags.ledgerStarted=undefined;
 g.update(.016);
 const r=g.world.entities.find(e=>e.id==='rauf');
 assert.ok(r,'Rauf yoldaş olarak doğmalı');
 g.mobs.push({id:'test_mob',kind:2,x:r.x+4,y:r.y,hp:999,max:999,cool:99,windup:0,burn:0,hurt:0,homeX:r.x+4,homeY:r.y});
 g.raufHasar=0;
 for(let i=0;i<5&&s.flags.rauf!=='oldu';i++)g.update(.016);
 assert.equal(s.flags.rauf,'oldu');
 assert.equal(s.flags.fugitive,'dead');
 assert.equal(s.inventory.ledger,1,'defter düşmeli');
 g.destroy();
});
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


/* ============ v19.1: IKI EL, IKI SOZ ============
   Beden sozleri sahada bozulur; gece Undur yazar, sabah kisi karsilar.
   Olum bir gece; altin dusmanda yok, tarifte yok, olumde gitmiyor. */
grup('Yeminler (v19.1)');
test('İki el: üçüncü söz verilmez, kişi kendi cümlesiyle reddeder',()=>{
 const s=D.newState();s.flags.alfKilic='verildi';s.flags.gordu_cistern=true;
 assert.ok(D.choose(s,'alf_muhafiz').message.includes('kapıdan geçmez'));
 assert.equal(s.flags.yemin_alf,'tasiniyor');assert.equal(s.inventory.guard,1);
 D.choose(s,'mira_start');assert.equal(s.flags.yemin_mirna,'tasiniyor');
 assert.deepEqual(D.tasinanYeminler(s),['alf','mirna']);assert.equal(D.elBos(s),false);
 assert.equal(D.yeminVer(s,'rauf'),false,'üçüncü el yok');
 const s2=D.newState();s2.flags.alfKilic='verildi';s2.flags.gordu_cistern=true;
 D.yeminVer(s2,'alf');D.yeminVer(s2,'rauf');
 const r=D.choose(s2,'mira_start');
 assert.ok(r.message.startsWith('Mirna: “Ellerin dolu.'),r.message);
 assert.ok(!s2.flags.medicineStarted,'eller doluyken görev başlamamalı');
});
test('Söz sahada bozulur: kılıç kapıdan geçer, ilaç içilir, Rauf geride kalır',()=>{
 const s=D.newState();D.yeminVer(s,'alf');s.inventory.guard=1;s.equipment.weapon='guard';
 assert.deepEqual(D.yeminDinle(s,{tip:'gecis',from:'haven',to:'magara'}),[],'aşağı inmek bozmaz');
 assert.deepEqual(D.yeminDinle(s,{tip:'gecis',from:'haven',to:'disari'}),['alf']);
 assert.equal(s.flags.yemin_alf,'bozuldu');
 const s2=D.newState();D.yeminVer(s2,'alf');s2.inventory.guard=1;s2.equipment.weapon='rusty';
 assert.deepEqual(D.yeminDinle(s2,{tip:'gecis',from:'haven',to:'disari'}),[],'kuşanılı değilse bozulmaz');
 const s3=D.newState();D.yeminVer(s3,'rauf');
 assert.deepEqual(D.yeminDinle(s3,{tip:'gecis',from:'cistern',to:'magara',raufUzak:false}),[]);
 assert.deepEqual(D.yeminDinle(s3,{tip:'gecis',from:'cistern',to:'magara',raufUzak:true}),['rauf']);
});
test('Motor: ilaç içilince Mirna sözü bozulur, can dolar',()=>{
 const g=kur();const s=g.state;s.flags.alfKilic='verildi';D.choose(s,'mira_start');
 s.inventory.medicine=1;s.hp=10;
 assert.equal(g.useItem('medicine'),true);
 assert.equal(s.hp,D.stats(s).maxHp);assert.equal(s.flags.medicine,'icildi');
 assert.equal(s.flags.yemin_mirna,'bozuldu');assert.equal(s.flags.medicineDone,true);
 assert.equal(D.kulKademe(s),1,'bozulan söz sığınağa kül');
 g.destroy();
});
test('Motor: kuşanılı muhafız kılıcıyla üst kapıdan geçmek sözü bozar',()=>{
 const g=kur();const s=g.state;s.flags.alfKilic='verildi';s.flags.gordu_cistern=true;
 D.choose(s,'alf_muhafiz');s.equipment.weapon='guard';
 const g0=g.world.gecisler.find(x=>x.to==='disari');
 s.x=(g0.kutu[0]+.5)*16;s.y=(g0.kutu[1]+.5)*16;g.bolgeKontrol();
 assert.equal(s.zone,'disari');assert.equal(s.flags.yemin_alf,'bozuldu');
 g.destroy();
});
test('Gece: Undur yazar, sabah kişi kendi cümlesiyle karşılar (yalnız o gün)',()=>{
 const s=D.newState();D.yeminVer(s,'mirna');D.yeminDinle(s,{tip:'ic',item:'medicine'});
 s.flags.medicine='icildi';s.flags.medicineDone=true;
 D.gunGec(s);const yazi=D.geceYaz(s);
 assert.equal(yazi.length,1);assert.ok(yazi[0].startsWith('Undur gece yazdı: “Mirna’nın ilacını sen içtin.'));
 assert.ok(s.journal[0].startsWith('Undur gece yazdı'));
 assert.ok(D.dialogue(s,'mira').text.includes('Kendin içtin. Yazdım. Yaşayanlara.'));
 assert.equal(D.geceYaz(s).length,0,'bir kez yazılır');
 D.gunGec(s);assert.ok(!D.dialogue(s,'mira').text.includes('Kendin içtin'),'ertesi gün önek kalkar');
 assert.ok(D.dialogue(s,'mira').text.includes('Bir dahaki şişeyi ben taşırım.'));
});
test('Tutulan söz: kılıç geri verilir, Alf karşılar, ateş büyür',()=>{
 const s=D.newState();s.flags.alfKilic='verildi';s.flags.gordu_cistern=true;s.inventory.rusty=1;
 D.choose(s,'alf_muhafiz');s.equipment.weapon='guard';
 assert.ok(D.choose(s,'alf_muhafiz_geri').message.includes('Taşıdın, geçirmedin. Yeter.'));
 assert.equal(s.flags.yemin_alf,'tutuldu');assert.equal(s.inventory.guard,undefined);
 assert.equal(s.equipment.weapon,'rusty');assert.equal(D.atesKademe(s),1);
 D.gunGec(s);D.geceYaz(s);assert.ok(D.dialogue(s,'boran').text.startsWith('Kılıç duvarda.'));
});
test('Alf’in sırrı söylenince kılıcın kuralı kalkar',()=>{
 const s=D.newState();D.yeminVer(s,'alf');s.inventory.guard=1;
 D.choose(s,'story:boran:sirSoyle');
 assert.equal(s.flags.yemin_alf,'kalkti');assert.ok(D.elBos(s));
});
test('Ölüm bir gece: gün ilerler, altın gitmez, Mirna’nın ateşinde uyanılır',()=>{
 const g=kur();const s=g.state;s.gold=200;const gun=s.gun;const yiyecek=s.erzak.yiyecek;
 s.zone='cistern';g.world=W.makeWorld('cistern');s.hp=0;g.paused=true;
 g.respawn();
 assert.equal(s.gold,200,'altın cezası yok');assert.equal(s.gun,gun+1,'bir gece geçer');
 assert.ok(s.erzak.yiyecek<yiyecek,'gece depo eksilir');
 assert.equal(s.zone,'haven');assert.equal(s.hp,D.stats(s).maxHp);
 assert.ok(W.walkable(g.world,s.x,s.y),'uyanış noktası yürünür olmalı');
 const mira=g.world.entities.find(e=>e.id==='mira');
 assert.ok(Math.hypot(mira.x-s.x,mira.y-s.y)<64,'Mirna’nın yanında');
 assert.ok(s.journal.some(j=>j.includes('Bir gece geçti')));
 g.destroy();
});
test('Ölümde heybedeki ilacı Mirna alır; söz düşer, ödül yok',()=>{
 const g=kur();const s=g.state;s.flags.alfKilic='verildi';D.choose(s,'mira_start');s.inventory.medicine=1;
 const altin=s.gold;g.respawn();
 assert.equal(s.inventory.medicine,undefined);assert.equal(s.flags.medicine,'haven');
 assert.equal(s.flags.yemin_mirna,'alindi');assert.equal(s.gold,altin);
 assert.ok(D.dialogue(s,'mira').text.startsWith('Sen yatarken aldım; hastaya gitti.'));
 g.destroy();
});
test('Altın: düşmandan düşmez, tarifte yok, satıcıdan muhafız kılıcı kalktı',()=>{
 const g=kur();const m={id:'t1',kind:4,x:g.state.x+10,y:g.state.y,hp:0,max:40,cool:9,windup:0,burn:0,hurt:0,homeX:0,homeY:0};
 g.mobs.push(m);g.kill(m);
 assert.ok(!g.drops.some(d=>d.kind==='gold'),'düşmandan altın düşmemeli');
 assert.ok(D.TARIFLER.every(t=>!('gold' in t)),'tariflerde altın yok');
 assert.ok(!D.SATICILAR.boran.liste.includes('guard'));
 const s=D.newState();s.gold=0;s.inventory.et=1;s.inventory.pacavra=1;
 assert.equal(D.tarifDurum(s,D.TARIFLER.find(t=>t.id==='potion')).olur,true,'altınsız tarif olur');
 g.destroy();
});
test('Rauf teslim edilince ödül yüzük; söz tutuldu sayılır',()=>{
 const s=D.newState();D.yeminVer(s,'rauf');s.flags.fugitive='reported';s.inventory.ledger=1;
 D.choose(s,'boran_deliver');assert.equal(s.inventory.life,1);assert.equal(s.inventory.guard,undefined);
});
test('Eski kayıt: satın alınmış muhafız kılıcı kuralsız, başlamış ilaç sözü verilmiş sayılır',()=>{
 const s=D.newState();s.inventory.guard=1;s.flags.medicineStarted=true;
 delete s.flags.yemin_alf;
 const y=D.parseSave(JSON.stringify(s));
 assert.ok(y,'eski kayıt açılmalı');assert.equal(y.flags.yemin_alf,'eski');
 assert.equal(y.flags.yemin_mirna,'tasiniyor');assert.deepEqual(D.tasinanYeminler(y),['mirna']);
});
test('Motor: üçüncü ardışık isabet ağır (1.6 kat itme)',()=>{
 const g=kur();const s=g.state;s.zone='cistern';g.world=W.makeWorld('cistern');
 s.x=30*16+8;s.y=18*16+8;const itmeler=[];
 for(let i=0;i<3;i++){const m={id:'agir'+i,kind:4,x:s.x+16,y:s.y,hp:999,max:999,cool:9,windup:0,burn:0,hurt:0,homeX:0,homeY:0};
  g.mobs=[m];g.attack();itmeler.push(m.x-(s.x+16));g.attackTimer=0;}
 assert.ok(itmeler[0]>0,'ilk vuruş itmeli');
 assert.ok(Math.abs(itmeler[2]/itmeler[0]-1.6)<.05,`üçüncü vuruş 1.6 kat: ${itmeler}`);
 g.destroy();
});

/* ===== v19.2 ASAMA 3: diyalog derinligi ===== */
console.log('\nAşama 3: diyalog derinliği');
/** Konusma ac: motorun interact'i gibi (konusmaBasla + dialogue). */
const konus=(s,id)=>{D.konusmaBasla(s,id);return D.dialogue(s,id);};
const sec=(s,d,label)=>{const c=d.choices.find(c=>c.label===label);assert.ok(c,`seçenek yok: ${label} | var: ${d.choices.map(c=>c.label)}`);D.choose(s,c.action);return c;};
const gunYap=(s,g)=>{while(s.gun<g)D.gunGec(s);};
test('Graf: hiçbir düğüm çıkmaz sokak değil (rastgele bayraklarla)',()=>{
 const ornek=[];
 for(let i=0;i<40;i++){const s=D.newState();const r=()=>Math.random()<.5;
  Object.assign(s.flags,{ayaz:r()?'indi':'kaldi',selviSir:r()?'soylendi':'',alfSir:r()?'soylendi':'',tuhn:r()?'kaldi':'',
   rauf:['korundu','serbest','teslim','takip'][i%4],raufYemin:r()?'okundu':'',selvi:'tanisti',mirnaSir:'',kral:r()?'oldu':''});
  if(r())s.inventory.ledger=1;s.gun=1+(i%9);ornek.push(s);}
 const bos=[];
 for(const [npc,dd] of Object.entries(D.STORY))for(const [ad,n] of Object.entries(dd)){
  if(KESILEN.has(`${npc}:${ad}`))continue;
  if(ornek.some(s=>!n.choices.some(c=>!c.if||c.if(s))))bos.push(`${npc}:${ad}`);}
 assert.deepEqual(bos,[],'çıkmaz sokak');
});
test('D1: gün sohbeti güne göre değişir, günde bir kez, kişi tutmazsa açılmaz',()=>{
 const s=D.newState();s.flags.ayaz='kaldi';gunYap(s,2);
 assert.notEqual(s.flags.talk,'ekin:gun3','2. gün Undur sohbeti açılmaz');
 s.flags.talk='';konus(s,'nil');assert.equal(s.flags.talk,'nil:gun2');
 assert.ok(D.dialogue(s,'nil').text.includes('On iki.'),'çentik güne bağlı');
 sec(s,D.dialogue(s,'nil'),'Sayma istersen. Ben sayarım senin yerine.');assert.equal(s.flags.linCentik,'sen');
 D.choose(s,'story:bitir');konus(s,'nil');assert.notEqual(s.flags.talk,'nil:gun2','günde bir kez');
 gunYap(s,3);s.flags.talk='';konus(s,'ekin');assert.equal(s.flags.talk,'ekin:gun3');
 sec(s,D.dialogue(s,'ekin'),'İsimsiz kalsın.');assert.equal(s.flags.undurAd,'kalsin');
 assert.ok(D.defterSatirlari(s).at(-1).includes('İsimsiz kalsın dedin; kaldı.'));
 gunYap(s,4);s.flags.talk='';konus(s,'boran');assert.equal(s.flags.talk,'boran:gun4');
 gunYap(s,6);s.flags.talk='';konus(s,'selvi');assert.equal(s.flags.talk,'selvi:gun6');
 assert.ok(D.dialogue(s,'selvi').text.includes('otuz beş'),'Mirna gecesi güne bağlı');
 const t=D.newState();t.flags.tuhn='kaldi';gunYap(t,8);konus(t,'tuhn');assert.equal(t.flags.talk,'tuhn:tekrar');
 assert.ok(D.dialogue(t,'tuhn').text.startsWith('Lin’e odun'),'çift gün');assert.equal(t.flags.linTuhnOdun,true);
});
test('D1: başka kişinin açık girişi günün sohbetini engellemez',()=>{
 const s=D.newState();s.gun=3;s.flags.talk='mira:yirmi';konus(s,'ekin');assert.equal(s.flags.talk,'ekin:gun3');
});
test('D2 çapraz hafıza: Lin’e çentik sözü, Alf’in ağzından ertesi gün döner',()=>{
 const s=D.newState();s.flags.alfKilic='verildi';s.flags.linCentik='sen';D.anilariKaydet(s);
 assert.ok(!konus(s,'boran').text.includes('çentiklerini'),'aynı gün dönmez');
 D.gunGec(s);s.flags.talk='';s.flags['sohbet_'+s.gun]='x';
 assert.ok(konus(s,'boran').text.startsWith('Çocuğun çentiklerini sen sayıyormuşsun.'));
 s.flags['sohbet_'+s.gun]='x';assert.ok(!konus(s,'boran').text.includes('çentiklerini'),'bir kez');
 const k=D.newState();k.flags.alfKirildi='evet';k.flags.linCentik='sen';D.gunGec(k);D.gunGec(k);
 assert.ok(!konus(k,'boran').text.includes('çentiklerini'),'Alf kırıldıysa susar');
 const t=D.newState();t.flags.tuhn='kaldi';D.gunGec(t);D.gunGec(t);t.flags['sohbet_'+t.gun]='x';
 assert.ok(konus(t,'nil').text.startsWith('Tuhn amca odun getiriyor. Dört parça, saydım.'));
});
test('D3 ikinci tanık: taş birine gösterilir, görev kapanır, Uslu ertesi gün anlatır',()=>{
 const s=D.newState();s.inventory.cakil=1;s.flags.usluSoru='4';
 assert.equal(D.questList(s).find(q=>q.id==='tanik').active,true);
 const d=konus(s,'ekin');sec(s,d,'Uslu’nun taşı. Bak.');assert.equal(s.flags.talk,'ekin:tas');
 assert.equal(s.flags.usluTanik,'undur');assert.equal(s.flags.cakilGosterildi,true);assert.equal(s.inventory.cakil,1,'taş heybede kalır');
 assert.ok(D.questList(s).find(q=>q.id==='tanik').done);
 s.flags.talk='';assert.ok(!konus(s,'nil').choices.some(c=>c.label==='Uslu’nun taşı. Bak.'),'ikinci kişide seçenek yok');
 assert.ok(!konus(s,'uslu').text.startsWith('Undur geldi'),'aynı gün değil');
 D.gunGec(s);assert.ok(konus(s,'uslu').text.startsWith('Undur geldi. Soru sordu.'));
 assert.ok(D.defterSatirlari(s).some(l=>l.startsWith('Uslu. Taşı sende. İkinci tanığı Undur;')));
});
test('D4 Lin’in közü: kral ölünce sorar, cevap hedefin ağzından ertesi gün döner',()=>{
 const s=D.newState();s.flags.kral='oldu';s.flags.sozNil='verildi';
 assert.equal(D.bekleyen(s,'nil'),true);
 sec(s,konus(s,'nil'),'Közü kime götürsün, söyle.');assert.equal(s.flags.talk,'nil:koz');
 sec(s,D.dialogue(s,'nil'),'Undur’a. Yazarken eli üşüyor.');assert.equal(s.flags.linKoz,'undur');
 assert.equal(D.bekleyen(s,'nil'),false);
 s.flags.talk='';assert.ok(!konus(s,'ekin').text.includes('köz'));
 D.gunGec(s);s.flags['sohbet_'+s.gun]='x';s.flags.talk='';
 assert.ok(konus(s,'ekin').text.includes('Çocuk köz getiriyor. Elim ısınınca'));
 assert.ok(D.dialogue({...s,flags:{...s.flags,talk:''}},'nil').text.includes('Undur amcaya götürüyorum'));
 assert.ok(D.defterSatirlari(s).some(l=>l.includes('Közü artık Undur’a taşıyor.')));
});
test('D5 eşya/yemin: Alf’in kılıcı Son Muhafız’ı geçirir; defter Undur’a yemini okutur',()=>{
 const s=D.newState();
 assert.ok(!konus(s,'muhafiz').choices.some(c=>c.label==='Elimdeki kılıca bak.'),'kılıçsız yok');
 s.inventory.guard=1;s.equipment.weapon='guard';
 sec(s,konus(s,'muhafiz'),'Elimdeki kılıca bak.');sec(s,D.dialogue(s,'muhafiz'),'Yemin.');
 assert.equal(s.flags.muhafiz,'gecti');assert.equal(s.flags.muhafizKilic,'gordu');
 s.flags.talk='';assert.ok(D.dialogue(s,'muhafiz').text.startsWith('Kılıç hâlâ belinde.'));
 const r=D.newState();r.inventory.ledger=1;r.flags.fugitive='protected';r.flags.rauf='korundu';
 sec(r,konus(r,'ekin'),'Alf’in nöbet defteri bende. Bir bak.');assert.equal(r.flags.raufYemin,'okundu');
 r.flags.talk='rauf:korundu1';assert.ok(D.dialogue(r,'rauf').choices.some(c=>c.label==='Yeminini okudum.'));
});
test('D7 yalanın geç bedeli: Alf ertesi gün yüzleşir, Son sayfa yazar',()=>{
 const s=D.newState();s.flags.alfKilic='verildi';s.flags.medicine='rauf';s.flags.medicineDone=true;s.flags.alfKarsi='yalan';s.flags.fugitive='protected';
 D.anilariKaydet(s);konus(s,'boran');assert.notEqual(s.flags.talk,'boran:yalan','aynı gün değil');
 D.gunGec(s);s.flags.talk='';konus(s,'boran');assert.equal(s.flags.talk,'boran:yalan');
 sec(s,D.dialogue(s,'boran'),'Haklısın. Gördüm.');assert.equal(s.flags.alfKarsi,'itirafGec');
 assert.ok(D.defterSatirlari(s).some(l=>l.includes('Yalanın ona erken geldi')));
 D.gunGec(s);s.flags.talk='';konus(s,'boran');assert.notEqual(s.flags.talk,'boran:yalan','bir kez');
});
test('D7 Karga’nın payı: sır saklandıysa bir avuç et, bir kez',()=>{
 const s=D.newState();s.flags.obrukDepo='biliyorum';s.flags.obrukSir='sakladin';
 const d=konus(s,'karga');assert.ok(d.text.startsWith('Bey hâlâ uyuyor. Sen bir şey söylemedin.'));
 const et=s.inventory.tuzet||0;sec(s,d,'Bir avuç yeter.');assert.equal(s.inventory.tuzet,et+1);
 assert.ok(!konus(s,'karga').choices.some(c=>c.action==='karga_pay'));D.choose(s,'karga_pay');assert.equal(s.inventory.tuzet,et+1);
 const o=D.newState();o.flags.obrukSir='soylendi';assert.ok(!konus(o,'karga').choices.some(c=>c.action==='karga_pay'));
});
test('D6 Alf–Rauf yüzleşmesi: motor teslimde açar, her dal teslimi tamamlar',()=>{
 for(const [lab,soz] of [['Kızı için kaçtı. Yedi yaşındaydı.','kiz'],['Söyleyecek bir şeyim yok. İkinizin arası.','sus'],['Defteri bana ver, adını ben sileyim.','sil']]){
  const olay=[];const g=new Engine({getContext:()=>({})},D.newState(),ses,()=>{},e=>olay.push(e));const s=g.state;
  s.flags.rauf='takip';s.flags.alfKilic='verildi';g.world=W.makeWorld('haven');
  const alf=g.world.entities.find(x=>x.id==='boran');s.x=alf.x+10;s.y=alf.y;
  g.update(0.016);
  assert.equal(s.flags.talk,'boran:teslim');assert.ok(olay.some(e=>e.type==='dialogue'&&e.id==='boran'));
  sec(s,D.dialogue(s,'boran'),lab);
  assert.equal(s.flags.alfRaufSoz,soz);assert.equal(s.flags.ledgerDone,true);assert.equal(s.inventory.life,1);
  if(soz==='kiz')assert.ok(D.defterSatirlari(s).some(l=>l.includes('daha ince çekerdim')));
  g.destroy();}
});
test('D6 Rauf yolda: her mekâna ilk girişte bir cümle, bir kez',()=>{
 const olay=[];const g=new Engine({getContext:()=>({})},D.newState(),ses,()=>{},e=>olay.push(e));const s=g.state;
 s.flags.rauf='takip';g.changeZone('disari',[20,20]);
 assert.equal(s.flags.talk,'rauf:yol_disari');assert.ok(olay.some(e=>e.type==='dialogue'&&e.id==='rauf'));
 s.flags.talk='';g.changeZone('disari',[20,20]);assert.equal(s.flags.talk,'');
 g.destroy();
});
test('D8: hikâye ikinci kez sorulunca kısa giriş, “Anlat.” baştan açar',()=>{
 const s=D.newState();D.choose(s,'story:mira:1');assert.equal(s.flags.talk,'mira:1');
 D.choose(s,'story:bitir');D.choose(s,'story:mira:1');assert.equal(s.flags.talk,'mira:yine');
 sec(s,D.dialogue(s,'mira'),'Anlat.');assert.equal(s.flags.talk,'mira:1');
});
test('Ana sayılar değişmedi; eski kayıt yeni bayraklar olmadan açılır',()=>{
 const s=D.newState();delete s.flags.talk;const y=D.parseSave(JSON.stringify(s));assert.ok(y);
 assert.ok(konus(y,'mira').text.length>0);assert.ok(D.defterSatirlari(y).at(-1).startsWith('Sen. Yetmiş ikinci.'));
 for(const k of Object.keys(s.flags))assert.ok(!k.startsWith('yemin_')||s.flags[k]===y.flags[k]);
});

console.log(`\n${gecti} test geçti, ${kaldi} kaldı.`);
if(kaldi)process.exit(1);
