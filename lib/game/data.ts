/** Oyun surumu. Her yayina cikan degisiklikte 0.1 artar: 0.1, 0.2 ... 0.9,
 *  sonra 1.0, 1.1 diye devam eder. Ekranin sol altinda gorunur. */
export const SURUM = '0.1';

export type Zone = 'haven' | 'disari' | 'magara' | 'cistern' | 'forge';
export type ItemId = 'rusty'|'guard'|'ember'|'blood'|'bow'|'leather'|'chain'|'ash'|'copper'|'life'|'wind'|'potion'|'tonic'|'medicine'|'ledger'|'core'|'wood'|'torch'|'arrow';
export type Item = {id:ItemId;name:string;kind:'weapon'|'armor'|'ring'|'consumable'|'quest';description:string;rarity:'Sıradan'|'Nadir'|'Eşsiz'|'Görev';icon:string;attack?:number;defense?:number;hp?:number;price:number};
export const ITEMS:Record<ItemId,Item>={
 rusty:{id:'rusty',name:'Yıpranmış kılıç',kind:'weapon',description:'Sığınaktan kalan son hatıra. +10 saldırı.',rarity:'Sıradan',icon:'sword',attack:10,price:0},
 guard:{id:'guard',name:'Muhafız kılıcı',kind:'weapon',description:'Alf’in sözü kadar sağlam. +17 saldırı.',rarity:'Nadir',icon:'sword',attack:17,price:65},
 ember:{id:'ember',name:'Köz kılıcı',kind:'weapon',description:'+23 saldırı. Vuruşlar 3 saniye boyunca yakar.',rarity:'Eşsiz',icon:'flame',attack:23,price:110},
 blood:{id:'blood',name:'Gece dişi',kind:'weapon',description:'+19 saldırı. Her vuruşta 3 can yeniler.',rarity:'Eşsiz',icon:'sword',attack:19,price:95},
 bow:{id:'bow',name:'Avcı yayı',kind:'weapon',description:'+18 saldırı. Menzilli ok fırlatır.',rarity:'Nadir',icon:'sword',attack:18,price:75},
 arrow:{id:'arrow',name:'Ok',kind:'consumable',description:'Avcı yayı ile menzilli atış yapmak için kullanılır.',rarity:'Sıradan',icon:'sword',price:2},
 leather:{id:'leather',name:'Gezgin ceketi',kind:'armor',description:'Her darbeyi 2 puan hafifletir.',rarity:'Sıradan',icon:'shirt',defense:2,price:0},
 chain:{id:'chain',name:'Halka zırh',kind:'armor',description:'+5 savunma. Pasın altında hâlâ sağlam.',rarity:'Nadir',icon:'shield',defense:5,price:50},
 ash:{id:'ash',name:'Kül zırhı',kind:'armor',description:'+8 savunma, +20 azami can.',rarity:'Eşsiz',icon:'shield',defense:8,hp:20,price:100},
 copper:{id:'copper',name:'Bakır yüzük',kind:'ring',description:'+3 saldırı. İçinde küçük bir yemin saklı.',rarity:'Sıradan',icon:'ring',attack:3,price:25},
 life:{id:'life',name:'Yaşam halkası',kind:'ring',description:'+25 azami can.',rarity:'Nadir',icon:'heart',hp:25,price:55},
 wind:{id:'wind',name:'Rüzgâr mührü',kind:'ring',description:'Kaçınma 0,6 saniye daha hızlı dolar.',rarity:'Nadir',icon:'wind',price:60},
 potion:{id:'potion',name:'Can iksiri',kind:'consumable',description:'45 can yeniler. Savaş sırasında da içilebilir.',rarity:'Sıradan',icon:'potion',price:12},
 tonic:{id:'tonic',name:'Köz toniği',kind:'consumable',description:'20 saniye boyunca +8 saldırı.',rarity:'Nadir',icon:'flame',price:20},
 wood:{id:'wood',name:'Odun',kind:'consumable',description:'Ateşin yanına gidip yakarak meşale yapabilirsin.',rarity:'Sıradan',icon:'book',price:5},
 torch:{id:'torch',name:'Meşale',kind:'consumable',description:'60 saniye boyunca karanlık zindanları aydınlatır.',rarity:'Nadir',icon:'flame',price:15},
 medicine:{id:'medicine',name:'Son ilaç',kind:'quest',description:'Tek bir doz. Mirna’nın hastaları mı, yaralı kaçak mı?',rarity:'Görev',icon:'potion',price:0},
 ledger:{id:'ledger',name:'Kayıp defter',kind:'quest',description:'Sığınağın erzak kayıtları. Alf bunu bekliyor.',rarity:'Görev',icon:'book',price:0},
 core:{id:'core',name:'Kül kalbi',kind:'quest',description:'Sığınağın altında atan güç. Undur ne yapılacağını biliyor.',rarity:'Görev',icon:'gem',price:0},
};
export const ZONES:Record<Zone,{name:string;subtitle:string;danger:string}>={haven:{name:'Son Sığınak',subtitle:'Ateşin hâlâ yandığı yer',danger:'Güvenli bölge'},disari:{name:'Kül Ovası',subtitle:'Örtünün altında kalan dünya',danger:'Ölümcül · uzun kalma'},magara:{name:'Sarnıç Ağzı',subtitle:'Sığınağın altındaki ilk karanlık',danger:'Tenha'},cistern:{name:'Unutulmuş Sarnıç',subtitle:'Taşların hatırladığı sırlar',danger:'Seviye 1–3'},forge:{name:'Kül Ocağı',subtitle:'Yeminin başladığı yer',danger:'Seviye 3–5'}};
export interface State {version:1;started:boolean;zone:Zone;x:number;y:number;hp:number;xp:number;level:number;gold:number;points:number;skills:{power:number;vigor:number;agility:number};inventory:Partial<Record<ItemId,number>>;equipment:{weapon:ItemId;armor:ItemId;ring:ItemId|null};flags:Record<string,boolean|string>;opened:string[];killed:string[];journal:string[];playtime:number;ending:string|null;}
export const XP=[0,100,260,490,790];
export const newState=():State=>({version:1,started:true,zone:'haven',x:15*16,y:14*16,hp:100,xp:0,level:1,gold:18,points:0,skills:{power:0,vigor:0,agility:0},inventory:{rusty:1,leather:1,potion:3},equipment:{weapon:'rusty',armor:'leather',ring:null},flags:{},opened:[],killed:[],journal:['Son Sığınak’a vardın. Önce şifacı Mirna ile konuş.'],playtime:0,ending:null});
export function stats(s:State){const weapon=ITEMS[s.equipment.weapon],armor=ITEMS[s.equipment.armor],ring=s.equipment.ring?ITEMS[s.equipment.ring]:null;return {maxHp:100+(s.level-1)*12+s.skills.vigor*18+(armor.hp||0)+(ring?.hp||0),attack:(weapon.attack||0)+(ring?.attack||0)+(s.level-1)*2+s.skills.power*4,defense:armor.defense||0,dodge:Math.max(.65,2.2-s.skills.agility*.25-(s.equipment.ring==='wind'?.6:0))}}
export function addItem(s:State,id:ItemId,count=1){s.inventory[id]=(s.inventory[id]||0)+count;}
export function removeItem(s:State,id:ItemId){if(!s.inventory[id])return false;s.inventory[id]!--;if(!s.inventory[id])delete s.inventory[id];return true;}
export function gainXp(s:State,n:number){s.xp+=n;let leveled=false;while(s.level<5&&s.xp>=XP[s.level]){s.level++;s.points++;leveled=true;}if(leveled){s.hp=stats(s).maxHp;s.journal.unshift(`Seviye ${s.level}: yeni bir yetenek puanı kazandın.`)}return leveled;}
export function equip(s:State,id:ItemId){if(!s.inventory[id])return false;const kind=ITEMS[id].kind;if(kind!=='weapon'&&kind!=='armor'&&kind!=='ring')return false;s.equipment[kind]=id;s.hp=Math.min(s.hp,stats(s).maxHp);return true;}
export function spendPoint(s:State,key:keyof State['skills']){if(s.points<1||!['power','vigor','agility'].includes(key))return false;s.points--;s.skills[key]++;if(key==='vigor')s.hp+=18;return true;}
export function buy(s:State,id:ItemId){const item=ITEMS[id];if(!['potion','tonic','chain','copper','guard','bow','arrow'].includes(id)||s.gold<item.price)return false;if(item.kind!=='consumable'&&s.inventory[id])return false;s.gold-=item.price;addItem(s,id,id==='arrow'?10:1);return true;}
export function questList(s:State){return [
 {id:'medicine',title:'Bir doz umut',done:!!s.flags.medicineDone,active:!!s.flags.medicineStarted,step:s.flags.medicineDone?(s.flags.medicine==='rauf'?'Rauf’u kurtardın. Mirna kararını öğrendi.':'İlaç sığınağın hastalarına ulaştı.'):s.flags.medicine==='rauf'?'Kararını Mirna’ya anlat.':s.inventory.medicine?'İlacı Mirna’ya götür veya yaralı Rauf’u ver.':'Sarnıcın kuzeydoğu odasındaki ilacı bul.'},
 {id:'ledger',title:'Defterdeki isim',done:!!s.flags.ledgerDone,active:!!s.flags.ledgerStarted,step:s.flags.ledgerDone?(s.flags.fugitive==='protected'?'Rauf’u sırrını korudun.':'Rauf’u muhafızlara teslim ettin.'):s.inventory.ledger?'Defteri Alf’e götür.': 'Sarnıcın doğusunda Rauf’u bul ve defteri al.'},
 {id:'core',title:'Kül ve yemin',done:!!s.ending,active:!!s.flags.coreStarted,step:s.ending?'Sığınağın kaderini belirledin.':s.inventory.core?'Kül kalbini Undur’a götür.':s.killed.includes('warden')?'Kül Ocağı’ndaki kalbi al.':'Kül Ocağı’na ulaş, Bekçi’yi yen ve kalbi bul.'}
 ]}
export type Choice={label:string;action:string;note?:string;disabled?:boolean};
export type Dialogue={who:string;role:string;portrait:number;text:string;choices:Choice[]};
/** Sohbet agaci: NPC'lerin derin hikayeleri.
 *  Konusma konumu `flags.talk` icinde tutulur ("mira:2" gibi); bos ise NPC'nin
 *  normal gorev diyalogu gosterilir. Her dugum bir metin ve secenekler icerir;
 *  `to` bir sonraki dugum, null ise sohbet biter ve gorev diyaloguna donulur.
 *  Basit tutuldu, sonradan derinlestirilecek. */
export type StoryNode={text:string;choices:{label:string;to:string|null}[]};
const AYRIL={label:'Gitmem gerek.',to:null};
export const STORY:Record<string,Record<string,StoryNode>>={ rauf:{
  '1':{text:'Sen de mi geldin? Hep gelirler. Bakma bacağıma, yürüyebiliyorum. Yürüyebiliyordum. Ne istiyorsun benden?',
   choices:[{label:'Neden buradasın?',to:'2'},{label:'Alf seni arıyor.',to:'alf1'},AYRIL]},
  '2':{text:'Kaçtım. Söylemesi kolay. Birlikteydim, nöbetteydim, sonra bir sabah yürüdüm ve durmadım. Sebebini sorarsan gülersin.',
   choices:[{label:'Gülmem. Söyle.',to:'3'},AYRIL]},
  '3':{text:'Kızım. Yedi yaşındaydı. Ben olmadan bir gece bile geçiremezdi, öyle sanıyordum. Bir baba böyle düşünür. Kaçtım ki o yaşasın.',
   choices:[{label:'Şimdi nerede?',to:'4'},AYRIL]},
  '4':{text:'…Kül yağdı. Ben yoldaydım, o yukarıdaydı. Onu kurtarmak için kaçtım ve kaçtığım için oradaydım. İkisini birden nasıl taşıyacağımı bilmiyorum.',
   choices:[{label:'Senin suçun değildi.',to:'5'},{label:'Alf seni arıyor.',to:'alf1'},AYRIL]},
  '5':{text:'Öyle mi? Bileğimdeki kurdeleyi görüyor musun? Onundu. Bazı geceler konuşuyor. Biliyorum, konuşmuyor. Ama konuşuyor.',
   choices:[{label:'Alf seni arıyor.',to:'alf1'},AYRIL]},
  'alf1':{text:'Alf… Demek hâlâ arıyor. O beni asla affetmez, biliyorum. Onun için kaçmak kaçmaktır, sebebi yoktur. Lütfen. Beni ona götürme.',
   choices:[{label:'Tamam. Burada kal.',to:'kal'},{label:'Benimle geleceksin.',to:'zorla'},{label:'Düşüneyim.',to:null}]},
  'kal':{text:'…Sağ ol. Bir gün bunun karşılığını veririm. Buradan başka gidecek yerim yok ama borcumu unutmam.',
   choices:[AYRIL]},
  'zorla':{text:'Hayır. HAYIR! Beni oraya götüremezsin — önce beni öldürmen gerekir!',
   choices:[{label:'Öyle olsun.',to:null},AYRIL]},
 },

 mira:{
  '1':{text:'Hikâyem mi? Ben bu sığınağın ilk gecesini gördüm. Yukarıda gökyüzü kül rengine döndüğünde, buraya yetmiş kişi indik. Şimdi on dokuzuz.',
   choices:[{label:'Ne oldu yukarıda?',to:'2'},{label:'Diğerlerine ne oldu?',to:'3'},AYRIL]},
  '2':{text:'Kimse tam olarak bilmiyor. Bir sabah ufuk turuncuydu, öğlene kadar kararmıştı. Kül yağmaya başladı ve durmadı. Kuyular kurudu, hayvanlar öldü. Biz aşağı indik çünkü başka yer kalmamıştı.',
   choices:[{label:'Kül nereden geliyor?',to:'4'},{label:'Diğerlerine ne oldu?',to:'3'},AYRIL]},
  '3':{text:'Kimi hastalıktan. Kimi yukarı çıkmak istedi ve dönmedi. Kimi de… sarnıçta bir şey var. İnenlerin hepsi geri gelmedi. Ben artık kimseyi göndermiyorum, kendim gidemediğim için de burada bekliyorum.',
   choices:[{label:'Sarnıçta ne var?',to:'5'},{label:'Ne oldu yukarıda?',to:'2'},AYRIL]},
  '4':{text:'Alf ocağın oradan geldiğini söylüyor. Undur ise küllerin bir cevap değil bir soru olduğunu yazıyor defterine. İkisi de haklı olabilir. Ben sadece öksüren insanları sayıyorum.',
   choices:[{label:'Sarnıçta ne var?',to:'5'},AYRIL]},
  '5':{text:'Su vardı, şimdi çamur var. Ve sesler. Taşın hatırladığını söylüyorlar ya, ben inanmam — ama oradan dönen herkes aynı şeyi duyduğunu söyledi. Bir uğultu. Sanki aşağıda bir şey nefes alıyor.',
   choices:[{label:'Ne oldu yukarıda?',to:'2'},AYRIL]},
 },
 boran:{
  '1':{text:'Anlatacak ne var? Kılıç taşıdım, insanlar öldü, ben ölmedim. Muhafızdım. Sonra koruyacak bir şey kalmadı, ben de burada kaldım.',
   choices:[{label:'Neyi koruyordun?',to:'2'},{label:'Neden bu kadar yorgunsun?',to:'3'},AYRIL]},
  '2':{text:'Kül Ocağı’nı. Aşağıda, sarnıcın da altında. Orada bir şey yanıyor ve yüzyıllardır yanıyor. Bizim işimiz kimsenin içeri girmemesiydi. Kimsenin çıkmaması olduğunu sonra anladık.',
   choices:[{label:'Ne çıktı oradan?',to:'4'},{label:'Neden bu kadar yorgunsun?',to:'3'},AYRIL]},
  '3':{text:'Çünkü on bir yıl nöbet tuttum ve on birinci yılda kapıyı ben açtım. Emirdi. Emri veren adam artık yok, ben varım. Uykuda bile ayaktayım sanki.',
   choices:[{label:'Ne çıktı oradan?',to:'4'},AYRIL]},
  '4':{text:'Kül. Sadece kül, öyle sandık. Ama kül yapışıyor. Nefese, taşa, insana. Bir süre sonra insanlar konuştuklarını hatırlamaz oldu. Şimdi yukarısı da öyle. Ben kapıyı açtım, gökyüzünü ben kararttım.',
   choices:[{label:'Kendini suçlama.',to:'5'},{label:'Kapı hâlâ açık mı?',to:'6'},AYRIL]},
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
   choices:[{label:'Alf kapıyı açtığını söylüyor.',to:'5'},AYRIL]},
  '5':{text:'Alf kendine fazla yükleniyor. O kapı on bir yıl önce değil, çok daha önce açıldı. O sadece son mandalı kaldırdı. Ama bunu ona söyleme — taşıdığı yük onu ayakta tutan tek şey.',
   choices:[{label:'Ne yazıyorsun?',to:'2'},AYRIL]},
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
   ...n.choices.map(c=>({label:c.label,action:c.to?`story:${id}:${c.to}`:'story:bitir'})),
  ]};
 }
 if(id==='mira')return {who:'Mirna',role:'Sığınağın şifacısı',portrait:3,text:s.flags.medicineDone?(s.flags.medicine==='rauf'?'Bir hayat kurtardın. Buradakiler için başka bir yol bulacağız. Yaralarını sarayım.':'İlaç işe yaradı. Bu gece kimseyi kaybetmedik. Dinlen; yaralarını sarayım.'):s.flags.medicine==='rauf'?'Ellerin boş… ama yüzünde söylemek istediğin bir şey var.':s.inventory.medicine?'Buldun! Bir şişenin bu kadar ağır bir umut taşıyacağını düşünmezdim.':'Aşağıdaki sarnıçta bir doz ilaç kaldı. Burada ateşler içinde yatanlar var. Onu bana getirir misin?',choices:[{label:'Bana hikâyeni anlat.',action:'story:mira:1'},...(!s.flags.medicineStarted?[{label:'İlacı bulacağım.',action:'mira_start',note:'Görev · Bir doz umut'}]:[]),...(s.inventory.medicine?[{label:'İlaç senin. Hastaları iyileştir.',action:'mira_deliver',note:'+35 altın · Mirna’nın güveni'}]:[]),...(s.flags.medicine==='rauf'&&!s.flags.medicineDone?[{label:'İlacı yaralı birine verdim. Onu bırakamadım.',action:'mira_confess',note:'Kararını Mirna’ya anlat'}]:[]),{label:'Dinlen ve yaralarını sar.',action:'rest',note:'Canın tamamen yenilenir'},close]};
 if(id==='boran')return {who:'Alf',role:'Kapı muhafızı',portrait:2,text:s.flags.ledgerDone?(s.flags.fugitive==='protected'?'Defter geri döndü, ama birkaç sayfa eksik. Bana her şeyi anlatmadığını biliyorum.':'Rauf teslim oldu. Açlık hırsızlığı açıklayabilir; bedelini ortadan kaldırmaz.'):s.inventory.ledger?'Defteri tanıdım. Peki onu çalan kişi?':'Erzak defterimiz kayıp. Rauf’u sarnıca inerken gördüm. Defteri getir. Ne olduğunu da öğren.',choices:[{label:'Bana hikâyeni anlat.',action:'story:boran:1'},...(!s.flags.ledgerStarted?[{label:'Rauf’u ve defteri bulacağım.',action:'boran_start',note:'Görev · Defterdeki isim'}]:[]),...(s.inventory.ledger?[{label:s.flags.fugitive==='protected'?'Defter terk edilmişti. Rauf’u görmedim.':'Rauf teslim olmayı kabul etti.',action:'boran_deliver',note:s.flags.fugitive==='protected'?'Rauf’u koru · Yaşam halkası':'Rauf’u teslim et · Muhafız kılıcı'}]:[]),{label:'Malzemelerine bakabilir miyim?',action:'shop'},close]};
 if(id==='ekin')return {who:'Undur',role:'Yeminlerin arşivcisi',portrait:4,text:s.ending?'Bir yemin, onu tutan insanlar kadar güçlüdür. Seninkinin izini bu taşlar uzun süre taşıyacak.':s.inventory.core?'Kalp elinde. Onunla aşağıdaki yarığı mühürleyebiliriz. Ya da gücünü sığınağa taşıyabiliriz; sıcaklık ve ışık, ama yanında tehlike de gelecek.':'Sarsıntılar artıyor. Kül Ocağı’ndaki Bekçi, eski kalbi koruyor. Onu getir. Bu sığınağın yarını hakkında bir karar vermemiz gerekecek.',choices:[{label:'Bana hikâyeni anlat.',action:'story:ekin:1'},...(!s.flags.coreStarted?[{label:'Kül kalbini getireceğim.',action:'ekin_start',note:'Ana görev · Kül ve yemin'}]:[]),...(s.inventory.core&&!s.ending?[{label:'Yarığı mühürle. Bu gücü geride bırakalım.',action:'ending_seal',note:'Güvenli bir gelecek · Bölüm sonu',disabled:!s.flags.medicineDone||!s.flags.ledgerDone},{label:'Kalbi sığınağa bağla. Karanlıkta yaşamayalım.',action:'ending_claim',note:'Güç ve sorumluluk · Bölüm sonu',disabled:!s.flags.medicineDone||!s.flags.ledgerDone},...(!s.flags.medicineDone||!s.flags.ledgerDone?[{label:'Önce Mirna ve Alf’le işlerimi tamamlamalıyım.',action:'close'}]:[])]:[]),close]};
 if(id==='rauf')return {who:'Rauf',role:'Yaralı kaçak',portrait:2,text:s.flags.fugitive==='reported'?'Teslim olacağım. Defterde kimlerin aç kaldığı yazıyor. Alf’e onu da okumasını söyle.':s.flags.medicine==='rauf'?'Nefes almak artık acıtmıyor. Bunu unutmayacağım. Batıdaki kol, ocağa giden kapıyı açar.': 'Erzağı çocuklara verdim. Defter bunu kanıtlıyor. Alf beni dinlemez… Bacağım da beni taşımaz. Bana yardım eder misin?',choices:[{label:'Bana hikâyeni anlat.',action:'story:rauf:1'},...(s.inventory.medicine&&s.flags.fugitive!=='reported'?[{label:'Bu ilacı al. Yaşaman gerek.',action:'rauf_heal',note:'Son ilacı harca · Mirna’ya götüremeyeceksin'}]:[]),...(!s.flags.fugitive?[{label:'Sırrını koruyacağım. Defteri bana ver.',action:'rauf_protect',note:'Rauf’u koru · Defteri al'},{label:'Defteri ver. Alf’e teslim olmalısın.',action:'rauf_report',note:'Rauf’u teslim et · Defteri al'}]:[]),close]};
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
 case 'ending_seal':case 'ending_claim':if(s.ending||!s.flags.medicineDone||!s.flags.ledgerDone||!removeItem(s,'core'))return {message:'Önce Mirna ve Alf’in görevlerini tamamla.'};s.ending=action==='ending_seal'?'seal':'claim';s.flags.coreStarted=true;gainXp(s,200);s.journal.unshift(s.ending==='seal'?'Yarığı mühürledin. Sığınak artık güvende.':'Kül kalbinin gücünü sığınağa taşıdın.');return {message:'Birinci bölüm tamamlandı.',special:'ending'};
 default:return {message:''};
 }
 if(message)s.journal.unshift(message);return {message,leveled:xp?gainXp(s,xp):false};
}
// Only accept bounded, known save fields. A broken or older save never replaces a valid run.
export function parseSave(raw:string):State|null{try{const s=JSON.parse(raw) as State;if(s.version!==1||!s.started||!ZONES[s.zone]||!Number.isFinite(s.x)||!Number.isFinite(s.y)||s.x<0||s.y<0||s.x>1200||s.y>1200||!Number.isFinite(s.hp)||s.hp<=0||!Number.isFinite(s.gold)||s.gold<0||!Number.isFinite(s.xp)||s.xp<0||!Number.isInteger(s.level)||s.level<1||s.level>5||!Number.isInteger(s.points)||s.points<0||!s.inventory||typeof s.inventory!=='object'||!s.equipment||!s.skills||!s.flags||typeof s.flags!=='object'||Array.isArray(s.flags)||!Array.isArray(s.opened)||!Array.isArray(s.killed)||!Array.isArray(s.journal)||![s.opened,s.killed,s.journal].every(a=>a.every(v=>typeof v==='string'))||!['power','vigor','agility'].every(k=>Number.isInteger(s.skills[k as keyof State['skills']])&&s.skills[k as keyof State['skills']]>=0)||!Number.isFinite(s.playtime)||!Object.entries(s.inventory).every(([k,v])=>k in ITEMS&&Number.isInteger(v)&&Number(v)>0)||ITEMS[s.equipment.weapon]?.kind!=='weapon'||ITEMS[s.equipment.armor]?.kind!=='armor'||(s.equipment.ring!==null&&ITEMS[s.equipment.ring]?.kind!=='ring')||![s.equipment.weapon,s.equipment.armor,s.equipment.ring].every(id=>id===null||s.inventory[id])||![null,'seal','claim'].includes(s.ending))return null;s.hp=Math.min(s.hp,stats(s).maxHp);return s}catch{return null}}
