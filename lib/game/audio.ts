export type Sound='step'|'hit'|'hurt'|'swing'|'dodge'|'chest'|'coin'|'level'|'talk'|'drink'|'door'|'death'|'select'|'trap'|'dusmanVur'|'dusmanOlum';
// Sabit guc (constant power) capraz gecis egrileri: in^2+out^2=1 oldugu icin
// dongu dikisinde toplam enerji sabit kalir, klasik dogrusal fade'deki orta
// nokta cukuru olusmaz.
const XF=2.5,EGRI_N=64;
const [GIRIS,CIKIS]=(()=>{const a=new Float32Array(EGRI_N),b=new Float32Array(EGRI_N);for(let i=0;i<EGRI_N;i++){const p=i/(EGRI_N-1);a[i]=Math.sin(p*Math.PI/2);b[i]=Math.cos(p*Math.PI/2);}return[a,b]})();
const PARCA='/assets/audio/three-steps-beneath.mp3';
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
const ORNEKLER:Record<string,string>={death:'/assets/audio/death.mp3'};
const ORNEK_KAT=1.35;   // ornekler sentez tonlarindan daha sakin masterlanmis
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
 private parca:AudioBuffer|null=null;private basla=0;private bitis=0;private calan:AudioBufferSourceNode[]=[];private bekleniyor=true;private ornek:Record<string,AudioBuffer>={};private ruzgarKazanc:GainNode|null=null;private ates:AudioBufferSourceNode|null=null;private atesKazanc:GainNode|null=null;private atesPan:StereoPannerNode|null=null;private muzikKat=SENTEZ_KAT;
 start(){if(!this.ctx){const C=window.AudioContext||(window as unknown as {webkitAudioContext:typeof AudioContext}).webkitAudioContext;if(!C)return;this.ctx=new C();this.musicBus=this.ctx.createGain();this.fxBus=this.ctx.createGain();const compressor=this.ctx.createDynamicsCompressor();compressor.threshold.value=-12;compressor.knee.value=10;compressor.ratio.value=4;compressor.attack.value=.006;compressor.release.value=.18;const master=this.ctx.createGain();master.gain.value=1.45;compressor.connect(master);master.connect(this.ctx.destination);this.musicBus.connect(compressor);this.fxBus.connect(compressor);this.setVolumes(this.music,this.effects);void this.parcaYukle();void this.atesYukle();void this.ornekYukle();void this.ruzgarYukle();}void this.ctx.resume().catch(()=>{});if(!this.timer){this.next=this.ctx.currentTime+.05;this.timer=setInterval(()=>this.schedule(),100)}}
 setVolumes(m:number,f:number){this.music=m;this.effects=f;this.musicBus?.gain.setTargetAtTime(m*this.muzikKat,this.ctx!.currentTime,.08);this.fxBus?.gain.setTargetAtTime(f*.5,this.ctx!.currentTime,.02)}
 setZone(zone:string){if(this.zone!==zone){this.zone=zone;this.beat=0;this.ruzgarAyarla();}}
 pause(p:boolean){this.active=!p;if(this.ctx){if(p)void this.ctx.suspend().catch(()=>{});else{if(!this.parca)this.next=this.ctx.currentTime+.05;void this.ctx.resume().catch(()=>{});}}}
 private tone(freq:number,time:number,duration:number,volume:number,type:OscillatorType,bus:GainNode){if(!this.ctx)return;const o=this.ctx.createOscillator(),g=this.ctx.createGain();o.type=type;o.frequency.setValueAtTime(freq,time);g.gain.setValueAtTime(0,time);g.gain.linearRampToValueAtTime(volume,time+.018);g.gain.exponentialRampToValueAtTime(.0001,time+duration);o.connect(g);g.connect(bus);o.start(time);o.stop(time+duration+.02);o.onended=()=>{o.disconnect();g.disconnect()};}
 private schedule(){if(!this.ctx||!this.musicBus||!this.active||this.ctx.state!=='running')return;if(this.parca){this.parcaPlanla();return;}if(this.bekleniyor)return;const t=this.ctx.currentTime;if(this.next<t-.5)this.next=t+.05;while(this.next<t+.3){const haven=this.zone==='haven',step=haven?.34:.255;const progress=haven?[146.83,130.81,116.54,130.81]:[110,103.83,98,103.83];const root=progress[Math.floor(this.beat/16)%4];const pattern=haven?[0,7,12,15,12,7,3,7]:[0,12,7,3,0,7,15,7];if(this.beat%2===0)this.tone(root*Math.pow(2,pattern[(this.beat/2)%8]/12),this.next,1.3,.24,'triangle',this.musicBus);if(this.beat%8===0){this.tone(root/2,this.next,step*10,.23,'sine',this.musicBus);this.tone(root*1.5,this.next,step*8,.08,'sine',this.musicBus);}if(!haven&&this.beat%4===0)this.tone(55,this.next,.17,.38,'sine',this.musicBus);if(haven&&this.beat%16===12)this.tone(root*4,this.next,1.8,.07,'sine',this.musicBus);this.next+=step;this.beat++}}
 private async parcaYukle(){try{const r=await fetch(PARCA);if(!r.ok){this.bekleniyor=false;return;}const buf=await this.ctx!.decodeAudioData(await r.arrayBuffer());
  // Kodlayici dolgusu (MP3 basta/sonda sessizlik ekler) dikiste bir bosluk
  // birakirdi; dongu sinirlarini gercek sese gore kirp.
  const d=buf.getChannelData(0),tara=Math.min(buf.length,buf.sampleRate);let b=0,e=buf.length-1;
  while(b<tara&&Math.abs(d[b])<.0015)b++;while(e>buf.length-1-tara&&Math.abs(d[e])<.0015)e--;
  this.parca=buf;this.basla=b/buf.sampleRate;this.bitis=(e+1)/buf.sampleRate;
  this.muzikKat=PARCA_KAT;this.setVolumes(this.music,this.effects);
  this.next=this.ctx!.currentTime+.06;}catch{/* dosya okunamadiysa sentezlenmis muzik yedege gecer */}finally{this.bekleniyor=false;}}
 private async ornekYukle(){for(const[ad,yol]of Object.entries(ORNEKLER))try{
   const r=await fetch(yol);if(!r.ok)continue;
   this.ornek[ad]=await this.ctx!.decodeAudioData(await r.arrayBuffer());
  }catch{/* yuklenemezse sentez karsiligi calar */}}
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
 private parcaPlanla(){const ctx=this.ctx!,sure=this.bitis-this.basla;if(sure/HIZ<=XF*2)return;const simdi=ctx.currentTime;if(this.next<simdi)this.next=simdi+.06;
  if(this.calan.length>=2)return;// gecis aninda 2 ornek normal; ucuncusu hata demektir
  const gercek=sure/HIZ;// tampon saniyesi degil, duvar saati suresi
  while(this.next<simdi+1){const t=this.next,src=ctx.createBufferSource(),g=ctx.createGain();src.buffer=this.parca;src.playbackRate.value=HIZ;src.connect(g);g.connect(this.musicBus!);
   g.gain.setValueCurveAtTime(GIRIS,t,XF);g.gain.setValueCurveAtTime(CIKIS,t+gercek-XF,XF);
   // stop() mutlak baglam zamani aldigi icin playbackRate belirsizligi yok.
   src.start(t,this.basla);src.stop(t+gercek+.05);src.onended=()=>{src.disconnect();g.disconnect();this.calan=this.calan.filter(x=>x!==src)};this.calan.push(src);
   // Bir sonraki tur, bu turun cikisiyla tam ust uste binsin: dikis duyulmaz.
   this.next=t+gercek-XF;}}
 play(name:Sound,scale=1){if(!this.ctx||!this.fxBus||this.ctx.state!=='running'||this.effects===0||scale<=0.001)return;
  const buf=this.ornek[name];
  if(buf){const src=this.ctx.createBufferSource();src.buffer=buf;
   const g=this.ctx.createGain();g.gain.value=Math.min(1,Math.max(0,scale))*ORNEK_KAT;
   src.connect(g);g.connect(this.fxBus);src.start();
   src.onended=()=>{src.disconnect();g.disconnect()};return;}const t=this.ctx.currentTime,b=this.fxBus,s=Math.min(1,Math.max(0,scale));const notes=(ns:number[],d=.1,v=.3,type:OscillatorType='triangle')=>ns.forEach((f,i)=>this.tone(f,t+i*d,d*2,v*s,type,b));switch(name){case 'step':this.tone(85+Math.random()*30,t,.04,.13*s,'triangle',b);break;case 'swing':notes([250,130,70],.025,.25,'sawtooth');break;case 'hit':notes([110,65],.03,.55,'square');break;case 'hurt':notes([180,100,70],.06,.35,'sawtooth');break;case 'dodge':notes([120,230,380],.025,.16,'sine');break;case 'chest':notes([330,440,554,660],.1,.25);break;case 'coin':notes([880,1320],.07,.2);break;case 'level':notes([293.66,369.99,440,587.33,739.99,880],.11,.3);break;case 'talk':notes([330,440],.055,.12);break;case 'drink':notes([220,330,550],.075,.2,'sine');break;case 'door':notes([146,220,293],.12,.22);break;case 'death':notes([293,261,220,146],.25,.25);break;case 'select':notes([480],.05,.15);break;case 'trap':notes([180,240,120],.04,.3,'sawtooth');break;/* Dusman sesleri GECICI sentez. Hazir kayit gelince tek yapilacak sey
     ORNEKLER'e dosyayi eklemek: play() ornek varsa sentezi hic calistirmiyor.
     Perde her seferinde biraz kaydiriliyor, yoksa ust uste calinca makine
     gibi duyuluyor. */case 'dusmanVur':{const k=.92+Math.random()*.16;notes([96*k,58*k,40*k],.045,.34,'square');break;}case 'dusmanOlum':{const k=.92+Math.random()*.16;/* Olculdu: ses calisiyordu ama duyulmuyordu. Oldurme aninda ayni 100 ms
     icinde 'hit' (0.55, 110/65 Hz) ve iki 'coin' calıyor; olum sesi de alcak
     bantta oldugu icin onlarin altinda kaliyordu. Iki degisiklik: 0.15 sn
     GECIKME ile carpismadan cikarildi ve BOS BANDA tasindi - once yuksek bir
     ciyaklama (360-620 Hz, baska hicbir efekt orada degil), arkasindan kisa
     bir gumburtu. */const g=.15;[620,470,360].forEach((f,i)=>this.tone(f*k,t+g+i*.055,.15,.45*s,'sawtooth',b));this.tone(95*k,t+g+.17,.2,.4*s,'square',b);this.tone(58*k,t+g+.25,.26,.34*s,'square',b);break;}}}
 destroy(){if(this.timer)clearInterval(this.timer);this.timer=null;for(const s of this.calan)try{s.stop()}catch{}this.calan=[];try{this.ates?.stop()}catch{}this.ates=null;void this.ctx?.close().catch(()=>{});this.ctx=null;}
}
