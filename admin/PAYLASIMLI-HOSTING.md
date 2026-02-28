# Admin Panelini Paylaşımlı Hostinge Kurma

Paylaşımlı hosting (cPanel, Plesk, FTP ile) üzerinde admin panelini yayınlamak için adımlar.

## 1. Projeyi build edin

Supabase bilgilerini **production** için ayarlayın. `admin/.env` dosyasında:

```env
VITE_SUPABASE_URL=https://PROJE_REF.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...anon_key...
```

Sonra build alın:

```bash
cd admin
npm install
npm run build
```

`dist` klasörü oluşacak; içinde `index.html`, `assets/` ve `.htaccess` olacak.

---

## 2. Hostinge yükleme

### FTP / cPanel Dosya Yöneticisi ile

1. **FTP** veya cPanel **Dosya Yöneticisi** ile hostinge giriş yapın.
2. Web sitenin kök dizinine gidin:
   - Ana domain için: `public_html`
   - Alt domain (örn. panel.siteniz.com) için: `public_html/panel` veya hostingin verdiği klasör
3. **`admin/dist`** içindeki **tüm dosya ve klasörleri** bu dizine yükleyin:
   - `index.html` (kökte)
   - `assets/` klasörü (içindekilerle)
   - `.htaccess` (gizli dosya; FTP’de “gizli dosyaları göster” açık olsun)

**Önemli:** `dist` klasörünün kendisini değil, **içeriğini** yükleyin. Yani `index.html` doğrudan `public_html` (veya seçtiğiniz klasör) içinde olsun.

---

## 3. .htaccess (Apache)

`.htaccess` dosyası `admin/public` içinde; build sırasında `dist` içine kopyalanır. FTP ile yüklediğinizde `dist` içinden gelen `.htaccess` kök dizinde olmalı. Böylece `/login`, `/subjects` gibi adresler doğru çalışır.

Hosting **Nginx** kullanıyorsa, paneli bir alt dizinde açacaksanız örnek ayar:

```nginx
location /panel {
  try_files $uri $uri/ /panel/index.html;
}
```

---

## 4. Kontrol

- `.env`’e yazdıysanız, panel “Push Bildirim” sayfasında Supabase Edge Function’ı kullanır.
- Edge Function’ı deploy ettiğinizden emin olun: `supabase functions deploy send-push`
- Supabase’de CORS’a kendi domain’inizi eklemeniz gerekebilir (Edge Function CORS ayarı).

---

## 5. Kontrol

- Tarayıcıda panel adresini açın (örn. `https://siteniz.com` veya `https://panel.siteniz.com`).
- Giriş sayfası açılmalı; Supabase’de `role = 'admin'` atadığınız hesapla giriş yapın.

Sorun olursa: tarayıcı konsolunda (F12) hata mesajına ve Supabase URL/key’lerin doğru build’e girdiğine bakın.
