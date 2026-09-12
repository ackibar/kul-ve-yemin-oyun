import type {ItemId,Zone} from './data';
export type Entity={id:string;type:'npc'|'chest'|'portal'|'lever'|'core'|'fire'|'decor'|'trap'|'yatak'|'ceset';x:number;y:number;name?:string;portrait?:number;asset?:string;to?:Zone;spawn?:[number,number];items?:[ItemId,number][];gold?:number;s?:number;/** Dolasma sisteminden muaf: oldugu yerde durur (nobetci, tezgah sahibi). */sabit?:boolean;/** Sprite capasi (zemin satiri/2). Oturan kral gibi kisa figurler icin; yoksa 31. */capa?:number};
// kind 3 (solucan) kaldirildi: kullanici "cok kotu duruyordu" dedi, tepeden
// cizilmis bir halka olarak okunmuyordu ve yon de tasimiyordu.
export type EnemySpec={id:string;kind:1|2|4|5|6|7|8|9|10;x:number;y:number;boss?:boolean};
export type World={zone:Zone;w:number;h:number;tiles:number[][];entities:Entity[];enemies:EnemySpec[];spawn:[number,number];blockers:[number,number,number,number][];
 /** Uzerine BASINCA bolge degistiren kutular (karo birimi, x2/y2 haric).
  *  Kapi nesnesine basmak yerine tunelden yuruyerek gecmek icin. */
 gecisler:{kutu:[number,number,number,number];to:Zone;spawn:[number,number]}[];
 /** Yurunebilir ama olumcul: icine giren asagi dusup olur. */
 ucurumlar:[number,number,number,number][];
 /** Arka plana BOYALI sabit isik kaynaklari (duvar mesalesi gibi): dunya birimi x,y ve yaricap.
  *  Ates entity'leri ayri, motor onlari zaten biliyor. Konumlar arka plandaki sicak-parlak
  *  piksel kumelerinden olculdu (kume merkezi /32 = karo). */
 isiklar:[number,number,number][]};
/** Kralin oturan sprite'inin zemin satiri/2; scripts/kral_uret.py kurunca yazar. */
const KRAL_CAPA=30.5;
export function makeWorld(zone:Zone,flags?:Record<string,string|boolean|undefined>):World{
 const kare=zone==='haven'||zone==='magara';
 // Kare mekanlar 30x30: siginak, magara ve yikik. Kul Ovasi 54x30.
 const kare30=kare||zone==='yikik';
 // Boyali tek parca sahneler: Kul Ovasi ve Sarnic 54x30, digerleri 30x30.
 const genis=zone==='disari'||zone==='cistern';
 const w=genis?54:kare30?30:46,h=genis?30:kare30?30:48;
 const tiles=Array.from({length:h},()=>Array<number>(w).fill(0));
 const room=(x:number,y:number,rw:number,rh:number)=>{for(let j=y;j<y+rh;j++)for(let i=x;i<x+rw;i++)tiles[j][i]=1};
 const entities:Entity[]=[],enemies:EnemySpec[]=[];
 /** Arka plan gorselinde boyali olan mobilyanin carpisma kutulari (karo birimi,
  *  x2/y2 haric). Gorsel carpisma izgarasini bilmedigi icin elle cikarildi;
  *  bkz. scripts/haven_engel.py ve generated/_ENGELLER.png dogrulama katmani. */
 const blockers:[number,number,number,number][]=[];
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
 const enemy=(id:string,kind:1|2|4|5|6|7|8|9|10,x:number,y:number,boss=false)=>enemies.push({id,kind,x:x*16+8,y:y*16+8,boss});
 if(zone==='haven'){
  // Zemin ve carpisma ARTIK ELLE YAZILMIYOR: yeni mekan tek sahne gorseli +
  // ayri prop sayfasi olarak geldi, ikisi de scripts/mekan_kur.py ile islendi.
  // ZEMIN arka planin aydinlik kismindan, blockers prop katmaninin alfasindan
  // cikti. Gorsel degisirse script yeniden calistirilip bu iki satir guncellenir;
  // dogrulama katmani generated/_YENI_ENGEL.png.
  const ZEMIN=['000000000000000000000000000000','000000000000000000000000000000','000000000000100001000000000000','000000000000110011000000000000','000001111111111111111111110000','000111111111111111111111111000','000111111111111111111111111000','000111111111111111111111111000','000111111111111111111111111000','000111111111111111111111111000','000111111111111111111111111000','000111111111111111111111111000','000111111111111111111111111000','000111111111111111111111111000','000111111111111111111111111000','000111111111111111111111111000','000111111111111111111111111000','000111111111111111111111111000','000111111111111111111111111000','000111111111111111111111111000','000111111111111111111111111000','000111111111111111111111111000','000111111111111111111111111000','000111111111111111111111111000','000000000001111111100000000000','000000000000111111000000000000','000000000000111111000000000000','000000000000111111000000000000','000000000000000000000000000000','000000000000000000000000000000'];
  for(let j=0;j<h;j++)for(let i=0;i<w;i++)tiles[j][i]=ZEMIN[j][i]==='1'?1:0;
  blockers.push([7,5,8,6],[9,5,10,7],[21,5,25,10],[20,6,21,10],[10,7,12,9],[19,7,20,11],[4,8,10,10],[12,8,13,9],[17,8,19,9],[25,8,27,10],[3,9,4,13],[11,9,12,12],[18,9,19,10],[4,10,9,13],[12,10,13,12],[23,10,24,12],[20,11,22,13],[25,11,27,24],[4,13,6,14],[7,13,9,14],[23,13,25,19],[3,14,4,15],[22,15,23,19],[3,17,4,20],[4,18,6,24],[7,18,10,21],[6,19,7,24],[10,19,12,21],[20,19,21,21],[19,20,20,21],[21,20,22,21],[24,20,25,21],[7,22,12,24],[19,23,25,24]);
  at({id:'mira',type:'npc',x:9,y:16,name:'Mirna',portrait:3});at({id:'boran',type:'npc',x:17,y:11,name:'Alf',portrait:2});at({id:'ekin',type:'npc',x:20,y:17,name:'Undur',portrait:4});
  // Elvi ust kapinin dibinde: cevrildigi kapidan uzaklasmiyor. Lin sag-alt
  // ocagin yaninda. Tiga indiyse ve Tuhn ucurumdan cekildiyse ikisi de o atesin
  // basina gelir. `s` sprite olcegi: cocuklar icin ayni sheet kucuk cizilir.
  at({id:'selvi',type:'npc',x:13,y:6,name:'Elvi',portrait:9});
  at({id:'nil',type:'npc',x:18,y:21,name:'Lin',portrait:7,s:.8});
  // Kral: sol ust kosede oturur, kimse bakmaz. Uslu ortada dolasir.
  /* Kral: vurulabilir (engine kralHasar). Oldurulduyse kosede cesedi kalir.
     Yeri (5,6) idi: haritanin sol UST cebi, 22 adim uzakta ve ancak ust
     kenardan dolasarak giriliyordu - oyuncu oraya hic ugramiyordu. Ana odanin
     bati koseligine alindi (13 adim, Mirna'nin hemen yaninda): gorulen ama
     kimsenin ugramadigi bir kose. Kendi mekani yapilinca oraya tasinacak. */
  if(flags?.kral==='oldu')at({id:'kralCeset',type:'ceset',x:5,y:17,name:'Kral',asset:'kral_ceset'});
  else at({id:'kral',type:'npc',x:5,y:17,name:'Kral',portrait:13,sabit:true,capa:KRAL_CAPA,s:.72});
  at({id:'uslu',type:'npc',x:14,y:19,name:'Uslu',portrait:14});
  if(flags?.ayaz==='indi')at({id:'ayaz',type:'npc',x:16,y:21,name:'Tiga',portrait:8,s:.9});
  if(flags?.tuhn==='kaldi')at({id:'tuhn',type:'npc',x:19,y:22,name:'Tuhn',portrait:6});
  gecis(12,27,18,28,'magara',[15,5]);   // asagi inen tunelin sonu
  // Ust kapinin agzi ZEMIN esiginde karanlik kaldigi icin kapanmisti; koridor
  // elle aciliyor, disari cikis da onun ucunda.
  for(let j=2;j<4;j++)for(let i=12;i<18;i++)tiles[j][i]=1;
  gecis(12,2,18,3,'disari',[27,27]);    // ust kapi: kul ovasina cikis
  // Ocaklarda boyali ALEV yok, sadece kor ve odun var; animasyonlu alevi motor
  // buraya koyuyor. Konum ocak halkasinin prop bileseninden olculdu.
  // Capa: Fire1 sprite'i 32 birimlik hucrenin TAMAMINI dolduruyor ve sprite()
  // hucreyi y+6'da bitiriyor, yani alevin TABANI y+6. Halkanin biraz on-altina
  // otursun diye y = merkez + halka_yuksekligi*0.35 - 6.
  entities.push({id:'alev0',type:'fire',x:190.8,y:171.9,s:1.16});entities.push({id:'alev1',type:'fire',x:334.0,y:190.6,s:1.16});entities.push({id:'alev2',type:'fire',x:327.2,y:323.4,s:1.13});
  decor('table2',22,10,'Tables/2.png','Zanaat Masası');
  // Alt-soldaki yatak: etkilesim noktasi yatagin UST kenarinin hemen disinda,
  // cunku yatagin kendisi engel ve icinden gorus hatti kurulamiyor.
  entities.push({id:'yatak',type:'yatak',x:9.5*16,y:21.7*16,name:'Uyu'});
  // Digerlerinin yataklari: uzerlerinde de "Uyu" cikar ama oyuncu kendi
  // yataginda olmadigini soyler (engine.ts interact).
  entities.push({id:'yatak2',type:'yatak',x:7*16,y:17.7*16,name:'Uyu'});
  entities.push({id:'yatak3',type:'yatak',x:7*16,y:10.4*16,name:'Uyu'});
  chest('havenGift',14,22,[['copper',1],['bow',1],['arrow',25],['tonic',1],['torch',1]]);
  }else if(zone==='disari'){
  // Kul Ovasi: siginakin ust kapisindan cikilan dis dunya (54x30 karo).
  // Zemin ve carpisma scripts/mekan_kur.py ile iki katmandan cikarildi:
  // ZEMIN arka planin aydinlik bolgesinden (ustteki 9 satir gokyuzu, bastan
  // kesildi), blockers prop katmaninin alfasindan. Kenarlara gorunmez duvar
  // yok; can hizla eridigi icin oyuncu zaten uzaga gidemiyor.
  const ZEMIN=['000000000000000000000000000000000000000000000000000000','000000000000000000000000000000000000000000000000000000','000000000000000000000000000000000000000000000000000000','000000000000000000000000000000000000000000000000000000','000000000000000000000000000000000000000000000000000000','000000000000000000000000000000000000000000000000000000','000000000000000000000000000000000000000000000000000000','000000000000000000000000000000000000000000000000000000','000000000000000000000000000000000000000000000000000000','111111111111111111111111111111111111111111111111111111','111111111111111111111111111111111111111111111111111111','111111111111111111111111111111111111111111111111111111','111111111111111111111111111111111111111111111111111111','111111111111111111111111111111111111111111111111111111','111111111111111111111111111111111111111111111111111111','111111111111111111111111111111111111111111111111111111','111111111111111111111111111111111111111111111111111111','111111111111111111111111111111111111111111111111111111','111111111111111111111111111111111111111111111111111111','111111111111111111111111111111111111111111111111111111','111111111111111111111111111111111111111111111111111111','111111111111111111111111111111111111111111111111111111','111111111111111111111111111111111111111111111111111111','111111111111111111111111111111111111111111111111111111','111111111111111111111111111111111111111111111111111111','111111111111111111111111111111111111111111111111111111','111111111111111111111111111111111111111111111111111111','111111111111111111111111111111111111111111111111111111','111111111111111111111111111111111111111111111111111111','111111111111111111111111111111111111111111111111111111'];
  for(let j=0;j<h;j++)for(let i=0;i<w;i++)tiles[j][i]=ZEMIN[j][i]==='1'?1:0;
  blockers.push([18,9,21,13],[31,9,34,10],[43,9,45,11],[15,10,16,12],[17,10,18,15],[32,10,36,12],[40,10,41,12],[42,10,43,12],[45,10,46,12],[51,10,52,12],[9,11,10,12],[11,11,12,14],[14,11,15,13],[21,11,22,13],[36,11,37,12],[39,11,40,12],[41,11,42,12],[50,11,51,18],[7,12,9,13],[10,12,11,13],[12,12,14,14],[24,12,25,13],[34,12,36,14],[37,12,39,18],[47,12,48,13],[52,12,54,19],[8,13,9,14],[15,13,16,15],[18,13,19,14],[25,13,26,14],[31,13,32,15],[33,13,34,15],[36,13,37,18],[39,13,40,18],[51,13,52,19],[12,14,13,19],[14,14,15,15],[16,14,17,15],[19,14,20,19],[21,14,22,16],[32,14,33,15],[35,14,36,17],[40,14,41,17],[49,14,50,20],[8,15,9,17],[13,15,14,18],[20,15,21,20],[22,15,23,19],[41,15,42,17],[48,15,49,20],[1,16,3,17],[9,16,10,17],[15,16,16,18],[17,16,19,19],[23,16,24,18],[34,16,35,17],[42,16,43,17],[47,16,48,18],[0,17,1,19],[11,17,12,20],[14,17,15,19],[21,17,22,19],[1,18,2,19],[26,18,27,19],[41,18,42,20],[45,18,46,19],[7,19,8,20],[10,19,11,20],[16,19,18,20],[25,19,26,20],[39,19,41,20],[2,20,3,23],[1,21,2,23],[3,21,4,22],[50,22,51,24],[0,23,1,24],[3,23,4,24],[41,24,43,28],[44,24,45,27],[52,24,54,25],[2,25,3,26],[5,25,6,26],[10,25,11,26],[13,25,14,26],[43,25,44,26],[47,25,48,26],[7,26,8,27],[19,26,23,27],[37,26,38,27],[0,27,2,29],[10,27,14,30],[19,27,20,28],[21,27,24,29],[33,27,34,28],[40,27,41,30],[52,27,53,30],[6,28,10,30],[14,28,17,29],[39,28,40,30],[41,28,42,29],[53,28,54,30],[0,29,1,30],[4,29,6,30],[14,29,16,30],[22,29,24,30],[38,29,39,30],[43,29,46,30],[51,29,52,30]);
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
  enemy('fener1',9,39,24);enemy('fener2',9,7,10);
  /* Kralin son muhafizi: on bir yildir ovada devriyede, emir geri alinmadi.
     Once konusur (NPC); kavga secilirse motor onu kind 10 dusmana cevirir. */
  if(flags?.muhafiz!=='oldu')at({id:'muhafiz',type:'npc',x:46,y:14,name:'Son Muhafız',portrait:15,sabit:true,s:1.1});
 }else if(zone==='yikik'){
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
     oraya tasinacak. Simdilik Sarnic Agzi'nin bati duvari - siginakla sarnic
     arasindaki tek yol buradan geciyor, yani gecen herkes onunden geciyor.
     Karga ve Cakal onu ARADA tutacak sekilde duruyor. */
  at({id:'obruk',type:'npc',x:6,y:13,name:'Obruk',portrait:10,s:1.25,sabit:true});
  at({id:'karga',type:'npc',x:5,y:10,name:'Karga',portrait:11,sabit:true});
  at({id:'cakal',type:'npc',x:5,y:16,name:'Çakal',portrait:12,sabit:true});
 }else if(zone==='cistern'){
  // Unutulmus Sarnic artik karo zindan degil, tek parca boyali magara (54x30).
  // Carpisma uzerine YESIL boyanmis maskeden okundu; bu sayfada yesil magaranin
  // DISINDAKI bosluk, yani engel.
   const ZEMIN=['000011111111000000000000000000000000000000000000000000','000011111111000000000000000000000000000100000000000000','000011111111000011111111111111111111111111111110000000','000011111111000111111111111111111111111111111111110000','000011111110011111111111111111111111111111111111111000','000111111111111111111111111111111111111111111111111000','001111111111111111111111111111111111111111111111111100','001111111111111111111111111111111111111111111111111100','001111111111111111111111111111111111111111111111111100','011111111111111111111100010000010110100001111111111110','001111111111111111110000000000000000000000001011111100','001111111111111110001111111000000100000000000000111100','001111111111100101111111111111111111111110000000000100','001111111111101111111111111111111111111111111111100100','001111111111111111111111111111111111111111111111111100','011100011111111111111111111111111111111111111111111110','001111111111111111111111111111111111111111111111111100','001111111111111111111111111111111111111111111111111100','011111111111111111111111111111111111111111111111111110','001111111111111111111111111111111111111111111111111100','001111111111111111111111111111111111111111111111111100','001111111111111111111111111111111111111111111111111100','001111111111111111111111111111111111111111111111111100','001111111111111111111111111111111111111111111111111100','001111111111111111111111111111111111111111111111111100','000111111111111111111111111111111111111111111111111000','000111111111111111111111111111111111111111111111111000','000001111111111111111111111111111111111111111111110000','000000011101000001011011111111111111100001111000000000','000000000000000000000001001110100000000000000000000000'];
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
  // Dagilmis dusman YOK: yaratiklar alt kapidan dalga dalga geliyor (engine.ts).
 }
 return {zone,w,h,tiles,entities,enemies,blockers,gecisler,ucurumlar,isiklar,spawn:zone==='haven'?[15*16,14*16]:[7*16,7*16]};
}
export function walkable(world:World,x:number,y:number,r=5,ignoreId?:string){
 const tilesOk=[[-r,-r],[r,-r],[-r,r],[r,r]].every(([dx,dy])=>world.tiles[Math.floor((y+dy)/16)]?.[Math.floor((x+dx)/16)]===1);
 if(!tilesOk)return false;
 // Arka planda boyali mobilyanin uzerinden gecilmesin.
 // Tam temas aninda kenar boyunca KAYMA kilitleniyordu (oyuncu tezgaha dayanip
 // sola gidemiyordu). Kucuk bir pay ile birebir degme cakisma sayilmaz.
 const E=0.01;
 for(const [bx1,by1,bx2,by2] of world.blockers)
  if(x+r>bx1*16+E&&x-r<bx2*16-E&&y+r>by1*16+E&&y-r<by2*16-E)return false;
 return !world.entities.some(e=>{
  if(e.id===ignoreId)return false;
  if(e.type==='decor')return Math.hypot(e.x-x,e.y-y)<10;
  if(e.type==='chest')return Math.hypot(e.x-x,e.y-y)<6;
  return false;
 });
}
export function lineOfSight(world:World,ax:number,ay:number,bx:number,by:number,targetId?:string){const n=Math.ceil(Math.hypot(bx-ax,by-ay)/8);for(let i=1;i<n-1;i++)if(!walkable(world,ax+(bx-ax)*i/n,ay+(by-ay)*i/n,0,targetId))return false;return true;}
