# Admin panelini yayına alma (deploy)

Yaptığınız değişiklikleri canlıya almak için aşağıdaki adımlardan birini kullanın.

---

## 1. Kodu Git’e göndermek (push)

Değişiklikler sadece kendi bilgisayarınızda kalsın istemiyorsanız, önce Git’e commit edip uzak repoya push edin:

```bash
# Proje kökündeyken (veya admin/ içindeyken)
git add .
git status   # Hangi dosyaların eklendiğini kontrol edin
git commit -m "Admin: gelişmiş kart editörü, storage politikası, deploy notları"
git push
```

Bundan sonra kod GitHub / GitLab / sunucu vb. nerede tutuluyorsa orada güncel olur. **Canlı site otomatik güncellenmez;** sunucuda veya hosting’de ayrıca build + yayın yapmanız gerekir.

---

## 2. Admin panelini canlıya almak (build + yayın)

Admin bir **Vite + React** projesi. Canlıda çalışması için önce **build** alıp, çıkan dosyaları **hosting’inize** koymanız gerekir.

### Build alma

**Önce proje köküne gidin** (admin, `mobile` klasörünün içinde değil, yanında):

```bash
cd C:\Users\PC\Desktop\pro\kpss-bilgi-karti\admin
npm install
npm run build
```

Veya proje kökündeyken:

```bash
cd C:\Users\PC\Desktop\pro\kpss-bilgi-karti
cd admin
npm install
npm run build
```

- Çıktı **`admin/dist/`** klasöründe olur.
- Site **alt dizinde** açılacaksa (örn. `site.com/kpss/`) **mutlaka** `build:kpss` kullanın:

  ```bash
  npm run build:kpss
  ```

  Yine çıktı `admin/dist/` içindedir; bu build `--base /kpss/` ile yapıldığı için `site.com/kpss/` altında doğru çalışır.

### Build’i nereye koyacaksınız?

Hosting’e göre örnekler:

| Hosting türü | Yapmanız gereken |
|--------------|-------------------|
| **Vercel / Netlify** | Repo’yu bağlayıp root veya `admin` klasörünü proje yapın, build command: `npm run build` (veya `build:kpss`), output: `dist`. Sonra `git push` yaptığınızda otomatik deploy olur. |
| **Kendi sunucunuz (SSH)** | Sunucuda `git pull`, sonra `cd admin && npm install && npm run build` (veya `build:kpss`). `dist/` içeriğini web root’a kopyalayın (örn. `cp -r dist/* /var/www/admin/`). |
| **cPanel / FTP** | Bilgisayarınızda `npm run build` (veya `build:kpss`) alın; `admin/dist/` içindeki **tüm dosyaları** FTP ile sunucudaki admin klasörüne yükleyin (örn. `public_html/kpss/`). |

### Beyaz ekran / 404 (index-xxx.js, index-xxx.css bulunamıyor)

- **Admin paneli bir alt dizinde mi açılıyor?** (örn. `site.com/kpss/`, `site.com/admin/`)  
  O zaman **normal** `npm run build` yeterli değil; tarayıcı dosyaları site kökünden (`/assets/...`) ister ve 404 alır.  
  **Çözüm:** Alt dizin için build alın: `npm run build:kpss` (base `/kpss/`). Sonra `dist/` içeriğini tam o dizine yükleyin (örn. `public_html/kpss/`). Farklı bir yol kullanıyorsanız (örn. `/admin/`) `package.json` içinde `build:kpss` satırındaki `--base /kpss/` değerini kendi yolunuza göre değiştirin (örn. `--base /admin/`).
- **Sadece index.html mi yüklediniz?**  
  **Çözüm:** `dist/` içindeki **hepsini** yükleyin: `index.html` + **`assets/`** klasörü (içindeki .js ve .css dosyalarıyla birlikte). Eksik olursa 404 ve beyaz ekran olur.
- **favicon.ico 404:** Genelde önemsizdir; sayfa yine çalışır. İsterseniz `admin/public/` içine favicon koyup yeniden build alın.

---

## Özet

1. **Sadece kodu paylaşmak / yedeklemek:** `git add .` → `git commit -m "..."` → `git push`
2. **Canlı siteyi güncellemek:** `cd admin` → `npm run build` (veya `build:kpss`) → `dist/` çıktısını hosting’e koymak (FTP, SSH veya Vercel/Netlify otomatik deploy).

Hosting’iniz nerede (Vercel, Netlify, kendi sunucu, cPanel vb.) söylerseniz, o senaryoya göre adım adım yazabilirim.
