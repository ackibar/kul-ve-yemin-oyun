/** Oyun surumu. Her yayina cikan degisiklikte 0.1 artar: 0.1, 0.2 ... 0.9,
 *  sonra 1.0, 1.1 diye devam eder. Ekranin sol altinda gorunur. */
export const SURUM='15.6';
/** Gelisim asamasi. Oyun oynanabilir ama icerik ve sistemler (item seti, dil
 *  secenegi, masaustu arayuzu) hala eksik - yani alfa. Beta'ya gecisi bu sabit
 *  tasir; surum numarasiyla ayri tutuldu ki 1.x sayimi bozulmasin. */
export const ASAMA = 'alpha';

// 'forge' (Kul Ocagi) kaldirildi: eski zindan assetleriyle yapilmis tek
// mekandi. Bekci, Kul kalbi ve iki son da onunla birlikte cikti; oyunun
// sonu yeni bir mekanla bastan kurulacak.
/** 'test100': ADI yaniltici - eskiden 100x100 olcek denemesiydi, artik gercek
 *  bir mekan: terk edilmis tas koridor (86x48, tek parca boyali sahne).
 *  Id BILEREK degistirilmedi: mevcut kayitlarda state.zone='test100' olabilir,
 *  yeniden adlandirmak onlari kirardi. */
export type Zone = 'haven' | 'disari' | 'yikik' | 'magara' | 'cistern' | 'tunel' | 'test100';
export type ItemId = 'elmesale'|'tac'|'migfer'|'cakil'|'tuzet'|'durusu'|'petek'|'muhur'|'okzehir'|'mizrak'|'balta'|'hancer'|'topuz'|'yemin'|'uzunyay'|'okates'|'okdelici'|'okcengel'|'pelerin'|'ocakz'|'kanm'|'yeminh'|'merhem'|'kavanoz'|'toz'|'tatar'|'kemik'|'yelek'|'gozu'|'bileme'|'yumruk'|'rusty'|'guard'|'ember'|'blood'|'bow'|'leather'|'chain'|'ash'|'copper'|'life'|'wind'|'potion'|'tonic'|'medicine'|'ledger'|'wood'|'torch'|'arrow'|'kurdele';
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
 *   zehir      - ok isabet edende kac saniye zehir birakir. Atesten farki:
 *                daha uzun surer, saniye basina daha az vurur ve hedefi
 *                YAVASLATIR - patlayici degil, yipratici bir hasar.
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
export type Item = {id:ItemId;name:string;kind:'weapon'|'armor'|'ring'|'ammo'|'consumable'|'quest';description:string;rarity:'Sıradan'|'Nadir'|'Eşsiz'|'Görev';icon:string;attack?:number;defense?:number;hp?:number;price:number;menzilli?:boolean;hiz?:number;okHasar?:number;atesBagisik?:boolean;altinKat?:number;canGoster?:boolean;menzil?:number;arkadan?:number;sersemlet?:number;okHiz?:number;yakar?:number;delici?:boolean;ceker?:boolean;zehir?:number;kulKalkan?:number;yavaslik?:number;oldurunceCan?:number;kurtarma?:number;alan?:number;iyilesme?:number;sprite?:string};
export const ITEMS:Record<ItemId,Item>={
 // Silahsiz mod bir "esya" olarak tutuluyor: boylece silah secme ekraninda
 // digerleriyle ayni sirada cikiyor ve kusanma akisi degismiyor.
 /* Yanan mesale ELDE: torch kullanilinca envantere girer ve kusanilir, sonunce
  *  cikar. Zayif vurur ama tutusturur. Satilmaz, dusmez. */
 elmesale:{id:'elmesale',name:'Elde meşale',kind:'weapon',description:'Yanan meşale. Zayıf vurur ama tutuşturur; karanlıkta yolunu açar.',rarity:'Sıradan',icon:'flame',attack:5,price:0,sprite:'mesale',yakar:2},
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
 okzehir:{id:'okzehir',name:'Zehirli ok',kind:'ammo',description:'İsabet ettiğini 8 saniye zehirler: yavaş ama uzun hasar, hedef ağırlaşır.',rarity:'Nadir',icon:'flame',price:7,zehir:8},
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
 /* Obruk'un kileri: kul yagmadan onceki GERCEK yiyecek. Baska hicbir
  *  saticida yok, bu yuzden fiyatlari da baska bir dunyadan. */
 tuzet:{id:'tuzet',name:'Tuzlu et',kind:'consumable',description:'Gerçek et. 60 can yeniler. Tadı kül yağmadan önceki dünyadan kalma.',rarity:'Nadir',icon:'heart',price:26},
 durusu:{id:'durusu',name:'Duru su',kind:'consumable',description:'Külsüz su. 25 can yeniler ve 30 saniye Kül Ovası canını eritemez.',rarity:'Nadir',icon:'potion',price:30},
 petek:{id:'petek',name:'Bal peteği',kind:'consumable',description:'20 can, ardından 15 saniye boyunca her saniye 4 can. Yavaş ama uzun.',rarity:'Nadir',icon:'potion',price:34,iyilesme:15},
 muhur:{id:'muhur',name:'Obruk mührü',kind:'ring',description:'Bir soylunun mühür yüzüğü. Kimse tanımıyor artık — altın hâlâ tanıyor: bulduğun altın %35 artar.',rarity:'Eşsiz',icon:'ring',price:120,altinKat:1.35},
 potion:{id:'potion',name:'Can iksiri',kind:'consumable',description:'45 can yeniler. Savaş sırasında da içilebilir.',rarity:'Sıradan',icon:'potion',price:12},
 tonic:{id:'tonic',name:'Köz toniği',kind:'consumable',description:'20 saniye boyunca +8 saldırı.',rarity:'Nadir',icon:'flame',price:20},
 wood:{id:'wood',name:'Odun',kind:'consumable',description:'Ateşin yanına gidip yakarak meşale yapabilirsin.',rarity:'Sıradan',icon:'book',price:5},
 torch:{id:'torch',name:'Meşale',kind:'consumable',description:'90 saniye boyunca etrafını aydınlatır. Karanlık yerlerde onsuz iki adım ötesini göremezsin.',rarity:'Sıradan',icon:'flame',price:9},
 tac:{id:'tac',name:'Ongun’un tacı',kind:'quest',description:'Paslı demir. Bildiği tek işlev Obruk’a satılmak; başka kimse istemiyor. Taşıyan bilir.',rarity:'Görev',icon:'gem',price:0},
 migfer:{id:'migfer',name:'Son muhafızın miğferi',kind:'armor',description:'+8 savunma, +10 azami can. İçi kül dolu: Kül Ovası’nda canın %40 daha yavaş erir.',rarity:'Eşsiz',icon:'shield',defense:8,hp:10,price:0,kulKalkan:.6},
 cakil:{id:'cakil',name:'Dünyanın son çakılı',kind:'quest',description:'Uslu öyle diyor. Ağır değil; ağırlığı unvanında. Ne işe yaradığını Uslu da bilmiyor.',rarity:'Görev',icon:'gem',price:0},
 medicine:{id:'medicine',name:'Son ilaç',kind:'quest',description:'Tek bir doz. Mirna’nın hastaları mı, yaralı kaçak mı?',rarity:'Görev',icon:'potion',price:0},
 ledger:{id:'ledger',name:'Nöbet defteri',kind:'quest',description:'Ocak muhafızlarının yemin defteri. Rauf’un adı çizili. Alf bunu bekliyor.',rarity:'Görev',icon:'book',price:0},
 kurdele:{id:'kurdele',name:'Kırmızı kurdele',kind:'quest',description:'Rauf’un bileğinden. Kızınındı. Alf bunu hiç görmedi.',rarity:'Görev',icon:'ring',price:0},
};
export const ZONES:Record<Zone,{name:string;subtitle:string;danger:string}>={haven:{name:'Son Sığınak',subtitle:'Ateşin hâlâ yandığı yer',danger:'Güvenli bölge'},disari:{name:'Kül Ovası',subtitle:'Fırtınanın altında kalan dünya',danger:'Fırtına · nefes alınmaz'},yikik:{name:'Yıkık Ev',subtitle:'Külün giremediği tek oda',danger:'Kapalı · güvenli'},magara:{name:'Sarnıç Ağzı',subtitle:'Sığınağın altındaki ilk karanlık',danger:'Tenha'},cistern:{name:'Unutulmuş Sarnıç',subtitle:'Taşların hatırladığı sırlar',danger:'Seviye 1–3'},tunel:{name:'Dar Geçit',subtitle:'Sarnıcın altına inen yarık',danger:'Zifiri karanlık · meşale şart'},test100:{name:'Terk Edilmiş Koridor',subtitle:'Sütunları çökmüş, molozla dolmuş geçit',danger:'Tenha'}};
export interface State {version:1;started:boolean;zone:Zone;x:number;y:number;hp:number;xp:number;level:number;gold:number;points:number;skills:{power:number;vigor:number;agility:number};inventory:Partial<Record<ItemId,number>>;equipment:{weapon:ItemId;armor:ItemId;ring:ItemId|null;ok?:ItemId};flags:Record<string,boolean|string>;opened:string[];killed:string[];journal:string[];playtime:number;ending:string|null;
 /** Sandiklarin ICINDEKILER. Sandik artik "acilinca hepsini al" degil, iki
  *  yonlu bir kap: oyuncu alabilir ve koyabilir. Anahtar sandik id'si.
  *  Eski kayitlarda yok - opened[] ile geriye donuk uyumlu (bkz. parseSave). */
 sandiklar?:Record<string,Partial<Record<ItemId,number>>>;
 /** Sandiktaki altin; alininca sifirlanir. */
 sandikAltin?:Record<string,number>;}
export const XP=[0,100,260,490,790];
export const newState=():State=>({version:1,sandiklar:{},sandikAltin:{},started:true,zone:'haven',x:15*16,y:14*16,hp:100,xp:0,level:1,gold:18,points:0,skills:{power:0,vigor:0,agility:0},inventory:{yumruk:1,rusty:1,leather:1,potion:3},equipment:{weapon:'rusty',armor:'leather',ring:null,ok:'arrow'},flags:{},opened:[],killed:[],journal:['Son Sığınak’a vardın. Önce şifacı Mirna ile konuş.'],playtime:0,ending:null});
export function stats(s:State){const weapon=ITEMS[s.equipment.weapon],armor=ITEMS[s.equipment.armor],ring=s.equipment.ring?ITEMS[s.equipment.ring]:null;return {maxHp:100+(s.level-1)*12+s.skills.vigor*18+(armor.hp||0)+(ring?.hp||0),attack:(weapon.attack||0)+(s.equipment.weapon==='yemin'&&Number(s.flags.raufCan||0)>0?6:0)+(ring?.attack||0)+(s.level-1)*2+s.skills.power*4,defense:armor.defense||0,dodge:Math.max(.65,2.2-s.skills.agility*.25-(s.equipment.ring==='wind'?.6:0))}}
export function addItem(s:State,id:ItemId,count=1){s.inventory[id]=(s.inventory[id]||0)+count;}
export function removeItem(s:State,id:ItemId){if(!s.inventory[id])return false;s.inventory[id]!--;if(!s.inventory[id])delete s.inventory[id];return true;}
/** Sandiktan oyuncuya ya da tersi: tek yonlu, adet bazli tasima.
 *  Kaynak yoksa hicbir sey yapmaz; sayac sifirlanirsa anahtar silinir. */
export function tasi(kaynak:Partial<Record<ItemId,number>>,hedef:Partial<Record<ItemId,number>>,id:ItemId,adet=1){
 const var_=kaynak[id]||0;if(var_<=0)return 0;
 const n=Math.min(adet,var_);
 kaynak[id]=var_-n;if(!kaynak[id])delete kaynak[id];
 hedef[id]=(hedef[id]||0)+n;return n;}
/** Sandigin kabini ILK ACILISTA dunya verisinden doldurur. `opened` eski
 *  kayitlarda "bu sandik bosaltildi" demek; o sandiklar bos acilir. */
export function sandikAc(s:State,id:string,items?:[ItemId,number][],gold=0){
 if(!s.sandiklar)s.sandiklar={};if(!s.sandikAltin)s.sandikAltin={};
 if(s.sandiklar[id])return false;
 const ilk=!s.opened.includes(id);
 s.sandiklar[id]={};s.sandikAltin[id]=ilk?gold:0;
 if(ilk){for(const [iid,n] of items||[])s.sandiklar[id]![iid]=(s.sandiklar[id]![iid]||0)+n;
  s.sandiklar[id]!.arrow=(s.sandiklar[id]!.arrow||0)+10;}
 return ilk;}
export function gainXp(s:State,n:number){s.xp+=n;let leveled=false;while(s.level<5&&s.xp>=XP[s.level]){s.level++;s.points++;leveled=true;}if(leveled){s.hp=stats(s).maxHp;s.journal.unshift(`Seviye ${s.level}: yeni bir yetenek puanı kazandın.`)}return leveled;}
export function equip(s:State,id:ItemId){if(!s.inventory[id])return false;const kind=ITEMS[id].kind;if(kind!=='weapon'&&kind!=='armor'&&kind!=='ring'&&kind!=='ammo')return false;if(kind==='ammo')s.equipment.ok=id;else s.equipment[kind]=id;s.hp=Math.min(s.hp,stats(s).maxHp);return true;}
export function spendPoint(s:State,key:keyof State['skills']){if(s.points<1||!['power','vigor','agility'].includes(key))return false;s.points--;s.skills[key]++;if(key==='vigor')s.hp+=18;return true;}
/** Saticilar. `zam` fiyat carpani: Alf malzemeyi maliyetine verir (1),
 *  Obruk dunyanin sonundan kar eder (2.5). Liste ayni zamanda satin alma
 *  YETKISI: bir esya hangi saticinin listesindeyse yalnizca ondan alinir. */
export const SATICILAR:Record<string,{liste:ItemId[];zam:number}>={
 boran:{liste:['potion','tonic','torch','bileme','merhem','kavanoz','toz','chain','copper','guard','bow','arrow','tatar','kemik','yelek','gozu','mizrak','balta','hancer','topuz','pelerin','okates','okzehir','okdelici','okcengel'],zam:1},
 obruk:{liste:['tuzet','durusu','petek','muhur','ash','ocakz','kavanoz'],zam:2.5},
};
/** Obruk'a "bey" diyen oyunciya daha az zam yapar: kibri satin alinabilir. */
export function zamOrani(s:State,satici:string){const z=SATICILAR[satici]?.zam??1;return satici==='obruk'&&s.flags.obrukSaygi==='bey'?z-.35:z;}
export const fiyat=(s:State,id:ItemId,satici:string)=>Math.round(ITEMS[id].price*zamOrani(s,satici));
export function buy(s:State,id:ItemId,satici='boran'){const item=ITEMS[id];const v=SATICILAR[satici];if(!v||!v.liste.includes(id))return false;const p=fiyat(s,id,satici);if(s.gold<p)return false;if(item.kind!=='consumable'&&s.inventory[id])return false;s.gold-=p;addItem(s,id,id==='arrow'?10:ITEMS[id].kind==='ammo'?6:1);return true;}
export function questList(s:State){return [
 {id:'medicine',title:'Bir doz umut',done:!!s.flags.medicineDone,active:!!s.flags.medicineStarted,step:s.flags.medicineDone?(s.flags.medicine==='rauf'?'Rauf’u kurtardın. Mirna kararını öğrendi.':'İlaç sığınağın hastalarına ulaştı.'):s.flags.medicine==='rauf'?'Kararını Mirna’ya anlat.':s.inventory.medicine?'İlacı Mirna’ya götür veya yaralı Rauf’u ver.':'Sarnıcın kuzeydoğu odasındaki ilacı bul.'},
 {id:'ledger',title:'Defterdeki isim',done:!!s.flags.ledgerDone,active:!!s.flags.ledgerStarted,step:s.flags.ledgerDone?(s.flags.fugitive==='protected'?'Rauf’u sırrını korudun.':'Rauf’u muhafızlara teslim ettin.'):s.inventory.ledger?'Defteri Alf’e götür.': 'Sarnıcın doğusunda Rauf’u bul. Hikâyesini dinle ve ne yapacağına karar ver.'},
 // Istege bagli: Lin'in atesi ve yukarida bekleyen agabeyi. Ana sonu kilitlemez.
 {id:'ates',title:'Sönmeyen ateş',done:s.flags.ayaz==='indi',active:!!s.flags.nil||!!s.flags.ayaz||!!s.flags.nilSondu,step:s.flags.nilSondu?'Ateş söndü. Lin artık odun taşımıyor.':s.flags.ayaz==='indi'?'Tiga sığınağa indi. Lin’in ateşi yanmaya devam ediyor.':s.flags.ayaz==='kaldi'?'Tiga Yıkık Ev’de kalmayı seçti. Sara’yı bekliyor.':s.flags.ayaz?'Tiga Yıkık Ev’de. Onu aşağı inmeye ikna edecek bir sebep bul.':s.flags.sozNil==='verildi'?'Lin’e söz verdin: ağabeyini görürsen ateşin yandığını söyleyeceksin. Kül Ovası’ndaki yıkığa bak.':'Lin’in ağabeyi on bir gündür yukarıda. Kül Ovası’ndaki yıkığa bak.'}
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
  case 'nil':return !s.flags.sozNil&&!s.flags.nilSondu;
  case 'selvi':return !s.flags.sozSelvi;
  case 'ayaz':return s.flags.ayaz!=='indi'&&s.flags.ayaz!=='kaldi';
  case 'muhafiz':return !s.flags.muhafiz;
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
 if?:(s:State)=>boolean;
 /** Secenegin altinda kucuk uyari: geri alinamaz kararlarda gosterilir. */
 note?:string}[]};
const AYRIL={label:'Gitmem gerek.',to:null};
export const STORY:Record<string,Record<string,StoryNode>>={
 /* Uslu: firtinaya cikip geri donen deli. Herkes cok ciddi, o degil. Tuhaf
  *  sorular sorar; cevabin sonucu yok, sadece cevabi var. Sorular sirayla
  *  doner (flags.usluSoru), yedincisinde dunyanin son cakilini verir. */
 uslu:{
  'soru1':{text:'Kül yağıyor ya. Peki kül nereye yağıyor, biz altındayken? Daha aşağı mı? O zaman en dipteki adam bize ne diyor?',
   choices:[{label:'Hiçbir şey demiyor.',to:'c1a'},{label:'Bilmiyorum.',to:'c1b'}]},
  'c1a':{text:'Doğru. Çünkü ağzı dolu.',choices:[AYRIL]},
  'c1b':{text:'Ben de. O yüzden soruyorum. Sormak bedava. Obruk’a sorma ama; o bunu da satar.',choices:[AYRIL]},
  'soru2':{text:'Sen hiç bir taşa isim koydun mu? Ben koydum. Adı Tuhn. …Yok yok, o başka Tuhn. Bu taş daha az konuşuyor.',
   choices:[{label:'Taşlar konuşmaz.',to:'c2a'},{label:'Senin adın ne?',to:'c2b'}]},
  'c2a':{text:'Bu da öyle diyor.',choices:[AYRIL]},
  'c2b':{text:'Uslu. Kendim koydum, kimse koymadı diye. Beğenmedin mi? Sana da bir tane koyayım: Ayakkabı. Çünkü ayakkabın var. Ayakkabısız adam soru soramaz, ayağı üşür.',choices:[AYRIL]},
  'soru3':{text:'Alf’in kılıcı var, Mirna’nın ilacı var, Obruk’un eti var. Senin neyin var?',
   choices:[{label:'Yeminim var.',to:'c3a'},{label:'Kılıcım var.',to:'c3b'}]},
  'c3a':{text:'Yemin mi. …O yenmiyor ama iyi yakıyor, Undur öyle diyor. Belki kışın işe yarar.',choices:[AYRIL]},
  'c3b':{text:'Onu herkes görüyor. Görünmeyen neyin var diye sordum aslında. …Neyse, unuttum.',choices:[AYRIL]},
  'soru4':{text:'Dışarı çıktım. Fırtınaya. Fırtına bana üç soru sordu, üçüne de cevap verdim, o yüzden sesim böyle. Sen hiç bir fırtınaya cevap verdin mi?',
   choices:[{label:'Ne sordu?',to:'c4a'},{label:'Fırtına soru sormaz.',to:'c4b'}]},
  'c4a':{text:'Hatırlamıyorum. Cevapları hatırlıyorum: evet, hayır ve “biraz”. Sırasını karıştırdım. Belki o yüzden.',choices:[AYRIL]},
  'c4b':{text:'Bunu fırtınaya söyle. Ben söyledim, kızdı.',choices:[AYRIL]},
  'soru5':{text:'Gündüz mü şimdi, gece mi? Kimse bilmiyor. Ben bir sistem buldum: Lin’in ateşi yanıyorsa gündüz. Hep yanıyor. Demek hep gündüz. Peki uyuyanlar neden uyuyor?',
   choices:[{label:'Yorgunlar.',to:'c5a'},{label:'Sen uyuyor musun?',to:'c5b'}]},
  'c5a':{text:'Gündüz uyumak ayıp değil. Gece uyumak ayıp değil. İkisi de yokken uyumak — işte o cesaret.',choices:[AYRIL]},
  'c5b':{text:'Sırayla. Önce sol göz, sonra sağ. Kül ikisine birden giremez.',choices:[AYRIL]},
  'soru6':{text:'Kral konuşmuyor. Ben hep konuşuyorum. İkimizi toplasan normal bir adam eder. Bölsen ne olur?',
   choices:[{label:'Yarım adam.',to:'c6a'},{label:'Saçma.',to:'c6b'}]},
  'c6a':{text:'İki tane yarım. Biri taçlı, biri taçsız. Ben taçsız olanı aldım, daha hafif.',choices:[AYRIL]},
  'c6b':{text:'Saçma şeyler ağır değildir, o yüzden ben hep saçma taşıyorum. Sen ne taşıyorsun? …Söyleme. Gördüm. Ağır.',choices:[AYRIL]},
  'soru7':{text:'Bir çakıl buldum. Külün altından çıkardım. Bence dünyanın son çakılı. Sana vereyim mi?',
   choices:[{label:'Ver.',to:'cakilVer'},{label:'Sende kalsın.',to:'c7b'}]},
  'cakilVer':{text:'Al. Kaybetme; kaybedersen dünyanın son çakılını kaybeden adam olursun, o unvan ağırdır.',choices:[AYRIL]},
  'c7b':{text:'Peki. Ama bil ki reddettin. Çakıl bunu unutmaz; çakılların hafızası iyidir, taş oldukları için.',choices:[AYRIL]},
  'soru8':{text:'Sığınak neden “son”? Bir sonrakinin olmayacağını nereden biliyorlar? Belki bir sonraki bizden habersizdir, biz de ondan. İki “son” sığınak, birbirinden habersiz. Sence hangisi haklı?',
   choices:[{label:'İkisi de.',to:'c8a'},{label:'Sadece burası var.',to:'c8b'}]},
  'c8a':{text:'Undur’a söyle bunu yazsın. Yazmaz. Ben söyledim, “şiir değil bu” dedi. Şiir olsa yazacaktı demek.',choices:[AYRIL]},
  'c8b':{text:'Sen de mi. Herkes böyle diyor. Herkes haklı olamaz; o kadar haklı adam buraya sığmaz.',choices:[AYRIL]},
 },
 /* Obruk: kul yagmadan once kimsenin inanmadigi seye inanip herkesin kilerini
  *  ucuza toplamis soylu. Kimseyle paylasmiyor, satiyor - hem de altina.
  *  'altin' dugumu oyunun altin ekonomisinin dunya ici gerekcesi: altin
  *  gercekten ise yaramaz, ama Obruk onu istedigi surece eski dunya duruyormus
  *  gibi yapabiliyor. Iki parali askeri var; ucreti ETLE odeniyor ve kiler
  *  bitiyor - Karga bunu sayiyor, Obruk saymaktan korkuyor. */
 obruk:{
  '1':{text:'Kapıda dikilme, gölgen sofranın üstüne düşüyor. …Aşağıdan mısın? Ellerin boş. Boş ellilerle işim olmaz — ama bakmak bedava. Sadece bakmak; oraya dikkat et.',
   choices:[{label:'Sen kimsin?',to:'2'},{label:'Bunların hepsi senin mi?',to:'mal'},{label:'Neden altın istiyorsun?',to:'altin'},
    {label:'Sığınaktaki kralı tanıyor musun?',to:'kral',if:s=>!!s.flags.kralGoruldu},AYRIL]},
  'kral':{text:'Kral mı? Tacı var, kileri yok. Ben kilerimle beyim, o tacıyla hiç. Aramızdaki fark şu: ben aç değilim. …Eskiden sofrasında otururdum. Ekmeği bana o verirdi. Şimdi ben kimseye vermiyorum; bunu ondan öğrendim, tersinden.',
   choices:[AYRIL]},
  '2':{text:'Obruk derler. Yüzüme değil, arkamdan. Asıl adım sülalemle beraber külün altında kaldı; çağıran kalmayınca isim de ölüyormuş, bunu burada öğrendim. Eskiden “bey” derlerdi. …De hadi. Bir kere. Bedava.',
   choices:[{label:'Bey.',to:'bey'},{label:'Obruk.',to:'obruk'},AYRIL]},
  'bey':{text:'Gördün mü, ağzın yanmadı. Otur demeyeceğim — oturacak yerim yok, hepsi dolu. Ama senden bir parça az alırım. Yalnız senden. Kimseye söyleme, ucuz adam sanırlar.',
   choices:[{label:'Bunların hepsi senin mi?',to:'mal'},AYRIL]},
  'obruk':{text:'Obruk. …Evet. Yerin çöktüğü, içine ne atarsan at dolmadığı yer. Bu adı bana açlar taktı; aç adamın dili keskin olur. Kızmıyorum. Ad koymak bedava, et değil.',
   choices:[{label:'Bunların hepsi senin mi?',to:'mal'},{label:'Neden altın istiyorsun?',to:'altin'},AYRIL]},
  'mal':{text:'Hepsi benim. Kül yağmadan önce herkes küpünü, tarlasını, kızının çeyizini satıyordu — korkan ucuza satar. Ben korkmadım, aldım. Şimdi korkmayanın kileri dolu. Buna hırsızlık diyorlar; ben pazarlık diyorum. İkisi de imzalıydı.',
   choices:[{label:'Sığınakta aç insanlar var.',to:'mirna'},{label:'Adamların kim?',to:'adam'},AYRIL]},
  'altin':{text:'Altının kıymeti mi? Hiç. Ne yenir, ne yakılır, ne su tutar. …Ama altın istendiği sürece pazar vardır, pazar durduğu sürece ben varım. Senden et istersem yarın biri benden et ister. Altın istersem hâlâ eski dünyadayız demektir. O dünyada ben beyim. Öbüründe bir çuval yağım.',
   choices:[{label:'Eski dünya bitti.',to:'altin2'},AYRIL]},
  'altin2':{text:'…Biliyorum. Her gece biliyorum. Sabah unutuyorum. Sen de unut; unutursan bana ucuza gelirsin.',
   choices:[{label:'Adamların kim?',to:'adam'},AYRIL]},
  'mirna':{text:'Şifacı geldi. Bir kez. “Hastalar var” dedi; ben de “var” dedim, doğruydu. Sonra fiyatı söyledim. Bir daha gelmedi. Bedava veren adamın kileri iki hafta sürer, benimki on bir yıldır duruyor. Hangimiz akıllı?',
   choices:[{label:'İnsanlar ölüyor.',to:'mirna2'},AYRIL]},
  'mirna2':{text:'İnsanlar benden önce de ölüyordu, benden sonra da ölecek. Aradaki çukuru ben kazmadım. …Yeter. Alacaksan al, konuşacaksan başkasını bul; konuşmak beni acıktırıyor.',
   choices:[{label:'Adamların kim?',to:'adam'},AYRIL]},
  'adam':{text:'Karga ile Çakal. Adlarını ben koymadım, kendileri koymuş — kendine leş adı koyan adam ucuza çalışır. Haftada iki avuç tuzlu et, bir tas duru su. Sadakat bu kadar tutuyor. Beni sevmiyorlar; sevmelerine gerek yok, aç kalmamaları yeter.',
   choices:[{label:'Ya et biterse?',to:'adam2'},AYRIL]},
  'adam2':{text:'…Bitmez. Bu soruyu bir daha sorma. Sorarsan düşünürüm, düşünürsem sayarım, sayarsam uyuyamam. Git şimdi.',
   choices:[AYRIL]},
  // Karga'nin sirri: oyuncu kileri saydigini ogrendiyse burayi acabilir.
  'ihbar':{text:'…Karga mı? Saydı mı? Kaç hafta dedi? …Hayır. Söyleme. Söylersen bilirim; bilirsem gece uyanık kalırım, uyanık kalan adam hata yapar. …Söyle.',
   choices:[{label:'Yirmi bir hafta.',to:'ihbarSoyle'},{label:'Hiçbir şey saymadı.',to:'ihbarSakla'}]},
  'ihbarSoyle':{text:'Yirmi bir. …Yirmi bir hafta. Al şunu, say diye değil, sus diye veriyorum. Bir de şunu bil: bir adamın kaç hafta ömrü kaldığını bilmek, o adamı zaten bir kere öldürmektir.',
   choices:[AYRIL]},
  'ihbarSakla':{text:'Saymadı demek. …Güzel. Sayan adam ilerisini düşünüyor demektir, ileriyi düşünen uşak uşak kalmaz. Sen de saymamış ol.',
   choices:[AYRIL]},
 },
 /* Kralin son muhafizi: on bir yildir ovada devriyede, emir geri alinmadi.
  *  Konusma ya gecis izniyle (haber) ya kavgayla (dovus) biter. */
 muhafiz:{
  '1':{text:'Kimin adamısın? Cevap ver. Cevabın yoksa yolun da yok.',
   choices:[{label:'Kimsenin.',to:'2'},{label:'Kral sığınakta. Susuyor.',to:'haber'},
    {label:'Kral öldü.',to:'oldu',if:s=>s.flags.kral==='oldu'},{label:'Kral öldü.',to:'yalan',if:s=>s.flags.kral!=='oldu'},AYRIL]},
  '2':{text:'Kimsenin adamı kimsenin yolundan geçemez. On bir yıldır bu ovadayım; kral emri geri almadı, ben de bırakmadım. Kül zırhımı doldurdu, boşaltmadım. Boşaltırsam yeminim dökülür.',
   choices:[{label:'Kral sığınakta. Susuyor.',to:'haber'},{label:'Yeminin bitti. Geç.',to:'dovus'},AYRIL]},
  'haber':{text:'Susuyor mu. …Susuyor. O zaman emir duruyor; konuşsaydı geri alırdı. Geç. Ama ona söyle: son muhafızı hâlâ ovada. Bir kelime yeter — “dön” desin.',
   choices:[{label:'Söylerim.',to:null}]},
  'oldu':{text:'Öldü mü. …Kim? …Sen. Zırhında onun kanı yok ama gözünde var. O zaman emir bitti; ben de bittim. Kılıcım son bir iş yapar.',
   choices:[{label:'Gel.',to:'dovus'}]},
  'yalan':{text:'Yalan. Ovada yalan söyleyen adam söylediği yerde ölür; yer çok.',
   choices:[{label:'Gel.',to:'dovus'}]},
 },
 /* Karga: parali asker. Konusan olan o; Cakal tek cumlelik. */
 karga:{
  '1':{text:'Dur. …Tamam, durdun. Silahını da öyle gevşek tut. Bey misafir sevmez, parayı sever; ikisinin arasında biz duruyoruz.',
   choices:[{label:'Ona neden çalışıyorsun?',to:'2'},{label:'Adın neden Karga?',to:'ad'},AYRIL]},
  '2':{text:'Karnım için. Haftada iki avuç tuzlu et, bir tas su. Dışarıda bunun yarısı için adam kesiyorlar; ben kesmiyorum bile, sadece duruyorum. İyi iş.',
   choices:[{label:'Kiler biterse ne olacak?',to:'3'},{label:'Adın neden Karga?',to:'ad'},AYRIL]},
  '3':{text:'Kileri ben sayıyorum. O saymıyor — sayamıyor; saymak yemek gibi değil, doyurmuyor. Yirmi bir hafta. …Bunu duymadın. Duyduysan ona söyleme; söylersen ben de bir şey söylerim, o zaman ikimiz de aç kalırız.',
   choices:[AYRIL]},
  'ad':{text:'Leş nerede, ben oradayım. Utanılacak bir yanı yok; leş de birinin yemeğidir. Çakal’ın adını sorma, cevap vermez. Zaten hiçbir şeye vermez.',
   choices:[{label:'Ona neden çalışıyorsun?',to:'2'},AYRIL]},
 },
 rauf:{
  '1':{text:'Sen de mi geldin? Hep gelirler. Bakma bacağıma, yürüyebiliyorum. Yürüyebiliyordum. Ne istiyorsun benden?',
   choices:[{label:'Neden buradasın?',to:'2'},{label:'Alf seni arıyor.',to:'alf1'},AYRIL]},
  '2':{text:'Kaçtım. Söylemesi kolay. Birlikteydim, nöbetteydim, sonra bir sabah yürüdüm ve durmadım. Sebebini sorarsan gülersin.',
   choices:[{label:'Gülmem. Söyle.',to:'3'},AYRIL]},
  '3':{text:'Kızım. Yedi yaşındaydı. Ben olmadan bir gece bile geçiremezdi, öyle sanıyordum. Bir baba böyle düşünür. Kaçtım ki o yaşasın.',
   choices:[{label:'Şimdi nerede?',to:'4'},AYRIL]},
  '4':{text:'…Kül yağdı. Ben yoldaydım, o yukarıdaydı. Onu kurtarmak için kaçtım ve kaçtığım için oradaydım. İkisini birden nasıl taşıyacağımı bilmiyorum.',
   choices:[{label:'Senin suçun değildi.',to:'5'},{label:'Buraya nasıl indin?',to:'yol'},AYRIL]},
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
  // Karar verildikten sonraki kisa girisler. Onceden bu durumlarda
  // diyalog 'rauf:1'e dusuyordu, yani tanisma agaci bastan basliyor ve
  // oyuncu ayni hikayeyi iki kez dinliyordu.
  'korundu1':{text:'Hâlâ buradayım. Sen söyledin, ben kaldım. Alf’in adımı duyduğu gün ikimiz de öğreniriz ne olacağını.',
   choices:[{label:'Fikrimi değiştirdim, benimle geleceksin.',to:'zorla'},{label:'Sadece bakmaya geldim.',to:null}]},
  'yenildi':{text:'…Kılıcım yerde. Nefesimi toparlayayım, sonra ardından geliyorum.',choices:[{label:'Acele etme.',to:null}]},
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
   choices:[{label:'Ne oldu yukarıda?',to:'2'},{label:'Diğerlerine ne oldu?',to:'3'},
    {label:'Yukarıda kileri dolu bir adam var.',to:'obruk',if:s=>!!s.flags.talkObruk},
    {label:'Köşedeki taçlı adam kim?',to:'kral',if:s=>!!s.flags.kralGoruldu},
    {label:'Dışarısı hep böyle miydi?',to:'firtina'},AYRIL]},
  'kral':{text:'Yazdım onu da. Sayı olarak. İsmini yazmadım; tek istediği buydu, ilk gece — yazmamam. O geceden beri ağzından başka bir şey çıkmadı. Yetmiş kişiyle indi, on dokuzla oturuyor; sayıyı benden iyi biliyor, çünkü her ölende gözleri kapıya gidiyor.',
   choices:[{label:'Neden konuşmuyor?',to:'kral2'},AYRIL]},
  'kral2':{text:'Sorma bana. Undur’a sor; o eskiyi bilir. Ben şunu bilirim: bir adam konuşmayı bırakıyorsa ya söyleyecek sözü bitmiştir ya da söylediği son söz çok pahalıya patlamıştır.',
   choices:[AYRIL]},
  // Firtina: uc hafta oncesine kadar bez sarip cikilirdi. Artik kul yagmiyor, esiyor.
  'firtina':{text:'Hayır. Üç hafta öncesine kadar bez sarıp çıkılırdı — zor ama çıkılırdı, Tuhn odun getirirdi. Sonra rüzgâr döndü. Şimdi kül yağmıyor, kül esiyor; bezden geçiyor, dişten geçiyor. Güneş zaten gelmiyordu. Şimdi hava da gelmiyor.',
   choices:[{label:'Dışarı çıkan oldu mu?',to:'firtina2'},AYRIL]},
  'firtina2':{text:'Bir kişi. Uslu. Geri geldi; kimse gelmez sanıyorduk. Geldi ama… yarısı geldi. Kalanı dışarıda soru soruyor herhâlde. Onunla konuşursan anlarsın.',
   choices:[AYRIL]},
  // Obruk'la konusulduysa acilir: sifaci ona GITTI ve fiyat duydu.
  'obruk':{text:'Obruk. …Adını duymak bile yoruyor. İki kış önce gittim; kapısında iki adam vardı, girmeme izin verdiler, çıkmama da. Hastalar için un istedim, o fiyat söyledi. O fiyatı ödeyecek altınım olsaydı hastalarım zaten ayakta olurdu.',
   choices:[{label:'Onu ikna edebilirim.',to:'obruk2'},{label:'Diğerlerine ne oldu?',to:'3'},AYRIL]},
  'obruk2':{text:'Deneme. Yalvaran insanın karşısında kendini büyük hissediyor; ona o tadı verme. …Ama bir gün adamları onu bırakırsa kapısı kendiliğinden açılır. O günü beklemeye ilaç demek doğru mu, bilmiyorum. Ben yine de bekliyorum.',
   choices:[AYRIL]},
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
   choices:[{label:'Rauf’u kendin arasana.',to:'yemin'},{label:'Neyi koruyordun?',to:'2'},{label:'Neden bu kadar yorgunsun?',to:'3'},
    {label:'Obruk’un iki silahlı adamı var.',to:'obruk',if:s=>!!s.flags.talkObruk},
    {label:'Köşedeki taçlı adam kim?',to:'kral',if:s=>!!s.flags.kralGoruldu},AYRIL]},
  // "Emri veren adam artik yok" - Alf'in agzindaki cumle. Adam orada oturuyor;
  // Alf onu emir veren adam saymiyor, o yuzden bakmiyor.
  'kral':{text:'…Köşedeki mi. Onu tanımıyorum. Tanıdığım adam emir verirdi; o adam artık yok. Köşede oturan birinin emrine uymak zorunda değilim. Bu yüzden ona bakmıyorum.',
   choices:[{label:'Kapıyı açma emrini o mu verdi?',to:'kral2'},AYRIL]},
  'kral2':{text:'Sana kim söyledi? …Fark etmez. Evet. On bir yıl önce, yukarısı kışa girerken. “Aşağıda sıcak var, kapıyı açın” dedi. Ben açtım. O sustu. İkimiz de aynı kapıyı taşıyoruz; ben konuşarak, o susarak. Hangisi daha ağır, bilmiyorum.',
   choices:[{label:'Neden bu kadar yorgunsun?',to:'3'},AYRIL]},
  'obruk':{text:'Biliyorum. İki adamı var. Ben kapıda tek başımayım, onun sofrasında iki mızrak duruyor. Eskiden buna düzensizlik derdim; şimdi düzen bu. Uzun olanı tanırım — savaşta vasat askerdir, kıtlıkta iyidir. Bana kalsa ikisini de alırdım. Ama ben et veremiyorum, yemin veriyorum; yemin karın doyurmuyor.',
   choices:[{label:'Neyi koruyordun?',to:'2'},AYRIL]},
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
   choices:[{label:'Ne yazıyorsun?',to:'2'},{label:'Küller hakkında ne biliyorsun?',to:'3'},
    {label:'Köşedeki taçlı adam kim?',to:'kral',if:s=>!!s.flags.kralGoruldu},AYRIL]},
  'kral':{text:'Ongun. Bereket demek. Yazdım, gülmedim. Yukarının kralıydı; taç babasından, babasınınkinden. Kış geldiğinde ambarlar boştu, eski metinler “aşağıda uyuyan bir sıcak var” diyordu. Metni ona ben okudum.',
   choices:[{label:'Kapıyı o mu açtırdı?',to:'kral2'},AYRIL]},
  'kral2':{text:'Emri o verdi, mandalı Alf kaldırdı, metni ben okudum. Üç kişiyiz; biri sustu, biri kapıda kaldı, biri yazıyor. Kül üçümüzün de üstüne aynı yağdı. …Tacı hâlâ başında. Kimse almıyor. Alan taşımak zorunda kalır.',
   choices:[{label:'Alf bunu biliyor mu?',to:'kral3'},AYRIL]},
  'kral3':{text:'Alf her şeyi biliyor ve hiçbirini kabul etmiyor. Ona sorarsan “o adam artık yok” der. Haklı da. Emir veren adam sustuğu gece bitti; oturan, kalanı.',
   choices:[AYRIL]},
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
  // Son zinciri (muhur/besle/yemin*) buradan kaldirildi: Kul Ocagi ve Kul
  // kalbi cikinca ulasilamaz hale gelmisti. Metinleri git gecmisinde;
  // yeni son mekani gelince oradan geri alinacak.
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
   choices:[{label:'Bakmayacağım. Ne yapmamı istersin?',to:'soz'},{label:'Belki dönmez.',to:'belki'},
    {label:'Köşedeki taçlı amca kim?',to:'kral',if:s=>!!s.flags.kralGoruldu},AYRIL]},
  // Cocuk, krala iyi davranan tek kisi. Kralin ellerini uzattigi tek yer.
  'kral':{text:'Kral amca. Ona ateşten köz götürüyorum, ısınsın diye. Konuşmuyor ama ellerini uzatıyor. Alf amca “götürme” diyor, ben götürüyorum. Ağabeyim de “söndürme” dedi; ikisi aynı şey bence.',
   choices:[AYRIL]},
  'belki':{text:'Biliyorum. Alf amca da “dönmez” dedi, sonra özür diledi. Dönmese de söndürmem. Söz ona verildi; ona geri verilmeden bitmez.',
   choices:[{label:'Ne yapmamı istersin?',to:'soz'},
    /* Kirma yolu. Cocugun kimligi SOZUNDE; onu kirmanin yolu "agabeyin oldu"
       demek degil, sozu anlamsizlastirmak. Iki kademe: once direnir, sonra
       kirilir. Agabeyi indiyse yol kapali - ortada bekleyecek kimse yok. */
    {label:'Bu ateş kimseyi geri getirmiyor.',to:'kir1',if:s=>s.flags.ayaz!=='indi'&&!s.flags.nilSondu},AYRIL]},
  'kir1':{text:'…Getirmiyor. Biliyorum. Ateş ağabeyimi getirsin diye yanmıyor ki. Dönerse ilk göreceği şey olsun diye yanıyor. Fark var.',
   choices:[{label:'Tamam. Yanmaya devam etsin.',to:null},
    {label:'Sana söz verdirdi ki sen kalasın. Gitmek isteyen söz verdirir.',to:'kirildi',
     note:'Bu sözü geri alamazsın'}]},
  'kirildi':{text:'…Yukarı çıkmak isteyen. …Sen öyle dedin. …Peki.',choices:[AYRIL]},
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
   ...n.choices.filter(c=>!c.if||c.if(s)).map(c=>({label:c.label,action:c.to?`story:${id}:${c.to}`:'story:bitir',...(c.note?{note:c.note}:{})})),
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
   text:s.flags.nilSondu?'…Söndü. Bakma bana. Odun taşımak kolaydı; zor olan neden taşıdığını bilmekti. Sen onu aldın.'
    :s.flags.kral==='oldu'?'Kral amcayı… sen mi? …Köz götürecek kimsem kalmadı. Ateşi yine söndürmem. Ama sana bakmam.'
    :s.flags.ayaz==='indi'?'Ağabeyim geldi! Koşarak geldi, külden bembeyazdı. Ateşin yandığını gördü. …Mirna onu yazdı. Yaşayanlara.'
    :s.flags.ayazHaber==='soylendi'?'Söyledin mi ona? Ateşin yandığını? …Tamam. O zaman biliyor. Bilmesi yeter, gelmese de.'
    :s.flags.ayaz==='kaldi'?'Onu gördün, değil mi? Yüzünden belli. Bekliyor. …Sara teyze ona “bekle” dedi, bana “söndürme”. İkimiz de tutuyoruz.'
    :(s.flags.rauf==='takip'?'Yanındaki adam ateşe değil bileğine bakıyor. …Şşş. ':'Şşş. ')+'Ateşe odun atıyorum. Ağabeyim “söndürme, dönerim” dedi. Ben de söndürmüyorum. Sen kimsin?',
   choices:[...(s.flags.nilSondu?[]:[{label:'Ağabeyin nerede?',action:'story:nil:1'}]),
    ...(s.inventory.wood&&!s.flags.nilOdun&&!s.flags.nilSondu?[{label:'Sana odun getirdim.',action:'nil_odun',note:'1 odun ver'}]:[]),
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
 if(id==='muhafiz'){
  const tac=!!s.inventory.tac||s.flags.tac==='satildi';
  return {who:'Son Muhafız',role:'Kralın adamı',portrait:15,
   text:tac?'…Heybendeki. O taç. Onu ancak bir şekilde almış olabilirsin. Konuşmayacağız.'
    :s.flags.muhafiz==='gecti'?(s.flags.kralMuhafizHaber?'Söyledin mi? …Söylemedi. Biliyordum. Geç; yol senin, nöbet benim.':'Söyledin mi ona? …Henüz. Geç. Söylediğinde bir kelime yeter: dön.')
    :'Dur. Bu yol kralın yoludur. Miğferin içinden ses kül gibi geliyor. …Kimin adamısın?',
   choices:tac?[{label:'Kılıcını çek.',action:'story:muhafiz:dovus'}]
    :s.flags.muhafiz==='gecti'?[close]
    :[{label:'Konuşalım.',action:'story:muhafiz:1'},close]};}
 if(id==='kralCeset')return {who:'Kral',role:'Küllerin kralı',portrait:13,
  text:s.flags.tac==='satildi'?'Başı çıplak. Lin bir daha köz getirmedi.':'Köşede yatıyor. Taç yanında değil; heybende.',choices:[close]};
 // Uslu: soru sirasi flags.usluSoru'da doner. Cevabin sonucu yok, cevabi var.
 if(id==='uslu'){
  const n=(Number(s.flags.usluSoru||0)%8)+1;
  return {who:'Uslu',role:'Fırtınadan dönen',portrait:14,
   text:s.inventory.cakil?'Çakıl duruyor mu? …Bakma, yüzünden belli, duruyor. Yeni bir sorum var, ister misin?'
    :s.flags.usluSoru?'Yine sen! Bir sorum daha var. Cevabı bilmiyorum, o yüzden sana soruyorum; sen de bilmiyorsan iki kişi olduk, iki kişi bir sığınak eder.'
    :'Dur. Sen yeni misin? Yeni adamlar sorulara daha iyi cevap verir, eskilerin cevapları küllenmiş. Bir sorum var.',
   choices:[{label:'Sor.',action:`story:uslu:soru${n}`,note:'Uslu’nun sorusu'},close]};}
 // Kral: hic konusmuyor. Metin onun sessizligini anlatir; oyuncu baskalarindan
 // ogrendikce sessizlik degisir (kaynak sayisi kral* bayraklarindan).
 if(id==='kral'){
  const bilgi=['kralMirna','kralAlf','kralUndur','kralLin','kralObruk'].filter(k=>s.flags[k]).length;
  return {who:'Kral',role:'Küllerin kralı',portrait:13,
   text:s.flags.kralMuhafizHaber?'Dinliyor. Ovada bir adamın onu beklediğini duyuyor. “Dön” demiyor. Diyemiyor; ağzı kıpırdıyor, ses çıkmıyor.'
    :s.flags.kralAlf&&s.flags.kralUndur?'Elini kaldırıyor, yarım. Bir emir verir gibi. Sonra eli düşüyor. Kimseye emir vermiyor artık; elin hatırladığı bu.'
    :bilgi>=2?'Sana bakıyor. Uzun. Sonra elini tacına götürüyor; düzeltmiyor, sadece orada olduğunu kontrol ediyor. Hâlâ orada. Bir şey demiyor.'
    :bilgi>=1?'Gözlerini kaldırıyor. Tacın altında kül var, sakalında kül var. Bir şey demiyor; demeyeceğini artık biliyorsun.'
    :'Köşede oturuyor. Başında paslı bir taç; gözleri ateşe değil duvara bakıyor. Sen konuşunca kıpırdamıyor.',
   choices:[...(s.flags.muhafiz==='gecti'&&!s.flags.kralMuhafizHaber?[{label:'Muhafızın ovada. “Dön” de, yeter.',action:'kral_haber',note:'Son muhafızın ricası'}]:[]),{label:'Onu rahat bırak.',action:'kral_bak'}]};}
 /* Obruk ve iki parali askeri. Yeri SIMDILIK Sarnic Agzi: kendi odasi
  *  uretilince oraya tasinacak (bkz. world.ts magara bolumu). */
 if(id==='obruk'){
  const bey=s.flags.obrukSaygi==='bey';
  return {who:'Obruk',role:bey?'Kendi kapısının beyi':'Kileri dolu adam',portrait:10,
   text:s.flags.tac==='satildi'?'Tacı ocağın üstüne astım. Kimse bakmıyor. Sen de bakma; baktıkça değeri düşüyor.'
    :s.flags.obrukSir==='soylendi'?'Sen… sen bana o sayıyı söyledin. O gün bugündür geceleri sayıyorum. Yüzünü görünce yine sayıyorum. Al malını, git.'
    :s.flags.obrukSir==='sakladin'?'Yine sen. Sormadığın bir şey vardı, sormadan gittin. Öyle adamları severim; ucuza gelmezler ama uyutmazlar da.'
    :s.flags.talkObruk?'Yine sen. Bir şey alacak mısın, yoksa hava mı alıyorsun? Burada hava da bedava değil; kokusu etten geliyor.'
    :'Kapıda dikilme. …Konuşacaksan konuş, alacaksan al. İkisi aynı fiyat değil.',
   choices:[{label:'Konuşalım.',action:'story:obruk:1'},
    ...(s.flags.obrukDepo==='biliyorum'&&!s.flags.obrukSir?[{label:'Adamın kileri sayıyor.',action:'story:obruk:ihbar',note:'Karar · Karga’nın sırrı'}]:[]),
    ...(s.inventory.tac?[{label:'Sende bir taç var. Ne verirsin?',action:'obruk_tac',note:'Ongun’un tacı · 150 altın'}]:[]),
    {label:'Malına bakayım.',action:'shop:obruk',note:bey?'Beye yakışır fiyat':'Fiyatlar iki buçuk kat'},close]};}
 if(id==='karga')return {who:'Karga',role:'Obruk’un adamı',portrait:11,
  text:s.flags.obrukSir==='soylendi'?'Bey bu hafta kilere iki kez indi. İki kez. …Sen bir şey söyledin, değil mi? Söyleme, bilmek istemiyorum. Bilirsem bir şey yapmam gerekir.'
   :s.flags.obrukDepo==='biliyorum'?'Sayıyı biliyorsun. Ağzını da benim gibi kapalı tut, ikimiz de kışı görelim.'
   :'Yaklaşma demedim. Ama durdurmadım da. Aradaki farkı bilen adam uzun yaşar.',
  choices:[{label:'Konuşalım.',action:'story:karga:1'},close]};
 if(id==='cakal')return {who:'Çakal',role:'Obruk’un adamı',portrait:12,
  text:s.flags.obrukDepo==='biliyorum'?'…Karga çok konuşuyor.':'Ben konuşmam. Karga konuşur. İkimize bir ağız yeter.',
  choices:[close]};
 if(id==='mira')return {who:'Mirna',role:'Sığınağın şifacısı',portrait:3,text:(s.flags.kral==='oldu'?'On sekiz. Yazdım. Seni de yazdım; başka bir sayfaya. ':'')+(s.flags.medicineDone?(s.flags.medicine==='rauf'?'Bir hayat kurtardın. Buradakiler için başka bir yol bulacağız. Yaralarını sarayım.':'İlaç işe yaradı. Bu gece kimseyi kaybetmedik. Dinlen; yaralarını sarayım.'):s.flags.medicine==='rauf'?'Ellerin boş… ama yüzünde söylemek istediğin bir şey var.':s.inventory.medicine?'Buldun! Bir şişenin bu kadar ağır bir umut taşıyacağını düşünmezdim.':'Aşağıdaki sarnıçta bir doz ilaç kaldı. Burada ateşler içinde yatanlar var. Onu bana getirir misin?'),choices:[{label:'Bana hikâyeni anlat.',action:'story:mira:1'},...(!s.flags.medicineStarted?[{label:'İlacı bulacağım.',action:'mira_start',note:'Görev · Bir doz umut'}]:[]),...(s.inventory.medicine?[{label:'İlaç senin. Hastaları iyileştir.',action:'mira_deliver',note:'+35 altın · Mirna’nın güveni'}]:[]),...(s.flags.medicine==='rauf'&&!s.flags.medicineDone?[{label:'İlacı yaralı birine verdim. Onu bırakamadım.',action:'mira_confess',note:'Kararını Mirna’ya anlat'}]:[]),{label:'Dinlen ve yaralarını sar.',action:'rest',note:'Canın tamamen yenilenir'},close]};
 if(id==='boran')return {who:'Alf',role:s.flags.alfSir==='soylendi'?'Eski kapı muhafızı':'Kapı muhafızı',portrait:2,text:(s.flags.kral==='oldu'?'Emri veren adamı öldürdün. Hafifledin mi? Ben hafiflemedim; aynı kapıyı şimdi tek başıma taşıyorum. ':'')+(s.flags.alfSir==='soylendi'?'Yeminim bir yalanın üstüne kuruluymuş. Demek ki artık bu kapıdan geçebilirim. Nereye gideceğimi bilmiyorum ama gidebilirim.':s.flags.ledgerDone?(s.flags.fugitive==='protected'?'Defter geri döndü, adam dönmedi. Onu gördüğünü biliyorum. Bir gün bana bunu neden yaptığını anlatırsın.':'Rauf’u getirdin. Gerisi benimle onun arasında. Sana borçluyum — ama teşekkür edemem.'):s.inventory.ledger?'Defteri tanıdım. Peki adam? Rauf nerede?':'Birliğimden bir adam kaçtı. Rauf. Aşağıda, sarnıcın doğusunda bir yerde. Nöbet defterimi de aldı — birliğin yeminleri onda yazılı; onun adı da, üstü çizili. Çizen bendim. Onu bul ve bana getir. Defteri de. Ben gidemem; sebebini sorarsan anlatırım.'),choices:[{label:'Bana hikâyeni anlat.',action:'story:boran:1'},
  ...(s.inventory.kurdele?[{label:'Rauf’un bileğindeki kurdele. Kızınınmış.',action:'alf_kurdele',note:'Kurdeleyi Alf’e ver'}]:[]),
  ...(s.flags.alfSir==='biliyorum'?[{label:'Undur’un sana söylemediği bir şey var.',action:'story:boran:sir',note:'Karar · Onbir yılın sahibi'}]:[]),
  ...((s.flags.rauf==='korundu'||s.flags.rauf==='serbest')&&!s.flags.alfKarsi
    ?[{label:'Bana bir şey soracaktın.',action:'story:boran:karsi',note:'Yüzleşme · Rauf'}]:[]),...(!s.flags.ledgerStarted?[{label:'Rauf’u bulup getireceğim.',action:'boran_start',note:'Görev · Defterdeki isim'}]:[]),...(s.inventory.ledger?[{label:s.flags.fugitive==='protected'?'Defter terk edilmişti. Rauf’u görmedim.':'Rauf teslim olmayı kabul etti.',action:'boran_deliver',note:s.flags.fugitive==='protected'?'Rauf’u koru · Yaşam halkası':'Rauf’u teslim et · Muhafız kılıcı'}]:[]),{label:'Malzemelerine bakabilir miyim?',action:'shop'},close]};
 if(id==='ekin')return {who:'Undur',role:'Yeminlerin arşivcisi',portrait:4,text:(s.flags.kral==='oldu'?'Ongun. Bereket. Altına çizgi çektim. Tacı ne yaptın, sorma; yazacağım. ':'')+(s.ending?(s.flags.alfSir==='soylendi'?'Bir yemin, onu tutan insanlar kadar güçlüdür. Alf’inki yalanmış; sen söyledin, o da bıraktı. Bunu yazdım.':s.flags.alfSir==='sakladin'?'Bir yemin, onu tutan insanlar kadar güçlüdür. Alf hâlâ kendi yükünü taşıyor — sayende. Bunu da yazdım.':'Bir yemin, onu tutan insanlar kadar güçlüdür. Seninkinin izini bu taşlar uzun süre taşıyacak.'):'Sarsıntılar artıyor. Aşağıda, sarnıcın da altında bir yer var — eski kalp orada atıyor. Yolunu henüz bulamadım. Bulduğumda sana ilk ben söylerim.'),choices:[{label:'Bana hikâyeni anlat.',action:'story:ekin:1'},close]};
 if(id==='rauf')return {who:'Rauf',role:'Yaralı kaçak',portrait:5,text:s.flags.fugitive==='reported'?'Teslim olacağım. Defteri de götür; adımın altına ne yazdıysa bir de yüzüme okusun.':s.flags.medicine==='rauf'?'Nefes almak artık acıtmıyor. Bunu unutmayacağım. Batıdaki kol, ocağa giden kapıyı açar.': 'Alf’in nöbet defteri bende. Adım içinde, üstü çizili — ben çizmedim, o çizdi. Ocak kapısını açık bulunca içeri girdim; bacağım burada bitti. Alf beni dinlemez. Bana yardım eder misin?',choices:[{label:'Bana hikâyeni anlat.',action:'story:rauf:1'},...(s.inventory.medicine&&s.flags.fugitive!=='reported'?[{label:'Bu ilacı al. Yaşaman gerek.',action:'rauf_heal',note:'Son ilacı harca · Mirna’ya götüremeyeceksin'}]:[]),close]};
 return {who:'Eski mühür',role:'Kül Ocağı',portrait:1,text:'Kalp hâlâ atıyor. Onu Undur’a götürmelisin.',choices:[close]};
}
export function choose(s:State,action:string):{message:string;special?:'close'|'shop'|'ending';leveled?:boolean;satici?:string}{
 // Hikaye dugumleri: story:<npc>:<dugum>
 if(action.startsWith('story:')&&action!=='story:bitir'){
  const dugum=action.slice(6);
  // Rauf dallanmasi: korumak sohbeti bitirir, zorlamak dovusu baslatir
  // Rauf'un kaderi ARTIK TEK YERDE. Once iki paralel karar vardi: ana
  // diyalogdaki "Sirrini koruyacagim / Alf'e teslim olmalisin" ve hikaye
  // agacindaki "Burada kal / Benimle geleceksin". Oyuncu ayni karari iki kez
  // veriyor, ustelik birbiriyle celisebiliyordu. Ana diyalogdaki cift
  // kaldirildi; defter de karar anında geliyor.
  // Obruk'a "bey" demek kalici bir indirim acar: kibri satin alinabilir.
  // Uslu'nun sorulari: soruya GIRINCE sira ilerler, cevap serbest.
  if(/^uslu:soru\d$/.test(dugum)){s.flags.usluSoru=String(Number(s.flags.usluSoru||0)+1);s.flags.talk=dugum;return {message:''};}
  if(dugum==='uslu:cakilVer'){s.flags.talk=dugum;if(!s.inventory.cakil){addItem(s,'cakil');s.journal.unshift('Uslu sana dünyanın son çakılını verdi. Ne işe yaradığını o da bilmiyor.');}return {message:'Dünyanın son çakılı heybende.'};}
  // Kral kaynaklari: kimden ogrenildigi bayrakla tutulur, kralin sessizligi buna gore degisir.
  if(dugum==='mira:kral'){s.flags.kralMirna=true;s.flags.talk=dugum;return {message:''};}
  if(dugum==='boran:kral2'){s.flags.kralAlf=true;s.flags.talk=dugum;s.journal.unshift('Alf söyledi: kapıyı açma emrini köşedeki adam vermiş. Kral.');return {message:''};}
  if(dugum==='ekin:kral'){s.flags.kralUndur=true;s.flags.talk=dugum;s.journal.unshift('Undur kralın adını söyledi: Ongun. Bereket demek.');return {message:''};}
  if(dugum==='nil:kral'){s.flags.kralLin=true;s.flags.talk=dugum;return {message:''};}
  if(dugum==='obruk:kral'){s.flags.kralObruk=true;s.flags.talk=dugum;return {message:''};}
  // Son muhafiz: gecis izni ya da kavga.
  if(dugum==='muhafiz:haber'){s.flags.muhafiz='gecti';s.flags.talk=dugum;s.journal.unshift('Son muhafız yolu açtı. Krala tek kelime götürmeni istedi: dön.');return {message:''};}
  if(dugum==='muhafiz:dovus'){s.flags.muhafiz='dovus';s.flags.talk='';return {message:'Son muhafız kılıcını kaldırdı.',special:'close'};}
  if(dugum==='obruk:bey'){s.flags.obrukSaygi='bey';s.flags.talk=dugum;s.flags.talkObruk=true;
   return {message:'Obruk’un yüzü yumuşadı. Fiyatları senin için biraz indi.'};}
  if(dugum==='obruk:obruk'){s.flags.obrukSaygi='obruk';s.flags.talk=dugum;s.flags.talkObruk=true;
   return {message:''};}
  if(dugum==='karga:3'){s.flags.obrukDepo='biliyorum';s.flags.talk=dugum;
   s.journal.unshift('Karga kileri sayıyor: yirmi bir hafta. Obruk bunu bilmiyor.');
   return {message:'Kilerin ne kadar dayanacağını öğrendin.'};}
  if(dugum==='obruk:ihbarSoyle'){s.flags.obrukSir='soylendi';s.flags.talk=dugum;s.gold+=30;
   s.journal.unshift('Obruk’a kilerin sayıldığını söyledin. Susman için 30 altın verdi.');
   return {message:'Obruk 30 altın verdi. Eli titriyordu.'};}
  if(dugum==='obruk:ihbarSakla'){s.flags.obrukSir='sakladin';s.flags.talk=dugum;
   s.journal.unshift('Karga’nın saydığını Obruk’tan sakladın.');
   return {message:''};}
  if(dugum==='obruk:1'){s.flags.talkObruk=true;s.flags.talk=dugum;return {message:''};}
  if(dugum==='rauf:kal'){s.flags.rauf='korundu';s.flags.talk=dugum;
   s.flags.fugitive='protected';s.flags.ledgerStarted=true;addItem(s,'ledger');
   return {message:'Rauf’u korudun. Defteri sana verdi; Alf’e adını söylemeyeceksin.'};}
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
   s.flags.fugitive='protected';s.flags.ledgerStarted=true;if(!s.inventory.ledger)addItem(s,'ledger');
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
  /* Lin kirildi: atesi birakti. Sonuc GORSEL ve kalici - siginagin ocaklarindan
     biri soner (world.ts alev2). Undur'un cumlesi bunun agirligini tasiyor:
     ocaklarin hala yanmasini o cocuga bagliyordu. */
  if(dugum==='nil:kirildi'){s.flags.nilSondu='evet';s.flags.talk=dugum;
   s.journal.unshift('Lin’in sözünü anlamsızlaştırdın. Odunu bıraktı; ateş söndü.');
   return {message:'Ateş söndü.'};}
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
 case 'kral_bak':s.flags.kralGoruldu=true;return {message:'',special:'close'};
 case 'kral_haber':s.flags.kralMuhafizHaber=true;s.journal.unshift('Krala muhafızının beklediğini söyledin. “Dön” diyemedi.');return {message:''};
 // Tacin tek islevi: Obruk'a satilmak. Degersiz altin icin degersiz tac.
 case 'obruk_tac':if(!s.inventory.tac)return {message:''};removeItem(s,'tac');s.gold+=150;s.flags.tac='satildi';s.journal.unshift('Ongun’un tacını Obruk’a 150 altına sattın.');return {message:'Obruk tacı aldı. “Yüz elli. Sus, pazarlık yok.”'};
 case 'shop':return {message:'',special:'shop'};
  // shop:<satici> - hangi kisinin tezgahi acilacak. Sade 'shop' Alf demek.
  case 'shop:obruk':return {message:'',special:'shop',satici:'obruk'};
 case 'rest':s.hp=stats(s).maxHp;message='Dinlendin. Canın tamamen yenilendi.';break;
 case 'mira_start':if(s.flags.medicineStarted)return {message:''};s.flags.medicineStarted=true;message='Yeni görev: Bir doz umut.';break;
 case 'boran_start':if(s.flags.ledgerStarted)return {message:''};s.flags.ledgerStarted=true;message='Yeni görev: Defterdeki isim.';break;
 case 'ekin_start':if(s.flags.coreStarted)return {message:''};s.flags.coreStarted=true;message='Yeni görev: Kül ve yemin.';break;
 case 'mira_deliver':if(s.flags.medicineDone||!removeItem(s,'medicine'))return {message:''};s.flags.medicine='haven';s.flags.medicineDone=true;s.flags.medicineStarted=true;s.gold+=35;addItem(s,'potion',2);xp=130;message='İlaç sığınağa ulaştı. +35 altın, +2 iksir.';break;
 case 'mira_confess':if(s.flags.medicine!=='rauf'||s.flags.medicineDone)return {message:''};s.flags.medicineDone=true;s.flags.medicineStarted=true;xp=130;addItem(s,'potion');message='Mirna kararını kabul etti. Bir hayat kurtardın.';break;
 case 'rauf_heal':if(s.flags.fugitive==='reported'||s.flags.medicine||!removeItem(s,'medicine'))return {message:''};s.flags.medicine='rauf';s.flags.medicineStarted=true;addItem(s,'blood');xp=35;message='Rauf iyileşti. Sana Gece dişi kılıcını verdi.';break;
 // 'rauf_protect' / 'rauf_report' kaldirildi: karar hikaye agacina tasindi.
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
export function parseSave(raw:string):State|null{try{const s=JSON.parse(raw) as State;/* Sandik kaplari sonradan eklendi; eski kayitta yoksa bos baslar. */if(!s.sandiklar||typeof s.sandiklar!=='object')s.sandiklar={};if(!s.sandikAltin||typeof s.sandikAltin!=='object')s.sandikAltin={};if(s.version!==1||!s.started||!ZONES[s.zone]||!Number.isFinite(s.x)||!Number.isFinite(s.y)||s.x<0||s.y<0||s.x>1200||s.y>1200||!Number.isFinite(s.hp)||s.hp<=0||!Number.isFinite(s.gold)||s.gold<0||!Number.isFinite(s.xp)||s.xp<0||!Number.isInteger(s.level)||s.level<1||s.level>5||!Number.isInteger(s.points)||s.points<0||!s.inventory||typeof s.inventory!=='object'||!s.equipment||!s.skills||!s.flags||typeof s.flags!=='object'||Array.isArray(s.flags)||!Array.isArray(s.opened)||!Array.isArray(s.killed)||!Array.isArray(s.journal)||![s.opened,s.killed,s.journal].every(a=>a.every(v=>typeof v==='string'))||!['power','vigor','agility'].every(k=>Number.isInteger(s.skills[k as keyof State['skills']])&&s.skills[k as keyof State['skills']]>=0)||!Number.isFinite(s.playtime)||!Object.entries(s.inventory).every(([k,v])=>k in ITEMS&&Number.isInteger(v)&&Number(v)>0)||ITEMS[s.equipment.weapon]?.kind!=='weapon'||ITEMS[s.equipment.armor]?.kind!=='armor'||(s.equipment.ring!==null&&ITEMS[s.equipment.ring]?.kind!=='ring')||![s.equipment.weapon,s.equipment.armor,s.equipment.ring].every(id=>id===null||s.inventory[id])||![null,'seal','claim'].includes(s.ending))return null;// Eski kayitlarda silahsiz mod yok; eklenmezse oyuncu ona gecemez.
 s.inventory.yumruk=s.inventory.yumruk||1;
 // Ok yuvasi sonradan eklendi; eski kayitta yok.
 s.equipment.ok=s.equipment.ok||'arrow';
 s.hp=Math.min(s.hp,stats(s).maxHp);return s}catch{return null}}
