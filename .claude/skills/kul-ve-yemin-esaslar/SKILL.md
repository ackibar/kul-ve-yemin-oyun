---
name: kul-ve-yemin-esaslar
description: Kül ve Yemin'i geliştirirken şimdiye kadar verilmiş estetik, hikâye, mekanik ve süreç kararlarının NOT DEFTERİ. Bağlayıcı değil, hatırlatıcı — yeni içerik eklerken tutarlılık için bakılır; kullanıcı ne derse o geçerli.
---

# Kül ve Yemin — Not defteri

Bu dosya kural kitabı DEĞİL; kafa karışmasın diye tutulan bir hatırlatma.
Kod ne yapıldığını söyler, burası şimdiye kadar neden öyle yapıldığını.
Her şey değişebilir — kullanıcı başka bir şey isterse o geçerli, burası
sonradan güncellenir. Amaç yeni bir şey eklerken eskisiyle çelişmemek
(ör. Mirna'nın saydığı sayı, Alf'in yemini) ve aynı hatayı iki kez
yapmamak.

Repo: `~/Desktop/Kul-ve-Yemin` · GitHub `ackibar/kul-ve-yemin-oyun` · Vercel
`kul-ve-yemin-oyun.vercel.app`. React 19 + Vite + TS, Canvas 2D motor
(`lib/game/engine.ts`), veri/hikâye (`lib/game/data.ts`), mekânlar
(`lib/game/world.ts`), arayüz (`app/page.tsx`).

---

## 1. Dünya ve hikâye

**Tek fikir:** *Kül, tutulmayan sözün örtüsüdür.* Ocak tutulan yeminlerle
uyur, bozulanlarla uyanır. Gökyüzü on bir yıl önce karardı; herkes bir
şekilde bunun bir parçası. Undur'un cümlesi: "Bu sığınakta kaç yemin
bozuldu, say istersen. Sonra gökyüzüne bak."

**Zaman çizgisi (şimdilik):** Kül on bir yıl önce yağdı. Yetmiş kişi indi,
on dokuz kaldı (Elvi sayılırsa yirmi; kral ölürse on sekiz). Üç haftadır
fırtına var: kül artık yağmıyor, esiyor; eskiden bez sarıp çıkılırdı.

**Kapıyı kim açtı (üç kişi, tek kapı):** Kral Ongun emri verdi ("aşağıda
sıcak var, kapıyı açın"), Undur metni okudu, Alf son mandalı kaldırdı.
Undur'a göre kapı çok daha önce açılmaya başlamıştı; Alf yalnızca son
mandaldı. Biri sustu, biri kapıda kaldı, biri yazıyor. Şu ana kadar bu
üçlü böyle; yeni bir karakter bu suça ortak edilecekse üçünün de
diyalogları güncellenmeli.

**Her karakter bir yeminle tanımlanır** — verilmiş, bozulmuş ya da
tutulan. Lin ateşi söndürmeyeceğine söz verdi (sığınakta sözünü tutan tek
kişi; Undur ocakların hâlâ yanmasını ona bağlıyor). Alf bir daha nöbetine
verildiği kapıdan geçmeyeceğine yemin etti. Rauf kızı için kaçtı. Yeni
karakterin de bir sözü olursa kadroya oturuyor; şart değil (Uslu'nun yok).

**Kimse sadece iyi ya da kötü değil.** Obruk açgözlü ama haklı bir cümlesi
var ("bedava veren adamın kileri iki hafta sürer"). Kral suçlu ama kırık.
Karga paralı ama dürüst. Kötü adam yazma; **korkmuş adam** yaz.

**Oyuncu kararları sistemle değil insanlarla ödüllenir/cezalandırılır.**
Onur puanı yok (kullanıcı kararı, 2026-09-12). Undur'un defteri var: yaptıkların isimlerle yazılır, NPC'ler
buna göre konuşur (kralı öldürürsen Lin bir daha köz taşımaz ve sana
bakmaz). Bir karara puan/istatistik bağlama; bir insanın cümlesini
değiştir. Karar verildiyse **tek yerde** verilsin — Rauf'ta iki paralel
karar sistemi vardı, birleştirildi.

**Altın:** Dünyanın sonunda altın işe yaramaz — bu hata değil, **Obruk'un
trajedisi**. Altını isteyen tek adam o, çünkü "altın istendiği sürece pazar
vardır, pazar durduğu sürece ben varım". Takas ekonomisine geçilecekse
gerekçesi bu sahnedir. Şimdilik altınla devam.

**Fırtına:** Kül Ovası "Fırtına · nefes alınmaz". Dışarı çıkıp dönen tek
kişi Uslu (yarısı döndü). Yeni dış-mekân düşmanları fırtınayla gerekçeli
olmalı (Boğulmuş = fırtınada ölenler, Fener taşıyan = ışığa gidenin sonu).

### Diyalog sesi
- Kısa cümleler, üç nokta ile duraksama ("…Biliyorum. Her gece biliyorum.").
- Şiirsel ama sade; metafor bir cümleyi geçmez. Süs yok, açıklama yok.
- Karakter cevabı vermez, **cevabın kenarından geçer**. Söylenmeyen şey
  söylenenden önemli (Kral hiç konuşmaz; metin sessizliğini anlatır ve
  öğrendikçe değişir).
- Tırnak içi konuşma için “ ” , kesme için ’ (düz ' değil).
- Uslu dışında kimse komik değil. Uslu'nun soruları saçma ama bir yerde
  gerçeğe dokunur ("Bir adamın kaç hafta ömrü kaldığını bilmek onu bir kere
  öldürmektir" tonu). Her karakter tek bir tonda konuşur.
- Bir NPC'nin bilgisi yalnızca **kendi bildiği** kadardır. Kralın hikâyesi
  beş kaynaktan parça parça gelir; tek kişi her şeyi anlatmaz.

### İsimler
Kısa, uydurma, Türkçe tınılı, 1–2 hece: Mirna, Alf, Undur, Rauf, Tuhn,
Elvi, Lin, Tiga, Sara, Obruk, Karga, Çakal, Uslu, Ongun. İsim anlam
taşıyabilir ama ağza çarpmamalı (Obruk = dolmayan çukur, Ongun = bereket,
Uslu = kendisi koydu). Lakap alan karakterler (Karga/Çakal) lakabı
kendileri koymuş olur. Modern isim yok.

### Kadro ve bayraklar (flags)
| Kişi | Yeri | Ne | Kilit bayrak |
|---|---|---|---|
| Mirna | Sığınak | şifacı, sayan, sırrı: ilk gece kapıda o durdu | medicine*, mirnaSir |
| Alf | Sığınak | kapı muhafızı, son mandal | ledger*, alfSir, alfKarsi |
| Undur | Sığınak | arşivci, metni okuyan | alfSir, kralUndur |
| Lin | Sığınak | 8 yaş, ateşi söndürmeyen | sozNil, nilOdun, **nilSondu** |
| Elvi | Sığınak | sayılmayan yetmiş birinci | selviSir, sozSelvi |
| Tiga | Yıkık/Sığınak | Lin'in ağabeyi | ayaz (indi/kaldi) |
| Tuhn | Sarnıç Ağzı | uçurumun başındaki adam | tuhn (kaldi/atladi) |
| Rauf | Sarnıç | kaçak, defter, kızının kurdelesi | rauf (korundu/serbest/teslim/oldu/takip) |
| Obruk | Sarnıç Ağzı (geçici) | kileri dolu soylu, 2.5× fiyat | obrukSaygi (bey), obrukSir, tac |
| Karga / Çakal | Obruk'un yanı | paralı askerler; Karga kileri sayıyor: 21 hafta | obrukDepo |
| Uslu | Sığınak | fırtınadan dönen deli, 8 soru, son çakıl | usluSoru |
| Kral (Ongun) | Sığınak batı köşesi (geçici) | hiç konuşmaz, vurulabilir, çubuk yok | kralGoruldu, kral (oldu), kralCan, kralMuhafizHaber |
| Son muhafız | Kül Ovası | kralın son adamı, mini-boss, önce konuşur | muhafiz (gecti/dovus/oldu) |

Eski adlar (kodda kalan id'ler): mira=Mirna, boran=Alf, ekin=Undur,
nil=Lin, selvi=Elvi, ayaz=Tiga. Kod id'leri eski adlarla kaldı (kayıtlar bozulmasın diye); ekran adı
ayrı.

### Geleceğe bırakılan kancalar (bilerek açık)
- Obruk'un kendi odası (yeri geçici). Kiler 21 haftada bitiyor; Karga
  biliyor, Obruk saymaya korkuyor → Karga/Çakal isyanı.
- Kralın tacı Obruk'un ocağında asılı; "alan taşımak zorunda kalır".
- Son muhafızın "dön" ricası: kral diyemedi.
- Oyunun sonu: Kül Ocağı kaldırıldı, yeni son mekânı gelecek (son zinciri
  metinleri git geçmişinde, Undur'un ağacından çıkarıldı).
- Ertelenen: i18n (TR/EN/Bahasa), Tiga'nın sprite kalitesi, Kül Ovası içeriği.

---

## 2. Görsel dil

**Palet:** Kül. Gri-kahve, is, solgun. Sahnede **tek sıcak renk** kural:
ateş/fener/köz turuncusu. Bir karakterin zenginliği bile tek vurguyla
okunur (Obruk: solmuş bordo + matlaşmış altın, başka renk yok). Mavi ve
doygun kırmızı yok; okunabilirlik taşıyan sinyaller (kan, can çubuğu)
istisna.

**Nesne sprite'ı sahnede sönükse suç ton uyumunda olmayabilir.** Sandık ölçüldü:
ton uyumundan sonra parlaklık 0.271 / doygunluk 0.297 iken aynı sahnedeki fıçı
0.473/0.540, kasa 0.504/0.587 — sahnenin ışık tinti de binince kahverengi hiç
okunmuyordu. Üstelik **üretilen görselin %65'i mor-maviydi** (model demiri soğuk
mora boyuyor), parlaklık kaldırılınca mor ortaya çıkıyordu. Çözüm `sandik_kur.py`
içinde: ahşap kuşağının (hue .02-.13) doygunluğu tavanla yükseltilir, mor-mavi
kuşak (.55-.95) neredeyse tamamen doygunluktan arındırılır (demir nötr gri),
parlaklık sınırlı katsayıyla açılır. **Oran hesabı (hedef/ortalama) kullanma** —
mor kırılınca ortalama düşüp çarpan patlıyor, sandık turuncu bir alet kutusuna
dönüyor; sabit ve tavanlı katsayı kullan.
**İki durumlu nesnede (açık/kapalı) ikinci hâli ayrı üretme:** gövde, açı ve
desen tutmuyor. Kapalı hâlden `/animate-with-text-v3` ile türet, ilk ve son
kareyi al.

**Aktör ışığı (`aktor_uyum.LIFT`, 2026-09-13):** aktörler sahnede fazla koyu
okunuyordu — ölçüldü, karakter ortalama parlaklığı 47/255 iken sığınağın
aydınlık zemini 80; siluet gibi duruyorlardı. `grade()` sonuna 1.20 ışıklık
katsayısı eklendi (kül paleti ve omuzlar aynen duruyor), tüm karakter ve
düşman klasörleri yeniden derecelendi: 47.1 → 55.9.

**Ton uyumu otomatik:** her yeni karakter/düşman
`aktor_uyum.klasor(hedef, ham_yenile=True)` ile sahnenin tonuna çekilir
(ışık omuzu + kroma omuzu + kül tonu). Ham sheet önce
`_arsiv/uretim/asset_backup_ton_oncesi`'ne yazılır; `ham_yenile` verilmezse
script eski yedeği yeniden basar ve **yeni sanatı sessizce geri alır**
(örümcek vakası). İkonlar (32×32, parşömen üstünde) ton uyumuna
GİRMEZ.

**Ölçek:** 1 karo = 16 dünya birimi = 32 sanat px, motor 2× okur (`R=2`).
**Büyük figür = daha yüksek çözünürlük, ölçek DEĞİL.** Kral 64×64 üretilip
`s=1.35` ile büyütüldüğünde pikselleri sahnenin 1.35 katı oldu ve "detaysız"
göründü (üstelik 64'lük üretimler 11-27 renkle geliyordu, diğer karakterler
44-56). Çözüm: 128×128 üret, motor `fw/fh=64` ile çizsin — sanat pikseli
diğerleriyle aynı boyutta, figür iki kat büyük. Çapa da 128'e göre
(`KRAL_CAPA=61`), isim etiketi `-58`.
Karakter hücresi 64×64; **oyuncu 80×80** (genişlik: kılıç savrulunca
sığmıyordu; yükseklik: figür bazı karelerde 65-70 satır, 64'te kafa
kesiliyordu — `hucre_yukselt.py`, ayak 78, `OYUNCU_CAPA 39`; HUD portresi
64'lük `portre.png`'den). NPC çapası: ayak çizgisi satır 62 (`anchor 31`); düşmanlar 42 satır (`21`) — daha uzun
düşman için `DUSMAN_CAPA` (trol) ya da Entity `capa` (oturan kral). Sprite
yoğunluğu arka planla aynı olmalı; ölçekle büyütme, kaynağı büyüt.

**"Döndürmek animasyon değildir."** Yaratıklar döndürülerek yön alıyordu;
kullanıcı "yarasa kanat çırpmıyor, hiç olumlu bir şey göremedim" dedi.
Her düşmanın gerçek yürüme+saldırı karesi olur. Piksel sanatı 90–180°
döndürülünce bacaklar kırılır (örümcek "tek ayak üstünde") → yön başına
ayrı sanat. Mod tablosu `Engine.YARATIK` (tam/yan/sabit/aynali).

**Hizalama** bbox'a göre DEĞİL: ayak çizgisi (≥4 px genişlikteki en alt
satır) + kafa tepesi (≥6 px genişlikteki ilk satır); kılıç ucu sayılmaz.
Yaratıklarda alfa ağırlık merkezi. Referans, aynı yönün mevcut Idle karesi
(yoksa duruştan yürüyüşe geçerken zıplar).

**PixelLab reçeteleri** (ayrıntı: hafıza `kul-ve-yemin-pixellab`):
- İnsansı: `create-character-v3` mannequin 64×64 (2 üretim) → sabit
  duracaksa BİTTİ (Idle = dönüş karesi; oyundaki bütün NPC'lerin Idle'ı
  böyle). Dolaşacaksa yürüme şablonu (+3). Silahlı/saldıran:
  `/characters/animations mode:'v3'` (1 üretim/yön) — şablon modu eldeki
  silahı düşürür.
- Tarifte silahın **maddesini** yaz ("solid steel blade, stays gripped in
  every frame"); "geniş savurma" kılıcı ışık huzmesine çevirir.
- Model kamerayı değil gövdeyi referans alır: yan ve arka için ayrı tarif
  (`OZEL` sözlüğü; "seen from behind… away from the camera").
- Şişman karakter: "fat" yetmez; "belly far wider than the shoulders, the
  widest part of the body", kollar göbeğin üstünde, "hands empty, holding
  nothing", istemediğin detayı adla ("NO beard").
- Oturan/yatan figür: mannequin ayakta durur → düz pixflux (1 üretim),
  sheet'i elle kur (`kral_uret.py`, `fener_uret.py`). Oturan figürü
  **animasyonlamak** için `/animate-with-text-v3` (1 üretim/animasyon, düz
  görsel + metin): tarifte "the chair and the whole body stay in exactly the
  same place, nothing slides sideways" şart — ölçüldü, her karede taban satırı
  60'ta kaldı, o yüzden kareler bbox'a göre YENİDEN OTURTULMAZ (oturtulursa el
  kalkınca gövde aşağı kayar). Kral: `D_Idle` baş sallama, `D_El` el
  hareketi, `D_Tac` tacı çıkarıp takma; motor 26 sn'de bir Tac'ı **7 fps**
  ile oynatır (5 fps'te seyirtiyordu) ve taç elindeyken kareler kurulumda
  çoğaltılır (altın pikselin y'sinden bulunur) — duraklama sheet'te, kodda
  değil. Oturan figürde **önden bakış** şart: tarifte sandalyeyi ÖNCE ve
  "seen straight from the FRONT, symmetrical, NOT at an angle" diye yaz;
  figürü önce yazınca model sağlam bir taht çiziyor. Portre D_Idle'ın üst
  24 satırından kırpılır; figürü hücrenin tepesine oturt.
- Düşman portresi gerekiyorsa `enemies/N/D_Idle.png` → `characters/M/`
  kopyala (son muhafız = 15).
- **Tarife "muted ash-grey palette / soot-stained" YAZMA.** Model bunu birebir
  alıp her şeyi griye çeviriyordu (Uslu ham doygunluk 0.035, Lin 0.112).
  Sahneye oturtmak **ton uyumunun işi**: ölçüldü, `aktor_uyum` doygunluğu
  yalnızca %10-22 kırpıyor (Obruk 0.309 → 0.248). Yani kaynak RENKLİ gelmeli;
  her karakterin kıyafet renkleri tek tek adlandırılır ("OLIVE GREEN coat,
  MUSTARD YELLOW shirt"). Renk sonra kısılır, gri olan sonradan renklenmez.
- **Duruş karikatürleştirebilir**: iki kolu iki yana açık Uslu çizgi film
  gibiydi; "standing calmly, one hand raised beside the shoulder in a small
  greeting wave" ile düzeldi. Tuhaflık duruşta değil yüzde kalsın.
- **Kafa oranı**: mannequin şablonu küçük figürlerde kafayı büyütüyor (Lin
  "anime kızı" gibi çıkmıştı). `ORAN` sabitini ekle: "realistic body
  proportions with a SMALL head, the head is small compared to the shoulders,
  NOT chibi, NOT big-headed, NOT anime, narrow face".
- İstenmeyen çağrışımı **adıyla yasakla**: Uslu'nun kabarık saçı + kulağındaki
  kuru bitki onu "orman kaçkını" yapıyordu → "NO leaves, NO plants, NO twigs,
  NOT a forest hermit, NOT a druid" + "flat tangled strands close to the skull".
- Yeni karakter tarifine `ORTAK` ekle: "NO backpack, NO satchel, NO straps,
  NO modern clothing, human".

**Mekânlar:** tek parça boyalı arka plan; çarpışma otorite, görsel ona
maskelenir.
**En kolay yol — yeşil maske:** aynı sahnenin yürünebilir zemini yeşile
boyanmış ikinci bir kopyası (`scripts/tunel_kur.py`). Zemin doğrudan oradan
okunur, parlaklık tahmini gerekmez. Model yeşili sahnenin ışığıyla
**koyultuyor** (ölçüldü: 51,71,43 — g-r=20); parlak yeşil eşiği hiçbir şey
bulmaz, eşiği düşür ve **en büyük bağlı alanı** al (kayalardaki yosun da yeşil
ama kopuk). Yatay üretilen mekân 90° çevrilebilir. Geçiş kutusu koridorun
**geniş** satırlarında olmalı — dar ve kayık uca oyuncu çarpışma yarıçapıyla
giremiyor; giriş karosuna yaratık koyma, geri dönüşü kapatıyor. Boyalı mobilyanın çarpışması elle (`blockers`). Photoshop
katman sözleşmesi: `zemin` / `<ad>@engel` / `@gecilir` / `@ates` / `@ust`.

**Işık haritası (2026-09-12):** `Engine.KARANLIK[mekan]` 0–1; 0 ise eski
düz tint aynen kalır. **Şu an hepsi 0** — Sarnıç Ağzı .82 ile denendi,
deneme bitince geri alındı; sistem duruyor, yeni karanlık mekân gelince
değer yazmak yetiyor. Ekran dışı tuvale karanlık basılır, her ışık
`destination-out` radyal gradientle delik açar: ateş entity'leri, boyalı
duvar ışıkları (`World.isiklar`, arka plandaki sıcak-parlak piksel
kümelerinden ölçülür), fener taşıyan, yanan düşman, ateş oku, oyuncu
(meşaleyle 78, meşalesiz 22 = iki adım). Meşale 90 sn, Alf'te 9 altın,
zanaat masasında 2 odun. Yeni karanlık mekân gelince KARANLIK'a değer ve
`isiklar`'a fener konumları yazılır.

**Meşale (2026-09-12):** her yerde yakılır (mekân kısıtı test için
kaldırıldı; aydınlıkta yalnız uyarır). Q döngüsünde sönük meşale de var:
seçince yakılır — "kılıç gibi ele alınsın". Yarıçap 104 (208 denendi, çok büyüktü), beş duraklı yumuşak geçiş. Yanınca `elmesale` geçici silahı envantere girer;
kılıç tutuyorsan meşale sol ele gelir (`1swordmesale` seti), silahsızsan
tek başına (`1mesale`, vuruşu tutuşturur); yay/balta iki el ister, meşale
kemerde kalır ve ışık yarıya iner (`mesaleElde()`). Q döngüsünde meşale
çıplak elin yerini alır. Süre `flags.mesaleKalan`'da kayda girer. Işık
merkezi ayak değil gövde ortası (y-16). Meşaleli setlerde ilk kareler
dönüş karesinden geldiği için meşalesiz: `v3_kur` ALEV_AT alev pikseline
göre kırpar; ton uyumu alevi de küle çevirdiği için `alev_geri` ham
alev piksellerini geri koyar. Yan/arka saldırıda model meşaleyi yere
yayılan aleve çevirdi → "SMALL fist-sized flame, NO fire on the ground".
Yürüyüş döngüsünün başında model meşaleyi belden omuza kaldırıyor (alev y
65→28); döngü her turda onu gösterince "bir aşağı bir yukarı" oluyordu →
`alcak_onu_at`: alev tepeden 8 px'den alçak olan baş kareler atılır. Sıcak
hale yalnız meşale eldeyken; kemerdeyken ışık ×0.35, hale yok.

**Üst katman (perde mekaniği):** sahnenin boyalı asılı bezleri arka plandan
piksel piksel kesilip ayrı sprite yapıldı (`nesne/perde_sol|sag.png`) ve motor
onları **oyuncuyla aynı y sıralamasına** sokuyor (`type:'perde'` → actors
listesi). Arkasına geçen oyuncu bezin ardında kalır; içinden geçilmez (dip
çizgisinde ince blocker) ve arkasında durulabilsin diye bir karo zemin açılır.
Arka plan olduğu gibi durur, üstüne birebir aynı pikseller biner — duruşta
hiçbir fark yok. Cep **en az oyuncunun çarpışma kutusu kadar derin** olmalı (yarıçap 5 birim =
0.625 karo) ve bezin dip çizgisinin hemen üstünde kalmalı: daha yukarıda
oyuncunun kafası ipin üstünden taşıyor, "bezin içinde" gibi duruyor (ölçüm:
bez 3.2 karo, oyuncu 2.7 karo). Engel dip çizgisinin ALTINA konur.
**Arkaya geçebilmek için karoyu açmak yetmez:**
boyalı duvarın `blockers` kutusu hâlâ engelliyor; `delik()` o kutuyu keser
(kesişeni en fazla dört parçaya böler) ve cep **açık zemine kadar** uzatılır,
yoksa kutunun kalan parçası yolu kapatıyor. Aynı yöntem her "arkasına geçilsin" istenen boyalı nesne için
geçerli.

**Girdi modu (2026-09-13):** üç mod — `dokunma` / `klavye` / `gamepad`.
Başlangıç cihaz yeteneğinden (`(pointer: coarse)` veya `maxTouchPoints`), sonra
**son kullanılan girdi kazanır** (parmak → dokunma, oyun tuşu → klavye, pad →
gamepad). Dokunmatik joystick ve yuvarlak düğmeler **yalnız `dokunma` modunda**
çizilir; diğerlerinde altta ince bir tuş ipucu şeridi var. Masaüstünde paneller
klavyeden: I heybe, C karakter, L defter, Esc menü (motor yalnız oyun tuşlarını
dinliyor, paneller React'te). Gamepad motorda her karede taranıyor
(`gamepadTara`): sol çubuk+D-pad hareket, A/RT saldırı, B kaçın, X etkileşim,
Y meşale, LB iksir, RB silah, Start menü; menüde yön tuşları odağı gezdirir, A
tıklar. Ayarlarda elle kilitlenebilir. Tuzak: gamepad saldırısı **bırakılınca
temizlenmeli**, yoksa oyuncu durmadan savuruyor.

**Joystick stili (2026-09-14):** iki seçenek — `sabit` (öntanımlı, ekranın sol
altında sabit halka, değişmedi) ve `gezici` (parmağın DOKUNDUĞU yerde belirir).
`FloatingJoystick`'in geniş dokunma alanı (`.joy-alan`) JSX'te **HUD ve görev
ipucundan ÖNCE** render edilir: aynı stacking context'te z-index yerine DOM
sırası kazanıyor, o yüzden HUD/aksiyon düğmeleri erken/geç sırayla otomatik
üstte kalıyor — geometrik "bu bölgeye dokunma" hesabına gerek kalmadı. Halkanın
görseli `.joystick` sınıfını PAYLAŞMAZ (ayrı `.joystick-serbest`): `.joystick`
kuralları arasında `bottom`e birden fazla yerde `!important` var (bazıları
`.game-shell.dikey .joystick` gibi 3 sınıflı, yani yüksek özgüllükte), paylaşsa
halka her zaman ekranın altına sabitlenirdi. Tuzak: `setPointerCapture`
sentetik/otomasyon kaynaklı `pointerdown`'larda "No active pointer" hatasıyla
atabiliyor (gerçek dokunuşta atmaz) — `try/catch` içine alındı ki nadir bir
gerçek-dünya arızası akışı kesmesin. Çerçeveler CSS değil 9 dilim piksel resmi
(`frame*.png`, dilim 8, kalınlık dilimin katı). `border-image … fill`
merkezi de boyar. "Vazgeç" pastel kırmızı (okunmuyordu). Alt güvenli alan
`calc(N + env(...))` — `max()` YANLIŞ. Mobil dikey mod oynanabilir olmalı
(`portrait` tek başına duraklatmaz). Sol altta sürüm `vX.Y ALPHA`; her
anlamlı değişiklikte 0.1 artar (`SURUM` in data.ts).
**Dokunmatik kontrol kümesinin (joystick + aksiyon düğmeleri + etkileşim
kutusu) alt boşluğu piksel değil `--ui-taban:15dvh`** (2026-09-14) — "ekranın
%15'i altta boş kalsın" isteği. `env(safe-area-inset-bottom)` ayrı bir
değişkende (`--alt-pay`) toplanıp üstüne eklenir. Kısa yatay ekran ve dikey
mod override'larında da aynı `%15` kullanılır; `.interact` kutusu kümenin
hep sabit bir delta kadar (+12px, kısada +10px, dikeyde +100px) üstünde
tutulur ki göreli konumu bozulmasın.

**Ses:** Web Audio sentez; `ORNEKLER` örnek haritası sentezi ezer
(kullanıcı sesleri sonra değiştirecek). Aynı frekans bandında üst üste
gelen sesler duyulmaz — ölüm sesi vuruş+altından ayrı banda ve +0.15 s'ye
kondu. Uzaklıkla kısılır.

---

## 3. Mekanik kararlar

- Melee tek hedef. Alan hasarı yalnızca `Item.alan` olan silahta
  (Yarma baltası, 3 hedef, %35 yavaş). "Rakipleri öldürmek çok kolaydı."
- **Ok türleri** mermiye yazılır VE isabette okunur (yakar/zehir/delici/
  ceker). Ateş: 3 sn × 3 = 9, patlayıcı. Zehir: 8 sn × 2 = 16, yıpratıcı +
  hedefi 0.7× yavaşlatır. Delici geçer, Çengelli çeker (-22).
- Bir eşya özelliği yazıyorsa motorda okunuyor mu diye bak — üç kez yakalandı
  (ok türleri; kulKalkan/yavaslik/oldurunceCan). Yeni alan eklerken
  `grep "\.alanAdi\b" engine.ts` ile doğrula.
- Ateş herkesi yakar (NPC, yoldaş, düşman); NPC'ler ateşten kaçınır.
- Kül Ovası canı eritir (`KUL_HASAR`), pelerin/miğfer/duru su azaltır.
- Düşmanlar iç içe gelmez (ayrışma), haritanın kenarına sıkışmaz.
- **Dalga sistemi yok** (2026-09-13). Sarnıçta yaratıklar alt kapıdan beş dalga
  hâlinde geliyordu; dalgalar arasında mekân bomboş kalıyordu. Artık mekânlar
  baştan dolu: Sarnıç 50, Kül Ovası 22, Dar Geçit 22 yaratık. Konumlar
  yürünebilir **ve çevresi de açık** karolardan, birbirine en az 4-6 karo
  uzaklıkta, girişe ve NPC'lere yakın olanlar elenerek seçildi. Ölçüldü: 4×
  yavaşlatılmış CPU'da bile kare süresi 16.7 ms, 33 ms üstü kare yok.
- **Meşalenin kendi tuşu var (F)**, Q yalnızca silah değiştirir. Üç durum tek
  tuşta döner: sönükse yakar, yanıyorsa ele alır, eldeyse kemere asar (yanmaya
  devam eder, ışık yarıya iner). Mobilde ayrı yuvarlak düğme.
- **Kaçışın (dash) izi var**: 0.028 sn aralıkla soluk kopya bırakılır
  (`izler`), render oyuncudan ÖNCE çizer; kalkışta ayaktan geriye kül tozu.
- Rauf ölmez, diz çöker; ölürse yeniden doğmaz (yerleşim koşullu).
- **Lin kırılabilir** (2026-09-13): "Belki dönmez" dalında iki kademeli bir
  yol var. Onu kıran şey "ağabeyin öldü" demek değil, **sözü anlamsızlaştırmak**:
  "Sana söz verdirdi ki sen kalasın; gitmek isteyen söz verdirir." Kabul ederse
  odunu bırakır, `flags.nilSondu` ve **ateş söner** — `world.ts`'te alev2
  entity'si çizilmez, boyalı köz kalır. Geri alınamaz; seçeneğin altında uyarısı
  var. Ağabeyi indiyse (`ayaz==='indi'`) yol kapalı.
- **Kral öldürülemez** (2026-09-12 kullanıcı kararı). Bir süre vurulabilirdi
  (çubuksuz, "ölçü oyuncunun"); kaldırıldı. Taç eşyası ve Obruk'un satın alma
  seçeneği veride duruyor, şimdilik ulaşılamıyor.
- **Sandık iki yönlü bir kap** (2026-09-13): açınca otomatik yağma YOK, iki
  ızgaralı panel açılır (Sandık | Heybe); **dokunma yığının tamamını**, shift/alt
  tek adet taşır (önce tersiydi: 35 oku tek tek almak işkenceydi ve dokunmatikte
  shift yok). Kuşanılan ok TÜRÜ `equipment`'ta durur ama mermidir — sandığa
  konabilmeli; yalnız silah/zırh/yüzük kilitli.
  İçerik `state.sandiklar[id]` içinde kayıtlı — bıraktığın orada durur. Kuşanılan
  eşya bırakılamaz (soluk gösterilir). Açılmış sandıklar **artık kırılamaz**
  (kırınca içine konanlar da yok oluyordu). Yarasa sürprizi yalnız ilk açılışta.
- Satıcılar `SATICILAR` + `zam`: Alf 1×, Obruk 2.5× ("bey" dersen 2.15×).
  Bir eşya hangi listedeyse yalnız oradan alınır.
- Düşman canı TEK yerde (`Engine.CAN`); iki tabloda `undefined+0=NaN`
  görünmez düşman yaptı.

---

### Yükleme ve performans (ölçüldü 2026-09-12)
Oyun CPU-bağımlı değil: 6× CPU kısıtıyla bile medyan kare 16.7 ms, 33 ms üstü
kare %0. Darboğaz açılıştaki istek sayısıydı. Motor **yalnız çizilen** sheet'i
yükler: NPC → Idle+Walk, oyuncu → Idle+Walk+Attack, düşman → Walk+Attack+Hurt
(Idle/Death hiç çizilmiyor). Wang karoları tembel: beş mekânın da boyalı arka
planı var, yedek yol çalışmıyor → yalnız arka plan yoksa yüklenir. Yeni bir
çizim yolu eklenirse `EYLEM` listeleri genişletilmeli.

**CSS `url()` referansları varlık taramasında görünmez.** v4.2 temizliğinde
`public/pixelify.ttf` bu yüzden silinmiş ve oyun aylarca yedek monospace ile
yazmış (dosya yoksa sunucu index.html döndürüyor → 404 bile görünmüyor).
Varlık silmeden önce `grep -o "url(['\"]\?/[^)'\"]*" app/globals.css`.

## 4. Süreç (alışkanlıklar)

- **Ücretli üretimden önce sor.** Tek çağrıyla fiyatla, toplu basmadan
  önce onay al; kullanıcı onay verdiyse bakiye ve maliyeti raporla.
  `pxl.balance()`; Tier 1 = 2000 üretim/ay.
- **Bu depoda sormadan commit'le ve `main`'e gönder.** Her push'ta
  `.env.local`'ın depoya girmediğini kontrol et. Sürümü artır. Commit
  mesajı NEDEN'i anlatır (ne ölçüldü, ne kırıktı).
- Geçici `(window as any).__oyun=game;` kancasını commit'ten önce kaldır.
- Oyun içi doğrulama Playwright + sistem Chrome. Kayıt enjeksiyonu
  `pagehide` ile ezilir → senaryo başına yeni context + `addInitScript`.
  Klavye `down → 90 ms → up`. Bkz. hafıza `kul-ve-yemin-test-harness`.
- Kullanıcıya bir şeyi "çalışıyor" demeden önce oyunda ölç (sayı ver:
  can 34→16, hedef 45→19.8 birim). Yanlış söylediysen düz söyle.
- Kod yorumları ASCII Türkçe (kod tabanının dili), oyuncuya görünen
  metin tam Türkçe. Yorum "ne"yi değil "neden"i ve **hangi hata yüzünden**
  yazıldığını anlatır.
- Regex ile toplu kod silme yapma (DOTALL kodu yedi, checkout başka bir
  düzeltmeyi de geri aldı). Tam dizge + assert ile değiştir.
- Yeni script'ler `scripts/` altında; her biri başında ne yaptığını,
  maliyetini ve akıştaki yerini yazar. Klasör haritası `KLASORLER.md`.

### Yeni mekan iki kaynak görselden (yeşil maske yöntemi) — v8.3, Eski Depo
Kullanıcı hazır bir sahne + aynı sahnenin yürünebilir zeminini YEŞİLE
boyanmış halini masaüstünden verdiği zaman: `scripts/tunel_kur.py` /
`scripts/depo_kur.py` deseni — yeşili en büyük bağlı bileşenle bul (yosun/
parlak leke gibi küçük kopuk lekeler elensin), KARO ızgarasına indirger,
istenen açıyla çevir. Kaynak çözünürlük mevcut mekanlarla birebir eşleşmek
zorunda değil: en/boy oranı hangi mekân ailesine (kare 30×30 mı, geniş
54×30 mı) yakınsa ona küçültülür (`Image.BOX` filtresiyle, blok-ortalama).
Zemin doğrudan maskeden okunur — `mekan_kur.py`'deki parlaklık tahmini
YOK, ayrı `blockers` da YOK (maskenin 0'ı zaten engel).

Kullanıcı "kapılar eşleşsin diye 180 derece çevir" dedi ama sahnede gerçek
bir kapı/yan geçit yoktu — tek geçit üstte karanlığa açılan bir kemerdi.
180 çevirince o kemer alta düştü, bağlantı noktası olarak zeminin tuval
kenarına değdiği (varsa) tek nokta kullanıldı. Sığınak tarafında da hazır
çizilmiş bir kapı YOKTU: yeni geçiş duvara elle delindi (`tiles[j][i]=1`),
yani oyuncu şu an görsel olarak düz taşın içinden yürüyor. Kullanıcı fark
ederse: bu bilinen bir eksik, boyanmış bir kapı eklenirse iyileşir — kendi
başına "çözüldü" denmesin.

### "Boş ve blockers'tan temiz" ≠ "ulaşılabilir" — v8.4 düzeltmesi
Eski Depo kapısını ilk koyduğumda (satır 20-24) o cebin blockers'tan boş
olduğunu kontrol ettim ama ANA ODAYA BAĞLI olup olmadığını kontrol
ETMEDİM - kullanıcı "kapıdan geçemiyorum" dedi, meğer Kral'ın köşe
mobilyası o cebi dört yandan kapatıyormuş (kendi başına ulaşılamaz bir
cep). Ders: yeni bir gecis/kapı eklerken, hedef karonun BOŞ olması
yetmez - spawn noktasından BFS ile (4 yönlü, blockers+ZEMIN ile) gerçekten
ulaşılabilir olduğu doğrulanmalı. Tahtada elle "burası boş görünüyor"
demek yeterli değil.

### En/boy orani yakinligi != ayni karo yogunlugu — v8.5 duzeltmesi
Eski Depo'yu ilk kurarken (v8.3) kaynak gorselin en/boy orani (1.79)
disari/cistern'inkine (1.80) yakin diye dogrudan onlarin 54x30 olcegine
kucultmustum. Kullanici "devasa olmus" dedi - HAKLIYDI. Oran yakinligi
TESADUF, kaynagin gercek karo yogunlugunu GOSTERMEZ. Dogru yontem: ortak
bir nesneyi (sandik) VEYA duvar dokusunu (tas orgusu) mevcut bir mekanla
(haven.png) piksel piksel karsilastir - "bu sandik oradaki sandiktan kac
kat genis" sorusu cevabi (~3x) doğrudan olcek faktorunu verir. Depo aslinda
96px/karo'ydu (32 degil), yani 28x16 karo - 54x30 degil. Ayrica kullanici
180 derece cevirmekten sonradan vazgecti ("ters olmasin") - donme talebi
gelse bile HER ZAMAN geri alinabilir bir tercih, kalici varsayilmasin.

### Eski Depo mekanı geri alındı (şimdilik) — v8.6
Kullanıcı 90 derece döndürmeyi de denedikten sonra "döndürme iptal normal
dursun", sonra da "obruk ve adamları eski yerine gitsin bu haritayı da
şimdilik kaldıralım" dedi. Zone tipi/ZONES/world.ts dalı/haven'daki sol
kapı/engine.ts'teki bg yükleme girişi TAMAMEN kaldırıldı (perde
mekaniğindeki gibi - devre dışı bırakmak değil, silmek). `public/assets/
arkaplan/depo.png` ve `scripts/depo_kur.py` dosyaları SİLİNMEDİ (kullanıcı
"şimdilik" dedi, kendi mekânı üretilince tekrar kullanılabilir) ama hiçbir
kod onlara referans vermiyor. Obruk/Karga/Çakal Sarnıç Ağzı'ndaki eski
konumlarına (6,13)/(5,10)/(5,16) döndü.

Bu denemeden kalıcı iki şey: (1) `Entity.uzaktan` mekaniği (tezgah
arkasındaki NPC ile konuşma) KULLANILMADIĞI İÇİN de geri alındı - başka
kimse kullanmıyorsa yarım kalan altyapıyı bırakma. (2) Uslu artık
`flags.usluYer` ile iki mekân (Son Sığınak / Sarnıç Ağzı) arasında
"geziyor" - `engine.ts`'in `changeZone`'unda bu iki mekân arasındaki
kapıdan geçerken %50 ihtimalle yer değiştiriyormuş gibi davranıyor.

### "Boş" bir haritanın gerçek karo boyutu ölçülmeden VARSAYILMAMALI
Eski Depo denemesinin en büyük dersi buydu ve tekrar tekrar maliyetli
çıktı (v8.3 devasa, v8.5 düzeltme, v8.6 döndürme/geri alma). Yeni bir
harita eklerken artık [[kul-ve-yemin-esaslar-skill]] okunduktan sonra
BAŞA dönüp bu notu da oku: (a) en/boy oranı yakınlığı ölçek kanıtı DEĞİL,
(b) yeni bir kapı eklerken hedef karonun boş olması yetmez, BFS ile ana
odaya bağlı olduğu doğrulanmalı, (c) kullanıcı "döndür/çevir" derse yön
belirtmeden asla varsayma, tek bir yönde dene ve göster.

### Harita editörü artık gerçek veriyi okuyup yazabiliyor — v8.7
`public/harita-editor.html` (bkz. önceki not) `vite.config.ts`'teki dev-only
bir eklentiyle konuştu: GET `/__harita/:zone` `server.ssrLoadModule` ile
`world.ts`'i SSR modda yükleyip `makeWorld()` çağırır, GERÇEK tiles/
blockers döner (editör artık boş değil, oyundaki hâli açılır). POST
`/__harita/kaydet` `{zone,rows}` alır, `world.ts` metninde o zone bloğunun
sınırlarını (`zone==='X'`'ten bir sonraki `}else if(zone===` ya da son
`return {zone,...}`'a kadar) bulup içindeki TEK `const ZEMIN=[...]`
satırını değiştirir. Round-trip (aynı veriyi geri yazmak) ile test edildi -
`git diff` sıfır fark verdi. Sadece `npm run dev` açıkken çalışır, build'e
girmez. `magara`/`yikik` hâlâ `ZEMIN` dizisi değil salt `blockers` ile
tanımlı - kaydet düğmesi onlarda kasıtlı olarak hata verir.

### 100x100 "test100" mekanı — GEÇİCİ, kullanıcı karar verecek
Kullanıcı "tüm oyunu 100x100'e taşı" isteğine kadar gitti ama bunun her
mekanın YENİDEN sanatı + tüm NPC/blocker/gecis koordinatlarının elden
geçmesi demek olduğunu söyleyince "önce bir tane test mekanı ver, bakayım"
dedi. `scripts/test100_kur.py` haven.png'den zemin/duvar/sandık parçalarını
kırpıp tekrarlayarak GERÇEK OLMAYAN bir 3200×3200 dolgu üretti - sadece
ölçeğin nasıl hissettirdiğini görmek için. Bağlantı: Son Sığınak'ta Kral'ın
koltuğunun hemen kuzeyinde (daha önce Eski Depo'nun kullandığı, WASD ile
doğrulanmış aynı nokta) GEÇİCİ bir kapı. Karar çıkınca (ya kalıcı yapılacak
ya da tamamen silinecek) `Zone` tipinden, `ZONES`'tan, `world.ts`'teki
`test100` dalından ve o geçici kapıdan hepsi birden temizlenmeli.

### CİDDİ HATA: harita editörünün "kaydet"i haven'ın zeminini bozmuştu — v8.8
Kullanıcı "karakter hareket edemiyor" dedi - kök neden buydu: v8.7'de
kurduğum `/__harita/kaydet` dal-sınırı tespiti `src.indexOf("zone==='X'")`
ile arıyordu, ama bu alt dizge dosyanın BAŞINDAKİ w/h ternary'sinde de
geçiyor (`zone==='tunel'?13:...`). "tunel"i kaydet dediğimde (round-trip
testi sırasında, boyamadan) ilk eşleşme o ternary satırıydı, blok sınırı
oradan bir sonraki gerçek `}else if(zone===`'a kadar hesaplandı - bu da
YANLIŞLIKLA TÜM haven bloğunu kapsadı, ve içindeki İLK `const ZEMIN=[...]`
(haven'ın kendi zemini) tunel'in 13 genişliğindeki satırlarıyla ezildi.
Oyun açılıyordu, sahne görünüyordu, ama `tiles[y][x]` her yerde `undefined`
döndüğü için karakter HİÇBİR YÖNE hareket edemiyordu - sessiz bir bozulma,
konsol hatası yok. Düzeltme: arama dizgesi `zone==='X'){` oldu (sadece
gerçek dal açılışı bu şekilde biter, ternary '?' ile biter). **Ders: metin
tabanlı kod-değiştirme araçları yazarken, aranan alt dizgenin dosyada
BAŞKA amaçla da geçebileceğini varsay - ilk eşleşmeyi doğrulamadan kullanma.**
Ayrıca: "oyun açılmıyor/hareket etmiyor" gibi bir şikayet gelince önce
`git diff`e bak - kodun kendisi mi bozuk, çalışma zamanı mı.

### Kucuk bir dokuyu tekrarlamak "bozuk" okunur, bir SAHNEYI tekrarlamak okunmaz — v8.9
test100'un v1'i (haven'dan kirpilan kucuk zemin/sandik parcalari, binlerce
kez tekrarlanmis) kullanicidan "tuhaf bozuk duruyor, anlamadım" tepkisi
aldı - gösterip "bu placeholder, gerçek sanat değil" diye açıklamak
yetmedi, gorsel gercekten goz icin rastgele gurultu gibi okunuyordu.
Kullanici "elimizdeki hazır map görsellerinden biriyle uyarla" deyince v2:
VAR OLAN BUTUN BIR MEKANI (cistern, 54x30) kendi icinde 2x4 tekrarlayip
100x100'e kirptim - kucuk bir doku degil, tanidik/tutarli bir SAHNE
tekrarlaniyor artik (merdiven, mantar, kaya), goze "kopyalanmis gercek bir
yer" gibi okunuyor. **Ders: yer tutucu/test gorseli icin kucuk bir dokuyu
yogun tekrarlamak yerine, var olan butun bir sahneyi seyrek tekrarlamak
her zaman daha "gercek" okunur.**

Teknik not: boyle bir tekrar kurulumunda mekanin kendi duvarlari tekrar
SINIRLARINDA (satir/sutun) kapali kalir ve N ayri kapali odaya boler -
BFS ile mutlaka dogrulanmali (bu depoda ilk denemede 8453 zemin
karosundan sadece 1239'u birbirine bagliydi), dikis satir/sutunlari elle
tam acilmali.

### Harita editörüne piksel-hassas "Engeller" modu — v9.0
Kullanıcının gerçek isteği "100x100" değilmiş: nano-banana ile ürettiği
görsellerde mobilya kutularını (blockers) karoya kilitlenmeden, tam
kenarına oturtacak hassasiyet istiyordu ("yatağın kenarı boxın ortasına
geliyor"). Çözüm resolution değiştirmek değildi - `blockers.push([x1,y1,
x2,y2],...)` zaten düz aritmetikle okunuyor (`walkable()`), yani ondalıklı
karo koordinatları (`[7.3,5,8,7.6]`) baştan beri çalışıyordu, hiç
kullanılmamıştı. `harita-editor.html`'e ikinci bir mod eklendi: **Zemin**
(eski, karo karo boyama) ve **Engeller** (yeni, fare ile serbest kutu
çiz/taşı/boyutlandır - köşe tutamakları, `Shift`=çeyrek karoya yuvarla,
bırakınca 0.05 hassasiyet). `vite.config.ts`'teki kaydet uç noktası
`kind:'blockers'` alacak şekilde genişledi: zone bloğunda var olan
`blockers.push(...)` satırını değiştirir, yoksa (tunel/test100 gibi) dal
açılışının hemen ardına yeni satır ekler. Round-trip (haven'ın 34 kutusunu
aynen geri yazmak) ile test edildi, sıfır fark.

### Harita editörüne üçüncü mod: "Nesneler" (PNG yükle + yerleştir) — v9.1
Motor `decor` entity'lerini boyalı bir sahnede HİÇ ÇİZMİYORDU (`if(!bg?.
naturalWidth)this.sprite(...)`- yorum: "mobilya zaten sahnenin icinde
cizili, ustune eski setten bir masa koymak yabanci duruyordu"). Yani yeni
bir PNG'yi sahneye görünür şekilde eklemenin motor tarafında hazır bir
yolu yoktu. Eklendi: `Entity.overlay?:boolean` - true ise `!bg?.
naturalWidth` şartını atlar, `actors[]` y-sırasına göre normal bir sprite
gibi çizilir (bkz. engine.ts `overlayNesneleriYukle()` - zone değişince
`world.entities`'te taranıp eksik görseller dinamik yüklenir, sabit
preload listesine girmez). Editördeki üçüncü mod: PNG yükle (sunucuya
`/__harita/nesne-yukle` ile yazılır, `public/assets/nesne/ed_<ad>.png`),
tuvale tıkla=yerleştir, sürükle=taşı, sayısal x/y/ölçek alanları. Kayıt
(`kind:'nesneler'`) zone bloğunda `/* @harita-editor:nesneler */ ...
-son */` yorum sınırları arasını YÖNETİR - NPC/sandık/ateş gibi elle
yazılmış hiçbir şeye dokunmadan güvenle silip yeniden yazabiliyor.

**Tekrar eden hata, tekrar bulundu:** ilk yazımda ekleme `'\n'+ İÇERİK`
yapıyordu ama kaldırma regex'i o baştaki `\n`'i eşlemiyordu - kaldırınca
kalıcı bir boş satır birikiyordu. Çözüm: `\n` işaretleyicinin (NESNE_BAS)
kendisinin İÇİNE alındı, ekleme ve eşleşme AYNI sabiti kullanıyor. Genel
ders (bkz. [[kul-ve-yemin-esaslar-skill]] içindeki önceki not): bir metin
ekleme/kaldırma çifti yazarken ikisinin de TAM AYNI sınırlayıcıyı
kullandığını doğrula, ayrı ayrı "mantıklı görünüyor" yetmiyor - round-trip
(ekle→kaldır, diff sıfır olmalı) ile test et.

### Masaüstü başlatıcı + 4. mod "Karakterler" — v9.2
`~/Desktop/Kül ve Yemin - Başlat.command` (çift tık, Terminal'de çalışır):
repoya cd'ler, dev sunucusu açık değilse başlatır (portu polling ile
bekler), sonra oyunu + harita editörünü + karakter editörünü aynı anda
açar. `public/karakter-editor.html` sadece `harita-editor.html#karakter`e
yönlenen küçük bir kısayol - gerçek kod hep tek dosyada (`harita-editor.
html`), hash URL'den mod önceden seçiliyor (`location.hash`).

Karakterler modu `nesneler` moduyla AYNI desen: `kd_` ön-ekli id'ler bu
aracın kendi yönettiği NPC'ler (marker bloğu `@harita-editor:
karakterler`), ön-eksiz olan TÜM diğer NPC'ler (Mirna, Alf, Kral, vb.)
sarı çerçeveli SALT OKUNUR noktalar olarak gösteriliyor - hiç
silinmiyor/değişmiyor. Portre paleti `/assets/characters/N/D_Idle.png`
(N=1 için `portre.png`) ilk kullanımda yükleniyor - dikkat: bu yükleme
fonksiyonunu çağıran kod (hash'ten mod seçimi) SCRIPT'İN EN BAŞINDA
çalışıyor, bu yüzden ona referans veren `let` değişkenler (`portrelerYuklendi`
vb.) de en başta tanımlanmalı - sonradan tanımlarsan "cannot access before
initialization" hatası alırsın (TDZ). Round-trip ile test edildi (haven'a
NPC ekle→kaydet→boş listeyle kaydet, sıfır fark), canlı oyunda render
edildiği doğrulandı.

### Minimap: soyut gri kutular yerine gerçek arka plan küçültülmüş — v9.3
Kullanıcı "minimap saçma duruyor" dedi ama bunun için ayrı bir editör
istemedi ("o kadar büyük çaplı bir iş değil") - direkt düzeltmemi istedi.
`app/page.tsx`'teki `MapView`, `w.tiles`'tan gri `<rect>` kareleri çizmek
yerine artık `/assets/arkaplan/${zone}.png`'yi bir `<image>` olarak
SVG'nin `viewBox`'ına (`w.w*5 x h.h*5`) geriyor - motorun kendi render()'ı
da arka planı `w.w*16 x h.h*16` dünya birimine gerdiği için (bkz.
engine.ts) nokta pozisyonlarıyla (`x/16*5`) aynı oranti, hizalama bedava
geliyor. Üstüne %40 opaklıkta koyu bir `<rect>` var ki noktalar okunur
kalsın. `image-rendering:auto` ile inline override edildi çünkü
`.dungeon-map`'in genel `pixelated` kuralı küçük bir fotoğraf-gibi
küçültmede (tile-grid'in aksine) daha kaba/gürültülü görünürdü.

### NPC'ye ücretsiz silah varyantı: portrait alanı STRING de olabilir — v9.4
Kullanıcı "karakterin yürüyüşüne sadece silahı değiştirip aynı animasyonu
kullanmak mümkün mü" diye sordu - netleştirince (AskUserQuestion) YENİ bir
PixelLab üretimi DEĞİL, VAR OLAN hazır varyantları kullanmak istediği
ortaya çıktı. Motor zaten sprite anahtarını `characters${e.portrait}${yon}
${eylem}` diye düz string-concat ile kuruyordu (bkz. engine.ts satır ~984)
- yani `e.portrait`'i `'1sword'` gibi bir STRING yapmak, oyuncunun zaten
yüklenmiş silah-varyantı setlerini (characters/1sword/, 1bow/, 1balta/,
1mesale/, 1swordmesale/) HİÇBİR yeni üretim olmadan bir NPC'ye giydiriyor.
`Entity.portrait` tipi `number|string` oldu. Karakterler modunda portrait
1 (insan-şekilli beden) seçilince bir "silah varyantı" paleti çıkıyor;
yerleştirirken VEYA sonradan seçili NPC üzerinde değiştirilebiliyor.
Kaydetme ucu (`vite.config.ts`) portrait'in türüne göre tırnaklı/tırnaksız
yazıyor - **bunu unutursan** (`Math.round(o.portrait)` gibi sayı
varsayarsan) string bir portrait NaN'a döner, sessizce kırılır.

**Genel ders:** kullanıcı "X mümkün mü" diye sorduğunda, önce mevcut kod
gerçekten neyi destekliyor diye bak (`grep`) - burada motor zaten
string-concat kullandığı için "yeni özellik" aslında var olan bir
mekanizmanın ücretsiz bir yan kullanımıydı, hiç yeni altyapı gerekmedi.

### Harita editörüne 5. mod: Silah Ekle (sprite üzerine silah yerleştirme) — v9.6
Kullanıcı v9.4'teki "silah varyantı seç"i "karakter editörü" sandı ama
asıl istediği farklıydı: "spriteları düzenleyebilmek, silahlar eklemek
çıkarmak gibi." Netleştirince (AskUserQuestion) istenen: serbest piksel
fırçası DEĞİL, bir silah görselini animasyon karelerinin üzerine
KONUMLANDIRMA aracı; sonuç orijinal karakterin üzerine YAZILMAYACAK, YENİ
bir varyant klasörü olarak kaydedilecek. `vite.config.ts`'e
`POST /__harita/sprite-kaydet` eklendi (6 sheet - D/U/S × Idle/Walk -
`public/assets/characters/<taban>_<varyant>/` altına yazıyor), GET
endpoint'i mevcut varyant klasörlerini (`ozelKarakterler`) tarayıp
dönüyor ki Karakterler modundaki portre paletinde de seçilebilsinler.
Aracın kendisi: taban karakter seç → silah görseli seç (hazır ikon ya da
PNG yükle) → her sheet için TEK TEK offset/ölçek/açı ayarla (frame 0'a
göre) → "oluştur" TÜM karelere aynı göreli dönüşümü uyguluyor. Uçtan uca
Playwright ile test edildi (Alf + guard ikonu → `2_silahli` varyantı →
oyunda NPC olarak yerleştirip ekran görüntüsüyle doğrulandı) - test
sonunda temizlendi (`2_silahli` klasörü, geçici test scriptleri, geçici
`__oyun` kancası silindi, hiçbiri commit'e girmedi).

### Silah Ekle: sheet başına tek konum yetmedi, kare kare (frame-by-frame) oldu — v9.7
Kullanıcı v9.6'daki akışı denedikten sonra "kare kare istiyorum" dedi -
netleştirince (AskUserQuestion) "her sheet'e TEK konum, tüm karelere
otomatik uygulanır" yetmiyordu; yürüyüşün HER adımında silahın ayrı
ayrı konumlanmasını istiyordu (ör. adım 0'da elde yukarıda, adım 3'te
aşağıda tutulması gerekebilir). `silahPoz[sheetKey]` artık tek bir
`{dx,dy,scale,rotDeg}` değil, kare sayısı kadar (`Math.floor(genişlik/64)`
- bu motorun NPC'leri hep 64px'lik karede dilimlemesiyle AYNI hesap,
bkz. `engine.ts`'teki `sprite()`) elemanlı bir DİZİ. Sheet altına bir
kare şeridi (küçük thumbnail'ler) eklendi, hangi kare seçiliyse tuval
onu gösterip onun konumunu düzenliyor. İki hızlı-başlangıç butonu var:
"bu kareyi bu çizimin tüm karelerine uygula" (sheet içi doldurma) ve
"bu çizimi diğerlerine kopyala" (kare sayıları eşit olmayan sheet'ler
arasında `Math.min(i,uzunluk-1)` ile en yakın kareyi kopyalar). Uçtan
uca Playwright ile doğrulandı: aynı silah kare 0'da ve kare 3'te GERÇEKTEN
farklı pikselde kaydedildi (PNG'yi kırpıp göz kontrolü yapıldı).

### Karakter editörü (Karakterler + Silah Ekle) komple kaldırıldı — v9.8
Kullanıcı "karakter editörü şimdilik iptal edelim komple map editör
kalsın" dedi - v9.4-9.7'de eklenen Karakterler (NPC yerleştirme) ve
Silah Ekle (sprite üzerine silah komposit etme) modlarının İKİSİ de
kaldırıldı, harita editöründe sadece Zemin/Engeller/Nesneler kaldı.
Kaldırılanlar: `harita-editor.html`'deki iki mod butonu, iki panel, tüm
ilgili JS (portre paleti, silah varyantı seçimi, kare-kare
konumlandırma, vb.); `vite.config.ts`'teki `karakterler` kind'ı,
`sprite-kaydet` endpoint'i, GET yanıtındaki `npcler`/`ozelKarakterler`
alanları; `public/karakter-editor.html` yönlendirme kısayolu (silindi);
masaüstü başlatıcının üçüncü `open` satırı. **"Şimdilik" yani geri
gelebilir** - `git log`'da v9.4-9.7 commit'leri koddan geri
çıkarılabilir bir referans olarak duruyor, sıfırdan yazmaya gerek yok.
Not: `Entity.portrait:number|string` ve `overlay:boolean` (world.ts) ile
motorun NPC portresini string-concat ile kurması (engine.ts) - yani
"ücretsiz silah varyantı" ALTYAPISI - KALDIRILMADI, sadece onu
KULLANAN editör arayüzü kaldırıldı; geri getirmek istenirse üstüne
UI eklemek yeterli olur.

**Tehlikeli ders (veri kaybı, çözülmedi çünkü zaten "özellik"):** harita
editöründeki HER "kaydet" ucu (blockers/nesneler/karakterler), o mekân
için BOŞ liste gönderirsen mevcut satırı TAMAMEN temizler - bu arayüzde
zaten yazıyor ("kutu yok - kaydedersen var olan blockers.push satırı
temizlenir") ama tarayıcıdan DOĞRUDAN fetch ile test/temizlik yaparken
(UI'nin kendi state'i olmadan) bu kolayca unutulup yanlış `kind`'a boş
liste gönderilebiliyor - bir seferinde haven'ın `blockers.push` satırı
tam da böyle sessizce silindi. **How to apply:** doğrudan
`/__harita/kaydet` fetch'i ile test/temizlik yaparken önce O ZONE için
GET ile güncel veriyi çek, sadece değiştirmek istediğin alt-listeyi
düzenleyip GERİ gönder - asla elle yazılmış boş bir liste gönderme.
Şüphede kalırsan `git diff --stat` ile satır sayılarını kontrol et,
beklenenden büyükse tam `git diff`'e bak.

### Sığınakta mobilyaların çarpışması kaldırıldı — v9.9
Kullanıcı editörden haven'ın TÜM `blockers` kutularını sildi ve
kalıcı olarak istedi (netleştirme için AskUserQuestion soruldu, bir
önceki maddedeki "boş liste = temizler" davranışının GERÇEKTEN
istendiğinden emin olmak için) - artık sığınaktaki mobilyaların
üzerinden yürünebiliyor, bilinçli bir tasarım kararı, hata değil.

### Engeller modu: daire/elips ve poligon (pen tool) — v10.0
Kullanıcı "daire de çizebilir miyim" diye sordu, sonra "pen tool gibi
bişey de iyi olur" dedi - AskUserQuestion ile "ikisi de" seçildi.
`World['blockers']` tipi `[number,number,number,number][]`'dan
`number[][]`'e gevşetildi (TS union yerine RUNTIME uzunluk kontrolü
tercih edildi - zaten dosyada onlarca elle yazılmış 4-sayılık dikdörtgen
var, tam tip güvenliği ugruna hepsini nesneye çevirmek gereksiz churn
olurdu): 4 sayı dikdörtgen (değişmedi), 5 sayı elips (son eleman etiket
`1`, sınırlayıcı kutuya içirilmiş), >=7 tek sayı poligon (son eleman
etiket `2`, öncesi düz `[x0,y0,x1,y1,...]` nokta listesi). `walkable()`
üçünü de GERÇEK geometrisiyle çarpıştırıyor - elips normalize edilmiş
mesafe testi, poligon ray-casting nokta-içeride testi (aktörün kare
hitbox'ının dört köşesi test ediliyor, `tilesOk`'daki teknikle aynı).
Editörde yeni "2 · Şekil" araç seçici: Dikdörtgen/Daire AYNI
sürükle-oluştur/köşeden-boyutlandır/gövdeden-taşı akışını paylaşıyor
(`boxes[i].tip` alanı sadece çizim ve dışa-aktarımı değiştiriyor, tüm
etkileşim kodu ORTAK) - yeni bir şekil eklerken önce "bu, var olan
kutu-tabanlı etkileşimle mi paylaşılabilir" diye bakmak işi çok
kısaltıyor. Kalem (poligon) tamamen ayrı bir akış: tıkla-tıkla nokta
ekle, ilk noktaya yakın tıkla ya da Enter ile bitir, Escape ile vazgeç;
tamamlanmış poligon gövdesinden sürüklenince TÜM noktalar birlikte
kayıyor, tek bir nokta tutamağından sürüklenince sadece o nokta.

**Doğrulama yöntemi (yeni, kullanışlı):** `npx vite-node` ile world.ts'i
DOĞRUDAN import edip `walkable()`'ı sentetik (tamamen yürünebilir,
gerçek bir zone'un dar koridor kısıtlarından bağımsız) bir `World`
nesnesiyle test etmek, gerçek bir zone üzerinde Playwright/oyun
üzerinden test etmekten çok daha hızlı VE daha güvenilir sonuç verdi -
gerçek zone'da (tunel) ilk denemede "elips çalışmıyor" gibi göründü ama
asıl sebep test noktalarının o dar koridordaki komşu duvara aktörün
kendi hitbox yarıçapıyla değmesiydi (blockers'la ilgisi yoktu). Çarpışma
matematiği gibi geometrik bir şeyi doğrularken önce sentetik/izole veriyle
test et, gerçek içerikle test etmek TALI/onay adımı olsun.

### Oyuncunun çarpışma kutusu golgesine gore dikeyde daraltildi — v10.1
Kullanıcı "karakter zeminde göründüğünden fazla yer kaplıyor, geçebilecek
gibi görünen boşluktan geçemiyor" dedi, örnek olarak S (yan) pozisyonda
gölgesinin çizgiye değdiği yerde durmasını verdi. Kontrol edince: oyuncu
HER ZAMAN simetrik r=5 kare hitbox ile çarpışıyordu ama render'daki
gölge elips (bkz. engine.ts, `ellipse(s.x,s.y+1,8.5,2.8,...)`) yatayda
geniş (8.5px), dikeyde ÇOK ince (2.8px) - yani görünmez kutu dikeyde
gölgenin neredeyse 2 katı yer kaplıyordu, tam da şikayet ettiği hissin
kaynağı. `walkable()`'a opsiyonel `ry` (dikey yarıçap, verilmezse r ile
aynı - GERİYE DÖNÜK UYUMLU, mob/ok/diğer tüm çağrılar değişmedi) eklendi;
sadece oyuncunun kendi hareket adımı (`engine.ts` içindeki TEK
`this.move(this.state,...)` çağrısı) `Engine.OYUNCU_DIKEY_YARICAP=3`
kullanıyor artık. Yatay tarafa DOKUNULMADI - sadece dikey sıkışmalar
rahatladı. Senkron testlerle doğrulandı (8px dikey boşluk artık
geçilebiliyor, 4px hâlâ engelli, yatay boşluklarda davranış aynı).
**Genel ders:** görsel (sprite/gölge) ile görünmez oyun mantığı (hitbox)
arasında boyut/oran uyuşmazlığı olursa, "büyük görünen ama küçük
davranan" ya da tam tersi bir his kullanıcıya hep "buradan geçebilmem
lazımdı" gibi somut bir örnekle geliyor - önce render koduna bakıp
gerçek görsel boyutları (gölge, sprite capası vb.) hitbox sabitleriyle
KARŞILAŞTIRMAK, tahminle uğraşmaktan çok daha hızlı kök nedene götürüyor.

### v10.1'in devamı: gölgeden bağımsız küçültme + gölge engelde kırpma — v10.2
v10.1'deki "dikey yarıçapı gölgeye yaklaştır" çözümü YETMEDİ - kullanıcı
"hâlâ tam yaklaşamıyorum, gölgeyi çarpışmaya hiç KARIŞTIRMA" dedi. Ders:
bir önceki düzeltmenin GEREKÇESİ (gölge boyutuna göre ayarlamak) kullanıcı
için yanlış zemindeydi, sonucu (biraz rahatlama) yeterli değildi - ikisi
ayrı şeyler, biri düzelince öbürü otomatik doğru sayılmamalı. Şimdi
`Engine.OYUNCU_YATAY_YARICAP=3` / `OYUNCU_DIKEY_YARICAP=2` gölgeden
BAĞIMSIZ, sırf daha sıkı olacak şekilde seçildi (5/5'ten küçültüldü);
yorumda gölge artık gerekçe olarak GEÇMİYOR, sadece "hâlâ dar/geniş
gelirse bu iki sabiti ayarla" diyor.

Ayrıca kullanıcı ayrı bir şey daha istedi: golgenin bir engelin (mobilya)
üzerine SAÇMA bir şekilde binmesi - çünkü mobilya "Nesneler" gibi ayrı
bir entity olarak eklenmedi, tek parça boyalı arka planın içinde, motor
golgeyi ondan gizleyemiyor. Çözüm: `Engine.golgeCiz()` golgeyi ana tuvale
DOĞRUDAN çizmiyor - önce küçük bir offscreen tamponda çiziyor, sonra
`globalCompositeOperation='destination-out'` ile TÜM blockers'i (rect/
elips/poligon, walkable()'daki ayni uzunluk-tabanli ayirma) o tamponun
İÇİNDE siliyor, en son tek parça olarak ana tuvale yapıştırıyor. Bunu
ana tuval üzerinde doğrudan yapmak (izole tampon olmadan) arka plan/diğer
her şeyi de delerdi - **destination-out'u her zaman izole bir tamponda
kullan, canlı sahne tuvalinde asla.** Ekran görüntüsüyle doğrulandı: açık
zeminde gölge normal, mobilya kenarında gölge oraya binen kısmıyla
görünmez oluyor.

### v10.3-v10.5: hitbox ince ayarı iki eksende BAĞIMSIZ yapılmalı
Oyuncunun çarpışma yarıçapı birkaç round'da ayarlandı (yatay/dikey ayrı
ayrı `OYUNCU_YATAY_YARICAP`/`OYUNCU_DIKEY_YARICAP`, `engine.ts`). **Ders:**
kullanıcı "W/S'de iyi ama A/D'de kötü" dediğinde, iki eksen birbirini
TEMSİL ETMİYOR - biri için yapılan düzeltme diğerini otomatik çözmüyor,
her ekseni kendi şikayetine göre ayrı ayarla. Ayrıca golgeyi (görsel)
gerekçe olarak kullanma - kullanıcı acikca "golgeyi carpismaya karistirma"
dedi, sabitler artik golgeden BAGIMSIZ secildi.

### v10.6-v10.7: Nesneler modunda R=2 İKİ KERE uygulanan kritik 2x boyut hatası
Kullanıcı yeni bir mobilya PNG'i (çamaşır ipi, `ed_props.png`, 1438x1093 -
kaynak görsel odanın kendi arka planından bile büyük) editörün Nesneler
modundan yerleştirdi, ölçeği editörde "küçük ve doğru" görününceye kadar
ayarladı, kaydetti - ama OYUNDA yine devasa çıktı. Bunu ilk seferinde
(v10.6) haven.png'nin gerçek piksellerini elle ölçüp x/y/s hesaplayarak
(motorun `im.width/R` formülüyle) çözdüm ve ekran görüntüsüyle
doğruladım - çalıştı. Ama kullanıcı editörden tekrar ayarlamayı deneyince
"editörde küçük oyunda devasa" şikayeti AYNEN geri geldi. Kök neden:
`harita-editor.html`'in Nesneler modu (`draw()` içindeki `iw=p.img.width*
scale/2*s` VE `objeKutusu()`'ndeki `iw=p.img.width/2/pxKaro*s`) R=2
katsayısını YANLIŞLIKLA İKİ KERE uyguluyordu (bir kere zaten `pxKaro=32`
içinde gömülüyken, bir kere de ekstra `/2` ile) - yani editörün önizlemesi
motorun GERÇEK render formülünden (`im.width/R`, `engine.ts` `sprite()`)
sistematik olarak YARI boyuttaydı. Kullanıcı editörde "doğru küçüklükte"
görünceye kadar `s`'yi ayarladıkça, aslında oyunda TAM 2 KATI büyük bir
değer üretiyordu - hangi sayıyı denerse denesin editör onu YALANLIYORDU.
Düzeltme: her iki yerden de fazladan `/2`'yi kaldır (`iw=p.img.width*
scale*s` ve `iw=p.img.width/pxKaro*s`), izole bir hesapla (`native_w/R/16
=== native_w/pxKaro`) doğrula.

**Genel ders (çok değerli):** bir görsel düzenleme aracının (editör)
önizlemesi ile onu TÜKETEN gerçek motorun (oyun) render formülü ayrı
kod yollarında yaşıyorsa, İKİSİ ARASINDAKİ TUTARLILIK asla varsayılmasın
- kullanıcı "editörde X gördüm ama oyunda Y oldu" dediğinde İLK ŞÜPHE bu
olmalı (bir sonraki denemede aynı şikayetin AYNEN tekrarlanması bunun
GÜÇLÜ bir işaretiydi - "az önce düzelttim" diye görmezden gelinmemeli).
Çözüm sonrası izole bir aritmetik testle (gerçek dosyaya/tarayıcıya hiç
dokunmadan) iki formülün SAYISAL olarak birebir eşleştiğini doğrulamak,
ekran görüntüsü karşılaştırmaktan çok daha hızlı ve kesin sonuç verdi.

Aynı commit'te iki yeni özellik de eklendi: Nesneler modunda köşe
tutamağından sürükleyerek ORANLI büyütme/küçültme (Engeller modundaki
kutu/daire ile AYNI etkileşim deseni - kullanıcı "kenarından tutup scale
etmeme izin ver" dedi, var olan deseni yeniden kullanmak yeni bir şey
icat etmekten hızlıydı) ve `Entity.layer` (varsayılan 0, sıfırdan
farklıysa y'den ÖNCE bu sıralanıyor - pozitif her zaman önde, negatif
her zaman arkada, y sadece aynı katmandakiler arasında tie-break).

### v10.8: Nesneler modunda İKİNCİ gizli hata - yarım karo konum kayması
v10.7'nin 2x boyut hatasını düzelttikten hemen sonra kullanıcı "eklediğim
nesne koyduğum yerde durmuyor, yakın ama başka yerde" dedi - AYNI ailede
ama FARKLI bir hataydı. Kök neden: `at()` verilen x,y'ye otomatik `+8`
(=yarım karo) merkezleme ekliyor (`x:e.x*16+8`) - GET endpoint'i bunu
`(e.x-8)/16` ile telafi ediyordu ama SAVE tarafı HİÇ telafi etmiyordu
(`x:o.x` düz yazıyordu), yani editörün ekranda gösterdiği/tıklanan konum
ile `at()`'in gerçekte çizdiği konum arasında SABİT yarım karo fark
vardı. Düzeltme: GET artık `e.x/16` (çıkarma YOK - editörün o.x'i
doğrudan "world-px/16" = ekranda `px=o.x*tp` ile ÇİZİLEN değer), SAVE
`o.x-0.5` yazıyor (at()'in +8'ini ÖNCEDEN telafi ediyor). İkisi
BİRLİKTE tutarlı olmalı - biri değişince öbürü de değişmeli.

**Genel ders (v10.7 ile birlikte oku):** Bir "editör önizlemesi ↔ gerçek
motor" ikilisinde onlarca farklı yerde AYNI temel yanlışlık (burada:
"motor otomatik bir dönüşüm uyguluyor, editör bunu hesaba katmıyor")
FARKLI belirtilerle (önce boyut, sonra konum) art arda çıkabilir - biri
düzelince "artık güvenilir" diye varsaymak yerine, motorun O YOLDAKİ
TÜM otomatik dönüşümlerini (burada: hem `im.width/R` hem `x*16+8`) tek
tek editörün karşılığıyla eşleştirip doğrulamak, aynı sınıf hatanın
ikinci kez sürpriz olarak çıkmasını önlerdi.

### v10.9: ÜÇÜNCÜ hata aynı ailede - v10.8 bile kaçırmıştı
Kullanıcı v10.8'den SONRA "yine olmadı, benim koyduğumdan daha aşağıda
geliyor" dedi - x doğruydu ama y hâlâ kaymıştı. Kaçırdığım şey: `at()`nin
+8'i tüm entity'ler için ortakken, `engine.ts`'teki `sprite()` decor
(non-actor) sprite'ları özel olarak `top=-h*scale+6` ile çiziyor - yani
decor'un alt kenarı dünya-y'den AYRICA 6 birim (0.375 karo) aşağıda.
Bu X'te YOK (yatay ortalamada böyle bir sabit yok) - sadece Y'ye, ve
sadece decor tipine özel. Düzeltme: GET `(e.y+6)/16`, SAVE `o.y-0.875`
(=0.5+6/16); x aynı kaldı (`-0.5`). **Ders (v10.7/v10.8 notlarını
pekiştiriyor):** "motorun bu yoldaki TÜM otomatik dönüşümlerini tek tek
eşleştir" tavsiyesi bir öncekinde YARIM yapılmıştı - `at()`'in +8'ini
buldum ama `sprite()`'ın decor'a özel +6'sını atlamıştım, çünkü o
render KODUNDA (world.ts'te değil, çizim mantığında) gizliydi. Bu tür
bir hatayı ararken sadece VERİ dönüşümlerine (world.ts, at()) değil,
o veriyi TÜKETEN her yerin (render, collision, vb.) render/hesap
formüllerine de bakmak gerekiyor - hepsini TARAYIP her birini editörün
karşılığıyla eşleştirmeden "artık düzeldi" denemez.

Aynı commit'te: Nesneler modunda artık köşelerin yanı sıra 4 kenarın da
ortasından tutup oranlı büyütüp küçültülebiliyor (hangi tutamaç olursa
olsun aynı davranış), ve tuval üzerinde fare tekerleğiyle yakınlaştırma/
uzaklaştırma eklendi (+/- düğmeleriyle aynı `scale` değişkeni).

---

### v11.0: kalan "hafif" kayma - muhtemelen kod hatası değil
v10.9'dan SONRA bile kullanıcı "hâlâ hafif bir dikey oynama var" dedi.
Üst kenar/alt kenar/genişlik/yatay merkez hizasını BİR KEZ DAHA (dördüncü
kez) uçtan uca simgesel olarak doğruladım - hepsi tam eşleşiyor, YENİ bir
formül hatası bulamadım. İki muhtemel kalan kaynak: (1) `fmt()` 2
ondalığa yuvarlıyordu, kullanıcı defalarca yükle-düzenle-kaydet
döngüsünden geçtikçe bu küçük yuvarlama birikebilirdi - 4 ondalığa
çıkarıldı (kolay, güvenli, muhtemel katkıyı azaltır). (2) Oyunun kamerası
HER KAREDE world-px'i `Math.round()` ile tam sayıya yuvarlıyor
(`engine.ts` `render()`) - bu TÜM sahneyi (arka plan+üst üste binen
nesneler) birlikte kaydırdığı için nesnelerin BİRBİRİNE göre hizasını
bozmaz, ama editörün kamerasız önizlemesiyle oyun arasında ~1 piksellik
DOĞAL bir fark yaratabilir - bu veri formülüyle düzeltilecek bir şey
değil, kasıtlı piksel-hizalı çizimin bir sonucu.

**Ders:** dört tur düzeltmeden sonra hâlâ "biraz" bir şikayet geliyorsa
ve simgesel doğrulama temiz çıkıyorsa, muhtemelen artık KOD HATASI değil
KESİN OLAMAYACAK bir şeyle (piksel yuvarlama, kamera hareketi gibi
render-zamanı davranışlar) uğraşıyorsundur - bunu kullanıcıya AÇIKÇA
söylemek (ve nedenini açıklamak), sonsuza kadar "başka bir formül hatası
daha olmalı" diye aramaya devam etmekten daha dürüst ve daha faydalı.

**DÜZELTME (v11.1) - yukarıdaki ders EKSİKTİ:** kullanıcı "o zaman tespit
et ve ona göre uyarla" deyince tekrar bakıldı - "kesin olamaz" dediğim şey
(sprite() içindeki `Math.round(x,y)`) aslında SADECE hareket eden
aktörler için gerekliydi (piksel titremesini önlemek), SABİT decor için
hiçbir amaca hizmet etmiyordu, sadece zararı vardı. Yuvarlamayı decor'da
kaldırınca fark TAM SIFIRA indi. **Asıl ders:** "bu bir render-zamanı
davranışı, düzeltilemez" demeden ÖNCE, o davranışın GEREKÇESİNİ sorgula -
"neden var, kimin için var" diye bak; bir kısıtlama başka bir amaç için
(aktör hareketi) konmuşken, hiç ilgisi olmayan bir başka kullanım (sabit
decor) için de körü körüne uygulanıyor olabilir. "Teorik olarak
imkansız" ile "bu kod tabanında şu an öyle çünkü kimse ayırmamış"
birbirinden çok farklı - ikinciyi ilkiyle karıştırmak erken pes etmek
oluyor.

### v11.2: H ile el (pan) aracı
Basit özellik ama bir tuzağı vardı: `document.activeElement===document.body`
gibi "hiçbir şey odakli degilken" kontrolü, kullanıcı herhangi bir DÜĞMEYE
tıkladıktan sonra YANLIŞ ÇIKAR (düğmeler tıklanınca odağı üstlerinde
tutar, body'ye dönmez) - Playwright testinde "+ zoom düğmesine bas, sonra
H'ye bas" sırasıyla YAKALANDI (ilk H basışı sessizce yok sayıldı).
Düzeltme: `!['INPUT','TEXTAREA'].includes(activeElement.tagName)` - yani
SADECE gerçek metin girişini engelle, düğme odağını değil. **Ders:**
"body'ye odaklanmışken" kısayol guard'ı YANLIŞ soru soruyor; asıl soru
"kullanıcı şu an METİN mi yazıyor" - tagName'e bak, activeElement'in
body olup olmadığına değil.

### v11.4: "olmayan engel" - decor'un sabit yarıçaplı görünmez çarpışması eski konumda kalmış
Kullanıcı "karakter bazen olmayan engellere takılıyor" dedi. Kök neden:
`walkable()`'ın SONUNDAKI `entities.some()` kontrolü - decor tipi HER
entity'nin (görsel boyutundan/varlığından TAMAMEN BAĞIMSIZ) sabit 10
birim yarıçaplı bir çarpışma dairesi var (chest 6 birim). Zanaat
masasının konumu (x:22,y:10) muhtemelen background GÖRSELİ sonradan
revize edilirken güncellenmemiş - gerçek boyalı masa daha yukarıdaydı
(y~7.5), eski konum masanın birkaç karo ALTINDAKİ BOŞ ZEMİNDE görünmez
bir engel yaratıyordu. haven.png'nin piksellerini ölçüp gerçek masa
merkezine taşıdım (bkz. python ile crop+grid overlay yöntemi, bu
oturumda tekrar tekrar işe yaradı). **Genel ders:** `type:'decor'`/
`'chest'` gibi SABİT-YARIÇAPLI (blockers dizisine değil, entity x,y'sine
bağlı) çarpışmalar, arka plan görseli GÜNCELLENDİĞİNDE elle senkronize
tutulmalı - otomatik bir bağlantı yok, biri diğerini takip etmiyor.
Böyle bir şikayet gelince önce `world.ts`'teki TÜM `type:'decor'` ve
`type:'chest'` çağrılarının x,y'sini background'daki gerçek görselle
karşılaştır.

**Ayrıca:** aynı oturumda "yuvarlak engeller çalışmıyor" şikayeti geldi -
hem izole testte hem gerçek oyunda mevcut VE yeni oluşturulan elips
blocker'ları doğru çarpıştığı için bir kod hatası BULUNAMADI. İlk test
denemem yanlıştı (dar bir tünel koridorunun TAM genişliğinde bir elips
seçmiştim, "dışında ama hâlâ zeminde" bir nokta kalmamıştı) - kendi test
kurulumumun hatasıydı, koddaki değil. Ders: "çalışmıyor" şikayeti
gelince önce GERÇEKTEN çalışmadığını KENDİN doğrula (izole test +
gerçek oyunda), sonucu asla varsayma - burada iki ayrı test ("yuvarlak
engel" ve "olmayan engel") aynı anda geldi ama TAMAMEN FARKLI iki
mekanizmaydı (elips blocker vs decor'un sabit-yarıçaplı collision'ı),
ikisini birbirine karıştırıp tek bir açıklamayla kapatmaya çalışmak
yanlış sonuca götürürdü.

### v11.5: Ctrl+Z, P kısayolu, Silgi modu
Genel geri-al deseni: tek bir ortak `gecmis` yığını, her mutasyondan
HEMEN ÖNCE o modun (grid/boxes/objeler) derin kopyasını atıyor - hangi
modda olursa olsun Ctrl+Z o moda geçip son kopyayı geri yüklüyor. Silgi
poligonlarda NOKTA BAZLI siliyor (şekli küçültür, yok etmez), dikdörtgen/
daire'de TÜM şekli siliyor (kısmi silme için gerçek bir CSG/boolean-
subtract motoru gerekirdi, kapsam dışı bırakıldı - kullanıcıya açıkça
söylendi). Playwright testinde İLK deneme "çalışmıyor" gibi göründü ama
sebep tunel zone'unun 63 karo boyunda olması ve tıklama koordinatlarının
(y=20,23) görünür viewport'un (950px) ÇOK dışına düşmesiydi (canvas
4032px boyundaydı) - küçük/üstteki koordinatlarla tekrar denenince hepsi
çalıştı. **Ders:** Playwright'ta byte-perfect tıklama koordinatı
hesaplasan bile, hedef `boundingBox()` viewport'un dışındaysa tıklama
sessizce hiçbir şey yapmaz - önce `box.height`/`box.width`'i viewport
boyutuyla kıyaslamak, yanlış-negatif "bug"lardan çok daha hızlı kurtarır.

### v11.6: overlay decor'ların yüklenme yarışı ("bir gözüküyor bir kayboluyor")
Şikayet: haven'daki perde overlay nesnesi ("ed_props") bazen gözükmüyor,
sonra kendiliğinden geliyordu - "farklı yönlerde açışlarımda gitmişti"
(farklı sayfa/oturum açılışlarında kayboluyordu). Önce yanlış yollar
denendi ve TEK TEK elendi: (1) gezinen NPC'lerin (Mirna/Alf/Undur) y-sort
ile üstünü kapatması - matematiksel olarak imkansız çıktı, en yakın NPC
bile nesneden ~67 birim uzakta, gezinme yarıçapı max ~32; (2) haven'ın
karanlık/meşale-titreme sistemi - `KARANLIK.haven=0`, o sistem zaten
kapalı; (3) y-sort'un titreşmesi - kontrollü Playwright testinde sabit
hızda geçişte TEK VE TEMİZ bir flip oldu, çırpınma yok. Gerçek sebep çok
daha basitti: `overlayNesneleriYukle()` (harita-editor'ün eklediği
overlay decor'ların resmini yükleyen fonksiyon) yalnızca zone değişince
çağrılıyordu VE ana `loadAssets()`'in `Promise.allSettled(jobs)` -
`this.ready` kapısına HİÇ dahil değildi. Yani oyun "ready" olup oyuncuya
"Yolculuğa başla" düğmesini açtığında bu overlay resmi henüz gelmemiş
olabiliyordu - ilk birkaç karede sprite() sessizce çizmiyordu
(`naturalWidth` kontrolü), resim gelince aniden beliriyordu. Sayfa her
taze açıldığında (veya asset henüz cache'lenmediğinde) bu yarış tekrar
oluşuyordu. **Fix:** `loadAssets()` artık TÜM bölgelerin (`makeWorld(z)`
ile, flagsiz) `type:'decor'&&overlay` olan asset'lerini tarayıp ana
`jobs` dizisine (optional:true olarak, oyunu kilitlememesi için) ekliyor
- böylece "ready" olduğunda bu overlay resimleri de kesinlikle yüklenmiş
oluyor. Playwright ile doğrulandı: `page.route` ile bu resmin ağ
isteğini yapay olarak 1500ms geciktirip, "ready" flag'inin GERÇEKTEN o
1500ms'den SONRA döndüğü ölçüldü (önce hatalı bir ölçüm metodolojisiyle
"hiç beklemiyor" gibi göründü - `waitUntil:'networkidle'` zaten geciken
isteğin bitmesini bekliyordu, ölçüm saati ondan SONRA başlatılmıştı;
`domcontentloaded` + `Date.now()` damgalı network event logları ile
düzeltildi). **Genel ders:** "editor↔engine" ile "ilk yükleme↔render"
arasında da aynı sınıf hata olabilir - bir asset'in NE ZAMAN gerekeceği
ile NE ZAMAN yüklenmeye başladığı arasında bir "ready" kapısı yoksa,
her taze sayfa açılışı gizli bir yarış durumu yaratır; bunu görmek için
durağan/normal-hızda test yeterli değil, ağ gecikmesini YAPAY olarak
simüle etmek gerekti.

### v11.7: Nesne kataloğu (her mekanda) + döndürme (aci)
İki istek birden: (1) "harita editöre eklediğim nesneler kaydedilsin her
mape istediğimde ekleyebileyim" - önceden yüklenen PNG'ler yalnızca O ANKİ
zone oturumunun paletine giriyordu (`loadNesneler()` yalnız `liveNesneler`,
yani AÇIK OLAN zone'un `world.entities`'inden okuyordu); dosya diskte
(`public/assets/nesne/ed_*.png`) kalıcı duruyordu ama BAŞKA bir zone
açılınca palet boşalıyor, aynı görseli tekrar yüklemek gerekiyordu. Fix:
yeni `GET /__harita/nesne-katalog` endpoint'i (vite.config.ts) `NESNE_DIR`
içindeki TÜM `ed_*.png` dosyalarını listeler (yalnızca bu aracın eklediği
`ed_` önekliler - `masa.png`/`sandik.png` gibi oyunun kendi elle-yazılmış
decor sprite'larıyla karışmasın diye); editör `loadNesneler()` sonunda
`nesneKatalogYukle()` çağırıp bunları palete ekliyor (zone'a özel liste
BOŞ olsa bile artık erken `return` YOK - önceki kod `!liveNesneler.length`
ise direkt dönüyordu, katalog hiç çağrılmıyordu, bu da düzeltildi).

(2) Döndürme: `Entity.aci?:number` (RADYAN, world.ts) eklendi, `engine.ts`
decor çizim çağrısına `e.aci??0` onuncu argüman (`donder`) olarak geçiyor
- `sprite()`'ın rotate mekanizması zaten enemy'ler için vardı, decor hiç
kullanmıyordu. **Önemli düzeltme:** `sprite()`'daki rotate pivotu (`my`)
decor'un `top=-h*scale+6` formülündeki o ÖZEL +6'yı hesaba katmıyordu -
yani pivot decor'un gerçek dikey merkezinden 6 dünya-birimi (0.375 karo)
KAYIKTI. Bu daha önce hiç fark edilmemişti çünkü `donder` decor için hiç
kullanılmıyordu; döndürmeyi ekleyince editör önizlemesiyle (gerçek merkez
etrafında döndürüyor) motor arasında BİR SONRAKİ "milimetrik kayma" bug'ı
olacaktı - v11.0-11.1'deki AYNI ders tekrar geçerli oldu: yeni bir
özellik eskiden test edilmemiş bir kod yolunu (decor+rotate kombinasyonu)
açtığında, "zaten var olan bir mekanizmayı kullanıyorum, çalışmalı"
varsayımı yeterli değil - uçtan uca (editör önizleme + gerçek oyun ekran
görüntüsü, `__oyun` kancasıyla) doğrulamak gerekti. Düzeltme: decor için
`my`'a da `+6` eklendi (`my=(-anchor+h/2)*scale+(actor?0:6)`), böylece
pivot artık gerçek merkezde ve editör=motor eşleşiyor.

Editör tarafında: `objeTutamaclari()`'ye 9. bir `rot` tutamacı (üst kenarın
biraz yukarısında, çizgiyle bağlı, yeşil) eklendi; döndürülmüş bir nesnede
hit-test (`objeAt`/`objeHandleAt`) fare noktasını nesnenin KENDİ (dönmemiş)
yerel uzayına çeviren `objeYerelNokta()` ile yapılıyor (aci=0 iken no-op,
mevcut davranış tamamen korunur). `draw()`'daki tutamaç/kutu çizimi de
`objeKutusu`/`objeTutamaclari`'nin AYNI çıktısını kullanıyor (hit-test ile
render'ın iki ayrı formülü tekrarlamaması için) - `ctx.rotate` zaten
uygulandığından bu yerel-uzay noktalar otomatik doğru yerde çiziliyor.

**Test yöntemi notu:** İlk döndürme testinde nesne HİÇ görünmüyordu gibi
göründü - meğer test nesnesini varsayılan ölçek (s=1) ile yerleştirmişim,
oysa `ed_props.png` koca bir perde SAHNESİ (1438×1093px, ~45 karo genişliğinde)
- s=1'de kutunun neredeyse tamamı görünür alanın dışına taşıyordu, ekranda
görünen o devasa görselin şeffaf/boş bir köşesiydi. Gerçek bug değildi,
kendi test kurulumum yanlıştı (bkz. v10.6'daki "2x nesne ölçeği" dersiyle
akraba: bir görsel dosyasının GERÇEK boyutunu kontrol etmeden ölçek
varsayımı yapmak yanıltıcı sonuç veriyor).

### v11.8: Nesne-tabanlı zanaat masası + "kaydetmeden çıkınca kayboluyor" güvencesi
Kullanıcı Nesneler modunda haven'ın köşesine bir "alet tezgahı" görseli
yükleyip yerleştirdi, "eye basınca crafting sayfası açılsın" istedi. İlk
bakışta world.ts'te BEKLENEN nesne YOKTU - onun yerine 3 tane ESKİ (düz
masa+kumaş görselli), 2'si bozuk/devasa ölçekte (727.95, 67.182 - muhtemelen
resize tutamacını anchor'a çok yakın bir noktadan tutup sürüklemenin
`dist/startDist` oranını patlatması) kayıtlı deneme buldum; kullanıcının
asıl istediği (alet tezgahı) görseli HİÇ world.ts'e yazılmamıştı - kullanıcı
"yine mi sorun oldu" diye sordu. Gerçek sebep bir kod hatası DEĞİLDİ: obje
YERLEŞTİRMEK tek başına world.ts'e yazmıyor, ayrıca "💾 kaydet"e basmak
gerekiyor - muhtemelen yerleştirdikten sonra kaydetmeden sayfayı yeniledi
(ör. yeni catalog/rotate özelliklerini denemek için), bu da BELLEKTEKİ
(henüz kaydedilmemiş) hali silip diskteki eski haliyle değiştirdi. Kullanıcı
"koyduğum nesneler yine silinebiliyor" diye ekledi - "yine" önemli, bu
DAHA ÖNCE de yaşanmış bir tuzak. Playwright ile UÇTAN UCA doğrulandı:
yerleştir → kaydet butonuna bas → world.ts'e gerçekten yazıldığını gör -
save mekanizmasının KENDİSİ sağlamdı, sorun tamamen "unutulan kaydet
adımı" idi.

**İki kalıcı düzeltme:**
1. `harita-editor.html`'e `kaydedilmemis` bayrağı + `beforeunload` uyarısı
   eklendi - `anlikGoruntuAl()` (zaten her mutasyondan önce çağrılıyordu,
   undo için) artık bu bayrağı da `true` yapıyor; üç kaydet butonunun HER
   BİRİ başarılı kayıttan sonra `false`'a çeviriyor; taze bir mekân
   yüklemesi de `false`'a resetliyor (henüz kaydedilmemiş bir şey yok).
   Böylece kaydetmeden sayfayı kapatan/yenileyen kullanıcı artık tarayıcı
   uyarısı görüyor - Playwright'ta `page.reload()` sırasında gerçekten
   bir `beforeunload` dialogu tetiklendiği doğrulandı.
2. `engine.ts`'teki zanaat-masası tespiti (`interact()` VE `nearest()`)
   `e.asset?.includes('Table')` (büyük T) yerine
   `e.asset?.toLowerCase().includes('table')` oldu - vite.config.ts'teki
   `nesne-yukle` uç noktası yüklenen HER dosya adını otomatik küçük harfe
   çeviriyor, yani Nesneler modundan eklenen bir görsel asla büyük 'T'
   içeremezdi, eski kontrol bu yüzden editör-yerleştirmeli masalar için
   YAPISAL OLARAK tetiklenemezdi (yalnız elle yazılmış 'Tables/2.png' gibi
   asset'leri yakalıyordu). Küçük harfe çevrilince hem eskisi hem yenisi
   çalışıyor.

Bozuk/gereksiz 3 eski masa denemesi world.ts'ten temizlendi, tek asset
(`ed_alet_tezgahi_table.png` - ismi kasıtlı küçük harf "table" içeriyor)
köşeye (7.6962,23.5762 karo) `s:0.083,layer:1` ile yerleştirildi, E'ye
basınca "Zanaat Masası" panelinin açıldığı canlı oyun ekran görüntüsüyle
doğrulandı. Eski düz masa görseli silinmedi, sadece "table" gecmeyen
nötr bir isme (`ed_masa_duz_eski.png`) taşındı ki ileride tekrar
kullanılırsa yanlışlıkla crafting tetiklemesin.

### v11.9: Nesne yerleştirme varsayılan ölçeği 0.1
Nesneler modunda paletten tıklayıp yeni bir obje yerleştirirken ölçek hep
`s:1` ile başlıyordu - yüklenen görseller genelde koca sahne sayfaları
(1400×1100px gibi) olduğundan, bu da haritayı kaplayan "dev" bir nesneyle
sonuçlanıyordu, kullanıcı her seferinde elle küçültmek zorunda kalıyordu
(bkz. v11.7/v11.8'deki "editorde küçük ama oyunda devasa" ve "727.95 ölçek"
örnekleri - hep AYNI kök sıkıntı: bu görseller küçük ikonlar değil, büyük
kompozisyonlar). Kullanıcı doğrudan "0.1 scale ile eklensinler" dedi -
`harita-editor.html`'deki yerleştirme satırı (`cv` mousedown, aktifAsset
dalı) `s:1` yerine `s:0.1` ile başlıyor artık. Hâlâ küçük/büyük geliyorsa
tutamaçlardan ayarlanabilir, sadece başlangıç noktası değişti.

### v12.0: Ateşin sadece alt kısmı yaksın
"Ateşin üst kısmı yakmasın sadece alt kısmı yaksın" - eski `atesteMi()` ve
ana yanma döngüsü (update()'teki fireBurnCooldown bloğu) `e.x,e.y` merkezli
TAM SİMETRİK bir daire kullanıyordu (`Math.hypot(...)＜ATES_YARICAP`). Alev
sprite'ı yukarı doğru uzun çizildiği için (decor anchor'ı `top=-h*scale+6`,
bkz. v11.7'nin rotate-pivot notu) bu dairenin üst yarısı alevin gerçek
tabanından çok, görsel TEPESİNE (duman/uç kısmına) kadar yanıyordu. Yeni
paylaşılan `atesTemas(e,x,y)` yardımcı fonksiyonu daireyi YUKARI doğru
kırpıyor: hedef `e.y`'den (taban) `ustPay=4*ölçek` biriminden fazla
yukarıdaysa hiç yanmıyor; yanlarda ve altta eski yarıçap aynen geçerli.
`atesteMi()` (NPC hedef seçimi de kullanıyor) ve ana hasar döngüsü
(oyuncu+mob+Rauf, 3 ayrı `Math.hypot` çağrısı) hepsi bu tek fonksiyona
yönlendirildi - tekrar formül yazmak yerine. Playwright'ta üç nokta
(taban-üstü 12 birim yukarı, tam taban, taban-altı 10 birim) test edildi;
İLK denemede mob'ların da hasar verdiği fark edilmeden yanlış sonuç
çıkıyordu ("üst" hâlâ yanıyor gibi göründü) - `g.mobs=[]` ile düşman
etkisi dışlanınca (ve `changeZone`'un verdiği 1.5sn dokunulmazlığın
GEÇMESİNİ bekleyince) doğru sonuç: üst yanmıyor, taban ve alt hâlâ yanıyor.

### v12.1: Uslu artık ışınlanmıyor, kapıdan gerçek zamanlı geçiyor
Uslu (Son Sığınak <-> Sarnıç Ağzı arası "gezen" NPC) eskiden `changeZone()`
içinde OYUNCU o iki bölge arasındaki kapıdan her geçtiğinde %50 ihtimalle
`flags.usluYer` anlık olarak çevriliyordu - görünmeden olduğu için tam bir
ışınlanma hissi veriyordu (kullanıcı: "bizim gibi gerçek zamanlı geçsin, biz
oda değiştirince ışınlanmasın"). Kaldırıldı. Yerine: NPC dolaşma döngüsünde
(update()'teki 'gez' Map'i) Uslu'ya özel bir "giden" hedefi eklendi - normal
rastgele gezinme sırasında her hedefe varışta küçük bir ihtimalle (%15)
rastgele bir nokta yerine KAPIYA (`Engine.USLU_KAPI[zone]` - haven/magara
arası geçiş kutusunun merkezi, world.ts'teki iki `gecis()` çağrısına karşılık
gelir) yürümeyi seçiyor; oraya GERÇEKTEN yürüyerek varınca (`g.giden` ve
`uz<1.5`) `usluYer` çevriliyor ve o an `this.world.entities`'ten çıkarılıyor.
Oyuncu o sırada aynı bölgedeyse onu kapıya doğru yürürken GÖRÜYOR; değilse
zaten (herhangi bir NPC gibi) nerede olduğunu bilmiyordu - bu kısım
değişmedi, sadece "oyuncu izlerken görünmeden kaybolma" ortadan kalktı.
Playwright'ta `gez.set('uslu',{...giden:true,tx:kapı,ty:kapı})` ile zorlanıp
birkaç saniyede konumun KADEME KADEME kapıya yaklaştığı, sadece vardığında
kaybolup `usluYer`in çevrildiği doğrulandı (önce anlık teleport mu yoksa
gerçek yürüyüş mü olduğunu ayırt etmek için ARA örnekler alındı, tek bir
"öncesi/sonrası" karşılaştırması yetmezdi).

### v12.2: İki sandık görseli Nesneler paletine eklendi
Kullanıcı iki PNG (açık/kapalı sandık) verdi, arka planındaki düz gri
(~rgb 216,215,210) zemin PIL ile (numpy YOK, `ImageChops.difference` +
`point()` LUT ile yumuşak eşik) saydamlaştırıldı, içeriğe göre kırpıldı,
`public/assets/nesne/ed_sandik_acik.png` / `ed_sandik_kapali.png` olarak
kaydedildi. **Kod değişikliği GEREKMEDİ** - v11.7'de eklenen nesne-katalog
uç noktası (`GET /__harita/nesne-katalog`, `ed_*.png` dosyalarını tarar)
sayesinde bu iki dosya editöre otomatik ekli çıktı, canlı editörde
palette'te göründüğü doğrulandı. **Not:** kullanıcı görselleri doğrudan
sohbete yapıştırdı ama bu ortamda yapıştırılan görselleri diske YAZAN bir
araç yok - diskte de bulunamadı (aranan tüm olası yollar: scratchpad,
/tmp, VSCode depolama). Kullanıcıdan dosyaları Masaüstü'ndeki bir klasöre
kaydedip yolunu söylemesini istemek gerekti (`~/Desktop/props/`) - resim
ekleme isteklerinde ilk BUNU sormak, disk taraması yapmadan önce zaman
kazandırır.

### v12.3: Oyundaki gerçek sandık görseli yenilendi
"Mapte duran mevcut sandıkla bu sandığı değiştir, öbür sandık ta nesneler
de kayıtlı kalsın" - oyundaki TÜM `type:'chest'` varlıkları (haven'daki
hediye sandığı, tünel/sarnıç sandıkları, hepsi) TEK bir paylaşılan sprite
sheet kullanıyor: `public/assets/nesne/sandik.png`, 96×48px, 2 kare
(kapalı|açık, her biri 48×48 - `this.sprite('chest',...,opened?1:0,24,24,...)`
dünya-birimi 24 * R=2 = 48 native px). v12.2'de eklenen iki AYRI Nesneler
görseli (`ed_sandik_kapali.png`, `ed_sandik_acik.png`) tam bu iki kareye
karşılık geldiği için ikisi 48×48'e küçültülüp yan yana yeni bir
`sandik.png` olarak birleştirildi - kod değişikliği gerekmedi, sadece
asset. **Önemli:** v12.2'de Nesneler paletine eklenen o iki TEKİL dosya
(`ed_sandik_kapali.png`/`ed_sandik_acik.png`) BUNDAN AYRI, dokunulmadı -
hâlâ palette'te duruyor, istenirse dekoratif olarak da yerleştirilebilir;
sadece OYUNUN GERÇEK sandık sprite'ı (fonksiyonel, tüm `chest()` çağrıları)
bu ikisinden birleştirilen yeni görsele geçti. Playwright ile hem kapalı
hem açık hali gerçek oyunda (haven'ın hediye sandığı) ekran görüntüsüyle
doğrulandı.

### v12.4: Sandık görseli geri alındı
Kullanıcı v12.3'teki yeni sandık görselini beğenmedi ("güzel olmadı, eski
sandık geri gelsin") - `public/assets/nesne/sandik.png` v12.3'ten HEMEN
ÖNCEKİ hale (`git checkout dcfbe99 --`, v7.6'daki ton düzeltmesinden sonraki
sürüm) geri döndürüldü. Nesneler paletindeki `ed_sandik_acik`/
`ed_sandik_kapali` dosyalarına dokunulmadı, hâlâ orada duruyorlar - sadece
oyunun gerçek/fonksiyonel sandık görseli eski haline döndü.

### v12.5: Oyuncu icin ucurumdan dusme animasyonu (Tuhn'dan ONCE, ilk deneme)
Kullanıcı "uçurumdan düşme animasyonu yapmak istiyorum Tuhn ve ana karakter
için önce ana karakter üzerinde deneyelim" dedi. Mevcut kod zaten `dusus`
sayacı ve `dusmeyeBasla()/dusmeBitti()` akışını taşıyordu (bkz.
`bolgeKontrol()` - `ucurumlar` karosuna basınca tetikleniyor) ama render()
içinde tam bu satırda ÇOK ÇARPICI bir iz vardı: `// Dusus: sprite kucule
kucule asagi kayiyor, boslugun icine iniyormus gibi.` YORUMU yazılmış ama
hemen altında `// Dusus: kucuIme YOK, karakter bir anda kayboluyor.` -
yani animasyon TASARLANMIŞ ama hiç YAZILMAMIŞTI, `if(!dusuyor)sprite(...)`
ile düşerken sprite'ın kendisi tamamen ATLANIYORDU (bir anda kayboluyordu).

Eklenen: `dusuyor` iken karakter KÜÇÜLEREK (ölçek ×(1-p·0.82)), hafifçe
AŞAĞI KAYARAK (`y+p·14`) ve SOLARAK (alpha ×(1-p·1.15)) çiziliyor - p,
`1-dusus/Engine.DUSUS` (0=düşüşün başı, 1=kaybolduğu an). Düşerken zemin
gölgesi de kaldırıldı (`golgeCiz` artık `!dusuyor` şartlı - boşlukta
basacak zemin yok). `dusmeyeBasla()`'ya küçük bir toz parçacık patlaması
(`burst`) eklendi.

**Önemli bulgu:** `Engine.DUSUS` (düşüş süresi) eskiden 0.5sn'ydi - bu kadar
kısa bir sürede HERHANGİ bir animasyon göze çarpıklık/"aniden oldu" gibi
görünüyor, eğri şeklinden bağımsız olarak. 1.1sn'ye çıkarıldı - animasyonun
gerçekten okunabilmesi için gerekliydi, salt "animasyon ekle" yetmiyordu.

**Test metodolojisi notu (önemli, tekrar karşılaşılabilir):** Playwright'ta
`page.screenshot()` çağrıları ARASINA `waitForTimeout` koyarak zamanlama
ölçmek YANILTICI - her screenshot bir compositing/repaint zorluyor gibi
görünüyor ve bu da beklenenden ÇOK DAHA FAZLA `requestAnimationFrame`
tetiklenmesine (yani gerçek zamandan hızlı bir simülasyon ilerlemesine)
yol açıyor (0.5sn'lik bir sayaç ~150ms'de tükenmiş gibi ölçüldü). Saf
`page.evaluate()` ile (screenshot ARAYA GİRMEDEN) periyodik durum okuma
gerçek zamanla neredeyse birebir örtüştü (1.1sn sayaç gerçekten ~1.1sn'de
bitti). Zamanlama doğrulaması için screenshot'suz polling, GÖRSEL
doğrulama için (zamanlamayı önemsemeden, yalnızca ilerlemenin düzgün
göründüğünü kontrol için) yapay uzatılmış bir sayaçla (`g.dusus=3`) ayrı
bir tur gerekti - ikisini TEK bir testte karıştırmak yanlış teşhise
(“animasyon aşırı hızlı/bozuk” sanılmasına) yol açıyordu.

**Sıradaki adım (kullanıcı onayı bekleniyor):** Tuhn için AYNI görsel
yaklaşım uygulanacak - Tuhn'un kendi uçurum sahnesi zaten var (bkz.
engine.ts'te "Tuhn: ikna edilemediyse ucuruma yurur ve atlar" yorumu),
ama bu oturumda DOKUNULMADI, kullanıcı önce oyuncu üzerinde görüp
onaylamak istedi.

### v12.6: Sarnıç (cistern) bölgesine özel müzik
Kullanıcı Masaüstü'nden bir ses dosyası verdi ("8bit c1625.wav", 31MB PCM),
"sarnıç bölümüne geçince oyunun müziği olarak bu çalsın" dedi. Önce ffmpeg
ile mp3'e (libmp3lame, ~3.5MB, orijinal 2dk45sn süre korunarak) sıkıştırıp
`public/assets/audio/sarnic.mp3` olarak kaydettim.

`lib/game/audio.ts` ÖNCEDEN tek bir kayıtlı müzik parçası (`PARCA`,
three-steps-beneath.mp3) varsayıyordu - `this.parca/basla/bitis` tekil
alanlardı, bölge yalnızca SENTEZLENMİŞ (fallback) müziğin nota kalıbını
etkiliyordu, gerçek dosya hiç bölgeye göre değişmiyordu. Bunu genelleştirdim:
- `parcalar:Record<yol,{buf,basla,bitis}>` - her parça dosya YOLUYLA
  anahtarlanıyor, `parcaYukle(yol)` artık parametrik.
- `ZONE_PARCA:Record<zone,yol>` - şimdilik yalnızca `cistern:SARNIC_PARCA`;
  yeni bir bölgeye özel müzik eklemek için tek satır yeterli.
- `aktifYol()` o an hangi dosyanın çalması gerektiğini döner.
- `setZone()` aktif yol DEĞİŞTİYSE `parcaGecisYap()` çağırır - o an
  planlanmış (uzun süreli, dakikalarca sürebilen) kaynakları HIZLICA
  (1.3sn) soldurup durdurur; yoksa eski parça kendi doğal çıkışına kadar
  (dakikalarca) çalmaya devam edip yeni parçayla üst üste binerdi.
- `calan` artık `{src,gain}` çiftleri tutuyor (öncesinde yalnız `src` -
  gain node'a dışarıdan erişim gerekiyordu, geçiş sırasında söndürmek için).

'cistern' (Unutulmuş Sarnıç) seçildi, ÇÜNKÜ 'magara' (Sarnıç AĞZI - girişi,
farklı bir bölge) da adında "Sarnıç" geçiyor ama kullanıcı muhtemelen asıl
sarnığı kastetti; emin olunmadığı NOT edildi, yanlışsa `ZONE_PARCA`'daki
anahtarı `magara` yapmak tek satırlık değişiklik. Playwright ile haven->
cistern->haven geçişinde `aktifYol()`'un doğru değiştiği ve `calan`
sayısının hep 1'de kaldığı (eski kaynak birikmiyor) doğrulandı.

### v12.7: Dusus animasyonu - ileri kayma + yere paralel yassilasma
v12.5'teki ilk denemeye kullanıcı geri bildirimi: "karakter biraz ileri
gitmeli, rotate olarak yere paralele yaklaşmalı." Üç değişiklik:
1. **İleri kayma**: `yonVektor()` (son bakılan yön) yönünde, `p²*22` ile
   İVMELİ (başta yavaş, sona doğru hızlanan) bir kayma - "düşmeden hemen
   önce bir adım daha atılmış gibi" hissi.
2. **Yere paralel yassılaşma**: Z-ekseninde döndürme (`donder`) DEĞİL -
   üstten bakışlı bir oyunda "yere paralel" olmak görsel olarak DİKEYDE
   YASSILAŞMAK demek (kameraya dik hale geliyor). `c.translate(px,py);
   c.scale(1,squash);c.translate(-px,-py);` ile sprite()'ın KENDİ
   translate'inden ÖNCE, aynı ayak-noktası (px,py) etrafında bir
   "scale-around-point" uygulanıyor (matris özdeşliği: T(a)·S·T(-a)·T(a)
   = T(a)·S - yani sprite()'a px,py'yi AYNEN vermek, dıştaki transformun
   o noktayı sabit tutmasıyla doğru sonucu veriyor, ekstra hesap
   gerekmedi). squash 1'den (dik) 0.1'e (neredeyse düz) iner.
3. Şekil/ölçek: hafif ek küçülme (`×(1-p·0.2)`) korunuyor ama asıl görsel
   etki artık yassılaşma; alfa solması aynı mantıkla kaldı.

Test: yapay uzatılmış `dusus`/`DUSUS` (v12.5'teki AYNI "screenshot arası
zamanlama güvenilmez" dersiyle - sadece GÖRSEL ilerlemeyi yakından
incelemek için, gerçek zamanlama zaten v12.5'te ayrıca doğrulanmıştı)
ile karakterin gerçekten yön vektöründe ilerlediği ve dikeyde
yassılaştığı (enine göre kısaldığı, sadece küçülmediği) ekran
görüntüleriyle doğrulandı.

---

### v12.8: Gerçek düşme animasyonu (PixelLab v3) - önce güney yönü
Kullanıcı v12.7'nin prosedürel efektini (yassılaşma+solma) "çok kötü" buldu,
PixelLab ile gerçek bir takla animasyonu istedi. Yöntem `v3_anim.py` ile aynı
(`/characters/animations`, `mode:'v3'`, `keep_first_frame`, seed 21) ama AYRI
bir script: `scripts/dusus_uret.py <yon...>` - düşüş silahtan bağımsız TEK
animasyon, taban karakterden (`gezgin/id.txt`, silahsız) üretilir, yalnızca
oyuncunun `characters/1` slotuna `<D|U|S>_Dusus.png` olarak kurulur.
**Ölçülen maliyet: 1 üretim/yön**, 9 kare döndü (frame_count 8 istendi,
ilk kare dönüş karesi). Kalan bakiye 1477.

**Kurulum ayrı script (`scripts/dusus_kur.py`):** `v3_kur.py`'nin ayak
çizgisi/kafa tepesi çapaları DİK figür için ölçülmüştü; takla atan gövdede
"en alt geniş satır" bir kare ayak bir kare kafa olur, figür zıplar. Düşüşte
dayanak **bbox merkezi** (hücre 80×80, merkez 40,44 - dik karakterin gövde
merkeziyle aynı hizada başlasın diye). Sadece `*_Dusus.png` yazılır, slotun
diğer sheet'lerine dokunulmaz (`v3_kur.kur` bütün aksiyonları yeniden işler,
istenmez); ton uyumu `aktor_uyum.isle(src,dst)` ile yalnızca bu dosyaya.

**Motor:** `loadAssets` `characters1<D|U|S>Dusus`'u istege bağlı yükler;
render()'ın `dusuyor` dalı sheet varsa kareyi ilerlemeye (p) bağlar
(`kare=floor(p*n)`), ileri kayma (`p²·22`, yonVektor) kalır, son çeyrekte
solar; sheet yoksa v12.7'nin prosedürel efekti YEDEK olarak duruyor (kuzey/
doğu henüz üretilmediyse oralarda bu devreye girer). Tarif: "stumbles forward
off the edge ... tumbles head over heels ... upright, then horizontal, then
upside down ... hands completely empty ... same size in every frame" - ilk
denemede tuttu, kuzey için `TARIF_ARKA` ("seen from behind ... away from the
camera", kılıç dersi) hazır ama HENÜZ BASILMADI - kullanıcı onayı bekleniyor
(2 üretim: north + east; batı motorda aynalanır). Tuhn için de aynı yol
(Tuhn kendi karakter id'sinden, `sabit` NPC; `engine.ts` "Tuhn ... ucuruma
yurur ve atlar" sahnesi) - onay sonrası.

---

### v12.9: Düşme animasyonu her yönde + Tuhn'un kendi düşüşü
Oyuncu için kuzey/doğu üretildi (2 üretim; batı motorda doğunun aynası -
`this.flip`), üç yön de oyunda doğrulandı. Kuzey `TARIF_ARKA` ("seen from
behind ... falls away from the camera") ilk denemede tuttu.

**Tuhn:** PixelLab karakteri `id_tuhn.txt` DEĞİL `id_kederli.txt` ("kederli
adam", bkz. `kederli_kur.py` -> `characters/6`). Tek yön yeterli: sahnede
(engine.ts "Tuhn: ikna edilemediyse ucuruma yurur ve atlar") hep (24,15)'e,
yani DOĞUYA yürüyor -> yalnız `S_Dusus.png` (1 üretim, 9 kare). NPC hücresi
64×64, bbox merkezi (32,36). `dusus_uret.py`/`dusus_kur.py` `--kim tuhn`
ile parametrik.

**Motor (Tuhn):** eskiden uçurum karosuna basınca ANINDA siliniyordu.
Şimdi `tuhnDusus` sayacı: kenara varınca (sheet yüklüyse) `Engine.DUSUS`
kadar takla animasyonu oynar (render NPC dalında `e.id==='tuhn'&&tuhnDusus>0`
-> `characters6SDusus`, kare=ilerleme, doğuya `p²·22` kayma, son çeyrekte
solma, gölge yok), bitince eski silme dalı (bildirim + `tuhnSayac` ses/yarasa
zinciri) aynen çalışır. `tuhnDususBitti` bayrağı animasyonun bir kez
başlayıp sonra silme dalına geçmesini sağlıyor; sheet yoksa eski anlık
kaybolma davranışı korunur. Playwright ile sahne uçtan uca doğrulandı
(yürü -> dal -> kaybol -> "Karanlık onu aldı" -> yarasalar).

Toplam maliyet bu tur: 4 üretim (oyuncu N+E 2, Tuhn E 1; güney v12.8'de 1).
Kalan bakiye ~1473.

---

### v13.0: "Finale yakın bir an ayakta görünüyor" - sayaç sıfırlanınca eski sprite
Kullanıcı: düşme animasyonunun sonuna doğru karakterler bir kare **ayakta**
beliriyordu. Tek kök sebep, iki yerde: **sayaç sıfırlandığı anda render o kareyi
"düşmüyor" sayıp NORMAL sprite'a dönüyordu.**

* **Oyuncu:** `update()` içinde `if(this.dusus>0){this.dusus-=dt;if(this.dusus<=0)
  this.dusmeBitti();}` - `dusmeBitti()` `dusus=0` yapıyor, dolayısıyla o kareden
  itibaren `dusuyor=false` → ayakta sprite. Ölüm paneli React state'i olduğu için
  birkaç kare sonra kapatıyor; arada karakter dimdik görünüyordu. Çözüm: sayaçtan
  AYRI, kalıcı bir `dustu` bayrağı (`dusmeBitti`'de true). `dusuyor=dusus>0||dustu`,
  `p=dustu?1:...`, `p>=1` ise çizim tamamen atlanır. `dustu`
  `changeZone()`/`setState()`/`dusmeyeBasla()`'da temizlenir - **respawn buradan
  geçiyor**, yoksa karakter kalıcı görünmez kalırdı (düzeltilen hatadan beteri;
  ayrıca test edildi).
* **Tuhn:** `if(this.tuhnDusus>0){this.tuhnDusus-=dt;}` ayrı bir dal olduğu için
  sayaç sıfırlandığı tikte entity HÂLÂ duruyordu ve render onu ayakta çiziyordu;
  silme ancak bir SONRAKİ tikte oluyordu. Çözüm azaltmayı koşulun içine almak:
  `if(this.tuhnDusus>0&&(this.tuhnDusus-=dt)>0){}else if(...)` → sayaç bittiği
  AYNI tikte silme dalına düşer.

**Test yöntemi (bu tür "tek kare" hatalarında doğru olan):** ekran görüntüsü
YANILTICI - ölüm paneli canvas'ı kapatıyor ve `page.screenshot()` çağrıları rAF'i
hızlandırıp zamanlamayı bozuyor (bkz. v12.5/v12.7 notları). Bunun yerine
`sprite()` prototip üzerinden sarmalanıp ÇİZİM ÇAĞRILARI kaydedildi: son
`*_Dusus` karesinden sonra oyuncu (`/^characters1(?!\d)/`) ve Tuhn
(`characters6*`) sheet'i **0 kez** çizilmiş; aynı aralıkta 1500+ başka sprite
çizilmiş, yani test kör değil, döngü gerçekten çalışıyordu.

---

### v13.1: Overlay decor'un GÖRÜNMEZ 10 birimlik çarpışma dairesi kaldırıldı
Kullanıcı perdenin önünde takılan karakterin ekran görüntüsünü gönderdi:
"karakter burada neden takılıyor". `walkable()` sonundaki
`if(e.type==='decor')return hypot(...)<10` **görselden bağımsız** sabit bir
daire - küçük bir perde de, koca bir tezgah da aynı 10 birimlik görünmez kayayı
taşıyor. Harita editörünün "Nesneler" modu SALT GÖRSEL katman koyuyor (çarpışma
için ayrı "Engeller" aracı var), dolayısıyla `overlay:true` decor artık bu
daireden muaf: `return !e.overlay&&hypot(...)<10`. Elle yazılan `decor()`
mobilyaları (table2 vb.) eski davranışı korur.

**Teşhis yöntemi (bu tür "görünmez engel" sorularında doğrudan buna git):**
`npx vite-node` ile `makeWorld`+`walkable` izole çağrılıp bölge ASCII harita
olarak basıldı; decor'ları çıkarılmış bir kopyayla karşılaştırınca hangi
noktanın ÇİZİLMİŞ engelden, hangisinin decor dairesinden kapandığı ayrıştı
(`.` serbest / `B` blocker / `D` decor). Perdede iki ayrı şey vardı: (1) karo
y 13.8 boyunca kullanıcının kendi çizdiği duvar çubuğu `[3.65,13.6,9.05,13.88]`
- KALDI, tasarım kararı; (2) perdenin çapasında ~10 birim taşan görünmez daire
- işte "takılma" hissi buydu, kaldırıldı. Tezgah ayrıca kontrol edildi: çizilmiş
engeller (y≈92-148) yerinde, yani muafiyet orada gerileme yaratmadı.

---

### v13.2: "Vazgeç"in pembesi + görev kutusundaki iç içe çerçeve
İki arayüz düzeltmesi, ikisi de parşömen blogunda:
* **Vazgeç**: zemini `#c4837c` (pastel kırmızı) idi - parşömen paletinde yamalı
  duruyordu. Artık diğer nötr düğmelerle AYNI reçete: `frame_in.png 8 **fill**`.
  Buradaki incelik: eski kural `fill`i BİLEREK atlamıştı (merkez arka plan
  renginden gelsin diye); `fill` eklenince ayrı bir zemin rengine gerek kalmıyor.
  Hover artık renkle değil çerçeve değiştirerek (`frame.png`).
* **Görev kutusu ("İlk ışık")**: iç içe İKİ çerçeve görünüyordu. Sebep: dosyanın
  ~278. satırındaki blok kutuyu yarı saydam yapmak için çerçeveyi bir `::before`
  katmanına taşımıştı (opacity yazıyı da soldurmasın diye); ama İLERİDEKİ
  parşömen bloğu elementin KENDİSİNE de `fill`li `frame_in` verdi. İkisi üst
  üste binince biri dış, biri iç çerçeve oluyordu. `::before` (ve yalnızca onun
  için duran `isolation:isolate`) kaldırıldı; zemin zaten `fill`den geliyor.
  **Ders:** bu dosyada aynı seçiciye iki ayrı yerde stil verilmiş olabiliyor -
  bir görünüm sorununda `grep -n "<seçici>" app/globals.css` ile TÜM kuralları
  listelemeden düzeltmeye başlama.

Doğrulama: Playwright ile `getComputedStyle` (::before `content:none`, Vazgeç
`background: rgba(0,0,0,0)`) + iki element ekran görüntüsü.

---

### v13.3: Test alanı → "Terk Edilmiş Koridor" (yeni tek parça sahne)
Kullanıcı Masaüstü'nden bir 2K sahne verip "bunu test alanının yerine koy" dedi.
`scripts/koridor_kur.py` eklendi; eski `test100_kur.py` SİLİNDİ (aynı dosyaya
3200×3200 cistern tekrarı yazıyordu, çalıştırılsa yeni sahneyi ezerdi).

**Ölçek - işin can alıcı kısmı.** Görsel 2752×1536; 32'ye tam bölündüğü için
"86×48 karo" diye kurdum ve oyunda taşlar devasa, karakter minicik çıktı.
Bölünebilirlik ölçek KANITI DEĞİL. Doğru dayanak karakterin kendisi: oyuncu
sprite'ı sahneye bindirilip (fıçı/sütunla kıyaslanarak) **43×24** olduğu
görüldü. Ama 43×24'te ham görsel 64 px/karo olurdu; not defterindeki "sprite
yoğunluğu arka planla aynı olmalı" kuralı gereği görsel tam 2× küçültülüp
(1376×768) 32 px/karo'ya çekildi. Yani: önce karakterle ölçeği bul, sonra
yoğunluğu 32 px/karo'ya getir.

**ZEMİN yalnızca odanın SİLUETİ** (siyah çerçeve dışı = dışarısı, flood fill ile
merkezden). Duvar/sütun/moloz çarpışması ÇIKARILMADI - iki yöntem denendi ve
ikisi de ayrışmadı: parlaklıkta taş duvar zeminle aynı bantta, R-B sıcaklığında
meşale sütunları da zemin kadar sıcak. Zaten kuralı biliyorduk: boyalı sahnede
çarpışma ELLE, Engeller aracıyla. Editöre `test100` preset'i eklendi.
**Sonuç: sütunların/molozun üstünde yürünüyor, kullanıcıya söylendi.**

**Sessiz no-op tuzağı:** ZEMİN'i regex'le değiştirirken kalıp tutmadı ve
`re.sub` hiçbir şey yapmadan geçti; dosyada 86×48'lik eski maske kaldı. h=24
olduğu için motor eski maskenin sol-üst çeyreğini kullanırdı - hata vermeden
yanlış oda. Yakalandı çünkü değişiklikten SONRA dizinin boyutu ölçüldü.
Üretilen kodu regex'le yamarken sonucu daima doğrula.

Zone id'si bilerek `test100` kaldı (kayıtlardaki `state.zone` kırılmasın);
görünen ad `ZONES`'ta güncellendi.

---

### v13.4: Koridorun kapı yönü düzeltildi
İlk kurulumda hem sığınağın çıkışı hem koridorun dönüş kutusu SOL uçtaydı:
batıya çıkıp koridorun yine batı ucunda beliriyordun, yani çıkış girdiğin
uçta duruyordu (kullanıcı: "kapı giriş çıkışı ters olmuş"). Coğrafya artık
tutarlı: sığınaktan BATIYA çık → koridorun DOĞU ucunda belir (36,14) →
geri dönmek için DOĞUYA yürü (kutu x 39..42, y 12..16). Yeni bir mekân
bağlarken kural: çıkış yönü ile varış ucu BİRBİRİNİN TERSİ olmalı.

---

### v13.5: Koridorda yerden çıkan iskelet kalabalığı (kind 11)
"Yerden çıkan iskeletler olsun, vurunca parçalansınlar, tekte ölsünler ama çok
kalabalık olsunlar." Koridora **42 gömülü iskelet** kondu.

**Gömülü olanlar mob DEĞİL.** `resetMobs()` kind 11'i ayrı bir `gomulu:EnemySpec[]`
listesine koyuyor; oyuncu `ISKELET_UYANMA`(118) mesafesine girince mob'a dönüşüp
`cikis=0.75sn` ile yerden çıkıyorlar. Böylece dövüş kodunun HİÇBİR yerine
"gömülü mü" kontrolü eklemek gerekmedi - görünmez/vurulamaz/çarpışmaz olmaları
kendiliğinden geliyor. Çıkış süresince mob döngüsünde `continue` (yürümez,
vurmaz); render sprite'ı aşağı itip ayak çizgisinin altını `clip()` ile kırpıyor,
yani figür topraktan yükseliyormuş gibi açılıyor + toprak fışkırması.

**Ölüm:** `kill()` içinde kind 11'e ÖZEL dal - `kemikPatlat()` (kemik kıymığı +
toz, yer çekimli), küçük xp (6), **altın YOK** (40 kişilik kalabalık servet
olurdu) ve **`save()` YOK** (her ölümde localStorage yazmak onlarca yazma demek;
periyodik otomatik kayıt zaten `killed`i kalıcılaştırıyor).

**İki sessiz tuzak yakalandı:**
1. `loadAssets` düşman setlerini `n<=10` diye dönüyordu → `enemies/11` hiç
   yüklenmedi, iskeletler GÖRÜNMEDEN saldırıyordu (ekranda sadece windup
   halkaları). Yeni bir düşman türü eklerken bu döngüyü büyütmeyi unutma.
2. `HASAR` tablosunda olmayan tür `10+kind*3` alıyor → iskelet **43** hasar
   verecekti (14 kişilik çember oyuncuyu 2 vuruşta bitirir). `HASAR[11]=6`.

**Sanat:** `create-character-v3` ile iskelet karakteri (2 üretim, seed 111,
`id_iskelet.txt`). Tarifte "human" YAZILMADI - mannequin gövdesi zaten insan
silueti, "human" deyince model et/deri ekliyor. Sheet'ler şimdilik
`npc_sheet_kur.py` ile dönüş karelerinden kuruldu: **yürüme animasyonu YOK**
(kayarak ilerliyorlar). Walk+Attack 3'er yön = 6 üretim, kullanıcı onayı
bekliyor.

**Test notu:** `page.keyboard.press('KeyJ')` headless'ta güvenilmez (odak);
vuruş `g.attack()` doğrudan çağrılarak doğrulandı - hp 1 → tek vuruşta ölüm,
31 parçacık. Ayrıca mob SAYISI ölçüt olarak yanıltıcı: oyuncuyu taşıyınca yeni
iskeletler uyanıp sayıyı artırıyor, doğru ölçüt `state.killed`.

---

### v13.6: İskeletin altındaki zemin yaması + ölünce DAĞILMA
İki istek: "altında bir şey var, o olmaz" ve "animasyona dağılsınlar".

**1) Zemin yaması.** `create-character-v3` figürün ayaklarının altına toprak/
çim/çakıl tümseği çizmişti. **Tarifte yasaklamak İŞE YARAMADI** (2 üretim
harcandı): "NO ground, NO soil, NO grass, NO base…" eklenince zemin yine geldi,
üstelik tarifte ZATEN yasaklı olan **sırt çantası** eklendi. Bu modelde olumsuz
talimat güvenilmez - "sişman NPC" dersinin tersi yönü. Temizlik artık üretimden
sonra `scripts/iskelet_zemin_sil.py` ile:
* Palette **yeşil YOK** - "çim" sanılan şeritler zeytuni kahve. Ölçmeden kural
  yazmak boşa gitti.
* Kemik (L 111-207), paslı kılıç (L=121) ve toprak (L 28-50) aynı SICAK tonda;
  tek güvenilir ayırıcı **parlaklık**: `L<=58 && r-b>=4`.
* Ayrı bir "çakıl" kuralı (soğuk gri) denendi ve **KILICI YEDİ** - bıçak da
  soğuk gri ve dipten bağlı. Kaldırıldı.
* Alt kenardan taşma-doldurma; **siyah kontur bariyer** olduğu için dolgu
  bacakların içine geçemiyor. Sonra öksüz kalan kontur ve en büyük parça
  dışındaki adacıklar siliniyor.
Sonuç oyun ölçeğinde temiz; dipte birkaç piksel moloz kalıyor, platform hissi
gitti.

**2) Dağılma.** Ölüm artık parçacık değil: `iskeletDagit()` sprite'ı 2x3
dilime bölüp her dilimi kendi hızı + dönüşüyle savuruyor (`Parca` tipi,
yerçekimi + solma), üstüne kemik kıymığı. Dilimler kaynak sheet'ten okunuyor,
kopyalanan piksel yok - **üretim harcamıyor**. Parçanın doğduğu yer sprite'ın
ÇAPASINA göre hesaplanmalı (`m.y - capa*ol + ...`); ilk halinde ayak hizasında,
gövdenin altında doğuyorlardı.

**Kaybolan id uyarısı:** ikinci üretim `id_iskelet.txt`'yi EZDİ ve `_arsiv/`
gitignore'da olduğu için geri alınamadı - ama `GET /characters` tüm karakterleri
prompt'uyla listeliyor, iyi olan oradan bulundu (`778b71aa`, çantalı olan
`3feda690`). Yeniden üretim yapmadan önce id dosyasını yedekle.

---

### v13.7: Zeminin ASIL sebebi tarifin kendisiydi + gerçek kemik parçaları
Kullanıcı: "hâlâ ayaklarının altında bir şey var, pixellab'e yerden çıkacak
diye bahsetmene gerek yok"; "görseli parçalara ayırmışsın, ben daha gerçekçi
istedim - küçük kafatası ve kemik parçaları görselleri üretelim".

**1) Zemin, negatif talimatla değil POZİTİF ifadeyi silerek gitti.** v13.6'da
"NO ground" eklemek işe yaramamıştı; sebebi tarifin kendi açılışıydı:
*"clawing its way up out of the ground"*. Model "out of the ground" deyince
ayakların altına toprak çiziyordu. İfade kaldırıldı, zemin **tamamen** yok
oldu (2 üretim). **Ders: modele bir şeyi yaptırmayı bırakmak için önce kendi
tarifinde onu İSTEYEN cümleyi ara; olumsuz talimat son çare, hatta zararlı.**
Yerden çıkma zaten motorda (`gomulu` listesi + `cikis` animasyonu), görselin
anlatmasına gerek yok. Yan/arka görünümde bir **sırt çantası** kaldı - oyun
ölçeğinde pelerin/paçavra gibi okunuyor, üretim harcamaya değmedi.
Eski (iyi ama zeminli) id `_arsiv/uretim/pixellab/id_iskelet_v1.txt`'de.

**2) Dağılma artık sprite dilimi değil, ayrı kemik görselleri.** v13.6'daki
2x3 dilim "kesilmiş görsel parçası" gibi duruyordu. `scripts/kemik_uret.py`
beş küçük nesne üretti (`public/assets/nesne/kemik/`): kafatasi, kaburga,
uyluk, omurga, kirik - **4 üretim**, ikon boru hattı (`/create-image-pixflux`).
*API 16x16 KABUL ETMİYOR* ("Canvas must be size 32x32 area or larger"); 32x32
üretip `getbbox()` ile kırpılıyor, parça kendi ölçüsünde kalıyor.
`iskeletDagit()` artık gövde yüksekliği boyunca 1 kafatası + 5-7 kemik
savuruyor (`Parca` tipinden `sx/sy/sw/sh` kalktı, görsel bütün çiziliyor).
Ölçek `KEMIK_OLCEK`: 0.42 denendi, oyun ölçeğinde **fark edilmiyordu**; 0.58
doğru - kemik ~7 birim, karakterin kolu kadar.

---

### v13.8: Sırt çantası da POZİTİF ifadeyi değiştirerek gitti + daha bol/iri kemik
Kullanıcı: "daha bol kemik ve daha büyük kemikler, kafatası bir adet kalsın ama
biraz daha büyük olsun"; "modeli beğenmedim sırt çantalı, onu değiştirelim".

**1) Çanta.** v13.7'de zemini çözen ders ikinci kez işe yaradı. Çantayı getiren
ifade `"tattered grey rags HANGING OFF the bones"`ti - sırta asılan bir şey
tarif ediyordu, model bunu bohça/çanta olarak çizdi; `NO backpack` satırı hiç
işe yaramadı. Yerine **`"bare shoulders and bare spine"` + kalçada
`"torn grey loincloth"`** yazıldı, NO-listesi tamamen silindi. Sonuç (v3
`44e3a451`, 2 üretim): çanta yok, zemin yok, arkadan omurga görünüyor.
**Kalıp: istemediğin şeyi yasaklama - onu İSTEYEN kendi cümleni bul ve
yerine istediğini yaz.** Eski id'ler `id_iskelet_v1.txt` (zeminli),
`id_iskelet_v2_cantali.txt`.

**2) Kemikler.** `KEMIK_OLCEK` 0.42 → 0.58 → **0.85**; parça sayısı 5-7 →
**10-13**; her parçaya ayrıca 0.85-1.25 rastgele çarpan. Kafatası tek kalıyor
(iki tanesi "iki kafalı iskelet" gibi duruyor) ama `KAFATASI_BUYUT=1.35` ile
belirgin iri - dağılmanın odak noktası o.

---

### v13.9: Kemikler yere düşüyor, tonu iskeletle eşleşti, çıkışa toprak katmanı
Kullanıcı: "çok fazla dağılıyor ve çok çabuk opacity 0 oluyor… rengi tutmuyor
iskelet rengiyle… karakter yerden çıkarken önüne bir layer koyup ufak bir
toprak hareket ediyor gibi animasyon lazım".

**1) Ton.** Kemikler `create-image-pixflux`ten HAM çıkıyordu, iskelet ise
`aktor_uyum.grade()`den geçmişti - ölçüldü: kemik açık pikselleri L medyan 68 /
a −1.89 / b +10.0, iskeletinki 59 / +0.45 / +7.69. **İki aşama gerekti:**
aynı `grade()` (max 97→81) *ve* ölçülen artık farkı kapatan ikinci adım
(`L*0.87`, `a+2.34`, `b−2.31`) → 62.1 / +0.44 / +8.34. Affine L eşlemesi de
denendi, **gölgeleri eziyordu** - çarpan yeterli. `kemik_uret.py --ton` API'ye
dokunmadan ham dosyadan yeniden üretir (idempotent, bedava).

**2) Savrulma.** Hız ±(28-110) → ±(14-58), doğum yayılması 9→6 birim.
Asıl fark: parçalar artık havada kaybolmuyor - her parçanın `yer` hizası var,
değince sekiyor (restitution .32), sürtünme yatırıyor, ömür 0.8-1.3s → 2.1-2.9s
ve solma `life/omur` ile son ~0.9 saniyeye yayıldı. Yerde kemik yığını kalıyor.

**3) Çıkış toprağı.** Yerden çıkan iskeletin ÖNÜNE (kırpma `restore()`inden
SONRA) canvas ile toprak tümseği çiziliyor: koyu taban + açık üst elips +
`p*4.2` ile dönen 6 kesek. `k=sin(π·min(1,p·1.04))` ile kabarıp çöküyor.
Ayrıca `update()` içinde çıkış boyunca sürekli toprak kırıntısı fışkırıyor -
**hareket hissini veren asıl şey tümsek değil bu sürekli parçacık akışı.**
Ek görsel üretilmedi.

**Test notu:** çıkış 0.75 sn ve screenshot'lar fazladan rAF tetiklediği için
kare kare bakılamıyor; `Engine.ISKELET_CIKIS` testte `defineProperty` ile 4 sn
yapılıp öyle incelendi.

---

### v14.0: Çıkış toprağının rengi haritadan ÖLÇÜLDÜ
Kullanıcı: "animasyon rengi tam olmamış, mümkünse PixelLab'den animasyon
üretelim yoksa da rengi mape uymalı."

**PixelLab burada işe yaramaz** - bunu bir kez yazalım: `/characters/animations`
mannequin rigli KARAKTER animasyonu üretiyor, VFX değil. Toprak patlaması için
tek yol `/create-image-pixflux` ile kare kare üretmek; kareler birbirinden
bağımsız üretildiği için **zamansal tutarlılık olmaz, animasyon titrer**
(aynı ders: seri tutarlılık prompt'la değil referans kareyle sağlanıyor).

**Renk ölçümü.** `arkaplan/test100.png` üzerinde 42 iskelet karosunun ayak
hizasındaki pikseller sayıldı: zemin **L 25-30 / a +8.5 / b +7**, yani
KIRMIZIMSI. Elle seçilmiş tonlar ise zeytuni-sarı (a +4.5 / b +10…+18) ve çok
parlaktı (L 39-50) - "renk tutmuyor" şikayeti tam olarak buydu. Palet aynı
a/b ekseninden yeniden türetildi, yalnız parlaklıkta zeminin bir tık üstüne
çıkıyor ki tümsek okunsun: `TOPRAK` (L 12 / 17.5 / 33) ve `TOPRAK_KIR`
(L 26 / 34 / 42). Değerler artık `Engine.TOPRAK` / `Engine.TOPRAK_KIR`
sabitlerinde - başka bir mekâna iskelet konursa o mekânın zemini aynı yöntemle
ölçülüp buraya yazılmalı.

**Ders:** sahneye uyacak bir renk "gözle seçilmiyor" - arka plan görselinden
ölçülüyor. İlk denemede L'yi zeminle eşitledim, bu sefer tümsek kayboldu;
doğru ayar aynı a/b + zeminin ~5 L üstü.

---

### v14.1: İskelet yürüme/saldırı animasyonu + dash sıyırması
**1) Animasyon (7 üretim, bakiye 1453).** `v3_anim.py` ve `v3_kur.py`'ye
`iskelet` seti eklendi (`enemies/11`). Balta/yay setlerindeki BASLANGIC
hilesine gerek olmadı: iskeletin dönüş karesinde kılıç ZATEN elde, v3 başlangıç
karesini koruduğu için silah her karede duruyor. Yan ve arka yönlerde kılıcın
kesme yönü dersleri aynen geçerli - `KILIC_VUR_YAN` / `KILIC_VUR_ARKA` yeniden
kullanıldı. Üretimden sonra `iskelet_zemin_sil.py` yine çalıştırılmalı (yeni
kareler ham yedeği tazeliyor). Arka görünümde kılıç neredeyse kayboluyor;
o yön kısa süre göründüğü için üretim harcanmadı.

**2) Dash sıyırması.** `dashSiyir()`: kaçış sırasında `DASH_YARICAP=13` içine
giren düşman `DASH_HASAR=4` yiyor ve `DASH_ITME=30` geri savruluyor; iskelet
(kind 11) ise temas anında **dağılıyor** - kalabalığın arasından kaçmak bir
temizlik hamlesine dönüşüyor. `dashVuran` listesi her `dodge()`te sıfırlanıyor,
böylece tek kaçışta aynı düşman bir kez vuruluyor. Henüz yerden çıkmamış
(`cikis>0`) iskeletler vurulmuyor - yarım gövdeye çarpmak hile olurdu.
Hasar bilerek KÜÇÜK: kaçış bir saldırı hilesine dönüşmemeli.

**Test tuzağı:** iki dash'i arka arkaya denerken ikincisi hiç çalışmadı -
`dodge()` `dodgeTimer>0` iken sessizce dönüyor. Testte kaçış bekleme süresi
(~2 sn) beklenmeli, yoksa "dash hasar vermiyor" gibi yanlış sonuç çıkıyor.

---

### v14.2: İskeletler agresif - asıl darboğaz SALDIRI MENZİLİ'ymiş
Kullanıcı önce "öldürmek çok kolay, daha agresif ve hızlı olsunlar", sonra tam
teşhisi verdi: **"etrafımı sarıyor ama sadece bir iki tanesi bana vurabiliyor."**

Hız/can ayarı bu işi ÇÖZMEDİ - ölçüm zinciri şöyle gitti:

| deneme | 5 sn durarak | saldırı |
|---|---|---|
| hız 27→38, windup .4→.26, cool 1.15→.8, görüş 135→200 | 20 can | 23 |
| + windup sırasında HAMLE (hız 64) | 20 can | 23 |
| + i-frame .72 → .34 (iskelet vuruşu için) | 36 can | 23 |
| + **saldırı başlatma menzili 20 → 26** | **48 can** | **43** |

**Ders - iki ayrı menzil var ve karıştırılıyor:** `range` (windup'ı BAŞLATMA
eşiği, genel 20) ve vuruş anındaki `d<25` DEĞME eşiği. Çemberin ön safı 13
birimde duruyor, arka saf 22-28'de takılıyordu; 20'lik eşiğe giremedikleri için
windup'a bile başlamıyorlardı. Kullanıcının tarifi birebir buydu. İskelette
`ISKELET_SALDIRI_MENZIL=26`, `ISKELET_VURUS_MENZIL=29`.

**İkinci ders - i-frame kalabalığı nötrler.** Sabit `.72` sn dokunulmazlık
yüzünden 23 vuruşun 19'u yutuluyordu: 9 kişilik çember tek düşmanla AYNI
tehdidi veriyordu. `hurt()` artık i-frame süresini parametre alıyor; iskelet
`.34` ile vuruyor. Zayıf-ama-kalabalık düşman tasarımı bu parametre olmadan
çalışmıyor.

**Test tuzağı (kendi hatam):** `hurt`'ü sayaçla sarmalarken `(n)=>h(n)` yazdım,
ikinci argüman (iframe) yutuldu ve i-frame değişikliği ölçümde HİÇ görünmedi -
"değişiklik işe yaramadı" sanıp yanlış yola sapıyordum. Sarmalayıcı daima
`(...a)=>h(...a)`.

Sonuç: çemberin ortasında durmak 5 saniyede ~48 can, koridoru yürüyerek geçmek
~40 can. Tek vuruşta ölmeleri ve dash'in onları dağıtması korunuyor.

---

### v14.3: Kuşatma - düşmanlar sıra olmak yerine birbirini iterek geliyor
Kullanıcı: "iskeletler belli bir yerden sonra belli bir sıraya geçip sırada
bekliyorlar; birbirlerinin etrafından dolaşıp birbirlerini iterek saldırmalılar
- sadece iskeletler değil TÜM düşmanlar."

**Asıl sebep sert çarpışma yarıçapıydı.** Düşman-düşman engelleme ve ayrışma
itmesi aynı değerdeydi (`CARP_MOB=14`): ön saf katı bir duvar oluyor, arkadaki
hiç kimse içeri giremiyordu. İkisi ayrıldı - engel `ENGEL_MOB=9`, itme hâlâ 14
(gücü 2.4 → 3.8). Aradaki farkta birbirlerine **girebiliyorlar** ama sürekli
itiliyorlar; yer varken açılıyorlar, baskı altında sıkışıyorlar.

**İkincisi yön bulma.** `dusmanYurut()`: hedefe düz gitmek yerine önündeki
komşunun etrafından teğet geçiyor. İki tuzak ölçülerek bulundu:
* **Tüm komşuları toplamak İŞE YARAMIYOR** - sağdaki ve soldaki komşuların teğet
  itkileri birbirini götürüyor, toplam sıfıra yaklaşıyor ve yaratık yine düz
  yürüyor. Yalnızca EN YAKIN öndeki komşu sayılır.
* **Dönüş yönü mob'a sabit olmalı** (`m.yan`, ±1). Her karede çapraz çarpımdan
  hesaplanınca yaratık iki komşu arasında sağa-sola titreyip ilerlemiyor.
Buna rağmen ilerleyemeyen (dar geçit) için teğet açılar tek tek deneniyor.

**Ölçüm (20 iskeletin ortasında 5 sn durarak):**
| | saldırı | 25 birim içinde | en yakın 6 |
|---|---|---|---|
| önce | 47 | 8 | 13,13,13,13,16,17 |
| sonra | **84** | **13** | 4,7,12,13,13,13 |
Can kaybı 56'da sabit kaldı - i-frame tavanı (v14.2) devrede, doğrusu bu.

**Test tuzağı:** düşmanları `state.x+40`'a ışınlayıp "yaklaşmıyorlar" diye
regresyon sandım; duvarın içine/görüş hattı dışına düşmüşlerdi. `git stash` ile
commit'teki kodda da aynı sonuç çıktı - ışınlamalı testte hedef noktanın
`walkable` ve görüş hattında olduğu doğrulanmalı.

---

### v14.4: Düşman animasyonlarının fazı ayrıştı
Kullanıcı: "iskeletler aynı ritimde hareket ediyor, biri sağ adım atarken öbürü
sol adım atabilsin - diğer düşmanlara da uygulayalım."

Sebep: kare numarası GLOBAL saatten geliyordu
(`Math.floor(time*DUSMAN_FPS(eylem))`), yani aynı türden herkes tek gövde gibi
aynı kareyi çiziyordu.

**Çözüm durum tutmadan:** faz ve animasyon hızı mob'un **kimliğinden**
türetiliyor (FNV-1a karması → 0..1). Alan eklemek 7 ayrı mob doğum noktasını
(`resetMobs`, `iskeletKontrol`, yarasa sürüsü, muhafız, Rauf…) tek tek
düzenlemek demekti; kimlikten türetince her doğum yerinde kendiliğinden çalışıyor
ve her karede aynı sonucu veriyor.

**Hız saçılması şart:** yalnız faz kaydırılırsa iki mob bir süre sonra yine aynı
kareye denk geliyor. `FAZ_HIZ_MIN/MAK` 0.86-1.16 ile cycle uzunlukları da farklı.
Saldırıda hıza dokunulmuyor - savurmanın süresi vuruş zamanlamasıyla okunuyor,
orada yalnızca başlangıç fazı kayıyor.

Ölçüm: yan yana dizilen 8 iskeletin aynı andaki kare numaraları
5,3,6,1,4,2,6,8 (9 karelik döngüde).

---

### v14.5: Yan odaya geçip dönünce düşmanlar kapıda bekliyor
Kullanıcı: "düşmanla savaşırken diğer odaya geçip dönünce düşmanlar kayboluyor,
bu bug olur - kapıda bizi beklemeliler."

Sebep: `resetMobs()` bölgeye her girişte HERKESİ ev konumuna ve DOLU canla
kuruyordu; iskeletler ayrıca yeniden `gomulu` listesine düşüyordu, yani toprağın
altına giriyorlardı. Oyuncu açısından düşmanlar yok olmuş gibi görünüyordu.

Çözüm: `bekleyenleriYaz()` bölgeden çıkarken peşimizdekileri (yara almış YA DA
`BEKLEME_MENZIL=170` içindekiler) id+can olarak not eder; `bekleyenleriKur()`
dönüşte onları oyuncunun çevresine `BEKLEME_UZAK=46` birime dizer ve canlarını
geri yazar. İskelet kaydı varsa `gomulu`dan çıkarılıp `cikis:0` ile doğrudan
ayakta listeye alınır - bizi bekleyen biri yeniden toprağa girmemeli.
Patron kendi arenasında kalır; Rauf ve fener (kind 9) kapsam dışı.

**Kapsam kararı:** hafıza oturum içinde, kayda YAZILMIYOR. Ölünce ve kayıt
yüklenince temizleniyor - ölüm zaten bir sıfırlama.

**İki test tuzağı, ikisi de aynı hata:**
* `changeZone('tunel', g.world.spawn/16)` yazdım ama o an `g.world` hâlâ
  HAVEN'dı; oyuncu tünelde saçma bir noktaya düştü, yerleştirme `walkable`
  bulamadı ve "çalışmıyor" sandım. Yedek davranış doğru çalışmış (mob evinde
  kalmış). **changeZone'a verilecek kare hedef bölgenin dünyasından alınmalı.**
* Canın taşındığını İSKELETLE ölçmeye çalıştım: `CAN[11]=1` olduğu için
  `Math.min(m.max,k.hp)` her zaman 1 veriyor. Çok canlı bir düşmanla (kind 5,
  24 can) doğrulandı: 9 can ve 77 → 39 birim.

---

### v14.6: İskelet ölüm sesi (kullanıcının verdiği kayıt)
Masaüstündeki `skeleton-kill-hit-...zip` içindeki 0.61 sn stereo WAV.

* **Ayrı ad:** `dusmanOlum` TÜM düşmanlarda çalıyor; kemik çatırtısı yalnız
  iskelete ait olmalı. Yeni `Sound` adı `iskeletOlum`, `ORNEKLER`e eklendi.
  Bu mimari zaten hazırdı: `ORNEKLER`e dosya yolu yazmak sentezi eziyor,
  dosya yüklenemezse sentez çalmaya devam ediyor (fallback için
  `case 'iskeletOlum'` `dusmanOlum`'un yanına eklendi).
* **Dönüşüm:** baştaki sessizlik kırpıldı, mono 44.1k mp3,
  `loudnorm I=-16 TP=-1.5` + `volume=-1dB`. Hedef `death.mp3` ile aynı hizada
  olmak: ölçüldü, sonuç tepe −1.2 / ortalama −23.8 dB (death: −1.8 / −20.8).
  **EBU R128 integrated bu kısalıkta İŞE YARAMIYOR** (death.mp3 −70 LUFS
  okuyor, kapı 3 sn'nin altını atıyor) - kısa efektlerde `volumedetect`.
* **Üst üste binme koruması:** dash bir sürünün içinden geçerken aynı karede
  birkaç iskelet ölüyor; aynı örnek tam fazda üst üste binince tek bir patlama
  gibi duyuluyordu. `ISKELET_SES_ARA=.07` sn'lik aralık yetiyor.

Ham WAV `_arsiv/uretim/` altında.

---

*Son güncelleme: 2026-09-16, v14.6. Karıştırıyorsa kısalt ya da sil; kullanıcı böyle istedi.*
