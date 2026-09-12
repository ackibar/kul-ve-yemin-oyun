import {addItem,gainXp,ITEMS,newState,removeItem,stats,type ItemId,type State,type Zone} from './data';
/** Render yogunlugu: gorsel pikseli / dunya birimi. Dunya 16px karo, 32px aktor
 *  biriminde kalir; gorseller 2x cozunurlukte (32px karo, 64px aktor) uretilir. */
const R=2;
/** Oyuncu sprite olcegi. sprite() actor capasi (anchor=21) olcekle carpildigi
 *  icin ayaklar her olcekte ayni noktaya oturur; golge de ayni katsayiyla buyur. */
const OYUNCU_OLCEK=1.0;
import {GameAudio,type Sound} from './audio';
import {makeWorld,walkable,lineOfSight,type EnemySpec,type Entity,type World} from './world';
import {bekleyen} from './data';
/** Oyuncunun bakis yonu. 'S' yan, 'DS' asagi-capraz, 'US' yukari-capraz;
 *  bati tarafi bunlarin aynasi (flip). NPC/dusmanlar 3 yonde kaliyor. */
type Yon='U'|'D'|'S'|'DS'|'US';
type Mob=EnemySpec&{hp:number;max:number;cool:number;windup:number;burn:number;hurt:number;homeX:number;homeY:number;gezX?:number;gezY?:number;gezBekle?:number;aci?:number;sersem?:number;zehir?:number;zehirTik?:number};
type Particle={x:number;y:number;vx:number;vy:number;life:number;color:string;size:number;g?:number};
type Floating={x:number;y:number;text:string;life:number;color:string};
type Shot={x:number;y:number;vx:number;vy:number;life:number;damage:number;isHero?:boolean;yakar?:number;zehir?:number;delici?:boolean;ceker?:boolean;gecti?:string[]};
export type Drop={id:string;x:number;y:number;kind:'wood'|'xp'|'gold'|'bow';amount:number;vx:number;vy:number;life:number};
export type Snapshot={state:State;near:Entity|null;attackCooldown:number;dodgeCooldown:number;tonic:number;saveStatus:string;ready:boolean};
export type GameEvent={type:'dialogue'|'death'|'message'|'zone';id?:string;text?:string};
const SAVE='kul-ve-yemin-save-v1';
export class Engine{
 state:State;world:World;mobs:Mob[]=[];audio:GameAudio;paused=true;input={x:0,y:0,attack:false};onChange:(s:Snapshot)=>void;onEvent:(e:GameEvent)=>void;
 private decorHp:Record<string,number>={};
 private drops:Drop[]=[];
 private activeTraps:Set<string>=new Set();
 private canvas:HTMLCanvasElement;private ctx:CanvasRenderingContext2D;private images:Record<string,HTMLImageElement>={};private raf=0;private last=0;private tick=0;private notifyAt=0;private savedAt=0;private stepAt=0;private direction:Yon='D';private flip=false;private moving=false;private attackTimer=0;private dodgeTimer=0;private dash=0;private dashVector={x:0,y:1};private invulnerable=0;private tonic=0;private particles:Particle[]=[];
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
 /** Sarnicta yaratiklar alt kapidan dalga dalga geliyor. Sayac bir sonraki
  *  dalganin gecikmesi; flags.dalga temizlenen dalga sayisi (kayitla gider). */
 private dalgaSayac=0;
 /** Dalga kapisi. Onceden [25,29] idi: sarnicin EN ALT karo satiri ve o satir
  *  zeminde '0' - yaratiklar duvarin icinde doguyor ve move() hedef karoyu
  *  yurunebilir bulamadigi icin hicbir yone kimildayamiyorlardi. Bir satir
  *  yukari alindi; ayrica dogus noktasi yurunebilir olana dek yukari
  *  kaydiriliyor ki harita degisirse yine sikismasinlar. */
 static readonly KAPI:[number,number]=[25,28];
 static readonly DALGALAR:[1|2|4|5,number][][]=[
  [[1,2]],                 // iki fare
  [[5,2],[1,1]],           // yarasalar + fare
  [[2,2],[1,2]],           // orumcekler
  [[5,3],[2,1]],           // yarasa surusu (eskiden solucan dalgasiydi)
  [[4,1],[1,2],[5,2]],     // kullenmis + kalabalik
 ];
 static readonly RAUF_CAN=90;
 private uyku=0;private uykuDondu=false;
 static readonly UYKU=2.4;
 /** Kul Ovasi'nda saniyede eriyen can. Haritanin kenarina gorunmez duvar
  *  koymak yerine sure basinci var: yolun ucuna varmadan geri donmek gerekiyor. */
 static readonly KUL_HASAR=8;
 private dusus=0;
 /** Dusus suresi. Once 0.9 sn'lik yumusak kucuIme vardi; istenen "bir anda
  *  kaybolmak" oldugu icin kisaltildi ve sprite kupsel egriyle hizla siliniyor
  *  - ilk 0.15 sn'de gorunmez oluyor, kalan sure olum ekranina gecis. */
 /** Oyuncu hucresinin dunya birimi eni (40*R = 80 px). NPC'ler 32'de kalir:
  *  yalnizca oyuncunun kilici savrulurken 64 px'lik kareye sigmiyordu, ucu
  *  kirpiliyordu. Yukseklik ve capa (31) degismedi, yani ayaklar yerinde. */
 static readonly OYUNCU_EN=40;
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
  {1:{mod:'yan'},5:{mod:'sabit'},7:{mod:'aynali'}};
 /** 'yan' yaratiklarin dikey egim siniri (radyan). Daha fazlasi yine yatiriyor. */
 static readonly EGIM=Math.PI/6;
 static readonly DUSUS=0.5;
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
 private gez=new Map<string,{hx:number;hy:number;tx:number;ty:number;bekle:number;dir:'D'|'U'|'S';flip:boolean;yol:number}>();
 private floating:Floating[]=[];private shots:Shot[]=[];private camera={x:0,y:0};private slash=0;/* slash yalnizca kesme YAYINI cizer; vurus POZU ayri tutulur, cunku yay atisinda yay yok ama animasyon olmali. vurusSure kareyi bastan baslatir: genel saatten turetilince animasyon rastgele bir kareden basliyordu. */private vurusPoz=0;private vurusSure=0;/** Bileme tasi: kalan sure (sn). Saldiri suresini kisaltir. */private bileme=0;/** Sargi merhemi: kalan sure. */private merhem=0;/** Bal petegi: kalan sure (sn), saniyede 4 can. */private petek=0;/** Duru su: kalan sure boyunca Kul Ovasi cani eritemez. */private kulKoru=0;/** Kul tozu: dusmanlar goremez. */private gizli=0;/** Yemin halkasi bu bolgede kullanildi mi. */private halka=false;/** Tuhn dustukten sonra sesin ve yarasalarin gecikmesi (sn). */private tuhnSayac=0;/** Sesten SONRA yarasalarin gecikmesi (sn). */private tuhnYarasa=0;private ready=false;private saveStatus='';private trapCooldown=0;private fireBurnCooldown=0;
 private keys={up:false,down:false,left:false,right:false};
 private handleKeyDown=(e:KeyboardEvent)=>{if(['Space','KeyW','KeyA','KeyS','KeyD','KeyQ','KeyR','KeyE','KeyJ','KeyK','ArrowUp','ArrowDown','ArrowLeft','ArrowRight','ShiftLeft','ShiftRight'].includes(e.code)){e.preventDefault();}if(this.paused)return;if(e.code==='KeyW'||e.code==='ArrowUp')this.keys.up=true;if(e.code==='KeyS'||e.code==='ArrowDown')this.keys.down=true;if(e.code==='KeyA'||e.code==='ArrowLeft')this.keys.left=true;if(e.code==='KeyD'||e.code==='ArrowRight')this.keys.right=true;if(e.code==='Space'||e.code==='KeyJ')this.input.attack=true;if(e.repeat)return;if(e.code==='ShiftLeft'||e.code==='ShiftRight'||e.code==='KeyK')this.dodge();if(e.code==='KeyE')this.interact();if(e.code==='KeyQ'||e.code==='KeyR')this.toggleWeapon();};
 private handleKeyUp=(e:KeyboardEvent)=>{if(['Space','KeyW','KeyA','KeyS','KeyD','KeyQ','KeyR','KeyE','KeyJ','KeyK','ArrowUp','ArrowDown','ArrowLeft','ArrowRight','ShiftLeft','ShiftRight'].includes(e.code)){e.preventDefault();}if(e.code==='KeyW'||e.code==='ArrowUp')this.keys.up=false;if(e.code==='KeyS'||e.code==='ArrowDown')this.keys.down=false;if(e.code==='KeyA'||e.code==='ArrowLeft')this.keys.left=false;if(e.code==='KeyD'||e.code==='ArrowRight')this.keys.right=false;if(e.code==='Space'||e.code==='KeyJ')this.input.attack=false;};
 constructor(canvas:HTMLCanvasElement,state:State,audio:GameAudio,onChange:(s:Snapshot)=>void,onEvent:(e:GameEvent)=>void){this.canvas=canvas;this.ctx=canvas?.getContext?.('2d')!;this.state=state;this.world=makeWorld(state.zone,state.flags as Record<string,string|boolean|undefined>);this.audio=audio;this.onChange=onChange;this.onEvent=onEvent;this.gez.clear();this.resetMobs();this.loadAssets();this.camera={x:state.x-this.gorus.en/2,y:state.y-this.gorus.boy/2};if(typeof window!=='undefined'){window.addEventListener('keydown',this.handleKeyDown);window.addEventListener('keyup',this.handleKeyUp);}this.loop=this.loop.bind(this);if(typeof requestAnimationFrame!=='undefined')this.raf=requestAnimationFrame(this.loop)}
 private img(key:string,path:string){const im=new Image();im.src=path;this.images[key]=im;return new Promise<void>((resolve,reject)=>{im.onload=()=>resolve();im.onerror=()=>reject(new Error(path));})}
  private async loadAssets(){const jobs:Promise<void>[]=[];const optional:boolean[]=[];/** optional[i] === true olan isler ISTEGE BAGLI: eksikligi oyunu kirmaz.
  *  Karakter dongusu disindaki tum isler zorunlu sayilir. */
 const mark=(o:boolean)=>{while(optional.length<jobs.length)optional.push(o);};for(const id of [3,5,21,22,35])jobs.push(this.img('tile'+id,`/assets/dungeon/1%20Tiles/Tile_${String(id).padStart(2,'0')}.png`));jobs.push(this.img('rauf_kneel','/assets/characters/5/D_Kneel.png'));optional.push(true);jobs.push(this.img('ceset','/assets/characters/5/D_Corpse.png'));optional.push(true);mark(false);for(const kind of ['characters','enemies'])for(let n=1;n<=(kind==='characters'?12:7);n++){if(kind==='enemies'&&n===3)continue;/* solucan kaldirildi */const iste=(kind==='characters'&&n>=5)||(kind==='enemies'&&n===6);for(const dir of ['D','U','S'])for(const action of ['Idle','Walk','Attack','Hurt','Death']){jobs.push(this.img(`${kind}${n}${dir}${action}`,`/assets/${kind}/${n}/${dir}_${action}.png`));optional.push(iste);}}/* Insansi dusmanlar (4 kullenmis, 6 Rauf) caprazlarda da ciziliyor; tepeden
   gorulen yaratiklar dondurulerek cizildigi icin ek sheet istemiyor. */for(const n of [4,6])for(const dir of ['DS','US'])for(const action of ['Walk','Attack']){jobs.push(this.img(`enemies${n}${dir}${action}`,`/assets/enemies/${n}/${dir}_${action}.png`));optional.push(true);}/* Oyuncu 8 yonde cizilir (DS/US caprazlar, bati tarafi aynalanir); NPC ve
   dusmanlar 3 yonde kalir. Capraz sheet'ler istege bagli isaretlenir ki
   eksik olsalar yukleme hatasi vermesin - poz() en yakin ana yone duser. */
/* '1' (silahsiz) de burada: caprazlari uretilmisti ama yalnizca ana yon
   dongusunde yukleniyordu, yani silahsiz modda capraz sheet'ler hic
   kullanilmiyordu - poz() sessizce ana yone dusuyordu. */
for(const set of ['1','1sword','1bow','1balta'])for(const dir of ['D','U','S','DS','US'])for(const action of ['Idle','Walk','Attack','Hurt','Death']){jobs.push(this.img(`characters${set}${dir}${action}`,`/assets/characters/${set}/${dir}_${action}.png`));optional.push(dir==='DS'||dir==='US');}for(const z of ['haven','magara','disari','yikik','cistern'])jobs.push(this.img('bg_'+z,`/assets/arkaplan/${z}.png`));for(const z of ['haven','cistern'])for(let i=0;i<16;i++)jobs.push(this.img(`wang_${z}_${i}`,`/assets/dungeon/wang/${z}/wang_${i}.png`));/* 'portal' (Trapdoor_D) kaldirildi: kapak sprite'i yalnizca boyali arka
   plani olmayan mekanda ciziliyordu, oyle bir mekan kalmadi. */
for(const [key,name]of [['fire','Fire1'],['lever','Lever1'],['trap','Spikes']])jobs.push(this.img(key,`/assets/dungeon/3%20Animated%20objects/${name}.png`));/* Sandik artik CraftPix setinden degil: oyunun paletinde uretilmis iki
   kareli kendi sheet'i (0 kapali, 1 acik). */jobs.push(this.img('chest','/assets/nesne/sandik.png'));for(const a of ["camasir", "fener", "fici", "kasa", "masa", "ocak", "odun", "raf", "sandik", "tabure", "tezgah", "yatak1", "yatak2"])jobs.push(this.img('nesne/'+a+'.png',`/assets/nesne/${a}.png`));mark(false);const result=await Promise.allSettled(jobs);
  // Rauf seti (characters/5, enemies/6) sonradan eklenecek; eksikligi oyunu kirmaz.
  const zorunlu=result.filter((_,i)=>!optional[i]);
  this.ready=zorunlu.every(r=>r.status==='fulfilled');if(!this.ready)this.onEvent({type:'message',text:'Bazı görseller yüklenemedi. Bağlantını kontrol edip sayfayı yenile.'});this.emit();}
 private resetMobs(){this.mobs=this.world.enemies.filter(e=>!this.state.killed.includes(e.id)).map(e=>{const max=e.boss?300:(Engine.CAN[e.kind]??40);return {...e,hp:max,max,cool:1+Math.random(),windup:0,burn:0,hurt:0,homeX:e.x,homeY:e.y}});this.shots=[];this.particles=[];this.drops=[];this.activeTraps.clear();}
 setState(s:State){this.state=s;this.world=makeWorld(s.zone,s.flags as Record<string,string|boolean|undefined>);
  // Takipteyse Rauf yeni bolgede oyuncunun yaninda belirir; makeWorld onu
  // kendi ev konumuna koyuyor ve geride kaliyordu.
  if(s.flags.rauf==='takip'){let r=this.world.entities.find(x=>x.id==='rauf');
   if(!r){r={id:'rauf',type:'npc',x:0,y:0,name:'Rauf',portrait:5};this.world.entities.push(r);}
   r.x=s.x-14;r.y=s.y+6;}
if(!walkable(this.world,s.x,s.y)){[s.x,s.y]=this.world.spawn;}this.camera={x:s.x-this.gorus.en/2,y:s.y-this.gorus.boy/2};this.resetMobs();this.attackTimer=this.dodgeTimer=this.dash=this.invulnerable=this.tonic=0;this.input={x:0,y:0,attack:false};this.audio.setZone(s.zone);this.emit();}
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
  this.onChange({state:structuredClone(this.state),near,attackCooldown:this.attackTimer,dodgeCooldown:this.dodgeTimer,tonic:this.tonic,saveStatus:this.saveStatus,ready:this.ready});}
 notify(text:string){this.onEvent({type:'message',text});}
 spawnDrop(x:number,y:number,kind:'wood'|'xp'|'gold'|'bow',amount:number){this.drops.push({id:`drop_${Date.now()}_${Math.random()}`,x,y,kind,amount,vx:(Math.random()-.5)*45,vy:(Math.random()-.6)*45,life:30});}
 nearest(){let near:Entity|null=null,best=40;for(const e of this.world.entities){if(['fire','trap'].includes(e.type))continue;if(e.type==='decor'&&!e.asset?.includes('Table')&&!e.asset?.startsWith('nesne/'))continue;const d=Math.hypot(e.x-this.state.x,e.y-this.state.y);if(d<best&&lineOfSight(this.world,this.state.x,this.state.y,e.x,e.y,e.id)){near=e;best=d}}return near;}
 interact(){if(this.paused||!this.ready)return;const e=this.nearest();if(!e){this.notify('Konuşmak veya açmak için biraz yaklaş.');return;}if(e.type==='yatak'){
   if(e.id!=='yatak'){this.notify('Çok yorgunum… ama bu benim yatağım değil.');return;}
   this.uyku=Engine.UYKU;this.uykuDondu=false;this.input={x:0,y:0,attack:false};this.audio.play('door');return;}
  if(e.type==='decor'&&e.asset?.includes('Table')){this.audio.play('talk');this.onEvent({type:'dialogue',id:'crafting'});return;}if(e.type==='ceset'){this.audio.play('talk');this.onEvent({type:'dialogue',id:e.id});return;}
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
      oyuncu ayni hikayeyi bastan dinliyordu. */const r=this.state.flags.rauf;this.state.flags.talk=r==='takip'?'rauf:takip1':r==='serbest'?'rauf:serbest1':r==='korundu'?'rauf:korundu1':r==='dizcokme'?'rauf:yenildi':'';}this.audio.play('talk');this.onEvent({type:'dialogue',id:e.id});return;}if(e.type==='chest'){if(this.state.opened.includes(e.id)){this.notify('Bu sandığı daha önce açmıştın. Vurarak kırabilirsin.');return;}this.state.opened.push(e.id);for(const[id,n]of e.items||[])addItem(this.state,id,n);addItem(this.state,'arrow',10);this.state.gold+=e.gold||0;this.audio.play('chest');const lootText=(e.items||[]).map(([id,n])=>`${ITEMS[id].name}${n>1?' ×'+n:''}`).concat(['+10 Ok']).concat(e.gold?[`+${e.gold} altın`]:[]).join(' · ');if(Math.random()<0.35&&this.state.zone!=='haven'){const batCount=Math.floor(1+Math.random()*2);for(let i=0;i<batCount;i++){this.mobs.push({id:`bat_${e.id}_${Date.now()}_${i}`,kind:1,x:e.x+(Math.random()-.5)*16,y:e.y+(Math.random()-.5)*16,max:22,hp:22,cool:.3,windup:0,burn:0,hurt:0,homeX:e.x,homeY:e.y});}this.notify(lootText?`${lootText} · 🦇 Sandıktan yarasa fırladı!`:'🦇 Sandıktan yarasa fırladı!');}else{this.notify(lootText);}this.state.journal.unshift(`${e.items?.map(([id])=>ITEMS[id].name).join(', ')} buldun.`);if(e.items?.some(([id])=>id==='medicine'))this.state.flags.medicineStarted=true;this.save();this.emit();return;}if(e.type==='lever'){if(this.state.flags.gateOpen){this.notify('Ocak kapısı zaten açık.');return;}this.state.flags.gateOpen=true;this.audio.play('door');this.notify('Kül Ocağı’nın kapısı açıldı.');this.save();this.emit();return;}if(e.type==='portal'&&e.to){this.changeZone(e.to,e.spawn!);}}
 private changeZone(zone:Zone,spawn:[number,number]){this.halka=false;this.state.zone=zone;this.state.x=spawn[0]*16+8;this.state.y=spawn[1]*16+8;this.world=makeWorld(zone,this.state.flags as Record<string,string|boolean|undefined>);this.resetMobs();this.camera={x:this.state.x-this.gorus.en/2,y:this.state.y-this.gorus.boy/2};this.invulnerable=1.5;this.audio.setZone(zone);this.audio.play('door');this.onEvent({type:'zone',id:zone});this.save();this.emit()}
 useItem(id:ItemId){if(this.paused&&!['potion','tonic','bileme','merhem','toz','tuzet','durusu','petek'].includes(id))return false;if(id==='potion'){if(this.state.hp>=stats(this.state).maxHp){this.notify('Canın zaten dolu.');return false;}if(!removeItem(this.state,id)){this.notify('Can iksirin kalmadı. Alf’ten alabilirsin.');return false;}this.state.hp=Math.min(stats(this.state).maxHp,this.state.hp+45);this.float(this.state.x,this.state.y-10,'+45','#8cdda5');}else if(id==='tonic'){if(!removeItem(this.state,id))return false;this.tonic=20;this.notify('Köz toniği: 20 saniye +8 saldırı.');}else if(id==='bileme'){if(!removeItem(this.state,id))return false;this.bileme=30;this.notify('Bileme taşı: 30 saniye %25 daha hızlı vuruş.');}else if(id==='merhem'){if(!removeItem(this.state,id))return false;this.merhem=12;this.notify('Sargı merhemi: 12 saniye boyunca yavaşça iyileşiyorsun.');}else if(id==='toz'){if(!removeItem(this.state,id))return false;this.gizli=8;this.notify('Kül tozu: 8 saniye görünmezsin.');}
   /* Obruk'un kileri. Tuzlu et oyunun en guclu tek seferlik iyilesmesi;
      bedeli de ona gore (26 altin, ustune iki bucuk kat zam). */
   else if(id==='tuzet'){if(this.state.hp>=stats(this.state).maxHp){this.notify('Canın zaten dolu.');return false;}if(!removeItem(this.state,id))return false;this.state.hp=Math.min(stats(this.state).maxHp,this.state.hp+60);this.float(this.state.x,this.state.y-10,'+60','#8cdda5');}
   else if(id==='durusu'){if(!removeItem(this.state,id))return false;this.state.hp=Math.min(stats(this.state).maxHp,this.state.hp+25);this.kulKoru=30;this.float(this.state.x,this.state.y-10,'+25','#8cdda5');this.notify('Duru su: 30 saniye kül canını eritmeyecek.');}
   else if(id==='petek'){if(!removeItem(this.state,id))return false;this.state.hp=Math.min(stats(this.state).maxHp,this.state.hp+20);this.petek=15;this.notify('Bal peteği: 15 saniye boyunca yavaşça iyileşiyorsun.');}else if(id==='kavanoz'){if(this.paused)return false;if(!removeItem(this.state,id))return false;/* Kavanoz bir SHOT olarak gidiyor: carpisma, duvar kontrolu ve cizim zaten
   o boru hattinda. Hasari yok (0), isi patlama aninda yapiliyor. */const v=this.yonVektor();this.shots.push({x:this.state.x+v.x*12,y:this.state.y-4+v.y*12,vx:v.x*120,vy:v.y*120,life:.55,damage:0,isHero:true,gecti:['*kavanoz']});this.notify('Köz kavanozu fırlatıldı.');}else return false;this.audio.play('drink');this.save();this.emit();return true;}
 /** Kusanilan silaha gore sprite takimi. Varyant yuklenmemisse silahsiz
  *  sete duser; boylece eksik asset karakteri gorunmez yapmaz. */
 private kit(){const w=this.state.equipment.weapon;const v=ITEMS[w].sprite??(ITEMS[w].menzilli?'bow':w==='yumruk'?'':'sword');/* Kontrol daima 'D' uzerinden: capraz yonde sheet olmayabilir ve set varken yedege dusmek yanlis olur. */return this.images['characters1'+v+'DIdle']?.naturalWidth?'characters1'+v:'characters1';}
 /** Silah dongusu: en guclu kilic -> yay (varsa) -> ciplak el -> bastan.
  *  Once yay yoksa tus hic calismiyordu; artik yaysiz oyuncu da silahsiz
  *  moda gecebiliyor. */
 toggleWeapon(){if(this.paused||!this.ready)return;const s=this.state;
  const sahip=(Object.keys(s.inventory)as ItemId[]).filter(id=>ITEMS[id].kind==='weapon'&&id!=='yumruk');
  const guclu=(l:ItemId[])=>l.sort((a,b)=>(ITEMS[b].attack||0)-(ITEMS[a].attack||0))[0];
  /* Dongu: en guclu kilic -> en guclu menzilli -> ciplak el. Menzilli silah
     artik tek degil (avci yayi, tatar yayi), o yuzden tur bazinda seciliyor. */
  const kilic=guclu(sahip.filter(id=>!ITEMS[id].menzilli)),yay=guclu(sahip.filter(id=>ITEMS[id].menzilli));
  const sira:ItemId[]=[];if(kilic)sira.push(kilic);if(yay)sira.push(yay);sira.push('yumruk');
  const next=sira[(sira.indexOf(s.equipment.weapon)+1)%sira.length];
  this.notify(ITEMS[next].menzilli?`${ITEMS[next].name} kuşanıldı (Menzilli ok modu). Kalan ok: ${s.inventory.arrow||0}`
   :next==='yumruk'?'Silahını kaldırdın. Çıplak ellerle dövüşüyorsun.'
   :`${ITEMS[next].name} kuşanıldı (Kılıç modu).`);
  s.equipment.weapon=next;s.hp=Math.min(s.hp,stats(s).maxHp);this.audio.play('select');this.save();this.emit();}
 dodge(){if(this.paused||this.dodgeTimer>0)return;this.dodgeTimer=stats(this.state).dodge;this.dash=.2;this.invulnerable=.36;this.audio.play('dodge');const kx=(this.keys.right?1:0)-(this.keys.left?1:0),ky=(this.keys.down?1:0)-(this.keys.up?1:0),inX=kx||this.input.x,inY=ky||this.input.y,n=Math.hypot(inX,inY);this.dashVector=n>.1?{x:inX/n,y:inY/n}:this.yonVektor();this.emit();}
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
   const decors=this.world.entities.filter(e=>((e.type==='decor'&&!e.asset?.includes('Table'))||(e.type==='chest'&&s.opened.includes(e.id)))&&Math.hypot(e.x-s.x,e.y-s.y)<38);
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
   (ic carpim pozitif) sirtini donmus demektir. */if(silah.arkadan&&m.aci!==undefined){const vx=m.x-s.x,vy=m.y-s.y,n=Math.hypot(vx,vy)||1;if((Math.cos(m.aci)*vx+Math.sin(m.aci)*vy)/n>.35){damage=Math.round(damage*silah.arkadan);this.float(m.x,m.y-22,'SIRTTAN!','#ffd1a3');}}m.hp-=damage;m.hurt=.17;if(silah.sersemlet)m.sersem=silah.sersemlet;if(s.equipment.weapon==='ember')m.burn=3;if(s.equipment.weapon==='blood')s.hp=Math.min(stats(s).maxHp,s.hp+3);this.float(m.x,m.y-12,String(damage),'#ffdaa3');this.burst(m.x,m.y,'#c76b5d',8);this.audio.play('hit');const d=Math.hypot(m.x-s.x,m.y-s.y)||1;this.move(m,(m.x-s.x)/d*5,(m.y-s.y)/d*5);if(m.id==='rauf'&&m.hp<=m.max*.18){this.raufDizCok();}else if(m.hp<=0)this.kill(m);}this.emit();}
  private kill(m:Mob){
  if(m.id==='rauf'){this.raufDizCok();return;}
  if(this.state.killed.includes(m.id))return;this.state.killed.push(m.id);/* Menzil 190'di: yayla uzaktan oldurunce ses neredeyse duyulmuyordu. */
  {const u=Math.hypot(m.x-this.state.x,m.y-this.state.y);this.audio.play('dusmanOlum',Math.max(.35,1-u/300));}/* Kan muhrunun oldurunceCan'i da tanitiliyor ama hic uygulanmiyordu. */{const y=this.state.equipment.ring;const can=y?ITEMS[y].oldurunceCan:0;if(can&&this.state.hp>0&&this.state.hp<stats(this.state).maxHp){this.state.hp=Math.min(stats(this.state).maxHp,this.state.hp+can);this.float(this.state.x,this.state.y-10,'+'+can,'#d9838b');}}this.burst(m.x,m.y,m.boss?'#eeb559':'#a56a70',18);const xp=m.boss?210:([0,20,25,30,40,24,60,150][m.kind]);const gold=m.boss?60:5+m.kind*2;this.spawnDrop(m.x,m.y,'xp',xp);this.spawnDrop(m.x+(Math.random()-.5)*12,m.y+(Math.random()-.5)*12,'gold',gold);if(m.boss){this.notify('Kül Bekçisi yenildi. Kanı hâlâ sıcak bir mühür bıraktı.');addItem(this.state,'potion',2);addItem(this.state,'kanm',1);}this.save();}
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
 private hurt(damage:number){if(this.invulnerable>0||this.state.hp<=0)return;const n=Math.max(2,damage-stats(this.state).defense);this.state.hp=Math.max(0,this.state.hp-n);this.invulnerable=.72;this.audio.play('hurt');this.float(this.state.x,this.state.y-14,'−'+n,'#ff8b89');this.burst(this.state.x,this.state.y,'#dc7777',7);if(this.state.hp<=0){this.paused=true;this.audio.play('death');this.onEvent({type:'death'});}this.emit();}
  respawn(){this.state.hp=stats(this.state).maxHp;this.state.gold=Math.floor(this.state.gold*.9);this.state.journal.unshift('Sığınağa döndün. Altınının %10’unu yolda kaybettin.');this.changeZone('haven',[15,14]);this.paused=false;this.save();this.emit();}
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
 static readonly CAN:Record<number,number>={1:34,2:42,4:80,5:24,6:72,7:190};
 static readonly GOLGE:Record<number,number>={1:9,2:8,4:8,5:11,6:8,7:18};
 /** Hucre eni (dunya birimi). Trol sopasiyla 64'e sigmiyordu, 112 px kullaniyor. */
 static readonly DUSMAN_EN:Record<number,number>={7:56};
 /** Buyuk dusmanlarin capasi. Varsayilan 21 sprite'i 42 satira siniriyor. */
 static readonly DUSMAN_CAPA:Record<number,number>={7:31};
 /** Ciz olcegi. Trol bir mini-patron: oyuncudan belirgin buyuk gorunmeli. */
 static readonly DUSMAN_OLCEK:Record<number,number>={7:1.7};
 /** Alevin yakma yaricapi (dunya birimi) ve tur basina hasar. Oyuncunun
  *  hasari ayri (8) cunku zirh savunmasi ondan dusuluyor. */
 /** Zehir: saniye basina hasar ve hedefin hiz carpani. Ates 3 sn x 3 hasar
  *  (9); zehir 8 sn x 2 (16) ama daha yavas gelir ve hedefi agirlastirir. */
 static readonly ZEHIR_HASAR=2;
 static readonly ZEHIR_YAVAS=.7;
 static readonly ATES_YARICAP=14;
 static readonly ATES_HASAR=10;
 static readonly CARP_MOB=14;
 private *karakterler(ben:string|null,mobDahil=false){
  if(ben!==null)yield{x:this.state.x,y:this.state.y,r:Engine.CARP};
  for(const e of this.world.entities)if(e.type==='npc'&&e.id!==ben)yield{x:e.x,y:e.y,r:Engine.CARP};
  // Dusmanlar hicbir carpisma listesinde yoktu, yani suru tek bir yigin
  // halinde ust uste binerek geliyordu. Yalnizca DUSMAN hareketinde acilir:
  // oyuncunun icinden gecebilmesi degismesin diye.
  if(mobDahil)for(const m of this.mobs)if(m.hp>0&&m.id!==ben)yield{x:m.x,y:m.y,r:m.boss?Engine.CARP:Engine.CARP_MOB};
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
  this.dusus=Engine.DUSUS;this.input={x:0,y:0,attack:false};
  this.audio.play('hurt');this.notify('Ayağın boşluğa bastı…');
 }
 private dusmeBitti(){this.dusus=0;this.oldu('Sarnıç Ağzı’ndaki uçuruma düştün.');}
 private oldu(not:string){
  this.state.hp=0;this.paused=true;this.audio.play('death');
  this.state.journal.unshift(not);this.onEvent({type:'death'});this.emit();
 }
 private move(p:{x:number;y:number},dx:number,dy:number,ben:string|null=null,mobDahil=false){
  if(walkable(this.world,p.x+dx,p.y)&&!this.carpisir(p.x,p.y,p.x+dx,p.y,ben,mobDahil))p.x+=dx;
  if(walkable(this.world,p.x,p.y+dy)&&!this.carpisir(p.x,p.y,p.x,p.y+dy,ben,mobDahil))p.y+=dy;
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
  return this.world.entities.some(e=>e.type==='fire'&&
   Math.hypot(e.x-x,e.y-y)<Engine.ATES_YARICAP*(e.s??1));
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
    this.float(this.state.x,this.state.y-18,'YEMİN TUTTU','#f0d59a');this.audio.play('level');this.emit();}}for(const key of ['attackTimer','dodgeTimer','dash','invulnerable','tonic','bileme','merhem','petek','kulKoru','gizli','slash','vurusPoz','trapCooldown']as const)this[key]=Math.max(0,this[key]-dt);
   const kx=(this.keys.right?1:0)-(this.keys.left?1:0),ky=(this.keys.down?1:0)-(this.keys.up?1:0),kLen=Math.hypot(kx,ky),activeInput=kLen>0?{x:kx/kLen,y:ky/kLen}:this.input;const movement=this.dash>0?this.dashVector:activeInput;const length=Math.hypot(movement.x,movement.y);this.moving=length>.08;/* Ocak zirhinin agirligi (yavaslik) da tanimliydi ama kullanilmiyordu. */
   const speed=(this.dash>0?205:44)*(ITEMS[this.state.equipment.armor].yavaslik??1);if(this.moving){const dx=movement.x/Math.max(1,length),dy=movement.y/Math.max(1,length);this.face(dx,dy);this.move(this.state,dx*speed*dt,dy*speed*dt);this.bolgeKontrol();this.yol+=speed*dt;if(this.tick-this.stepAt>.29){this.audio.play('step');this.stepAt=this.tick;}}if(this.input.attack)this.attack();
   // --- Kul Ovasi: can erimesi + ruzgarda savrulan kul ---
   if(this.state.zone==='disari'&&this.state.hp>0&&!this.paused){
    /* Kul pelerininin kulKalkan'i ve Duru su'yun korumasi BURADA isliyor;
       ikisi de tanitiliyordu ama hicbir yerde okunmuyordu. */
    const kalkan=this.kulKoru>0?0:(ITEMS[this.state.equipment.armor].kulKalkan??1);
    this.state.hp=Math.max(0,this.state.hp-Engine.KUL_HASAR*kalkan*dt);
    if(this.state.hp<=0){this.oldu('Kül Ovası’nda nefesin tükendi.');}
    // Kul kamera alanina serpiliyor, oyuncunun etrafina degil: ruzgar butun
    // ovada esiyormus gibi dursun.
    else if(Math.random()<dt*34){
     this.particles.push({x:this.camera.x-24+Math.random()*(this.gorus.en+48),
      y:this.camera.y-14+Math.random()*(this.gorus.boy+28),
      vx:16+Math.random()*26,vy:5+Math.random()*11,
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
     const r=Engine.ATES_YARICAP*(e.s??1);
     if(Math.hypot(e.x-this.state.x,e.y-this.state.y)<r){
      if(!ITEMS[this.state.equipment.armor].atesBagisik){
       this.hurt(8);this.float(this.state.x,this.state.y-14,'Ateş yaktı!','#ff6b4a');}
      yandi=true;}
     for(const m of this.mobs){
      if(m.hp<=0||Math.hypot(e.x-m.x,e.y-m.y)>=r)continue;
      m.hp-=Engine.ATES_HASAR;m.hurt=.17;m.burn=Math.max(m.burn,1.5);
      this.float(m.x,m.y-12,String(Engine.ATES_HASAR),'#ff9e5e');
      if(m.hp<=0){if(m.id==='rauf')this.raufDizCok();else this.kill(m);}
      yandi=true;}
     // Yoldas Rauf'un kendi cani var; o da yanar.
     const yoldas=this.state.flags.rauf==='takip'?this.world.entities.find(x=>x.id==='rauf'):null;
     if(yoldas&&Math.hypot(e.x-yoldas.x,e.y-yoldas.y)<r){
      const kalan=Math.max(0,(Number(this.state.flags.raufCan)||0)-Engine.ATES_HASAR);
      this.state.flags.raufCan=String(Math.round(kalan));
      this.float(yoldas.x,yoldas.y-16,'−'+Engine.ATES_HASAR,'#ff9e5e');
      yandi=true;}
    }
    if(yandi)this.fireBurnCooldown=.8;
   }
   for(const m of this.mobs){if(m.hp<=0)continue;m.cool-=dt;m.hurt=Math.max(0,m.hurt-dt);if(m.zehir&&m.zehir>0){m.zehir-=dt;m.hp-=Engine.ZEHIR_HASAR*dt;
    // Sayilar her karede degil saniyede bir yaziliyor; yoksa ekran doluyor.
    m.zehirTik=(m.zehirTik??0)+dt;
    if(m.zehirTik>=1){m.zehirTik=0;this.float(m.x,m.y-12,String(Engine.ZEHIR_HASAR),'#9fd47a');}
    if(m.hp<=0){if(m.id==='rauf')this.raufDizCok();else this.kill(m);continue;}}
   if(m.burn>0){m.burn-=dt;m.hp-=3*dt;if(m.id==='rauf'&&m.hp<=m.max*.18){this.raufDizCok();}else if(m.hp<=0){this.kill(m);continue;}}const dx=this.state.x-m.x,dy=this.state.y-m.y,d=Math.hypot(dx,dy)||1,visible=lineOfSight(this.world,m.x,m.y,this.state.x,this.state.y);if(m.windup>0){m.windup-=dt;if(m.windup<=0){/* Ses uzakliga gore kisiliyor: ekranin obur ucundaki bir yaratik yanindaki
     kadar yuksek vurmamali. */this.audio.play('dusmanVur',Math.max(0,1-d/190));if(m.kind===2){const v=75;this.shots.push({x:m.x,y:m.y,vx:dx/d*v,vy:dy/d*v,life:2.5,damage:15});}else if(d<(m.boss?40:25)){this.hurt(m.boss?30:10+m.kind*3);}if(m.boss){for(let i=0;i<8;i++){const a=i*Math.PI/4;this.shots.push({x:m.x,y:m.y,vx:Math.cos(a)*58,vy:Math.sin(a)*58,life:2.1,damage:20});}}m.cool=m.boss?1.6:m.kind===2?1.7:1.15;}continue;}if(d<135&&visible){m.aci=Math.atan2(dy,dx);const range=m.kind===2?95:m.boss?34:20;if(d>range){const v=(m.kind===4?21:27)*(m.zehir&&m.zehir>0?Engine.ZEHIR_YAVAS:1);this.move(m,dx/d*v*dt,dy/d*v*dt,m.id,true);}if(d<=range&&m.cool<=0)m.windup=m.boss?.8:m.kind===2?.55:.4;}else if(!m.boss){// Oyuncu uzaktayken yaratiklar cakili duruyordu; magara olu gorunuyordu.
    // Doguş yerinin cevresinde yavasca dolasirlar - takip hizinin yarisi.
    m.gezBekle=(m.gezBekle??0)-dt;
    if(m.gezBekle<=0||m.gezX===undefined){const a=Math.random()*Math.PI*2,r=18+Math.random()*44;
     m.gezX=m.homeX+Math.cos(a)*r;m.gezY=m.homeY+Math.sin(a)*r;m.gezBekle=1.6+Math.random()*2.4;}
    const gx=m.gezX-m.x,gy=(m.gezY??m.homeY)-m.y,gd=Math.hypot(gx,gy);
    if(gd>3){m.aci=Math.atan2(gy,gx);const v=(m.kind===4?21:27)*.45*(m.zehir&&m.zehir>0?Engine.ZEHIR_YAVAS:1);this.move(m,gx/gd*v*dt,gy/gd*v*dt,m.id,true);}
    else m.gezBekle=Math.min(m.gezBekle,.4);}
   // Ayrisma. "Yalnizca yaklasani engelle" kurali tek basina yigini cozmuyor:
   // ayni yone giden iki yaratigin mesafesi sabit kaldigi icin hareket serbest
   // kaliyor ve ust uste dogmus olanlar ust uste kaliyor. Kucuk bir itme
   // kuvveti onlari yavasca acar; itme carpisma kontrolsuz uygulanir ki iki
   // yaratik birbirini kilitlemesin.
   for(const o of this.mobs){if(o===m||o.hp<=0)continue;
    const ax=m.x-o.x,ay=m.y-o.y,ad=Math.hypot(ax,ay);
    if(ad>.01&&ad<Engine.CARP_MOB){const it=(Engine.CARP_MOB-ad)*2.4*dt;this.move(m,ax/ad*it,ay/ad*it);}}}
   this.mobs=this.mobs.filter(m=>m.hp>0);
   for(const shot of this.shots){shot.life-=dt;shot.x+=shot.vx*dt;shot.y+=shot.vy*dt;const kavanoz=shot.gecti?.[0]==='*kavanoz';if(!walkable(this.world,shot.x,shot.y,2))shot.life=0;if(kavanoz){if(shot.life<=0)this.kavanozPatla(shot.x,shot.y);continue;}if(shot.isHero){for(const d of this.world.entities.filter(e=>(e.type==='decor'&&!e.asset?.includes('Table'))||(e.type==='chest'&&this.state.opened.includes(e.id)))){if(Math.hypot(shot.x-d.x,shot.y-d.y)<16){shot.life=0;const currentHp=(this.decorHp[d.id]??3)-1;this.decorHp[d.id]=currentHp;if(currentHp<=0){delete this.decorHp[d.id];this.world.entities=this.world.entities.filter(e=>e.id!==d.id);this.burst(d.x,d.y,d.type==='chest'?'#b88a52':'#8b5a2b',16);this.audio.play('hit');this.spawnDrop(d.x,d.y,'wood',1);this.notify(d.type==='chest'?'Boş sandığı kırdın: +1 Odun':'Ahşap eşyayı kırdın: +1 Odun');}else{this.burst(d.x,d.y,d.type==='chest'?'#b88a52':'#8b5a2b',5);this.audio.play('hit');}break;}}for(const m of this.mobs){if(m.hp>0&&Math.hypot(shot.x-m.x,shot.y-m.y)<14){/* Ok TURLERI burada isliyor. Bu blok eskiden sadeydi: ok turu bayraklari
        (yakar/zehir/delici/ceker) atista mermiye yaziliyordu ama isabette hic
        okunmuyordu - yani Ates, Delici ve Cengelli ok sade ok gibi davraniyordu. */if(shot.gecti){if(shot.gecti.includes(m.id))continue;shot.gecti.push(m.id);}else shot.life=0;m.hp-=shot.damage;m.hurt=.17;if(shot.yakar)m.burn=Math.max(m.burn,shot.yakar);if(shot.zehir){m.zehir=Math.max(m.zehir??0,shot.zehir);this.float(m.x,m.y-24,'ZEHİR','#9fd47a');}this.float(m.x,m.y-12,String(shot.damage),'#95e086');this.burst(m.x,m.y,'#c76b5d',6);this.audio.play('hit');const d=Math.hypot(m.x-this.state.x,m.y-this.state.y)||1;/* Cengelli ok geri itmek yerine CEKER: itme yonu tersine cevrilir. */const it=shot.ceker?-22:(m.boss?5:18);this.move(m,(m.x-this.state.x)/d*it,(m.y-this.state.y)/d*it);if(m.id==='rauf'&&m.hp<=m.max*.18){this.raufDizCok();}else if(m.hp<=0)this.kill(m);if(!shot.gecti)break;}}}else if(Math.hypot(shot.x-this.state.x,shot.y-this.state.y)<9){shot.life=0;this.hurt(shot.damage);}}this.shots=this.shots.filter(s=>s.life>0);
   for(const e of this.world.entities){if(e.type==='trap'){const active=this.trapActive(e);const wasActive=this.activeTraps.has(e.id);if(active&&!wasActive){this.activeTraps.add(e.id);const dist=Math.hypot(e.x-this.state.x,e.y-this.state.y);if(dist<100)this.audio.play('trap',1-dist/100);}else if(!active&&wasActive){this.activeTraps.delete(e.id);}if(this.trapCooldown<=0&&active&&Math.hypot(e.x-this.state.x,e.y-this.state.y)<10){this.hurt(15);this.trapCooldown=1;break;}}}
   for(const d of this.drops){d.life-=dt;d.vx*=.84;d.vy*=.84;d.x+=d.vx*dt;d.y+=d.vy*dt;const dist=Math.hypot(this.state.x-d.x,this.state.y-4-d.y);if(dist<65){const speed=160*(1-dist/65)+50;d.x+=(this.state.x-d.x)/dist*speed*dt;d.y+=(this.state.y-4-d.y)/dist*speed*dt;}if(dist<10){d.life=0;if(d.kind==='wood'){addItem(this.state,'wood',d.amount);this.audio.play('coin');this.float(d.x,d.y-8,`+${d.amount} Odun`,'#dca574');}else if(d.kind==='xp'){if(gainXp(this.state,d.amount)){this.audio.play('level');this.notify(`Seviye ${this.state.level}! Yetenek puanını karakter ekranında kullan.`);this.burst(this.state.x,this.state.y,'#e7cb76',25);}else this.audio.play('coin');this.float(d.x,d.y-8,`+${d.amount} XP`,'#b9dca5');}else if(d.kind==='gold'){const r=this.state.equipment.ring;d.amount=Math.round(d.amount*(r?ITEMS[r].altinKat||1:1));this.state.gold+=d.amount;this.audio.play('coin');this.float(d.x,d.y-8,`+${d.amount} Altın`,'#f2d480');}else if(d.kind==='bow'){addItem(this.state,'bow',1);addItem(this.state,'arrow',30);this.audio.play('level');this.notify('Avcı yayı ve 30 ok aldın! Q veya R ile yaya geçebilirsin.');this.float(d.x,d.y-8,'+1 YAY & +30 OK','#f2d480');}this.save();this.emit();}}this.drops=this.drops.filter(d=>d.life>0);
   for(const p of this.particles){p.life-=dt;p.x+=p.vx*dt;p.y+=p.vy*dt;p.vy+=(p.g??40)*dt;}this.particles=this.particles.filter(p=>p.life>0);for(const f of this.floating){f.life-=dt;f.y-=12*dt;}this.floating=this.floating.filter(f=>f.life>0);
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
   // --- Sarnic dalgalari: alt kapidan sirayla gelirler ---
   if(this.state.zone==='cistern'){
    const gecen=Number(this.state.flags.dalga)||0;
    if(this.mobs.every(m=>m.hp<=0)&&gecen<Engine.DALGALAR.length){
     this.dalgaSayac-=dt;
     if(this.dalgaSayac<=0){
      const [kx,ky]=Engine.KAPI;let n=0;
      for(const [kind,adet] of Engine.DALGALAR[gecen])for(let i=0;i<adet;i++){
       const max=Engine.CAN[kind]??40;
       // Yayilim genisletildi: hepsi ayni noktaya dogunca ust uste basliyorlardi.
       let sx=kx*16+8+(Math.random()-.5)*54,sy=ky*16+8+(Math.random()-.5)*16;
       for(let k=0;k<10&&!walkable(this.world,sx,sy);k++)sy-=8;
       this.mobs.push({id:`dalga${gecen}_${n++}`,kind,x:sx,y:sy,hp:max,max,
        cool:.8+Math.random(),windup:0,burn:0,hurt:0,homeX:sx,homeY:sy});}
      this.state.flags.dalga=String(gecen+1);this.dalgaSayac=3.2;
      this.audio.play('door');
      this.notify(gecen+1===Engine.DALGALAR.length
       ?'Kapıdan son kalabalık geliyor.':`Aşağıdaki kapıdan bir şeyler çıkıyor. (${gecen+1}/${Engine.DALGALAR.length})`);
      this.emit();
     }
    }else if(this.mobs.some(m=>m.hp>0))this.dalgaSayac=3.2;
    else if(gecen>=Engine.DALGALAR.length&&!this.state.flags.dalgaBitti){
     this.state.flags.dalgaBitti='1';
     this.state.journal.unshift('Sarnıçtaki kapıdan gelen her şeyi temizledin.');
     this.notify('Kapıdan başka ses gelmiyor.');this.save();this.emit();
    }
   }
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
   // --- Tuhn: ikna edilemediyse ucuruma yurur ve atlar ---
   if(this.state.flags.tuhn==='atladi'&&this.state.zone==='magara'){
    const bd=this.world.entities.find(x=>x.id==='tuhn');
    if(bd){
     // Boslugun UZERINDE yurumesin: ucurum karosuna basar basmaz kaybolur.
     const tx=bd.x/16,ty=bd.y/16;
     const bosta=this.world.ucurumlar.some(([x1,y1,x2,y2])=>tx>=x1&&tx<x2&&ty>=y1&&ty<y2);
     const hx=24*16+8-bd.x,hy=15*16+8-bd.y,hu=Math.hypot(hx,hy);
     if(!bosta&&hu>4){const v=26*dt;bd.x+=hx/hu*v;bd.y+=hy/hu*v;
      const y=this.sahneYuru.get('tuhn')||{dir:'S' as const,flip:false,yol:0};
      y.dir='S';y.flip=hx<0;y.yol+=v;this.sahneYuru.set('tuhn',y);
     }else{
      this.world.entities=this.world.entities.filter(x=>x.id!=='tuhn');
      this.sahneYuru.delete('tuhn');
      // Ses HEMEN degil: ucurum derin. Once sessizlik, sonra asagidan bogur
      // bir ses ve rahatsiz olan yarasalar. Sayac asagida isleniyor.
      this.notify('Tuhn bir adım attı. Karanlık onu aldı.');
      this.tuhnSayac=1.2;
      this.save();this.emit();}
    }
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
    if(kopya.length>1)this.world.entities=this.world.entities.filter((x,i)=>x.id!=='rauf'||x===kopya[0]);
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
     g.bekle=1.6+Math.random()*3.4;
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
  private loop(time:number){const dt=Math.min(.035,(time-this.last)/1000||0);this.last=time;if(!this.paused&&this.ready)this.update(dt);this.render(time/1000);this.raf=requestAnimationFrame(this.loop)}
  private sprite(key:string,x:number,y:number,frame=0,fw?:number,fh?:number,flip=false,scale=1,alpha=1,donder=0,capa?:number){const im=this.images[key];if(!im?.naturalWidth)return;const w=fw||im.width/R,h=fh||im.height/R;const count=Math.floor(im.width/(w*R));const c=this.ctx;c.save();c.globalAlpha=alpha;c.translate(Math.round(x),Math.round(y));const actor=key.startsWith('characters')||key.startsWith('enemies');/* Capa hucre icinde zemin cizgisinin satirini belirliyor (satir = 2*capa).
   Dusmanlarda 21 idi, yani sprite en fazla 42 satir yuksek olabiliyordu;
   62 satirlik trolun ust yarisi kirpiliyordu. Buyuk dusmanlar kendi
   capasini geciyor. */const anchor=capa??(actor?(key.startsWith('characters')?31:key.startsWith('enemies1')?22:21):h);/* Tepeden gorulen yaratiklar icin: yon ayri sheet degil DONDURME. Capa
   ayakta oldugu icin cizim dikdortgeninin MERKEZI etrafinda dondurulur,
   yoksa yaratik ayaklarinin ucundan savruluyor. */if(donder){const my=(-anchor+h/2)*scale;c.translate(0,my);c.rotate(donder);c.translate(0,-my);}if(flip)c.scale(-1,1);const top=actor?-anchor*scale:-h*scale+6;c.drawImage(im,(frame%count)*w*R,0,w*R,h*R,-w*scale/2,top,w*scale,h*scale);c.restore()}
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
  if(bg?.naturalWidth){c.drawImage(bg,0,0,bg.width,bg.height,0,0,this.world.w*16,this.world.h*16);}else{
  const isFloor=(tx:number,ty:number)=>ty>=0&&ty<this.world.h&&tx>=0&&tx<this.world.w&&this.world.tiles[ty][tx]===1;const y0=Math.floor(cy/16)-1,y1=Math.ceil((cy+this.gorus.boy)/16)+2,x0=Math.floor(cx/16)-1,x1=Math.ceil((cx+this.gorus.en)/16)+2;
  // Dual-grid autotile: her cizilen karo dort dunya hucresinin kesistigi koseye ortalanir;
  // wang_N'de N = kose duvar maskesi (NW=8, NE=4, SW=2, SE=1), wang_0 tam zemin, wang_15 tam duvar.
  for(let y=y0;y<y1;y++)for(let x=x0;x<x1;x++){const m=(isFloor(x-1,y-1)?0:8)|(isFloor(x,y-1)?0:4)|(isFloor(x-1,y)?0:2)|(isFloor(x,y)?0:1);// Yikik Ev'in kendi karo seti yok; sarnicin tas setini oduncu aliyor, yoksa oda bombos cizilirdi.
   const kz=this.state.zone==='yikik'?'cistern':this.state.zone;const tile=this.images[`wang_${kz}_${m}`];if(tile?.naturalWidth)c.drawImage(tile,x*16-8,y*16-8,16,16);}
  // Bolge tonu zeminde; zemine komsu olmayan duvarlar uzaklik hissi icin karartilir (doku gorunsun diye %50).
  for(let y=y0;y<y1;y++)for(let x=x0;x<x1;x++){if(isFloor(x,y)){c.fillStyle='#10213310';c.fillRect(x*16,y*16,16,16);}else if(![[0,1],[0,-1],[-1,0],[1,0],[1,1],[-1,-1],[1,-1],[-1,1]].some(([dx,dy])=>isFloor(x+dx,y+dy))){c.fillStyle='#060a1280';c.fillRect(x*16,y*16,16,16);}}}
  for(const e of this.world.entities){if(e.type==='ceset'){this.sprite('ceset',e.x,e.y,0,32,32,false,OYUNCU_OLCEK*1.18);this.label(e.name||'',e.x,e.y-20,'#9d9384');continue;}if(e.type==='portal'){const gizli=e.asset==='gizli';/* Kapak sprite'i yalnizca boyali arka plani OLMAYAN mekanlarda: boyali
     mekanlarda kapi zaten sahnenin parcasi, ustune kapak koymak eski
     zindan setinin izini birakiyordu. Isik halesi ve etiket kaliyor. */if(gizli){this.label(e.name!,e.x,e.y+13,'#c9bda4');continue;}const glow=c.createRadialGradient(e.x,e.y,1,e.x,e.y,22);glow.addColorStop(0,'#74c8ef30');glow.addColorStop(1,'#74c8ef00');c.fillStyle=glow;c.fillRect(e.x-22,e.y-22,44,44);this.label(e.name!,e.x,e.y+13,'#b6dbe9');}if(e.type==='trap')this.sprite('trap',e.x,e.y,this.trapActive(e)?4:0,17,17);}
  const actors:({y:number;draw:()=>void})[]=this.world.entities.filter(e=>e.type!=='portal'&&e.type!=='trap').map(e=>({y:e.y,draw:()=>{
   if(e.type==='decor'){/* Boyali mekanda mobilya ZATEN sahnenin icinde cizili; ustune eski zindan
      setinden bir masa/dolap koymak yabanci duruyordu. Varlik yalnizca
      etkilesim noktasi olarak kaliyor, etiketi duruyor. */if(!bg?.naturalWidth)this.sprite(e.asset!,e.x,e.y);if(e.name)this.label(e.name,e.x,e.y-20,'#dfc28e');return;}
   if(e.type==='fire'){this.sprite('fire',e.x,e.y,Math.floor(time*8)%8,32,32,false,e.s??1);return;}
   if(e.type==='chest'){const opened=this.state.opened.includes(e.id);this.sprite('chest',e.x,e.y,opened?1:0,24,24,false,1,1);if(!opened){c.fillStyle='#e8c883';c.fillRect(e.x-1,e.y-20+Math.sin(time*3),2,2);}return;}
   if(e.type==='lever'){this.sprite('lever',e.x,e.y,this.state.flags.gateOpen?3:0,16,18);return;}
   
   if(e.type==='npc'){const OL=OYUNCU_OLCEK*(e.s||1);c.fillStyle='#03091366';c.beginPath();c.ellipse(e.x,e.y+1,8*OL,2.6*OL,0,0,7);c.fill();if(e.id==='rauf'&&this.state.flags.rauf==='dizcokme'&&this.images.rauf_kneel?.naturalWidth){
     // diz cokme: son karede durur, ayaga kalkmaz
     const ilerleme=Math.min(3,Math.floor((2.6-this.dizSayac)*2));
     this.sprite('rauf_kneel',e.x,e.y,ilerleme,32,32,false,OYUNCU_OLCEK);
     const nw0=this.label(e.name||'',e.x,e.y-30);void nw0;return;}
    const sy=this.sahneYuru.get(e.id);const g=this.gez.get(e.id);const yur=!!sy||(!!g&&g.bekle<=0&&Math.hypot(g.tx-e.x,g.ty-e.y)>1.5);const yd=sy?sy.dir:g?.dir??'D';const yf=sy?sy.flip:g?.flip??false;const yy=sy?sy.yol:(g?.yol||0);this.sprite(`characters${e.portrait}${yur?yd:'D'}${yur?'Walk':'Idle'}`,e.x,e.y,yur?Math.floor(yy/Engine.ADIM):Math.floor(time*5),32,32,yur&&yd==='S'&&yf,OL);const pending=bekleyen(this.state,e.id);/* Unlem isimle AYNI yukseklikte olmali: isim olcekle (e.s) yukseliyordu,
   unlem sabit -30'daydi, kucuk karakterlerde (Lin s=0.8) kayik duruyordu. */const etiketY=e.y-30*(e.s||1);const nw=this.label(e.name||'',e.x,etiketY);if(pending)this.label('!',e.x-nw/2-5,etiketY,'#e0453a');}
  }}));
  for(const m of this.mobs)actors.push({y:m.y,draw:()=>{c.fillStyle='#04091270';c.beginPath();c.ellipse(m.x,m.y+1,(m.boss?13:Engine.GOLGE[m.kind]??8)*OYUNCU_OLCEK,2.6*OYUNCU_OLCEK,0,0,7);c.fill();if(m.windup>0){c.strokeStyle='#ef8766';c.lineWidth=1;c.beginPath();c.arc(m.x,m.y,m.boss?36:14,0,Math.PI*2);c.stroke();}const dx=this.state.x-m.x,dy=this.state.y-m.y;const eylem=m.windup>0?'Attack':m.hurt>0?'Hurt':'Walk';const ol=(m.boss?1.7:Engine.DUSMAN_OLCEK[m.kind]??1)*OYUNCU_OLCEK;const yar=Engine.YARATIK[m.kind];if(yar){/* Yaratiklarda yon ayri sheet degil; nasil gosterildigi YARATIK'ta yazili. */const bak=m.aci??Math.atan2(dy,dx);const anahtar=`enemies${m.kind}D${eylem}`;const kare=Math.floor(time*Engine.DUSMAN_FPS(eylem));if(yar.mod==='tam'){this.sprite(anahtar,m.x,m.y,kare,32,32,false,ol,1,bak-(yar.aci||0));}else if(yar.mod==='yan'){const sol=Math.cos(bak)<0;const egim=Math.max(-Engine.EGIM,Math.min(Engine.EGIM,Math.atan2(Math.sin(bak),Math.abs(Math.cos(bak)))));/* Aynalama dondurmeden SONRA uygulandigi icin egimin isareti ters cevrilir. */this.sprite(anahtar,m.x,m.y,kare,32,32,sol,ol,1,sol?-egim:egim);}else{this.sprite(anahtar,m.x,m.y,kare,Engine.DUSMAN_EN[m.kind]??32,32,yar.mod==='aynali'&&Math.cos(bak)<0,ol,1,0,Engine.DUSMAN_CAPA[m.kind]);}}else{const yatay=Math.abs(dx),dikey=Math.abs(dy);const dir=dikey>yatay*2.414?(dy<0?'U':'D'):yatay>dikey*2.414?'S':(dy<0?'US':'DS');this.sprite(this.dusmanPoz(m.kind,dir,eylem),m.x,m.y,Math.floor(time*Engine.DUSMAN_FPS(eylem)),32,32,dir!=='U'&&dir!=='D'&&dx<0,ol);}const yuzuk=this.state.equipment.ring;if(m.hp<m.max||m.boss||(yuzuk&&ITEMS[yuzuk].canGoster)){const w=m.boss?34:16;c.fillStyle='#190e18';c.fillRect(m.x-w/2,m.y-(m.boss?38:23),w,2);c.fillStyle='#ce7778';c.fillRect(m.x-w/2,m.y-(m.boss?38:23),w*m.hp/m.max,2);if(m.boss)this.label('KÜL BEKÇİSİ',m.x,m.y-43,'#efac8a');}}});
   actors.push({y:this.state.y,draw:()=>{const s=this.state;c.fillStyle='#02081280';c.beginPath();c.ellipse(s.x,s.y+1,8.5*OYUNCU_OLCEK,2.8*OYUNCU_OLCEK,0,0,7);c.fill();const action=this.vurusPoz>0?'Attack':this.moving&&!this.paused?'Walk':'Idle';// Dusus: sprite kucule kucule asagi kayiyor, boslugun icine iniyormus gibi.
  // Dusus: kucuIme YOK, karakter bir anda kayboluyor.
  const dusuyor=this.dusus>0;
  if(!dusuyor)this.sprite(this.poz(action),s.x,s.y,action==='Walk'?Math.floor(this.yol/Engine.ADIM):action==='Attack'?Math.floor((this.vurusSure-this.vurusPoz)*16):Math.floor(time*5),Engine.OYUNCU_EN,32,this.flip,OYUNCU_OLCEK,this.invulnerable>0&&Math.floor(time*18)%2===0?.45:1);/* Kesme yayi yalnizca kesici silahla: yumrukta kocaman bir yay cizmek yanlis. */if(this.slash>0&&s.equipment.weapon!=='yumruk'){c.strokeStyle='#f5db9ac9';c.lineWidth=1.5;const v=this.yonVektor(),angle=Math.atan2(v.y,v.x);c.beginPath();c.arc(s.x,s.y-5*OYUNCU_OLCEK,23*OYUNCU_OLCEK*(ITEMS[s.equipment.weapon].menzil??1),angle-1.1,angle+1.1);c.stroke();}}});
  actors.sort((a,b)=>a.y-b.y).forEach(a=>a.draw());
  c.fillStyle=this.state.zone==='haven'?'#060e1924':'#070b1c42';c.fillRect(cx,cy,this.gorus.en,this.gorus.boy);
  for(const e of this.world.entities.filter(e=>e.type==='fire'||e.type==='core')){if(Math.abs(e.x-this.state.x)>230||Math.abs(e.y-this.state.y)>160)continue;const radius=48+Math.sin(time*3+e.x)*3;const glow=c.createRadialGradient(e.x,e.y-6,0,e.x,e.y-6,radius);glow.addColorStop(0,'#f7af3936');glow.addColorStop(.35,'#ee8e1815');glow.addColorStop(1,'#ee8e1800');c.fillStyle=glow;c.fillRect(e.x-radius,e.y-radius-6,radius*2,radius*2);}
  for(const d of this.drops){c.save();c.translate(d.x,d.y);if(d.kind==='wood'){c.fillStyle='#b87c4c';c.fillRect(-3,-2,6,4);c.fillStyle='#6e4729';c.fillRect(-2,-1,4,2);}else if(d.kind==='xp'){const p=2.5+Math.sin(time*10)*.8;c.fillStyle='#8ee675';c.beginPath();c.arc(0,0,p,0,Math.PI*2);c.fill();c.fillStyle='#fff';c.beginPath();c.arc(0,0,p*.5,0,Math.PI*2);c.fill();}else if(d.kind==='gold'){c.fillStyle='#ffd700';c.beginPath();c.arc(0,0,2.5,0,Math.PI*2);c.fill();c.fillStyle='#b89200';c.fillRect(-.8,-.8,1.6,1.6);}else if(d.kind==='bow'){c.strokeStyle='#c78d4c';c.lineWidth=1.5;c.beginPath();c.arc(0,0,5,-Math.PI/2,Math.PI/2);c.stroke();c.strokeStyle='#dedede';c.lineWidth=0.8;c.beginPath();c.moveTo(0,-5);c.lineTo(0,5);c.stroke();}c.restore();}
  for(const s of this.shots){if(s.isHero){c.save();/* Ok ayaklardan cikiyor gibi duruyordu. shot.y'yi yukseltmek YANLIS olurdu:
     ayni deger hem walkable() hem de ayak hizasindaki mob merkezlerine olan
     mesafe testinde kullaniliyor, 21 birim kaldirinca ok hicbir seye
     degmiyordu. Yukseklik yalnizca cizime verilir. */c.translate(s.x,s.y-Engine.OK_YUKSEK);c.rotate(Math.atan2(s.vy,s.vx));// Ikinci kucultme: 8 -> 5.6 birim. Uc de koyulastirildi - #aab2b8 magara
    // zemininde sahnenin en parlak pikseliydi, ok fosforlu gibi duruyordu.
    c.strokeStyle='#54402a';c.lineWidth=.8;c.beginPath();c.moveTo(-2.8,0);c.lineTo(1.8,0);c.stroke();c.fillStyle='#79818a';c.beginPath();c.moveTo(2.8,0);c.lineTo(1,-1);c.lineTo(1,1);c.closePath();c.fill();c.strokeStyle='#63403a';c.lineWidth=.6;c.beginPath();c.moveTo(-1.8,0);c.lineTo(-3.2,-1);c.moveTo(-1.8,0);c.lineTo(-3.2,1);c.stroke();c.restore();}else{c.fillStyle='#f2bd76';c.fillRect(s.x-2,s.y-2,4,4);c.fillStyle='#fff0bd';c.fillRect(s.x-1,s.y-1,2,2);}}
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
