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
- Ertelenen: i18n (TR/EN/Bahasa), masaüstü-mobil ayrı arayüz + kontrol
  ekranı, Tiga'nın sprite kalitesi, Kül Ovası içeriği.

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

**Arayüz:** parşömen. Çerçeveler CSS değil 9 dilim piksel resmi
(`frame*.png`, dilim 8, kalınlık dilimin katı). `border-image … fill`
merkezi de boyar. "Vazgeç" pastel kırmızı (okunmuyordu). Alt güvenli alan
`calc(N + env(...))` — `max()` YANLIŞ. Mobil dikey mod oynanabilir olmalı
(`portrait` tek başına duraklatmaz). Sol altta sürüm `vX.Y ALPHA`; her
anlamlı değişiklikte 0.1 artar (`SURUM` in data.ts).

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

---

*Son güncelleme: 2026-09-12, v6.8. Karıştırıyorsa kısalt ya da sil; kullanıcı böyle istedi.*
