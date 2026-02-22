# Demo kullanıcı – deneme girişi

Uygulamada **"Demo ile Giriş Yap"** butonu ile giriş yapabilmek için aşağıdaki kullanıcıyı Supabase’de oluşturmanız gerekir.

## Yöntem 1: Supabase Dashboard (önerilen)

1. [Supabase Dashboard](https://supabase.com/dashboard) → projenizi seçin.
2. Sol menüden **Authentication** → **Users**.
3. **Add user** → **Create new user**.
4. Şu bilgileri girin:
   - **Email:** `demo@kpss.app`
   - **Password:** `Demo123!`
5. **Create user** ile kaydedin.

Artık uygulamada **Demo ile Giriş Yap** dediğinizde bu hesapla giriş yapılır. İlk girişte **Hesap kurulumu** adımlarını (Kullanıcı adı, Ad Soyad, Hedef yıl) tamamlayıp ana ekrana geçebilirsiniz. Ayrıca Supabase’de `profiles` tablosunu oluşturmanız gerekir: `mobile/supabase-profiles.sql` dosyasındaki SQL’i Dashboard → SQL Editor’da çalıştırın.

## Yöntem 2: SQL ile (opsiyonel)

Supabase **SQL Editor**’da aşağıdaki komutu çalıştırabilirsiniz. Şifre kısmını kendi projenize uygun şekilde kullanın (Supabase Auth şifreyi kendisi hash’ler, bu yüzden genelde Dashboard üzerinden eklemek daha doğrudur).

```sql
-- Not: Yeni kullanıcı oluşturmak için Supabase Dashboard → Authentication → Add user kullanmanız daha güvenlidir.
-- Bu SQL sadece bilgi amaçlıdır; şifre hash'i projeden projeye farklı olabilir.
```

Demo için pratik yol: **Dashboard → Authentication → Add user** ile `demo@kpss.app` / `Demo123!` ekleyin.
