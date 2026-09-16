import {addItem,gainXp,ITEMS,sandikAc,removeItem,stats,type ItemId,type State,type Zone} from './data';
/** Render yogunlugu: gorsel pikseli / dunya birimi. Dunya 16px karo, 32px aktor
 *  biriminde kalir; gorseller 2x cozunurlukte (32px karo, 64px aktor) uretilir. */
const R=2;
/** Oyuncu sprite olcegi. sprite() actor capasi (anchor=21) olcekle carpildigi
 *  icin ayaklar her olcekte ayni noktaya oturur; golge de ayni katsayiyla buyur. */
const OYUNCU_OLCEK=1.0;
import {GameAudio,type Sound} from './audio';
import {makeWorld,walkable,lineOfSight,type EnemySpec,type Entity,type World} from './world';
/** Bir blocker'in (world.ts'teki dikdortgen/elips/poligon, karo birimi) yolunu
 *  VERILEN tuval baglaminda dunya-px cinsinden cizer - golgeyi delmek icin
 *  kullaniliyor (bkz. Engine.golgeCiz), walkable()'daki UZUNLUGA gore ayirma
 *  mantigiyla ayni. */
function blockerYolu(ctx:CanvasRenderingContext2D,b:number[]){
 ctx.beginPath();
 if(b.length===4){
  const [x1,y1,x2,y2]=b;
  ctx.rect(x1*16,y1*16,(x2-x1)*16,(y2-y1)*16);
 }else if(b.length===5){
  const [x1,y1,x2,y2]=b;
  ctx.ellipse((x1+x2)/2*16,(y1+y2)/2*16,Math.max(.01,(x2-x1)/2*16),Math.max(.01,(y2-y1)/2*16),0,0,7);
 }else{
  const pts=b.slice(0,-1);
  for(let i=0;i<pts.length;i+=2){const x=pts[i]*16,y=pts[i+1]*16;i===0?ctx.moveTo(x,y):ctx.lineTo(x,y);}
  ctx.closePath();
 }
 ctx.fill();
}
import {bekleyen} from './data';
/** Oyuncunun bakis yonu. 'S' yan, 'DS' asagi-capraz, 'US' yukari-capraz;
 *  bati tarafi bunlarin aynasi (flip). NPC/dusmanlar 3 yonde kaliyor. */
type Yon='U'|'D'|'S'|'DS'|'US';
type Mob=EnemySpec&{hp:number;max:number;cool:number;windup:number;burn:number;hurt:number;homeX:number;homeY:number;gezX?:number;gezY?:number;gezBekle?:number;aci?:number;sersem?:number;zehir?:number;zehirTik?:number;/** Yerden cikma animasyonu: kalan sure (sn). >0 iken yurumez/vurmaz. */cikis?:number;/** Kalabalikta dolasma yonu (+1/-1), mob'a sabit - bkz. dusmanYurut(). */yan?:number};
type Particle={x:number;y:number;vx:number;vy:number;life:number;color:string;size:number;g?:number};
/** Olen iskeletten savrulan KEMIK PARCASI: kafatasi/kaburga/uyluk... ayri
 *  uretilmis kucuk gorseller (bkz. scripts/kemik_uret.py). Onceden sprite
 *  sheet'i 2x3 dilime bolunuyordu ama dilimler dikdortgen oldugu icin
 *  "kesilmis gorsel" gibi duruyordu, kemik gibi degil. */
type Parca={anahtar:string;x:number;y:number;
 vx:number;vy:number;aci:number;donus:number;life:number;
 /** Solmanin suresi (sn): alfa = life/omur ile 1'e kirpilir. */omur:number;
 /** Kemigin konacagi zemin hizasi; degince seker, sonra yatip solar. */yer:number;
 olcek:number};
type Floating={x:number;y:number;text:string;life:number;color:string};
type Shot={x:number;y:number;vx:number;vy:number;life:number;damage:number;isHero?:boolean;yakar?:number;zehir?:number;delici?:boolean;ceker?:boolean;gecti?:string[]};
export type Drop={id:string;x:number;y:number;kind:'wood'|'xp'|'gold'|'bow';amount:number;vx:number;vy:number;life:number};
export type Snapshot={state:State;near:Entity|null;attackCooldown:number;dodgeCooldown:number;tonic:number;mesale:number;saveStatus:string;ready:boolean};
export type GameEvent={type:'dialogue'|'death'|'message'|'zone'|'sandik';id?:string;text?:string};
const SAVE='kul-ve-yemin-save-v1';
export class Engine{
 state:State;world:World;mobs:Mob[]=[];audio:GameAudio;paused=true;input={x:0,y:0,attack:false};onChange:(s:Snapshot)=>void;onEvent:(e:GameEvent)=>void;
 private decorHp:Record<string,number>={};
 private drops:Drop[]=[];
 private activeTraps:Set<string>=new Set();
 private canvas:HTMLCanvasElement;private ctx:CanvasRenderingContext2D;
 /** Oyuncu golgesini "delmek" icin kucuk bir offscreen tampon (bkz. golgeCiz) -
  *  ana tuvale dogrudan destination-out ile cizersek arka plan/diger her seyi
  *  de delerdi, bu yuzden golge ONCE burada izole cizilip sonra yapistiriliyor. */
 private golgeBuf?:HTMLCanvasElement;
 private images:Record<string,HTMLImageElement>={};private raf=0;private last=0;private tick=0;private notifyAt=0;private savedAt=0;private stepAt=0;private direction:Yon='D';private flip=false;private moving=false;private attackTimer=0;private dodgeTimer=0;private dash=0;private dashVector={x:0,y:1};/** Bu dash'te zaten siyirilan dusmanlar - her dusman bir kacista yalniz bir kez vurulur. */private dashVuran:string[]=[];private invulnerable=0;private tonic=0;private particles:Particle[]=[];private parcalar:Parca[]=[];
 /** Yurunen toplam yol. Yurume karesi zamana degil buna baglanir; boylece
  *  hiz degisse de ayaklar yere basar (once 58 birim/sn hizda 7fps animasyon
  *  kullaniliyordu, 2.1 kat uyumsuzdu ve kayiyor gibi duruyordu). */
 private yol=0;
 /** Gorunen dunya alani (dunya birimi). Sabit 320x180 idi; 20:9 telefonlarda
  *  16:9 kutu ekranin ortasina oturup yanlarda siyah bant birakiyor, oyun alani
  *  kuculunce de HUD devasa duruyordu. Artik ekran oranina uyuyor: fazla en
  *  varsa yatayda, fazla boy varsa dikeyde daha cok dunya gorunur, ama hicbir
  *  zaman 320x180'den AZ gorunmez - yoksa dar pencerede oyun alani kirpilirdi. */
 private gorus={en:320,boy:180};
 /** Ucuruma dusme sayaci. 0'dan buyukken oyuncu kontrolu yok, sprite kucule
  *  kucule asagi kayiyor; bitince olum. */
 /** Uyku sahnesi sayaci: karart -> bekle -> ac. Ekran kararmisken karakter
  *  ters yone dondurulur, uyanip yatagin obur tarafina gecmis gibi olur. */
 /** Rauf yoldasken vurus bekleme sayaci ve dusmanlarin ona vurma sayaci.
  *  Cani flags.raufCan'da string olarak tutuluyor ki kayitla birlikte gitsin. */
 private raufVur=0;private raufHasar=0;private sahneUyari=0;

 static readonly RAUF_CAN=90;
 private uyku=0;private uykuDondu=false;
 static readonly UYKU=2.4;
 /** Kul Ovasi'nda saniyede eriyen can. Haritanin kenarina gorunmez duvar
  *  koymak yerine sure basinci var: yolun ucuna varmadan geri donmek gerekiyor. */
 static readonly KUL_HASAR=8;
 private dusus=0;/** Dusus bitti ve karakter bosluga gitti (dusus=0 olduktan sonra da gecerli). */private dustu=false;
 /** Dusus suresi. Once 0.9 sn'lik yumusak kucuIme vardi; istenen "bir anda
  *  kaybolmak" oldugu icin kisaltildi ve sprite kupsel egriyle hizla siliniyor
  *  - ilk 0.15 sn'de gorunmez oluyor, kalan sure olum ekranina gecis. */
 /** Oyuncu hucresinin dunya birimi eni (40*R = 80 px). NPC'ler 32'de kalir:
  *  yalnizca oyuncunun kilici savrulurken 64 px'lik kareye sigmiyordu, ucu
  *  kirpiliyordu. Yukseklik ve capa (31) degismedi, yani ayaklar yerinde. */
 static readonly OYUNCU_EN=40;
 /** Oyuncu hucre boyu 80px (fh=40): figur bazi karelerde 65-70 satir, 64'te kafa kesiliyordu. Ayak satiri 78 -> capa 39. */
 static readonly OYUNCU_BOY=40;
 static readonly OYUNCU_CAPA=39;
 /** Oyuncunun carpisma kutusu varsayilan olarak 5px'lik bir KARE (yatay=dikey)
  *  idi, golgeden BAGIMSIZ olarak kademeli kucultuldu (3/2, sonra 2/1) ama
  *  2 YATAYDA fazla kucuk cikti: A/D (yan, 'S' sprite) yonunde karakter
  *  gorsel olarak engelin UZERINE cikiyordu (W/S=dikey ile gorunum iyiydi,
  *  demek ki iki eksen birbirinden BAGIMSIZ ayarlanmali, biri digerini
  *  temsil etmiyor). Yatay 3'e geri cekildi, dikey 1'de kaldi (o eksende
  *  sikayet yoktu). NOT: bu sadece world.ts'teki blockers (elle/editorle
  *  cizilen mobilya) ile carpisma - decor/chest tipi entity'lerin KENDI
  *  sabit yaricapi var (bkz. walkable() sonundaki entities.some, 10/6px)
  *  ve bu ikisinden ETKILENMEZ; sikayet zanaat masasi/sandik gibi TEKIL
  *  bir nesneden geliyorsa sorun oradadir, burada degil. */
 static readonly OYUNCU_YATAY_YARICAP=3;
 static readonly OYUNCU_DIKEY_YARICAP=1;
 /** Okun ciziminde kullanilan gogus yuksekligi (yalnizca gorsel). */
 static readonly OK_YUKSEK=17;
 /** Tepeden cizilmis yaratiklar ve sprite'larinin DOGAL bakis acisi (radyan,
  *  0 = saga). Bu listede olmayan dusman insansidir ve yon basina ayri sheet
  *  kullanir. Fare basi sag-asagi bakiyor, digerleri asagi. */
 /** Dusman animasyon hizi. Eskiden sabit 7 fps idi; kareler tek gorselden
  *  turetildigi icin yeterliydi ama gercek animasyonda yarasa 9 karelik kanat
  *  cirpmasini 1.3 saniyede tamamliyordu, yani agir cekim duruyordu.
  *  Saldiri daha hizli: windup 0.4 sn, 7 kare o surede sigsin. */
 static readonly DUSMAN_FPS=(eylem:string)=>eylem==='Attack'?15:11;
 /** Ayni turden dusmanlar ayni GLOBAL saatten kare aldigi icin suru tek bir
  *  govde gibi ayni anda ayni adimi atiyordu (kullanici: "hepsi ayni ritimde").
  *  Faz ve animasyon hizi artik mob'un KIMLIGINDEN turetiliyor - durum tutmaya
  *  gerek yok, her karede ayni sonucu verir ve mob nerede dogarsa dogsun
  *  (resetMobs, iskeletKontrol, yarasa suru...) kendiliginden calisir. */
 private static karma(s:string){let h=2166136261;for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619);}return ((h>>>0)%1009)/1009;}
 /** Faz dagilimi (sn) ve hiz sacilmasi. Hiz sacilmasi sart: yalniz faz
  *  kaydirilirsa iki mob bir sure sonra yine ayni kareye denk geliyor. */
 static readonly FAZ_ARALIK=2.2;
 static readonly FAZ_HIZ_MIN=.86;
 static readonly FAZ_HIZ_MAK=1.16;
 private dusmanKare(m:Mob,eylem:string,time:number){
  const f=Engine.karma(m.id),h=Engine.karma(m.id+'~');
  /* Saldiri hizina dokunulmuyor: savurusun suresi vurus zamanlamasiyla
     okunuyor, yalnizca baslangic fazi kayiyor. */
  const fps=Engine.DUSMAN_FPS(eylem)*(eylem==='Attack'?1:Engine.FAZ_HIZ_MIN+h*(Engine.FAZ_HIZ_MAK-Engine.FAZ_HIZ_MIN));
  return Math.floor((time+f*Engine.FAZ_ARALIK)*fps);
 }
 /** Yaratiklarin yon gosterme YONTEMI. Hepsini dondurmek yanlisti: sprite'lar
  *  ayni bakis acisiyla cizilmemis.
  *   'tam'   - gercekten tepeden ve RADYAL SIMETRIK olan icin. Su an kimse
  *             kullanmiyor: orumcek simetrik sanilmisti ama bacaklari alt
  *             yarida toplanmis, 90-180 derece dondurulunce tek bacak
  *             uzerinde duruyor gibi oluyordu. Ayrica piksel sanatini ara
  *             acilarda dondurmek bacaklari kopuk noktalara ceviriyor.
  *             `aci` = sprite'in dogal bakis acisi (radyan, 0 = saga).
  *   'yan'   - yandan-usten (fare). Dondurulunce sirtustu donuyordu; bunun
  *             yerine yatayda AYNALANIR, dikey bilesen kucuk bir egime cevrilir.
  *   'sabit' - sabit bakisla cizilmis (yarasa onden, kafa yukarida).
  *             Dondurulmez; yon bilgisini animasyon tasir.
  *   'aynali'- onden cizilmis buyuk insansi (trol). Dondurulmez ama yatayda
  *             aynalanir: saga giderken saga, sola giderken sola bakar.
  *  Bu listede olmayan dusman yon basina AYRI sheet kullanir. Orumcek de
  *  oraya gecti: dondurme bacaklarini tek yana topluyordu, bunun yerine
  *  asagi/yukari/yan icin ayri gorsel uretildi (bati, yanin aynasi). */
 static readonly YARATIK:Record<number,{mod:'tam'|'yan'|'sabit'|'aynali';aci?:number}>=
  {1:{mod:'yan'},5:{mod:'sabit'},7:{mod:'aynali'},9:{mod:'aynali'}};
 /** 'yan' yaratiklarin dikey egim siniri (radyan). Daha fazlasi yine yatiriyor. */
 static readonly EGIM=Math.PI/6;
 /** Ucuruma dusme suresi (sn). Eskiden 0.5 idi ama o surede hicbir animasyon
  *  cizilmiyordu (bir anda kayboluyordu) - simdi kucule-sola-kaybol
  *  animasyonu var, 0.5sn onu gormeye yetmiyordu (goz bir sey algilamadan
  *  bitiyordu). 1.1sn animasyonun okunmasina yetiyor ama oyunun tempo
  *  hissini bozacak kadar uzun degil. */
 static readonly DUSUS=1.1;
 /** Iskeletin yerden cikmasi: bu uzakliga girilince uyanir, bu kadar sn surer.
  *  Uyanma 118 -> 150: surunun onu kapanmadan icine dalinabiliyordu.
  *  Cikis .75 -> .55: yarim saniye yerin altinda beklemek kalabaligin
  *  baskisini kiriyordu. */
 static readonly ISKELET_UYANMA=150;
 static readonly ISKELET_CIKIS=.55;
 /** ISKELET DOVUS AYARI. Tek vurusta oldugu icin tehdidi candan degil HIZ ve
  *  SIKLIK'tan gelmeli. Olculdu: eski degerlerle (hiz 27, windup .4, cool
  *  1.15, gorus 135) oyuncu 44 hiziyla yuruyerek surunun icinden hic
  *  vurulmadan gecebiliyordu - "oldurmesi cok kolay" sikayeti buydu, can
  *  meselesi degildi. Hiz 38: oyuncudan (44) hala yavas, yani kacis MUMKUN
  *  ama bedava degil; kacmak icin dash gerekiyor. */
 static readonly ISKELET_HIZ=38;
 static readonly ISKELET_WINDUP=.26;
 static readonly ISKELET_COOL=.8;
 static readonly ISKELET_GORUS=200;
 /** Vurus hazirligi sirasindaki atilma hizi (bkz. windup dali). */
 static readonly ISKELET_HAMLE=64;
 /** Iskelet vurusundan sonraki dokunulmazlik - genel .72 yerine (bkz. hurt()). */
 static readonly ISKELET_IFRAME=.34;
 /** Vurusun DEGME menzili (genel 25). Cemberin ON safi 13 birimde duruyor ama
  *  arkadakiler 22-28'de kaliyor ve vurusları bosa gidiyordu: kullanici
  *  "etrafimi sariyor ama sadece bir iki tanesi vurabiliyor" dedi, olcumde de
  *  5 saniyedeki 23 vurusun yarisi menzil disinda kaliyordu. */
 static readonly ISKELET_VURUS_MENZIL=29;
 static readonly ISKELET_SALDIRI_MENZIL=26;
 private sonImza='';
 private sahneSayac=0;
 private dizSayac=0;private dizX=0;private dizY=0;
 /** Teslim sahnesinde yuruyen NPC'lerin yonu ve aldigi yol. Dolasma sistemi
  *  sahne boyunca devre disi oldugu icin cizim animasyonu buradan okunur;
  *  yoksa Alf durus karesiyle kayiyordu. */
 private sahneYuru=new Map<string,{dir:'D'|'U'|'S';flip:boolean;yol:number}>();
 static readonly ADIM=4;   // kare basi alinan yol (dunya birimi)
 // Ates sesi menzili (dunya birimi, 1 karo=16): 22'ye kadar tam, 125'te sifir.
 static readonly ATES_TAM=22;static readonly ATES_MENZIL=125;

 /** NPC dolasmasi: kisa bir yuruyus, sonra bekleme, sonra tekrar. Ev konumundan
  *  fazla uzaklasmazlar ki gorev icin bulunabilir kalsinlar. */
 /** giden: bu NPC su an rastgele dolasmiyor, BILEREK kapiya yuruyor (bkz.
  *  'uslu' - Son Siginak <-> Sarnic Agzi arasi artik gorunmeden isinlanmiyor,
  *  once kapinin onune gelip oradan "cikiyor"). */
 private gez=new Map<string,{hx:number;hy:number;tx:number;ty:number;bekle:number;dir:'D'|'U'|'S';flip:boolean;yol:number;giden?:boolean}>();
 /** Uslu'nun gectigi kapinin, HANGI bolgedeysen o bolgedeki dunya-birimi
  *  konumu (bkz. world.ts'teki 'haven'<->'magara' gecis() kutulari - ikisi
  *  de x:12-18 karo araligi, merkez tile 15). */
 private static readonly USLU_KAPI:Partial<Record<Zone,{x:number;y:number}>>={
  haven:{x:15*16+8,y:27.5*16+8},magara:{x:15*16+8,y:2.5*16+8}};
 private floating:Floating[]=[];private shots:Shot[]=[];private camera={x:0,y:0};private slash=0;/* slash yalnizca kesme YAYINI cizer; vurus POZU ayri tutulur, cunku yay atisinda yay yok ama animasyon olmali. vurusSure kareyi bastan baslatir: genel saatten turetilince animasyon rastgele bir kareden basliyordu. */private vurusPoz=0;private vurusSure=0;/** Bileme tasi: kalan sure (sn). Saldiri suresini kisaltir. */private bileme=0;/** Sargi merhemi: kalan sure. */private merhem=0;/** Bal petegi: kalan sure (sn), saniyede 4 can. */private petek=0;/** Duru su: kalan sure boyunca Kul Ovasi cani eritemez. */private kulKoru=0;/** Bogulmus sarildi: kalan sure boyunca %40 yavas. */private yavas=0;/** Mesale: kalan sure (sn). */private mesale=0;/** Mesale yakilmadan onceki silah; sonunce ona donulur. */private mesaleOnce:ItemId='yumruk';/** Kacis izi: dash sirasinda birakilan soluk kopyalar (sprite anahtari + kare). */private izler:{x:number;y:number;anahtar:string;kare:number;flip:boolean;life:number}[]=[];/** Iz birakma sayaci - her karede degil, sabit arayla. */private izSayac=0;/** Isik haritasi icin ekran disi tuval (gorus/2 cozunurlukte; gradient zaten yumusak). */private isikTuval:HTMLCanvasElement|null=null;/** Kul tozu: dusmanlar goremez. */private gizli=0;/** Yemin halkasi bu bolgede kullanildi mi. */private halka=false;/** Tuhn dustukten sonra sesin ve yarasalarin gecikmesi (sn). */private tuhnSayac=0;/** Sesten SONRA yarasalarin gecikmesi (sn). */private tuhnYarasa=0;/** Tuhn'un ucurumdan dusus animasyonu (kalan sn) - bitince entity silinir. */private tuhnDusus=0;/** Dusus animasyonu bir kez baslatildi mi (bitince silme dalina gecsin diye). */private tuhnDususBitti=false;private ready=false;private saveStatus='';private trapCooldown=0;private fireBurnCooldown=0;
 private keys={up:false,down:false,left:false,right:false};
 /** Gamepad: bir onceki karede basili olan tuslar (kenar yakalamak icin).
  *  Standart layout varsayiliyor: 0=A 1=B 2=X 3=Y 4=LB 5=RB 6=LT 7=RT 9=Start,
  *  12-15 = D-pad, eksen 0/1 sol cubuk. */
 private gpBasili=new Set<number>();
 /** Gamepad'den girdi geldiginde arayuze haber: kontrol ipuclari degissin. */
 onGamepad?:(yon:'menu'|'oyun',tus?:string)=>void;
 /** Cubuk olu bolgesi: ucuz padlerde bosta 0.05-0.15 arasi gurultu geliyor. */
 static readonly GP_OLU=.24;
 private handleKeyDown=(e:KeyboardEvent)=>{if(['Space','KeyW','KeyA','KeyS','KeyD','KeyQ','KeyR','KeyE','KeyF','KeyJ','KeyK','ArrowUp','ArrowDown','ArrowLeft','ArrowRight','ShiftLeft','ShiftRight'].includes(e.code)){e.preventDefault();}if(this.paused)return;if(e.code==='KeyW'||e.code==='ArrowUp')this.keys.up=true;if(e.code==='KeyS'||e.code==='ArrowDown')this.keys.down=true;if(e.code==='KeyA'||e.code==='ArrowLeft')this.keys.left=true;if(e.code==='KeyD'||e.code==='ArrowRight')this.keys.right=true;if(e.code==='Space'||e.code==='KeyJ')this.input.attack=true;if(e.repeat)return;if(e.code==='ShiftLeft'||e.code==='ShiftRight'||e.code==='KeyK')this.dodge();if(e.code==='KeyE')this.interact();if(e.code==='KeyQ'||e.code==='KeyR')this.toggleWeapon();if(e.code==='KeyF')this.toggleTorch();};
 private handleKeyUp=(e:KeyboardEvent)=>{if(['Space','KeyW','KeyA','KeyS','KeyD','KeyQ','KeyR','KeyE','KeyF','KeyJ','KeyK','ArrowUp','ArrowDown','ArrowLeft','ArrowRight','ShiftLeft','ShiftRight'].includes(e.code)){e.preventDefault();}if(e.code==='KeyW'||e.code==='ArrowUp')this.keys.up=false;if(e.code==='KeyS'||e.code==='ArrowDown')this.keys.down=false;if(e.code==='KeyA'||e.code==='ArrowLeft')this.keys.left=false;if(e.code==='KeyD'||e.code==='ArrowRight')this.keys.right=false;if(e.code==='Space'||e.code==='KeyJ')this.input.attack=false;};
 constructor(canvas:HTMLCanvasElement,state:State,audio:GameAudio,onChange:(s:Snapshot)=>void,onEvent:(e:GameEvent)=>void){this.canvas=canvas;this.ctx=canvas?.getContext?.('2d')!;this.state=state;this.world=makeWorld(state.zone,state.flags as Record<string,string|boolean|undefined>);this.audio=audio;this.onChange=onChange;this.onEvent=onEvent;this.gez.clear();this.resetMobs();this.loadAssets();this.overlayNesneleriYukle();this.camera={x:state.x-this.gorus.en/2,y:state.y-this.gorus.boy/2};if(typeof window!=='undefined'){window.addEventListener('keydown',this.handleKeyDown);window.addEventListener('keyup',this.handleKeyUp);}this.loop=this.loop.bind(this);if(typeof requestAnimationFrame!=='undefined')this.raf=requestAnimationFrame(this.loop)}
 private img(key:string,path:string){const im=new Image();im.src=path;this.images[key]=im;return new Promise<void>((resolve,reject)=>{im.onload=()=>resolve();im.onerror=()=>reject(new Error(path));})}
 /** harita-editor.html'in yerlestirdigi "overlay" decor'lar (boyali sahnenin
  *  UZERINE cizilen tekil PNG'ler, ör. nesne/xxx) sabit onceden-yukleme
  *  listesinde degil - zone degisince world.entities'te ne varsa TARANIR ve
  *  eksik olan resimler burada yuklenir. Resim gelene kadar sprite() sessizce
  *  cizmez (naturalWidth kontrolu), sonraki karede kendiliginden belirir. */
 private overlayNesneleriYukle(){
  for(const e of this.world.entities){
   if(e.type==='decor'&&e.overlay&&e.asset&&!this.images[e.asset])this.img(e.asset,`/assets/${e.asset}.png`).catch(()=>{});
  }
 }
  private async loadAssets(){const jobs:Promise<void>[]=[];const optional:boolean[]=[];/** optional[i] === true olan isler ISTEGE BAGLI: eksikligi oyunu kirmaz.
  *  Karakter dongusu disindaki tum isler zorunlu sayilir. */
 const mark=(o:boolean)=>{while(optional.length<jobs.length)optional.push(o);};jobs.push(this.img('rauf_kneel','/assets/characters/5/D_Kneel.png'));optional.push(true);jobs.push(this.img('ceset','/assets/characters/5/D_Corpse.png'));optional.push(true);jobs.push(this.img('kral_ceset','/assets/characters/13/D_Corpse.png'));optional.push(true);jobs.push(this.img('characters13DTac','/assets/characters/13/D_Tac.png'));optional.push(true);jobs.push(this.img('characters13DEl','/assets/characters/13/D_El.png'));optional.push(true);mark(false);/* YALNIZCA CIZILEN sheet'ler yukleniyor. Olculdu: NPC'lerde sprite cagrisi tek
   yerde ve sadece Idle/Walk uretiyor; dusmanlarda eylem yalnizca Walk/Attack/
   Hurt olabiliyor (Idle/Death hic cizilmiyor). Once hepsi yukleniyordu: 180
   gereksiz istek. Yeni bir cizim yolu eklenirse bu listeler genisletilir. */
const EYLEM={npc:['Idle','Walk'],dusman:['Walk','Attack','Hurt']};
for(const kind of ['characters','enemies'])for(let n=1;n<=(kind==='characters'?15:11);n++){if(kind==='enemies'&&n===3)continue;/* solucan kaldirildi */const iste=(kind==='characters'&&n>=5)||(kind==='enemies'&&(n===6||n>=8));for(const dir of ['D','U','S'])for(const action of (kind==='characters'?EYLEM.npc:EYLEM.dusman)){jobs.push(this.img(`${kind}${n}${dir}${action}`,`/assets/${kind}/${n}/${dir}_${action}.png`));optional.push(iste);}}/* Insansi dusmanlar (4 kullenmis, 6 Rauf) caprazlarda da ciziliyor; tepeden
   gorulen yaratiklar dondurulerek cizildigi icin ek sheet istemiyor. */for(const n of [4,6,8,10])for(const dir of ['DS','US'])for(const action of ['Walk','Attack']){jobs.push(this.img(`enemies${n}${dir}${action}`,`/assets/enemies/${n}/${dir}_${action}.png`));optional.push(true);}/* Oyuncu 8 yonde cizilir (DS/US caprazlar, bati tarafi aynalanir); NPC ve
   dusmanlar 3 yonde kalir. Capraz sheet'ler istege bagli isaretlenir ki
   eksik olsalar yukleme hatasi vermesin - poz() en yakin ana yone duser. */
/* '1' (silahsiz) de burada: caprazlari uretilmisti ama yalnizca ana yon
   dongusunde yukleniyordu, yani silahsiz modda capraz sheet'ler hic
   kullanilmiyordu - poz() sessizce ana yone dusuyordu. */
/* Oyuncuda action yalnizca Idle/Walk/Attack olabiliyor (olum ekran paneli, hasar yanip sonme ile gosteriliyor). */
for(const set of ['1','1sword','1bow','1balta','1mesale','1swordmesale'])for(const dir of ['D','U','S','DS','US'])for(const action of ['Idle','Walk','Attack']){jobs.push(this.img(`characters${set}${dir}${action}`,`/assets/characters/${set}/${dir}_${action}.png`));/* Mesale seti sonradan uretildi; eksikse oyun acilmaya devam etsin (kit() tabana duser). */optional.push(dir==='DS'||dir==='US'||set.endsWith('mesale'));}/* Ucurumdan dusus: silahtan bagimsiz TEK animasyon, yalnizca taban ('1')
   sette D/U/S (bkz. scripts/dusus_uret.py + dusus_kur.py). Istege bagli:
   dosya yoksa render() eski yassilasma/solma efektine duser. */for(const dir of ['D','U','S']){jobs.push(this.img('characters1'+dir+'Dusus',`/assets/characters/1/${dir}_Dusus.png`));optional.push(true);}/* Tuhn'un dususu: yalniz dogu (sahnede hep doguya yuruyor). */jobs.push(this.img('characters6SDusus','/assets/characters/6/S_Dusus.png'));optional.push(true);for(const z of ['haven','magara','disari','yikik','cistern','tunel','test100'])jobs.push(this.img('bg_'+z,`/assets/arkaplan/${z}.png`));/* 'portal' (Trapdoor_D) kaldirildi: kapak sprite'i yalnizca boyali arka
   plani olmayan mekanda ciziliyordu, oyle bir mekan kalmadi. */
for(const [key,name]of [['fire','Fire1'],['lever','Lever1'],['trap','Spikes']])jobs.push(this.img(key,`/assets/dungeon/3%20Animated%20objects/${name}.png`));/* Sandik artik CraftPix setinden degil: oyunun paletinde uretilmis iki
   kareli kendi sheet'i (0 kapali, 1 acik). */jobs.push(this.img('chest','/assets/nesne/sandik.png'));for(const a of ["camasir", "fener", "fici", "kasa", "masa", "ocak", "odun", "raf", "sandik", "tabure", "tezgah", "yatak1", "yatak2"])jobs.push(this.img('nesne/'+a+'.png',`/assets/nesne/${a}.png`));
/* Iskelet olunce ucusan kemik parcalari (scripts/kemik_uret.py). Istege
   bagli: eksik olsalar dagilma yalnizca toz bulutu olur, oyun kirilmaz. */
for(const a of Engine.KEMIKLER){jobs.push(this.img('kemik/'+a,`/assets/nesne/kemik/${a}.png`));optional.push(true);}mark(false);
/* harita-editor "Nesneler" modunun eklendigi overlay decor'lar (ör. nesne/ed_props)
   eskiden yalnizca zone degisince overlayNesneleriYukle() ile ISTEGE BAGLI/GECIKMELI
   yukleniyordu - sayfa yeni acildiginda veya farkli bir kapidan o bolgeye direkt
   girildiginde resim daha gelmeden ilk birkac kare cizilip nesne "yokmus" gibi
   gorunuyor, resim gelince kendiliginden beliriyordu ("bir gozukuyor bir
   kayboluyor" sikayeti buradan geliyordu). Tum bolgelerin overlay resimlerini
   burada, "ready" kapisina dahil ederek onceden yukluyoruz. */
for(const z of ['haven','magara','disari','yikik','cistern','tunel'])for(const e of makeWorld(z as Zone).entities)if(e.type==='decor'&&e.overlay&&e.asset&&!this.images[e.asset]){jobs.push(this.img(e.asset,`/assets/${e.asset}.png`));optional.push(true);}
mark(false);const result=await Promise.allSettled(jobs);
  // Rauf seti (characters/5, enemies/6) sonradan eklenecek; eksikligi oyunu kirmaz.
  const zorunlu=result.filter((_,i)=>!optional[i]);
  this.ready=zorunlu.every(r=>r.status==='fulfilled');if(!this.ready)this.onEvent({type:'message',text:'Bazı görseller yüklenemedi. Bağlantını kontrol edip sayfayı yenile.'});this.emit();}
 /** Henuz yerden CIKMAMIS iskeletler. Mob listesinde DEGILLER: gomuluyken
  *  gorunmezler, vurulamazlar, carpismazlar - dovus kodunun hicbir yerine
  *  "gomulu mu" kontrolu eklemek gerekmesin diye ayri tutuluyorlar. Oyuncu
  *  yaklasinca (bkz. update icindeki iskeletKontrol) mob'a donusurler. */
 private gomulu:EnemySpec[]=[];
 /** Bolgeden CIKARKEN pesimizde olan dusmanlar (bolge -> kayit). Geri
  *  donunce kapinin basinda bizi bekliyorlar. Eskiden resetMobs() herkesi
  *  dolu canla ev konumuna koyuyor, iskeletleri de yeniden gomuyordu: yan
  *  odaya gecip donunce dusmanlar YOK OLMUS gibi goruntu veriyordu. */
 private bekleyen:Record<string,{id:string;hp:number}[]>={};
 /** Bolgeden ayrilirken pesimizdekileri not eder. "Pesimizde" = ya yara
  *  almis ya da takip menzilinde. Patron kendi arenasinda kalir, Rauf'un ve
  *  fenerin (kind 9) burada isi yok. */
 private bekleyenleriYaz(){
  const kayit=this.mobs.filter(m=>m.hp>0&&!m.boss&&m.kind!==9&&m.id!=='rauf'
   &&(m.hp<m.max||Math.hypot(m.x-this.state.x,m.y-this.state.y)<Engine.BEKLEME_MENZIL))
   .map(m=>({id:m.id,hp:m.hp}));
  if(kayit.length)this.bekleyen[this.state.zone]=kayit;else delete this.bekleyen[this.state.zone];
 }
 /** Geri donunce: not edilenleri kapinin basina, oyuncunun cevresine dizer.
  *  resetMobs()'tan SONRA cagrilir - o herkesi ev konumuna kurmus olur, biz
  *  yalniz bekleyenleri tasiyip canlarini geri yaziyoruz. */
 private bekleyenleriKur(){
  const kayit=this.bekleyen[this.state.zone];if(!kayit?.length)return;
  delete this.bekleyen[this.state.zone];
  const px=this.state.x,py=this.state.y;
  kayit.forEach((k,i)=>{
   let m=this.mobs.find(x=>x.id===k.id);
   if(!m){
    /* Iskeletler resetMobs'ta yeniden GOMULUYE dusuyor; bizi bekleyen biri
       yeniden toprak altina girmemeli - cikmis halde listeye alinir. */
    const g=this.gomulu.find(x=>x.id===k.id);if(!g)return;
    this.gomulu=this.gomulu.filter(x=>x!==g);
    const max=Engine.CAN[g.kind]??40;
    m={...g,hp:max,max,cool:.4+Math.random()*.6,windup:0,burn:0,hurt:0,homeX:g.x,homeY:g.y,cikis:0};
    this.mobs.push(m);
   }
   m.hp=Math.min(m.max,k.hp);m.cikis=0;m.windup=0;m.cool=.4+Math.random()*.7;
   /* Kapinin onunde bir yay: oyuncunun tam ustune degil, iki karo kadar
      oteye. Yuruyulemeyen nokta atlanir, hicbiri tutmazsa ev konumunda kalir. */
   const a0=Math.random()*Math.PI*2;
   for(let d=0;d<Engine.BEKLEME_DENEME;d++){
    const a=a0+(i*1.3+d*.7),r=Engine.BEKLEME_UZAK+(d%3)*9;
    const x=px+Math.cos(a)*r,y=py+Math.sin(a)*r;
    if(!walkable(this.world,x,y))continue;
    m.x=x;m.y=y;m.homeX=x;m.homeY=y;break;
   }
  });
 }
 private resetMobs(){const diri=this.world.enemies.filter(e=>!this.state.killed.includes(e.id));
  this.gomulu=diri.filter(e=>e.kind===11);
  this.mobs=diri.filter(e=>e.kind!==11).map(e=>{const max=e.boss?300:(Engine.CAN[e.kind]??40);return {...e,hp:max,max,cool:1+Math.random(),windup:0,burn:0,hurt:0,homeX:e.x,homeY:e.y}});this.shots=[];this.particles=[];this.drops=[];this.activeTraps.clear();}
 setState(s:State){this.bekleyen={};this.state=s;this.world=makeWorld(s.zone,s.flags as Record<string,string|boolean|undefined>);
  // Takipteyse Rauf yeni bolgede oyuncunun yaninda belirir; makeWorld onu
  // kendi ev konumuna koyuyor ve geride kaliyordu.
  if(s.flags.rauf==='takip'){let r=this.world.entities.find(x=>x.id==='rauf');
   if(!r){r={id:'rauf',type:'npc',x:0,y:0,name:'Rauf',portrait:5};this.world.entities.push(r);}
   r.x=s.x-14;r.y=s.y+6;}
if(!walkable(this.world,s.x,s.y)){[s.x,s.y]=this.world.spawn;}this.camera={x:s.x-this.gorus.en/2,y:s.y-this.gorus.boy/2};this.izler=[];this.resetMobs();/* Mesale kayitta kaldiysa yanmaya devam eder. */this.mesale=Number(this.state.flags.mesaleKalan||0);this.attackTimer=this.dodgeTimer=this.dash=this.invulnerable=this.tonic=this.dusus=0;this.dustu=false;this.input={x:0,y:0,attack:false};this.audio.setZone(s.zone);this.emit();}
 start(){this.audio.start();this.paused=false;this.save();this.emit()}
 setPaused(v:boolean){this.paused=v;this.input={x:0,y:0,attack:false};if(v)this.save();this.emit()}
 sound(s:Sound){this.audio.play(s)}
 save(){if(!this.state.started||this.state.hp<=0)return;try{localStorage.setItem(SAVE,JSON.stringify(this.state));this.saveStatus='Kaydedildi';}catch{this.saveStatus='Kayıt yapılamadı';}this.savedAt=this.tick;}
 /** Arayuzun GERCEKTEN gosterdigi her seyin ozeti. Degismediyse React'e
  *  dokunmuyoruz. Degerler ekranda nasil goruluyorsa oyle yuvarlaniyor:
  *  can tam sayi, kacinma bir ondalik, sure dakika - yani ancak yazi degisirse
  *  yeniden cizim olur. */
 private imza(near:Entity|null){const s=this.state;
  return [Math.round(s.hp),s.gold,s.xp,s.level,s.points,s.zone,s.ending,s.started,
   s.skills.power,s.skills.vigor,s.skills.agility,
   this.dodgeTimer.toFixed(1),Math.ceil(this.tonic),near?.id??'',this.ready,this.saveStatus,
   Math.floor(s.playtime/60),s.journal.length,s.killed.length,s.opened.length,
   JSON.stringify(s.inventory),JSON.stringify(s.equipment),JSON.stringify(s.flags)].join('|');
 }
 /** React'e yalnizca gorunen bir sey degistiginde haber verir.
  *
  *  Profil cikardi: kanvas cizimi toplam surenin %0.5'i, React agacini yeniden
  *  kurmak %3.7'si idi. Motor saniyede 10 kez emit ediyordu ve her seferinde
  *  structuredClone ile YENI bir state nesnesi uretiyordu; React de her sefer
  *  butun HUD'u ve panelleri bastan kuruyordu. Bos bir odada dolasirken bile
  *  100 ms'de bir tepe yapan bu is, telefonda takilma olarak hissediliyordu. */
 emit(){const near=this.nearest();const im=this.imza(near);
  if(im===this.sonImza)return;
  this.sonImza=im;
  this.onChange({state:structuredClone(this.state),near,attackCooldown:this.attackTimer,dodgeCooldown:this.dodgeTimer,tonic:this.tonic,mesale:this.mesale,saveStatus:this.saveStatus,ready:this.ready});}
 notify(text:string){this.onEvent({type:'message',text});}
 spawnDrop(x:number,y:number,kind:'wood'|'xp'|'gold'|'bow',amount:number){this.drops.push({id:`drop_${Date.now()}_${Math.random()}`,x,y,kind,amount,vx:(Math.random()-.5)*45,vy:(Math.random()-.6)*45,life:30});}
 nearest(){let near:Entity|null=null,best=40;for(const e of this.world.entities){if(['fire','trap'].includes(e.type))continue;if(e.type==='decor'&&!e.asset?.toLowerCase().includes('table')&&!e.asset?.startsWith('nesne/'))continue;const d=Math.hypot(e.x-this.state.x,e.y-this.state.y);if(d<best&&lineOfSight(this.world,this.state.x,this.state.y,e.x,e.y,e.id)){near=e;best=d}}return near;}
 interact(){if(this.paused||!this.ready)return;const e=this.nearest();if(!e){this.notify('Konuşmak veya açmak için biraz yaklaş.');return;}if(e.type==='yatak'){
   if(e.id!=='yatak'){this.notify('Çok yorgunum… ama bu benim yatağım değil.');return;}
   this.uyku=Engine.UYKU;this.uykuDondu=false;this.input={x:0,y:0,attack:false};this.audio.play('door');return;}
  /* Kucuk harf de yakalanir: harita-editor.html'in nesne-yukle ucbirimi
     dosya adini otomatik kucuk harfe ceviriyor (vite.config.ts), yani
     Nesneler modundan eklenen bir zanaat masasi asset'i asla buyuk 'T'
     ile 'Table' iceremez - onceki hal yalniz elle yazilmis 'Tables/2.png'
     gibi asset'leri yakalardi. */if(e.type==='decor'&&e.asset?.toLowerCase().includes('table')){this.audio.play('talk');this.onEvent({type:'dialogue',id:'crafting'});return;}if(e.type==='ceset'){this.audio.play('talk');this.onEvent({type:'dialogue',id:e.id});return;}
  if(e.type==='npc'){// Yoldas Rauf'un kendi kolu var; ana gorev diyalogu yerine o acilir.
   const f=this.state.flags;
   // Tanisma bayraklari: baska NPC'lerin secenekleri bunlara bakar. dialogue()
   // saf kalsin diye burada, gercek state uzerinde kurulur.
   if(e.id==='nil'&&!f.nil)f.nil='tanisti';if(e.id==='selvi'&&!f.selvi)f.selvi='tanisti';if(e.id==='ayaz'&&!f.ayaz)f.ayaz='tanisti';if(e.id==='tuhn')f.tuhnTanisti=true;
   // Mirna'nin tek seferlik araya girisleri
   if(e.id==='mira'&&f.selviSir==='soylendi'&&!f.mirnaYirmi){f.mirnaYirmi='gordu';f.talk='mira:yirmi';}
   else if(e.id==='mira'&&f.ayaz==='indi'&&!f.mirnaAyaz){f.mirnaAyaz='gordu';f.talk='mira:ayazYazdi';}
   else if(e.id==='ayaz'&&f.ayaz==='indi'&&!f.ayazAsagi){f.ayazAsagi='gordu';f.talk='ayaz:asagi';}
   if(e.id==='tuhn'&&f.tuhn!=='kaldi')f.talk='tuhn:1';
   else if(e.id==='rauf'){/* Rauf'un diyalogu DURUMA gore aciliyor. Onceden yalnizca 'takip' ve
      'serbest' ozel idi; 'korundu' ve 'dizcokme' tanisma agacina dusuyor,
      oyuncu ayni hikayeyi bastan dinliyordu. */const r=this.state.flags.rauf;this.state.flags.talk=r==='takip'?'rauf:takip1':r==='serbest'?'rauf:serbest1':r==='korundu'?'rauf:korundu1':r==='dizcokme'?'rauf:yenildi':'';}this.audio.play('talk');this.onEvent({type:'dialogue',id:e.id});return;}if(e.type==='chest'){
    /* ARTIK OTOMATIK YAGMA YOK. Sandik iki yonlu bir kap: icerigi state'e
       tasinir (sandikAc), panel acilir, oyuncu alir ya da koyar. Yarasa
       surprizi yalnizca ILK acilista. */
    const ilk=sandikAc(this.state,e.id,e.items,e.gold);
    if(!this.state.opened.includes(e.id))this.state.opened.push(e.id);
    this.audio.play('chest');
    if(ilk&&Math.random()<0.35&&this.state.zone!=='haven'){
     const n=Math.floor(1+Math.random()*2);
     for(let i=0;i<n;i++)this.mobs.push({id:`bat_${e.id}_${Date.now()}_${i}`,kind:1,
      x:e.x+(Math.random()-.5)*16,y:e.y+(Math.random()-.5)*16,max:22,hp:22,
      cool:.3,windup:0,burn:0,hurt:0,homeX:e.x,homeY:e.y});
     this.notify('Sandıktan yarasa fırladı!');
    }
    if(ilk&&e.items?.some(([id])=>id==='medicine'))this.state.flags.medicineStarted=true;
    this.save();this.onEvent({type:'sandik',id:e.id});this.emit();return;}if(e.type==='lever'){if(this.state.flags.gateOpen){this.notify('Ocak kapısı zaten açık.');return;}this.state.flags.gateOpen=true;this.audio.play('door');this.notify('Kül Ocağı’nın kapısı açıldı.');this.save();this.emit();return;}if(e.type==='portal'&&e.to){this.changeZone(e.to,e.spawn!);}}
 private changeZone(zone:Zone,spawn:[number,number]){this.bekleyenleriYaz();this.halka=false;this.dusus=0;this.dustu=false;/* respawn() buradan geciyor: dususten sonra yeniden dogan karakter gorunur olmali. */this.state.zone=zone;this.state.x=spawn[0]*16+8;this.state.y=spawn[1]*16+8;
  /* Uslu'nun Son Siginak <-> Sarnic Agzi arasi yer degistirmesi ARTIK burada
     ANLIK bir zar atisiyla olmuyor (bkz. eski not: oyuncu kapidan gecerken
     %50 ihtimalle "ısınlanmıs" gibi yer degistiriyordu - gorunmedigi icin
     tam bir teleport hissi veriyordu, kullanici bunu istemedi). Uslu artik
     KENDI kapiya YURUYEREK gidiyor (bkz. update()'teki NPC dolasma dongusu,
     'uslu' icin 'giden' hedefi) - oyuncu o an ayni odadaysa gercekten
     yururken goruyor, degilse zaten sessizce diger tarafa varmis olur (tipki
     baska bir NPC'nin nerede oldugunu her an bilmedigin gibi). */
  this.world=makeWorld(zone,this.state.flags as Record<string,string|boolean|undefined>);this.resetMobs();this.bekleyenleriKur();this.overlayNesneleriYukle();this.camera={x:this.state.x-this.gorus.en/2,y:this.state.y-this.gorus.boy/2};this.invulnerable=1.5;this.audio.setZone(zone);this.audio.play('door');this.onEvent({type:'zone',id:zone});this.save();this.emit()}
 useItem(id:ItemId){if(this.paused&&!['potion','tonic','bileme','merhem','toz','tuzet','durusu','petek','torch'].includes(id))return false;if(id==='potion'){if(this.state.hp>=stats(this.state).maxHp){this.notify('Canın zaten dolu.');return false;}if(!removeItem(this.state,id)){this.notify('Can iksirin kalmadı. Alf’ten alabilirsin.');return false;}this.state.hp=Math.min(stats(this.state).maxHp,this.state.hp+45);this.float(this.state.x,this.state.y-10,'+45','#8cdda5');}else if(id==='tonic'){if(!removeItem(this.state,id))return false;this.tonic=20;this.notify('Köz toniği: 20 saniye +8 saldırı.');}else if(id==='bileme'){if(!removeItem(this.state,id))return false;this.bileme=30;this.notify('Bileme taşı: 30 saniye %25 daha hızlı vuruş.');}else if(id==='merhem'){if(!removeItem(this.state,id))return false;this.merhem=12;this.notify('Sargı merhemi: 12 saniye boyunca yavaşça iyileşiyorsun.');}else if(id==='toz'){if(!removeItem(this.state,id))return false;this.gizli=8;this.notify('Kül tozu: 8 saniye görünmezsin.');}
   /* Obruk'un kileri. Tuzlu et oyunun en guclu tek seferlik iyilesmesi;
      bedeli de ona gore (26 altin, ustune iki bucuk kat zam). */
   /* Mesale: eskiden tanimliydi ama hicbir yerde kullanilmiyordu (olu esya). */
   else if(id==='torch'){/* Mekan kisiti kaldirildi (kullanici: kilic gibi ele alinabilsin); aydinlikta yalnizca uyarir. */if(!(Engine.KARANLIK[this.state.zone]>0))this.notify('Burası aydınlık; meşale burada yalnızca elinde yanar.');
    if(!removeItem(this.state,id))return false;this.mesale=Engine.MESALE_SURE;this.state.flags.mesaleKalan=String(Engine.MESALE_SURE);
    /* Mesale ELE alinir: gecici silah 'elmesale' envantere girer ve kusanilir; sonunce cikar. */
    const s=this.state;if(s.equipment.weapon!=='elmesale')this.mesaleOnce=s.equipment.weapon;if(!s.inventory.elmesale)addItem(s,'elmesale',1);
    /* Kilic tutuyorsa mesale sol ele gelir (kilic+mesale seti); yay/balta/ciplak eldeyse mesale tek basina kusanilir. */
    const w=ITEMS[s.equipment.weapon];if(s.equipment.weapon==='yumruk'||w.menzilli||w.sprite)s.equipment.weapon='elmesale';
    this.notify(`Meşale yandı: ${Engine.MESALE_SURE} saniye ışık. Q ile silahına dönebilirsin.`);}
   else if(id==='tuzet'){if(this.state.hp>=stats(this.state).maxHp){this.notify('Canın zaten dolu.');return false;}if(!removeItem(this.state,id))return false;this.state.hp=Math.min(stats(this.state).maxHp,this.state.hp+60);this.float(this.state.x,this.state.y-10,'+60','#8cdda5');}
   else if(id==='durusu'){if(!removeItem(this.state,id))return false;this.state.hp=Math.min(stats(this.state).maxHp,this.state.hp+25);this.kulKoru=30;this.float(this.state.x,this.state.y-10,'+25','#8cdda5');this.notify('Duru su: 30 saniye kül canını eritmeyecek.');}
   else if(id==='petek'){if(!removeItem(this.state,id))return false;this.state.hp=Math.min(stats(this.state).maxHp,this.state.hp+20);this.petek=15;this.notify('Bal peteği: 15 saniye boyunca yavaşça iyileşiyorsun.');}else if(id==='kavanoz'){if(this.paused)return false;if(!removeItem(this.state,id))return false;/* Kavanoz bir SHOT olarak gidiyor: carpisma, duvar kontrolu ve cizim zaten
   o boru hattinda. Hasari yok (0), isi patlama aninda yapiliyor. */const v=this.yonVektor();this.shots.push({x:this.state.x+v.x*12,y:this.state.y-4+v.y*12,vx:v.x*120,vy:v.y*120,life:.55,damage:0,isHero:true,gecti:['*kavanoz']});this.notify('Köz kavanozu fırlatıldı.');}else return false;this.audio.play('drink');this.save();this.emit();return true;}
 /** Kusanilan silaha gore sprite takimi. Varyant yuklenmemisse silahsiz
  *  sete duser; boylece eksik asset karakteri gorunmez yapmaz. */
 private kit(){const w=this.state.equipment.weapon;const v=ITEMS[w].sprite??(ITEMS[w].menzilli?'bow':w==='yumruk'?'':'sword');
  /* Mesale yaniyorsa ve bos el varsa (silahsiz ya da tek elli kilic) o setin
     mesaleli varyanti cizilir: '' -> 1mesale, 'sword' -> 1swordmesale. Yay ve
     balta iki el ister; mesale kemerde kalir, sprite degismez. */
  if(this.mesale>0&&(v===''||v==='sword')&&this.images['characters1'+v+'mesaleDIdle']?.naturalWidth)return 'characters1'+v+'mesale';
  /* Kontrol daima 'D' uzerinden: capraz yonde sheet olmayabilir ve set varken yedege dusmek yanlis olur. */return this.images['characters1'+v+'DIdle']?.naturalWidth?'characters1'+v:'characters1';}
 /** Mesale ELDE mi (sprite'ta gorunuyor mu)? Kemerdeyse isik yariya iner. */
 private mesaleElde(){return this.mesale>0&&this.kit().endsWith('mesale');}
 /** Silah dongusu: en guclu kilic -> yay (varsa) -> ciplak el -> bastan.
  *  Once yay yoksa tus hic calismiyordu; artik yaysiz oyuncu da silahsiz
  *  moda gecebiliyor. */
 toggleWeapon(){if(this.paused||!this.ready)return;const s=this.state;
  const sahip=(Object.keys(s.inventory)as ItemId[]).filter(id=>ITEMS[id].kind==='weapon'&&id!=='yumruk'&&id!=='elmesale');
  const guclu=(l:ItemId[])=>l.sort((a,b)=>(ITEMS[b].attack||0)-(ITEMS[a].attack||0))[0];
  /* Dongu: en guclu kilic -> en guclu menzilli -> ciplak el. Menzilli silah
     artik tek degil (avci yayi, tatar yayi), o yuzden tur bazinda seciliyor. */
  const kilic=guclu(sahip.filter(id=>!ITEMS[id].menzilli)),yay=guclu(sahip.filter(id=>ITEMS[id].menzilli));
  /* Mesale bu donguden CIKTI: kendi tusu var (F). Q yalnizca silah degistirir. */
  const sira:ItemId[]=[];if(kilic)sira.push(kilic);if(yay)sira.push(yay);sira.push('yumruk');
  const next=sira[(sira.indexOf(s.equipment.weapon)+1)%sira.length];
  this.notify(ITEMS[next].menzilli?`${ITEMS[next].name} kuşanıldı (Menzilli ok modu). Kalan ok: ${s.inventory.arrow||0}`
   :next==='yumruk'?'Silahını kaldırdın. Çıplak ellerle dövüşüyorsun.'
   :next==='elmesale'?'Meşaleyi eline aldın. Zayıf vurur ama tutuşturur.'
   :`${ITEMS[next].name} kuşanıldı (Kılıç modu).`);
  s.equipment.weapon=next;s.hp=Math.min(s.hp,stats(s).maxHp);this.audio.play('select');this.save();this.emit();}
 /** F tusu: mesaleyi yak / ele al / kaldir. Uc durum tek tusta donuyor:
  *  sonukse yakar (bir mesale harcar), yaniyor ama elde degilse ele alir,
  *  eldeyse onceki silaha doner (mesale yanmaya devam eder, isik yariya iner). */
 toggleTorch(){if(this.paused||!this.ready)return;const s=this.state;
  if(!s.inventory.elmesale){
   if(!s.inventory.torch){this.notify('Meşalen yok. Alf’ten alabilir ya da zanaat masasında yapabilirsin.');return;}
   this.useItem('torch');this.audio.play('select');this.emit();return;}
  if(s.equipment.weapon==='elmesale'){
   const geri=(this.mesaleOnce!=='elmesale'&&s.inventory[this.mesaleOnce])?this.mesaleOnce:'yumruk';
   s.equipment.weapon=geri;this.notify(`Meşaleyi kemerine astın. ${ITEMS[geri].name} elinde.`);
  }else{this.mesaleOnce=s.equipment.weapon;s.equipment.weapon='elmesale';this.notify('Meşale elinde.');}
  s.hp=Math.min(s.hp,stats(s).maxHp);this.audio.play('select');this.save();this.emit();}
 dodge(){if(this.paused||this.dodgeTimer>0)return;this.dodgeTimer=stats(this.state).dodge;this.dash=.2;this.dashVuran=[];this.invulnerable=.36;this.audio.play('dodge');/* Kalkis tozu: ayagin bastigi yerden geriye savrulan kul. Yon dash yonunun
     TERSI, yani oyuncu ileri firlarken toz arkada kaliyor. */
  {const v=this.yonVektor();for(let i=0;i<9;i++)this.particles.push({x:this.state.x+(Math.random()-.5)*6,y:this.state.y+(Math.random()-.5)*4,
   vx:-v.x*(18+Math.random()*26)+(Math.random()-.5)*14,vy:-v.y*(18+Math.random()*26)+(Math.random()-.5)*10-6,
   life:.25+Math.random()*.3,color:'#8d8478',size:1+Math.random(),g:26});}
  const kx=(this.keys.right?1:0)-(this.keys.left?1:0),ky=(this.keys.down?1:0)-(this.keys.up?1:0),inX=kx||this.input.x,inY=ky||this.input.y,n=Math.hypot(inX,inY);this.dashVector=n>.1?{x:inX/n,y:inY/n}:this.yonVektor();this.emit();}
 private attack(){if(this.attackTimer>0||this.paused)return;const s=this.state;const silah=ITEMS[s.equipment.weapon];const isBow=silah.menzilli===true;/* Sure artik silahin kendi `hiz` carpanindan ve bileme tasindan geliyor;
   eskiden yalnizca yay/kilic ayrimi vardi. */this.attackTimer=(isBow?.38:.43)*(silah.hiz??1)*(this.bileme>0?.75:1);this.vurusSure=this.attackTimer;this.vurusPoz=this.attackTimer;
   if(isBow){/* Kusanilan ok turu bitmisse sade oka duser. */const okId:ItemId=(s.equipment.ok&&s.inventory[s.equipment.ok])?s.equipment.ok:'arrow';const okTur=ITEMS[okId];const arrowCount=s.inventory[okId]||0;if(arrowCount<=0){this.vurusPoz=0;this.notify('Okun kalmadı! Sarnıç kapağının yanındaki sandıktan, Alf’ten veya diğer sandıklardan ok bulabilirsin.');return;}removeItem(s,okId);this.audio.play('swing');const damage=stats(s).attack+(this.tonic>0?8:0)+(ITEMS[s.equipment.armor].okHasar||0);let targets=this.mobs.filter(m=>Math.hypot(m.x-s.x,m.y-s.y)<160&&lineOfSight(this.world,s.x,s.y,m.x,m.y));targets.sort((a,b)=>Math.hypot(a.x-s.x,a.y-s.y)-Math.hypot(b.x-s.x,b.y-s.y));const okv=170*(silah.okHiz??1);let vx=0,vy=0;if(targets[0]){const d=Math.hypot(targets[0].x-s.x,targets[0].y-s.y)||1;vx=(targets[0].x-s.x)/d*okv;vy=(targets[0].y-s.y)/d*okv;this.face(targets[0].x-s.x,targets[0].y-s.y);}else{const v=this.yonVektor();vx=v.x*okv;vy=v.y*okv;}// Ok govdenin ONUNDEN cikar: merkezden dogunca sirttan firlamis gibi
   // gorunuyordu. Atis yonunde 9 birim ilerden baslatiliyor.
   {const hz=Math.hypot(vx,vy)||1;
    // Ileri pay: 9 birimken ok govdenin UZERINDE ciziliyordu. Cizim OK_YUKSEK
    // kadar yukari kaydigi icin asagi atista ok, ayak hizasindan 17 birim
    // yukarida yani tam sirtta beliriyordu; temizlenmesi icin pay OK_YUKSEK'i
    // gecmeli. Hedef daha yakinsa pay kisalir, yoksa ok hedefin arkasinda
    // dogup isabet etmezdi.
    const ileri=targets[0]?Math.max(9,Math.min(20,Math.hypot(targets[0].x-s.x,targets[0].y-s.y)*.6)):20;
    this.shots.push({x:s.x+vx/hz*ileri,y:s.y-4+vy/hz*ileri,vx,vy,life:1.3,damage,isHero:true,yakar:okTur.yakar,zehir:okTur.zehir,delici:okTur.delici,ceker:okTur.ceker,gecti:okTur.delici?[]:undefined});};this.save();this.emit();return;}
   this.slash=.2;this.audio.play('swing');
   /* Acilmis sandiklar ARTIK KIRILAMAZ: sandik iki yonlu bir kap oldu, icine
      esya konabiliyor - vurup yok etmek konulani da yok ediyordu. */
   const decors=this.world.entities.filter(e=>e.type==='decor'&&!e.asset?.includes('Table')&&Math.hypot(e.x-s.x,e.y-s.y)<38);
   for(const d of decors){
    const currentHp=(this.decorHp[d.id]??3)-1;
    this.decorHp[d.id]=currentHp;
    if(currentHp<=0){
     delete this.decorHp[d.id];
     this.world.entities=this.world.entities.filter(e=>e.id!==d.id);
     this.burst(d.x,d.y,d.type==='chest'?'#b88a52':'#8b5a2b',16);
     this.audio.play('hit');
     this.spawnDrop(d.x,d.y,'wood',1);
     this.notify(d.type==='chest'?'Boş sandığı kırdın: +1 Odun':'Ahşap eşyayı kırdın: +1 Odun');
    }else{
     this.burst(d.x,d.y,d.type==='chest'?'#b88a52':'#8b5a2b',5);
     this.audio.play('hit');
    }
   }
   /* Erisim silaha bagli: mizrak uzaktan, hancer yakindan. Kesme yayi da ayni
   carpanla ciziliyor ki gorsel menzille tutsun. */const eris=38*(silah.menzil??1);let targets=this.mobs.filter(m=>Math.hypot(m.x-s.x,m.y-s.y)<eris&&lineOfSight(this.world,s.x,s.y,m.x,m.y));targets.sort((a,b)=>Math.hypot(a.x-s.x,a.y-s.y)-Math.hypot(b.x-s.x,b.y-s.y));if(targets[0])this.face(targets[0].x-s.x,targets[0].y-s.y);/* Varsayilan TEK hedef. Once her silah menzildeki herkese birden
     vuruyordu; kalabalik dalgalar tek savurusla eriyordu. Alan hasari
     artik silaha ozel bir ozellik (Yarma baltasi). */for(const m of targets.slice(0,silah.alan??1)){let damage=stats(s).attack+(this.tonic>0?8:0);/* Arkadan vurus: dusmanin bakis yonu ile ona giden yon AYNI taraftaysa
   (ic carpim pozitif) sirtini donmus demektir. */if(silah.arkadan&&m.aci!==undefined){const vx=m.x-s.x,vy=m.y-s.y,n=Math.hypot(vx,vy)||1;if((Math.cos(m.aci)*vx+Math.sin(m.aci)*vy)/n>.35){damage=Math.round(damage*silah.arkadan);this.float(m.x,m.y-22,'SIRTTAN!','#ffd1a3');}}m.hp-=damage;m.hurt=.17;if(silah.sersemlet)m.sersem=silah.sersemlet;if(s.equipment.weapon==='ember')m.burn=3;if(silah.yakar)m.burn=Math.max(m.burn,silah.yakar);if(s.equipment.weapon==='blood')s.hp=Math.min(stats(s).maxHp,s.hp+3);this.float(m.x,m.y-12,String(damage),'#ffdaa3');this.burst(m.x,m.y,'#c76b5d',8);this.audio.play('hit');const d=Math.hypot(m.x-s.x,m.y-s.y)||1;this.move(m,(m.x-s.x)/d*5,(m.y-s.y)/d*5);if(m.id==='rauf'&&m.hp<=m.max*.18){this.raufDizCok();}else if(m.hp<=0)this.kill(m);}this.emit();}
  /** Fener tasiyan: saldirmaz. Oyuncu yaklasinca isik soner ve etrafa
   *  Bogulmus dolar - firtinada isiga gidenin basina gelen bu. Uzaktayken
   *  oyuncudan yavasca uzaklasir, yani pesinden gidersin. */
  private fener(m:Mob,d:number,dx:number,dy:number,dt:number){
   if(d<Engine.FENER_MENZIL){m.hp=0;this.state.killed.push(m.id);this.burst(m.x,m.y-12,'#ffb35a',22);this.audio.play('dusmanOlum',.6);
    this.notify('Fener söndü. Kül kalktı.');const max=Engine.CAN[8];
    for(let i=0;i<3;i++){const a=i*Math.PI*2/3+Math.random();const x=this.state.x+Math.cos(a)*40,y=this.state.y+Math.sin(a)*40;
     if(!walkable(this.world,x,y))continue;this.burst(x,y,'#8e8a82',10);
     this.mobs.push({id:`${m.id}_${i}`,kind:8,x,y,hp:max,max,cool:1.2+Math.random()*.6,windup:0,burn:0,hurt:0,homeX:x,homeY:y});}
    return;}
   if(d<120){m.aci=Math.atan2(dy,dx);const v=13;this.move(m,-dx/d*v*dt,-dy/d*v*dt,m.id,true);}
  }
  /* Kral ARTIK OLDURULEMEZ (kullanici karari). Vurulabilirlik kaldirildi:
     kralHasar/kralKilic/kralOk metotlari ve cagrilari silindi. Tac esyasi ve
     Obruk'un satin alma secenegi veride duruyor; simdilik ulasilamiyor. */
  /** ISIK HARITASI. Mekanin karanligi ekran disi bir tuvale doldurulur, her isik
   *  kaynagi 'destination-out' ile radyal gradient delik acar, sonra tuval sahnenin
   *  ustune basilir. Eski duz tint kaliyor (kullanici mevcut havayi begendi);
   *  bu katman yalnizca KARANLIK[mekan] > 0 olan yerlerde devreye girer. */
  private karanlik(cx:number,cy:number,time:number){
   const k=Engine.KARANLIK[this.state.zone]??0;if(k<=0)return;
   const en=this.gorus.en,boy=this.gorus.boy,O=2;// tuval olcegi: 1 dunya birimi = 2 px
   if(!this.isikTuval)this.isikTuval=document.createElement('canvas');
   const t=this.isikTuval;if(t.width!==en*O||t.height!==boy*O){t.width=en*O;t.height=boy*O;}
   const g=t.getContext('2d')!;g.setTransform(O,0,0,O,0,0);g.globalCompositeOperation='source-over';
   g.fillStyle=`rgba(3,5,12,${k})`;g.fillRect(0,0,en,boy);
   g.globalCompositeOperation='destination-out';
   const del=(x:number,y:number,r:number,guc=1)=>{if(x<cx-r||x>cx+en+r||y<cy-r||y>cy+boy+r)return;
    const gr=g.createRadialGradient(x-cx,y-cy,0,x-cx,y-cy,r);
    /* Yumusak gecis: bes ara durak, karanliga uzun kuyruk. */gr.addColorStop(0,`rgba(0,0,0,${guc})`);gr.addColorStop(.2,`rgba(0,0,0,${guc*.95})`);gr.addColorStop(.45,`rgba(0,0,0,${guc*.7})`);gr.addColorStop(.7,`rgba(0,0,0,${guc*.35})`);gr.addColorStop(.88,`rgba(0,0,0,${guc*.1})`);gr.addColorStop(1,'rgba(0,0,0,0)');
    g.fillStyle=gr;g.fillRect(x-cx-r,y-cy-r,r*2,r*2);};
   const s=this.state;const tit=(x:number)=>1+Math.sin(time*9+x)*.04+Math.sin(time*23+x*.7)*.02;
   // Oyuncu: mesaleyle genis, mesalesiz yalnizca cevresi (iki adim).
   /* Merkez ayak degil govde ortasi: sprite y'nin ustune ciziliyor, y-6'da isik karakterin altinda kaliyordu. */
   del(s.x,s.y-16,(this.mesale>0?Engine.ISIK.mesale*(this.mesaleElde()?1:.35)*(this.mesale<6?.5+this.mesale/12:1):Engine.ISIK.cip)*tit(s.x));
   for(const e of this.world.entities)if(e.type==='fire'||e.type==='core')del(e.x,e.y-6,Engine.ISIK.ates*tit(e.x));
   for(const [x,y,r] of this.world.isiklar)del(x,y,r*tit(x));
   for(const m of this.mobs){if(m.hp<=0)continue;if(m.kind===9)del(m.x,m.y-14,Engine.ISIK.fener*tit(m.x));else if(m.burn>0)del(m.x,m.y-8,Engine.ISIK.yanan);}
   for(const sh of this.shots)if(sh.yakar)del(sh.x,sh.y-Engine.OK_YUKSEK,Engine.ISIK.ok);
   for(const p of this.particles)if(p.color==='#f7af39'||p.color==='#ffb35a')del(p.x,p.y,6,.5);
   g.globalCompositeOperation='source-over';
   const c=this.ctx;c.drawImage(t,0,0,t.width,t.height,cx,cy,en,boy);
  }
  /** Wang karolari yalnizca boyali arka plan YOKSA gerekiyor; acilista 32 istek
   *  yapmasin diye o ana ertelendi. Bir kez tetiklenir. */
  private wangIstendi=false;
  private wangYukle(){if(this.wangIstendi)return;this.wangIstendi=true;
   for(const z of ['haven','cistern'])for(let i=0;i<16;i++)this.img(`wang_${z}_${i}`,`/assets/dungeon/wang/${z}/wang_${i}.png`).catch(()=>{});}
  /** Dash SIYIRMASI: kacarken uzerinden gectigimiz dusmanlar geri savrulur ve
  *  ufak hasar alir. Iskelet curuk oldugu icin temas ettigi anda DAGILIR -
  *  kalabaligin arasindan kacis bir temizlik hamlesine donusuyor.
  *  Henuz yerden cikmamis olan (cikis>0) vurulmaz: gorunurde yarim govde var,
  *  ona carpmak hile gibi olurdu. */
 private dashSiyir(){
  const s=this.state;
  for(const m of this.mobs){
   if(m.hp<=0||(m.cikis&&m.cikis>0)||m.kind===9)continue;      // 9: fener, dovusmuyor
   if(this.dashVuran.includes(m.id))continue;
   const dx=m.x-s.x,dy=m.y-s.y,d=Math.hypot(dx,dy)||1;
   if(d>Engine.DASH_YARICAP+(m.boss?12:0))continue;
   this.dashVuran.push(m.id);
   if(m.kind===11){m.hp=0;this.kill(m);continue;}
   m.hp-=Engine.DASH_HASAR;m.hurt=.17;
   const it=m.boss?6:Engine.DASH_ITME;
   this.move(m,dx/d*it,dy/d*it);
   this.float(m.x,m.y-12,String(Engine.DASH_HASAR),'#ffdaa3');
   this.burst(m.x,m.y,'#c9b7a3',6);this.audio.play('hit',.55);
   if(m.id==='rauf'&&m.hp<=m.max*.18)this.raufDizCok();else if(m.hp<=0)this.kill(m);
  }
 }
 private kill(m:Mob){
  if(m.id==='rauf'){this.raufDizCok();return;}
  /* Iskelet: tek vurusta olur ve PARCALANIR. Ayri dal cunku (a) altin
     dusurmemeli - 40 kisilik kalabalik servet olurdu, (b) her olumde save()
     cagirmak onlarca yazma demek, periyodik otomatik kayit zaten yetiyor. */
  if(m.kind===11){
   if(this.state.killed.includes(m.id))return;this.state.killed.push(m.id);
   const u=Math.hypot(m.x-this.state.x,m.y-this.state.y);
   this.audio.play('dusmanOlum',Math.max(.3,1-u/300));
   this.iskeletDagit(m,this.dusmanYon(m));this.spawnDrop(m.x,m.y,'xp',6);return;
  }
  if(this.state.killed.includes(m.id))return;this.state.killed.push(m.id);
  if(m.id==='muhafiz'){this.state.flags.muhafiz='oldu';addItem(this.state,'migfer',1);this.state.journal.unshift('Kralın son muhafızını yendin. Miğferi kül doluydu; boşaltmadın.');this.notify('Son muhafız düştü. Miğferi heybende.');}/* Menzil 190'di: yayla uzaktan oldurunce ses neredeyse duyulmuyordu. */
  {const u=Math.hypot(m.x-this.state.x,m.y-this.state.y);this.audio.play('dusmanOlum',Math.max(.35,1-u/300));}/* Kan muhrunun oldurunceCan'i da tanitiliyor ama hic uygulanmiyordu. */{const y=this.state.equipment.ring;const can=y?ITEMS[y].oldurunceCan:0;if(can&&this.state.hp>0&&this.state.hp<stats(this.state).maxHp){this.state.hp=Math.min(stats(this.state).maxHp,this.state.hp+can);this.float(this.state.x,this.state.y-10,'+'+can,'#d9838b');}}this.burst(m.x,m.y,m.boss?'#eeb559':'#a56a70',18);const xp=m.boss?210:([0,20,25,30,40,24,60,150,48,0,280][m.kind]??30);const gold=m.boss?60:m.kind===9?0:5+m.kind*2;this.spawnDrop(m.x,m.y,'xp',xp);this.spawnDrop(m.x+(Math.random()-.5)*12,m.y+(Math.random()-.5)*12,'gold',gold);if(m.boss){this.notify('Kül Bekçisi yenildi. Kanı hâlâ sıcak bir mühür bıraktı.');addItem(this.state,'potion',2);addItem(this.state,'kanm',1);}this.save();}
  /** Rauf olmez: cani kritige dusunce dovus biter ve diz coker.
  *  Esik %18 - oldurucu darbeyi hic yemesin, olum animasyonu oynamasin. */
 private raufDizCok(){
  if(!this.mobs.some(m=>m.id==='rauf'))return;
  const r=this.mobs.find(x=>x.id==='rauf');if(r){this.dizX=r.x;this.dizY=r.y;}
  this.mobs=this.mobs.filter(x=>x.id!=='rauf');
  this.state.flags.rauf='dizcokme';this.dizSayac=2.6;
  this.state.journal.unshift('Rauf dizlerinin üstüne çöktü. Artık seni takip ediyor.');
  this.notify('Rauf kılıcını düşürdü ve diz çöktü. Seni takip edecek.');
  this.save();this.emit();
 }
 /** dokunulmazlik: vurustan sonraki i-frame suresi. OLCULDU - kalabalik bir iskelet cemberi 5 saniyede 23 kez vuruyor ama oyuncu yalnizca 20 can kaybediyordu: .72 sn'lik sabit i-frame yuzunden 23 vurusun 19'u yutuluyordu. Yani kalabaligin tehdidi tek bir dusmanla AYNIYDI; 'oldurmesi cok kolay' hissinin asil sebebi hiz ya da can degil buydu. Zayif ve kalabalik dusmanlar (iskelet) daha kisa i-frame ile vurur - tek tek hala zararsizlar ama surunun arasinda durmak artik bedel odetir. */
 private hurt(damage:number,iframe=.72){if(this.invulnerable>0||this.state.hp<=0)return;const n=Math.max(2,damage-stats(this.state).defense);this.state.hp=Math.max(0,this.state.hp-n);this.invulnerable=iframe;this.audio.play('hurt');this.float(this.state.x,this.state.y-14,'−'+n,'#ff8b89');this.burst(this.state.x,this.state.y,'#dc7777',7);if(this.state.hp<=0){this.paused=true;this.audio.play('death');this.onEvent({type:'death'});}this.emit();}
  respawn(){/* Olum bir sifirlama: kapida bekleyenler de unutulur. */this.bekleyen={};this.state.hp=stats(this.state).maxHp;this.state.gold=Math.floor(this.state.gold*.9);this.state.journal.unshift('Sığınağa döndün. Altınının %10’unu yolda kaybettin.');this.changeZone('haven',[15,14]);this.paused=false;this.save();this.emit();}
  /** 8 dilim: her yon 45 derece. tan(67.5)=2.414 sinirlari veriyor.
   *  Dikey yonlerde flip kapatilir, yatay ve caprazlarda dx isaretini izler. */
  private face(dx:number,dy:number){const ax=Math.abs(dx),ay=Math.abs(dy);if(ax<.01&&ay<.01)return;
   if(ay>ax*2.414){this.direction=dy<0?'U':'D';this.flip=false;}
   else if(ax>ay*2.414){this.direction='S';this.flip=dx<0;}
   else{this.direction=dy<0?'US':'DS';this.flip=dx<0;}}
  /** Yonun birim vektoru - ok yonu ve yuvarlanma icin. */
  private yonVektor(){const x=this.direction==='U'||this.direction==='D'?0:(this.flip?-1:1);
   const y=this.direction==='U'||this.direction==='US'?-1:this.direction==='D'||this.direction==='DS'?1:0;
   const n=Math.hypot(x,y)||1;return{x:x/n,y:y/n};}
  /** Capraz sheet yoksa en yakin ana yone duser - eksik gorsel cizilmemesi yerine. */
  /** Dusman icin capraz sheet yoksa en yakin ana yon. Hurt/Death caprazda hic
  *  uretilmedi (0.17 sn goruntuleniyor, yon farki fark edilmiyor). */
 private dusmanPoz(kind:number,dir:string,action:string){const k=`enemies${kind}${dir}${action}`;
  if(this.images[k]?.naturalWidth)return k;
  return `enemies${kind}${dir==='DS'?'D':dir==='US'?'U':dir}${action}`;}
 private poz(action:string){const k=this.kit();
   if(this.images[k+this.direction+action]?.naturalWidth)return k+this.direction+action;
   const temel=this.direction==='DS'?'D':this.direction==='US'?'U':this.direction;
   return k+temel+action;}
  /** Oyuncu ve NPC'lerin govdesi: merkezden merkeze bundan yakin duramazlar. */
 static readonly CARP=13;
 /** ben=null ise hareket eden OYUNCU demektir (o zaman kendisi engel sayilmaz),
  *  aksi halde hareket eden NPC'dir ve oyuncu da engeldir. */
 /** Govde yaricapi: yaratiklar insanlardan kucuk, daha sik durabilirler. */
 /** Dusman golgesinin yariçapi (dunya birimi). Sabit 8 idi; genis kanatli
  *  yarasanin altinda kucuk, gövdesi dar olanlarda ise gereksiz genis
  *  kaliyordu. Yaratigin gorunur genisligine gore ayarlandi. */
 /** Dusman canlari. TEK yerde: once hem resetMobs hem dalga dogusu kendi
  *  kopyasini tutuyordu; trol eklenince biri guncellendi digeri kaldi ve
  *  can NaN olup mob ilk karede `hp>0` filtresine takilip yok oldu. */
 /* 11 (iskelet) = 1: TEK vurusta olur, kalabalik olmasinin bedeli bu. */
 static readonly CAN:Record<number,number>={1:34,2:42,4:80,5:24,6:72,7:190,8:64,9:1,10:230,11:1};
 /** Yakin vurus hasari; tabloda yoksa 10+kind*3. */
 /* 11 (iskelet) tabloda OLMASAYDI varsayilan 10+11*3=43 olurdu - tek vurusta
    olen ve onlarca olan bir dusman icin bu olumcul cok yuksekti (14 kisilik
    cember oyuncuyu iki vurusta bitiriyordu). Kalabalik tehdidi sayidan
    gelsin diye tek tek vuruslari zayif. */
 static readonly HASAR:Record<number,number>={8:14,9:0,10:26,11:6};
 /** Takip hizi; tabloda yoksa 27. Bogulmus su icinde yurur gibi yavas. */
 static readonly HIZ:Record<number,number>={4:21,8:15,10:24,11:Engine.ISKELET_HIZ};
 /** Kralin tac hareketi: her KRAL_DONGU saniyede bir oynar (Tac sayfasinin
  *  suresi kadar), aradaki zaman bas sallama (Idle). */
 static readonly KRAL_DONGU=26;
 /** Kral oturdugu icin hareketi goze batiyor: iki kucuk hareket arasinda bu
  *  kadar saniye HAREKETSIZ durur, bas sallama ile el hareketi donusumlu gelir. */
 static readonly KRAL_SALLA=9;
 /** Kralin kare hizi: 5 fps'te hareketleri seyirtiyordu. */
 static readonly KRAL_FPS=7;
 /** Ilgili sayfanin kare sayisi (yuklenmediyse 0). */
 private kareSay(k:string){const im=this.images[k];return im?.naturalWidth?Math.floor(im.naturalWidth/128):0;}
 /** Mekan basina karanlik (0 = mevcut duz tint, 1 = zifiri). Kullanici mevcut
  *  mekanlarin havasini begendi: hepsi 0, yani isik katmani hic devreye girmiyor
  *  ve mekanlar eski haliyle duruyor. Sarnic Agzi .82 ile denendi, deneme
  *  bitince geri alindi. Yeni karanlik mekan geldiginde buraya degeri yazilir
  *  (0'dan buyuk olmasi yeterli) ve varsa duvar mesaleleri World.isiklar'a. */
 static readonly KARANLIK:Record<string,number>={haven:0,magara:0,cistern:0,disari:0,yikik:0,tunel:.88};
 /** Mesale suresi (sn) ve yaricaplari: mesaleli / mesalesiz oyuncu, ates, fener. */
 static readonly MESALE_SURE=90;
 static readonly ISIK={mesale:104,cip:26,ates:64,fener:40,yanan:26,ok:18};
 /** Fener tasiyan bu mesafede soner ve etrafa Bogulmus birakir. */
 static readonly FENER_MENZIL=46;
 static readonly GOLGE:Record<number,number>={1:9,2:8,4:8,5:11,6:8,7:18,8:9,9:5,10:10,11:8};
 /** Hucre eni (dunya birimi). Trol sopasiyla 64'e sigmiyordu, 112 px kullaniyor. */
 static readonly DUSMAN_EN:Record<number,number>={7:56};
 /** Buyuk dusmanlarin capasi. Varsayilan 21 sprite'i 42 satira siniriyor. */
 static readonly DUSMAN_CAPA:Record<number,number>={7:31};
 /** Ciz olcegi. Trol bir mini-patron: oyuncudan belirgin buyuk gorunmeli. */
 /** Dash siyirmasi: temas yaricapi, hasari ve geri itmesi. Hasar KUCUK -
  *  kacis bir saldiri hilesine donusmemeli, yalnizca "carptim" hissi versin. */
 static readonly DASH_YARICAP=13;
 static readonly DASH_HASAR=4;
 static readonly DASH_ITME=30;
 /** Yerden cikis toprağinin paleti. OLCULDU: koridor zemininin iskelet
  *  ayaklarinin bastigi yerlerdeki rengi L 25-30 / a +8.5 / b +7 - yani
  *  KIRMIZIMSI. Onceki elle secilen tonlar zeytuni-sari (a +4.5 / b +10..18)
  *  ve cok parlakti (L 39-50), toprak sahneye ait gorunmuyordu. Bu dizi ayni
  *  eksende (a +8..9.5 / b +5..8), yalniz parlaklikta zeminin bir tik ustune
  *  cikiyor ki tumsek okunsun: [yarik L12, tumsek tabani L17.5, kesek L33]. */
 static readonly TOPRAK=['#2b1c1a','#392723','#5f4843'];
 /** Sicrayan toprak kirintilari - ayni eksenin uc parlakligi. */
 static readonly TOPRAK_KIR=['#4e3934','#624b45','#775d56'];
 /** Ucusan kemik gorselleri (public/assets/nesne/kemik/*.png). */
 static readonly KEMIKLER=['kafatasi','kaburga','uyluk','omurga','kirik'];
 /** Kemikler 32px'lik kendi tuvalinde uretildi; iskeletin yaninda dogru
  *  boyda durmasi icin kucultulur. 0.42 oyun olceginde FARK EDILMIYORDU,
  *  0.58 de zayif kaldi; 0.85'te kemik karakterin onkolu kadar. */
 static readonly KEMIK_OLCEK=.85;
 /** Tek kafatasi digerlerinden iri cizilir - dagilmanin odak noktasi. */
 static readonly KAFATASI_BUYUT=1.35;
 static readonly DUSMAN_OLCEK:Record<number,number>={7:1.7};
 /** Alevin yakma yaricapi (dunya birimi) ve tur basina hasar. Oyuncunun
  *  hasari ayri (8) cunku zirh savunmasi ondan dusuluyor. */
 /** Zehir: saniye basina hasar ve hedefin hiz carpani. Ates 3 sn x 3 hasar
  *  (9); zehir 8 sn x 2 (16) ama daha yavas gelir ve hedefi agirlastirir. */
 static readonly ZEHIR_HASAR=2;
 static readonly ZEHIR_YAVAS=.7;
 static readonly ATES_YARICAP=14;
 static readonly ATES_HASAR=10;
 /** Bolgeden cikarken bu menzildeki dusmanlar "pesimizde" sayilir. */
 static readonly BEKLEME_MENZIL=170;
 /** Geri donunce kapinin onunde bu uzaklikta dizilirler (~2 karo). */
 static readonly BEKLEME_UZAK=46;
 static readonly BEKLEME_DENEME=12;
 static readonly CARP_MOB=14;
 /** KUSATMA AYARI (tum dusmanlar). Eskiden hedefe duz cizgide yuruyup
  *  move()'un mob carpismasina takiliyorlardi: on saf oyuncuya yapisiyor,
  *  arkadakiler oldugu yerde kalip SIRA olusturuyordu. Artik yoldaki
  *  komsulari teget bir itkiyle dolaniyorlar. */
 static readonly KACIN_YARICAP=26;   // bu uzakliktaki komsular yolu kapatiyor sayilir
 static readonly KACIN_GUC=1.15;     // teget itkinin hedef yonune gore agirligi
 static readonly SIYIRMA_ACI=Math.PI/3;  // tam kilitlenince denenen ilk sapma
 /** Dusmanin dusmani SERT engelledigi yaricap. Ayrisma itmesi (CARP_MOB=14)
  *  bundan genis: aradaki farkta birbirlerine GIREBILIYOR ama surekli itiliyorlar.
  *  Ikisi esitken on saf katı bir duvar oluyordu ve arkadakiler sirada bekliyordu
  *  (kullanici: "belli bir siraya gecip sirada bekliyorlar"). */
 static readonly ENGEL_MOB=9;
 private *karakterler(ben:string|null,mobDahil=false){
  if(ben!==null)yield{x:this.state.x,y:this.state.y,r:Engine.CARP};
  for(const e of this.world.entities)if(e.type==='npc'&&e.id!==ben)yield{x:e.x,y:e.y,r:Engine.CARP};
  // Dusmanlar hicbir carpisma listesinde yoktu, yani suru tek bir yigin
  // halinde ust uste binerek geliyordu. Yalnizca DUSMAN hareketinde acilir:
  // oyuncunun icinden gecebilmesi degismesin diye.
  if(mobDahil)for(const m of this.mobs)if(m.hp>0&&m.id!==ben)yield{x:m.x,y:m.y,r:m.boss?Engine.CARP:Engine.ENGEL_MOB};
 }
 /** Yalnizca YAKLASAN hareket engellenir. Duz "yakinsa durdur" deseydik ic ice
  *  girmis iki karakter birbirine kilitlenip yerinden kimildayamazdi. */
 private carpisir(px:number,py:number,nx:number,ny:number,ben:string|null,mobDahil=false){
  for(const o of this.karakterler(ben,mobDahil)){
   const d=Math.hypot(o.x-nx,o.y-ny);
   if(d<o.r&&d<Math.hypot(o.x-px,o.y-py))return true;
  }
  return false;
 }
 /** Tunelin sonuna varinca bolge degistirir, ucuruma girince dusurur.
  *  Kapi nesnesine basmak yerine yuruyerek gecis: koridorun son karo siridi
  *  tetikleyici. Hedef dogma noktasi bilerek tetikleyicinin disinda secildi,
  *  yoksa varir varmaz geri gonderirdi. */
 private bolgeKontrol(){
  if(this.dusus>0)return;
  const tx=this.state.x/16,ty=this.state.y/16;
  for(const g of this.world.gecisler){const[x1,y1,x2,y2]=g.kutu;
   if(tx>=x1&&tx<x2&&ty>=y1&&ty<y2){this.changeZone(g.to,g.spawn);return;}}
  for(const[x1,y1,x2,y2]of this.world.ucurumlar){
   if(tx>=x1&&tx<x2&&ty>=y1&&ty<y2){this.dusmeyeBasla();return;}}
 }
 private dusmeyeBasla(){
  this.dusus=Engine.DUSUS;this.dustu=false;this.input={x:0,y:0,attack:false};
  this.audio.play('hurt');this.notify('Ayağın boşluğa bastı…');
  this.burst(this.state.x,this.state.y,'#8a97a6',10);
 }
 /* dustu: sayac sifirlandiktan SONRA da "bosluga dustu" durumunu tasir. Yoksa
    dusus=0 olur olmaz render normal (ayakta) sprite'a donuyordu ve olum paneli
    acilana kadar birkac kare karakter dimdik gorunuyordu. */
 private dusmeBitti(){this.dusus=0;this.dustu=true;this.oldu('Sarnıç Ağzı’ndaki uçuruma düştün.');}
 private oldu(not:string){
  this.state.hp=0;this.paused=true;this.audio.play('death');
  this.state.journal.unshift(not);this.onEvent({type:'death'});this.emit();
 }
 /** Dusmani hedefe dogru yurutur ve onu KAPATANLARIN ETRAFINDAN dolastirir.
  *  Iki asama: (a) onumdeki komsular icin teget bir kacinma itkisi, (b) buna
  *  ragmen hic ilerleyemediysem tegetleri tek tek dene. Boylece kalabalik
  *  sira olmak yerine oyuncunun cevresini sariyor. Tum dusmanlar icin gecerli. */
 private dusmanYurut(m:Mob,hx:number,hy:number,v:number,dt:number){
  const dx=hx-m.x,dy=hy-m.y,d=Math.hypot(dx,dy)||1;
  let ux=dx/d,uy=dy/d;
  /* Yalnizca EN YAKIN ONDEKI komsu hesaba katilir. Once hepsi toplanıyordu ama
     kalabalikta saga ve sola dusen komsularin teget itkileri BIRBIRINI GOTURUYOR,
     toplam sifira yaklasip yaratik yine duz yuruyordu. */
  let en:Mob|null=null,enD=1e9;
  for(const o of this.mobs){if(o===m||o.hp<=0)continue;
   const ox=o.x-m.x,oy=o.y-m.y,od=Math.hypot(ox,oy);
   if(od<.01||od>Engine.KACIN_YARICAP||od>=enD)continue;
   if((ox*ux+oy*uy)/od<.3)continue;   // arkamdakinden kacinmak sacma
   en=o;enD=od;
  }
  let kx=0,ky=0;
  if(en){
   /* Donus yonu MOB'A SABIT (m.yan): her karede capraz carpimdan hesaplanirsa
      yaratik iki komsu arasinda saga-sola titriyor ve ilerlemiyor. Sabit yon
      onu komsunun etrafindan gercekten DOLASTIRIYOR. */
   if(m.yan===undefined)m.yan=Math.random()<.5?-1:1;
   const g=1-enD/Engine.KACIN_YARICAP;
   kx=-uy*m.yan*g;ky=ux*m.yan*g;
  }
  const hx2=ux+kx*Engine.KACIN_GUC,hy2=uy+ky*Engine.KACIN_GUC;
  const n=Math.hypot(hx2,hy2)||1;ux=hx2/n;uy=hy2/n;
  const ox0=m.x,oy0=m.y,adim=v*dt,esik=adim*.25;
  this.move(m,ux*adim,uy*adim,m.id,true);
  if(Math.hypot(m.x-ox0,m.y-oy0)>=esik)return;
  /* Tam kilit: dar gecitte iki yaratik ayni anda girmeye calisiyor. */
  for(const a of [Engine.SIYIRMA_ACI,-Engine.SIYIRMA_ACI,Math.PI/2,-Math.PI/2]){
   const c=Math.cos(a),sn=Math.sin(a);
   this.move(m,(ux*c-uy*sn)*adim,(ux*sn+uy*c)*adim,m.id,true);
   if(Math.hypot(m.x-ox0,m.y-oy0)>=esik)return;
  }
 }
 private move(p:{x:number;y:number},dx:number,dy:number,ben:string|null=null,mobDahil=false,ry?:number,rx=5){
  if(walkable(this.world,p.x+dx,p.y,rx,undefined,ry)&&!this.carpisir(p.x,p.y,p.x+dx,p.y,ben,mobDahil))p.x+=dx;
  if(walkable(this.world,p.x,p.y+dy,rx,undefined,ry)&&!this.carpisir(p.x,p.y,p.x,p.y+dy,ben,mobDahil))p.y+=dy;
 }
  /** Ucurumdan havalanan yarasa surusu. Dagilarak doguyorlar ki tek yigin
  *  halinde gelmesinler; kimlikleri benzersiz, yoksa `killed` listesi bir
  *  onceki surunun olulerini hatirlar ve hepsi olu dogar. */
 private yarasaSurusu(kx:number,ky:number,adet:number){
  const max=Engine.CAN[5];
  for(let i=0;i<adet;i++){
   const a=Math.random()*Math.PI*2,r=6+Math.random()*30;
   let sx=kx*16+8+Math.cos(a)*r,sy=ky*16+8+Math.sin(a)*r;
   for(let k=0;k<12&&!walkable(this.world,sx,sy);k++){sx=kx*16+8+(Math.random()-.5)*40;sy=ky*16+8+(Math.random()-.5)*40;}
   this.mobs.push({id:`tuhnyarasa_${this.tick.toFixed(0)}_${i}`,kind:5,x:sx,y:sy,hp:max,max,
    cool:.4+Math.random()*.8,windup:0,burn:0,hurt:0,homeX:sx,homeY:sy});}
  this.burst(kx*16+8,ky*16+8,'#6d5a72',26);
 }
 /** Koz kavanozunun patlamasi: alan hasari + yanma. */
 private kavanozPatla(x:number,y:number){
  this.burst(x,y,'#f0a35c',26);this.burst(x,y,'#ffd08a',14);this.audio.play('hit');
  for(const m of this.mobs){if(m.hp<=0)continue;const d=Math.hypot(m.x-x,m.y-y);
   if(d<34){const h=Math.round(26*(1-d/34)+14);m.hp-=h;m.hurt=.17;m.burn=3;
    this.float(m.x,m.y-12,String(h),'#ffb066');if(m.hp<=0)this.kill(m);}}
 }
 /** Nokta bir alevin yakma yaricapinda mi. Ates artik oyuncu disindakileri de
  *  yaktigi icin hem hasar turunde hem NPC hedef seciminde kullaniliyor. */
 private atesteMi(x:number,y:number){
  return this.world.entities.some(e=>e.type==='fire'&&this.atesTemas(e,x,y));
 }
 /** Bir nokta bir ates entity'sinin GERCEKTEN yakan bolgesinde mi. Eskiden
  *  e.x,e.y merkezli TAM SIMETRIK bir daireydi - sprite yukari dogru uzun
  *  bir alev cizdigi icin (bkz. sprite()'taki decor "top=-h*scale+6"), bu
  *  dairenin ust yarisi alevin gorsel TEPESINE kadar yaniyordu, oysa orasi
  *  sadece duman/ucuk kismi, gercek kor/taban degil. Kullanici "ustu
  *  yakmasin sadece alti yaksin" dedi - daire artik YUKARI dogru kirpik:
  *  hedef, ates'in taban noktasindan (e.y) ustPay'dan fazla yukaridaysa
  *  (kucuk y) hic yanmiyor; yanlarda ve altta eski yaricap aynen gecerli. */
 private atesTemas(e:Entity,x:number,y:number):boolean{
  const r=Engine.ATES_YARICAP*(e.s??1);
  const ustPay=4*(e.s??1);
  if(e.y-y>ustPay)return false;
  return Math.hypot(e.x-x,e.y-y)<r;
 }
 /** Oyuncu yaklasinca gomulu iskeletleri yerden cikarir. Cikis suresince
  *  (cikis>0) yurumez ve vurmazlar; render onlari yerden yukselirken cizer. */
 private iskeletKontrol(){
  if(!this.gomulu.length)return;
  const kalan:EnemySpec[]=[];
  for(const e of this.gomulu){
   if(Math.hypot(e.x-this.state.x,e.y-this.state.y)>Engine.ISKELET_UYANMA){kalan.push(e);continue;}
   const max=Engine.CAN[11]??1;
   this.mobs.push({...e,hp:max,max,cool:.6+Math.random()*.6,windup:0,burn:0,hurt:0,
    homeX:e.x,homeY:e.y,cikis:Engine.ISKELET_CIKIS});
   /* Toprak fiskirmasi: cikis ANINDA, ayak hizasinda. */
   for(let i=0;i<10;i++)this.particles.push({x:e.x+(Math.random()-.5)*14,y:e.y+(Math.random()-.5)*4,
    vx:(Math.random()-.5)*40,vy:-20-Math.random()*45,life:.35+Math.random()*.3,
    color:Engine.TOPRAK_KIR[Math.floor(Math.random()*3)],size:1+Math.random(),g:150});
   this.audio.play('trap',Math.max(.25,1-Math.hypot(e.x-this.state.x,e.y-this.state.y)/260));
  }
  this.gomulu=kalan;
 }
 /** Iskelet olunce DAGILIR: govdesinden kafatasi + kemik parcalari firlar,
  *  ustune kemik kiymigi + toz atilir. Parcalar ayri uretilmis kucuk
  *  gorseller (public/assets/nesne/kemik), sprite dilimi degil. */
 /** Bir mob'un oyuncuya gore bakis yonu (yalniz D/U/S - enemies sheet'leri
  *  bu uc yonde; render de capraz yonleri bunlara dusuruyor). */
 private dusmanYon(m:Mob){const dx=this.state.x-m.x,dy=this.state.y-m.y;
  return Math.abs(dy)>Math.abs(dx)?(dy<0?'U':'D'):'S';}
 private iskeletDagit(m:Mob,yon:string){
  void yon;
  const ol=(Engine.DUSMAN_OLCEK[m.kind]??1)*OYUNCU_OLCEK;
  const capa=Engine.DUSMAN_CAPA[m.kind]??21;
  /* Kemikler govde yuksekliginde (ayak: m.y, tepe: m.y-capa*ol) dogar.
     Kafatasi hep tepeden ve en hizli firlar; kalan parcalar govdeye dagilir. */
  const at=(anahtar:string,h:number,hiz:number,buyut=1)=>{
   const yon2=Math.random()<.5?-1:1;
   this.parcalar.push({anahtar,
    x:m.x+(Math.random()-.5)*6*ol,y:m.y-capa*ol*h,
    /* Hizlar KUCULTULDU: kemikler ekranin yarisina savruluyordu, artik
       govdenin cevresine dokuluyor. */
    vx:yon2*(14+Math.random()*44)*hiz,vy:-(38+Math.random()*52)*hiz,
    aci:Math.random()*6.28,donus:(Math.random()-.5)*10,
    /* Havada yok olmuyorlar: yere konup orada yavasca soluyorlar. */
    life:2.1+Math.random()*.8,omur:.9,
    yer:m.y+(Math.random()*5-1.5)*ol,olcek:ol*Engine.KEMIK_OLCEK*buyut});
  };
  /* Kafatasi TEK: birden fazlasi "iki kafali iskelet" gibi duruyor. Buna
     karsilik digerlerinden belirgin buyuk cizilir, dagilmanin odagi o. */
  at('kafatasi',.92,1.15,Engine.KAFATASI_BUYUT);
  const kalan=Engine.KEMIKLER.filter(k=>k!=='kafatasi');
  const adet=10+Math.floor(Math.random()*4);
  for(let i=0;i<adet;i++)at(kalan[Math.floor(Math.random()*kalan.length)],.12+Math.random()*.76,1,.85+Math.random()*.4);
  for(let i=0;i<14;i++)this.particles.push({x:m.x,y:m.y-8-Math.random()*10,
   vx:(Math.random()-.5)*95,vy:-30-Math.random()*70,life:.5+Math.random()*.45,
   color:['#e9e2cf','#cfc6ad','#a99e86'][Math.floor(Math.random()*3)],size:1+Math.random()*1.6,g:190});
  for(let i=0;i<7;i++)this.particles.push({x:m.x,y:m.y-4,
   vx:(Math.random()-.5)*45,vy:-8-Math.random()*22,life:.4+Math.random()*.3,
   color:'#6b5f4d',size:1+Math.random(),g:90});
 }
 private burst(x:number,y:number,color:string,n:number){for(let i=0;i<n;i++)this.particles.push({x,y,vx:(Math.random()-.5)*55,vy:(Math.random()-.6)*55,life:.4+Math.random()*.4,color,size:1+Math.random()})}
  private float(x:number,y:number,text:string,color:string){let targetY=y;for(const f of this.floating){if(Math.abs(f.x-x)<24&&Math.abs(f.y-targetY)<10){targetY-=11;}}this.floating.push({x,y:targetY,text,life:1.1,color})}
  private update(dt:number){
  if(this.uyku>0){this.uyku-=dt;
   const gecen=Engine.UYKU-this.uyku;
   if(gecen>=.9&&!this.uykuDondu){this.uykuDondu=true;
    // tam karanlikken don: donusun kendisi gorunmesin
    if(this.direction==='D')this.direction='U';
    else if(this.direction==='U')this.direction='D';
    else this.flip=!this.flip;}
   if(this.uyku<=0)this.uyku=0;
   return;}
  if(this.dusus>0){this.dusus-=dt;if(this.dusus<=0)this.dusmeBitti();return;}
  this.tick+=dt;this.state.playtime+=dt;
  if(this.merhem>0&&this.state.hp>0)this.state.hp=Math.min(stats(this.state).maxHp,this.state.hp+6*dt);
  if(this.petek>0&&this.state.hp>0)this.state.hp=Math.min(stats(this.state).maxHp,this.state.hp+4*dt);
  // Yemin halkasi: esigin altina DUSUNCE bir kez. Her bolgede yenilenir,
  // yoksa tek kullanimlik olur ve oyuncu yuzugu hic takmaz.
  {const r=this.state.equipment.ring,k=r?ITEMS[r].kurtarma||0:0;const en=stats(this.state).maxHp;
   if(k&&!this.halka&&this.state.hp>0&&this.state.hp<en/3){this.halka=true;this.state.hp=Math.min(en,this.state.hp+k);
    this.float(this.state.x,this.state.y-18,'YEMİN TUTTU','#f0d59a');this.audio.play('level');this.emit();}}for(const key of ['attackTimer','dodgeTimer','dash','invulnerable','tonic','bileme','merhem','petek','kulKoru','yavas','mesale','gizli','slash','vurusPoz','trapCooldown']as const)this[key]=Math.max(0,this[key]-dt);
  /* Mesale sondu: elden cikar, onceki silaha don. Kalan sure kayda da yazilir
     ki sayfa yenilenince mesale elde ama sonuk kalmasin. */
  {const s=this.state;if(this.mesale>0)s.flags.mesaleKalan=String(Math.ceil(this.mesale));
   else if(s.inventory.elmesale){delete s.flags.mesaleKalan;removeItem(s,'elmesale');
    if(s.equipment.weapon==='elmesale')s.equipment.weapon=(this.mesaleOnce!=='elmesale'&&s.inventory[this.mesaleOnce])?this.mesaleOnce:'yumruk';
    this.notify('Meşale söndü.');this.emit();}}
   const kx=(this.keys.right?1:0)-(this.keys.left?1:0),ky=(this.keys.down?1:0)-(this.keys.up?1:0),kLen=Math.hypot(kx,ky),activeInput=kLen>0?{x:kx/kLen,y:ky/kLen}:this.input;/* Kacis izi: dash suresince sabit arayla soluk kopya birakilir; render
     bunlari oyuncudan ONCE cizer, boylece arkada kalmis gorunurler. */
   if(this.dash>0){this.izSayac-=dt;if(this.izSayac<=0){this.izSayac=.028;
    this.izler.push({x:this.state.x,y:this.state.y,anahtar:this.poz(this.moving?'Walk':'Idle'),
     kare:Math.floor(this.yol/Engine.ADIM),flip:this.flip,life:.26});}}
   for(const iz of this.izler)iz.life-=dt;this.izler=this.izler.filter(i=>i.life>0);
   const movement=this.dash>0?this.dashVector:activeInput;const length=Math.hypot(movement.x,movement.y);this.moving=length>.08;/* Ocak zirhinin agirligi (yavaslik) da tanimliydi ama kullanilmiyordu. */
   const speed=(this.dash>0?205:44)*(ITEMS[this.state.equipment.armor].yavaslik??1)*(this.yavas>0?.6:1);if(this.moving){const dx=movement.x/Math.max(1,length),dy=movement.y/Math.max(1,length);this.face(dx,dy);this.move(this.state,dx*speed*dt,dy*speed*dt,null,false,Engine.OYUNCU_DIKEY_YARICAP,Engine.OYUNCU_YATAY_YARICAP);this.bolgeKontrol();if(this.dash>0)this.dashSiyir();this.yol+=speed*dt;if(this.tick-this.stepAt>.29){this.audio.play('step');this.stepAt=this.tick;}}if(this.input.attack)this.attack();
   // --- Kul Ovasi: can erimesi + ruzgarda savrulan kul ---
   if(this.state.zone==='disari'&&this.state.hp>0&&!this.paused){
    /* Kul pelerininin kulKalkan'i ve Duru su'yun korumasi BURADA isliyor;
       ikisi de tanitiliyordu ama hicbir yerde okunmuyordu. */
    const kalkan=this.kulKoru>0?0:(ITEMS[this.state.equipment.armor].kulKalkan??1);
    this.state.hp=Math.max(0,this.state.hp-Engine.KUL_HASAR*kalkan*dt);
    if(this.state.hp<=0){this.oldu('Kül Ovası’nda nefesin tükendi.');}
    // Kul kamera alanina serpiliyor, oyuncunun etrafina degil: ruzgar butun
    // ovada esiyormus gibi dursun.
    /* FIRTINA: uc haftadir kul yagmiyor, esiyor. Yogunluk ve ruzgar buna gore. */
    else if(Math.random()<dt*70){
     this.particles.push({x:this.camera.x-24+Math.random()*(this.gorus.en+48),
      y:this.camera.y-14+Math.random()*(this.gorus.boy+28),
      vx:48+Math.random()*60,vy:6+Math.random()*14,
      life:1.5+Math.random()*2,
      color:['#cdc6bb','#a89f95','#e2dbd0'][Math.floor(Math.random()*3)],
      size:1,g:3});}
   }
   this.fireBurnCooldown=Math.max(0,this.fireBurnCooldown-dt);
   if(this.fireBurnCooldown<=0){
    // --- Ates herkesi yakar ---
    // Once yalnizca oyuncuyu yakiyordu: dusmanin alevin icinden gecip hicbir
    // sey olmamasi tuhaftı ve oyuncunun ateşi taktik olarak kullanmasini
    // engelliyordu. Tek sayac, tek tur: hem oyuncu hem yaratiklar hem yoldas.
    let yandi=false;
    for(const e of this.world.entities){
     if(e.type!=='fire')continue;
     if(this.atesTemas(e,this.state.x,this.state.y)){
      if(!ITEMS[this.state.equipment.armor].atesBagisik){
       this.hurt(8);this.float(this.state.x,this.state.y-14,'Ateş yaktı!','#ff6b4a');}
      yandi=true;}
     for(const m of this.mobs){
      if(m.hp<=0||!this.atesTemas(e,m.x,m.y))continue;
      m.hp-=Engine.ATES_HASAR;m.hurt=.17;m.burn=Math.max(m.burn,1.5);
      this.float(m.x,m.y-12,String(Engine.ATES_HASAR),'#ff9e5e');
      if(m.hp<=0){if(m.id==='rauf')this.raufDizCok();else this.kill(m);}
      yandi=true;}
     // Yoldas Rauf'un kendi cani var; o da yanar.
     const yoldas=this.state.flags.rauf==='takip'?this.world.entities.find(x=>x.id==='rauf'):null;
     if(yoldas&&this.atesTemas(e,yoldas.x,yoldas.y)){
      const kalan=Math.max(0,(Number(this.state.flags.raufCan)||0)-Engine.ATES_HASAR);
      this.state.flags.raufCan=String(Math.round(kalan));
      this.float(yoldas.x,yoldas.y-16,'−'+Engine.ATES_HASAR,'#ff9e5e');
      yandi=true;}
    }
    if(yandi)this.fireBurnCooldown=.8;
   }
   for(const m of this.mobs){if(m.hp<=0)continue;/* Yerden cikarken sadece animasyon oynar: yurumez, vurmaz, sayaclari islemez. */if(m.cikis&&m.cikis>0){m.cikis-=dt;
    /* Toprak KAYNAR: tek seferlik patlama yerine cikis boyunca ayak dibinden
       kirinti sicrar - hareket eden toprak hissini veren asil sey bu. */
    if(Math.random()<dt*30)this.particles.push({x:m.x+(Math.random()-.5)*13,y:m.y-1,
     vx:(Math.random()-.5)*38,vy:-22-Math.random()*36,life:.28+Math.random()*.26,
     color:Engine.TOPRAK_KIR[Math.floor(Math.random()*3)],size:1+Math.random(),g:180});
    continue;}m.cool-=dt;m.hurt=Math.max(0,m.hurt-dt);if(m.zehir&&m.zehir>0){m.zehir-=dt;m.hp-=Engine.ZEHIR_HASAR*dt;
    // Sayilar her karede degil saniyede bir yaziliyor; yoksa ekran doluyor.
    m.zehirTik=(m.zehirTik??0)+dt;
    if(m.zehirTik>=1){m.zehirTik=0;this.float(m.x,m.y-12,String(Engine.ZEHIR_HASAR),'#9fd47a');}
    if(m.hp<=0){if(m.id==='rauf')this.raufDizCok();else this.kill(m);continue;}}
   if(m.burn>0){m.burn-=dt;m.hp-=3*dt;if(m.id==='rauf'&&m.hp<=m.max*.18){this.raufDizCok();}else if(m.hp<=0){this.kill(m);continue;}}const dx=this.state.x-m.x,dy=this.state.y-m.y,d=Math.hypot(dx,dy)||1,visible=lineOfSight(this.world,m.x,m.y,this.state.x,this.state.y);if(m.kind===9){this.fener(m,d,dx,dy,dt);continue;}if(m.windup>0){m.windup-=dt;/* Iskelet HAMLE yapar: digerleri vurus hazirliginda cakili dururken iskelet oyuncuya dogru atilir. Olculdu: hamlesiz surumde skelet (38) oyuncudan (44) yavas oldugu icin windup biterken oyuncu menzilden cikiyordu ve 8 saniyelik bir gecis yalnizca 24 cana mal oluyordu - 'oldurmesi cok kolay' hissinin asil sebebi buydu. Hamle hizi oyuncunun ustunde ama yalnizca .26 sn surer. */if(m.kind===11)this.dusmanYurut(m,this.state.x,this.state.y,Engine.ISKELET_HAMLE,dt);if(m.windup<=0){/* Ses uzakliga gore kisiliyor: ekranin obur ucundaki bir yaratik yanindaki
     kadar yuksek vurmamali. */this.audio.play('dusmanVur',Math.max(0,1-d/190));if(m.kind===2){const v=75;this.shots.push({x:m.x,y:m.y,vx:dx/d*v,vy:dy/d*v,life:2.5,damage:15});}else if(d<(m.boss?40:m.kind===10?30:m.kind===11?Engine.ISKELET_VURUS_MENZIL:25)){this.hurt(m.boss?30:Engine.HASAR[m.kind]??10+m.kind*3,m.kind===11?Engine.ISKELET_IFRAME:.72);/* Bogulmus sarilinca kul cigere doluyor: oyuncu 3 sn agirlasir. */if(m.kind===8&&this.state.hp>0){this.yavas=3;this.float(this.state.x,this.state.y-18,'AĞIRLAŞTIN','#b9b2a6');}}if(m.boss){for(let i=0;i<8;i++){const a=i*Math.PI/4;this.shots.push({x:m.x,y:m.y,vx:Math.cos(a)*58,vy:Math.sin(a)*58,life:2.1,damage:20});}}m.cool=m.boss?1.6:m.kind===2?1.7:m.kind===11?Engine.ISKELET_COOL:1.15;}continue;}if(d<(m.kind===11?Engine.ISKELET_GORUS:135)&&visible){m.aci=Math.atan2(dy,dx);/* SALDIRIYI BASLATMA menzili. Iskelette ayri: asil darbogaz burasiydi -
     cemberin arka safi 22-28 birimde takilip kaliyor ve 20'lik esige hic
     giremedigi icin windup'a bile baslamiyordu (olculdu: 9 dusman yanibasindayken
     5 saniyede yalniz 23 vurus). */
    const range=m.kind===2?95:m.boss?34:m.kind===10?26:m.kind===11?Engine.ISKELET_SALDIRI_MENZIL:20;if(d>range){const v=(Engine.HIZ[m.kind]??27)*(m.zehir&&m.zehir>0?Engine.ZEHIR_YAVAS:1);this.dusmanYurut(m,this.state.x,this.state.y,v,dt);}if(d<=range&&m.cool<=0)m.windup=m.boss?.8:m.kind===2?.55:m.kind===10?.7:m.kind===11?Engine.ISKELET_WINDUP:.4;}else if(!m.boss){// Oyuncu uzaktayken yaratiklar cakili duruyordu; magara olu gorunuyordu.
    // Doguş yerinin cevresinde yavasca dolasirlar - takip hizinin yarisi.
    m.gezBekle=(m.gezBekle??0)-dt;
    if(m.gezBekle<=0||m.gezX===undefined){const a=Math.random()*Math.PI*2,r=18+Math.random()*44;
     m.gezX=m.homeX+Math.cos(a)*r;m.gezY=m.homeY+Math.sin(a)*r;m.gezBekle=1.6+Math.random()*2.4;}
    const gx=m.gezX-m.x,gy=(m.gezY??m.homeY)-m.y,gd=Math.hypot(gx,gy);
    if(gd>3){m.aci=Math.atan2(gy,gx);const v=(Engine.HIZ[m.kind]??27)*.45*(m.zehir&&m.zehir>0?Engine.ZEHIR_YAVAS:1);this.move(m,gx/gd*v*dt,gy/gd*v*dt,m.id,true);}
    else m.gezBekle=Math.min(m.gezBekle,.4);}
   // Ayrisma. "Yalnizca yaklasani engelle" kurali tek basina yigini cozmuyor:
   // ayni yone giden iki yaratigin mesafesi sabit kaldigi icin hareket serbest
   // kaliyor ve ust uste dogmus olanlar ust uste kaliyor. Kucuk bir itme
   // kuvveti onlari yavasca acar; itme carpisma kontrolsuz uygulanir ki iki
   // yaratik birbirini kilitlemesin.
   for(const o of this.mobs){if(o===m||o.hp<=0)continue;
    const ax=m.x-o.x,ay=m.y-o.y,ad=Math.hypot(ax,ay);
    if(ad>.01&&ad<Engine.CARP_MOB){const it=(Engine.CARP_MOB-ad)*3.8*dt;this.move(m,ax/ad*it,ay/ad*it);}}}
   this.mobs=this.mobs.filter(m=>m.hp>0);
   for(const shot of this.shots){shot.life-=dt;shot.x+=shot.vx*dt;shot.y+=shot.vy*dt;const kavanoz=shot.gecti?.[0]==='*kavanoz';if(!walkable(this.world,shot.x,shot.y,2))shot.life=0;if(kavanoz){if(shot.life<=0)this.kavanozPatla(shot.x,shot.y);continue;}if(shot.isHero){for(const d of this.world.entities.filter(e=>(e.type==='decor'&&!e.asset?.includes('Table'))||(e.type==='chest'&&this.state.opened.includes(e.id)))){if(Math.hypot(shot.x-d.x,shot.y-d.y)<16){shot.life=0;const currentHp=(this.decorHp[d.id]??3)-1;this.decorHp[d.id]=currentHp;if(currentHp<=0){delete this.decorHp[d.id];this.world.entities=this.world.entities.filter(e=>e.id!==d.id);this.burst(d.x,d.y,d.type==='chest'?'#b88a52':'#8b5a2b',16);this.audio.play('hit');this.spawnDrop(d.x,d.y,'wood',1);this.notify(d.type==='chest'?'Boş sandığı kırdın: +1 Odun':'Ahşap eşyayı kırdın: +1 Odun');}else{this.burst(d.x,d.y,d.type==='chest'?'#b88a52':'#8b5a2b',5);this.audio.play('hit');}break;}}for(const m of this.mobs){if(m.hp>0&&Math.hypot(shot.x-m.x,shot.y-m.y)<14){/* Ok TURLERI burada isliyor. Bu blok eskiden sadeydi: ok turu bayraklari
        (yakar/zehir/delici/ceker) atista mermiye yaziliyordu ama isabette hic
        okunmuyordu - yani Ates, Delici ve Cengelli ok sade ok gibi davraniyordu. */if(shot.gecti){if(shot.gecti.includes(m.id))continue;shot.gecti.push(m.id);}else shot.life=0;m.hp-=shot.damage;m.hurt=.17;if(shot.yakar)m.burn=Math.max(m.burn,shot.yakar);if(shot.zehir){m.zehir=Math.max(m.zehir??0,shot.zehir);this.float(m.x,m.y-24,'ZEHİR','#9fd47a');}this.float(m.x,m.y-12,String(shot.damage),'#95e086');this.burst(m.x,m.y,'#c76b5d',6);this.audio.play('hit');const d=Math.hypot(m.x-this.state.x,m.y-this.state.y)||1;/* Cengelli ok geri itmek yerine CEKER: itme yonu tersine cevrilir. */const it=shot.ceker?-22:(m.boss?5:18);this.move(m,(m.x-this.state.x)/d*it,(m.y-this.state.y)/d*it);if(m.id==='rauf'&&m.hp<=m.max*.18){this.raufDizCok();}else if(m.hp<=0)this.kill(m);if(!shot.gecti)break;}}}else if(Math.hypot(shot.x-this.state.x,shot.y-this.state.y)<9){shot.life=0;this.hurt(shot.damage);}}this.shots=this.shots.filter(s=>s.life>0);
   for(const e of this.world.entities){if(e.type==='trap'){const active=this.trapActive(e);const wasActive=this.activeTraps.has(e.id);if(active&&!wasActive){this.activeTraps.add(e.id);const dist=Math.hypot(e.x-this.state.x,e.y-this.state.y);if(dist<100)this.audio.play('trap',1-dist/100);}else if(!active&&wasActive){this.activeTraps.delete(e.id);}if(this.trapCooldown<=0&&active&&Math.hypot(e.x-this.state.x,e.y-this.state.y)<10){this.hurt(15);this.trapCooldown=1;break;}}}
   for(const d of this.drops){d.life-=dt;d.vx*=.84;d.vy*=.84;d.x+=d.vx*dt;d.y+=d.vy*dt;const dist=Math.hypot(this.state.x-d.x,this.state.y-4-d.y);if(dist<65){const speed=160*(1-dist/65)+50;d.x+=(this.state.x-d.x)/dist*speed*dt;d.y+=(this.state.y-4-d.y)/dist*speed*dt;}if(dist<10){d.life=0;if(d.kind==='wood'){addItem(this.state,'wood',d.amount);this.audio.play('coin');this.float(d.x,d.y-8,`+${d.amount} Odun`,'#dca574');}else if(d.kind==='xp'){if(gainXp(this.state,d.amount)){this.audio.play('level');this.notify(`Seviye ${this.state.level}! Yetenek puanını karakter ekranında kullan.`);this.burst(this.state.x,this.state.y,'#e7cb76',25);}else this.audio.play('coin');this.float(d.x,d.y-8,`+${d.amount} XP`,'#b9dca5');}else if(d.kind==='gold'){const r=this.state.equipment.ring;d.amount=Math.round(d.amount*(r?ITEMS[r].altinKat||1:1));this.state.gold+=d.amount;this.audio.play('coin');this.float(d.x,d.y-8,`+${d.amount} Altın`,'#f2d480');}else if(d.kind==='bow'){addItem(this.state,'bow',1);addItem(this.state,'arrow',30);this.audio.play('level');this.notify('Avcı yayı ve 30 ok aldın! Q veya R ile yaya geçebilirsin.');this.float(d.x,d.y-8,'+1 YAY & +30 OK','#f2d480');}this.save();this.emit();}}this.drops=this.drops.filter(d=>d.life>0);
   for(const p of this.particles){p.life-=dt;p.x+=p.vx*dt;p.y+=p.vy*dt;p.vy+=(p.g??40)*dt;}this.particles=this.particles.filter(p=>p.life>0);for(const f of this.parcalar){f.life-=dt;f.x+=f.vx*dt;f.y+=f.vy*dt;f.vy+=260*dt;f.aci+=f.donus*dt;f.vx*=1-.9*dt;
   /* Zemine degince: once kucuk bir sekme, sonra surtunme kemigi yatiriyor.
      Boylece parcalar havada kaybolmuyor, yerde birikip soluyorlar. */
   if(f.y>=f.yer){f.y=f.yer;if(f.vy>36){f.vy*=-.32;f.vx*=.5;f.donus*=.4;}else{f.vy=0;f.vx*=1-8*dt;f.donus*=Math.max(0,1-9*dt);}}}this.parcalar=this.parcalar.filter(f=>f.life>0);for(const f of this.floating){f.life-=dt;f.y-=12*dt;}this.floating=this.floating.filter(f=>f.life>0);
   // Ocaklardan yukari suzulen koz kivilcimlari: negatif yercekimi ile yukselir,
   // solerken sonerler. Kare basina olasilikla saliniyor ki yogunluk sabit kalsin.
   // Ates ortam sesi: her alevden ayri ses CALMAZ. Alevlerin uzakliga gore
   // katkilari toplanir, ama ikinci ve ucuncusu kirpilarak eklenir - yan yana
   // uc ocak sesi uc katina cikarmasin, sadece biraz doldursun.
   const katki:number[]=[];let enYakin=0,enYakinDx=0;
   for(const e of this.world.entities){if(e.type!=='fire')continue;
    const fd=Math.hypot(e.x-this.state.x,e.y-this.state.y);
    // ATES_TAM birimine kadar tam ses, ATES_MENZIL'de sifir; kare egri dogal dusus verir
    const t=Math.min(1,Math.max(0,(Engine.ATES_MENZIL-fd)/(Engine.ATES_MENZIL-Engine.ATES_TAM)));
    if(t>0){katki.push(t*t);if(t*t>enYakin){enYakin=t*t;enYakinDx=e.x-this.state.x;}}
   }
   katki.sort((a,b)=>b-a);
   this.audio.setFire((katki[0]||0)+(katki[1]||0)*.3+(katki[2]||0)*.15,
    enYakin>0?Math.max(-1,Math.min(1,enYakinDx/Engine.ATES_MENZIL))*.6:0);
   for(const e of this.world.entities){if(e.type!=='fire')continue;
    if(Math.random()<dt*7){const c=['#f4be60','#ee a03e','#ce5c1e'][Math.floor(Math.random()*3)].replace(' ','');
     this.particles.push({x:e.x+(Math.random()-.5)*13,y:e.y-12-Math.random()*6,
      vx:(Math.random()-.5)*7,vy:-9-Math.random()*11,life:.7+Math.random()*.9,
      color:c,size:1,g:-14});}}
   /* SARNIC DALGALARI KALDIRILDI (2026-09-13, kullanici istegi). Yaratiklar
      alt kapidan bes dalga halinde geliyordu; dalgalar arasinda mekan bos
      kaliyordu. Artik sarnic bastan kalabalik (world.ts). */
   // Dusus sesi ve rahatsiz olan yarasalar. Ses gec geliyor cunku ucurum
   // derin; oyuncu once sessizligi duyup sonra ne oldugunu anliyor.
   // Iki asama: once dusus sesi, SONRA rahatsiz olan yarasalar. Tek asamada
   // ikisi ayni karede oluyordu ve sira anlasilmiyordu. Oyuncu bu arada
   // bolgeyi terk ettiyse ikisi de iptal.
   if(this.state.zone!=='magara'){this.tuhnSayac=0;this.tuhnYarasa=0;}
   else{
    if(this.tuhnSayac>0){this.tuhnSayac-=dt;
     if(this.tuhnSayac<=0){this.audio.play('hurt');this.audio.play('trap');
      this.notify('Aşağıdan boğuk bir ses geldi.');this.tuhnYarasa=1.1;this.emit();}}
    else if(this.tuhnYarasa>0){this.tuhnYarasa-=dt;
     if(this.tuhnYarasa<=0){this.audio.play('door');
      this.notify('Karanlıktan kanat sesleri yükseliyor.');
      this.yarasaSurusu(24,13,7);this.emit();}}}
   this.iskeletKontrol();
   // --- Tuhn: ikna edilemediyse ucuruma yurur ve atlar ---
   if(this.state.flags.tuhn==='atladi'&&this.state.zone==='magara'){
    const bd=this.world.entities.find(x=>x.id==='tuhn');
    if(bd){
     // Boslugun UZERINDE yurumesin: ucurum karosuna basar basmaz kaybolur.
     const tx=bd.x/16,ty=bd.y/16;
     const bosta=this.world.ucurumlar.some(([x1,y1,x2,y2])=>tx>=x1&&tx<x2&&ty>=y1&&ty<y2);
     const hx=24*16+8-bd.x,hy=15*16+8-bd.y,hu=Math.hypot(hx,hy);
     /* Dusus animasyonu oynuyor (render() characters6SDusus cizer, ileri kayma
        orada). Azaltma KOSULUN ICINDE: sayac bu tikte sifirlanirsa AYNI tikte
        asagidaki silme dalina dusulur. Ayri bir "if(...){azalt}" olsaydi sayac
        sifirlanmis ama entity hala durur, render de o kareyi "dusmuyor" sayip
        Tuhn'u bir kare AYAKTA cizerdi (kullanici: "finale yakin bir an icin
        ayakta gozukuyorlar"). */
     if(this.tuhnDusus>0&&(this.tuhnDusus-=dt)>0){
      // hala havada; cizim render'da
     }else if(!bosta&&hu>4){const v=26*dt;bd.x+=hx/hu*v;bd.y+=hy/hu*v;
      const y=this.sahneYuru.get('tuhn')||{dir:'S' as const,flip:false,yol:0};
      y.dir='S';y.flip=hx<0;y.yol+=v;this.sahneYuru.set('tuhn',y);
     }else if(this.images.characters6SDusus?.naturalWidth&&!this.tuhnDususBitti){
      /* Kenara vardi: hemen silinmek yerine takla animasyonuna baslar
         (oyuncununkiyle ayni sure). Sheet yoksa eski davranis: aninda kaybolur. */
      this.tuhnDusus=Engine.DUSUS;this.tuhnDususBitti=true;
     }else{
      this.tuhnDususBitti=false;
      this.world.entities=this.world.entities.filter(x=>x.id!=='tuhn');
      this.sahneYuru.delete('tuhn');
      // Ses HEMEN degil: ucurum derin. Once sessizlik, sonra asagidan bogur
      // bir ses ve rahatsiz olan yarasalar. Sayac asagida isleniyor.
      this.notify('Tuhn bir adım attı. Karanlık onu aldı.');
      this.tuhnSayac=1.2;
      this.save();this.emit();}
    }
   }
   // --- Son muhafiz: konusma bitip kavga secildiyse NPC dusmana doner ---
   if(this.state.flags.muhafiz==='dovus'&&!this.mobs.some(m=>m.id==='muhafiz')){
    const e=this.world.entities.find(x=>x.id==='muhafiz');
    if(e){this.world.entities=this.world.entities.filter(x=>x.id!=='muhafiz');
     const max=Engine.CAN[10];
     this.mobs.push({id:'muhafiz',kind:10,x:e.x,y:e.y,hp:max,max,cool:.9,windup:0,burn:0,hurt:0,homeX:e.x,homeY:e.y});
     this.notify('Son muhafız kılıcını kaldırdı.');}
   }
   // --- Rauf: dovus / takip / teslim ---
   const rf=this.state.flags.rauf;
   if(rf==='dovus'&&!this.mobs.some(m=>m.id==='rauf')){
    const e=this.world.entities.find(x=>x.id==='rauf');
    if(e){this.world.entities=this.world.entities.filter(x=>x.id!=='rauf');
     const max=72;
     this.mobs.push({id:'rauf',kind:6,x:e.x,y:e.y,hp:max,max,cool:.6,windup:0,burn:0,hurt:0,homeX:e.x,homeY:e.y});
     this.notify('Rauf kılıcını çekti. Onu alt etmen gerekiyor.');}
   }
   if(rf==='dizcokme'){
    let e=this.world.entities.find(x=>x.id==='rauf');
    if(!e){e={id:'rauf',type:'npc',x:this.dizX,y:this.dizY,name:'Rauf',portrait:5};
     this.world.entities.push(e);}
    this.dizSayac-=dt;
    if(this.dizSayac<=0){this.state.flags.rauf='takip';this.save();}
   }
   if(rf==='takip'){
    const kopya=this.world.entities.filter(x=>x.id==='rauf');
    if(kopya.length>1)this.world.entities=this.world.entities.filter(x=>x.id!=='rauf'||x===kopya[0]);
    let e=this.world.entities.find(x=>x.id==='rauf');
    if(!e){e={id:'rauf',type:'npc',x:this.state.x-14,y:this.state.y+6,name:'Rauf',portrait:5};
     this.world.entities.push(e);}
    // --- Yoldas Rauf: once dusman, sonra oyuncu ---
    // "Kacmis olabilirim ama korkak degilim" - yaninda bir dusman varsa
    // oyuncuyu takip etmeyi birakip onunla dovusur. Kendi cani var, olebilir.
    if(this.state.flags.raufCan===undefined)this.state.flags.raufCan=String(Engine.RAUF_CAN);
    let rcan=Number(this.state.flags.raufCan)||0;
    this.raufVur=Math.max(0,this.raufVur-dt);this.raufHasar=Math.max(0,this.raufHasar-dt);
    const yakinlar=this.mobs.filter(m=>m.hp>0&&Math.hypot(m.x-e.x,m.y-e.y)<72);
    yakinlar.sort((a,b)=>Math.hypot(a.x-e.x,a.y-e.y)-Math.hypot(b.x-e.x,b.y-e.y));
    const hedef=yakinlar[0];
    if(hedef){
     const hx=hedef.x-e.x,hy=hedef.y-e.y,hu=Math.hypot(hx,hy)||1;
     if(hu>15){const v=42,ax=hx/hu*v*dt,ay=hy/hu*v*dt;let gitti=0;
      if(walkable(this.world,e.x+ax,e.y,7,'rauf')){e.x+=ax;gitti+=Math.abs(ax);}
      if(walkable(this.world,e.x,e.y+ay,7,'rauf')){e.y+=ay;gitti+=Math.abs(ay);}
      const y=this.sahneYuru.get('rauf')||{dir:'D' as const,flip:false,yol:0};
      if(Math.abs(hx)>Math.abs(hy)){y.dir='S';y.flip=hx<0;}else{y.dir=hy<0?'U':'D';y.flip=false;}
      y.yol+=gitti;this.sahneYuru.set('rauf',y);
     }else{
      this.sahneYuru.delete('rauf');
      if(this.raufVur<=0){this.raufVur=.8;hedef.hp-=16;hedef.hurt=.18;
       this.audio.play('hit');this.float(hedef.x,hedef.y-12,'−16','#e2c98b');
       if(hedef.hp<=0&&hedef.id!=='rauf')this.kill(hedef);}
     }
     // dusmanlar da ona vuruyor
     if(this.raufHasar<=0&&yakinlar.some(m=>Math.hypot(m.x-e.x,m.y-e.y)<16)){
      this.raufHasar=1.1;
      const gelen=yakinlar.filter(m=>Math.hypot(m.x-e.x,m.y-e.y)<16)
       .reduce((t,m)=>t+6+m.kind*2,0);
      rcan=Math.max(0,rcan-gelen);this.state.flags.raufCan=String(Math.round(rcan));
      this.float(e.x,e.y-16,'−'+gelen,'#ff8b89');this.audio.play('hurt');
      if(rcan<=0){
       this.world.entities=this.world.entities.filter(x=>x.id!=='rauf');
       this.sahneYuru.delete('rauf');
       this.state.flags.rauf='oldu';
       this.state.journal.unshift('Rauf yolda düştü. Seni korurken öldü.');
       this.notify('Rauf öldü.');this.save();this.emit();}
     }
    }else{
    // oyuncunun birkac adim gerisinde yurur
    const dx=this.state.x-e.x,dy=this.state.y-e.y,uz=Math.hypot(dx,dy);
    if(uz>26){const v=Math.min(46,uz*1.4);const ax=dx/uz*v*dt,ay=dy/uz*v*dt;
     let gitti=0;
     if(walkable(this.world,e.x+ax,e.y,7,'rauf')){e.x+=ax;gitti+=Math.abs(ax);}
     if(walkable(this.world,e.x,e.y+ay,7,'rauf')){e.y+=ay;gitti+=Math.abs(ay);}
     // yurume animasyonu icin hareket kaydi (yoksa durus karesiyle kayiyor)
     const y=this.sahneYuru.get('rauf')||{dir:'D' as const,flip:false,yol:0};
     if(Math.abs(dx)>Math.abs(dy)){y.dir='S';y.flip=dx<0;}else{y.dir=dy<0?'U':'D';y.flip=false;}
     y.yol+=gitti;this.sahneYuru.set('rauf',y);
    }else this.sahneYuru.delete('rauf');
    }
    // Alf'e yaklasinca teslim
    const alf=this.world.entities.find(x=>x.id==='boran');
    if(alf&&Math.hypot(alf.x-this.state.x,alf.y-this.state.y)<40){
     this.state.flags.rauf='teslim';
     // Kader burada muhurleniyor; defter de teslimle geliyor.
     this.state.flags.fugitive='reported';this.state.flags.ledgerStarted=true;
     if(!this.state.inventory.ledger)addItem(this.state,'ledger');
     this.state.flags.teslimSahne='gidiyor';
     this.state.gold+=140;
     this.state.journal.unshift('Rauf’u Alf’e teslim ettin. Alf hiçbir şey söylemeden 140 altın verdi ve onu alıp gitti.');
     this.notify('Alf, Rauf’u aldı. +140 altın.');this.save();this.emit();}
   }
   // --- Teslim sahnesi: Alf, Rauf'u alip kuzey koridorundan cikar, sonra doner ---
   const sah=this.state.flags.teslimSahne;
   if(sah&&this.state.zone==='haven'){
    // "Sen burada kal." Oyuncu pesinden kuzey koridoruna giremez; infazi
    // gormez. Kapali kapinin ardinda olmasi olayin agirligini artiriyor.
    if(this.state.y<7*16&&this.state.x>11*16&&this.state.x<19*16){
     this.state.y=7*16;
     if(this.sahneUyari<=0){this.sahneUyari=3;
      this.notify('Alf dönüp baktı: “Sen burada kal. Bu benimle onun arasında.”');}
    }
    this.sahneUyari=Math.max(0,this.sahneUyari-dt);
    const CIKIS={x:14.5*16,y:2*16};
    const alf=this.world.entities.find(x=>x.id==='boran');
    const rau=this.world.entities.find(x=>x.id==='rauf');
    const yurut=(e:Entity,hx:number,hy:number,v=34)=>{
     const dx=hx-e.x,dy=hy-e.y,u=Math.hypot(dx,dy);
     if(u<2){this.sahneYuru.delete(e.id);return true;}
     const adim=Math.min(v,u*3)*dt;
     e.x+=dx/u*adim;e.y+=dy/u*adim;
     const y=this.sahneYuru.get(e.id)||{dir:'D' as const,flip:false,yol:0};
     if(Math.abs(dx)>Math.abs(dy)){y.dir='S';y.flip=dx<0;}else{y.dir=dy<0?'U':'D';y.flip=false;}
     y.yol+=adim;this.sahneYuru.set(e.id,y);
     return false;};
    if(sah==='gidiyor'){
     const a=alf?yurut(alf,CIKIS.x,CIKIS.y):true;
     const r=rau?yurut(rau,CIKIS.x+10,CIKIS.y+12):true;
     if(a&&r){this.world.entities=this.world.entities.filter(x=>x.id!=='rauf'&&x.id!=='boran');
      this.state.flags.teslimSahne='bekliyor';this.sahneSayac=3.2;}
    }else if(sah==='bekliyor'){
     this.sahneSayac-=dt;
     if(this.sahneSayac<=0){
      this.world.entities.push({id:'boran',type:'npc',x:CIKIS.x,y:CIKIS.y,name:'Alf',portrait:2});
      this.state.flags.teslimSahne='donuyor';}
    }else if(sah==='donuyor'){
     const a=this.world.entities.find(x=>x.id==='boran');
     if(!a){this.state.flags.teslimSahne='';}
     else if(yurut(a,17.5*16,12.5*16)){this.state.flags.teslimSahne='';this.sahneYuru.clear();this.gez.delete('boran');this.save();}
    }
   }
   // --- NPC dolasmasi: yuru -> bekle -> yeni hedef ---
   for(const e of this.world.entities){
    if(e.type!=='npc')continue;
    // Tuhn ucurumun kenarinda sabit durur; dolasma sistemi onu icine sokabilirdi.
    if(e.id==='tuhn')continue;
    // Takip eden Rauf'u dolasma sistemi kendi evine cekmesin
    if(e.id==='rauf'&&this.state.flags.rauf==='takip'){this.gez.delete('rauf');continue;}
    // Teslim sahnesi oynarken Alf ve Rauf'u dolasma sistemi cekmesin
    if(this.state.flags.teslimSahne&&(e.id==='boran'||e.id==='rauf')){this.gez.delete(e.id);continue;}
    // Obruk kilerinin ustunden kalkmaz, adamlari da nobetlerinden ayrilmaz.
    if(e.sabit)continue;
    let g=this.gez.get(e.id);
    if(!g){g={hx:e.x,hy:e.y,tx:e.x,ty:e.y,bekle:1+Math.random()*3,dir:'D',flip:false,yol:0};this.gez.set(e.id,g);}
    if(g.bekle>0){g.bekle-=dt;continue;}
    const dx=g.tx-e.x,dy=g.ty-e.y,uz=Math.hypot(dx,dy);
    if(uz<1.5){
     /* Uslu kapiya varmis: gercekten "disari cikmis" gibi bu bolgeden
        silinir, flags.usluYer cevrilir - bir dahaki zone yuklemesinde
        (makeWorld) artik OBUR bolgede belirir. Oyuncu o an bu bolgedeyse
        onu kapidan yururken GORDU; isinlanma yok. */
     if(e.id==='uslu'&&g.giden){
      this.state.flags.usluYer=this.state.flags.usluYer==='magara'?'siginak':'magara';
      const idx=this.world.entities.indexOf(e);if(idx>=0)this.world.entities.splice(idx,1);
      this.gez.delete('uslu');this.save();continue;
     }
     g.bekle=1.6+Math.random()*3.4;
     // Uslu'ya, sabit rastgele dolasma ustune, kucuk bir ihtimalle "kapiya
     // git" secenegi de var - boylece bazen bu bolgede, bazen obur bolgede
     // rastlanir ama HER ZAMAN yururken gorulerek gecer.
     const kapi=e.id==='uslu'?Engine.USLU_KAPI[this.state.zone]:undefined;
     if(kapi&&Math.random()<.15){
      g.giden=true;g.tx=kapi.x;g.ty=kapi.y;continue;
     }
     const a=Math.random()*Math.PI*2,r=10+Math.random()*22;
     const nx=g.hx+Math.cos(a)*r,ny=g.hy+Math.sin(a)*r;
     // Ates artik herkesi yaktigi icin NPC'ler alevin icini hedef secmiyor.
     // Canlari olmadigi icin yanarak olemezler; dogru davranis kacinmak.
     if(walkable(this.world,nx,ny,6,e.id)&&!this.atesteMi(nx,ny)){g.tx=nx;g.ty=ny;}
     continue;
    }
    const hiz=11,sx=dx/uz*hiz*dt,sy=dy/uz*hiz*dt;g.yol+=hiz*dt;
    // Birine carpinca kisa bir duraklayip yeni hedef seciyor: oldugu yerde
    // itismek yerine gozle gorulur sekilde yolunu degistirmis oluyor.
    const bos=(nx:number,ny:number)=>walkable(this.world,nx,ny,6,e.id)
     &&!this.carpisir(e.x,e.y,nx,ny,e.id);
    if(bos(e.x+sx,e.y))e.x+=sx; else {g.tx=e.x;g.bekle=Math.max(g.bekle,.3+Math.random()*.5);}
    if(bos(e.x,e.y+sy))e.y+=sy; else {g.ty=e.y;g.bekle=Math.max(g.bekle,.3+Math.random()*.5);}
    if(Math.abs(dx)>Math.abs(dy)){g.dir='S';g.flip=dx<0;}else{g.dir=dy<0?'U':'D';g.flip=false;}
   }
   if(this.tick-this.savedAt>8)this.save();if(this.tick-this.notifyAt>.1){this.emit();this.notifyAt=this.tick;}
  }
  private trapActive(e:Entity){return (this.tick+e.x*.01)%3.3>2.1}
  /** Gamepad taramasi. Her karede cagrilir; oyun DURAKLIYKEN de calisir ki
   *  menu/diyalog gamepad ile gezilebilsin (o durumda yalnizca haber verir,
   *  hareketi arayuz yonetir). */
  private gamepadTara(){
   const pads=typeof navigator!=='undefined'&&navigator.getGamepads?navigator.getGamepads():[];
   let gp=null as Gamepad|null;
   for(const p of pads)if(p&&p.connected){gp=p;break;}
   if(!gp){if(this.gpBasili.size)this.gpBasili.clear();return;}
   const eksen=(i:number)=>{const v=gp!.axes[i]??0;return Math.abs(v)<Engine.GP_OLU?0:v;};
   const basili=(i:number)=>!!gp!.buttons[i]?.pressed;
   const yeni=(i:number)=>{const b=basili(i);const vardi=this.gpBasili.has(i);
    if(b)this.gpBasili.add(i);else this.gpBasili.delete(i);return b&&!vardi;};
   /* Sol cubuk VE D-pad ayni yere yaziliyor; oyuncu hangisini kullanirsa. */
   const dx=eksen(0)+(basili(15)?1:0)-(basili(14)?1:0);
   const dy=eksen(1)+(basili(13)?1:0)-(basili(12)?1:0);
   const n=Math.hypot(dx,dy);
   const hareket=n>.1;
   if(this.paused){
    /* Duraklamisken yalnizca haber ver: menuyu React geziyor. */
    if(hareket||[0,1,2,3,9].some(i=>basili(i))){
     const tus=yeni(0)?'onay':yeni(1)?'geri':yeni(9)?'menu':
      (yeni(12)||eksen(1)<-.6&&!this.gpBasili.has(100)?'yukari':(yeni(13)||eksen(1)>.6&&!this.gpBasili.has(100))?'asagi':undefined);
     if(eksen(1)>.6||eksen(1)<-.6)this.gpBasili.add(100);else this.gpBasili.delete(100);
     this.onGamepad?.('menu',tus);
    }
    return;
   }
   if(hareket){this.input.x=dx/Math.max(1,n);this.input.y=dy/Math.max(1,n);this.onGamepad?.('oyun');}
   else if(this.gpKullandi){this.input.x=0;this.input.y=0;}
   /* RT ya da A: saldiri (basili tutulabilir). BIRAKILINCA da temizlenmeli:
      yalnizca basiliyken true yapilinca tus birakildiktan sonra oyuncu
      durmadan savurmaya devam ediyordu. */
   const saldir=basili(0)||basili(7);
   if(saldir){this.input.attack=true;this.gpSaldiri=true;this.onGamepad?.('oyun');}
   else if(this.gpSaldiri){this.input.attack=false;this.gpSaldiri=false;}
   if(yeni(1)){this.dodge();this.onGamepad?.('oyun');}          // B: kacin
   if(yeni(2)){this.interact();this.onGamepad?.('oyun');}       // X: etkilesim
   if(yeni(3)){this.toggleTorch();this.onGamepad?.('oyun');}    // Y: mesale
   if(yeni(4)){this.useItem('potion');this.onGamepad?.('oyun');}// LB: iksir
   if(yeni(5)){this.toggleWeapon();this.onGamepad?.('oyun');}   // RB: silah
   if(yeni(9))this.onGamepad?.('menu','menu');                  // Start: duraklat
   this.gpKullandi=hareket;
  }
  /** Son karede gamepad ile hareket edildi mi (birakilinca sifirlamak icin). */
  private gpKullandi=false;
  /** Saldiri tusunu gamepad mi basili tutuyordu. */
  private gpSaldiri=false;

  private loop(time:number){const dt=Math.min(.035,(time-this.last)/1000||0);this.last=time;if(this.ready)this.gamepadTara();if(!this.paused&&this.ready)this.update(dt);this.render(time/1000);this.raf=requestAnimationFrame(this.loop)}
  private sprite(key:string,x:number,y:number,frame=0,fw?:number,fh?:number,flip=false,scale=1,alpha=1,donder=0,capa?:number){const im=this.images[key];if(!im?.naturalWidth)return;const w=fw||im.width/R,h=fh||im.height/R;const count=Math.floor(im.width/(w*R));const c=this.ctx;c.save();c.globalAlpha=alpha;const actor=key.startsWith('characters')||key.startsWith('enemies');/* Aktorler (oyuncu/mob) HAREKET ederken tam sayiya yuvarlama olmadan
   piksel titremesi/bulanikligi oluyordu, o yuzden onlar icin kaldi. Decor
   ise SABIT duruyor - yuvarlama onda sadece boyali arka plandaki bir ozellikle
   (ustune tam oturmasi gereken nesneler icin, bkz. harita-editor.html
   Nesneler modu) piksel-hassas hizalanmayi engelliyordu ("milimetrik kayma"
   sikayeti buradan geliyordu). Decor'da artik YUVARLAMA YOK. */c.translate(actor?Math.round(x):x,actor?Math.round(y):y);/* Capa hucre icinde zemin cizgisinin satirini belirliyor (satir = 2*capa).
   Dusmanlarda 21 idi, yani sprite en fazla 42 satir yuksek olabiliyordu;
   62 satirlik trolun ust yarisi kirpiliyordu. Buyuk dusmanlar kendi
   capasini geciyor. *//* Oyuncu setleri (characters1, 1sword, 1mesale...; characters10+ DEGIL) 80 satirlik hucrede. */const oyuncuSet=/^characters1(?!\d)/.test(key);const anchor=capa??(actor?(oyuncuSet?Engine.OYUNCU_CAPA:key.startsWith('characters')?31:key.startsWith('enemies1')?22:21):h);/* Tepeden gorulen yaratiklar icin: yon ayri sheet degil DONDURME. Capa
   ayakta oldugu icin cizim dikdortgeninin MERKEZI etrafinda dondurulur,
   yoksa yaratik ayaklarinin ucundan savruluyor. Decor'un top'u (asagida)
   actor'dan farkli olarak +6 icerir - bu yuzden decor'un GERCEK dikey
   merkezi de +6 kaymis, rotate pivotu (my) da ayni kaymayi almazsa
   harita-editor.html'deki donus onizlemesiyle (gercek merkez etrafinda
   donduruyor) uyusmaz, dondurulen nesne editorde gorunenden kayik cikar. */if(donder){const my=(-anchor+h/2)*scale+(actor?0:6);c.translate(0,my);c.rotate(donder);c.translate(0,-my);}if(flip)c.scale(-1,1);const top=actor?-anchor*scale:-h*scale+6;c.drawImage(im,(frame%count)*w*R,0,w*R,h*R,-w*scale/2,top,w*scale,h*scale);c.restore()}
  /** Oyuncunun golgesini cizer, ENGELE denk gelen kismini SILER - boyali
   *  mobilyanin uzerine golgenin bindirilmesi (ayri bir nesne olarak
   *  eklenmedigi icin) saçma duruyordu. Ana tuvale DOGRUDAN destination-out
   *  ile cizilmiyor cunku o zaman arka plan/diger her sey de delinirdi -
   *  golge once izole bir tamponda cizilip delinir, sonra tek parca olarak
   *  yapistirilir. */
  private golgeCiz(x:number,y:number){
   const GW=40,GH=16,ox=x-GW/2,oy=y+1-GH/2;
   if(!this.golgeBuf){this.golgeBuf=document.createElement('canvas');this.golgeBuf.width=GW;this.golgeBuf.height=GH;}
   const g=this.golgeBuf.getContext('2d')!;
   g.clearRect(0,0,GW,GH);
   g.fillStyle='#02081280';
   g.beginPath();g.ellipse(GW/2,GH/2,8.5*OYUNCU_OLCEK,2.8*OYUNCU_OLCEK,0,0,7);g.fill();
   g.globalCompositeOperation='destination-out';
   for(const b of this.world.blockers){g.save();g.translate(-ox,-oy);blockerYolu(g,b);g.restore();}
   g.globalCompositeOperation='source-over';
   this.ctx.drawImage(this.golgeBuf,ox,oy);
  }
  /** Isim etiketi: kutu YOK (yuzleri kapatiyordu). Okunurluk icin metin once
  *  koyu renkte 1px kaydirilarak dort yone cizilir, uzerine asil renk gelir. */
  private label(text:string,x:number,y:number,color='#ffffff'){const c=this.ctx;
  c.font="bold 5.6px 'Pixelify Sans',monospace";c.textAlign='center';
  c.fillStyle='#140d07';for(const[dx,dy]of[[-1,0],[1,0],[0,-1],[0,1]])c.fillText(text,x+dx,y+dy);
  c.fillStyle=color;c.fillText(text,x,y);
  return c.measureText(text).width;}
  private render(time:number){const c=this.ctx;const canvas=this.canvas;const cw=canvas.clientWidth||1280,ch=canvas.clientHeight||720,oran=cw/ch;let en=320,boy=180;if(oran>16/9)en=Math.min(560,Math.round(180*oran));else boy=Math.min(340,Math.round(320/oran));this.gorus={en,boy};const bw=en*4,bh=boy*4;if(canvas.width!==bw||canvas.height!==bh){canvas.width=bw;canvas.height=bh;}c.setTransform(4,0,0,4,0,0);c.imageSmoothingEnabled=false;c.fillStyle='#0a111b';c.fillRect(0,0,en,boy);const targetX=this.state.x-en/2,targetY=this.state.y-boy/2;this.camera.x+=(targetX-this.camera.x)*.12;this.camera.y+=(targetY-this.camera.y)*.12;const cx=Math.round(this.camera.x),cy=Math.round(this.camera.y);c.translate(-cx,-cy);
  const bg=this.images['bg_'+this.state.zone];
  // Tek parca arka plan: karo tekrarini ve desen olcegi sorununu ortadan kaldirir.
  // Gorsel carpisma haritasiyla maskelenerek uretilir (bkz. scripts/arkaplan_maske.py),
  // bu yuzden gorunen duvar ile geciilmez alan birebir ortusur.
  if(bg?.naturalWidth){c.drawImage(bg,0,0,bg.width,bg.height,0,0,this.world.w*16,this.world.h*16);}else{this.wangYukle();
  const isFloor=(tx:number,ty:number)=>ty>=0&&ty<this.world.h&&tx>=0&&tx<this.world.w&&this.world.tiles[ty][tx]===1;const y0=Math.floor(cy/16)-1,y1=Math.ceil((cy+this.gorus.boy)/16)+2,x0=Math.floor(cx/16)-1,x1=Math.ceil((cx+this.gorus.en)/16)+2;
  // Dual-grid autotile: her cizilen karo dort dunya hucresinin kesistigi koseye ortalanir;
  // wang_N'de N = kose duvar maskesi (NW=8, NE=4, SW=2, SE=1), wang_0 tam zemin, wang_15 tam duvar.
  for(let y=y0;y<y1;y++)for(let x=x0;x<x1;x++){const m=(isFloor(x-1,y-1)?0:8)|(isFloor(x,y-1)?0:4)|(isFloor(x-1,y)?0:2)|(isFloor(x,y)?0:1);// Yikik Ev'in kendi karo seti yok; sarnicin tas setini oduncu aliyor, yoksa oda bombos cizilirdi.
   const kz=this.state.zone==='yikik'?'cistern':this.state.zone;const tile=this.images[`wang_${kz}_${m}`];if(tile?.naturalWidth)c.drawImage(tile,x*16-8,y*16-8,16,16);}
  // Bolge tonu zeminde; zemine komsu olmayan duvarlar uzaklik hissi icin karartilir (doku gorunsun diye %50).
  for(let y=y0;y<y1;y++)for(let x=x0;x<x1;x++){if(isFloor(x,y)){c.fillStyle='#10213310';c.fillRect(x*16,y*16,16,16);}else if(![[0,1],[0,-1],[-1,0],[1,0],[1,1],[-1,-1],[1,-1],[-1,1]].some(([dx,dy])=>isFloor(x+dx,y+dy))){c.fillStyle='#060a1280';c.fillRect(x*16,y*16,16,16);}}}
  for(const e of this.world.entities){if(e.type==='ceset'){this.sprite(e.asset||'ceset',e.x,e.y,0,32,32,false,OYUNCU_OLCEK*1.18);this.label(e.name||'',e.x,e.y-20,'#9d9384');continue;}if(e.type==='portal'){const gizli=e.asset==='gizli';/* Kapak sprite'i yalnizca boyali arka plani OLMAYAN mekanlarda: boyali
     mekanlarda kapi zaten sahnenin parcasi, ustune kapak koymak eski
     zindan setinin izini birakiyordu. Isik halesi ve etiket kaliyor. */if(gizli){this.label(e.name!,e.x,e.y+13,'#c9bda4');continue;}const glow=c.createRadialGradient(e.x,e.y,1,e.x,e.y,22);glow.addColorStop(0,'#74c8ef30');glow.addColorStop(1,'#74c8ef00');c.fillStyle=glow;c.fillRect(e.x-22,e.y-22,44,44);this.label(e.name!,e.x,e.y+13,'#b6dbe9');}if(e.type==='trap')this.sprite('trap',e.x,e.y,this.trapActive(e)?4:0,17,17);}
  const actors:({y:number;layer:number;draw:()=>void})[]=this.world.entities.filter(e=>e.type!=='portal'&&e.type!=='trap').map(e=>({y:e.y,layer:e.layer??0,draw:()=>{
   if(e.type==='decor'){/* Boyali mekanda mobilya ZATEN sahnenin icinde cizili; ustune eski zindan
      setinden bir masa/dolap koymak yabanci duruyordu. Varlik yalnizca
      etkilesim noktasi olarak kaliyor, etiketi duruyor. TEK ISTISNA: e.overlay
      isaretli decor'lar (harita-editor.html'in "Nesneler" modunda eklenen
      tekil PNG'ler) - onlar boyali sahnenin USTUNE, actors[] y-sirasina gore
      ciziliyor, ör. yeni bir sandik/mobilya gorseli sahneye sonradan eklenmis
      gibi. */if(e.overlay||!bg?.naturalWidth)this.sprite(e.asset!,e.x,e.y,0,undefined,undefined,false,e.s??1,1,e.aci??0);if(e.name)this.label(e.name,e.x,e.y-20,'#dfc28e');return;}
   if(e.type==='fire'){this.sprite('fire',e.x,e.y,Math.floor(time*8)%8,32,32,false,e.s??1);return;}
   if(e.type==='chest'){const opened=this.state.opened.includes(e.id);this.sprite('chest',e.x,e.y,opened?1:0,24,24,false,1,1);if(!opened){c.fillStyle='#e8c883';c.fillRect(e.x-1,e.y-20+Math.sin(time*3),2,2);}return;}
   if(e.type==='lever'){this.sprite('lever',e.x,e.y,this.state.flags.gateOpen?3:0,16,18);return;}
   
   if(e.type==='npc'){const OL=OYUNCU_OLCEK*(e.s||1);
    if(e.id==='tuhn'&&this.tuhnDusus>0){/* Tuhn'un ucurumdan takla atarak dususu: oyuncununkiyle ayni
       mantik (kare = ilerleme, doguya ileri kayma, son ceyrekte solma). Tek yon
       uretildi (dogu) cunku sahnede hep doguya, (24,15)'e yuruyor. Golge yok. */
     const p=1-this.tuhnDusus/Engine.DUSUS,dim=this.images.characters6SDusus;
     const n=Math.max(1,Math.floor(dim.naturalWidth/64)),kare=Math.min(n-1,Math.floor(p*n));
     const alpha=p<.75?1:Math.max(0,1-(p-.75)/.25);
     this.sprite('characters6SDusus',e.x+p*p*22,e.y+p*6,kare,32,32,false,OL,alpha,0,e.capa);return;}
    c.fillStyle='#03091366';c.beginPath();c.ellipse(e.x,e.y+1,8*OL,2.6*OL,0,0,7);c.fill();if(e.id==='rauf'&&this.state.flags.rauf==='dizcokme'&&this.images.rauf_kneel?.naturalWidth){
     // diz cokme: son karede durur, ayaga kalkmaz
     const ilerleme=Math.min(3,Math.floor((2.6-this.dizSayac)*2));
     this.sprite('rauf_kneel',e.x,e.y,ilerleme,32,32,false,OYUNCU_OLCEK);
     const nw0=this.label(e.name||'',e.x,e.y-30);void nw0;return;}
    /* Kral oturuyor: yurumez, arada bir taci cikarip geri takar. */
    if(e.id==='kral'){const F=Engine.KRAL_FPS;
     /* Dongu: once tac (26 sn'de bir), sonra sirayla bas sallama / el hareketi,
        aralarda HAREKETSIZ. Once bekleme sheet'e kare cogaltarak konuyordu ama
        oturan figurde tekrar goze batiyor, sure kodda ayarlanabilir olmali. */
     const nTac=this.kareSay('characters13DTac'),nIdle=this.kareSay('characters13DIdle'),nEl=this.kareSay('characters13DEl');
     const t=time%Engine.KRAL_DONGU,tacSure=nTac/F;
     let sayfa='characters13DIdle',kare=0;
     if(nTac&&t<tacSure){sayfa='characters13DTac';kare=Math.floor(t*F);}
     else{const u=t-tacSure,d=Math.floor(u/Engine.KRAL_SALLA),i=u%Engine.KRAL_SALLA;
      /* Tek turlarda el, cift turlarda bas. */
      const el=nEl>0&&d%2===1;sayfa=el?'characters13DEl':'characters13DIdle';
      const n=el?nEl:nIdle;kare=i*F<n?Math.floor(i*F):0;}
     /* Kral 128'lik hucrede: fw/fh 64 verilir, boylece sanat pikseli digerleriyle
        AYNI yogunlukta cizilir (64*olcek/128 = 32*olcek/64) ama figur iki kat buyuk. */
     this.sprite(sayfa,e.x,e.y,kare,64,64,false,OL,1,0,e.capa);
     /* Etiket 128'lik hucreye gore: 64'luk yukseklik (-30) figurun gogsunde kaliyordu. */const nwK=this.label(e.name||'',e.x,e.y-58*(e.s||1));void nwK;return;}
    const sy=this.sahneYuru.get(e.id);const g=this.gez.get(e.id);const yur=!!sy||(!!g&&g.bekle<=0&&Math.hypot(g.tx-e.x,g.ty-e.y)>1.5);const yd=sy?sy.dir:g?.dir??'D';const yf=sy?sy.flip:g?.flip??false;const yy=sy?sy.yol:(g?.yol||0);this.sprite(`characters${e.portrait}${yur?yd:'D'}${yur?'Walk':'Idle'}`,e.x,e.y,yur?Math.floor(yy/Engine.ADIM):Math.floor(time*5),32,32,yur&&yd==='S'&&yf,OL,1,0,e.capa);const pending=bekleyen(this.state,e.id);/* Unlem isimle AYNI yukseklikte olmali: isim olcekle (e.s) yukseliyordu,
   unlem sabit -30'daydi, kucuk karakterlerde (Lin s=0.8) kayik duruyordu. */const etiketY=e.y-30*(e.s||1);const nw=this.label(e.name||'',e.x,etiketY);if(pending)this.label('!',e.x-nw/2-5,etiketY,'#e0453a');}
  }}));
  for(const m of this.mobs)actors.push({y:m.y,layer:0,draw:()=>{if(m.cikis&&m.cikis>0){/* Yerden cikis: sprite asagi itilir ve AYAK CIZGISININ ALTI kirpilir,    yani figur topraktan yukseliyormus gibi acilir. p 0->1 ilerler. */const p=1-m.cikis/Engine.ISKELET_CIKIS,ol=(Engine.DUSMAN_OLCEK[m.kind]??1)*OYUNCU_OLCEK;const boy=32*ol,gizli=(1-p)*boy;c.save();c.beginPath();c.rect(m.x-boy,m.y-boy*2,boy*2,boy*2);c.clip();c.fillStyle='#04091255';c.beginPath();c.ellipse(m.x,m.y+1,7*OYUNCU_OLCEK*p,2.4*OYUNCU_OLCEK*p,0,0,7);c.fill();this.sprite(this.dusmanPoz(m.kind,'D','Walk'),m.x,m.y+gizli,0,32,32,false,ol);c.restore();
    /* Kirpmadan SONRA, yani figurun ONUNE cizilen toprak katmani: bacaklarin
       ust ucunu ortuyor ki iskelet "yerin altindan" degil "yarilan topraktan"
       cikiyor gibi dursun. Tumsek once kabarir (k: 0->1->0), sonra coker. */
    const k=Math.sin(Math.PI*Math.min(1,p*1.04));
    c.fillStyle=Engine.TOPRAK[0];c.beginPath();c.ellipse(m.x,m.y+1,(6.5+5.5*k)*ol,(2.1+2.1*k)*ol,0,0,7);c.fill();
    c.fillStyle=Engine.TOPRAK[1];c.beginPath();c.ellipse(m.x,m.y-.4-1.6*k*ol,(4.6+4*k)*ol,(1.5+1.4*k)*ol,0,0,7);c.fill();
    /* Tumsegin uzerinde donen kesekler: p ilerledikce aci kayiyor, toprak
       kimildiyormus gibi oluyor (ek gorsel istemeden). */
    c.fillStyle=Engine.TOPRAK[2];
    for(let i=0;i<6;i++){const a=i*1.047+p*4.2,rr=(4.2+4.4*k)*ol;
     c.fillRect(m.x+Math.cos(a)*rr-1,m.y-1.2-Math.abs(Math.sin(a))*rr*.34-k*1.8*ol,2,2);}
    return;}if(m.kind===9){/* Fenerin isigi: ovadaki tek sicak renk. */const g=c.createRadialGradient(m.x,m.y-14,2,m.x,m.y-14,42);g.addColorStop(0,'#ffb35a70');g.addColorStop(1,'#ffb35a00');c.fillStyle=g;c.fillRect(m.x-42,m.y-56,84,84);}c.fillStyle='#04091270';c.beginPath();c.ellipse(m.x,m.y+1,(m.boss?13:Engine.GOLGE[m.kind]??8)*OYUNCU_OLCEK,2.6*OYUNCU_OLCEK,0,0,7);c.fill();if(m.windup>0){c.strokeStyle='#ef8766';c.lineWidth=1;c.beginPath();c.arc(m.x,m.y,m.boss?36:14,0,Math.PI*2);c.stroke();}const dx=this.state.x-m.x,dy=this.state.y-m.y;const eylem=m.windup>0?'Attack':m.hurt>0?'Hurt':'Walk';const ol=(m.boss?1.7:Engine.DUSMAN_OLCEK[m.kind]??1)*OYUNCU_OLCEK;const yar=Engine.YARATIK[m.kind];if(yar){/* Yaratiklarda yon ayri sheet degil; nasil gosterildigi YARATIK'ta yazili. */const bak=m.aci??Math.atan2(dy,dx);const anahtar=`enemies${m.kind}D${eylem}`;const kare=this.dusmanKare(m,eylem,time);if(yar.mod==='tam'){this.sprite(anahtar,m.x,m.y,kare,32,32,false,ol,1,bak-(yar.aci||0));}else if(yar.mod==='yan'){const sol=Math.cos(bak)<0;const egim=Math.max(-Engine.EGIM,Math.min(Engine.EGIM,Math.atan2(Math.sin(bak),Math.abs(Math.cos(bak)))));/* Aynalama dondurmeden SONRA uygulandigi icin egimin isareti ters cevrilir. */this.sprite(anahtar,m.x,m.y,kare,32,32,sol,ol,1,sol?-egim:egim);}else{this.sprite(anahtar,m.x,m.y,kare,Engine.DUSMAN_EN[m.kind]??32,32,yar.mod==='aynali'&&Math.cos(bak)<0,ol,1,0,Engine.DUSMAN_CAPA[m.kind]);}}else{const yatay=Math.abs(dx),dikey=Math.abs(dy);const dir=dikey>yatay*2.414?(dy<0?'U':'D'):yatay>dikey*2.414?'S':(dy<0?'US':'DS');this.sprite(this.dusmanPoz(m.kind,dir,eylem),m.x,m.y,this.dusmanKare(m,eylem,time),32,32,dir!=='U'&&dir!=='D'&&dx<0,ol);}const yuzuk=this.state.equipment.ring;if(m.kind!==9&&(m.hp<m.max||m.boss||(yuzuk&&ITEMS[yuzuk].canGoster))){const w=m.boss?34:16;c.fillStyle='#190e18';c.fillRect(m.x-w/2,m.y-(m.boss?38:23),w,2);c.fillStyle='#ce7778';c.fillRect(m.x-w/2,m.y-(m.boss?38:23),w*m.hp/m.max,2);if(m.boss)this.label('KÜL BEKÇİSİ',m.x,m.y-43,'#efac8a');if(m.kind===10)this.label('SON MUHAFIZ',m.x,m.y-40,'#c9b7d6');}}});
   actors.push({y:this.state.y,layer:0,draw:()=>{const s=this.state;const action=this.vurusPoz>0?'Attack':this.moving&&!this.paused?'Walk':'Idle';
  const dusuyor=this.dusus>0||this.dustu;
  if(!dusuyor)this.golgeCiz(s.x,s.y);/* Boslukta golge yok - basacak zemin kalmadi. */
  /* Izler oyuncunun ALTINA cizilir ve solar; en eskisi en sonuk. */
  for(const iz of this.izler)this.sprite(iz.anahtar,iz.x,iz.y,iz.kare,Engine.OYUNCU_EN,Engine.OYUNCU_BOY,iz.flip,OYUNCU_OLCEK,Math.min(.42,iz.life*1.6));
  if(dusuyor){
   /* Dusus animasyonu: p 0'dan (ayagin bosluga bastigi an) 1'e (kayboldugu
      an, dusmeBitti cagrilmadan hemen once) gider. Karakter son baktigi
      yone dogru ivmelenerek kayar (dusmeden hemen once atilmis gibi),
      DIKEYDE yassilasarak yere paralel yatiyormus gibi doner (kullanici
      isteği: "biraz ileri gitmeli, rotate olarak yere paralele
      yaklaşmalı") ve SOLARAK bosluga iniyormus gibi cizilir. Yassilasma,
      sprite() KENDI translate'ini yapmadan ONCE ayni anchor (px,py)
      etrafinda bir "translate-scale-translate" ile uygulanir - net etki:
      X degismez, Y bu noktaya gore squash kadar kucultulur (bkz. matris
      hesap notu: T(a)*S*T(-a)*T(a) = T(a)*S). */
   /* dustu ise sayac zaten sifir; p=1 demek "artik ekranda yok" - asagida
      cizim tamamen atlanir, karakter olum paneli acilirken ayakta belirmez. */
   const p=this.dustu?1:1-this.dusus/Engine.DUSUS;
   if(p>=1)return;
   const v=this.yonVektor(),ileri=p*p*22;
   const px=s.x+v.x*ileri,py=s.y+v.y*ileri;
   /* Gercek takla animasyonu varsa (PixelLab v3, characters/1/<D|U|S>_Dusus)
      o cizilir: kare ilerlemeye (p) baglidir, son ceyrekte bosluga
      gomulurken solar. Sheet henuz yoksa eski prosedurel efekt (yassilasma +
      solma) yedek olarak kalir. Silah ne olursa olsun taban set: dusen adam
      elindekini birakir. */
   const temel=this.direction==='DS'?'D':this.direction==='US'?'U':this.direction;
   const dk='characters1'+temel+'Dusus',dim=this.images[dk];
   if(dim?.naturalWidth){
    const n=Math.max(1,Math.floor(dim.naturalWidth/(Engine.OYUNCU_EN*R)));
    const kare=Math.min(n-1,Math.floor(p*n));
    const alpha=p<.75?1:Math.max(0,1-(p-.75)/.25);
    this.sprite(dk,px,py+p*6,kare,Engine.OYUNCU_EN,Engine.OYUNCU_BOY,this.flip,OYUNCU_OLCEK,alpha);
   }else{
    const squash=Math.max(.1,1-p*.88);
    const alpha=Math.max(0,1-p*1.1);
    c.save();c.translate(px,py);c.scale(1,squash);c.translate(-px,-py);
    this.sprite(this.poz('Idle'),px,py,Math.floor(time*5),Engine.OYUNCU_EN,Engine.OYUNCU_BOY,this.flip,OYUNCU_OLCEK*(1-p*.2),alpha);
    c.restore();
   }
  } else {
  this.sprite(this.poz(action),s.x,s.y,action==='Walk'?Math.floor(this.yol/Engine.ADIM):action==='Attack'?Math.floor((this.vurusSure-this.vurusPoz)*16):Math.floor(time*5),Engine.OYUNCU_EN,Engine.OYUNCU_BOY,this.flip,OYUNCU_OLCEK,this.invulnerable>0&&Math.floor(time*18)%2===0?.45:1);/* Kesme yayi yalnizca kesici silahla: yumrukta kocaman bir yay cizmek yanlis. */if(this.slash>0&&s.equipment.weapon!=='yumruk'){c.strokeStyle='#f5db9ac9';c.lineWidth=1.5;const v=this.yonVektor(),angle=Math.atan2(v.y,v.x);c.beginPath();c.arc(s.x,s.y-5*OYUNCU_OLCEK,23*OYUNCU_OLCEK*(ITEMS[s.equipment.weapon].menzil??1),angle-1.1,angle+1.1);c.stroke();}}}});
  actors.sort((a,b)=>(a.layer-b.layer)||(a.y-b.y)).forEach(a=>a.draw());
  c.fillStyle=this.state.zone==='haven'?'#060e1924':'#070b1c42';c.fillRect(cx,cy,this.gorus.en,this.gorus.boy);
  this.karanlik(cx,cy,time);
  /* Sicak tint yalnizca ates entity'lerindeydi; boyali duvar mesaleleri ve oyuncunun
     mesalesi de ayni sicakligi versin, yoksa isik haritasi deligi soguk gri kaliyor. */
  {const sicak=(x:number,y:number,r:number)=>{const g=c.createRadialGradient(x,y,0,x,y,r);g.addColorStop(0,'#f7af3930');g.addColorStop(.4,'#ee8e1812');g.addColorStop(1,'#ee8e1800');c.fillStyle=g;c.fillRect(x-r,y-r,r*2,r*2);};
   for(const [x,y,r] of this.world.isiklar)sicak(x,y,r*.9+Math.sin(time*3+x)*3);
   /* Sicak hale yalnizca mesale ELDEYKEN: kemerdeyken (yay/balta) karakterin ustunde turuncu leke kaliyordu. */if(this.mesaleElde())sicak(this.state.x,this.state.y-16,70+Math.sin(time*4)*3);}
  for(const e of this.world.entities.filter(e=>e.type==='fire'||e.type==='core')){if(Math.abs(e.x-this.state.x)>230||Math.abs(e.y-this.state.y)>160)continue;const radius=48+Math.sin(time*3+e.x)*3;const glow=c.createRadialGradient(e.x,e.y-6,0,e.x,e.y-6,radius);glow.addColorStop(0,'#f7af3936');glow.addColorStop(.35,'#ee8e1815');glow.addColorStop(1,'#ee8e1800');c.fillStyle=glow;c.fillRect(e.x-radius,e.y-radius-6,radius*2,radius*2);}
  for(const d of this.drops){c.save();c.translate(d.x,d.y);if(d.kind==='wood'){c.fillStyle='#b87c4c';c.fillRect(-3,-2,6,4);c.fillStyle='#6e4729';c.fillRect(-2,-1,4,2);}else if(d.kind==='xp'){const p=2.5+Math.sin(time*10)*.8;c.fillStyle='#8ee675';c.beginPath();c.arc(0,0,p,0,Math.PI*2);c.fill();c.fillStyle='#fff';c.beginPath();c.arc(0,0,p*.5,0,Math.PI*2);c.fill();}else if(d.kind==='gold'){c.fillStyle='#ffd700';c.beginPath();c.arc(0,0,2.5,0,Math.PI*2);c.fill();c.fillStyle='#b89200';c.fillRect(-.8,-.8,1.6,1.6);}else if(d.kind==='bow'){c.strokeStyle='#c78d4c';c.lineWidth=1.5;c.beginPath();c.arc(0,0,5,-Math.PI/2,Math.PI/2);c.stroke();c.strokeStyle='#dedede';c.lineWidth=0.8;c.beginPath();c.moveTo(0,-5);c.lineTo(0,5);c.stroke();}c.restore();}
  for(const s of this.shots){if(s.isHero){c.save();/* Ok ayaklardan cikiyor gibi duruyordu. shot.y'yi yukseltmek YANLIS olurdu:
     ayni deger hem walkable() hem de ayak hizasindaki mob merkezlerine olan
     mesafe testinde kullaniliyor, 21 birim kaldirinca ok hicbir seye
     degmiyordu. Yukseklik yalnizca cizime verilir. */c.translate(s.x,s.y-Engine.OK_YUKSEK);c.rotate(Math.atan2(s.vy,s.vx));// Ikinci kucultme: 8 -> 5.6 birim. Uc de koyulastirildi - #aab2b8 magara
    // zemininde sahnenin en parlak pikseliydi, ok fosforlu gibi duruyordu.
    c.strokeStyle='#54402a';c.lineWidth=.8;c.beginPath();c.moveTo(-2.8,0);c.lineTo(1.8,0);c.stroke();c.fillStyle='#79818a';c.beginPath();c.moveTo(2.8,0);c.lineTo(1,-1);c.lineTo(1,1);c.closePath();c.fill();c.strokeStyle='#63403a';c.lineWidth=.6;c.beginPath();c.moveTo(-1.8,0);c.lineTo(-3.2,-1);c.moveTo(-1.8,0);c.lineTo(-3.2,1);c.stroke();c.restore();}else{c.fillStyle='#f2bd76';c.fillRect(s.x-2,s.y-2,4,4);c.fillStyle='#fff0bd';c.fillRect(s.x-1,s.y-1,2,2);}}
  /* Savrulan kemikler: kendi etrafinda donerek ucar, sonuna dogru solar.
     Parcaciklardan ONCE cizilir ki kemik tozu ustlerinde kalsin. */
  for(const f of this.parcalar){const im=this.images['kemik/'+f.anahtar];if(!im?.naturalWidth)continue;
   c.save();c.globalAlpha=Math.min(1,f.life/f.omur);c.translate(f.x,f.y);c.rotate(f.aci);
   const w=im.naturalWidth/R*f.olcek,h=im.naturalHeight/R*f.olcek;
   c.drawImage(im,-w/2,-h/2,w,h);c.restore();}
  c.globalAlpha=1;
  for(const p of this.particles){c.globalAlpha=Math.min(1,p.life*3);c.fillStyle=p.color;c.fillRect(p.x,p.y,p.size,p.size);}c.globalAlpha=1;
  for(const f of this.floating){c.globalAlpha=Math.min(1,f.life*3);c.font='bold 7px Arial';c.textAlign='center';c.lineWidth=2;c.strokeStyle='#111';c.strokeText(f.text,f.x,f.y);c.fillStyle=f.color;c.fillText(f.text,f.x,f.y);}c.globalAlpha=1;
  
  c.setTransform(1,0,0,1,0,0);
  if(this.uyku>0){
   const gecen=Engine.UYKU-this.uyku;
   // karart (0.9sn) -> tam karanlik (0.6sn) -> ac (0.9sn)
   const a=gecen<.9?gecen/.9:gecen<1.5?1:Math.max(0,1-(gecen-1.5)/.9);
   c.fillStyle=`rgba(0,0,0,${a})`;c.fillRect(0,0,canvas.width,canvas.height);
  }
  }
  destroy(){if(typeof cancelAnimationFrame!=='undefined')cancelAnimationFrame(this.raf);if(typeof window!=='undefined'){window.removeEventListener('keydown',this.handleKeyDown);window.removeEventListener('keyup',this.handleKeyUp);}this.save();}
 }
 export {SAVE};
