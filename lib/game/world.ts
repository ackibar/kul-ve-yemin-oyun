import type {ItemId,Zone} from './data';
export type Entity={id:string;type:'npc'|'chest'|'portal'|'lever'|'core'|'fire'|'decor'|'trap'|'yatak'|'ceset';x:number;y:number;name?:string;/** Cogunlukla numara (characters/N/), ama oyuncunun silah varyanti setleri
 *  ('1sword','1bow','1balta','1mesale','1swordmesale') de gecerli - motor
 *  sprite anahtarini `characters${portrait}${yon}${eylem}` diye kuruyor,
 *  bu yuzden dogrudan STRING olarak da calisiyor (bkz. harita-editor.html
 *  Karakterler modu: ayni yuruyus animasyonunu, sadece silahi degistirerek
 *  tekrar kullanmak icin, yeni bir PixelLab uretimi GEREKMEDEN). */portrait?:number|string;asset?:string;to?:Zone;spawn?:[number,number];items?:[ItemId,number][];gold?:number;s?:number;/** Dolasma sisteminden muaf: oldugu yerde durur (nobetci, tezgah sahibi). */sabit?:boolean;/** Sprite capasi (zemin satiri/2). Oturan kral gibi kisa figurler icin; yoksa 31. */capa?:number;/** harita-editor.html'in "Nesneler" modunda eklenen tekil PNG - boyali
 *  sahnenin UZERINE, actors[] y-sirasina gore cizilir (normal decor gibi
 *  gizli kalmaz). asset public/assets/<asset>.png yolunu gosterir. */overlay?:boolean;
 /** Cizim katmani - varsayilan 0 (oyuncu/mob/normal decor hepsi 0, aralarinda
  *  y konumuna gore siralanir, eskisi gibi). Farkli bir sayi verilirse ONCE
  *  KATMANA gore siralanir (buyuk katman her zaman ustte), y sadece AYNI
  *  katmandakiler arasinda tie-break olur - yani layer:1 verilen bir nesne
  *  y'si ne olursa olsun HER ZAMAN oyuncunun (layer 0) onunde, layer:-1 HER
  *  ZAMAN arkasinda kalir. Katman -1/0/1 ile sinirli degil, istenildigi kadar
  *  yukari/asagi katman kullanilabilir (bkz. engine.ts render() aktors.sort). */layer?:number;
 /** Dondurme acisi RADYAN cinsinden (harita-editor.html'in Nesneler modundaki
  *  donus tutamacindan gelir, derece degil - motora dogrudan sprite()'in
  *  donder parametresi olarak geciyor). Yalniz overlay decor icin anlamli. */aci?:number};
// kind 3 (solucan) kaldirildi: kullanici "cok kotu duruyordu" dedi, tepeden
// cizilmis bir halka olarak okunmuyordu ve yon de tasimiyordu.
/* kind 12 = AZMAN ISKELET: 11'in buyugu. Ayri sprite YOK - motor 11'in
   sheet'lerini buyuk olcekle ciziyor (bkz. engine.ts dusmanPoz/DUSMAN_OLCEK). */
export type EnemySpec={id:string;kind:1|2|4|5|6|7|8|9|10|11|12;x:number;y:number;boss?:boolean};
export type World={zone:Zone;w:number;h:number;tiles:number[][];entities:Entity[];enemies:EnemySpec[];spawn:[number,number];
 /** Karo biriminde carpisma sekli - UZUNLUGA gore ayirt edilir (harita-editor.html
  *  "Engeller" modu ile uretilir):
  *  - 4 sayi [x1,y1,x2,y2]: dikdortgen (eskisi gibi).
  *  - 5 sayi [x1,y1,x2,y2,1]: elips, ayni sinirlayici kutuya icirilmis.
  *  - >=7 sayi (tek sayida, son eleman 2) [x0,y0,x1,y1,...,xn,yn,2]: cokgen
  *    (pen tool), oncesindeki CIFT sayilar en az 3 noktalik duz nokta listesi. */
 blockers:number[][];
 /** Uzerine BASINCA bolge degistiren kutular (karo birimi, x2/y2 haric).
  *  Kapi nesnesine basmak yerine tunelden yuruyerek gecmek icin. */
 gecisler:{kutu:[number,number,number,number];to:Zone;spawn:[number,number]}[];
 /** Yurunebilir ama olumcul: icine giren asagi dusup olur. */
 ucurumlar:[number,number,number,number][];
 /** Arka plana BOYALI sabit isik kaynaklari (duvar mesalesi gibi): dunya birimi x,y ve yaricap.
  *  Ates entity'leri ayri, motor onlari zaten biliyor. Konumlar arka plandaki sicak-parlak
  *  piksel kumelerinden olculdu (kume merkezi /32 = karo). */
 isiklar:[number,number,number][]};
/** Kralin oturan sprite'inin zemin satiri/2; scripts/kral_uret.py kurunca yazar.
 *  Kral 128x128 hucrede (digerleri 64): olcekle buyutulunce pikselleri sahnenin
 *  iki kati oluyordu, cozum daha yuksek cozunurluklu kaynak. */
const KRAL_CAPA=61;
export function makeWorld(zone:Zone,flags?:Record<string,string|boolean|undefined>):World{
 const kare=zone==='haven'||zone==='magara';
 // Kare mekanlar 30x30: siginak, magara ve yikik. Kul Ovasi 54x30.
 const kare30=kare||zone==='yikik';
 // Boyali tek parca sahneler: Kul Ovasi ve Sarnic 54x30, digerleri 30x30.
 const genis=zone==='disari'||zone==='cistern';
 /* Dar Gecit dikey: 13 genislik, 63 boy. test100 artik 100x100 olcek denemesi
    DEGIL, gercek bir mekan: terk edilmis tas koridor. Boyut GORSELDEN geliyor -
    gorsel 2x kucultulup (1376x768) 32 px/karo yogunluguna cekildi -> 43x24. */
 const w=zone==='tunel'?13:zone==='test100'?43:genis?54:kare30?30:46,h=zone==='tunel'?63:zone==='test100'?24:genis?30:kare30?30:48;
 const tiles=Array.from({length:h},()=>Array<number>(w).fill(0));
 const room=(x:number,y:number,rw:number,rh:number)=>{for(let j=y;j<y+rh;j++)for(let i=x;i<x+rw;i++)tiles[j][i]=1};
 const entities:Entity[]=[],enemies:EnemySpec[]=[];
 /** Arka plan gorselinde boyali olan mobilyanin carpisma kutulari (karo birimi,
  *  x2/y2 haric). Gorsel carpisma izgarasini bilmedigi icin elle cikarildi;
  *  bkz. scripts/haven_engel.py ve generated/_ENGELLER.png dogrulama katmani. */
 const blockers:number[][]=[];
 const gecisler:World['gecisler']=[];const ucurumlar:World['ucurumlar']=[];const isiklar:World['isiklar']=[];
 const gecis=(x1:number,y1:number,x2:number,y2:number,to:Zone,spawn:[number,number])=>
  gecisler.push({kutu:[x1,y1,x2,y2],to,spawn});
 /** Ucurum yurunebilir olmali ki icine girilebilsin; olumu motor veriyor. */
 const ucurum=(x1:number,y1:number,x2:number,y2:number)=>{
  for(let j=y1;j<y2;j++)for(let i=x1;i<x2;i++)tiles[j][i]=1;
  ucurumlar.push([x1,y1,x2,y2]);};
 const at=(e:Entity)=>entities.push({...e,x:e.x*16+8,y:e.y*16+8});
 const fire=(x:number,y:number)=>at({id:`fire${x}_${y}`,type:'fire',x,y});
 const decor=(id:string,x:number,y:number,asset:string,name?:string)=>at({id,type:'decor',x,y,asset,name:name||(asset.includes('Table')?'Zanaat Masası':undefined)});
 const chest=(id:string,x:number,y:number,items:[ItemId,number][],gold=0)=>at({id,type:'chest',x,y,items,gold,name:'Sandık'});
 const enemy=(id:string,kind:EnemySpec['kind'],x:number,y:number,boss=false)=>enemies.push({id,kind,x:x*16+8,y:y*16+8,boss});
 if(zone==='haven'){
  /* @harita-editor:nesneler */
  at({id:'ed1789494393188_1',type:'decor',x:5.8122,y:13.286,asset:'nesne/ed_props',s:0.135,overlay:true});
  at({id:'ed1789503532963_4',type:'decor',x:22.1821,y:9.5584,asset:'nesne/ed_alet_tezgahi_table',s:0.131,layer:-1,overlay:true});
  at({id:'ed1789584378861_1',type:'decor',x:23.9312,y:18.2519,asset:'nesne/ed_codex_go_rseli_16_eyl_2026_21_45_53',s:0.131,overlay:true});
  /* @harita-editor:nesneler-son */

  blockers.push([11.7,3.8,12.6,8.6],[10.35,7.3,11.85,9.3],[11,10.55,12.45,11.3],[3.15,10.25,3.65,14.35],[6.28,18.62,10.7,20.4],[6.25,22.6,10.2,24.2],[3.95,22.24,5.6,24.35],[3.8,19.99,5.85,22.6],[19.25,9.63,20.1,10.55],[22.89,11.31,23.7,12.25],[23.45,9.87,24.3,10.75],[20.14,22.82,23.25,24.15],[24.8,18.9,26.7,22.1],[18.3,24.05,19.2,29],[19.22,24.41,26.95,24.85],[17.37,3.74,18.15,7.95],[12.45,0.7,13.25,4.5],[16.75,0.68,17.45,4.45],[16.73,5.37,17.6,6.2],[10.5,22.75,11.8,24.35],[6.03,19.61,5.96,18.6,4.95,18.07,4.66,18.25,4.54,17.96,4.29,17.53,3.94,17.37,3.84,17.36,3.89,18.74,4.99,20.15,2],[11.74,24.35,11.7,29.05,10.56,29.03,10.57,24.91,3.93,24.81,3.95,23.65,11.76,23.71,2],[11.79,24.71,12,24.78,12.07,24.88,12.14,24.97,12.23,25.09,12.28,25.18,12.36,25.35,12.38,25.47,12.39,25.61,12.53,25.77,12.7,25.9,12.77,25.95,12.9,25.9,12.97,25.9,13.13,25.95,13.19,26.05,13.23,26.14,13.28,26.23,13.41,26.28,13.43,26.39,13.42,26.5,13.47,26.66,13.53,26.78,13.6,26.9,13.73,27.07,13.87,27.43,13.88,27.57,13.87,27.65,14.09,27.86,13.98,27.92,13.88,27.91,13.71,27.82,13.65,27.78,13.56,27.83,13.6,28.03,13.49,28.11,13.3,28.11,13.09,28.02,12.98,28.2,12.69,28.19,12.54,28.28,12.58,29.15,11.67,29.03,2],[23.58,24.38,23.46,24.03,23.53,23.45,23.65,23.15,23.91,22.92,24.43,22.84,24.71,22.96,24.93,23.21,24.95,23.61,24.96,24.1,24.99,24.37,24.96,24.51,24.73,24.65,24.51,24.72,24.4,24.75,24.11,24.72,23.86,24.63,2],[25.14,23.6,25.21,23.96,25.3,24.14,25.46,24.28,25.77,24.38,26.09,24.35,26.31,24.18,26.44,24.06,26.66,23.77,26.6,23.46,26.57,22.76,26.27,22.37,25.83,22.27,25.44,22.37,25.2,22.78,25.13,23,2],[11.8,8.08,3.69,8.36,3.68,10.32,3.11,10.28,3.1,4.07,11.74,4.05,2],[5.75,10.16,9.85,10.16,9.86,8.45,5.73,8.47,2],[5.24,9.08,5.26,10.07,5.28,11.23,4,11.26,3.71,11.23,3.74,9.05,2],[17.39,7.82,17.24,7.96,17.24,9.13,17.45,9.27,17.64,9.36,17.97,9.4,18.23,9.26,18.5,9.04,18.49,9.39,19.99,9.38,19.97,8.28,19.98,7.37,18.51,7.36,18.54,8.26,18.48,7.85,18.12,7.91,18.26,7.8,18.2,7.58,2],[12.92,8.42,12.99,9.12,12.8,9.22,12.54,9.22,12.35,9.15,12.18,9.01,12.23,8.43,12.58,7.85,12.77,8.03,12.78,8.21,2],[22.1,18.78,26.77,18.73,26.77,18.37,22.02,18.42,2],[22.96,13.8,22.95,14.83,24.72,14.94,25.07,14.22,24.94,13.21,23.24,13.02,2],[25.24,14.24,25.37,14.69,25.55,14.9,26.11,15.01,26.4,14.88,26.62,14.64,26.71,14.31,26.74,13.71,26.65,13.37,26.42,13.17,26.74,12.97,26.73,10.84,26.55,10.7,25.21,10.74,25.22,13.28,25.37,13.35,25.34,13.52,25.32,13.63,25.3,13.75,25.25,13.93,25.22,14.13,2],[25.32,9.7,25.53,9.97,25.74,10.07,26,10.14,26.2,10.07,26.6,9.9,26.74,9.52,26.75,8.96,26.54,8.48,25.97,8.12,25.52,8.26,25.34,8.47,25.17,8.87,25.25,9.1,25.26,9.42,2],[24.42,9.14,24.46,9.98,24.87,10.03,24.85,9.13,24.98,9.15,24.98,7.38,20.31,7.39,20.34,9.12,20.52,9.14,20.55,9.99,20.94,9.99,20.97,9.14,2],[26.41,4.3,26.48,24.88,27.01,24.91,26.85,4.19,2],[19.85,12.44,20.3,12.72,20.59,12.82,21.14,12.82,21.45,12.64,21.8,12.59,21.89,12.37,22.08,12.12,22.01,11.78,21.94,11.55,21.57,11.35,21.48,11.18,21.07,11.15,20.88,11.17,20.64,11.2,20.21,11.25,19.84,11.69,19.77,11.86,19.78,12.29,2],[19.55,20.86,19.76,21.01,20.14,21.04,20.25,21.11,20.82,21.12,20.96,20.92,21.26,20.94,21.48,20.75,21.53,20.59,21.67,20.38,21.54,20.11,21.41,19.82,21.18,19.67,21.01,19.57,20.75,19.51,20.55,19.39,20.25,19.44,20.14,19.5,19.91,19.52,19.76,19.63,19.51,19.74,19.36,19.99,19.28,20.14,19.29,20.51,19.48,20.64,2],[3.65,13.6,9.05,13.88],[6.54,21.66,6.69,21.45,6.8,21.24,6.65,20.9,6.51,20.68,6.45,20.45,6.21,20.39,6.06,20.52,6.04,20.7,6.02,20.92,5.96,21.04,5.96,21.24,6,21.49,6.11,21.6,6.29,21.67,2],[11.22,20.31,11.64,20.33,11.95,20.23,11.96,19.91,11.78,19.57,11.78,19.29,11.94,19.03,11.86,18.47,11.69,18.38,11.46,18.5,11.44,19.03,11.41,19.42,11.23,19.42,11.11,19.52,10.93,19.59,10.82,19.8,10.93,19.96,10.99,20.16,2],[16.65,5.61,16.5,5.74,16.43,5.95,16.55,6.11,16.71,6.35,16.84,6.5,17.05,6.62,17.2,6.53,17.36,6.29,17.16,5.88,16.99,5.51,2],[16.7,5.6,16.64,5.36,16.36,5.46,16.14,5.37,16.17,5.24,16.43,5.12,16.6,4.86,16.67,4.74,16.86,4.64,16.88,4.5,17.29,4.44,17.44,5.65,16.88,5.65,16.7,5.34,16.55,5.34,16.61,5.37,2],[1.41,14.98,1.76,15.32,1.95,15.46,2.75,15.36,3.1,15.19,3.66,15.17,3.62,14.96,3.62,14.65,3.87,14.7,4.04,14.61,4.06,14.41,3.83,14.3,2.48,14.03,2.42,14.03,2.15,14.12,1.72,14.28,1.66,14.3,1.26,14.57,2],[3.58,17.36,3.18,17.51,2.93,17.61,2.53,17.73,2.3,17.88,2.03,17.78,1.83,17.78,1.55,17.98,1.55,18.36,2.23,18.36,2.63,18.58,3.66,18.63,4.01,18.61,4.61,18.28,2],[12.15,11.63,12.56,11.55,12.77,11.46,12.91,11.35,12.94,11.15,13.17,11,13.2,10.85,13.13,10.75,13.05,10.69,13.06,10.5,12.66,10.15,12.57,10.03,12.51,10,12.24,10.01,12.08,10.02,12.03,9.96,11.83,9.95,11.67,10.04,11.55,10.07,11.39,10.07,11.27,10.06,11.11,10.19,10.99,10.34,10.83,10.5,10.77,10.6,10.79,10.71,10.72,10.85,10.71,11.03,10.79,11.14,10.87,11.28,10.96,11.42,11.21,11.57,11.56,11.59,11.63,11.64,11.8,11.66,2],[20.38,5.58,24.85,9.2],[20.53,9.6,24.8,10]);
  // Zemin ve carpisma ARTIK ELLE YAZILMIYOR: yeni mekan tek sahne gorseli +
  // ayri prop sayfasi olarak geldi, ikisi de scripts/mekan_kur.py ile islendi.
  // ZEMIN arka planin aydinlik kismindan, blockers prop katmaninin alfasindan
  // cikti. Gorsel degisirse script yeniden calistirilip bu iki satir guncellenir;
  // dogrulama katmani generated/_YENI_ENGEL.png.
  const ZEMIN=['000000000000000000000000000000','000000000000000000000000000000','000000000000111111000000000000','000000000000111111000000000000','000001111111111111111111110000','000111111111111111111111111000','000111111111111111111111111000','000111111111111111111111111000','000111111111111111111111111000','000111111111111111111111111000','000111111111111111111111111000','000111111111111111111111111000','000111111111111111111111111000','000111111111111111111111111000','000111111111111111111111111000','011111111111111111111111111000','011111111111111111111111111000','000111111111111111111111111000','000111111111111111111111111000','000111111111111111111111111000','000111111111111111111111111000','000111111111111111111111111000','000111111111111111111111111000','000111111111111111111111111000','000000000001111111100000000000','000000000000111111000000000000','000000000000111111000000000000','000000000000111111000000000000','000000000000000000000000000000','000000000000000000000000000000'];
  for(let j=0;j<h;j++)for(let i=0;i<w;i++)tiles[j][i]=ZEMIN[j][i]==='1'?1:0;
  at({id:'mira',type:'npc',x:9,y:16,name:'Mirna',portrait:3});at({id:'boran',type:'npc',x:17,y:11,name:'Alf',portrait:2});at({id:'ekin',type:'npc',x:20,y:17,name:'Undur',portrait:4});
  // Elvi ust kapinin dibinde: cevrildigi kapidan uzaklasmiyor. Lin sag-alt
  // ocagin yaninda. Tiga indiyse ve Tuhn ucurumdan cekildiyse ikisi de o atesin
  // basina gelir. `s` sprite olcegi: cocuklar icin ayni sheet kucuk cizilir.
  at({id:'selvi',type:'npc',x:13,y:6,name:'Elvi',portrait:9});
  at({id:'nil',type:'npc',x:18,y:21,name:'Lin',portrait:7,s:.74});
  // Kral: sol ust kosede oturur, kimse bakmaz. Uslu ortada dolasir.
  /* Kral: vurulabilir (engine kralHasar). Oldurulduyse kosede cesedi kalir.
     Yeri (5,6) idi: haritanin sol UST cebi, 22 adim uzakta ve ancak ust
     kenardan dolasarak giriliyordu - oyuncu oraya hic ugramiyordu. Ana odanin
     bati koseligine alindi (13 adim, Mirna'nin hemen yaninda): gorulen ama
     kimsenin ugramadigi bir kose. Kendi mekani yapilinca oraya tasinacak. */
  if(flags?.kral==='oldu')at({id:'kralCeset',type:'ceset',x:5,y:17,name:'Kral',asset:'kral_ceset'});
  else at({id:'kral',type:'npc',x:5,y:17,name:'Kral',portrait:13,sabit:true,capa:KRAL_CAPA,s:.58});
  // Uslu tek mekana bagli degil: flags.usluYer 'magara' ise Sarnic Agzi'nda,
  // yoksa (varsayilan) burada dolasir - bkz. engine.ts changeZone (siginak<->
  // magara kapisindan gecerken yari ihtimalle yer degistirir).
  if(flags?.usluYer!=='magara')at({id:'uslu',type:'npc',x:14,y:19,name:'Uslu',portrait:14});
  if(flags?.ayaz==='indi')at({id:'ayaz',type:'npc',x:16,y:21,name:'Tiga',portrait:8,s:.9});
  if(flags?.tuhn==='kaldi')at({id:'tuhn',type:'npc',x:19,y:22,name:'Tuhn',portrait:6});
  gecis(12,27,18,28,'magara',[15,5]);   // asagi inen tunelin sonu
  // Ust kapinin agzi ZEMIN esiginde karanlik kaldigi icin kapanmisti; koridor
  // elle aciliyor, disari cikis da onun ucunda.
  for(let j=2;j<4;j++)for(let i=12;i<18;i++)tiles[j][i]=1;
  gecis(12,2,18,3,'disari',[27,27]);    // ust kapi: kul ovasina cikis
  /* GECICI TEST KAPISI - kullanici "100x100 test mekani" karar verince
     kaldirilacak. Depo denemesinde aynen bu satirlar reachable oldugu
     WASD ile dogrulanmisti (Kral'in koltugunun hemen kuzeyi), o yuzden
     ayni yer tekrar kullanildi - "bos gorunuyor ama izole" hatasi
     tekrarlanmasin diye. */
  for(let j=15;j<17;j++)for(let i=1;i<3;i++)tiles[j][i]=1;
  gecis(1,15,3,17,'test100',[36,14]);   // tas koridora gecis (bati kapisi -> koridorun DOGU ucu)
  // Ocaklarda boyali ALEV yok, sadece kor ve odun var; animasyonlu alevi motor
  // buraya koyuyor. Konum ocak halkasinin prop bileseninden olculdu.
  // Capa: Fire1 sprite'i 32 birimlik hucrenin TAMAMINI dolduruyor ve sprite()
  // hucreyi y+6'da bitiriyor, yani alevin TABANI y+6. Halkanin biraz on-altina
  // otursun diye y = merkez + halka_yuksekligi*0.35 - 6.
  entities.push({id:'alev0',type:'fire',x:190.8,y:171.9,s:1.16});entities.push({id:'alev1',type:'fire',x:334.0,y:190.6,s:1.16});/* Lin'in atesi. Cocugun sozu kirildiysa (flags.nilSondu) ARTIK YANMIYOR:
     boyali koz yerinde kalir, animasyonlu alev cizilmez. */
  if(flags?.nilSondu!=='evet')entities.push({id:'alev2',type:'fire',x:327.2,y:323.4,s:1.13});
  decor('table2',22.1,7.5,'Tables/2.png','Zanaat Masası');
  // Alt-soldaki yatak: etkilesim noktasi yatagin UST kenarinin hemen disinda,
  // cunku yatagin kendisi engel ve icinden gorus hatti kurulamiyor.
  entities.push({id:'yatak',type:'yatak',x:9.5*16,y:21.7*16,name:'Uyu'});
  // Digerlerinin yataklari: uzerlerinde de "Uyu" cikar ama oyuncu kendi
  // yataginda olmadigini soyler (engine.ts interact).
  entities.push({id:'yatak2',type:'yatak',x:7*16,y:17.7*16,name:'Uyu'});
  entities.push({id:'yatak3',type:'yatak',x:7*16,y:10.4*16,name:'Uyu'});
  /* Yay sandigi: haritanin DOGU kenarina alindi (eskiden 14,22 - ana yolun
     uzerindeydi ve oyunun ilk dakikasinda tam donanim veriyordu). Artik
     yalnizca yay ve ok var; menzilli dovusu denemek isteyen gidip bulsun. */
  chest('havenGift',25,16,[['bow',1],['arrow',25]]);
  }else if(zone==='disari'){
  // Kul Ovasi: siginakin ust kapisindan cikilan dis dunya (54x30 karo).
  // Zemin ve carpisma scripts/mekan_kur.py ile iki katmandan cikarildi:
  // ZEMIN arka planin aydinlik bolgesinden (ustteki 9 satir gokyuzu, bastan
  // kesildi), blockers prop katmaninin alfasindan. Kenarlara gorunmez duvar
  // yok; can hizla eridigi icin oyuncu zaten uzaga gidemiyor.
  const ZEMIN=['000000000000000000000000000000000000000000000000000000','000000000000000000000000000000000000000000000000000000','000000000000000000000000000000000000000000000000000000','000000000000000000000000000000000000000000000000000000','000000000000000000000000000000000000000000000000000000','000000000000000000000000000000000000000000000000000000','000000000000000000000000000000000000000000000000000000','000000000000000000000000000000000000000000000000000000','000000000000000000000000000000000000000000000000000000','111111111111111111111111111111111111111111111111111111','111111111111111111111111111111111111111111111111111111','111111111111111111111111111111111111111111111111111111','111111111111111111111111111111111111111111111111111111','111111111111111111111111111111111111111111111111111111','111111111111111111111111111111111111111111111111111111','111111111111111111111111111111111111111111111111111111','111111111111111111111111111111111111111111111111111111','111111111111111111111111111111111111111111111111111111','111111111111111111111111111111111111111111111111111111','111111111111111111111111111111111111111111111111111111','111111111111111111111111111111111111111111111111111111','111111111111111111111111111111111111111111111111111111','111111111111111111111111111111111111111111111111111111','111111111111111111111111111111111111111111111111111111','111111111111111111111111111111111111111111111111111111','111111111111111111111111111111111111111111111111111111','111111111111111111111111111111111111111111111111111111','111111111111111111111111111111111111111111111111111111','111111111111111111111111111111111111111111111111111111','111111111111111111111111111111111111111111111111111111'];
  for(let j=0;j<h;j++)for(let i=0;i<w;i++)tiles[j][i]=ZEMIN[j][i]==='1'?1:0;
  blockers.push([6.76,15.32,9.1,14.21,10.6,13.29,12.48,12.13,14.82,10.6,20.66,7.18,21.16,5.11,21.89,5.41,21.96,6.14,22.5,6.6,23.23,7.41,23.39,8.26,23.39,9.37,23.5,9.83,23.54,10.25,23.46,11.14,23.5,11.94,23.65,12.86,23.69,13.29,23.73,13.82,23.77,14.71,23.81,15.59,23.92,16.97,24.08,18.01,24.08,18.78,22.69,18.93,22.31,18.78,21.89,18.85,21.35,19.05,20.28,19.47,19.93,19.43,19.89,17.51,19.62,16.9,19.35,16.67,18.55,16.74,18.12,17.13,18.05,18.59,18.16,19.16,17.86,19.58,16.97,19.81,15.55,20.08,14.25,20.2,13.17,19.74,11.71,19.43,10.52,18.85,9.06,17.63,8.14,17.2,6.68,16.59,5.26,16.13,2],[4.95,16.4,4.57,16.63,3.76,16.93,3.26,16.78,2.73,16.36,1.96,16.09,1.31,15.94,0.31,16.01,0.12,16.17,0,14.71,2.46,14.28,3.11,14.59,4.49,15.09,2],[22.31,6.11,23.16,6.6,23.35,6.8,23.77,6.72,25.08,6.37,25.92,6.03,27,5.72,28.72,5.22,28.57,5.61,28.22,5.76,27.96,5.91,27.46,6.22,27.46,6.6,27.92,6.6,28.57,6.41,28.84,6.53,29.11,6.91,29.49,7.03,29.72,6.95,29.99,6.84,30.41,6.6,30.68,6.87,30.49,7.1,30.14,7.26,29.91,7.6,29.72,8.03,29.84,8.41,30.3,8.18,30.34,9.22,30.34,9.56,30.18,10.18,30.22,10.52,30.3,11.06,30.49,11.6,30.8,12.13,31.22,12.52,31.26,12.9,31.33,13.86,31.45,14.63,31.99,15.13,32.41,15.44,33.14,16.2,33.45,17.28,33.75,17.66,34.75,18.28,36.4,18.55,36.79,18.32,36.71,17.66,36.79,17.28,36.98,17.32,37.82,17.28,38.25,17.47,38.55,17.47,39.59,18.01,40.09,18.55,41.32,18.82,42.59,18.78,42.97,18.51,44.16,18.82,44.89,18.78,45.43,18.89,45.47,19.2,45.27,19.7,45.31,20.16,46.23,20.97,47.08,20.97,47.65,20.7,48.42,20.31,48.84,20.24,49.54,19.74,50.15,19.43,50.65,19.28,51.65,19.28,52.3,19.47,53.03,19.16,53.61,19.2,53.91,19.08,51.65,4.57,31.07,1.96,25.84,2.84,23.04,4.76,2],[25.92,29.68,25.54,29.34,26.04,27.84,25.88,26.96,25.92,25.96,25.5,25.27,24.69,24.81,24.27,24.5,23.35,24.15,21.43,23.96,20.24,24.04,19.55,23.88,18.51,23.88,18.09,24.15,16.24,24.46,15.63,24.46,14.13,24.61,13.13,25.08,12.4,25.27,11.48,25.61,9.79,25.61,7.49,25.61,5.38,25.08,4.8,24.58,4.68,24.08,4.88,23.39,4.76,23.08,3.88,23.31,3.23,23.42,2.69,23.16,2.57,22.77,2.69,22.39,3.07,21.85,3.57,21.58,0.23,23.12,0.08,24.19,0.23,29.8,2],[32.45,27.23,32.64,29.3,33.29,29.91,50.92,29.91,53.88,25.34,53.64,24.73,53.22,24.23,51.8,23.88,51.03,23.88,49.46,24.12,48.92,24.31,47.85,24.65,45.08,25.88,43.97,25.61,42.82,25.34,40.36,25.31,38.05,25.57,35.79,25.61,34.33,25.84,33.64,26.15,2]);
  gecis(24,29,31,30,'haven',[15,4]);   // geldigin agiz: uzerine basinca geri
  // Kemerli yikik kapi: kulun disinda kalan tek kapali mekan.
  gecis(19,20,21,21,'yikik',[15,28]);   // kemerli kapi: uzerinden yuruyunce giriliyor
  // Kul Ovasi'nin tek sakini: sopali trol. Girise UZAGA kondu (bati ucu),
  // cunku ovada can surekli eriyor - oyuncu kapinin onunde ona yakalanirsa
  // kacacak yeri kalmiyor. Uzun bir dovus burada zaten pahali; Kul pelerini
  // takmak ya da hizli bitirmek gerekiyor.
  enemy('trol',7,8,22);
  /* FIRTINA DUSMANLARI. Bogulmus: firtinada olmus, cigeri kul dolu; yavas,
     dayanikli, vurunca oyuncuyu agirlastirir. Fener tasiyan: uzaktan isik
     gosterir, yaklasinca soner ve etrafa Bogulmus birakir. */
  enemy('bog1',8,13,23);enemy('bog2',8,36,22);enemy('bog3',8,43,18);enemy('bog4',8,29,14);
  /* Firtina kalabaligi: dort Bogulmus azdi. Can surekli eridigi icin ova
     yine de en tehlikeli yer; kacmak hala bir secenek. */
  enemy('d0',8,36,28);enemy('d1',8,29,17);enemy('d2',8,12,26);enemy('d3',4,41,20);enemy('d4',4,7,15);enemy('d5',1,52,23);
  enemy('d6',1,39,13);enemy('d7',8,48,20);enemy('d8',8,13,17);enemy('d9',8,1,22);enemy('d10',4,6,23);enemy('d11',4,17,11);
  enemy('d12',1,33,10);enemy('d13',1,7,28);
  enemy('fener1',9,39,24);enemy('fener2',9,7,10);
  /* Kralin son muhafizi: on bir yildir ovada devriyede, emir geri alinmadi.
     Once konusur (NPC); kavga secilirse motor onu kind 10 dusmana cevirir. */
  if(flags?.muhafiz!=='oldu')at({id:'muhafiz',type:'npc',x:46,y:14,name:'Son Muhafız',portrait:15,sabit:true,s:1.1});
 }else if(zone==='yikik'){
  blockers.push([11.59,29.96,11.7,27.61,12.25,27.87,12.8,27.94,13.35,27.54,13.49,27.1,13.38,26.47,13.2,26.22,12.98,25.85,12.65,25.81,12.39,25.45,12.14,25.04,11.81,24.64,11.7,24.16,10.34,23.98,10.34,23.76,10.19,23.25,10.52,22.92,12.17,22.95,13.16,23.03,13.13,22.4,12.94,22.07,12.17,21.89,12.06,21.71,11.73,21.6,11.4,21.6,10.96,21.74,10.52,21.82,9.72,21.85,9.5,21.41,9.24,21.23,8.69,21.12,8.29,20.94,7.88,20.61,8.03,20.42,8.43,20.31,8.84,20.13,8.84,19.73,8.62,19.4,8.29,19.1,7.99,18.96,7.77,18.88,7.37,18.74,7.33,18.41,7.88,18.17,8.13,17.62,8.31,17.51,8.58,17.33,8.72,17.01,8.58,16.85,8.42,16.55,8.42,16.16,8.72,15.96,8.74,15.71,8.72,15.53,8.72,15.35,8.7,15,8.72,14.71,9.2,14.64,9.58,14.84,10.25,14.68,10.34,14.37,10.43,13.91,10.22,13.66,9.86,13.41,9.63,13.23,9.86,12.98,9.81,12.86,9.65,12.73,9.4,12.52,9.22,12.2,9.18,11.88,8.97,11.32,8.83,10.54,9.4,10.38,11.54,10.43,13.8,9.45,14.46,9.11,10.47,2.82,1.91,1.96,2.03,26.2,2],[18.3,24.07,18.23,29.97,27.37,29.67,27.93,24.87,27.03,1.77,24.33,1.43,17.27,8.1,16.73,9.3,17.13,9.67,18.5,10.1,19.8,10.43,25.43,10.37,25.47,12.8,26.33,19.13,26.43,24.1,2],[16.7,18.57,16.8,19.2,26.23,19.23,26.37,18.43,2]);
  // Kul Ovasi'ndaki kemerli yikintinin ici (30x30). Zemin boyali sahne,
  // carpisma da uzerine YESIL boyanmis maskeden okundu - burada yesil
  // ENGEL demek, prop sayfalarindaki gibi "silinecek fon" degil.
   const ZEMIN=['000000000000000000000000000000','000000000000000000000000000000','000000000000000000000000000000','000000000000000000000000000000','000000000000000000000000000000','000000000000000000000000000000','000000000000000000000000000000','000000000000000000000000000000','000000000000000000000000000000','000000000000001000000000000000','000000000011101101111111100000','000000000111111111111111100000','000000000011111111111111100000','000000000011111111111111000000','000000000011111111111110000000','110000001111111111111000000000','100000001111111111100000000000','100000001111111111000000000000','000000011111111110000000000000','000000100111111110101110000000','000000011111111111111111110000','000000000111111111111111110000','000000000001111111111111110000','000011111111111111111110110000','000000000000111111000000000000','000000000000111111000000000000','000000000000011111000000000000','000000000000011111000000000000','000000000000111111000000000000','000000000000111111000000000000'];
  for(let j=0;j<h;j++)for(let i=0;i<w;i++)tiles[j][i]=ZEMIN[j][i]==='1'?1:0;
  gecis(12,29,18,30,'disari',[19,21]);   // alt koridor: disariya cikis
  // Rauf Alf'e teslim edildiyse sonu burasi oluyor.
  if(flags?.rauf==='teslim')at({id:'raufCeset',type:'ceset',x:16,y:17,name:'Rauf'});
  // Tiga: Sara'nın "bekle" dedigi yer. Siginaga indiyse burada degil.
  if(flags?.ayaz!=='indi')at({id:'ayaz',type:'npc',x:12,y:12,name:'Tiga',portrait:8,s:.9});
 }else if(zone==='magara'){
  blockers.push([12.27,8.38,11.45,8.24,10.78,8.18,10.66,8.26,10.12,8.71,9.71,8.63,9.19,8.38,8.47,8.32,8.3,8.63,7.91,9,7.53,9.04,7.06,9.19,6.69,9.38,6.25,9.56,6.09,9.62,5.77,9.89,5.51,10.02,4.95,10.27,4.57,10.43,4.31,10.51,3.62,10.72,3.62,14.28,1.9,14.01,2.32,5.46,3.75,3.33,7.64,2.42,10.39,2.15,12.71,2.21,12.6,8.03,2],[17.39,2.59,17.37,8.24,17.94,8.44,18.34,8.13,18.54,8.07,19.19,8.36,20.64,9.04,21.03,9.33,21.9,9.81,22.29,9.98,22.73,10.12,25.32,9.59,25.67,6.29,25.12,3.56,22.81,2.1,18.78,1.95,2],[25.45,19.21,25.39,20.15,25.48,20.52,25.97,20.94,26.15,21.24,26.39,21.82,26.39,22.18,26.48,22.82,26.55,23.36,27.03,23.91,28.18,22.61,28.42,19.45,28.03,18.58,27.55,18.42,26.76,18.55,2],[2.06,17.94,3.06,17.94,3.18,17.64,3.33,17.52,3.79,17.42,4.21,17.48,4.67,17.97,4.7,18.27,4.79,18.58,4.58,18.76,4.09,19,3.88,19.18,3.76,19.42,3.73,20.12,3.76,20.73,3.91,20.55,4.24,19.73,4.58,19.67,5.12,19.82,5.73,20.42,6.12,20.91,6.42,21.06,6.64,21.18,6.79,21.58,6.82,21.91,6.76,22.45,6.94,22.55,7.3,22.61,7.76,22.58,7.97,22.3,8.24,22.24,8.3,22.55,8.3,22.82,8.42,23.09,9.06,23.36,9.18,23.91,9.3,24.21,11.61,24.15,11.79,24.88,12.3,25.09,12.24,25.39,12.45,25.64,12.67,25.82,13.03,26.03,13.21,26.36,13.58,26.94,13.82,27.21,13.67,27.64,12.76,27.67,12.27,27.85,11.97,28.27,10.97,28.33,1.97,24.64,2],[18.3,24.03,18.3,28.33,26.91,28.3,26.91,23.91,2]);
  // Sarnic Agzi: siginagin kapagindan inilen ilk karanlik. Tek parca boyali
  // sahne (public/assets/arkaplan/magara.png). Prop katmani YOK, o yuzden
  // yurunebilir alan otomatik cikarilmadi - sahnenin sekli basit oldugu icin
  // uc dikdortgen olarak elle yazildi ve gorsel uzerinde dogrulandi
  // (generated/_MAGARA_ELLE.png).
  room(3,8,17,14);      // ana oda
  room(12,2,6,7);       // ust gecit: siginaga cikan ahsap cerceveli kapi
  room(11,21,7,7);      // alt gecit: sarnica inen tas yol
  gecis(12,2,18,3,'haven',[15,25]);      // ust tunel: siginaga geri
  gecis(11,27,18,28,'cistern',[7,7]);    // alt tunel: sarnica devam
  // Sagdaki karanlik agiz bir UCURUM: gorselde zemin bitiyor, oraya yurursen
  // asagi dusersin. Karolar bilerek yurunebilir birakildi.
  // Sinirlar goz karariyla degil, uzerine yesil boyanmis referanstan olculdu.
  ucurum(21,11,27,19);
  // Bati duvarindaki boyali mesale (kume merkezi 4.3,11.1 karo).
  isiklar.push([4.3*16,11.1*16,54]);
  // Ucurumun DORT BIR YANI acik: kenarindan dolasilabilsin diye cevresi
  // yurunebilir. Sag taraf kayalik ama gecis orada da kapali kalmasin.
  room(19,9,10,12);
  // Ucurumun basinda duran adam. Atladiysa bir daha yok.
  // Atladiysa yok; indiyse siginakta, Lin'in atesinin basinda.
  if(!flags?.tuhn)at({id:'tuhn',type:'npc',x:20,y:15,name:'Tuhn',portrait:6});
  /* Obruk ve iki parali askeri. YER GECICI: adamin kendi odasi uretilince
     oraya tasinacak (bir ara depoya tasinmisti, kullanici eski yerine
     dondurdu). Siginakla sarnic arasindaki tek yol buradan geciyor, yani
     gecen herkes onunden geciyor. Karga ve Cakal onu ARADA tutacak sekilde
     duruyor. */
  at({id:'obruk',type:'npc',x:6,y:13,name:'Obruk',portrait:10,s:1.25,sabit:true});
  /* Karga surgun edildiyse (kral cinayetinde suclandiysa) artik burada degil.
     Hicbir gorev ona bagli olmadigi icin dunyadan cikarilmasi guvenli. */
  if(!flags?.kargaSurgun)at({id:'karga',type:'npc',x:5,y:10,name:'Karga',portrait:11,sabit:true});
  at({id:'cakal',type:'npc',x:5,y:16,name:'Çakal',portrait:12,sabit:true});
  // Uslu buraya da ugrayabilir - bkz. haven'daki ayni flag kontrolu.
  if(flags?.usluYer==='magara')at({id:'uslu',type:'npc',x:14,y:10,name:'Uslu',portrait:14});
 }else if(zone==='tunel'){
  /* DAR GECIT: sarnicin alt agzindan inilen uzun, dar, zifiri karanlik yarik.
     Iki kaynak gorselden kuruldu (scripts/tunel_kur.py): sahnenin kendisi ve
     ayni sahnenin yurunebilir zemini YESILE boyanmis hali. Mekan yatay
     uretildi, oyunda dikey duruyor - kapinin devami gibi olsun diye 90 derece
     cevrildi. Zemin dogrudan yesil maskeden okundu, tahmin yok. */
  const ZEMIN=['0000000000000','0000000000000','0000000000000','0000111100000','0000001110000','0000011110000','0001111111000','0001111111000','0001111111000','0001111111000','0001111111000','0001111111000','0001111111000','0001111111000','0001111111000','0001111110000','0001111110000','0001111111000','0001111100000','0000111100000','0000111110000','0000111110000','0001111111000','0001111111000','0001111111000','0001111111000','0001111111000','0011111111000','0001111111000','0000111111000','0000111111000','0001111111000','0001111111000','0001111111000','0001111111000','0001111111000','0001111110000','0001111110000','0001111111000','0001111110000','0001111111000','0001111111000','0001111111000','0001111111000','0001111111000','0001111111000','0001111110000','0001111110000','0001111110000','0001111110000','0001111110000','0000111110000','0000011111000','0000011110000','0000111110000','0001111110000','0001111110000','0001111110000','0001111110000','0001111111000','0001111110000','0001111111000','0001111100000'];
  for(let j=0;j<h;j++)for(let i=0;i<w;i++)tiles[j][i]=ZEMIN[j]?.[i]==='1'?1:0;
  /* Donus kutusu yurunebilir zeminin ilk satirlarini KAPSAMALI: 2-4 arasi
     dardi, oyuncu y=4.5'te takilip geri donemiyordu. */
  /* Donus agzi GENIS satirlarda (3-9 karo): ust uc dar ve kayik, oyuncu
     carpisma yaricapiyla oraya giremiyordu. */
  gecis(3,4,10,7,'cistern',[27,27]);     // yukari: sarnicin alt agzi
  /* Karanlikta ses once gelir: yaratiklar gecidin boyunca dagitildi. */
  /* Giris agzi BOS: ilk yarasa tam spawn karosundaydi, oyuncu geri donemiyordu. */
  enemy('t0',1,5,19);enemy('t1',1,4,43);enemy('t2',1,4,48);enemy('t3',4,4,32);enemy('t4',4,6,57);enemy('t5',5,4,12);
  enemy('t6',5,4,37);enemy('t7',1,8,25);enemy('t8',1,7,60);enemy('t9',1,8,34);enemy('t10',4,6,22);enemy('t11',4,7,38);
  enemy('t12',5,5,28);enemy('t13',5,7,30);enemy('t14',1,6,53);enemy('t15',1,4,59);enemy('t16',1,5,15);enemy('t17',4,8,55);
  enemy('t18',4,7,49);enemy('t19',5,4,25);enemy('t20',5,6,41);enemy('t21',1,6,46);
  chest('tunelSandik',6,60,[['torch',3],['potion',2],['okzehir',6]],30);
  fire(6,34);                            // yolun ortasinda bir koz: tek mola
 }else if(zone==='cistern'){
  blockers.push([10.84,4.98,10.7,5.79,10.6,6.33,10.57,6.88,10.3,7.79,10.43,8.16,10.4,9.25,10.19,9.72,10.03,10.09,9.89,10.26,9.79,10.57,9.62,11.24,9.62,11.82,9.62,12.67,9.38,13.31,9.21,13.65,9.01,14.6,9.04,15.34,9.35,15.65,10.03,15.82,10.19,15.71,10.67,16.12,11.01,16.36,11.35,15.99,11.96,15.88,12.57,15.41,12.77,14.97,13.45,14.56,13.24,14.16,13.24,13.24,13.14,12.87,12.77,12.5,12.67,12.06,13.07,11.68,13.48,11.38,13.75,11.28,13.68,12.02,13.95,12.16,14.67,12.26,16.53,12.4,16.43,11.96,15.85,11.68,15.55,11.38,15.41,10.97,15.34,10.74,15.27,9.96,16.02,10.23,16.43,10.67,17.21,10.53,17.65,10.36,18.19,10.23,18.53,9.92,18.46,8.98,19.58,9.21,20.05,9.35,20.96,9.31,21.27,9.04,21.91,8.98,22.45,9.28,23,9.28,23.74,9.11,24.22,9.01,24.86,9.35,25.27,9.58,25.84,9.69,26.45,9.42,27.3,9.01,27.77,9.25,28.04,9.31,28.42,9.25,29.47,8.91,30.35,9.04,30.62,9.48,31.4,9.55,31.9,9.25,33.02,8.98,33.06,9.38,33.43,10.06,34.55,10.3,34.65,9.48,34.55,8.98,35.02,8.87,36,9.62,36.92,9.72,37.36,9.42,37.59,9.25,38.17,9.04,38.58,9.31,39.49,9.42,39.83,9.18,40.74,9.01,41.45,9.25,42,9.52,42.5,9.28,43.05,9.14,43.35,9.38,43.49,9.75,44.64,9.99,45.18,9.86,45.52,9.69,46.3,9.55,46.57,10.36,47.82,10.53,48.36,10.47,48.87,10.43,49.31,11.48,50.06,11.58,50.84,12.12,51.34,12.36,51.31,12.77,51.34,13.07,51.51,13.45,51.65,14.09,51.55,14.5,51.48,14.77,51.31,15.21,51.38,15.71,51.51,16.02,51.65,16.7,51.58,17.75,51.62,18.42,51.48,18.86,51.45,19.31,51.58,20.02,51.65,20.29,51.34,21.03,51.31,21.24,51.28,22.25,51.34,22.96,51.51,23.2,51.45,23.64,51.38,24.08,50.84,24.45,50.57,23.88,50.6,23.34,50.46,22.73,50.4,22.15,50.19,21.57,49.82,21.4,49.62,22.32,49.62,23.54,49.38,24.39,49.24,24.79,49.08,25.4,48.74,26.49,48.57,25.91,48.3,24.99,48.19,24.25,47.92,24.08,47.79,24.76,47.48,25.77,47.35,26.28,47.18,26.82,47.08,26.49,46.91,26.04,46.74,25.88,46.5,26.18,46.47,26.62,46.37,27.09,46.2,27.5,45.99,27.77,45.69,27.6,45.42,27.57,45.11,27.6,44,27.77,43.28,27.47,42.74,27.57,42.23,27.74,41.83,27.67,41.35,27.77,40.74,27.57,40.27,27.5,39.83,27.37,39.39,27.37,39.02,27.57,38.61,27.7,38.31,27.64,37.76,27.54,37.36,27.43,37.09,27.54,36.44,27.74,35.39,27.57,34.72,27.37,34.17,27.54,33.7,27.67,32.92,27.7,32.51,27.5,31.87,27.5,31.09,27.74,30.65,28.11,30.24,28.69,29.8,29.47,29.8,29.91,51.07,29.5,52.26,22.12,52.6,7.52,22.22,2.81,10.87,0.24,11.07,0.58,11.35,1.32,11.35,1.93,11.21,2.24,11.11,2.71,11.07,3.25,10.97,3.76,11.04,4.27,2],[24.18,29.91,0.1,29.87,0.17,0.24,5.15,0.03,4.84,0.68,4.74,1.12,4.71,1.63,4.84,2.3,4.88,2.78,4.81,3.62,4.91,4.37,5.11,5.86,5.15,6.84,5.01,8.03,4.91,9.04,4.84,9.38,4.71,10.19,4.61,10.94,4.4,11.55,4.17,12.33,4.17,12.87,4.1,14.09,4.03,14.94,4.47,15.95,4.3,16.39,3.69,16.56,2.91,16.22,2.37,16.16,2.47,16.83,2.37,17.78,2.61,18.9,2.51,19.44,2.37,19.91,2.27,20.63,2.37,21.34,2.61,22.01,3.01,22.18,3.15,21.91,3.15,21.2,3.32,20.73,3.25,20.15,3.49,20.02,3.76,19.88,4.1,20.35,3.86,20.96,4.03,20.96,4.2,21.81,4.4,22.93,4.88,24.62,4.74,25.06,4.74,25.57,5.28,26.32,5.42,26.49,5.59,25.67,5.83,24.35,5.96,23.81,6.27,23.1,6.54,23.27,6.47,24.62,6.71,25.4,6.88,25.88,7.04,26.25,7.45,25.71,7.69,26.18,7.89,27.06,8.2,27.57,9.72,27.84,10.26,27.47,10.63,27.4,11.96,27.64,13.45,27.6,14.09,27.74,14.8,27.6,15.55,27.47,16.73,27.54,17,27.74,18.36,27.67,18.63,27.57,19.54,27.67,19.88,27.81,21.1,27.64,21.81,27.5,22.56,27.7,23.54,28.35,2]);
  // Unutulmus Sarnic artik karo zindan degil, tek parca boyali magara (54x30).
  // Carpisma uzerine YESIL boyanmis maskeden okundu; bu sayfada yesil magaranin
  // DISINDAKI bosluk, yani engel.
   const ZEMIN=['111111111111111111111111111111111111111111111111111111','111111111111111111111111111111111111111111111111111111','111111111111111111111111111111111111111111111111111111','111111111111111111111111111111111111111111111111111111','111111111111111111111111111111111111111111111111111111','111111111111111111111111111111111111111111111111111111','111111111111111111111111111111111111111111111111111111','111111111111111111111111111111111111111111111111111111','111111111111111111111111111111111111111111111111111111','111111111111111111111111111111111111111111111111111111','111111111111111111111111111111111111111111111111111111','111111111111111111111111111111111111111111111111111111','111111111111111111111111111111111111111111111111111111','111111111111111111111111111111111111111111111111111111','111111111111111111111111111111111111111111111111111111','111111111111111111111111111111111111111111111111111111','111111111111111111111111111111111111111111111111111111','111111111111111111111111111111111111111111111111111111','111111111111111111111111111111111111111111111111111111','111111111111111111111111111111111111111111111111111111','111111111111111111111111111111111111111111111111111111','111111111111111111111111111111111111111111111111111111','111111111111111111111111111111111111111111111111111111','111111111111111111111111111111111111111111111111111111','111111111111111111111111111111111111111111111111111111','111111111111111111111111111111111111111111111111111111','111111111111111111111111111111111111111111111111111111','111111111111111111111111111111111111111111111111111111','111111111111111111111111111111111111111111111111111111','111111111111111111111111111111111111111111111111111111'];
  for(let j=0;j<h;j++)for(let i=0;i<w;i++)tiles[j][i]=ZEMIN[j][i]==='1'?1:0;
  at({id:'backHaven',type:'portal',x:7,y:4,to:'magara',spawn:[14,25],name:'Yukarı çık'});
  // Ocak gecidi yaratiklarin ciktigi agizdan AYRI duruyor: ikisi ayni karodayken
  // gecide varan oyuncu dogrudan dalganin icine dusuyordu.
  // Rauf'un yeri KOSULA bagli: oldugunde ya da Alf'e teslim edildiginde
  // burada durmamali. Once kosulsuzdu, bu yuzden olduktan sonra sarnica
  // her donuste yeniden beliriyordu. 'takip'te ise changeZone onu zaten
  // oyuncunun yanina koyuyor, makeWorld'un yerlestirmesine gerek yok.
  if(flags?.rauf!=='oldu'&&flags?.rauf!=='teslim'&&flags?.rauf!=='takip')
   at({id:'rauf',type:'npc',x:44,y:18,name:'Rauf',portrait:5});
  chest('medicineChest',48,8,[['medicine',1],['potion',2],['toz',2],['torch',2]],12);
  chest('cisternWest',6,20,[['chain',1],['bow',1],['potion',2],['yeminh',1]],24);
  chest('cisternEast',49,24,[['guard',1],['potion',2],['uzunyay',1],['okdelici',8]],20);
  fire(10,16);fire(40,14);
  /* DALGA SISTEMI KALDIRILDI (2026-09-13). Once yaratiklar alt kapidan
     bes dalga halinde geliyordu ve aralarda sarnic bombostu; simdi mekan
     bastan dolu. Konumlar yurunebilir ve CEVRESI de acik karolardan,
     birbirine en az 5 karo uzaklikta secildi; girise ve Rauf'a yakin
     olanlar elendi. */
  enemy('c0',1,21,5);enemy('c1',1,26,21);enemy('c2',1,35,4);enemy('c3',1,4,17);enemy('c4',1,27,3);enemy('c5',5,36,14);
  enemy('c6',5,15,21);enemy('c7',5,44,6);enemy('c8',5,7,19);enemy('c9',2,37,21);enemy('c10',2,40,7);enemy('c11',2,32,22);
  enemy('c12',4,30,19);enemy('c13',4,22,24);enemy('c14',1,39,3);enemy('c15',1,10,16);enemy('c16',1,37,26);enemy('c17',1,4,24);
  enemy('c18',1,14,25);enemy('c19',5,48,8);enemy('c20',5,26,13);enemy('c21',5,32,27);enemy('c22',5,9,23);enemy('c23',2,14,15);
  enemy('c24',2,24,16);enemy('c25',2,32,15);enemy('c26',4,17,17);enemy('c27',4,17,7);enemy('c28',1,31,7);enemy('c29',1,25,26);
  enemy('c30',1,46,25);enemy('c31',1,29,25);enemy('c32',1,47,4);enemy('c33',5,13,9);enemy('c34',5,21,20);enemy('c35',5,43,27);
  enemy('c36',5,3,10);enemy('c37',2,7,13);enemy('c38',2,18,13);enemy('c39',2,8,27);enemy('c40',4,50,22);enemy('c41',4,19,26);
  enemy('c42',1,25,6);enemy('c43',1,40,24);enemy('c44',1,11,12);enemy('c45',1,50,15);enemy('c46',1,12,19);enemy('c47',5,18,3);
  enemy('c48',5,22,12);enemy('c49',5,35,18);
  /* Alt agiz artik bir yere cikiyor: Dar Gecit. */
  gecis(23,29,31,30,'tunel',[6,10]);
  // Dagilmis dusman YOK: yaratiklar alt kapidan dalga dalga geliyor (engine.ts).
 }else if(zone==='test100'){
  /* Terk edilmis tas koridor. Onceden burada 100x100 GECICI olcek denemesi
     vardi (cistern'in 2x4 tekrari); kullanici "bunu test alaninin yerine koy"
     deyip tek parca bir sahne verdi, o denemenin yerini bu mekan aldi.
     Gorsel 2752x1536'ten 2x kucultuldu (1376x768 = 43x24 karo, 32 px/karo -
     oyunun geri kalaniyla ayni yogunluk), scripts/koridor_kur.py ile kuruldu. ZEMIN yalnizca ODANIN SILUETI (siyah cerceve disi = duvar);
     duvar/sutun/moloz CARPISMASI buradan cikarilmadi - denendi, ayrismadi
     (parlaklikta tas duvar zeminle ayni bantta, R-B sicakliginda mesale
     sutunlari da zemin kadar sicak). Not defterindeki kural burada da
     gecerli: boyali sahnede carpisma ELLE, harita editorunun Engeller
     araciyla yazilir. Zone id'si bilerek 'test100' kaldi: degistirmek
     mevcut kayitlardaki state.zone'u ve Zone tipini kirardi. */
    const ZEMIN=['0000000000000000000000000000000000000000000','0000000000000000000000000000000000000000000','0000000000000000000000000000000000000000000','0000000000000000000000000000000000000000000','0000000000000000000000000000000000000000000','0000000000000000000000000000000000000000000','0000000000000000000000000000000000000000000','0000000000000000000000000000000000000000000','0011100000000000011110000000000000000000110','0011100100000000011111100000000110000000110','0011100111101111111111111111111111111111110','0011111111111111111111111111111111111111100','0011111111111111111111111111111111111111100','0011111111111111111111111111111111111111100','0011111111111111111111111111111111111111100','0011111111111111111111111111111111111111100','0011111111111111111111111111111111111111110','0001111111111111111111111111111111111111000','0000011111111111111111111111111111111100000','0000000000000111111111111111111111111000000','0000000000000000000000000000000000011000000','0000000000000000000000000000000000000000000','0000000000000000000000000000000000000000000','0000000000000000000000000000000000000000000'];
  for(let j=0;j<h;j++)for(let i=0;i<w;i++)tiles[j][i]=ZEMIN[j][i]==='1'?1:0;
  /* Siginaktan BATIYA cikiliyor, demek ki koridorun DOGU ucunda belirilir ve
     geri donmek icin yine DOGUYA yurunur - ilk halde iki kapi da sol uctaydi,
     yani cikis girdigin ucta duruyordu (kullanici: "kapi giris cikisi ters
     olmus"). Donus kutusu sag kemerin oldugu uc (x 39..42, y 12..16); dogma
     noktasi (36,14) kutunun DISINDA, yoksa varir varmaz geri gonderir. */
  /* Yerden cikan iskelet kalabaligi (kind 11). Bunlar GOMULU baslar: motor
     onlari resetMobs()'ta ayri bir listede tutar, oyuncu yaklasinca yerden
     cikip mob olurlar (bkz. engine.ts gomulu/cikis). Tek vurusta olur,
     parcalanirlar. Konumlar acik zemine, oyuncunun geldigi DOGU ucu bos
     kalacak sekilde dagitildi (varir varmaz ustune cikmasinlar). */
  [[5,7],[5,15],[6,7],[6,8],[6,14],[7,4],[8,6],[9,10],[9,16],[10,9],[10,16],[10,18],[12,7],[13,17],[14,15],[15,9],[15,19],[16,5],[16,6],[16,15],[17,17],[18,6],[18,11],[18,12],[19,4],[19,16],[20,14],[22,17],[24,10],[24,17],[24,18],[25,15],[28,11],[29,6],[29,9],[30,4],[31,16],[32,13],[32,17],[34,6],[35,19],[38,6]].forEach(([x,y],i)=>enemy(`isk${i}`,
   /* Arada AZMAN iskelet (kind 12): buyuk, tek vurusta olmez, dogru durust
      odul verir. Sabit araliki - rastgele olsaydi her yeni oyunda baska bir
      yerde cikar, harita ezberi bozulurdu. 42 iskelette 5 azman: kalabaliga
      ritim katiyor ama surunun kimligini bastirmiyor. */
   i%9===4?12:11,x,y));
  gecis(39,12,43,17,'haven',[3,16]);
 }
 return {zone,w,h,tiles,entities,enemies,blockers,gecisler,ucurumlar,isiklar,spawn:zone==='haven'?[15*16,14*16]:zone==='tunel'?[6*16+8,6*16+8]:zone==='test100'?[21*16+8,12*16+8]:[7*16,7*16]};
}
/** Cokgen (pen tool) carpismasi: son eleman etiket (2), oncesi karo biriminde
 *  duz [x0,y0,x1,y1,...] nokta listesi. Aktorun kare hitbox'inin DORT kosesi
 *  (tilesOk'daki ayni teknik) test edilir - herhangi biri poligonun icindeyse
 *  carpisma sayilir, boylece aktorun yaricapi da hesaba katilmis olur. */
function cokgenCarpisiyor(b:number[],x:number,y:number,r:number,ry:number):boolean{
 const pts=b.slice(0,-1);
 for(const [dx,dy] of [[-r,-ry],[r,-ry],[-r,ry],[r,ry]]){
  const tx=x+dx,ty=y+dy;
  let ic=false;
  for(let i=0,j=pts.length-2;i<pts.length;i+=2){
   const xi=pts[i]*16,yi=pts[i+1]*16,xj=pts[j]*16,yj=pts[j+1]*16;
   if(((yi>ty)!==(yj>ty))&&(tx<(xj-xi)*(ty-yi)/(yj-yi)+xi))ic=!ic;
   j=i;
  }
  if(ic)return true;
 }
 return false;
}
/** ry: dikeyde ayri bir yaricap istenirse (oyuncu icin - gorsel golgesi
 *  yatayda genis (8.5px) ama dikeyde cok ince (2.8px), varsayilan simetrik
 *  r=5 kare hitbox dikeyde golgenin neredeyse 2 kati - "gecebilecek gibi
 *  gorunen bosluktan gecemiyor" hissi buradan geliyordu). Verilmezse r ile
 *  ayni (mevcut butun cagrilar icin davranis degismez). */
export function walkable(world:World,x:number,y:number,r=5,ignoreId?:string,ry=r){
 const tilesOk=[[-r,-ry],[r,-ry],[-r,ry],[r,ry]].every(([dx,dy])=>world.tiles[Math.floor((y+dy)/16)]?.[Math.floor((x+dx)/16)]===1);
 if(!tilesOk)return false;
 // Arka planda boyali mobilyanin uzerinden gecilmesin.
 // Tam temas aninda kenar boyunca KAYMA kilitleniyordu (oyuncu tezgaha dayanip
 // sola gidemiyordu). Kucuk bir pay ile birebir degme cakisma sayilmaz.
 const E=0.01;
 for(const b of world.blockers){
  if(b.length===4){
   const [bx1,by1,bx2,by2]=b;
   if(x+r>bx1*16+E&&x-r<bx2*16-E&&y+ry>by1*16+E&&y-ry<by2*16-E)return false;
  }else if(b.length===5){
   // Elips: sinirlayici kutunun merkezi/yaricapi, aktorun kendi yaricapi
   // kadar icine cekilerek aktor-elips carpismasi aktor-nokta'ya indirgeniyor.
   const [bx1,by1,bx2,by2]=b;
   const ecx=(bx1+bx2)/2*16,ecy=(by1+by2)/2*16;
   const erx=Math.max(1,(bx2-bx1)/2*16-r),ery=Math.max(1,(by2-by1)/2*16-ry);
   const ndx=(x-ecx)/erx,ndy=(y-ecy)/ery;
   if(ndx*ndx+ndy*ndy<1)return false;
  }else if(cokgenCarpisiyor(b,x,y,r,ry)){
   return false;
  }
 }
 return !world.entities.some(e=>{
  if(e.id===ignoreId)return false;
  /* overlay decor = harita editorunun "Nesneler" moduyla konan SALT GORSEL
     katman; carpismasi varsa Engeller araciyla ACIKCA cizilir. Sabit 10
     birimlik daire gorselden BAGIMSIZ oldugu icin (kucuk bir perde de, koca
     bir tezgah da ayni) ortada gorunmeyen bir kaya birakiyordu - kullanici
     "karakter burada neden takiliyor" diye sordu, sebebi buydu. Elle yazilan
     decor() mobilyalari (table2 vb.) eski davranisi korur. */
  if(e.type==='decor')return !e.overlay&&Math.hypot(e.x-x,e.y-y)<10;
  if(e.type==='chest')return Math.hypot(e.x-x,e.y-y)<6;
  return false;
 });
}
export function lineOfSight(world:World,ax:number,ay:number,bx:number,by:number,targetId?:string){const n=Math.ceil(Math.hypot(bx-ax,by-ay)/8);for(let i=1;i<n-1;i++)if(!walkable(world,ax+(bx-ax)*i/n,ay+(by-ay)*i/n,0,targetId))return false;return true;}
