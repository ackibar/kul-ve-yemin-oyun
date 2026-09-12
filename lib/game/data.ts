/** Oyun surumu. Her yayina cikan degisiklikte 0.1 artar: 0.1, 0.2 ... 0.9,
 *  sonra 1.0, 1.1 diye devam eder. Ekranin sol altinda gorunur. */
export const SURUM = '4.2';
/** Gelisim asamasi. Oyun oynanabilir ama icerik ve sistemler (item seti, dil
 *  secenegi, masaustu arayuzu) hala eksik - yani alfa. Beta'ya gecisi bu sabit
 *  tasir; surum numarasiyla ayri tutuldu ki 1.x sayimi bozulmasin. */
export const ASAMA = 'alpha';

// 'forge' (Kul Ocagi) kaldirildi: eski zindan assetleriyle yapilmis tek
// mekandi. Bekci, Kul kalbi ve iki son da onunla birlikte cikti; oyunun
// sonu yeni bir mekanla bastan kurulacak.
export type Zone = 'haven' | 'disari' | 'yikik' | 'magara' | 'cistern';
export type ItemId = 'mizrak'|'balta'|'hancer'|'topuz'|'yemin'|'uzunyay'|'okates'|'okdelici'|'okcengel'|'pelerin'|'ocakz'|'kanm'|'yeminh'|'merhem'|'kavanoz'|'toz'|'tatar'|'kemik'|'yelek'|'gozu'|'bileme'|'yumruk'|'rusty'|'guard'|'ember'|'blood'|'bow'|'leather'|'chain'|'ash'|'copper'|'life'|'wind'|'potion'|'tonic'|'medicine'|'ledger'|'wood'|'torch'|'arrow'|'kurdele';
/** Item alanlari. attack/defense/hp dogrudan stats()'e girer; asagidakiler
 *  motorun tek tek okudugu DAVRANIS bayraklaridir - her yeni item icin kod
 *  yazmak yerine burada tanimlanir.
 *   menzilli   - ok firlatir (yay ailesi). Sprite takimi ve saldiri akisi buna bakar.
 *   hiz        - saldiri suresi carpani (0.7 = %30 daha hizli).
 *   okHasar    - okun hasarina eklenir (zirh/aksesuar).
 *   atesBagisik- ates karesine basinca yanmaz.
 *   altinKat   - toplanan altin carpani.
 *   canGoster  - dusmanlarin can cubugu hasar almadan da gorunur.
 *   menzil     - yakin dovus erisim carpani (1.45 = %45 daha uzak).
 *   arkadan    - dusmanin arkasindan vurusta hasar carpani.
 *   sersemlet  - vurusta dusmani kac saniye durdurur.
 *   okHiz      - okun hiz carpani (menzil de bununla uzar).
 *   yakar      - ok isabet edende kac saniye yanma birakir.
 *   delici     - ok ilk dusmanda durmaz, arkasindakine de gecer.
 *   ceker      - ok isabet edeni oyuncuya dogru ceker.
 *   kulKalkan  - Kul Ovasi can erimesi carpani (0.5 = yarisi).
 *   yavaslik   - yuruyus hizi carpani (0.85 = %15 yavas).
 *   oldurunceCan - her oldurmede kazanilan can.
 *   kurtarma   - can esigin altina dusunce bir kez doldurulan can.
 *   sprite     - bu silahi tutan karakter takimi (characters/1<sprite>).
 *                Yoksa menzilli ise 'bow', degilse 'sword'.
 *   alan       - tek vurusta kac dusmana isabet eder (yoksa 1). Varsayilan
 *                TEK hedef: eskiden her silah menzildeki herkese birden
 *                vuruyordu ve kalabalik savaslar fazla kolaydi. */
export type Item = {id:ItemId;name:string;kind:'weapon'|'armor'|'ring'|'ammo'|'consumable'|'quest';description:string;rarity:'Sıradan'|'Nadir'|'Eşsiz'|'Görev';icon:string;attack?:number;defense?:number;hp?:number;price:number;menzilli?:boolean;hiz?:number;okHasar?:number;atesBagisik?:boolean;altinKat?:number;canGoster?:boolean;menzil?:number;arkadan?:number;sersemlet?:number;okHiz?:number;yakar?:number;delici?:boolean;ceker?:boolean;kulKalkan?:number;yavaslik?:number;oldurunceCan?:number;kurtarma?:number;alan?:number;sprite?:string};
export const ITEMS:Record<ItemId,Item>={
 // Silahsiz mod bir "esya" olarak tutuluyor: boylece silah secme ekraninda
 // digerleriyle ayni sirada cikiyor ve kusanma akisi degismiyor.
 yumruk:{id:'yumruk',name:'Çıplak eller',kind:'weapon',description:'Silah yok. Zayıf ama hızlı. +2 saldırı.',rarity:'Sıradan',icon:'hand',attack:2,price:0},
 rusty:{id:'rusty',name:'Yıpranmış kılıç',kind:'weapon',description:'Sığınaktan kalan son hatıra. +10 saldırı.',rarity:'Sıradan',icon:'sword',attack:10,price:0},
 guard:{id:'guard',name:'Muhafız kılıcı',kind:'weapon',description:'Alf’in sözü kadar sağlam. +17 saldırı.',rarity:'Nadir',icon:'sword',attack:17,price:65},
 ember:{id:'ember',name:'Köz kılıcı',kind:'weapon',description:'+23 saldırı. Vuruşlar 3 saniye boyunca yakar.',rarity:'Eşsiz',icon:'flame',attack:23,price:110},
 blood:{id:'blood',name:'Gece dişi',kind:'weapon',description:'+19 saldırı. Her vuruşta 3 can yeniler.',rarity:'Eşsiz',icon:'sword',attack:19,price:95},
 bow:{id:'bow',name:'Avcı yayı',kind:'weapon',description:'+18 saldırı. Menzilli ok fırlatır.',rarity:'Nadir',icon:'bow',attack:18,price:75,menzilli:true},
 tatar:{id:'tatar',name:'Tatar yayı',kind:'weapon',description:'+14 saldırı. Avcı yayından çok daha hızlı atar.',rarity:'Nadir',icon:'bow',attack:14,price:70,menzilli:true,hiz:.6},
 arrow:{id:'arrow',name:'Ok',kind:'consumable',description:'Avcı yayı ile menzilli atış yapmak için kullanılır.',rarity:'Sıradan',icon:'sword',price:2},
 mizrak:{id:'mizrak',name:'Kül mızrağı',kind:'weapon',description:'+15 saldırı. Erişimi %45 daha uzun; güvenli mesafeden vurursun.',rarity:'Nadir',icon:'sword',attack:15,price:68,menzil:1.45},
 balta:{id:'balta',name:'Yarma baltası',kind:'weapon',description:'+26 saldırı. Tek savuruşta 3 düşmanı birden yarar. Ağır: vuruşlar %35 daha yavaş.',rarity:'Nadir',icon:'sword',attack:26,price:88,hiz:1.35,alan:3,sprite:'balta'},
 hancer:{id:'hancer',name:'Sessiz hançer',kind:'weapon',description:'+12 saldırı, iki kat hızlı. Arkadan vuruşta çift hasar.',rarity:'Nadir',icon:'sword',attack:12,price:72,hiz:.5,arkadan:2},
 topuz:{id:'topuz',name:'Kül topuzu',kind:'weapon',description:'+20 saldırı. Her vuruş düşmanı kısa süre sersemletir.',rarity:'Eşsiz',icon:'sword',attack:20,price:105,sersemlet:.6},
 yemin:{id:'yemin',name:'Yemin kılıcı',kind:'weapon',description:'+21 saldırı. Rauf yaşıyorsa 6 saldırı daha; yemin iki kişiyi de taşır.',rarity:'Eşsiz',icon:'sword',attack:21,price:120},
 uzunyay:{id:'uzunyay',name:'Uzun yay',kind:'weapon',description:'+22 saldırı. Ok daha hızlı ve uzağa gider; çekişi yavaştır.',rarity:'Eşsiz',icon:'bow',attack:22,price:115,menzilli:true,hiz:1.3,okHiz:1.5},
 okates:{id:'okates',name:'Ateş oku',kind:'ammo',description:'İsabet ettiğini 3 saniye yakar.',rarity:'Nadir',icon:'flame',price:5,yakar:3},
 okdelici:{id:'okdelici',name:'Delici ok',kind:'ammo',description:'İlk düşmanda durmaz, arkasındakine de geçer.',rarity:'Nadir',icon:'bow',price:6,delici:true},
 okcengel:{id:'okcengel',name:'Çengelli ok',kind:'ammo',description:'İsabet ettiğini sana doğru çeker.',rarity:'Nadir',icon:'bow',price:6,ceker:true},
 leather:{id:'leather',name:'Gezgin ceketi',kind:'armor',description:'Her darbeyi 2 puan hafifletir.',rarity:'Sıradan',icon:'shirt',defense:2,price:0},
 chain:{id:'chain',name:'Halka zırh',kind:'armor',description:'+5 savunma. Pasın altında hâlâ sağlam.',rarity:'Nadir',icon:'shield',defense:5,price:50},
 pelerin:{id:'pelerin',name:'Kül pelerini',kind:'armor',description:'+4 savunma. Kül Ovası’nda canın yarı hızda erir.',rarity:'Nadir',icon:'shirt',defense:4,price:64,kulKalkan:.5},
 ocakz:{id:'ocakz',name:'Ocak zırhı',kind:'armor',description:'+11 savunma, +15 azami can. Ağırlığı seni %15 yavaşlatır.',rarity:'Eşsiz',icon:'shield',defense:11,hp:15,price:130,yavaslik:.85},
 kemik:{id:'kemik',name:'Kemik göğüslük',kind:'armor',description:'+6 savunma, +10 azami can. Ateş seni yakmaz.',rarity:'Nadir',icon:'shield',defense:6,hp:10,price:70,atesBagisik:true},
 yelek:{id:'yelek',name:'Avcı yeleği',kind:'armor',description:'+3 savunma. Attığın her ok 4 fazla hasar verir.',rarity:'Nadir',icon:'shirt',defense:3,price:58,okHasar:4},
 ash:{id:'ash',name:'Kül zırhı',kind:'armor',description:'+8 savunma, +20 azami can.',rarity:'Eşsiz',icon:'shield',defense:8,hp:20,price:100},
 copper:{id:'copper',name:'Bakır yüzük',kind:'ring',description:'+3 saldırı. İçinde küçük bir yemin saklı.',rarity:'Sıradan',icon:'ring',attack:3,price:25},
 life:{id:'life',name:'Yaşam halkası',kind:'ring',description:'+25 azami can.',rarity:'Nadir',icon:'heart',hp:25,price:55},
 wind:{id:'wind',name:'Rüzgâr mührü',kind:'ring',description:'Kaçınma 0,6 saniye daha hızlı dolar.',rarity:'Nadir',icon:'wind',price:60},
 kanm:{id:'kanm',name:'Kan mührü',kind:'ring',description:'Öldürdüğün her düşman sana 8 can verir.',rarity:'Eşsiz',icon:'heart',price:90,oldurunceCan:8},
 yeminh:{id:'yeminh',name:'Yemin halkası',kind:'ring',description:'Canın üçte birin altına düşerse bir kez 40 can dolar. Her bölgede yenilenir.',rarity:'Eşsiz',icon:'ring',price:100,kurtarma:40},
 gozu:{id:'gozu',name:'Kül gözü',kind:'ring',description:'Düşmanların canını görürsün. Bulduğun altın %10 artar.',rarity:'Nadir',icon:'gem',price:48,altinKat:1.1,canGoster:true},
 merhem:{id:'merhem',name:'Sargı merhemi',kind:'consumable',description:'12 saniye boyunca her saniye 6 can. Kaçarken iyileşirsin.',rarity:'Nadir',icon:'potion',price:22},
 kavanoz:{id:'kavanoz',name:'Köz kavanozu',kind:'consumable',description:'Baktığın yöne fırlatılır; düştüğü yerde patlar ve yakar.',rarity:'Nadir',icon:'flame',price:26},
 toz:{id:'toz',name:'Kül tozu',kind:'consumable',description:'8 saniye boyunca düşmanlar seni göremez.',rarity:'Nadir',icon:'wind',price:24},
 bileme:{id:'bileme',name:'Bileme taşı',kind:'consumable',description:'30 saniye boyunca %25 daha hızlı vurursun.',rarity:'Nadir',icon:'sword',price:18},
 potion:{id:'potion',name:'Can iksiri',kind:'consumable',description:'45 can yeniler. Savaş sırasında da içilebilir.',rarity:'Sıradan',icon:'potion',price:12},
 tonic:{id:'tonic',name:'Köz toniği',kind:'consumable',description:'20 saniye boyunca +8 saldırı.',rarity:'Nadir',icon:'flame',price:20},
 wood:{id:'wood',name:'Odun',kind:'consumable',description:'Ateşin yanına gidip yakarak meşale yapabilirsin.',rarity:'Sıradan',icon:'book',price:5},
 torch:{id:'torch',name:'Meşale',kind:'consumable',description:'60 saniye boyunca karanlık zindanları aydınlatır.',rarity:'Nadir',icon:'flame',price:15},
 medicine:{id:'medicine',name:'Son ilaç',kind:'quest',description:'Tek bir doz. Mirna’nın hastaları mı, yaralı kaçak mı?',rarity:'Görev',icon:'potion',price:0},
 ledger:{id:'ledger',name:'Nöbet defteri',kind:'quest',description:'Ocak muhafızlarının yemin defteri. Rauf’un adı çizili. Alf bunu bekliyor.',rarity:'Görev',icon:'book',price:0},
 kurdele:{id:'kurdele',name:'Kırmızı kurdele',kind:'quest',description:'Rauf’un bileğinden. Kızınındı. Alf bunu hiç görmedi.',rarity:'Görev',icon:'ring',price:0},
};
export const ZONES:Record<Zone,{name:string;subtitle:string;danger:string}>={haven:{name:'Son Sığınak',subtitle:'Ateşin hâlâ yandığı yer',danger:'Güvenli bölge'},disari:{name:'Kül Ovası',subtitle:'Örtünün altında kalan dünya',danger:'Ölümcül · uzun kalma'},yikik:{name:'Yıkık Ev',subtitle:'Külün giremediği tek oda',danger:'Kapalı · güvenli'},magara:{name:'Sarnıç Ağzı',subtitle:'Sığınağın altındaki ilk karanlık',danger:'Tenha'},cistern:{name:'Unutulmuş Sarnıç',subtitle:'Taşların hatırladığı sırlar',danger:'Seviye 1–3'}};
export interface State {version:1;started:boolean;zone:Zone;x:number;y:number;hp:number;xp:number;level:number;gold:number;points:number;skills:{power:number;vigor:number;agility:number};inventory:Partial<Record<ItemId,number>>;equipment:{weapon:ItemId;armor:ItemId;ring:ItemId|null;ok?:ItemId};flags:Record<string,boolean|string>;opened:string[];killed:string[];journal:string[];playtime:number;ending:string|null;}
export const XP=[0,100,260,490,790];
export const newState=():State=>({version:1,started:true,zone:'haven',x:15*16,y:14*16,hp:100,xp:0,level:1,gold:18,points:0,skills:{power:0,vigor:0,agility:0},inventory:{yumruk:1,rusty:1,leather:1,potion:3},equipment:{weapon:'rusty',armor:'leather',ring:null,ok:'arrow'},flags:{},opened:[],killed:[],journal:['Son Sığınak’a vardın. Önce şifacı Mirna ile konuş.'],playtime:0,ending:null});
export function stats(s:State){const weapon=ITEMS[s.equipment.weapon],armor=ITEMS[s.equipment.armor],ring=s.equipment.ring?ITEMS[s.equipment.ring]:null;return {maxHp:100+(s.level-1)*12+s.skills.vigor*18+(armor.hp||0)+(ring?.hp||0),attack:(weapon.attack||0)+(s.equipment.weapon==='yemin'&&Number(s.flags.raufCan||0)>0?6:0)+(ring?.attack||0)+(s.level-1)*2+s.skills.power*4,defense:armor.defense||0,dodge:Math.max(.65,2.2-s.skills.agility*.25-(s.equipment.ring==='wind'?.6:0))}}
export function addItem(s:State,id:ItemId,count=1){s.inventory[id]=(s.inventory[id]||0)+count;}
export function removeItem(s:State,id:ItemId){if(!s.inventory[id])return false;s.inventory[id]!--;if(!s.inventory[id])delete s.inventory[id];return true;}
export function gainXp(s:State,n:number){s.xp+=n;let leveled=false;while(s.level<5&&s.xp>=XP[s.level]){s.level++;s.points++;leveled=true;}if(leveled){s.hp=stats(s).maxHp;s.journal.unshift(`Seviye ${s.level}: yeni bir yetenek puanı kazandın.`)}return leveled;}
export function equip(s:State,id:ItemId){if(!s.inventory[id])return false;const kind=ITEMS[id].kind;if(kind!=='weapon'&&kind!=='armor'&&kind!=='ring'&&kind!=='ammo')return false;if(kind==='ammo')s.equipment.ok=id;else s.equipment[kind]=id;s.hp=Math.min(s.hp,stats(s).maxHp);return true;}
export function spendPoint(s:State,key:keyof State['skills']){if(s.points<1||!['power','vigor','agility'].includes(key))return false;s.points--;s.skills[key]++;if(key==='vigor')s.hp+=18;return true;}
export function buy(s:State,id:ItemId){const item=ITEMS[id];if(!['potion','tonic','bileme','merhem','kavanoz','toz','chain','copper','guard','bow','arrow','tatar','kemik','yelek','gozu','mizrak','balta','hancer','topuz','pelerin','okates','okdelici','okcengel'].includes(id)||s.gold<item.price)return false;if(item.kind!=='consumable'&&s.inventory[id])return false;s.gold-=item.price;addItem(s,id,id==='arrow'?10:ITEMS[id].kind==='ammo'?6:1);return true;}
export function questList(s:State){return [
 {id:'medicine',title:'Bir doz umut',done:!!s.flags.medicineDone,active:!!s.flags.medicineStarted,step:s.flags.medicineDone?(s.flags.medicine==='rauf'?'Rauf’u kurtardın. Mirna kararını öğrendi.':'İlaç sığınağın hastalarına ulaştı.'):s.flags.medicine==='rauf'?'Kararını Mirna’ya anlat.':s.inventory.medicine?'İlacı Mirna’ya götür veya yaralı Rauf’u ver.':'Sarnıcın kuzeydoğu odasındaki ilacı bul.'},
 {id:'ledger',title:'Defterdeki isim',done:!!s.flags.ledgerDone,active:!!s.flags.ledgerStarted,step:s.flags.ledgerDone?(s.flags.fugitive==='protected'?'Rauf’u sırrını korudun.':'Rauf’u muhafızlara teslim ettin.'):s.inventory.ledger?'Defteri Alf’e götür.': 'Sarnıcın doğusunda Rauf’u bul ve defteri al.'},
 // Istege bagli: Lin'in atesi ve yukarida bekleyen agabeyi. Ana sonu kilitlemez.
 {id:'ates',title:'Sönmeyen ateş',done:s.flags.ayaz==='indi',active:!!s.flags.nil||!!s.flags.ayaz,step:s.flags.ayaz==='indi'?'Tiga sığınağa indi. Lin’in ateşi yanmaya devam ediyor.':s.flags.ayaz==='kaldi'?'Tiga Yıkık Ev’de kalmayı seçti. Sara’yı bekliyor.':s.flags.ayaz?'Tiga Yıkık Ev’de. Onu aşağı inmeye ikna edecek bir sebep bul.':s.flags.sozNil==='verildi'?'Lin’e söz verdin: ağabeyini görürsen ateşin yandığını söyleyeceksin. Kül Ovası’ndaki yıkığa bak.':'Lin’in ağabeyi on bir gündür yukarıda. Kül Ovası’ndaki yıkığa bak.'}
 ]}
/** NPC'nin basinda unlem gosterilsin mi: oyuncunun onunla henuz kapatmadigi
 *  bir isi var demektir. Motor bunu her karede cagirir. */
export function bekleyen(s:State,id:string):boolean{
 switch(id){
  case 'mira':return !s.flags.medicineDone;
  case 'boran':return !s.flags.ledgerDone;
  case 'ekin':return !s.ending;
  case 'rauf':return !s.flags.fugitive;
  case 'tuhn':return !s.flags.tuhn;
  case 'nil':return !s.flags.sozNil;
  case 'selvi':return !s.flags.sozSelvi;
  case 'ayaz':return s.flags.ayaz!=='indi'&&s.flags.ayaz!=='kaldi';
  default:return false;
 }
}
/** Oyuncunun verdigi sozler ve akibetleri. Son ekraninda listelenir.
 *  'acik' = bu bolumde sinanmadi, ikinci bolume tasinir. */
export type YeminDurum='tutuldu'|'bozuldu'|'acik';
export function yeminler(s:State):{kime:string;soz:string;durum:YeminDurum}[]{
 const out:{kime:string;soz:string;durum:YeminDurum}[]=[];
 if(s.flags.sozNil==='verildi')out.push({kime:'Lin',soz:'Ağabeyini görürsem ateşin yandığını söyleyeceğim.',
  durum:s.flags.ayazHaber==='soylendi'?'tutuldu':s.flags.ayaz?'bozuldu':'acik'});
 if(s.flags.sozSelvi==='verildi')out.push({kime:'Elvi',soz:'Kalbi sığınağa bağlayacağım.',
  durum:s.ending==='claim'?'tutuldu':s.ending==='seal'?'bozuldu':'acik'});
 if(s.flags.sozAyaz==='verildi')out.push({kime:'Tiga',soz:'Sara’yı arayacağım.',durum:'acik'});
 if(s.flags.yemin==='nobet')out.push({kime:'Kapıya',soz:'Bu kapıyı ben bekleyeceğim.',durum:'acik'});
 if(s.flags.yemin==='yukari')out.push({kime:'Kapıya',soz:'Yukarıda kalanları arayacağım.',durum:'acik'});
 if(s.flags.yemin==='besle')out.push({kime:'Ocağa',soz:'Onu besleyeceğim; o uyuyacak.',durum:'acik'});
 return out;
}
/** Son ekraninin duz yazisi: sona ve verilen yemine gore. */
export function sonMetni(s:State):string{
 if(s.ending==='seal')return (s.flags.yemin==='nobet'
  ?'Yarık kapandı. Taşların altındaki uğultu sustu. Kapının önünde artık sen duruyorsun; Alf ilk kez arkasını dönüp uyudu. Sığınak eskisi kadar karanlık, ama ilk kez güvenli.'
  :'Yarık kapandı. Taşların altındaki uğultu sustu. Yukarıda kalanların isimleri Undur’un defterinde; sen onları aramaya söz verdin. Sığınak eskisi kadar karanlık, ama ilk kez güvenli.');
 return 'Kalbin ateşi sığınağın damarlarına yayıldı. Ocaklar yandı, karanlık geri çekildi. İlk yemin yenilendi: sen besleyeceksin, o uyuyacak. Beslemeyi bıraktığın gün ne olacağını herkes biliyor, kimse söylemiyor.';
}
export type Choice={label:string;action:string;note?:string;disabled?:boolean};
export type Dialogue={who:string;role:string;portrait:number;text:string;choices:Choice[]};
/** Sohbet agaci: NPC'lerin derin hikayeleri.
 *  Konusma konumu `flags.talk` icinde tutulur ("mira:2" gibi); bos ise NPC'nin
 *  normal gorev diyalogu gosterilir. Her dugum bir metin ve secenekler icerir;
 *  `to` bir sonraki dugum, null ise sohbet biter ve gorev diyaloguna donulur.
 *  Basit tutuldu, sonradan derinlestirilecek. */
export type StoryNode={text:string;choices:{label:string;to:string|null;
 /** Secenek yalnizca bu kosul saglaninca gorunur (baska bir NPC'den ogrenilen bilgi gibi). */
 if?:(s:State)=>boolean}[]};
const AYRIL={label:'Gitmem gerek.',to:null};
export const STORY:Record<string,Record<string,StoryNode>>={ rauf:{
  '1':{text:'Sen de mi geldin? Hep gelirler. Bakma bacağıma, yürüyebiliyorum. Yürüyebiliyordum. Ne istiyorsun benden?',
   choices:[{label:'Neden buradasın?',to:'2'},{label:'Alf seni arıyor.',to:'alf1'},AYRIL]},
  '2':{text:'Kaçtım. Söylemesi kolay. Birlikteydim, nöbetteydim, sonra bir sabah yürüdüm ve durmadım. Sebebini sorarsan gülersin.',
   choices:[{label:'Gülmem. Söyle.',to:'3'},AYRIL]},
  '3':{text:'Kızım. Yedi yaşındaydı. Ben olmadan bir gece bile geçiremezdi, öyle sanıyordum. Bir baba böyle düşünür. Kaçtım ki o yaşasın.',
   choices:[{label:'Şimdi nerede?',to:'4'},AYRIL]},
  '4':{text:'…Kül yağdı. Ben yoldaydım, o yukarıdaydı. Onu kurtarmak için kaçtım ve kaçtığım için oradaydım. İkisini birden nasıl taşıyacağımı bilmiyorum.',
   choices:[{label:'Senin suçun değildi.',to:'5'},{label:'Buraya nasıl indin?',to:'yol'},{label:'Alf seni arıyor.',to:'alf1'},AYRIL]},
  '5':{text:'Öyle mi? Bileğimdeki kurdeleyi görüyor musun? Onundu. Bazı geceler konuşuyor. Biliyorum, konuşmuyor. Ama konuşuyor.',
   choices:[{label:'Buraya nasıl indin?',to:'yol'},{label:'Alf seni arıyor.',to:'alf1'},AYRIL]},
  // Tutarlilik: Rauf siginagin kapisindan degil, Alf'in ACTIGI ocak kapisindan
  // girdi. Alf'in sucu onu asagi indiren yol oldu; defter de o yolda alindi.
  'yol':{text:'Ocak kapısından. Açıktı. On bir yıl kapalı beklettiğimiz kapı ardına kadar açıktı, nöbet odası boştu. Kimin açtığını sonra anladım. Ne kadar aşağı inersem o kadar az kül, dedim. Bacağım burada bitti.',
   choices:[{label:'Defter neden sende?',to:'defter'},{label:'Alf seni arıyor.',to:'alf1'},AYRIL]},
  'defter':{text:'Nöbet odasındaki masada duruyordu, açık. Sayfada benim adım, üstünde bir çizgi. Çizgi bir adamı silmiyor; sadece yeminini yalnız bırakıyor. Aldım ki yeminim yalnız kalmasın.',
   choices:[{label:'Alf seni arıyor.',to:'alf1'},AYRIL]},
  'alf1':{text:'Alf… Demek hâlâ arıyor. O beni asla affetmez, biliyorum. Onun için kaçmak kaçmaktır, sebebi yoktur. Lütfen. Beni ona götürme.',
   choices:[{label:'Tamam. Burada kal.',to:'kal'},{label:'Benimle geleceksin.',to:'zorla'},{label:'Düşüneyim.',to:null}]},
  'kal':{text:'…Sağ ol. Bir gün bunun karşılığını veririm. Buradan başka gidecek yerim yok ama borcumu unutmam.',
   choices:[AYRIL]},
  // --- Savastan SONRA: artik pesinde yuruyor. Buradaki metinler savas oncesi
  // dalla celismemeli; "buradan gidecek yerim yok" gibi cumleler o kola ait.
  'takip1':{text:'Kılıcım yerde kaldı. Bacağım tutmuyor ama arkandan geliyorum. Beni ona götüreceksen götür — artık kaçacak hâlim yok.',
   choices:[{label:'Neden karşı koydun?',to:'takip2'},{label:'Yolda bir şey çıkarsa arkamı kolla.',to:'takip3'},
            {label:'Seni bırakıyorum. Git.',to:'cozuldu'},{label:'Yürümeye devam.',to:null}]},
  'takip2':{text:'Korktuğum ölmek değil. Onun gözlerine bakmak. Bir adam sana bir kez inanır, bir kez de vazgeçer. İkisini de gördüm.',
   choices:[{label:'Seni bırakıyorum. Git.',to:'cozuldu'},{label:'Yürümeye devam.',to:null}]},
  'takip3':{text:'Kollarım. Kaçtım diye korkak değilim — kaçtığım gün de elimde kılıç vardı. Önüne ne çıkarsa yanındayım. Bu kadarını hak ediyorsun.',
   choices:[{label:'Seni bırakıyorum. Git.',to:'cozuldu'},{label:'Yürümeye devam.',to:null}]},
  'cozuldu':{text:'…Gerçekten mi? Beni yendin, hakkındı. …Peki. Borcum iki oldu. Yukarıda bir şey kaldıysa, senin için kalsın.',
   choices:[AYRIL]},
  'serbest1':{text:'Beni bıraktığın gün bir daha nefes aldım. Bunu unutmadım.',
   choices:[AYRIL]},
  'zorla':{text:'Hayır. HAYIR! Beni oraya götüremezsin — önce beni öldürmen gerekir!',
   choices:[{label:'Öyle olsun.',to:null},AYRIL]},
 },

 // Ucurumun basindaki adam. Ikna edilebilir ama garantisi yok: kederini
 // gecersiz sayan cevaplar onu dogrudan atlatir, ihtiyac duyuldugunu
 // soyleyen cevap tutar.
 tuhn:{
  '1':{text:'Yaklaşma. Buradan aşağısı görünmüyor, biliyor musun? Ne kadar derin olduğunu kimse bilmiyor. Bu hoşuma gidiyor.',
   choices:[{label:'Orada ne yapıyorsun?',to:'2'},{label:'Ver şu testiyi.',to:'sert'},AYRIL]},
  '2':{text:'Duruyorum. Üç gündür duruyorum. Bir adım var aramızda, o kadar. Bir adımın bu kadar ağır olabileceğini bilmezdim.',
   choices:[{label:'Kimi kaybettin?',to:'3'},{label:'Aşağıda ne var sanıyorsun?',to:'4'},AYRIL]},
  '3':{text:'Karımı. Sara’yı. Yukarı çıktı, yanında bir de çocuk vardı, Tiga. Su arayacaklardı, bir gün sürer dedi. On bir gün oldu. Mirna sayıyor ya, onu hâlâ saymadı. Saymasını bekliyorum.',
   choices:[{label:'Yukarıda hâlâ olabilir.',to:'umut'},{label:'Bu ölümle onu geri getirmezsin.',to:'sert'},
            {label:'Aşağıda on dokuz kişiyiz. On sekiz olmasın.',to:'ihtiyac',if:s=>s.flags.selviSir!=='soylendi'},
            {label:'Aşağıda yirmi kişiyiz. On dokuz olmasın.',to:'ihtiyac20',if:s=>s.flags.selviSir==='soylendi'},
            {label:'Sara su bulmuş. Tiga’ya vermiş; çocuk yıkıkta bekliyor.',to:'sare',if:s=>!!s.flags.ayaz},AYRIL]},
  '4':{text:'Sessizlik. Burada herkes konuşuyor: Alf suçunu, Undur kitabını, Mirna ölülerini. Aşağıda kimse konuşmuyor.',
   choices:[{label:'Kimi kaybettin?',to:'3'},
            {label:'Aşağıda on dokuz kişiyiz. On sekiz olmasın.',to:'ihtiyac',if:s=>s.flags.selviSir!=='soylendi'},
            {label:'Aşağıda yirmi kişiyiz. On dokuz olmasın.',to:'ihtiyac20',if:s=>s.flags.selviSir==='soylendi'},AYRIL]},
  'umut':{text:'Olabilir. Olmayabilir. On bir gündür bu iki kelimenin arasında duruyorum ve ikisi de beni tutmuyor. Sen tutar mısın sandın?',
   choices:[{label:'Aşağıda on dokuz kişiyiz. On sekiz olmasın.',to:'ihtiyac',if:s=>s.flags.selviSir!=='soylendi'},
            {label:'Aşağıda yirmi kişiyiz. On dokuz olmasın.',to:'ihtiyac20',if:s=>s.flags.selviSir==='soylendi'},
            {label:'Sara su bulmuş. Tiga’ya vermiş; çocuk yıkıkta bekliyor.',to:'sare',if:s=>!!s.flags.ayaz},
            {label:'Haklısın, tutmam.',to:'sert'},AYRIL]},
  'ihtiyac':{text:'…On dokuz. Saydın mı gerçekten? Kimse saymaz sanıyordum. Mirna sayıyor ama o ölüleri sayıyor. Sen yaşayanları saymışsın.',
   choices:[{label:'Testiyi bırak, birlikte inelim.',to:'kaldi'},{label:'Karar senin.',to:'sert'}]},
  // Elvi sayildiysa sayi degismistir; Tuhn icin bu "sayi eksilmek zorunda degil" demek.
  'ihtiyac20':{text:'Yirmi mi? Mirna on dokuz diyor. …Bugün birini daha mı yazdı? Yaşayanlara mı? …Demek sayı yalnızca eksilmiyor. Demek benim için de bir satır kalmış olabilir.',
   choices:[{label:'Testiyi bırak, birlikte inelim.',to:'kaldi'},{label:'Karar senin.',to:'sert'}]},
  // Ikinci anahtar: umut degil, kanit. Sara bir cocuga suyu verip yoluna devam etmis.
  'sare':{text:'…Su mu bulmuş? Bir çocuğa verip devam mı etmiş? Bana bir testi bıraktı, çocuğa mataranın tamamını. …Tanıdım işte, o. Hâlâ yürüyordu. O yürüyorsa ben düşemem.',
   choices:[{label:'Testiyi bırak, birlikte inelim.',to:'kaldiSare'},{label:'Belki hâlâ yürüyordur.',to:'kaldiSare'}]},
  'kaldiSare':{text:'İneceğim. Testiyi de götüreceğim; boş ama onun. O çocuğun matarasından bir yudum içmem lazım. Sonra Mirna’ya söyleyeceğim: Sara’yı ölülere değil, yürüyenlere yaz.',
   choices:[AYRIL]},
  'sert':{text:'…Evet. Karar benim. Teşekkür ederim, gerçekten. Kimse bunu bu kadar açık söylememişti.',
   choices:[{label:'Dur—',to:'atladi'},{label:'…',to:'atladi'}]},
  'kaldi':{text:'…Peki. Bir adım geri. Sadece bir adım. Yarın yine buraya gelirim belki, ama bugün seninle ineceğim.',
   choices:[AYRIL]},
  'atladi':{text:'',choices:[]},
 },

 mira:{
  '1':{text:'Hikâyem mi? Ben bu sığınağın ilk gecesini gördüm. Yukarıda gökyüzü kül rengine döndüğünde, buraya yetmiş kişi indik. Şimdi on dokuzuz.',
   choices:[{label:'Ne oldu yukarıda?',to:'2'},{label:'Diğerlerine ne oldu?',to:'3'},AYRIL]},
  '2':{text:'Kimse tam olarak bilmiyor. Bir sabah ufuk turuncuydu, öğlene kadar kararmıştı. Kül yağmaya başladı ve durmadı. Kuyular kurudu, hayvanlar öldü. Biz aşağı indik çünkü başka yer kalmamıştı.',
   choices:[{label:'Kül nereden geliyor?',to:'4'},{label:'Diğerlerine ne oldu?',to:'3'},AYRIL]},
  '3':{text:'Kimi hastalıktan. Kimi yukarı çıkmak istedi ve dönmedi. Kimi de… sarnıçta bir şey var. İnenlerin hepsi geri gelmedi. Ben artık kimseyi göndermiyorum, kendim gidemediğim için de burada bekliyorum.',
   choices:[{label:'Ama beni gönderdin.',to:'6'},{label:'Sarnıçta ne var?',to:'5'},{label:'Ne oldu yukarıda?',to:'2'},AYRIL]},
  '4':{text:'Alf ocağın oradan geldiğini söylüyor. Undur ise küllerin bir cevap değil bir soru olduğunu yazıyor defterine. İkisi de haklı olabilir. Ben sadece öksüren insanları sayıyorum.',
   choices:[{label:'Neden sayıyorsun?',to:'7'},{label:'Sarnıçta ne var?',to:'5'},AYRIL]},
  '5':{text:'Su vardı, şimdi çamur var. Ve sesler. Taşın hatırladığını söylüyorlar ya, ben inanmam — ama oradan dönen herkes aynı şeyi duyduğunu söyledi. Bir uğultu. Sanki aşağıda bir şey nefes alıyor.',
   choices:[{label:'Ne oldu yukarıda?',to:'2'},AYRIL]},
  // Mirna'nin yeminleri. Alf gidemiyor, Mirna gondermiyor: ayni yeminin iki yuzu.
  // Oyuncuya ilac gorevini verdigi an ikinci yeminini bozdu.
  '6':{text:'Gönderdim. Sarnıca üç kişi yolladım, üçü de dönmedi. O gece yemin ettim: bir daha kimseyi göndermem. Sonra sen kapıdan girdin ve ağzımdan çıkan ilk cümle “aşağıda bir ilaç var” oldu. Yeminim seni gördüğüm anda bitti. Bunu bilmeni istedim — sen bana borçlusun diye değil, ben sana borçluyum diye.',
   choices:[{label:'Neden sayıyorsun?',to:'7'},{label:'Başka yemin var mı?',to:'7'},AYRIL]},
  '7':{text:'İlk gece kapıda ben durdum. Undur havanın yetmiş kişiyi kaldıracağını hesaplamıştı. Yetmiş dedim. Yetmiş birinciyi ben çevirdim; sesini duydum, yüzünü görmedim. O gece de yemin ettim: bir daha kimseyi dışarıda bırakmam. Onu da tutamadım — sarnıca gönderdiklerim de dışarıda kaldı. O yüzden sayıyorum. Sayı tutmak, yemin tutmaktan kolay.',
   choices:[{label:'Yetmiş birinci hayatta. Kapının dibinde duruyor.',to:'selvi',if:s=>!!s.flags.selvi&&!s.flags.mirnaSir},AYRIL]},
  'selvi':{text:'…Biliyorum. İçeri girdiği gün sesinden tanıdım. Yazamadım. Yazarsam yetmişin yanlış olduğunu yazmış olurum; yetmiş yanlışsa o gece kapıda kalanlar boşuna kaldı. Yazamadım.',
   choices:[{label:'Ona kapıda senin durduğunu söyleyeceğim.',to:'selviSoyle'},{label:'Bu senin taşıyacağın bir yük.',to:'selviSakla'}]},
  'selviSoyle':{text:'…Söyle. Ben otuz gecedir onun önünden yüzüme bakmadan geçiyorum. Belki bakması gerekir. Belki o zaman yazabilirim.',
   choices:[AYRIL]},
  'selviSakla':{text:'Teşekkür ederim. Ya da etmiyorum, bilmiyorum. Taşımaya devam ederim. Öksürenleri saymaya da.',
   choices:[AYRIL]},
  // Tek seferlik araya girisler: motor, olay olduktan sonraki ilk konusmada
  // talk'i buraya kurar; sonra normal gorev diyaloguna donulur.
  'yirmi':{text:'Elvi geldi. Yüzüme baktı, bağırmadı. Onu yazdım: yirmi. Otuz gecedir ilk defa yaşayan birini yazdım.',
   choices:[{label:'…',to:null}]},
  'ayazYazdi':{text:'Tiga’yı da yazdım. Yaşayanları yazmaya başladım; senin yüzünden. Sayfanın o tarafı boştu, artık değil.',
   choices:[{label:'…',to:null}]},
 },
 boran:{
  '1':{text:'Anlatacak ne var? Kılıç taşıdım, insanlar öldü, ben ölmedim. Muhafızdım. Sonra koruyacak bir şey kalmadı, ben de burada kaldım.',
   choices:[{label:'Rauf’u kendin arasana.',to:'yemin'},{label:'Neyi koruyordun?',to:'2'},{label:'Neden bu kadar yorgunsun?',to:'3'},AYRIL]},
  '2':{text:'Kül Ocağı’nı. Aşağıda, sarnıcın da altında. Orada bir şey yanıyor ve yüzyıllardır yanıyor. Bizim işimiz kimsenin içeri girmemesiydi. Kimsenin çıkmaması olduğunu sonra anladık.',
   choices:[{label:'Ne çıktı oradan?',to:'4'},{label:'Neden bu kadar yorgunsun?',to:'3'},AYRIL]},
  '3':{text:'Çünkü on bir yıl nöbet tuttum ve on birinci yılda kapıyı ben açtım. Emirdi. Emri veren adam artık yok, ben varım. Uykuda bile ayaktayım sanki.',
   choices:[{label:'Ne çıktı oradan?',to:'4'},AYRIL]},
  '4':{text:'Kül. Sadece kül, öyle sandık. Ama kül yapışıyor. Nefese, taşa, insana. Bir süre sonra insanlar konuştuklarını hatırlamaz oldu. Şimdi yukarısı da öyle. Ben kapıyı açtım, gökyüzünü ben kararttım.',
   choices:[{label:'Kendini suçlama.',to:'5'},{label:'Kapı hâlâ açık mı?',to:'6'},AYRIL]},
  'yemin':{text:'Gitmiyorum çünkü gidemem. O kapıyı açtığım gün bir yemin ettim: bir daha nöbetine verildiğim hiçbir kapıdan geçmeyeceğim. Bu sığınağın kapısı benim son nöbetim. Bir adım atarsam yeminimi ikinci kez bozmuş olurum.',
   choices:[{label:'Bir yemin bir adamı buraya çivileyebilir mi?',to:'yemin2'},
            {label:'O zaman Rauf’u ben getiririm.',to:null},AYRIL]},
  'yemin2':{text:'Çiviliyor işte. Rauf da bir yemin etmişti, o yürüdü gitti. İkimizden biri yanlış yaptı; hangimiz olduğunu bilmediğim için burada duruyorum.',
   choices:[{label:'O zaman Rauf’u ben getiririm.',to:null},AYRIL]},
  // Rauf'u korudugun ogrenildiginde: simdilik yuzlesme, ilerde dovuse
  // baglanabilmesi icin flags.alfKarsi ile isaretleniyor.
  'karsi':{text:'Sarnıçtan bir ses geldi kulağıma. Aşağıda biri var, topallıyormuş, bileğinde bir kurdele varmış. Sen onu gördün. Yüzüme bak ve söyle.',
   choices:[{label:'Gördüm. Ve bıraktım.',to:'karsiItiraf'},
            {label:'Görmedim.',to:'karsiYalan'}]},
  'karsiItiraf':{text:'…Demek öyle. On bir yıl bir kapıyı bekledim, sen bir adamı beklemedin bile. Şimdilik git. Ama bu iş bitmedi — ikimizden biri o adamı geri getirecek.',
   choices:[AYRIL]},
  'karsiYalan':{text:'Yalan söylüyorsun. Sorun değil; ben de bir ömür kendime yalan söyledim. Ama benimki beni buraya çiviledi, seninki seni bir gün bana getirecek.',
   choices:[AYRIL]},
  'sir':{text:'Undur mu? O adam kâğıtla konuşur. Ne dedi?',
   choices:[{label:'O kapı sen doğmadan önce açılmış. Sen son mandalı kaldırmışsın.',to:'sirSoyle'},
            {label:'Boş ver. Önemli değildi.',to:'sirSakla'}]},
  'sirSoyle':{text:'…On bir yıl. On bir yıl her sabah aynı cümleyle kalktım: gökyüzünü ben karattım. Şimdi diyorsun ki o cümle bile bana ait değil.\n\nBilmiyorum şimdi neyim. Ama bunu söyleyecek kadar gözümün içine baktın. Al şunu — nöbet anahtarım. Artık bir kapının değil, bir adamın anahtarı.',
   choices:[AYRIL]},
  'sirSakla':{text:'Öyle mi? Peki. Zaten kimse bana yeni bir şey söylemiyor.',
   choices:[AYRIL]},
  '5':{text:'Suçlamıyorum. Sayıyorum. Farkı var. Bir gün birisi aşağı inip o kapıyı kapatacak. O zaman sayım biter.',
   choices:[{label:'Kapı hâlâ açık mı?',to:'6'},AYRIL]},
  '6':{text:'Açık. Kolu kırdım, menteşesini sökttüm, olmadı. O kapı kolla açılmıyor — yeminle açılıyor. Kapanması için de bir yemin gerek. Benimki tutmadı.',
   choices:[{label:'Neyi koruyordun?',to:'2'},AYRIL]},
 },
 ekin:{
  '1':{text:'Ben mi? Ben yazıyorum. Kimse okumayacak ama yazıyorum. Otuz yıl arşivdeydim, şimdi arşiv benim başımın altında bir çuval kâğıt.',
   choices:[{label:'Ne yazıyorsun?',to:'2'},{label:'Küller hakkında ne biliyorsun?',to:'3'},AYRIL]},
  '2':{text:'İsimleri. Ölenlerin isimlerini. Bir de yukarıda kalanların. Birisi bir gün çıkıp da “burada kimler vardı” diye sorarsa, cevabı olsun diye.',
   choices:[{label:'Küller hakkında ne biliyorsun?',to:'3'},AYRIL]},
  '3':{text:'Eski metinlerde kül bir ceza değil, bir bekleme hâli olarak geçer. Bir şey sözünü tutmadığında dünya külü örtü gibi çeker üstüne, söz tutulana kadar bekler. Masal sanıyordum. Sonra gökyüzü karardı.',
   choices:[{label:'Hangi söz?',to:'4'},{label:'Alf kapıyı açtığını söylüyor.',to:'5'},AYRIL]},
  '4':{text:'Metin “ilk yemin” diyor, fazlasını söylemiyor. Ocağı yakanlarla ocağın kendisi arasında bir anlaşma. Biri diğerini beslerken öteki uyuyacaktı. Uyanmış demek ki.',
   choices:[{label:'Neyle besleniyordu?',to:'besin'},{label:'Alf kapıyı açtığını söylüyor.',to:'5'},AYRIL]},
  // Ilk yeminin yakiti: odun degil, tutulan sozler. Bu, hikayenin butun
  // parcalarini birbirine baglayan cumle — herkesin bozdugu yemin kulun sebebi.
  'besin':{text:'Odun sanırdım. Otuz yıl arşivde okuduktan sonra artık sanmıyorum. Ocağa inen her muhafız orada bir yemin ederdi; nöbet defteri onun için tutulurdu. Tutulan yemin ocağı uyutur, bozulan uyandırır. Bu sığınakta kaç yemin bozuldu, say istersen. Sonra gökyüzüne bak.',
   choices:[{label:'Burada yeminini tutan biri var mı?',to:'nil'},{label:'Alf kapıyı açtığını söylüyor.',to:'5'},AYRIL]},
  'nil':{text:'Bir kişi. Şuradaki çocuk, Lin. Ağabeyine ateşi söndürmeyeceğine söz verdi; on bir gündür söndürmüyor. Sekiz yaşında ve bu sığınakta sözünü tutan tek insan. Ocakların hâlâ yanmasını ben ona bağlıyorum. Kimse bana inanmıyor; ben de yazıyorum.',
   choices:[{label:'Alf kapıyı açtığını söylüyor.',to:'5'},AYRIL]},
  // --- Son: iki kapanis da bir yeminle. Muhur icin oyuncunun kendi sozu,
  // baglama icin ilk yeminin yenilenmesi gerekiyor. Dugumler choose() icinde
  // yakalanir ve sonu tetikler.
  'muhur':{text:'Alf haklıydı: o kapı kolla kapanmıyor. Yeminle kapanıyor. Kalp yarığa oturur, ama onu tutan bir söz olmalı — bu sığınakta sözü kalmış tek kişi sensin. Ne diyeceksin?',
   choices:[{label:'Bu kapıyı ben bekleyeceğim.',to:'yeminNobet'},{label:'Yukarıda kalanları arayacağım.',to:'yeminYukari'},{label:'Henüz değil.',to:null}]},
  'besle':{text:'Bunu yaparsan ilk yemini sen yenilemiş olursun. Sen besleyeceksin, o uyuyacak. Beslemek ne demek, defter söylüyor: tutulan sözler. Beslemeyi bıraktığın gün uyanır. Söylüyor musun?',
   choices:[{label:'Yemin ederim: besleyeceğim.',to:'yeminBesle'},{label:'Henüz değil.',to:null}]},
  'yeminNobet':{text:'',choices:[]},'yeminYukari':{text:'',choices:[]},'yeminBesle':{text:'',choices:[]},
  '5':{text:'Alf kendine fazla yükleniyor. O kapı on bir yıl önce değil, çok daha önce açıldı. O sadece son mandalı kaldırdı. Ama bunu ona söyleme — taşıdığı yük onu ayakta tutan tek şey.',
   choices:[{label:'Bir adamın suçu ona ait. Söyleyeceğim.',to:'sir'},{label:'Susarım.',to:'sus'},
            {label:'Ne yazıyorsun?',to:'2'},AYRIL]},
  'sir':{text:'…Belki haklısın. Ben otuz yıl sakladım, taşıdığım da bu oldu. Söylersen kendi yükümü sana devretmiş olurum. Sen taşırsın, ben yazarım.',
   choices:[AYRIL]},
  'sus':{text:'Teşekkür ederim. Bazı doğrular bir adamı düzeltmez, sadece dağıtır. Onu ayakta tutan yanlış olsun.',
   choices:[AYRIL]},
 },

 // Lin: sekiz yasinda, agabeyi Tiga'ya atesi sondurmeyecegine soz verdi.
 // Bu siginakta yeminini tutan tek kisi; yemini karsi tarafa bagli degil.
 nil:{
  '1':{text:'Yukarıda. Sara teyzeyle su aramaya gitti. On bir gün oldu; şu direğe on bir çentik attım. Herkes “döner” diyor ama gözleri başka yere bakıyor. Sen de mi öyle bakacaksın?',
   choices:[{label:'Bakmayacağım. Ne yapmamı istersin?',to:'soz'},{label:'Belki dönmez.',to:'belki'},AYRIL]},
  'belki':{text:'Biliyorum. Alf amca da “dönmez” dedi, sonra özür diledi. Dönmese de söndürmem. Söz ona verildi; ona geri verilmeden bitmez.',
   choices:[{label:'Ne yapmamı istersin?',to:'soz'},AYRIL]},
  'soz':{text:'Yukarı çıkan tek sensin. Onu görürsen söyle: ateş yanıyor. Bu kadar. Söz verir misin?',
   choices:[{label:'Söz veriyorum.',to:'sozVerildi'},{label:'Söz veremem. Ama görürsem söylerim.',to:'sozRed'}]},
  'sozVerildi':{text:'Tamam. Şimdi iki kişiyiz.',choices:[AYRIL]},
  'sozRed':{text:'Herkes öyle diyor. Olsun. Görürsen söyle.',choices:[AYRIL]},
 },

 // Tiga: on dort yasinda, Kul Ovasi'ndaki yikikta. Sara ona "bekle" dedi, o da
 // bekliyor — Alf'in yemininin cocuk hali. Onu yerinden kaldiran sey ikna
 // degil, baska bir yemin: Lin'e verdigi soz ya da Tuhn'a borclu oldugu haber.
 ayaz:{
  '1':{text:'Aşağıdan mısın? …Sara teyze döndü mü? Dönmedi, yüzünden belli. Kapıyı kapat, kül giriyor.',
   choices:[{label:'Sara kim?',to:'2'},{label:'Burada ne yapıyorsun?',to:'3'},AYRIL]},
  '2':{text:'Tuhn amcanın karısı. Su aramaya çıktık. Buldu da — dere değil, bir çukurun dibinde kül yutmamış bir göz su. Matarayı doldurdu, bana verdi. “Sen bu eve sığın, ben ötesine bakacağım. Bekle,” dedi.',
   choices:[{label:'Burada ne yapıyorsun?',to:'3'},AYRIL]},
  '3':{text:'Bekliyorum. Bekle dedi, söz verdim. Aşağıya inersem sözüm burada kalır. Sen sözünü bırakıp gidebilir misin?',
   choices:[{label:'Lin ateşini senin için yakıyor. On bir gündür.',to:'nilKey',if:s=>!!s.flags.nil},
            {label:'Tuhn üç gündür uçurumun başında duruyor.',to:'tuhnKey',if:s=>!!s.flags.tuhnTanisti},
            {label:'Sara dönmeyecek.',to:'sert'},{label:'Söz verdiysen bekle.',to:'kal'},AYRIL]},
  'nilKey':{text:'…Lin. Ona “söndürme, dönerim” demiştim. …İki söz verdim, ikisi de “bekle” diyor, biri burada biri aşağıda. İkisini birden tutamam.',
   choices:[{label:'Birini seç.',to:'sec'},{label:'Sara bir yetişkin. Lin sekiz yaşında.',to:'sec'}]},
  'tuhnKey':{text:'Uçurumun… Tuhn amca bilmiyor mu? Suyu bulduğunu bilmiyor. Ben burada onun karısının suyuyla oturuyorum, o orada… Ona söylemem lazım. Bu da bir söz sayılır, değil mi?',
   choices:[{label:'Sayılır. Kapı yüz adım. Nefesini tut, koş.',to:'indi'}]},
  'sec':{text:'…Lin. Sara teyze beni affeder; o da bir söz bıraktı arkasında. Kapı ne kadar uzak? …Yüz adım mı? Nefesimi tutarım. Matarayı da götürüyorum, Tuhn amca içsin.',
   choices:[{label:'Koş. Arkana bakma.',to:'indi'}]},
  'indi':{text:'Bir şey daha. Sara teyzeyi birinin araması lazım. Ben çocuğum, Tuhn amca kırık. Sen ararsın mı?',
   choices:[{label:'Söz veriyorum. Arayacağım.',to:'sozVerildi'},{label:'Söz veremem. Ama bakarım.',to:'sozRed'}]},
  'kal':{text:'…Teşekkür ederim. Herkes “in” derdi sanıyordum. Bir şey daha. Sara teyzeyi birinin araması lazım. Sen ararsın mı?',
   choices:[{label:'Söz veriyorum. Arayacağım.',to:'sozVerildiKal'},{label:'Söz veremem. Ama bakarım.',to:'sozRedKal'}]},
  'sert':{text:'Çık dışarı. …Hayır, dur. Kül var. Kal ama bir daha söyleme. O “bekle” dedi. Dönmeyecek biri “bekle” demez.',
   choices:[{label:'Söz verdiysen bekle.',to:'kal'},{label:'Lin ateşini senin için yakıyor. On bir gündür.',to:'nilKey',if:s=>!!s.flags.nil},
            {label:'Tuhn üç gündür uçurumun başında duruyor.',to:'tuhnKey',if:s=>!!s.flags.tuhnTanisti},AYRIL]},
  'sozVerildi':{text:'Tamam. O zaman koşuyorum.',choices:[AYRIL]},
  'sozRed':{text:'Bakarsın. Olsun. Koşuyorum.',choices:[AYRIL]},
  'sozVerildiKal':{text:'Tamam. O zaman ben burada beklerim, sen orada ararsın.',choices:[AYRIL]},
  'sozRedKal':{text:'Bakarsın. Olsun. Ben beklerim.',choices:[AYRIL]},
  'asagi':{text:'Lin bütün gece anlattı, ben dinledim. Ateş hiç sönmemiş. …Tuhn amcaya matarayı verdim. Bir yudum içti, ağlamadı; sadece testisini yere bıraktı.',
   choices:[AYRIL]},
 },

 // Elvi: yetmis birinci. Ilk gece kapidan cevrildi, dorduncu gun iceri girdi,
 // Mirna onu hic yazmadi. Kalbin baglanmasini isteyen tek ses — acgozlulukten
 // degil, kapida kalan biri olarak.
 selvi:{
  '1':{text:'Yetmiş birinciyim. O gece kapıya ben de geldim. İçeriden bir ses “yer yok” dedi. Kadın sesiydi; yüzünü görmedim. Kapı kapandı.',
   choices:[{label:'Nasıl hayatta kaldın?',to:'2'},{label:'Şimdi içeridesin ama.',to:'3'},AYRIL]},
  '2':{text:'Ovada kemerli bir yıkıntı var, kül içine girmiyor. Üç gece orada durdum. Dördüncü gün kapı bir cenaze için açıldı; içeri girdim. Kimse durdurmadı. Kimse yazmadı da.',
   choices:[{label:'Şimdi içeridesin ama.',to:'3'},AYRIL]},
  '3':{text:'İçerideyim ama sayılmıyorum. Mirna on dokuz diyor. Ben yirmiyim. On dokuz demek, benim kapıda kaldığım geceyi hiç olmamış saymak demek.',
   choices:[{label:'Neden hâlâ buradasın o hâlde?',to:'4'},AYRIL]},
  '4':{text:'Çünkü aşağıda bir kalp atıyor, herkes biliyor. Undur onu gömmek istiyor. Ben istemiyorum. Işık ve sıcaklık olsaydı o gece buraya yetmiş değil yüz kişi sığardı. Kalbi bağla. Bir daha kimse kapıda kalmasın. …Söz ver.',
   choices:[{label:'Söz veriyorum: kalbi bağlayacağım.',to:'sozVerildi'},{label:'Söz veremem. Kararı orada vereceğim.',to:'sozRed'}]},
  'sozVerildi':{text:'Bir söz daha. Bu sığınak sözden geçilmiyor. …Ama seninki ilk defa bana verilen bir söz. Tutarsan yazarım; ben de yazmayı öğrendim.',
   choices:[AYRIL]},
  'sozRed':{text:'Doğru. Vermeyen bozmaz. Undur öyle yaşıyor, Alf tersini. Sen hangisi olacaksın, orada göreceğiz.',
   choices:[AYRIL]},
  // Mirna'nin sirri Elvi'ye soylenirse: Alf'te ayni hareket bir adami yikti,
  // burada bir kadini deftere yazdiriyor. Ayni fiil, ters sonuc.
  'sir':{text:'…Mirna mı? Öksürenleri sayan kadın. Her sabah önümden geçiyor, yüzüme bakmadan. …Demek o. Bağırmayacağım. Sadece yüzüme bakmasını isteyeceğim. Yetmiş birinci bir sayı değil.',
   choices:[{label:'Git konuş onunla.',to:'sirKonus'}]},
  'sirKonus':{text:'Gidiyorum. Sen de gel istersen; hayır, gelme. Bu ikimizin arasında.',choices:[AYRIL]},
 },
};

export function dialogue(s:State,id:string):Dialogue{
 const close={label:'Şimdilik hoşça kal.',action:'close'};
 // Hikaye sohbeti suruyorsa gorev diyalogu yerine o dugum gosterilir.
 const talk=typeof s.flags.talk==='string'?s.flags.talk:'';
 const [tNpc,tNode]=talk.split(':');
 if(tNpc===id&&STORY[id]?.[tNode]){
  const n=STORY[id][tNode],base=dialogue({...s,flags:{...s.flags,talk:''}},id);
  return {...base,text:n.text,choices:[
   ...n.choices.filter(c=>!c.if||c.if(s)).map(c=>({label:c.label,action:c.to?`story:${id}:${c.to}`:'story:bitir'})),
  ]};
 }
 // Tuhn: ucurumdayken butun sohbeti STORY agacinda (motor talk'i 'tuhn:1'e
 // kurar). Indikten sonra siginakta durur ve buradaki metin gosterilir.
 if(id==='tuhn')return {who:'Tuhn',role:s.flags.tuhn==='kaldi'?'Ateşin yanındaki adam':'Uçurumun başındaki adam',portrait:6,
  text:s.flags.tuhn!=='kaldi'?'…':s.flags.ayaz==='indi'?'Tiga matarayı getirdi. Sara’nın suyu. Bir yudum içtim, testiyi yere bıraktım. Mirna’ya söyledim: onu yürüyenlere yaz.':s.flags.tuhnSare?'İndim. Testi boş ama onun. O çocuk aşağı inerse mataradan bir yudum isteyeceğim.':'Bugünlük indim. Lin’in ateşine odun taşıyorum; birinin taşıması lazım. Yarını yarın düşünürüm.',
  choices:[close]};
 // Lin: siginaktaki cocuk. Ates onun, soz onun.
 if(id==='nil'){
  return {who:'Lin',role:'Ateşi söndürmeyen',portrait:7,
   text:s.flags.ayaz==='indi'?'Ağabeyim geldi! Koşarak geldi, külden bembeyazdı. Ateşin yandığını gördü. …Mirna onu yazdı. Yaşayanlara.'
    :s.flags.ayazHaber==='soylendi'?'Söyledin mi ona? Ateşin yandığını? …Tamam. O zaman biliyor. Bilmesi yeter, gelmese de.'
    :s.flags.ayaz==='kaldi'?'Onu gördün, değil mi? Yüzünden belli. Bekliyor. …Sara teyze ona “bekle” dedi, bana “söndürme”. İkimiz de tutuyoruz.'
    :(s.flags.rauf==='takip'?'Yanındaki adam ateşe değil bileğine bakıyor. …Şşş. ':'Şşş. ')+'Ateşe odun atıyorum. Ağabeyim “söndürme, dönerim” dedi. Ben de söndürmüyorum. Sen kimsin?',
   choices:[{label:'Ağabeyin nerede?',action:'story:nil:1'},
    ...(s.inventory.wood&&!s.flags.nilOdun?[{label:'Sana odun getirdim.',action:'nil_odun',note:'1 odun ver'}]:[]),
    close]};}
 // Elvi: yetmis birinci. Ust kapinin dibinde durur.
 if(id==='selvi'){
  return {who:'Elvi',role:s.flags.selviSir==='soylendi'?'Yirminci':'Sayılmayan',portrait:9,
   text:s.flags.selviSir==='soylendi'?'Mirna yüzüme baktı. Sonra yazdı: yirmi. …Yirmi olmak, on dokuzun yanında durmaktan daha ağırmış; kim bilirdi.'
    :s.ending==='claim'&&s.flags.sozSelvi==='verildi'?'Tuttun. Kapı bir daha kimseye kapanmayacak. Yazdım.'
    :s.ending==='seal'&&s.flags.sozSelvi==='verildi'?'Sen de mi. …Olsun. En azından yüzüme bakarak bozdun.'
    :s.flags.sozSelvi==='verildi'?'Sözünü unutma. Kalbi bağla. Kapı bir daha kimseye kapanmasın.'
    :'Bana bakma. Kimse bakmaz. Bakarsan saymak zorunda kalırsın.',
   choices:[{label:'Sen kimsin?',action:'story:selvi:1'},
    ...(s.flags.mirnaSir==='biliyorum'&&!s.flags.selviSir?[{label:'O gece kapıda kimin durduğunu biliyorum.',action:'story:selvi:sir',note:'Karar · Yetmiş birinci'}]:[]),
    close]};}
 // Tiga: Yikik Ev'de bekleyen cocuk; indiyse siginakta Lin'in yaninda.
 if(id==='ayaz'){
  return {who:'Tiga',role:s.flags.ayaz==='indi'?'Lin’in ağabeyi':'Yıkıkta bekleyen',portrait:8,
   text:s.flags.ayaz==='indi'?'Lin bütün gece anlattı, ben dinledim. Ateş hiç sönmemiş.'
    :s.flags.ayaz==='kaldi'?'Hâlâ buradayım. Sen de hâlâ gidiyorsun. İkimiz de sözümüzdeyiz.'
    :'Kapıyı kapat, kül giriyor. …Aşağıdan mısın?',
   choices:[
    ...(s.flags.ayaz!=='indi'?[{label:'Konuşalım.',action:'story:ayaz:1'}]:[]),
    ...(s.flags.sozNil&&!s.flags.ayazHaber?[{label:'Lin söyledi: ateş yanıyor.',action:'ayaz_haber',note:s.flags.sozNil==='verildi'?'Lin’e verdiğin sözü tut':'Lin’in haberini ilet'}]:[]),
    close]};}
 // Kul Ovasi'ndaki yikikta Rauf'un cesedi: kurdele alinabilir.
 if(id==='raufCeset')return {who:'Rauf',role:'Kül Ovası’nda',portrait:5,
  text:s.flags.kurdeleAlindi?'Bileği boş. Kül üstünü örtmeye başladı bile.':'Alf temiz iş çıkarmış. Bileğinde kurdele hâlâ duruyor; yanında küle parmakla yazılmış bir isim var, yarısı savrulmuş. Kızının olmalı.',
  choices:[...(!s.flags.kurdeleAlindi?[{label:'Kurdeleyi al.',action:'ceset_kurdele',note:'Kırmızı kurdele'}]:[]),close]};
 if(id==='mira')return {who:'Mirna',role:'Sığınağın şifacısı',portrait:3,text:(s.flags.medicineDone?(s.flags.medicine==='rauf'?'Bir hayat kurtardın. Buradakiler için başka bir yol bulacağız. Yaralarını sarayım.':'İlaç işe yaradı. Bu gece kimseyi kaybetmedik. Dinlen; yaralarını sarayım.'):s.flags.medicine==='rauf'?'Ellerin boş… ama yüzünde söylemek istediğin bir şey var.':s.inventory.medicine?'Buldun! Bir şişenin bu kadar ağır bir umut taşıyacağını düşünmezdim.':'Aşağıdaki sarnıçta bir doz ilaç kaldı. Burada ateşler içinde yatanlar var. Onu bana getirir misin?'),choices:[{label:'Bana hikâyeni anlat.',action:'story:mira:1'},...(!s.flags.medicineStarted?[{label:'İlacı bulacağım.',action:'mira_start',note:'Görev · Bir doz umut'}]:[]),...(s.inventory.medicine?[{label:'İlaç senin. Hastaları iyileştir.',action:'mira_deliver',note:'+35 altın · Mirna’nın güveni'}]:[]),...(s.flags.medicine==='rauf'&&!s.flags.medicineDone?[{label:'İlacı yaralı birine verdim. Onu bırakamadım.',action:'mira_confess',note:'Kararını Mirna’ya anlat'}]:[]),{label:'Dinlen ve yaralarını sar.',action:'rest',note:'Canın tamamen yenilenir'},close]};
 if(id==='boran')return {who:'Alf',role:s.flags.alfSir==='soylendi'?'Eski kapı muhafızı':'Kapı muhafızı',portrait:2,text:s.flags.alfSir==='soylendi'?'Yeminim bir yalanın üstüne kuruluymuş. Demek ki artık bu kapıdan geçebilirim. Nereye gideceğimi bilmiyorum ama gidebilirim.':s.flags.ledgerDone?(s.flags.fugitive==='protected'?'Defter geri döndü, adam dönmedi. Onu gördüğünü biliyorum. Bir gün bana bunu neden yaptığını anlatırsın.':'Rauf’u getirdin. Gerisi benimle onun arasında. Sana borçluyum — ama teşekkür edemem.'):s.inventory.ledger?'Defteri tanıdım. Peki adam? Rauf nerede?':'Birliğimden bir adam kaçtı. Rauf. Aşağıda, sarnıcın doğusunda bir yerde. Nöbet defterimi de aldı — birliğin yeminleri onda yazılı; onun adı da, üstü çizili. Çizen bendim. Onu bul ve bana getir. Defteri de. Ben gidemem; sebebini sorarsan anlatırım.',choices:[{label:'Bana hikâyeni anlat.',action:'story:boran:1'},
  ...(s.inventory.kurdele?[{label:'Rauf’un bileğindeki kurdele. Kızınınmış.',action:'alf_kurdele',note:'Kurdeleyi Alf’e ver'}]:[]),
  ...(s.flags.alfSir==='biliyorum'?[{label:'Undur’un sana söylemediği bir şey var.',action:'story:boran:sir',note:'Karar · Onbir yılın sahibi'}]:[]),
  ...((s.flags.rauf==='korundu'||s.flags.rauf==='serbest')&&!s.flags.alfKarsi
    ?[{label:'Bana bir şey soracaktın.',action:'story:boran:karsi',note:'Yüzleşme · Rauf'}]:[]),...(!s.flags.ledgerStarted?[{label:'Rauf’u bulup getireceğim.',action:'boran_start',note:'Görev · Defterdeki isim'}]:[]),...(s.inventory.ledger?[{label:s.flags.fugitive==='protected'?'Defter terk edilmişti. Rauf’u görmedim.':'Rauf teslim olmayı kabul etti.',action:'boran_deliver',note:s.flags.fugitive==='protected'?'Rauf’u koru · Yaşam halkası':'Rauf’u teslim et · Muhafız kılıcı'}]:[]),{label:'Malzemelerine bakabilir miyim?',action:'shop'},close]};
 if(id==='ekin')return {who:'Undur',role:'Yeminlerin arşivcisi',portrait:4,text:s.ending?(s.flags.alfSir==='soylendi'?'Bir yemin, onu tutan insanlar kadar güçlüdür. Alf’inki yalanmış; sen söyledin, o da bıraktı. Bunu yazdım.':s.flags.alfSir==='sakladin'?'Bir yemin, onu tutan insanlar kadar güçlüdür. Alf hâlâ kendi yükünü taşıyor — sayende. Bunu da yazdım.':'Bir yemin, onu tutan insanlar kadar güçlüdür. Seninkinin izini bu taşlar uzun süre taşıyacak.'):'Sarsıntılar artıyor. Aşağıda, sarnıcın da altında bir yer var — eski kalp orada atıyor. Yolunu henüz bulamadım. Bulduğumda sana ilk ben söylerim.',choices:[{label:'Bana hikâyeni anlat.',action:'story:ekin:1'},close]};
 if(id==='rauf')return {who:'Rauf',role:'Yaralı kaçak',portrait:5,text:s.flags.fugitive==='reported'?'Teslim olacağım. Defteri de götür; adımın altına ne yazdıysa bir de yüzüme okusun.':s.flags.medicine==='rauf'?'Nefes almak artık acıtmıyor. Bunu unutmayacağım. Batıdaki kol, ocağa giden kapıyı açar.': 'Alf’in nöbet defteri bende. Adım içinde, üstü çizili — ben çizmedim, o çizdi. Ocak kapısını açık bulunca içeri girdim; bacağım burada bitti. Alf beni dinlemez. Bana yardım eder misin?',choices:[{label:'Bana hikâyeni anlat.',action:'story:rauf:1'},...(s.inventory.medicine&&s.flags.fugitive!=='reported'?[{label:'Bu ilacı al. Yaşaman gerek.',action:'rauf_heal',note:'Son ilacı harca · Mirna’ya götüremeyeceksin'}]:[]),...(!s.flags.fugitive?[{label:'Sırrını koruyacağım. Defteri bana ver.',action:'rauf_protect',note:'Rauf’u koru · Defteri al'},{label:'Defteri ver. Alf’e teslim olmalısın.',action:'rauf_report',note:'Rauf’u teslim et · Defteri al'}]:[]),close]};
 return {who:'Eski mühür',role:'Kül Ocağı',portrait:1,text:'Kalp hâlâ atıyor. Onu Undur’a götürmelisin.',choices:[close]};
}
export function choose(s:State,action:string):{message:string;special?:'close'|'shop'|'ending';leveled?:boolean}{
 // Hikaye dugumleri: story:<npc>:<dugum>
 if(action.startsWith('story:')&&action!=='story:bitir'){
  const dugum=action.slice(6);
  // Rauf dallanmasi: korumak sohbeti bitirir, zorlamak dovusu baslatir
  if(dugum==='rauf:kal'){s.flags.rauf='korundu';s.flags.talk=dugum;
   return {message:'Rauf’u korudun. Alf’e bir şey söylemedin.'};}
  if(dugum==='rauf:zorla'){s.flags.rauf='dovus';s.flags.talk='';
   return {message:'Rauf kılıcını çekti!',special:'close'};}
  if(dugum==='boran:karsiItiraf'){s.flags.alfKarsi='itiraf';s.flags.talk=dugum;
   s.journal.unshift('Alf, Rauf’u bıraktığını öğrendi. “Bu iş bitmedi” dedi.');
   return {message:''};}
  if(dugum==='boran:karsiYalan'){s.flags.alfKarsi='yalan';s.flags.talk=dugum;
   s.journal.unshift('Alf’e yalan söyledin. İnanmadı.');
   return {message:''};}
  if(dugum==='ekin:sir'){s.flags.alfSir='biliyorum';s.flags.talk=dugum;
   s.journal.unshift('Undur, Alf’in suçunun ondan önce başladığını söyledi. Söylemek sana kaldı.');
   return {message:'Artık Alf’e söyleyebilirsin.'};}
  if(dugum==='ekin:sus'){s.flags.alfSir='sakladin';s.flags.talk=dugum;
   s.journal.unshift('Undur’un sırrını sakladın. Alf yükünü taşımaya devam edecek.');
   return {message:''};}
  if(dugum==='boran:sirSoyle'){s.flags.alfSir='soylendi';s.flags.talk=dugum;
   addItem(s,'copper');
   s.journal.unshift('Alf’e gerçeği söyledin. On bir yıllık cümlesi elinden gitti; nöbet anahtarını sana verdi.');
   return {message:'Alf nöbet anahtarını verdi.'};}
  if(dugum==='boran:sirSakla'){s.flags.alfSir='sakladin';s.flags.talk=dugum;
   return {message:''};}
  if(dugum==='tuhn:kaldi'){s.flags.tuhn='kaldi';s.flags.talk=dugum;
   s.journal.unshift('Uçurumun başındaki adamı geri çektin. Adı Tuhn.');
   return {message:'Tuhn bir adım geri çekildi.'};}
  if(dugum==='tuhn:atladi'){s.flags.tuhn='atladi';s.flags.talk='';
   s.journal.unshift('Tuhn’u ikna edemedin. Uçurumun kenarından çekildiğini görmedin.');
   return {message:'',special:'close'};}
  // Yenildikten sonra serbest birakma: takip biter, Rauf sigginakta kalir
  if(dugum==='rauf:cozuldu'){s.flags.rauf='serbest';s.flags.talk=dugum;
   s.journal.unshift('Rauf’u yendin ama Alf’e götürmedin. Kılıcını geri verip yoluna saldın.');
   return {message:'Rauf’u serbest bıraktın.'};}
  // Tuhn'un ikinci anahtari: Sara'nın suyu
  if(dugum==='tuhn:kaldiSare'){s.flags.tuhn='kaldi';s.flags.tuhnSare='biliyor';s.flags.talk=dugum;
   s.journal.unshift('Tuhn’a Sara’nın su bulduğunu söyledin. Testiyi alıp uçurumdan çekildi.');
   return {message:'Tuhn bir adım geri çekildi.'};}
  // Mirna'nin sirri: kapida duran oydu. Soylemek Elvi'de bir secenek acar.
  if(dugum==='mira:selviSoyle'){s.flags.mirnaSir='biliyorum';s.flags.talk=dugum;
   s.journal.unshift('Mirna ilk gece kapıda kendisinin durduğunu itiraf etti. Elvi’ye söylemek sana kaldı.');
   return {message:'Artık Elvi’ye söyleyebilirsin.'};}
  if(dugum==='mira:selviSakla'){s.flags.mirnaSir='sakladin';s.flags.talk=dugum;
   s.journal.unshift('Mirna’nın sırrını sakladın. Elvi sayılmadan kalacak.');
   return {message:''};}
  if(dugum==='selvi:sir'){s.flags.selviSir='soylendi';s.flags.talk=dugum;
   s.journal.unshift('Elvi’ye kapıda Mirna’nın durduğunu söyledin. Elvi onunla konuşmaya gitti; Mirna onu yazdı. Yirmi.');
   return {message:'Elvi yirminci oldu.'};}
  // Oyuncunun sozleri
  if(dugum==='nil:sozVerildi'){s.flags.sozNil='verildi';s.flags.talk=dugum;
   s.journal.unshift('Lin’e söz verdin: ağabeyini görürsen ateşin yandığını söyleyeceksin.');
   return {message:'Söz verdin.'};}
  if(dugum==='nil:sozRed'){s.flags.sozNil='red';s.flags.talk=dugum;return {message:''};}
  if(dugum==='selvi:sozVerildi'){s.flags.sozSelvi='verildi';s.flags.talk=dugum;
   s.journal.unshift('Elvi’ye söz verdin: kalbi sığınağa bağlayacaksın.');
   return {message:'Söz verdin.'};}
  if(dugum==='selvi:sozRed'){s.flags.sozSelvi='red';s.flags.talk=dugum;return {message:''};}
  // Tiga: iner, kalir; her iki durumda Sara icin soz istenir
  if(dugum==='ayaz:indi'){s.flags.ayaz='indi';s.flags.talk=dugum;
   s.journal.unshift('Tiga yıkığı bıraktı ve sığınağa koştu. Lin’in ateşi hâlâ yanıyor.');
   return {message:'Tiga sığınağa iniyor.'};}
  if(dugum==='ayaz:kal'){if(s.flags.ayaz!=='indi')s.flags.ayaz='kaldi';s.flags.talk=dugum;
   s.journal.unshift('Tiga’nın sözüne saygı gösterdin. Yıkıkta Sara’yı beklemeye devam edecek.');
   return {message:''};}
  if(dugum==='ayaz:sozVerildi'||dugum==='ayaz:sozVerildiKal'){s.flags.sozAyaz='verildi';s.flags.talk=dugum;
   s.journal.unshift('Tiga’ya söz verdin: Sara’yı arayacaksın.');
   return {message:'Söz verdin.'};}
  if(dugum==='ayaz:sozRed'||dugum==='ayaz:sozRedKal'){s.flags.sozAyaz='red';s.flags.talk=dugum;return {message:''};}
  // Son: yemin dugumleri sonu tetikler
  if(dugum==='ekin:yeminNobet'||dugum==='ekin:yeminYukari'||dugum==='ekin:yeminBesle'){
   s.flags.talk='';
   // Son SIMDILIK KAPALI: Kul Ocagi ve Kul kalbi kaldirildi, dolayisiyla
   // yemini muhurleyecek nesne de yok. Dugum duruyor ki metin ve secimler
   // kaybolmasin; yeni son mekani gelince bu kosul geri acilacak.
   return {message:'Undur başını sallıyor: “Kalp olmadan yemin tutmaz. Henüz değil.”'};
   /* eslint-disable no-unreachable */
   s.flags.yemin=dugum==='ekin:yeminNobet'?'nobet':dugum==='ekin:yeminYukari'?'yukari':'besle';
   s.ending=s.flags.yemin==='besle'?'claim':'seal';s.flags.coreStarted=true;gainXp(s,200);
   s.journal.unshift(s.ending==='seal'?`Yemin ettin: ${s.flags.yemin==='nobet'?'kapıyı bekleyeceksin':'yukarıda kalanları arayacaksın'}. Yarık kapandı.`:'İlk yemini yeniledin: besleyeceksin, o uyuyacak. Kül kalbi sığınağa bağlandı.');
   return {message:'Birinci bölüm tamamlandı.',special:'ending'};}
  s.flags.talk=dugum;return {message:''};}
 let xp=0,message='';
 switch(action){
 case 'close':return {message:'',special:'close'};
 case 'story:bitir':s.flags.talk='';return {message:''};
 case 'shop':return {message:'',special:'shop'};
 case 'rest':s.hp=stats(s).maxHp;message='Dinlendin. Canın tamamen yenilendi.';break;
 case 'mira_start':if(s.flags.medicineStarted)return {message:''};s.flags.medicineStarted=true;message='Yeni görev: Bir doz umut.';break;
 case 'boran_start':if(s.flags.ledgerStarted)return {message:''};s.flags.ledgerStarted=true;message='Yeni görev: Defterdeki isim.';break;
 case 'ekin_start':if(s.flags.coreStarted)return {message:''};s.flags.coreStarted=true;message='Yeni görev: Kül ve yemin.';break;
 case 'mira_deliver':if(s.flags.medicineDone||!removeItem(s,'medicine'))return {message:''};s.flags.medicine='haven';s.flags.medicineDone=true;s.flags.medicineStarted=true;s.gold+=35;addItem(s,'potion',2);xp=130;message='İlaç sığınağa ulaştı. +35 altın, +2 iksir.';break;
 case 'mira_confess':if(s.flags.medicine!=='rauf'||s.flags.medicineDone)return {message:''};s.flags.medicineDone=true;s.flags.medicineStarted=true;xp=130;addItem(s,'potion');message='Mirna kararını kabul etti. Bir hayat kurtardın.';break;
 case 'rauf_heal':if(s.flags.fugitive==='reported'||s.flags.medicine||!removeItem(s,'medicine'))return {message:''};s.flags.medicine='rauf';s.flags.medicineStarted=true;addItem(s,'blood');xp=35;message='Rauf iyileşti. Sana Gece dişi kılıcını verdi.';break;
 case 'rauf_protect':case 'rauf_report':if(s.flags.fugitive)return {message:''};s.flags.fugitive=action==='rauf_protect'?'protected':'reported';s.flags.ledgerStarted=true;addItem(s,'ledger');xp=50;message=action==='rauf_protect'?'Rauf’un sırrını korumaya söz verdin.':'Rauf sığınağa dönüp teslim olacak.';break;
 case 'boran_deliver':if(s.flags.ledgerDone||!s.flags.fugitive||!removeItem(s,'ledger'))return {message:''};s.flags.ledgerDone=true;s.flags.ledgerStarted=true;xp=140;s.gold+=25;addItem(s,s.flags.fugitive==='protected'?'life':'guard');message=s.flags.fugitive==='protected'?'Rauf’un ismini gizledin. Yaşam halkası kazandın.':'Defteri ve Rauf’u teslim ettin. Muhafız kılıcı kazandın.';break;
 // Son artik dogrudan bitmiyor: once yemin dugumu acilir (ekin:muhur / ekin:besle),
 // oradaki soz sonu tetikler. Kosullar burada da denetlenir ki dugum bos acilmasin.
 case 'ending_seal':case 'ending_claim':if(true)return {message:'Önce Mirna ve Alf’in görevlerini tamamla.'};s.flags.talk=action==='ending_seal'?'ekin:muhur':'ekin:besle';return {message:''};
 case 'nil_odun':if(s.flags.nilOdun||!removeItem(s,'wood'))return {message:''};s.flags.nilOdun=true;xp=20;message='Lin odunu aldı: “Bu gece de yanar.”';break;
 case 'ayaz_haber':if(s.flags.ayazHaber||!s.flags.sozNil)return {message:''};s.flags.ayazHaber='soylendi';xp=30;message=s.flags.sozNil==='verildi'?'Lin’e verdiğin sözü tuttun. Tiga: “…Yanıyor demek.”':'Tiga: “…Yanıyor demek.”';break;
 case 'ceset_kurdele':if(s.flags.kurdeleAlindi)return {message:''};s.flags.kurdeleAlindi=true;addItem(s,'kurdele');message='Kurdeleyi Rauf’un bileğinden çözdün.';break;
 case 'alf_kurdele':if(!removeItem(s,'kurdele'))return {message:''};s.flags.alfKurdele='verildi';xp=40;message='Alf kurdeleyi avucunda tuttu: “…Yedi yaşında mıydı? Bana söylememişti.”';break;
 default:return {message:''};
 }
 if(message)s.journal.unshift(message);return {message,leveled:xp?gainXp(s,xp):false};
}
// Only accept bounded, known save fields. A broken or older save never replaces a valid run.
export function parseSave(raw:string):State|null{try{const s=JSON.parse(raw) as State;if(s.version!==1||!s.started||!ZONES[s.zone]||!Number.isFinite(s.x)||!Number.isFinite(s.y)||s.x<0||s.y<0||s.x>1200||s.y>1200||!Number.isFinite(s.hp)||s.hp<=0||!Number.isFinite(s.gold)||s.gold<0||!Number.isFinite(s.xp)||s.xp<0||!Number.isInteger(s.level)||s.level<1||s.level>5||!Number.isInteger(s.points)||s.points<0||!s.inventory||typeof s.inventory!=='object'||!s.equipment||!s.skills||!s.flags||typeof s.flags!=='object'||Array.isArray(s.flags)||!Array.isArray(s.opened)||!Array.isArray(s.killed)||!Array.isArray(s.journal)||![s.opened,s.killed,s.journal].every(a=>a.every(v=>typeof v==='string'))||!['power','vigor','agility'].every(k=>Number.isInteger(s.skills[k as keyof State['skills']])&&s.skills[k as keyof State['skills']]>=0)||!Number.isFinite(s.playtime)||!Object.entries(s.inventory).every(([k,v])=>k in ITEMS&&Number.isInteger(v)&&Number(v)>0)||ITEMS[s.equipment.weapon]?.kind!=='weapon'||ITEMS[s.equipment.armor]?.kind!=='armor'||(s.equipment.ring!==null&&ITEMS[s.equipment.ring]?.kind!=='ring')||![s.equipment.weapon,s.equipment.armor,s.equipment.ring].every(id=>id===null||s.inventory[id])||![null,'seal','claim'].includes(s.ending))return null;// Eski kayitlarda silahsiz mod yok; eklenmezse oyuncu ona gecemez.
 s.inventory.yumruk=s.inventory.yumruk||1;
 // Ok yuvasi sonradan eklendi; eski kayitta yok.
 s.equipment.ok=s.equipment.ok||'arrow';
 s.hp=Math.min(s.hp,stats(s).maxHp);return s}catch{return null}}
