# Kül ve Yemin

## Vercel ile yayınlama

Bu klasörü GitHub'a yükle, ardından Vercel'de **Add New → Project** ile depoyu içe aktar. Vercel ayarları otomatik okuyacaktır: derleme komutu `npm run build`, çıktı klasörü `dist`.

Yerelde çalıştırmak için `npm install`, sonra `npm run dev` kullan. Üretim sürümünü kontrol etmek için `npm run build` ve `npm run preview` çalıştır.

Türkçe, yatay mobil için hazırlanmış tek oyunculu piksel aksiyon RPG. Vite üzerinde React arayüz, Canvas 2D oyun dünyası ve Web Audio müzik/efekt sistemi.

## Oynanış

Sol sanal çubuk: hareket. Sağ kılıç: basılı tutarak yakın dövüş ve otomatik yönelme. Rüzgâr: kısa dokunulmazlık veren kaçınma. Kalp: iksir. Alt orta düğme: yakın NPC, sandık, kol veya geçitle etkileşim. Üst portre: yetenekler; heybe: eşya kuşanma; defter: görev, harita ve kararlar.

Son Sığınak'ta Mirna, Alf, Undur, Selvi ve Nil. Sarnıç Ağzı'nda uçurumun başında Tuhn. Unutulmuş Sarnıç'ta ilaç, Rauf ve ocak kapısı kolu. Kül Ovası'ndaki Yıkık Ev'de Ayaz. Kül Ocağı'nda Bekçi, kalp ve sığınağa dönüş geçidi. Üç ana görev ve bir yan görev; ilaç, kaçak, iki sır ve oyuncunun kendi sözleri için kararlar; son, oyuncunun ettiği yeminle kapanır (kapıyı beklemek, yukarıdakileri aramak ya da ocağı beslemek). Beş seviye, 16 eşya tanımı, dört düşman davranışı, dokunmatik menüler.

Hikâyenin bütünlüğü (kim kime ne yemin etti, hangi karar neyi açar) `HIKAYE.md` dosyasında tutulur; yeni diyalog yazarken önce ona bak.

Kayıt cihazdaki localStorage alanındadır (`kul-ve-yemin-save-v1`); sunucu hesabına senkronize edilmez. Ses kullanıcı etkileşimiyle başlar. Müzik tek parça bir 8-bit kayıttır (`public/assets/audio/`); dikişsiz dönmesi için döngü noktasında sabit güç (constant power) çapraz geçiş uygulanır. Ateş sesi konuma bağlıdır: alevlere yaklaştıkça yükselir, 8 karo uzaklıkta susar ve kaç ocak olursa olsun tek döngü çalar. Efektler Web Audio ile sentezlenir. Ekipmanlar istatistik ve savaş etkilerini değiştirir, kahramanın sprite görünümü sabittir.

## Geliştirme

- `npm run dev`
- `npm run build`
- `npx tsc --noEmit`
- `node tests/regression.mjs`

Oyun mantığı `lib/game/data.ts`, haritalar `world.ts`, çalışma döngüsü ve çizim `engine.ts`, sesler `audio.ts` içindedir.

## Doğrulama

Dokuz regresyon grubu: tüm hikâye kombinasyonları, tekrar ödül engeli, görev önkoşulları, ekipman/alışveriş/yetenek sınırları, bozuk kayıt reddi, tüm hedeflere harita erişimi, kaçınma sonrasında hareketin durması, sandık/iksir işlemleri, savaş/son düşman/ölümden dönüş ve duvarların saldırı/konuşmayı engellemesi. TypeScript ve üretim derlemesi doğrulandı.

Tarayıcı tıklama, ekran görüntüsü ve gerçek cihaz testi yapılmadı. İsteğe bağlı WebMCP arayüzü destek algılamasıyla kayıt olur; bu oturumda uyumlu WebMCP doğrulama bağlamı olmadığı için çalıştırılarak doğrulanmadı.

Görseller kullanıcının sağladığı Craftpix oyun kitinden, Cinzel yazı tipi Google Fonts'tan. İlgili lisans bağlantısı ve font lisansı public altında tutulur.

## Depo düzeni ve dağıtım

`app/` React arayüzü, `lib/game/` motor (engine, world, data, audio), `public/assets/`
oyunun çalışması için gereken tüm görsel ve ses dosyaları, `scripts/` asset üretim ve
mekân kurma araçları (oyun çalışırken kullanılmaz), `tests/regression.mjs` tarayıcı
üstünde koşan duman testi.

Depoya **girmeyen** yerel klasörler: `generated/` (ara çıktılar), `pixellab/`,
`refs/`, `asset_backup_*/`, `.venv-psd/`. Bunlar yalnızca asset üretim hattı için
gerekli; oyun bunlar olmadan derlenir ve çalışır.

`.env.local` (Gemini ve PixelLab anahtarları) `.gitignore` ile dışarıda tutulur ve
**asla** depoya eklenmemelidir. Oyunun kendisi hiçbir API anahtarı kullanmaz; anahtarlar
sadece `scripts/` altındaki üretim araçları içindir, yani Vercel'de ortam değişkeni
tanımlamaya gerek yoktur.

### Vercel

`vercel.json` derleme komutunu (`npm run build`), çıktı klasörünü (`dist`) ve tek sayfa
uygulaması için geri dönüş yönlendirmesini tanımlar. Vercel dosya sistemini
yönlendirmelerden önce kontrol ettiği için `/assets/...` istekleri doğrudan dosyaya
gider. Node sürümü `package.json` içindeki `engines` alanından okunur.

### Mekânı yeniden üretmek

Sığınak görseli `background.jpeg` (zemin) ve `prop.jpeg` (yeşil fonlu eşyalar)
dosyalarından üretilir:

```
python3 scripts/yesil_kaldir.py prop.jpeg background.jpeg generated/prop
python3 scripts/mekan_kur.py
```

İkincisi `public/assets/arkaplan/haven.png` dosyasını yazar ve `lib/game/world.ts`
içine yapıştırılacak zemin ızgarası ile çarpışma kutularını basar. Doğrulama katmanı
`generated/_YENI_ENGEL.png`.
