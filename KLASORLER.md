# Hangi dosya ne işe yarıyor

Oyun **kökte** duruyor (alt klasöre taşınmadı: Vercel'in derleme kökü burası,
taşınırsa canlı yayın kurulum ayarı değişene kadar kırılır).

## Oyunun kendisi — SİLME
| | |
|---|---|
| `app/` | Arayüz (React): HUD, paneller, menü, `globals.css` |
| `lib/` | Oyun motoru: `engine.ts`, `world.ts`, `data.ts`, `audio.ts` |
| `public/` | Bütün görseller, sesler, video |
| `components/` | Arayüz bileşenleri (diyalog, sekme, kaydırıcı) |
| `src/` | Giriş noktası (`main.tsx`) |
| `index.html` · `package.json` · `package-lock.json` | Proje tanımı |
| `tsconfig.json` · `vite.config.ts` · `vercel.json` · `postcss.config.mjs` · `components.json` | Yapılandırma |
| `README.md` · `HIKAYE.md` · `KLASORLER.md` | Belgeler |

## Araçlar — oyun çalışırken kullanılmaz
`scripts/` — asset üretim ve kurulum script'leri (PixelLab, ton uyumu, sprite
kurulumu) ve `scripts/test/regression.mjs`. Silersen oyun çalışmaya devam eder,
ama yeni asset üretemezsin.

## Silinebilir
| | |
|---|---|
| `_arsiv/silinebilir/` | **Tamamen sil.** Kaynak JPEG'ler, ses paketleri, eski yedekler, kullanılmayan 377 asset |
| `_arsiv/uretim/` | Silmek oyunu bozmaz; asset script'leri bir daha çalışmaz (PixelLab kimlikleri, ham kareler) |
| `dist/` | Derleme çıktısı. `npm run build` her seferinde yeniden üretir |
| `node_modules/` | Paketler. `npm install` yeniden kurar |

`dist/` ve `node_modules/` silinse bile iki komutla geri gelir:
`npm install && npm run build`

---

## Masaüstündeki diğer klasörler

| Klasör / dosya | Ne |
|---|---|
| `Kul-ve-Yemin/` | **Gerçek proje.** GitHub ve Vercel'e bağlı olan bu |
| `Kul-ve-Yemin 2/` | 11 Eylül'den kalma eski kopya, git'e bağlı değil, kullanılmıyor — silinebilir |
| `Kul-ve-Yemin-zemin/` | Sığınak zemin/prop kaynak görselleri; oyuna aktarıldı — silinebilir |
| `ash-covered_underground-kilic/` | PixelLab'den inen kılıçlı karakter paketi; kuruldu — silinebilir |
| `8bit-*.wav`, `death.wav`, `outside`, `intro.mp4` | Ses/video kaynakları; `public/assets/audio` ve `video` altına dönüştürüldü — silinebilir |
| `Ekran Resmi *.png` | Bana gönderdiğin ekran görüntüleri — silinebilir |
| `Generate_*`, `Convert_*` | Üretilen ham görseller; kullanılanlar oyuna aktarıldı — silinebilir |

Oyunun çalışması için masaüstünde **yalnızca `Kul-ve-Yemin/` gerekli.**
