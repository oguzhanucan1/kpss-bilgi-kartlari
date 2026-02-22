# KPSS Bilgi Kartları – Admin Paneli (Web)

Bu proje, mobil uygulamanın içeriğini web üzerinden yönetmek için kullanılır. Aynı Supabase projesine bağlanır; sadece `role = 'admin'` olan kullanıcılar panele giriş yapabilir.

## Kurulum

1. **Bağımlılıklar**
   ```bash
   cd admin
   npm install
   ```

2. **Ortam değişkenleri**  
   Proje kökünde `admin/.env` oluşturun (mobil uygulamadaki Supabase bilgileriyle aynı):
   ```
   VITE_SUPABASE_URL=https://xxxxx.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIs...
   ```

3. **Supabase’de admin yetkisi**
   - Supabase Dashboard → SQL Editor’da `mobile/supabase-admin.sql` dosyasını çalıştırın.
   - İlk admin kullanıcıyı atamak için SQL’de şu satırın yorumunu kaldırıp kendi e-postanızı yazın ve bir kez çalıştırın:
     ```sql
     UPDATE public.profiles SET role = 'admin' WHERE id = (SELECT id FROM auth.users WHERE email = 'SIZIN_EPOSTA@example.com' LIMIT 1);
     ```

## Çalıştırma

- Geliştirme: `npm run dev` (varsayılan: http://localhost:5174)
- Derleme: `npm run build`
- Önizleme: `npm run preview`

## Netlify'da yayınlama

1. **Projeyi GitHub/GitLab'a pushlayın** (henüz yoksa).

2. **Netlify'a girin:** [app.netlify.com](https://app.netlify.com) → "Add new site" → "Import an existing project".

3. **Repoyu bağlayın:** GitHub/GitLab seçin, bu projeyi (kpss-bilgi-karti) seçin.

4. **Build ayarları:**
   - **Base directory:** `admin` yazın (admin paneli bu klasörde).
   - **Build command:** Netlify `admin/netlify.toml` kullanacak; ekstra girmenize gerek yok. Toml yoksa: `npm run build`.
   - **Publish directory:** `admin/dist` (toml’da zaten var).

5. **Ortam değişkenleri:** "Site settings" → "Environment variables" → "Add variable" / "Add secrets":
   - `VITE_SUPABASE_URL` = Supabase proje URL’iniz
   - `VITE_SUPABASE_ANON_KEY` = Supabase anon (public) key

6. **Deploy:** "Deploy site" ile ilk deploy alınır. Sonraki her push’ta otomatik deploy olur.

Panel adresi: `https://SITE-ADINIZ.netlify.app`. Doğrudan `/login` veya `/subjects` gibi linkler de çalışır (SPA redirect ayarı `netlify.toml` içinde).

## Panel içeriği

- **Panel:** Genel bilgi ve linkler.
- **Dersler:** Ders ekleme, düzenleme, silme.
- **Konular:** Konu ekleme/düzenleme/silme (derse bağlı).
- **Kartlar:** Bilgi kartı ekleme/düzenleme/silme (konuya bağlı).
- **Motivasyon:** Anasayfa motivasyon sözleri.
- **Duyurular:** Anasayfa duyuruları.

Giriş: Supabase Auth ile e-posta/şifre. Sadece `profiles.role = 'admin'` olan hesaplar panele erişebilir.
