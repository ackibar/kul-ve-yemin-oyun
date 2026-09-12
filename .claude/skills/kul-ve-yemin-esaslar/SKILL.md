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
| Lin | Sığınak | 8 yaş, ateşi söndürmeyen | sozNil, nilOdun |
| Elvi | Sığınak | sayılmayan yetmiş birinci | selviSir, sozSelvi |
| Tiga | Yıkık/Sığınak | Lin'in ağabeyi | ayaz (indi/kaldi) |
| Tuhn | Sarnıç Ağzı | uçurumun başındaki adam | tuhn (kaldi/atladi) |
| Rauf | Sarnıç | kaçak, defter, kızının kurdelesi | rauf (korundu/serbest/teslim/oldu/takip) |
| Obruk | Sarnıç Ağzı (geçici) | kileri dolu soylu, 2.5× fiyat | obrukSaygi (bey), obrukSir, tac |
| Karga / Çakal | Obruk'un yanı | paralı askerler; Karga kileri sayıyor: 21 hafta | obrukDepo |
| Uslu | Sığınak | fırtınadan dönen deli, 8 soru, son çakıl | usluSoru |
| Kral (Ongun) | Sığınak köşesi | hiç konuşmaz, vurulabilir, çubuk yok | kralGoruldu, kral (oldu), kralCan, kralMuhafizHaber |
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

**Ton uyumu otomatik:** her yeni karakter/düşman
`aktor_uyum.klasor(hedef, ham_yenile=True)` ile sahnenin tonuna çekilir
(ışık omuzu + kroma omuzu + kül tonu). Ham sheet önce
`_arsiv/uretim/asset_backup_ton_oncesi`'ne yazılır; `ham_yenile` verilmezse
script eski yedeği yeniden basar ve **yeni sanatı sessizce geri alır**
(örümcek vakası). İkonlar (32×32, parşömen üstünde) ton uyumuna
GİRMEZ.

**Ölçek:** 1 karo = 16 dünya birimi = 32 sanat px, motor 2× okur (`R=2`).
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
  sheet'i elle kur (`kral_uret.py`, `fener_uret.py`). Portre D_Idle'ın üst
  24 satırından kırpılır; figürü hücrenin tepesine oturt.
- Düşman portresi gerekiyorsa `enemies/N/D_Idle.png` → `characters/M/`
  kopyala (son muhafız = 15).
- Yeni karakter tarifine `ORTAK` ekle: "NO backpack, NO satchel, NO straps,
  NO modern clothing, human".

**Mekânlar:** tek parça boyalı arka plan; çarpışma otorite, görsel ona
maskelenir. Boyalı mobilyanın çarpışması elle (`blockers`). Photoshop
katman sözleşmesi: `zemin` / `<ad>@engel` / `@gecilir` / `@ates` / `@ust`.

**Işık haritası (2026-09-12):** `Engine.KARANLIK[mekan]` 0–1; 0 ise eski
düz tint aynen kalır (kullanıcı mevcut mekânların havasını beğendi, hepsi 0;
yalnız Sarnıç Ağzı .82 deneme). Ekran dışı tuvale karanlık basılır, her ışık
`destination-out` radyal gradientle delik açar: ateş entity'leri, boyalı
duvar ışıkları (`World.isiklar`, arka plandaki sıcak-parlak piksel
kümelerinden ölçülür), fener taşıyan, yanan düşman, ateş oku, oyuncu
(meşaleyle 78, meşalesiz 22 = iki adım). Meşale 90 sn, Alf'te 9 altın,
zanaat masasında 2 odun. Yeni karanlık mekân gelince KARANLIK'a değer ve
`isiklar`'a fener konumları yazılır.

**Meşale (2026-09-12):** her yerde yakılır (mekân kısıtı test için
kaldırıldı; aydınlıkta yalnız uyarır). Q döngüsünde sönük meşale de var:
seçince yakılır — "kılıç gibi ele alınsın". Yarıçap 208 (kullanıcı iki kat
istedi), beş duraklı yumuşak geçiş. Yanınca `elmesale` geçici silahı envantere girer;
kılıç tutuyorsan meşale sol ele gelir (`1swordmesale` seti), silahsızsan
tek başına (`1mesale`, vuruşu tutuşturur); yay/balta iki el ister, meşale
kemerde kalır ve ışık yarıya iner (`mesaleElde()`). Q döngüsünde meşale
çıplak elin yerini alır. Süre `flags.mesaleKalan`'da kayda girer. Işık
merkezi ayak değil gövde ortası (y-16). Meşaleli setlerde ilk kareler
dönüş karesinden geldiği için meşalesiz: `v3_kur` ALEV_AT alev pikseline
göre kırpar; ton uyumu alevi de küle çevirdiği için `alev_geri` ham
alev piksellerini geri koyar. Yan/arka saldırıda model meşaleyi yere
yayılan aleve çevirdi → "SMALL fist-sized flame, NO fire on the ground".

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
- Rauf ölmez, diz çöker; ölürse yeniden doğmaz (yerleşim koşullu).
- **Kral vurulabilir, çubuğu yok.** Vurup vurmamak oyuncunun ölçüsü.
- Satıcılar `SATICILAR` + `zam`: Alf 1×, Obruk 2.5× ("bey" dersen 2.15×).
  Bir eşya hangi listedeyse yalnız oradan alınır.
- Düşman canı TEK yerde (`Engine.CAN`); iki tabloda `undefined+0=NaN`
  görünmez düşman yaptı.

---

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

*Son güncelleme: 2026-09-12, v5.6. Karıştırıyorsa kısalt ya da sil; kullanıcı böyle istedi.*
