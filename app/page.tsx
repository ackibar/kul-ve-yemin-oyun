'use client';
import {useEffect,useRef,useState,type PointerEvent} from 'react';
import {ArrowLeftRight,Gamepad2,Swords,Play,Settings2,BookOpen,Volume2,ChevronRight,Smartphone,Shield,Heart,ScrollText,Pause,Hand,Flame,Coins,Footprints,Wind,Gem,Shirt,Sword,Plus,Check,Home as HomeIcon,Maximize,Music2,VolumeX,Save,Compass,X,Spline,Bone,Beef,Feather,Droplets,Cloudy,Scissors,Layers,Cog} from 'lucide-react';
import {Dialog,DialogContent,DialogTitle,DialogDescription} from '@/components/ui/dialog';
import {AlertDialog,AlertDialogContent,AlertDialogTitle,AlertDialogDescription,AlertDialogAction,AlertDialogCancel} from '@/components/ui/alert-dialog';
import {Tabs,TabsList,TabsTrigger,TabsContent} from '@/components/ui/tabs';
import {Slider} from '@/components/ui/slider';
import {ITEMS,finalDurum,TARIFLER,tarifDurum,tarifUygula,ZONES,XP,newState,parseSave,stats,equip,buy,spendPoint,questList,dialogue,choose,addItem,tasi,yeminler,sonMetni,SATICILAR,fiyat,type State,type ItemId,SURUM,ASAMA} from '@/lib/game/data';
import {Engine,SAVE,type Snapshot} from '@/lib/game/engine';
import {GameAudio} from '@/lib/game/audio';
import {makeWorld} from '@/lib/game/world';
type Panel='sandik'|'inventory'|'journal'|'character'|'pause'|'settings'|'help'|'credits'|'dialogue'|'shop'|'death'|'ending'|'crafting'|null;
const INITIAL=newState();INITIAL.started=false;
const ITEM_ICONS=new Set(['torch','migfer','tuzet','durusu','petek','muhur','okzehir','mizrak','balta','hancer','topuz','yemin','uzunyay','okates','okdelici','okcengel','pelerin','ocakz','kanm','yeminh','merhem','kavanoz','toz','tatar','kemik','yelek','gozu','bileme','rusty','guard','ember','blood','bow','arrow','leather','chain','ash','copper','life','wind','potion','tonic','wood','torch','medicine','ledger','core','kemikp','ag','zehirk','kurum','pacavra','post','et','kanat','celik']);
/** Esya ikonu: PixelLab ile uretilmis 32x32 PNG varsa onu, yoksa lucide simgesini cizer. */
/** Arayuz piksel ikonu. Cizgisel lucide ikonlari yalnizca uretimi iyi
 *  cikmayanlarda kaldi: ruzgar, duraklat ve konusma balonu gibi soyut
 *  simgeler 32x32 piksel artta okunmaz hale geliyordu. */
function UI({ad,size=24}:{ad:string;size?:number}){
 return <img src={`/assets/icons/ui/${ad}.png`} width={size} height={size} alt=""
  style={{imageRendering:'pixelated',display:'block'}}/>;
}
function Icon({name,size=23,item}:{name:string;size?:number;item?:string}){if(item&&ITEM_ICONS.has(item))return <img src={`/assets/icons/items/${item}.png`} width={size} height={size} alt="" style={{imageRendering:'pixelated',display:'block'}}/>;const C=({sword:Sword,flame:Flame,shirt:Shirt,shield:Shield,ring:Gem,heart:Heart,wind:Wind,potion:Heart,book:BookOpen,gem:Gem,hand:Hand,/* Hammaddeler: simdilik cizgisel lucide simgeleri. Piksel ikonlari henuz
     uretilmedi; hepsi ayni varsayilana (Gem) dusmesin diye en azindan
     birbirinden ayrilabilir olsunlar. */bone:Bone,web:Spline,flask:Droplets,ash:Cloudy,cloth:Scissors,hide:Layers,meat:Beef,wing:Feather,ingot:Cog}as Record<string,typeof Sword>)[name]||Gem;return <C size={size}/>}
/** Portre: karakterin KENDI sprite'indan kafa bolgesi yakinlastirilir.
 *  Uretilen bust portreler karaktere benzemedigi ve pahali oldugu icin (25
 *  uretim/portre) kullanilmiyor; kafa bandi hepsinde x=32 merkezli, y 0..24. */
/* Oyuncu sheet'i 80 satir (kafa kesilmesin diye); portre kirpimi 64'e gore, o yuzden oyuncu icin ayri portre.png. */
function Portrait({id=1}:{id?:number}){return <span className="portrait" style={{backgroundImage:`url('/assets/characters/${id}/${id===1?'portre':'D_Idle'}.png')`}}/>}
function Joystick({engine}:{engine:React.RefObject<Engine|null>}){const [knob,setKnob]=useState({x:0,y:0});const active=useRef<number|null>(null);const move=(e:PointerEvent<HTMLDivElement>)=>{if(active.current!==e.pointerId)return;const r=e.currentTarget.getBoundingClientRect(),dx=e.clientX-r.left-r.width/2,dy=e.clientY-r.top-r.height/2,length=Math.hypot(dx,dy),max=r.width*.33;const x=dx/Math.max(1,length/max),y=dy/Math.max(1,length/max);setKnob({x,y});if(engine.current){engine.current.input.x=x/max;engine.current.input.y=y/max}};const end=()=>{active.current=null;setKnob({x:0,y:0});if(engine.current){engine.current.input.x=engine.current.input.y=0}};return <div className="joystick" role="group" aria-label="Hareket: parmağını istediğin yöne sürükle" onPointerDown={e=>{active.current=e.pointerId;e.currentTarget.setPointerCapture(e.pointerId);move(e);}} onPointerMove={move} onPointerUp={end} onPointerCancel={end} onLostPointerCapture={end}><span className="stick-direction up">⌃</span><span className="stick-direction down">⌄</span><div style={{transform:`translate(${knob.x}px,${knob.y}px)`}}/><span className="control-caption">HAREKET</span></div>}
/** Gezici joystick: sabit halkanın aksine parmağın DOKUNDUĞU yerde belirir.
 *  Yakalama alanı ekranın solunda geniş bir bölge (bkz. .joy-alan); HUD,
 *  görev ipucu ve aksiyon düğmeleriyle çakışmasın diye bu bileşen JSX'te
 *  onlardan ÖNCE render edilir - DOM sırası z-index yerine geçiyor, onlar
 *  üstte kalır. Halka, dokunulan noktada tam sığacak şekilde kenarlardan
 *  içeri kenetlenir (RING kadar payla). */
function FloatingJoystick({engine}:{engine:React.RefObject<Engine|null>}){
 const [origin,setOrigin]=useState<{x:number;y:number}|null>(null);
 const [knob,setKnob]=useState({x:0,y:0});
 const active=useRef<number|null>(null);
 const RING=54,MAX=40;
 const konumla=(e:PointerEvent<HTMLDivElement>)=>{
  const r=e.currentTarget.getBoundingClientRect();
  const x=Math.min(Math.max(e.clientX-r.left,RING),Math.max(RING,r.width-RING));
  const y=Math.min(Math.max(e.clientY-r.top,RING),Math.max(RING,r.height-RING));
  return {x,y};
 };
 const move=(e:PointerEvent<HTMLDivElement>)=>{
  if(active.current!==e.pointerId||!origin)return;
  const r=e.currentTarget.getBoundingClientRect();
  const dx=e.clientX-r.left-origin.x,dy=e.clientY-r.top-origin.y,length=Math.hypot(dx,dy);
  const x=dx/Math.max(1,length/MAX),y=dy/Math.max(1,length/MAX);
  setKnob({x,y});if(engine.current){engine.current.input.x=x/MAX;engine.current.input.y=y/MAX}
 };
 const end=()=>{active.current=null;setOrigin(null);setKnob({x:0,y:0});if(engine.current){engine.current.input.x=engine.current.input.y=0}};
 return <div className="joy-alan" role="group" aria-label="Hareket: ekrana dokun ve istediğin yöne sürükle"
   onPointerDown={e=>{active.current=e.pointerId;try{e.currentTarget.setPointerCapture(e.pointerId);}catch{/* capture olmasa da halka gorunur, surukleme calisir */}setOrigin(konumla(e));setKnob({x:0,y:0});}}
   onPointerMove={move} onPointerUp={end} onPointerCancel={end} onLostPointerCapture={end}>
  {origin&&<div className="joystick joystick-serbest" style={{left:origin.x,top:origin.y}}>
   <span className="stick-direction up">⌃</span><span className="stick-direction down">⌄</span>
   <div style={{transform:`translate(${knob.x}px,${knob.y}px)`}}/>
  </div>}
 </div>;
}
function MapView({state}:{state:State}){const w=makeWorld(state.zone);
 // Eskiden zemin soyut gri kutucuklarla ("mavnedislik/blueprint" gibi
 // duruyordu, kullanici "sacma duruyor" dedi) ciziliyordu; artik gercek
 // mekan gorseli minik bir on-izleme gibi kullaniliyor - motorun kendisinin
 // arka plani her zaman w.w*16 x h.h*16 dunya birimine gerdigiyle (bkz.
 // engine.ts render()) AYNI oranti (x/16*5), yani nokta konumlariyla
 // piksel hizasinda kalir. Ustune hafif bir koyu ortu (opacity), noktalar
 // ustunde okunur kalsin diye.
 return <div className="map-layout"><svg className="dungeon-map" viewBox={`0 0 ${w.w*5} ${w.h*5}`} aria-label={`${ZONES[state.zone].name} haritası`} role="img"><image href={`/assets/arkaplan/${state.zone}.png`} x={0} y={0} width={w.w*5} height={w.h*5} preserveAspectRatio="none" style={{imageRendering:'auto'}}/><rect x={0} y={0} width={w.w*5} height={w.h*5} fill="#0b1521" opacity={0.4}/>{w.entities.filter(e=>['npc','portal','chest','lever','core'].includes(e.type)&&!state.opened.includes(e.id)).map(e=><circle key={e.id} cx={e.x/16*5} cy={e.y/16*5} r={e.type==='portal'?2.8:2} fill={e.type==='npc'?'#eec785':e.type==='portal'?'#86d0e0':'#aa9bc4'} stroke="#17232c" strokeWidth={0.6}/>)}<circle cx={state.x/16*5} cy={state.y/16*5} r={3.5} fill="#fff" stroke="#17232c" strokeWidth={1}/></svg><div className="map-key"><b>{ZONES[state.zone].name}</b><p>● Beyaz: sen<br/><span className="gold">● Altın: kişiler</span><br/><span className="blue">● Mavi: geçitler</span><br/><span className="purple">● Mor: nesneler</span></p><p>Sığınakta Mirna batıda, Alf doğuda, Undur güneybatıda. Sarnıca giriş güneyde.</p>{state.zone==='cistern'&&<p>İlaç ve Rauf kuzeydoğuda. Sandıklar doğuda ve batıda.</p>}</div></div>}
export default function Home(){
 const canvas=useRef<HTMLCanvasElement>(null),engine=useRef<Engine|null>(null),audio=useRef<GameAudio|null>(null),noticeTimer=useRef<ReturnType<typeof setTimeout>|null>(null);const zoneTimer=useRef<ReturnType<typeof setTimeout>|null>(null);const intro=useRef<HTMLVideoElement|null>(null);
 const [snapshot,setSnapshot]=useState<Snapshot>({state:INITIAL,near:null,attackCooldown:0,dodgeCooldown:0,tonic:0,mesale:0,saveStatus:'',ready:false});
 const [menu,setMenu]=useState(true),[panel,setPanel]=useState<Panel>(null),[speaker,setSpeaker]=useState('mira'),[hasSave,setHasSave]=useState(false),[confirmNew,setConfirmNew]=useState(false),[portrait,setPortrait]=useState(false),[notice,setNotice]=useState(''),[zoneFlash,setZoneFlash]=useState(''),[girisHazir,setGirisHazir]=useState(false),[yon,setYon]=useState<'yatay'|'dikey'>('yatay'),[tercihHazir,setTercihHazir]=useState(false),[music,setMusic]=useState(45),[effects,setEffects]=useState(65),[selected,setSelected]=useState<ItemId>('rusty'),[panelBack,setPanelBack]=useState<Panel>(null),[satici,setSatici]=useState('boran'),[sandikId,setSandikId]=useState(''),/* Kontrol listesi acik mi - H ile acilip kapanir (kullanici istegi). */[tuslarAcik,setTuslarAcik]=useState(true);
 /* GIRDI MODU. Baslangic cihaz yetenegiyle secilir, sonra SON KULLANILAN
    kazanir: masaustunde dokunmatik dugmeler bosuna yer kapliyordu, tablette
    klavye takiliysa da tersi. 'auto' = algila, digerleri elle secim. */
 const [girdi,setGirdi]=useState<'dokunma'|'klavye'|'gamepad'>(()=>
  (typeof window!=='undefined'&&(window.matchMedia?.('(pointer: coarse)').matches||navigator.maxTouchPoints>0))?'dokunma':'klavye');
 const [girdiKilit,setGirdiKilit]=useState<'auto'|'dokunma'|'klavye'|'gamepad'>('auto');
 const mod=girdiKilit==='auto'?girdi:girdiKilit;
 /* Joystick stili: SABİT (ekranın sol altında sabit halka, öntanımlı) ya da
    GEZİCİ (parmağın dokunduğu yerde belirir). İkisi de seçenek olarak kalır. */
 const [joyStili,setJoyStili]=useState<'sabit'|'gezici'>('sabit');
 const current=useRef({panel,menu});current.current={panel,menu};
 // Mekan adi cerceveli bildirim kutusundan ayrildi: kendi basina, buyuk ve
 // krem renkte belirip birkac saniyede soluyor.
 const flashZone=(text:string)=>{setZoneFlash(text);if(zoneTimer.current)clearTimeout(zoneTimer.current);zoneTimer.current=setTimeout(()=>setZoneFlash(''),2800)};
 const showNotice=(text:string)=>{setNotice(text);if(noticeTimer.current)clearTimeout(noticeTimer.current);noticeTimer.current=setTimeout(()=>setNotice(''),4800)};
 useEffect(()=>{let saved:State|null=null;try{const raw=localStorage.getItem(SAVE);saved=raw?parseSave(raw):null;if(raw&&!saved)showNotice('Eski kayıt okunamadı. Yeni bir yolculuk başlatabilirsin.');const pref=JSON.parse(localStorage.getItem('kul-yemin-audio')||'{}');if(typeof pref.music==='number'&&typeof pref.effects==='number'){setMusic(Math.min(100,Math.max(0,pref.music)));setEffects(Math.min(100,Math.max(0,pref.effects)));}if(pref.yon==='dikey'||pref.yon==='yatay')setYon(pref.yon);if(pref.joy==='gezici'||pref.joy==='sabit')setJoyStili(pref.joy);}catch{}setTercihHazir(true);setHasSave(!!saved);const sound=new GameAudio();audio.current=sound;const game=new Engine(canvas.current!,saved||structuredClone(INITIAL),sound,setSnapshot,event=>{if(event.type==='dialogue'){if(event.id==='crafting'){setPanel('crafting');}else{setSpeaker(event.id!);setPanel('dialogue');}}else if(event.type==='sandik'){setSandikId(event.id!);setPanel('sandik');}else if(event.type==='death')setPanel('death');else if(event.type==='zone')flashZone(ZONES[event.id as keyof typeof ZONES].name);else if(event.text)showNotice(event.text);});engine.current=game;
 const resize=()=>setPortrait(window.matchMedia('(orientation: portrait)').matches);resize();window.addEventListener('resize',resize);const visibility=()=>{if(document.hidden){game.setPaused(true);game.save();sound.pause(true);if(!current.current.menu)setPanel(p=>p||'pause');}else sound.pause(false);};document.addEventListener('visibilitychange',visibility);const save=()=>game.save();window.addEventListener('pagehide',save);
 return()=>{game.destroy();sound.destroy();window.removeEventListener('resize',resize);document.removeEventListener('visibilitychange',visibility);window.removeEventListener('pagehide',save);if(noticeTimer.current)clearTimeout(noticeTimer.current);if(zoneTimer.current)clearTimeout(zoneTimer.current);};},[]);
 // Dikey ekran TEK BASINA duraklatma sebebi degil. Bu kosul dikey mod
 // eklenmeden onceydi: o zaman dikey demek 'telefonunu cevir' ortusu
 // demekti. Artik yalnizca o ortu acikken duraklatilir - yoksa oyuncu
 // dikeyde oynamayi secse bile oyun donmus kaliyordu (girdi geliyor,
 // motor guncellemiyor).
 /* Son kullanilan girdi kazanir. Dokunma yalnizca gercek parmakta (kalem ve
    fare pointerType'i farkli); klavyede oyun tuslari yeterli, Tab/Alt gibi
    gezinti tuslari modu degistirmesin. */
 useEffect(()=>{
  const dokun=(e:Event)=>{if((e as {pointerType?:string}).pointerType==='touch')setGirdi('dokunma');};
  const tus=(e:Event)=>{const c=(e as {code?:string}).code||'';if(/^(Key|Arrow|Digit|Space|Escape)/.test(c))setGirdi('klavye');};
  const pad=()=>setGirdi('gamepad');
  window.addEventListener('pointerdown',dokun,{passive:true});
  window.addEventListener('keydown',tus);
  window.addEventListener('gamepadconnected',pad);
  return()=>{window.removeEventListener('pointerdown',dokun);window.removeEventListener('keydown',tus);window.removeEventListener('gamepadconnected',pad);};
 },[]);
 /* Masaustunde panelleri klavyeyle ac: dokunmatik dugmeler olmayinca heybeye
    ulasmanin baska yolu kalmiyordu. Motor yalnizca oyun tuslarini dinliyor,
    paneller React durumunda oldugu icin burada. */
 useEffect(()=>{
  if(mod==='dokunma')return;
  const f=(e:KeyboardEvent)=>{
   if(menu)return;
   const ac=(hedef:Panel)=>{e.preventDefault();setPanel(cur=>cur===hedef?null:(cur===null?hedef:cur));};
   if(e.code==='KeyI')ac('inventory');
   else if(e.code==='KeyC')ac('character');
   else if(e.code==='KeyL'||e.code==='KeyM')ac('journal');
   else if(e.code==='KeyH'){e.preventDefault();setTuslarAcik(v=>!v);}
   else if(e.code==='Escape'){e.preventDefault();setPanel(cur=>cur===null?'pause':null);}
  };
  window.addEventListener('keydown',f);return()=>window.removeEventListener('keydown',f);
 },[mod,menu]);

 /* Gamepad: oyun icinde motor okuyor; MENUDE React geziyor. Yukari/asagi
    odagi tasir, A onaylar, B kapatir, Start duraklatir. */
 useEffect(()=>{
  const g=engine.current;if(!g)return;
  g.onGamepad=(yer,tus)=>{
   setGirdi('gamepad');
   if(yer!=='menu'||!tus)return;
   if(tus==='menu'){setPanel(cur=>cur===null?'pause':null);return;}
   const dugmeler=[...document.querySelectorAll<HTMLButtonElement>('[data-slot=dialog-content] button:not(:disabled), .title-screen button:not(:disabled)')];
   if(!dugmeler.length)return;
   const i=dugmeler.indexOf(document.activeElement as HTMLButtonElement);
   if(tus==='yukari')dugmeler[(i<=0?dugmeler.length:i)-1]?.focus();
   else if(tus==='asagi')dugmeler[(i+1)%dugmeler.length]?.focus();
   else if(tus==='onay')(document.activeElement as HTMLButtonElement)?.click?.();
   else if(tus==='geri')setPanel(null);
  };
  return()=>{if(g)g.onGamepad=undefined;};
 },[]);

 useEffect(()=>{engine.current?.setPaused(menu||panel!==null||(portrait&&yon==='yatay'));},[menu,panel,portrait,yon]);
  // Ana menude muzik ve videonun kendi ruzgar sesi calar. Tarayici izinsiz
 // sesli oynatmadigi icin once denenir, olmazsa ILK dokunusta acilir.
 useEffect(()=>{if(!menu)return;
  // Mobilde video HIC oynamiyordu: bu fonksiyon menu acilir acilmaz
  // v.muted=false yapiyordu ve tarayici sesi acik videoyu dokunma olmadan
  // oynatmayi reddediyor - otomatik baslayan oynatma da boylece duruyordu.
  // Artik ses YALNIZCA gercek bir dokunustan sonra aciliyor; basarisiz
  // olursa sessize donup tekrar deneniyor, yani goruntu her halukarda akar.
  const oynat=(sesli:boolean)=>{const v=intro.current;if(!v)return;
   if(sesli){v.muted=false;v.volume=.85;}
   void v.play().catch(()=>{v.muted=true;void v.play().catch(()=>{});});};
  const ac=(sesli:boolean)=>{audio.current?.start();oynat(sesli);};
  ac(false);
  const bir=()=>{ac(true);window.removeEventListener('pointerdown',bir);window.removeEventListener('keydown',bir);};
  window.addEventListener('pointerdown',bir);window.addEventListener('keydown',bir);
  return()=>{window.removeEventListener('pointerdown',bir);window.removeEventListener('keydown',bir);};
 },[menu]);
 // Once video gorunsun, secenekler uzerine gelsin.
 useEffect(()=>{if(!menu){setGirisHazir(false);return;}
  const t=setTimeout(()=>setGirisHazir(true),1400);return()=>clearTimeout(t);},[menu]);
 useEffect(()=>{audio.current?.setVolumes(music/100,effects/100);
  // Yukleme bitmeden YAZMA. Ref yetmiyor: bu efekt yukleme efektinden HEMEN
  // sonra, henuz eski state ile calisiyor ve varsayilanlari kayitli tercihin
  // uzerine yaziyordu (ses seviyesi ve ekran yonu her acilista sifirlaniyordu).
  // Durum degiskeni sayesinde ilk yazma, yuklenmis degerlerin oldugu render'da olur.
  if(!tercihHazir)return;
  try{localStorage.setItem('kul-yemin-audio',JSON.stringify({music,effects,yon,joy:joyStili}));}catch{}
 },[music,effects,yon,joyStili,tercihHazir]);
 useEffect(()=>{const doc=document as Document&{modelContext?:{registerTool:(tool:unknown,options:{signal:AbortSignal})=>void|Promise<void>}};if(!doc.modelContext?.registerTool)return;const life=new AbortController();const reg=(tool:unknown)=>{try{void Promise.resolve(doc.modelContext!.registerTool(tool,{signal:life.signal})).catch(()=>{})}catch{}};reg({name:'read_adventure_status',description:'Read this device’s current adventure, inventory and quests.',inputSchema:{type:'object',properties:{},additionalProperties:false},annotations:{readOnlyHint:true,untrustedContentHint:false},execute:()=>{const s=engine.current!.state;return {zone:ZONES[s.zone].name,level:s.level,hp:s.hp,inventory:s.inventory,quests:questList(s),ending:s.ending};}});reg({name:'use_adventure_consumable',description:'Use an owned potion or tonic in the current active adventure, as in the inventory.',inputSchema:{type:'object',properties:{item:{type:'string',enum:['potion','tonic']}},required:['item'],additionalProperties:false},annotations:{readOnlyHint:false,untrustedContentHint:false},execute:(input:unknown)=>{const id=(input as {item?:string})?.item;if(id!=='potion'&&id!=='tonic')throw new Error('Unknown consumable.');if(current.current.menu||current.current.panel==='death')throw new Error('Resume a living adventure first.');if(!engine.current!.useItem(id))throw new Error('Item unavailable or cannot be used.');return {hp:engine.current!.state.hp,remaining:engine.current!.state.inventory[id]||0};}});return()=>life.abort();},[]);
 const s=snapshot.state,st=stats(s),quests=questList(s),activeQuest=quests.find(q=>q.active&&!q.done)||quests.find(q=>!q.done),talk=dialogue(s,speaker);
 function launch(fresh=false){audio.current?.start();const game=engine.current!;if(fresh){game.setState(newState());setSelected('rusty');}else{try{const raw=localStorage.getItem(SAVE),saved=raw?parseSave(raw):null;if(saved)game.setState(saved);}catch{}}setMenu(false);setPanel(null);setHasSave(true);setConfirmNew(false);game.start();}
 function openPanel(p:Panel){audio.current?.start();engine.current?.sound('select');setPanelBack(null);setPanel(p);}
 function closePanel(){if(panel==='death'){engine.current?.respawn();setPanel(null);return;}setPanel(panelBack);setPanelBack(null);engine.current?.emit();}
 function applyChoice(action:string){const result=choose(engine.current!.state,action);if(result.message)showNotice(result.message);engine.current!.sound(result.leveled?'level':'select');engine.current!.save();engine.current!.emit();if(result.special==='shop'){setSatici(result.satici||'boran');setPanel('shop');}else if(result.special==='ending')setPanel('ending');else if(result.special==='close')setPanel(null);}
 function selectItem(id:ItemId){const game=engine.current!;if(ITEMS[id].kind==='consumable')game.useItem(id);else if(equip(game.state,id)){game.sound('select');showNotice(`${ITEMS[id].name} kuşanıldı.`);}game.save();game.emit();}
 function mainMenu(){engine.current?.save();setMenu(true);setPanel(null);setHasSave(!!engine.current?.state.started);audio.current?.setZone('haven');}
 function fullscreen(){const d=document.documentElement;if(!document.fullscreenElement)void d.requestFullscreen?.().catch(()=>showNotice('Bu tarayıcı tam ekranı desteklemiyor. Telefonu yatay kullanabilirsin.'));else void document.exitFullscreen?.();}
 const title=panel==='dialogue'?talk.who:({inventory:'Heybe',journal:'Yolculuk defteri',character:'Gezgin',pause:'Bir nefes',settings:'Ses ve ayarlar',help:'Yola çıkmadan',credits:'Emeği geçenler',sandik:'Sandık',shop:satici==='obruk'?'Obruk’un kileri':'Alf’in tezgâhı',crafting:'Zanaat Masası',death:'Ateş henüz sönmedi',ending:s.ending==='seal'?'Tutulan yemin':'Yeni bir ateş'}as Record<string,string>)[panel||'']||'';
 return <main className={`game-shell ${portrait&&yon==="dikey"?"dikey":""}`} aria-label="Kül ve Yemin mobil rol yapma oyunu">
  <canvas ref={canvas} className="world" aria-label={`${ZONES[s.zone].name} oyun alanı`}/><div className="vignette"/>
  {menu?<section className="title-screen"><video ref={intro} className="intro-video" src="/assets/video/intro.mp4" poster="/assets/video/intro.jpg" autoPlay muted loop playsInline preload="auto"/><div className={`title-content ${girisHazir?"acik":""}`}><div className="chapter-label"><span/> BİR YERALTI HİKÂYESİ <span/></div><h1>KÜL <i>ve</i> YEMİN</h1><p className="title-sub">Bazı kapılar bir seçimle açılır.</p><div className="menu-buttons">{hasSave?<><button className="primary" disabled={!snapshot.ready} onClick={()=>launch()}><Play size={19} fill="currentColor"/> Yolculuğa devam et <ChevronRight size={19}/></button><button onClick={()=>setConfirmNew(true)} disabled={!snapshot.ready}><Plus size={19}/> Yeni yolculuk</button></>:<button className="primary" onClick={()=>launch(true)} disabled={!snapshot.ready}><Play size={19} fill="currentColor"/>{snapshot.ready?'Yolculuğa başla':'Dünya hazırlanıyor…'}<ChevronRight size={19}/></button>}<div className="menu-secondary"><button onClick={()=>openPanel('settings')}><Settings2 size={18}/> Ayarlar</button><button onClick={()=>openPanel('help')}><BookOpen size={18}/> Rehber</button></div></div></div><footer><button onClick={()=>openPanel('credits')}>BÖLÜM I · SON SIĞINAK</button><span><Smartphone size={15}/> {yon==='dikey'?'DİKEY':'YATAY'} · DOKUNMATİK</span></footer></section>:<>
  {/* Gezici joystick yakalama alanı: HUD ve görev ipucundan ÖNCE, ki DOM
      sırası gereği onlar üstte kalsın (bkz. FloatingJoystick yorumu). */}
  {!panel&&mod==='dokunma'&&joyStili==='gezici'&&<FloatingJoystick engine={engine}/>}
  <header className="hud"><button className="hero-badge" onClick={()=>openPanel('character')} aria-label="Karakter ve yetenekler"><Portrait/><div><b>Gezgin <small>SV. {s.level}</small>{s.points>0&&<em>+{s.points}</em>}<small className="gold"><Coins size={12}/>{s.gold}</small></b><div className="health"><span style={{width:`${s.hp/st.maxHp*100}%`}}/><i>{Math.ceil(s.hp)} / {st.maxHp}</i></div><div className="xp-bar"><span style={{width:`${s.level===5?100:(s.xp-XP[s.level-1])/(XP[s.level]-XP[s.level-1])*100}%`}}/></div></div></button><div className="zone-title">{ZONES[s.zone].name}<small>{ZONES[s.zone].danger}</small></div><nav className="hud-nav" aria-label="Oyun menüleri"><button onClick={()=>openPanel('inventory')} aria-label="Heybeyi aç"><UI ad="canta" size={27}/></button><button onClick={()=>openPanel('journal')} aria-label="Görevler ve harita"><UI ad="rulo" size={27}/></button><button onClick={()=>openPanel('pause')} aria-label="Oyunu duraklat"><Pause size={20}/></button></nav></header>
  {activeQuest&&<button className="quest-hint" onClick={()=>openPanel('journal')}><b><span className="quest-diamond">◆</span>{activeQuest.active?activeQuest.title:'İlk ışık'}</b><span>{!activeQuest.active?'Sığınaktakilerle konuş.':s.zone==='haven'?'Ayrıntılar için dokun.':activeQuest.id==='core'?'Kül kalbini bul.':'Görevini haritada takip et.'}</span></button>}
  {snapshot.tonic>0&&<div className="tonic-badge"><Flame size={15}/> +8 saldırı · {Math.ceil(snapshot.tonic)} sn</div>}{snapshot.mesale>0&&<div className="tonic-badge mesale-badge"><Flame size={15}/> Meşale · {Math.ceil(snapshot.mesale)} sn</div>}
    {!panel&&mod==='dokunma'&&<>{joyStili==='sabit'&&<Joystick engine={engine}/>}<div className="actions"><div className="utility-actions"><button className="round potion" onClick={(e)=>{(e.currentTarget as HTMLElement)?.blur();engine.current?.useItem('potion');}} aria-label={`Can iksiri iç, ${s.inventory.potion||0} adet`} disabled={!s.inventory.potion}><Icon name="flame" item="potion" size={34}/><small>{s.inventory.potion||0}</small></button><button className="round weapon" onClick={(e)=>{(e.currentTarget as HTMLElement)?.blur();engine.current?.toggleWeapon();}} aria-label="Silah değiştir"><Icon name={s.equipment.weapon==='yumruk'?'hand':s.equipment.weapon==='elmesale'?'flame':ITEMS[s.equipment.weapon].menzilli?'bow':'sword'} item={s.equipment.weapon} size={32}/>{/* Sayac KUSANILAN ok turunu gosterir; o bitince motor sade oka dustugu
       icin etiket de ona duser. */}<small>{ITEMS[s.equipment.weapon].menzilli?`YAY (${(s.equipment.ok&&s.inventory[s.equipment.ok])||s.inventory.arrow||0})`:s.equipment.weapon==='yumruk'?'ELLER':s.equipment.weapon==='elmesale'?'MEŞALE':'KILIÇ'}</small></button>{/* Mesale artik silah dongusunde degil, kendi tusunda (F) ve kendi
       dugmesinde: karanlik mekanda silah degistirmek icin dongude dolasmak
       gerekiyordu. */}
      <button className="round mesale" onClick={(e)=>{(e.currentTarget as HTMLElement)?.blur();engine.current?.toggleTorch();}} aria-label="Meşale" disabled={!s.inventory.torch&&!s.inventory.elmesale}><Icon name="flame" item="torch" size={30}/><small>{snapshot.mesale>0?(s.equipment.weapon==='elmesale'?'ELDE':Math.ceil(snapshot.mesale)+' sn'):s.inventory.torch||0}</small></button>
      <button className="round dodge" onClick={(e)=>{(e.currentTarget as HTMLElement)?.blur();engine.current?.dodge();}} aria-label="Kaçın" disabled={snapshot.dodgeCooldown>0}><Wind size={25}/>{snapshot.dodgeCooldown>0&&<small>{snapshot.dodgeCooldown.toFixed(1)}</small>}</button></div><button className="round attack" aria-label="Saldır, basılı tutarak tekrarla" onPointerDown={e=>{e.currentTarget.setPointerCapture(e.pointerId);if(engine.current)engine.current.input.attack=true;}} onPointerUp={()=>{if(engine.current)engine.current.input.attack=false;}} onPointerCancel={()=>{if(engine.current)engine.current.input.attack=false;}} onLostPointerCapture={()=>{if(engine.current)engine.current.input.attack=false;}}><UI ad="saldiri" size={38}/><span>SALDIR</span></button></div>{snapshot.near&&<button className="interact available" onClick={(e)=>{(e.currentTarget as HTMLElement)?.blur();engine.current?.interact();}}>{snapshot.near.type==='npc'?<UI ad="konusma" size={22}/>:snapshot.near.type==='chest'?<UI ad="sandik" size={22}/>:snapshot.near.type==='yatak'?<UI ad="uyku" size={22}/>:<Hand size={18}/>}<span>{snapshot.near.type==='npc'?`${snapshot.near.name} ile konuş`:snapshot.near.asset?.includes('Table')?'Zanaat masasını kullan':snapshot.near.name||'Aç'}</span></button>}</>}
   <div className={`save-mark ${snapshot.saveStatus==='Kayıt yapılamadı'?'save-error':''}`}><Save size={12}/>{snapshot.saveStatus==='Kayıt yapılamadı'?'Kayıt yapılamıyor':'Cihaza otomatik kayıt'}</div>
   </>}
   {zoneFlash&&<div className="zone-flash" role="status" aria-live="polite">{zoneFlash}</div>}
  <div className="surum">v{SURUM} <span className="asama">{ASAMA}</span></div>
  {notice&&<div className="game-notice" role="status" aria-live="polite"><span>◆</span>{notice}</div>}
   <Dialog open={panel!==null} onOpenChange={open=>{if(!open&&panel!=='death')closePanel();}}><DialogContent className={`game-dialog ${panel==='dialogue'?'conversation':''} ${panel==='ending'?'ending-dialog':''}`} showCloseButton={false}><header className="panel-header"><div><span className="eyebrow">{panel==='dialogue'?talk.role:panel==='sandik'?'Al ve koy · sandıkta bıraktığın durur':panel==='shop'?`${s.gold} altın · ${satici==='obruk'?'Kimseyle paylaşılmayan kiler':'Muhafız malzemeleri'}`:panel==='journal'?`${s.gun}. gün · depo ${s.erzak.yiyecek}/${s.erzak.su}`:panel==='crafting'?`${s.gold} altın`:panel==='ending'?'BİRİNCİ BÖLÜM TAMAMLANDI':'KÜL VE YEMİN'}</span><DialogTitle>{title}</DialogTitle></div>{panel!=='death'&&<button className="close-panel" onClick={closePanel} aria-label="Kapat"><X size={22}/></button>}</header><DialogDescription className="sr-only">{panel==='dialogue'?'Bir yanıt seç. Tercihlerin hikâyeyi değiştirir.':'Oyun bu ekran açıkken duraklatılır.'}</DialogDescription><div className="panel-body">
   {panel==='dialogue'&&<div className="dialogue-layout"><div className="speech"><Portrait id={talk.portrait}/><p>{talk.text}</p></div><div className="choices">{talk.choices.map((choice,i)=><button key={choice.action+String(i)} disabled={choice.disabled} onClick={()=>applyChoice(choice.action)}><span className="choice-number">{String(i+1).padStart(2,'0')}</span><span>{choice.label}{choice.note&&<small>{choice.note}</small>}</span><ChevronRight size={18}/></button>)}</div></div>}
   {/* SANDIK: iki yonlu kap. Sol sutun sandigin icindekiler, sag sutun heybe;
       bir kareye dokunmak o esyayi karsi tarafa gecirir (Shift ile hepsi).
       Otomatik yagma kaldirildi - sandikta birakilan kalir. */}
   {panel==='sandik'&&(()=>{
    const kap=s.sandiklar?.[sandikId]||{};const altin=s.sandikAltin?.[sandikId]||0;
    const gec=(id:ItemId,nereden:'sandik'|'heybe',hepsi:boolean)=>{
     const g=engine.current!;const st=g.state;
     const kaynak=nereden==='sandik'?(st.sandiklar![sandikId]||{}):st.inventory;
     const hedef=nereden==='sandik'?st.inventory:(st.sandiklar![sandikId]||(st.sandiklar![sandikId]={}));
     /* Kusanilan esya sandiga konamaz: cikarinca oyuncu silahsiz kalirdi. */
     /* Yalnizca KUSANILAN silah/zirh/yuzuk birakilamaz. Kusanilan OK TURU de
        equipment icinde duruyor ama o mermi: yigin sandiga konabilmeli,
        yoksa oku hic depolayamiyorsun. */
     if(nereden==='heybe'&&[st.equipment.weapon,st.equipment.armor,st.equipment.ring].includes(id)){showNotice('Kuşandığın eşyayı bırakamazsın.');return;}
     /* Dokunma TAMAMINI tasir. Once tersiydi (1 adet, shift ile hepsi) ama
        35 oku tek tek almak iskenceydi ve dokunmatikte shift yok - yigini
        tasimanin yolu kalmiyordu. Tek adet icin shift/alt. */
     tasi(kaynak,hedef,id,hepsi?1:99);g.sound('select');g.save();g.emit();};
    const kutu=(baslik:string,icerik:Partial<Record<ItemId,number>>,nereden:'sandik'|'heybe')=>
     <div className="sandik-sutun"><h3>{baslik}</h3><div className="item-grid">
      {(Object.keys(icerik) as ItemId[]).filter(id=>icerik[id]).map(id=>
       <button key={id} className={`item-cell ${ITEMS[id].rarity==='Eşsiz'?'rare':''} ${nereden==='heybe'&&[s.equipment.weapon,s.equipment.armor,s.equipment.ring].includes(id)?'kusanik':''}`}
        onClick={ev=>gec(id,nereden,ev.shiftKey||ev.altKey)}
        aria-label={`${ITEMS[id].name}, ${icerik[id]} adet, ${nereden==='sandik'?'hepsini al':'hepsini sandığa koy'}`}>
        <Icon name={ITEMS[id].icon} item={id} size={32}/><span>{ITEMS[id].name}</span>
        <small>{icerik[id]!>1?'×'+icerik[id]:ITEMS[id].rarity}</small></button>)}
      {!Object.keys(icerik).length&&<p className="muted">Boş.</p>}
     </div></div>;
    return <div className="sandik-layout">
     {kutu('Sandık',kap,'sandik')}
     <div className="sandik-ok"><ArrowLeftRight size={22}/><small>dokun: hepsi · shift: 1 adet</small>
      {altin>0&&<button className="text-button" onClick={()=>{const g=engine.current!;g.state.gold+=altin;g.state.sandikAltin![sandikId]=0;g.sound('coin');g.save();g.emit();showNotice(altin+' altın aldın.');}}><Coins size={16}/>{altin} altın al</button>}</div>
     {kutu('Heybe',s.inventory,'heybe')}
    </div>;})()}
   {panel==='inventory'&&<><div className="inventory-heading"><span><Coins size={18}/>{s.gold} altın</span><span>{Object.keys(s.inventory).length} eşya türü</span></div><div className="inventory-layout"><div className="item-grid">{(Object.keys(s.inventory)as ItemId[]).map(id=><button key={id} className={`item-cell ${selected===id?'selected':''} ${ITEMS[id].rarity==='Eşsiz'?'rare':''}`} onClick={()=>{setSelected(id);engine.current?.sound('select')}} aria-label={`${ITEMS[id].name}, ${s.inventory[id]} adet`}><Icon name={ITEMS[id].icon} item={id} size={32}/><span>{ITEMS[id].name}</span><small>{Object.values(s.equipment).includes(id)?'KUŞANILDI':s.inventory[id]!>1?'×'+s.inventory[id]:ITEMS[id].rarity}</small></button>)}</div><aside className="item-detail"><div className="item-emblem"><Icon name={ITEMS[selected].icon} size={64} item={selected}/></div><span className="eyebrow">{ITEMS[selected].rarity}</span><h3>{ITEMS[selected].name}</h3><p>{ITEMS[selected].description}</p>{s.inventory[selected]&&ITEMS[selected].kind!=='quest'&&ITEMS[selected].kind!=='material'&&<button className="primary text-button" onClick={()=>selectItem(selected)} disabled={Object.values(s.equipment).includes(selected)}>{Object.values(s.equipment).includes(selected)?'Kuşanıldı':ITEMS[selected].kind==='consumable'?'Kullan':'Kuşan'}</button>}{ITEMS[selected].kind==='quest'&&<p className="muted">İlgili kişiyle konuşarak kullanılır.</p>}{ITEMS[selected].kind==='material'&&<p className="muted">Hammadde. Üretim tezgâhında harcanır, tüccara satılabilir.</p>}</aside></div></>}
   {panel==='character'&&<><div className="character-summary"><Portrait/><div><h3>Yeminini sen yaz.</h3><p>Seviye {s.level} / 5 · {s.level===5?'En yüksek seviye':`${s.xp} / ${XP[s.level]} deneyim`}</p></div><span className="point-count">{s.points}<small>YETENEK PUANI</small></span></div><div className="stat-row"><span><Heart/> {st.maxHp}<small>CAN</small></span><span><Sword/> {st.attack}<small>SALDIRI</small></span><span><Shield/> {st.defense}<small>SAVUNMA</small></span></div><div className="skill-list">{([{key:'power',name:'Keskin el',description:'Her puan +4 saldırı.',icon:Swords},{key:'vigor',name:'Sağlam yürek',description:'Her puan +18 azami can.',icon:Heart},{key:'agility',name:'Hafif adım',description:'Kaçınma 0,25 sn daha hızlı dolar.',icon:Wind}]as const).map(skill=><div key={skill.key}><skill.icon size={24}/><span><b>{skill.name} <small>· {s.skills[skill.key]}</small></b><p>{skill.description}</p></span><button disabled={!s.points} aria-label={`${skill.name} geliştir`} onClick={()=>{if(spendPoint(engine.current!.state,skill.key)){engine.current!.sound('level');engine.current!.save();engine.current!.emit()}}}><Plus size={20}/></button></div>)}</div></>}
   {panel==='journal'&&<Tabs defaultValue="quests"><TabsList className="journal-tabs"><TabsTrigger value="quests">Görevler</TabsTrigger><TabsTrigger value="sonlar">Yollar</TabsTrigger><TabsTrigger value="map">Harita</TabsTrigger><TabsTrigger value="history">Kararlar</TabsTrigger></TabsList><TabsContent value="quests"><div className="quest-list">{quests.map(q=><article key={q.id} className={q.done?'done':''}><span>{q.done?<Check size={20}/>:<Compass size={20}/>}</span><div><h3>{q.title}<small>{q.done?'TAMAMLANDI':q.active?'DEVAM EDİYOR':'HENÜZ ALINMADI'}</small></h3><p>{q.active||q.done?q.step:'Sığınaktaki ilgili kişiyle konuş.'}</p></div></article>)}</div></TabsContent><TabsContent value="sonlar"><div className="quest-list">{finalDurum(s).map(f=>
   <article key={f.id} className={f.hazir?'done':''}>
    <span>{f.hazir?<Check size={20}/>:<Compass size={20}/>}</span>
    <div><h3>{f.ad}<small>{s.ending===f.id?'SEÇİLDİ':f.hazir?'HAZIR · Undur ile konuş':`${f.tamam}/${f.toplam}`}</small></h3>
     <p>{f.ozet}</p>
     <ul style={{margin:'6px 0 0',padding:0,listStyle:'none'}}>{f.adimlar.map(a=>
      <li key={a.id} style={{opacity:a.bitti?.55:1,color:a.bitti?'#8fae7e':'#c4a377',fontSize:'12px',lineHeight:1.5}}>
       {a.bitti?'✓ ':'· '}{a.baslik}{a.bitti?'':` — ${a.ipucu}`}</li>)}</ul>
    </div></article>)}</div></TabsContent><TabsContent value="map"><MapView state={s}/></TabsContent><TabsContent value="history"><ol className="history-list">{s.journal.slice(0,20).map((line,i)=><li key={i}>{line}</li>)}</ol></TabsContent></Tabs>}
   {panel==='shop'&&<div className="shop-list">{SATICILAR[satici].liste.map(id=>{const p=fiyat(s,id,satici);return <article key={id}><Icon name={ITEMS[id].icon} item={id} size={32}/><div><b>{ITEMS[id].name}{id==='arrow'?' (10 Adet)':''}</b><p>{ITEMS[id].description}</p></div><button className="text-button" disabled={s.gold<p||(ITEMS[id].kind!=='consumable'&&!!s.inventory[id])} onClick={()=>{if(buy(engine.current!.state,id,satici)){if(ITEMS[id].menzilli||id==='arrow'){const y=(Object.keys(s.inventory)as ItemId[]).find(k=>ITEMS[k].menzilli);if(y)s.equipment.weapon=y;}engine.current!.sound('coin');engine.current!.save();engine.current!.emit();showNotice(ITEMS[id].name+' alındı.')}}}>{ITEMS[id].kind!=='consumable'&&s.inventory[id]?<Check size={18}/>:<><Coins size={16}/>{p}</>}</button></article>})}</div>}
   {panel==='crafting'&&<div className="shop-list">{TARIFLER.map(t=>{const d=tarifDurum(engine.current?.state??s,t);return <article key={t.id}><Icon name={ITEMS[t.id].icon} item={t.id} size={32}/><div><b>{ITEMS[t.id].name}{t.adet>1?` (${t.adet} Adet)`:''}</b><p>{ITEMS[t.id].description}</p><small style={{color:'#c4a377',display:'block',marginTop:'2px'}}>Gerekli: {(Object.entries(t.malzeme) as [ItemId,number][]).map(([id,n],k)=><span key={id} style={{color:(s.inventory[id]||0)>=n?'#c4a377':'#c98a84'}}>{k?' · ':''}{ITEMS[id].name} {s.inventory[id]||0}/{n}</span>)}{t.gold?<span style={{color:s.gold>=t.gold?'#c4a377':'#c98a84'}}>{' · '}{t.gold} Altın</span>:null}</small></div><button className="text-button" disabled={!d.olur} onClick={()=>{const game=engine.current!;/* DIKKAT: `s` emit()'in structuredClone KOPYASI - uzerinde degisiklik yapmak
   gercek state'i degistirmez ve bir sonraki emit'te kaybolur. Uretim eskiden
   tam bu hatayi yapiyordu (olculdu: malzeme arayuzde dusuyor ama
   engine.state'te duruyordu). Diger paneller zaten engine.current!.state
   kullaniyor; tezgah da oyle yapmali. */if(!tarifUygula(game.state,t))return;if(ITEMS[t.id].menzilli||t.id==='arrow'){const y=(Object.keys(s.inventory)as ItemId[]).find(k=>ITEMS[k].menzilli);if(y)s.equipment.weapon=y;}game.sound('level');game.save();game.emit();showNotice(`${t.adet>1?t.adet+' adet ':''}${ITEMS[t.id].name} üretildi.`);}}>{d.zaten?<Check size={18}/>:d.olur?'Üret':'Yetersiz Malzeme'}</button></article>})}</div>}

  {panel==='pause'&&<div className="pause-layout"><div className="pause-status"><Portrait/><h3>{ZONES[s.zone].name}</h3><p>Seviye {s.level} · {Math.floor(s.playtime/60)} dakika</p><small><Save size={14}/>{snapshot.saveStatus||'Bu cihazda kayıtlı'}</small></div><div className="pause-buttons"><button className="primary text-button" onClick={()=>setPanel(null)}><Play size={18}/> Devam et</button><button className="text-button" onClick={()=>{setPanelBack('pause');setPanel('settings')}}><Settings2 size={18}/> Ses ve ayarlar</button><button className="text-button" onClick={()=>{setPanelBack('pause');setPanel('help')}}><BookOpen size={18}/> Kontrol rehberi</button><button className="text-button" onClick={mainMenu}><HomeIcon size={18}/> Kaydet ve menüye dön</button></div></div>}
  {panel==='settings'&&<div className="settings-layout"><div className="audio-settings"><label><span><Music2 size={20}/> Müzik <b>{music}%</b></span><Slider aria-label="Müzik seviyesi" value={[music]} onValueChange={v=>{audio.current?.start();setMusic(Array.isArray(v)?v[0]:v)}} min={0} max={100} step={5}/></label><label><span><Volume2 size={20}/> Ses efektleri <b>{effects}%</b></span><Slider aria-label="Ses efektleri seviyesi" value={[effects]} onValueChange={v=>{audio.current?.start();setEffects(Array.isArray(v)?v[0]:v)}} onValueCommitted={()=>engine.current?.sound('coin')} min={0} max={100} step={5}/></label><button className="text-button" onClick={()=>{audio.current?.start();if(music||effects){setMusic(0);setEffects(0)}else{setMusic(45);setEffects(65)}}}>{music||effects?<VolumeX size={18}/>:<Volume2 size={18}/>} {music||effects?'Tüm sesleri kapat':'Sesleri aç'}</button></div><div className="settings-notes"><div className="yon-secim"><span><Gamepad2 size={18}/> Kontrol</span><div>
  {([['auto','Otomatik'],['dokunma','Dokunmatik'],['klavye','Klavye'],['gamepad','Gamepad']] as const).map(([k,ad])=>
   <button key={k} className={`text-button ${girdiKilit===k?'secili':''}`} onClick={()=>setGirdiKilit(k)}>{ad}</button>)}
  </div></div>
  <p className="muted" style={{marginTop:'-6px'}}>Otomatik: cihazını algılar, son kullandığın girdiye geçer. Şu an: <b>{mod==='dokunma'?'dokunmatik':mod==='gamepad'?'gamepad':'klavye'}</b>.</p>
  <div className="yon-secim"><span><Hand size={18}/> Joystick</span><div>
  <button className={`text-button ${joyStili==='sabit'?'secili':''}`} onClick={()=>setJoyStili('sabit')}>Sabit</button>
  <button className={`text-button ${joyStili==='gezici'?'secili':''}`} onClick={()=>setJoyStili('gezici')}>Parmağının altında</button>
 </div></div>
  <p className="muted" style={{marginTop:'-6px'}}>Sabit: ekranın sol altında durur. Parmağının altında: nereye dokunursan orada belirir.</p>
  <div className="yon-secim"><span><Smartphone size={18}/> Ekran yönü</span><div>
  <button className={`text-button ${yon==='yatay'?'secili':''}`} onClick={()=>setYon('yatay')}>Yatay</button>
  <button className={`text-button ${yon==='dikey'?'secili':''}`} onClick={()=>setYon('dikey')}>Dikey</button>
 </div></div><button className="text-button" onClick={fullscreen}><Maximize size={18}/> Tam ekran</button><p>İlerleme bu cihazdaki tarayıcıya kaydedilir. Tarayıcı verilerini temizlemek kaydı siler.</p><p>Müzik ve efektler ilk dokunuştan sonra başlar. Başka bir uygulamaya geçtiğinde oyun duraklar.</p></div></div>}
  {panel==='help'&&<div className="help-grid">{mod==='dokunma'
    ?<article><Footprints/><h3>Hareket et</h3><p>Sol alandaki halkayı sürükle. Haritayı görev defterinden aç.</p></article>
    :mod==='gamepad'
    ?<article><Gamepad2/><h3>Hareket et</h3><p>Sol çubuk ya da D-pad. <b>A</b> saldır, <b>B</b> kaçın, <b>X</b> etkileşim, <b>Y</b> meşale, <b>LB</b> iksir, <b>RB</b> silah, <b>Start</b> menü. Menülerde yön tuşlarıyla gez, <b>A</b> ile seç.</p></article>
    :<article><Footprints/><h3>Hareket et</h3><p><b>WASD</b> ya da yön tuşları. <b>J</b> saldır, <b>K</b> kaçın, <b>E</b> etkileşim, <b>Q</b> silah, <b>F</b> meşale. Paneller: <b>I</b> heybe, <b>C</b> karakter, <b>L</b> defter, <b>Esc</b> menü.</p></article>}<article><Swords/><h3>Savaş</h3><p>Saldır düğmesini basılı tut. Yakındaki düşmana otomatik yönelirsin.</p></article><article><Wind/><h3>Kaçın</h3><p>Rüzgâr düğmesiyle atıl. Kırmızı çember, düşmanın saldırmak üzere olduğunu gösterir.</p></article><article><Hand/><h3>Etkileşime geç</h3><p>Kişiye, sandığa veya kapıya yaklaş. Ortadaki düğmeye dokun.</p></article><article><Flame/><h3>Meşale yak</h3><p>Karanlık yerlerde alev düğmesi (masaüstünde <b>F</b>) meşaleyi yakar, eline alır ve kemerine asar. Silah değiştirmek ayrı tuşta (<b>Q</b>).</p></article><article><Heart/><h3>Hazırlan</h3><p>Kalpten iksir iç. Heybeden ekipman kuşan; portreye dokunarak yeteneklerini geliştir.</p></article><article><ScrollText/><h3>Karar ver</h3><p>Üç görevi tamamla. Diyaloglar sırasında zaman durur; seçiminin sonucunu düşün.</p></article></div>}
  {panel==='credits'&&<div className="credits"><Flame size={38}/><h3>Kül ve Yemin</h3><p>Birinci bölüm · Son Sığınak</p><p>Piksel görseller: Craftpix — Free Top-Down Roguelike Game Kit.<br/>Başlık yazı tipi: Cinzel, SIL Open Font License.<br/>Müzik: bu oyun için hazırlanmış sığınak ve zindan temaları.</p><p className="muted">Dokunmatik, tek oyunculu RPG prototipi. Ekipman etkileri istatistiklere uygulanır; karakterin görünümü sabittir.</p></div>}
  {panel==='death'&&<div className="death-content"><Flame size={42}/><p>Mirna’nın ateşine geri dönebilirsin.<br/>Eşyaların, görevlerin ve kararların sende kalır.<br/>Altınının %10’u yolda kaybolur.</p><button className="primary text-button" onClick={()=>{engine.current!.respawn();setPanel(null)}}>Sığınakta uyan</button></div>}
  {panel==='ending'&&<div className="ending-content"><Flame size={40}/><p className="ending-prose">{sonMetni(s)}</p><div className="ending-decisions"><p><Heart size={18}/>{s.flags.medicine==='rauf'?'Rauf’a ikinci bir hayat verdin.':'Sığınağın hastalarına umut oldun.'}</p><p><Shield size={18}/>{s.flags.fugitive==='protected'?'Bir sırrı korumayı adaletten üstün tuttun.':'Rauf’un hesap vermesini seçtin.'}</p>{yeminler(s).map(y=><p key={y.kime+y.soz}><Flame size={18}/>{y.kime}: “{y.soz}” — {y.durum==='tutuldu'?'tutuldu':y.durum==='bozuldu'?'bozuldu':'ikinci bölümde sınanacak'}</p>)}</div><p className="muted">Seviye {s.level} · {quests.filter(q=>q.done).length}/{quests.length} görev · {Math.floor(s.playtime/60)} dakika</p><div className="ending-buttons"><button className="primary text-button" onClick={()=>setPanel(null)}>Sığınağı keşfetmeye devam et</button><button className="text-button" onClick={mainMenu}>Ana menü</button></div></div>}
  </div></DialogContent></Dialog>
  <AlertDialog open={confirmNew} onOpenChange={setConfirmNew}><AlertDialogContent className="new-game-dialog"><AlertDialogTitle>Yeni bir yemin?</AlertDialogTitle><AlertDialogDescription>Bu cihazdaki mevcut yolculuğun yerini yeni bir kayıt alacak.</AlertDialogDescription><div className="confirm-actions"><AlertDialogCancel>Vazgeç</AlertDialogCancel><AlertDialogAction onClick={()=>launch(true)}>Yeni yolculuğa başla</AlertDialogAction></div></AlertDialogContent></AlertDialog>
  {/* Kontrol ipuclari: dokunmatik dugmeler yoksa oyuncu tuslari nereden
      bilecek? Sade bir serit, panel acikken gizleniyor. */}
  {!menu&&!panel&&mod!=='dokunma'&&tuslarAcik&&<div className="tus-liste" aria-hidden="true">
   {(mod==='gamepad'
    ?[['Sol çubuk','hareket'],['A','saldır'],['B','kaçın'],['X','etkileşim'],['Y','meşale'],['LB','iksir'],['RB','silah'],['Start','menü']]
    :[['WASD','hareket'],['Space','saldır'],['Shift','kaçın'],['E','etkileşim'],['Q','silah'],['F','meşale'],['I','heybe'],['Esc','menü'],['H','bu listeyi gizle']]
   ).map(([t,a])=><span key={t}><b>{t}</b><i>{a}</i></span>)}
  </div>}
  {portrait&&yon==='yatay'&&mod==='dokunma'&&<div className="rotate-screen"><Smartphone size={48}/><h2>Telefonunu yatay çevir</h2><p>Kül ve Yemin iki elle, yatay oynanır.</p><span>Hikâyen seni bekliyor.</span><button className="text-button dikey-gec" onClick={()=>setYon('dikey')}>Dikey oynamak istiyorum</button></div>}
 </main>
}
