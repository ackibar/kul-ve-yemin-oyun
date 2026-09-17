export type Sound='step'|'hit'|'hurt'|'swing'|'dodge'|'chest'|'coin'|'level'|'talk'|'drink'|'door'|'death'|'select'|'trap'|'dusmanVur'|'dusmanOlum'|'iskeletOlum'|'iskeletCikis'|'iskeletVur'|'vurus'|'yumruk'|'yumrukSavur';
// Sabit guc (constant power) capraz gecis egrileri: in^2+out^2=1 oldugu icin
// dongu dikisinde toplam enerji sabit kalir, klasik dogrusal fade'deki orta
// nokta cukuru olusmaz.
const XF=2.5,EGRI_N=64;
const [GIRIS,CIKIS]=(()=>{const a=new Float32Array(EGRI_N),b=new Float32Array(EGRI_N);for(let i=0;i<EGRI_N;i++){const p=i/(EGRI_N-1);a[i]=Math.sin(p*Math.PI/2);b[i]=Math.cos(p*Math.PI/2);}return[a,b]})();
const PARCA='/assets/audio/three-steps-beneath.mp3';
// Sarnic (cistern) bolgesine ozel parca - digerleri hala PARCA'yi kullanir.
// ZONE_PARCA'ya yeni bir satir eklemek yeterli: baska bir bolgeye baska bir
// parca vermek icin ayni sekilde bir anahtar-yol cifti eklenir, kod degismez.
const SARNIC_PARCA='/assets/audio/sarnic.mp3';
const ZONE_PARCA:Record<string,string>={cistern:SARNIC_PARCA};
const ATES_SES='/assets/audio/fireplace.mp3';
// Kul Ovasi'nin ruzgari: bolgeye cikinca acilan, girince kapanan dongu.
const RUZGAR_SES='/assets/audio/wind.mp3';
const RUZGAR_KAT=.55;
// Ates ortam sesi TEK dongu olarak calar; her alev icin ayri kaynak acmak yerine
// motor en yakin alevlere gore 0..1 arasi bir seviye veriyor. Boylece uc ocagin
// yan yana oldugu sigginakta ses uc katina cikmiyor, sadece biraz doluyor.
const ATES_KAT=.9;
// Kayitli efekt ornekleri. Sentezlenen karsiliklarinin yerine gecerler; dosya
// yuklenemezse sentez calmaya devam eder, yani ses hic kaybolmaz.
/* Hazir ses ornekleri. Buraya eklenen ad, play() icindeki sentezi EZER;
   yani dusman seslerini degistirmek icin sadece dosya yolu yazmak yeterli:
   dusmanVur:'/assets/audio/...', dusmanOlum:'/assets/audio/...' */
const ORNEKLER:Record<string,string|string[]>={death:'/assets/audio/death.mp3',
 /* Iskelet parcalanmasi: kayitli ornek (kullanici verdi). Ayri bir ad, cunku
    'dusmanOlum' TUM dusmanlarda caliyor - kemik catirtisi yalniz iskelete ait. */
 iskeletOlum:'/assets/audio/iskelet_olum.mp3',
 /* Iskeletin topraktan cikisi (kullanici verdi: saksidan toprak bosaltma).
    Ayni tas koridor yankisindan gecirildi ki olum sesiyle ayni mekanda dursun. */
 iskeletCikis:'/assets/audio/iskelet_cikis.mp3',
 /* Iskeletin saldirisi (kullanici verdi: Sword Stab). Ayri ad, cunku
    'dusmanVur' TUM dusmanlarda caliyor. Ayni koridor yankisindan gecti. */
 iskeletVur:'/assets/audio/iskelet_vur.mp3',
 /* Kilic savurma: DORT ayri kayit. Secim torbadan cekiliyor (bkz. ornekCek) -
    duz Math.random ayni sesi arka arkaya verebiliyor, sabit sira ise ritim
    yaratiyor; kullanici ikisini de istemedi. */
 swing:['/assets/audio/savurma1.mp3','/assets/audio/savurma2.mp3',
        '/assets/audio/savurma3.mp3','/assets/audio/savurma4.mp3'],
 /* ISABET sesi - savurmadan AYRI. 'swing' hedef bulunmadan calıyor, yani iska
    ile isabet ayni duyuluyordu; darbenin BAGLANDIGI ani isaretleyen ses bu.
    Bes ayri kayit (kullanici verdi), torbadan cekiliyor. Savurmadan ~4 dB
    yuksek (olculdu: savurma -30.5, vurus -26.5) ki darbe savurmanin ustune
    ciksin. */
 vurus:['/assets/audio/vurus1.mp3','/assets/audio/vurus2.mp3','/assets/audio/vurus3.mp3',
        '/assets/audio/vurus4.mp3','/assets/audio/vurus5.mp3'],
 /* CIPLAK EL. Kilicin metalik sesi yumrukta yanlis duruyordu, bu yuzden hem
    savurma hem isabet ayri: silah 'yumruk' iken bunlar caliyor.
    yumruk: kullanicinin verdigi bes govde darbesi kaydi. Kesim SESSIZLIGE gore
    degil ONSET'e gore yapildi - iki kayitta darbeden once de yuksek icerik var
    (combo), silenceremove orada calismiyor ve darbe 300 ms gec baslıyordu.
    Punch 02'de iki darbe vardi, IKINCISI alindi; ilkiyle birlikte kalsaydi tek
    yumrukta cift guruldu duyuluyordu. */
 yumruk:['/assets/audio/yumruk1.mp3','/assets/audio/yumruk2.mp3','/assets/audio/yumruk3.mp3',
         '/assets/audio/yumruk4.mp3','/assets/audio/yumruk5.mp3'],
 /* yumrukSavur: yeni kayit DEGIL, kilic savurmasindan turetildi - perde .89 ve
    iki kademe 1.5 kHz alcak geciren. Olculdu: >4 kHz -44.9 -> -66.9 dB, yani
    metalik tini gidip yalniz hava hareketi kaliyor. Kilic savurmasindan da
    sessiz (-32.5 / -30.5): ciplak el bicaktan daha az ses yapar. */
 yumrukSavur:['/assets/audio/yumruksavur1.mp3','/assets/audio/yumruksavur2.mp3',
              '/assets/audio/yumruksavur3.mp3','/assets/audio/yumruksavur4.mp3']};
const ORNEK_KAT=1.35;   // ornekler sentez tonlarindan daha sakin masterlanmis
/* Ornek basina PERDE SACILMASI (± oran). Ayni kaydin her seferinde birebir
   ayni calmasi - ozellikle iskelet surusunde saniyede birkac kez - kaydi
   "makine" gibi gosteriyor. playbackRate ile hem perde hem sure kayiyor;
   ayri dosyalar uretmek yerine boyle SINIRSIZ varyasyon cikiyor ve depoya
   tek dosya giriyor. .07 ~ +-1.2 yarim ton: fark ediliyor ama ses bozulmuyor. */
const ORNEK_PERDE:Record<string,number>={iskeletOlum:.07,iskeletCikis:.09,iskeletVur:.1,vurus:.06,yumruk:.07,yumrukSavur:.06};
// Muzik yolu kazanci. Sentezlenmis muzik tek tek zayif tonlardan olustugu icin .2
// yetiyordu; kayitli parca masterlanmis (ortalama -14 dBFS) oldugundan ayni katsayi
// onu one cikarip adim/vurus efektlerini bastiriyor - ustelik master kompresoru de
// muzige gore duck yapiyor. Efektler duyulsun diye parca katsayisi dusuk tutuldu.
const SENTEZ_KAT=.2,PARCA_KAT=.38;
// Calma hizi. Dosyayi yeniden kodlamak yerine playbackRate kullaniliyor: bant
// yavaslatmasi gibi perde de duser (chiptune'a agir/karanlik bir ton verir) ve
// tek sabitle geri alinabilir. Perdenin korunmasi istenirse dosya atempo ile
// yeniden kodlanmali.
const HIZ=.9;
export class GameAudio{
 private ctx:AudioContext|null=null;private musicBus:GainNode|null=null;private fxBus:GainNode|null=null;private timer:ReturnType<typeof setInterval>|null=null;private next=0;private beat=0;private zone='haven';private active=true;music=.45;effects=.65;
 /** Yuklenen parcalar - anahtar dosya yolu, deger kirpilmis dongu sinirlariyla
  *  arabellek. PARCA (varsayilan) ve ZONE_PARCA'daki her yol burada ayri ayri
  *  tutulur, boylece bolgeye gore hangisinin calacagina schedule() karar verir. */
 private parcalar:Record<string,{buf:AudioBuffer;basla:number;bitis:number}>={};
 private parcaYukleniyor=new Set<string>();
 private calan:{src:AudioBufferSourceNode;gain:GainNode}[]=[];private bekleniyor=true;private ornek:Record<string,AudioBuffer[]>={};/** Varyant torbasi: kalan indisler; bitince yeniden karistirilir. */private torba:Record<string,number[]>={};/** Her ad icin en son calinan varyant - torba yenilenince tekrar etmesin. */private sonVaryant:Record<string,number>={};private ruzgarKazanc:GainNode|null=null;private ates:AudioBufferSourceNode|null=null;private atesKazanc:GainNode|null=null;private atesPan:StereoPannerNode|null=null;private muzikKat=SENTEZ_KAT;
 start(){if(!this.ctx){const C=window.AudioContext||(window as unknown as {webkitAudioContext:typeof AudioContext}).webkitAudioContext;if(!C)return;this.ctx=new C();this.musicBus=this.ctx.createGain();this.fxBus=this.ctx.createGain();const compressor=this.ctx.createDynamicsCompressor();compressor.threshold.value=-12;compressor.knee.value=10;compressor.ratio.value=4;compressor.attack.value=.006;compressor.release.value=.18;const master=this.ctx.createGain();master.gain.value=1.45;compressor.connect(master);master.connect(this.ctx.destination);this.musicBus.connect(compressor);this.fxBus.connect(compressor);this.setVolumes(this.music,this.effects);void this.parcaYukle(PARCA);for(const yol of new Set(Object.values(ZONE_PARCA)))void this.parcaYukle(yol);void this.atesYukle();void this.ornekYukle();void this.ruzgarYukle();}void this.ctx.resume().catch(()=>{});if(!this.timer){this.next=this.ctx.currentTime+.05;this.timer=setInterval(()=>this.schedule(),100)}}
 setVolumes(m:number,f:number){this.music=m;this.effects=f;this.musicBus?.gain.setTargetAtTime(m*this.muzikKat,this.ctx!.currentTime,.08);this.fxBus?.gain.setTargetAtTime(f*.5,this.ctx!.currentTime,.02)}
 /** O an calmasi gereken parcanin dosya yolu - ZONE_PARCA'da bolgeye ozel bir
  *  kayit varsa o, yoksa varsayilan PARCA. */
 private aktifYol(){return ZONE_PARCA[this.zone]??PARCA;}
 setZone(zone:string){if(this.zone===zone)return;const eskiYol=this.aktifYol();this.zone=zone;this.beat=0;this.ruzgarAyarla();if(this.aktifYol()!==eskiYol)this.parcaGecisYap();}
 /** Bolge degisince parca da degismesi gerekiyorsa: o an calan (uzun sureli
  *  planlanmis) kaynaklari HIZLICA soldurup durdurur, schedule()'in bir
  *  sonraki turda YENI parcayi (kendi GIRIS solmasiyla) baslatmasini saglar -
  *  yoksa eski parca kendi CIKIS'ina kadar (dakikalarca surebilir) calmaya
  *  devam eder, yeni parcayla ust uste binerdi. */
 private parcaGecisYap(){if(!this.ctx)return;const t=this.ctx.currentTime,sol=1.3;
  for(const{src,gain}of this.calan)try{gain.gain.cancelScheduledValues(t);gain.gain.setValueAtTime(gain.gain.value,t);gain.gain.linearRampToValueAtTime(0,t+sol);src.stop(t+sol+.05);}catch{/* zaten durmus olabilir */}
  this.calan=[];this.next=t+.1;}
 pause(p:boolean){this.active=!p;if(this.ctx){if(p)void this.ctx.suspend().catch(()=>{});else{if(!this.parcalar[this.aktifYol()])this.next=this.ctx.currentTime+.05;void this.ctx.resume().catch(()=>{});}}}
 private tone(freq:number,time:number,duration:number,volume:number,type:OscillatorType,bus:GainNode){if(!this.ctx)return;const o=this.ctx.createOscillator(),g=this.ctx.createGain();o.type=type;o.frequency.setValueAtTime(freq,time);g.gain.setValueAtTime(0,time);g.gain.linearRampToValueAtTime(volume,time+.018);g.gain.exponentialRampToValueAtTime(.0001,time+duration);o.connect(g);g.connect(bus);o.start(time);o.stop(time+duration+.02);o.onended=()=>{o.disconnect();g.disconnect()};}
 private schedule(){if(!this.ctx||!this.musicBus||!this.active||this.ctx.state!=='running')return;const yol=this.aktifYol();if(this.parcalar[yol]){this.parcaPlanla(yol);return;}if(this.bekleniyor||this.parcaYukleniyor.has(yol))return;const t=this.ctx.currentTime;if(this.next<t-.5)this.next=t+.05;while(this.next<t+.3){const haven=this.zone==='haven',step=haven?.34:.255;const progress=haven?[146.83,130.81,116.54,130.81]:[110,103.83,98,103.83];const root=progress[Math.floor(this.beat/16)%4];const pattern=haven?[0,7,12,15,12,7,3,7]:[0,12,7,3,0,7,15,7];if(this.beat%2===0)this.tone(root*Math.pow(2,pattern[(this.beat/2)%8]/12),this.next,1.3,.24,'triangle',this.musicBus);if(this.beat%8===0){this.tone(root/2,this.next,step*10,.23,'sine',this.musicBus);this.tone(root*1.5,this.next,step*8,.08,'sine',this.musicBus);}if(!haven&&this.beat%4===0)this.tone(55,this.next,.17,.38,'sine',this.musicBus);if(haven&&this.beat%16===12)this.tone(root*4,this.next,1.8,.07,'sine',this.musicBus);this.next+=step;this.beat++}}
 private async parcaYukle(yol:string){this.parcaYukleniyor.add(yol);try{const r=await fetch(yol);if(!r.ok)return;const buf=await this.ctx!.decodeAudioData(await r.arrayBuffer());
  // Kodlayici dolgusu (MP3 basta/sonda sessizlik ekler) dikiste bir bosluk
  // birakirdi; dongu sinirlarini gercek sese gore kirp.
  const d=buf.getChannelData(0),tara=Math.min(buf.length,buf.sampleRate);let b=0,e=buf.length-1;
  while(b<tara&&Math.abs(d[b])<.0015)b++;while(e>buf.length-1-tara&&Math.abs(d[e])<.0015)e--;
  this.parcalar[yol]={buf,basla:b/buf.sampleRate,bitis:(e+1)/buf.sampleRate};
  if(yol===PARCA){this.muzikKat=PARCA_KAT;this.setVolumes(this.music,this.effects);}
  if(yol===this.aktifYol())this.next=this.ctx!.currentTime+.06;
  }catch{/* dosya okunamadiysa (yalniz PARCA icin) sentezlenmis muzik yedege gecer */}finally{this.parcaYukleniyor.delete(yol);if(yol===PARCA)this.bekleniyor=false;}}
 private async ornekYukle(){for(const[ad,giris]of Object.entries(ORNEKLER)){
   const yollar=Array.isArray(giris)?giris:[giris];const buf:AudioBuffer[]=[];
   for(const yol of yollar)try{
    const r=await fetch(yol);if(!r.ok)continue;
    buf.push(await this.ctx!.decodeAudioData(await r.arrayBuffer()));
   }catch{/* yuklenemezse sentez karsiligi calar */}
   /* Varyantlarin BIR KISMI gelse bile calisir: kalanlardan secilir. */
   if(buf.length)this.ornek[ad]=buf;
  }}
 /** Varyant secimi - TORBA yontemi. Duz rastgele secim ayni sesi ust uste
  *  verebiliyor ("hep ayni geliyor"), sabit sira ise dongu hissi yaratiyor
  *  ("hep ayni sirayla geliyor"). Torba: her varyant bir tur icinde tam bir
  *  kez calar, tur bitince yeniden karistirilir; yeni turun ilki bir onceki
  *  turun sonuncusuyla ayniysa bir sonrakiyle yer degistirir, boylece iki
  *  tur sinirinda da tekrar olmaz. */
 private ornekCek(ad:string,n:number){
  if(n<=1)return 0;
  let t=this.torba[ad];
  if(!t?.length){
   t=[...Array(n).keys()];
   for(let i=n-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[t[i],t[j]]=[t[j],t[i]];}
   /* pop() SONDAN cekiyor: sinir kontrolu son elemana bakmali. */
   const z=t.length-1;if(t[z]===this.sonVaryant[ad])[t[z],t[z-1]]=[t[z-1],t[z]];
   this.torba[ad]=t;
  }
  const s=t.pop()!;this.sonVaryant[ad]=s;return s;
 }
 private async ruzgarYukle(){try{const r=await fetch(RUZGAR_SES);if(!r.ok)return;
   const buf=await this.ctx!.decodeAudioData(await r.arrayBuffer());if(!this.ctx||!this.fxBus)return;
   const d=buf.getChannelData(0),tara=Math.min(buf.length,buf.sampleRate);let b=0,e=buf.length-1;
   while(b<tara&&Math.abs(d[b])<.0015)b++;while(e>buf.length-1-tara&&Math.abs(d[e])<.0015)e--;
   const src=this.ctx.createBufferSource();src.buffer=buf;src.loop=true;
   src.loopStart=b/buf.sampleRate;src.loopEnd=(e+1)/buf.sampleRate;
   const g=this.ctx.createGain();g.gain.value=0;src.connect(g);g.connect(this.fxBus);src.start();
   this.ruzgarKazanc=g;this.ruzgarAyarla();
  }catch{/* ruzgar olmasa da oyun calisir */}}
 /** Ruzgar yalnizca Kul Ovasi'nda duyulur; gecis 1.2 sn'de yumusakca olur. */
 private ruzgarAyarla(){if(!this.ctx||!this.ruzgarKazanc)return;
  this.ruzgarKazanc.gain.setTargetAtTime(this.zone==='disari'?RUZGAR_KAT:0,this.ctx.currentTime,.4);}
 private async atesYukle(){try{const r=await fetch(ATES_SES);if(!r.ok)return;
  const buf=await this.ctx!.decodeAudioData(await r.arrayBuffer());if(!this.ctx||!this.fxBus)return;
  const d=buf.getChannelData(0),tara=Math.min(buf.length,buf.sampleRate);let b=0,e=buf.length-1;
  while(b<tara&&Math.abs(d[b])<.0015)b++;while(e>buf.length-1-tara&&Math.abs(d[e])<.0015)e--;
  const src=this.ctx.createBufferSource();src.buffer=buf;src.loop=true;
  src.loopStart=b/buf.sampleRate;src.loopEnd=(e+1)/buf.sampleRate;
  const g=this.ctx.createGain();g.gain.value=0;const pan=this.ctx.createStereoPanner();
  src.connect(pan);pan.connect(g);g.connect(this.fxBus);src.start();
  this.ates=src;this.atesKazanc=g;this.atesPan=pan;}catch{/* ates sesi olmasa da oyun calisir */}}
 /** Motor her karede cagirir. seviye 0..1 (uzaklastikca 0), pan -1..1. */
 setFire(seviye:number,pan=0){if(!this.ctx||!this.atesKazanc)return;const t=this.ctx.currentTime;
  // setTargetAtTime: ani ziplama yerine yumusak gecis, yoksa yurudukce ses cirtliyor
  this.atesKazanc.gain.setTargetAtTime(Math.min(1,Math.max(0,seviye))*ATES_KAT*.55,t,.22);
  this.atesPan!.pan.setTargetAtTime(Math.min(1,Math.max(-1,pan)),t,.22);}
 private parcaPlanla(yol:string){const p=this.parcalar[yol];if(!p)return;const ctx=this.ctx!,sure=p.bitis-p.basla;if(sure/HIZ<=XF*2)return;const simdi=ctx.currentTime;if(this.next<simdi)this.next=simdi+.06;
  if(this.calan.length>=2)return;// gecis aninda 2 ornek normal; ucuncusu hata demektir
  const gercek=sure/HIZ;// tampon saniyesi degil, duvar saati suresi
  while(this.next<simdi+1){const t=this.next,src=ctx.createBufferSource(),g=ctx.createGain();src.buffer=p.buf;src.playbackRate.value=HIZ;src.connect(g);g.connect(this.musicBus!);
   g.gain.setValueCurveAtTime(GIRIS,t,XF);g.gain.setValueCurveAtTime(CIKIS,t+gercek-XF,XF);
   // stop() mutlak baglam zamani aldigi icin playbackRate belirsizligi yok.
   src.start(t,p.basla);src.stop(t+gercek+.05);src.onended=()=>{src.disconnect();g.disconnect();this.calan=this.calan.filter(x=>x.src!==src)};this.calan.push({src,gain:g});
   // Bir sonraki tur, bu turun cikisiyla tam ust uste binsin: dikis duyulmaz.
   this.next=t+gercek-XF;}}
 play(name:Sound,scale=1){if(!this.ctx||!this.fxBus||this.ctx.state!=='running'||this.effects===0||scale<=0.001)return;
  const kova=this.ornek[name];
  if(kova?.length){const src=this.ctx.createBufferSource();src.buffer=kova[this.ornekCek(name,kova.length)];
   const sac=ORNEK_PERDE[name];if(sac)src.playbackRate.value=1+(Math.random()*2-1)*sac;
   const g=this.ctx.createGain();g.gain.value=Math.min(1,Math.max(0,scale))*ORNEK_KAT;
   src.connect(g);g.connect(this.fxBus);src.start();
   src.onended=()=>{src.disconnect();g.disconnect()};return;}const t=this.ctx.currentTime,b=this.fxBus,s=Math.min(1,Math.max(0,scale));const notes=(ns:number[],d=.1,v=.3,type:OscillatorType='triangle')=>ns.forEach((f,i)=>this.tone(f,t+i*d,d*2,v*s,type,b));switch(name){case 'step':this.tone(85+Math.random()*30,t,.04,.13*s,'triangle',b);break;case 'swing':notes([250,130,70],.025,.25,'sawtooth');break;case 'hit':notes([110,65],.03,.55,'square');break;/* 'vurus' yedegi AYRI ve kare dalga DEGIL: kullanicinin kaldirttigi 8bit blip 'hit'in kendisiydi, dosya yuklenemedi diye onu geri getirmek olmaz. */case 'vurus':notes([170,90],.03,.4,'triangle');break;/* Ciplak el yedegi: kayit yuklenemezse bile kilic sesi calmasin - yumruk daha bogugu, savurma daha soluk. */case 'yumruk':notes([120,70],.035,.38,'sine');break;case 'yumrukSavur':notes([190,110],.03,.14,'sine');break;case 'hurt':notes([180,100,70],.06,.35,'sawtooth');break;case 'dodge':notes([120,230,380],.025,.16,'sine');break;case 'chest':notes([330,440,554,660],.1,.25);break;case 'coin':notes([880,1320],.07,.2);break;case 'level':notes([293.66,369.99,440,587.33,739.99,880],.11,.3);break;case 'talk':notes([330,440],.055,.12);break;case 'drink':notes([220,330,550],.075,.2,'sine');break;case 'door':notes([146,220,293],.12,.22);break;case 'death':notes([293,261,220,146],.25,.25);break;case 'select':notes([480],.05,.15);break;case 'trap':case 'iskeletCikis':notes([180,240,120],.04,.3,'sawtooth');break;/* Dusman sesleri GECICI sentez. Hazir kayit gelince tek yapilacak sey
     ORNEKLER'e dosyayi eklemek: play() ornek varsa sentezi hic calistirmiyor.
     Perde her seferinde biraz kaydiriliyor, yoksa ust uste calinca makine
     gibi duyuluyor. */case 'dusmanVur':case 'iskeletVur':{const k=.92+Math.random()*.16;notes([96*k,58*k,40*k],.045,.34,'square');break;}case 'dusmanOlum':case 'iskeletOlum':{const k=.92+Math.random()*.16;/* Olculdu: ses calisiyordu ama duyulmuyordu. Oldurme aninda ayni 100 ms
     icinde 'hit' (0.55, 110/65 Hz) ve iki 'coin' calıyor; olum sesi de alcak
     bantta oldugu icin onlarin altinda kaliyordu. Iki degisiklik: 0.15 sn
     GECIKME ile carpismadan cikarildi ve BOS BANDA tasindi - once yuksek bir
     ciyaklama (360-620 Hz, baska hicbir efekt orada degil), arkasindan kisa
     bir gumburtu. */const g=.15;[620,470,360].forEach((f,i)=>this.tone(f*k,t+g+i*.055,.15,.45*s,'sawtooth',b));this.tone(95*k,t+g+.17,.2,.4*s,'square',b);this.tone(58*k,t+g+.25,.26,.34*s,'square',b);break;}}}
 destroy(){if(this.timer)clearInterval(this.timer);this.timer=null;for(const{src}of this.calan)try{src.stop()}catch{}this.calan=[];try{this.ates?.stop()}catch{}this.ates=null;void this.ctx?.close().catch(()=>{});this.ctx=null;}
}
