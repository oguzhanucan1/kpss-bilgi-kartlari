# Push Bildirim Rehberi – Kullanıcılara Nasıl Bildirim Atılır?

Bu rehber, KPSS Bilgi Kartı projesinde push bildirimlerin çalışması ve admin panelinden kullanıcılara nasıl bildirim gönderileceğini adım adım anlatır.

---

## 1. Sistem nasıl çalışıyor?

1. **Mobil uygulama:** Kullanıcı giriş yaptıktan sonra uygulama bildirim izni ister. İzin verilirse **Expo Push Token** alınır ve Supabase `push_tokens` tablosuna kaydedilir.
2. **Admin paneli:** “Push bildirim gönder” formunda başlık ve mesaj girilir; istek **Supabase Edge Function** `send-push` veya Netlify proxy üzerinden gönderilir.
3. **Edge Function:** Admin oturumunu doğrular, `push_tokens` tablosundaki tüm token’ları alır ve **Expo Push API** (ve varsa FCM) ile bildirimi gönderir.

**Önemli:** Sadece **Expo token** kullanıyorsanız **Firebase (FCM) ayarı zorunlu değildir**. Expo token’lar için Edge Function doğrudan `exp.host` API’sini kullanır.

---

## 2. Ön koşullar (bir kez yapılır)

### 2.1 Supabase’de tablolar ve Edge Function

- `push_tokens`, `app_settings`, `push_logs` tabloları ve RLS politikaları tanımlı olmalı.  
  → `mobile/supabase-fcm-push.sql` dosyasını Supabase SQL Editor’da çalıştırın.
- `profiles` tablosunda admin kullanıcının `role = 'admin'` olmalı.
- **Supabase Edge Function** `send-push` deploy edilmiş olmalı:
  ```bash
  supabase functions deploy send-push
  ```

### 2.2 Admin paneli API adresi

Admin, bildirim gönderirken şu adresi kullanır:

- **Varsayılan:** `/.netlify/functions/send-push` (Netlify’da `send-push` fonksiyonu deploy edilmişse).
- **Doğrudan Supabase (önerilen):** Netlify 404 veriyorsa veya Netlify kullanmıyorsanız admin `.env` dosyasına ekleyin:
  ```env
  VITE_PUSH_API_URL=https://PROJE_REF.supabase.co/functions/v1/send-push
  ```
  `PROJE_REF` yerine Supabase proje referansınızı yazın (Dashboard → Project Settings → API → Project URL’deki alt alan adı).

---

## 3. Kullanıcılara push bildirim atma adımları

### Adım 1: Kullanıcıların token kaydetmesi

Bildirim alacak her kullanıcı en az bir kez:

1. Mobil uygulamayı (APK veya development build) açar.
2. Giriş yapar.
3. Bildirim iznini **İzin ver** ile onaylar.

Bu sırada uygulama Expo push token’ı alıp `push_tokens` tablosuna yazar. **Token kaydı olmayan kullanıcıya bildirim gitmez.**

- Geliştirme ortamında: `npx expo start` ile çalıştırıp fiziksel cihazda test edebilirsiniz.
- Yayın APK: EAS build ile üretilen APK’yı kullanıcıya dağıtın; aynı akışla token kaydedilir.

### Adım 2: Admin panelinde oturum

1. Admin panelinde (Netlify veya kendi domain’iniz) **admin hesabıyla** giriş yapın.
2. “Oturum sona erdi” veya 401 alıyorsanız: **Çıkış yapıp tekrar giriş yapın** (refresh token yenilenir).

### Adım 3: Bildirim gönderme

1. Admin panelinde **Push Bildirimler** sayfasına gidin.
2. **Başlık** ve **Mesaj** alanlarını doldurun.
3. **Gönder** butonuna tıklayın.

Başarılı olursa örneğin “X cihaza bildirim gönderildi / Y hedef” mesajı görünür. **Gönderim istatistikleri** tablosunda kayıt oluşur.

---

## 4. Sık karşılaşılan sorunlar ve çözümleri

| Sorun | Olası neden | Çözüm |
|-------|-------------|--------|
| “Kayıtlı cihaz yok” / 0 hedef | `push_tokens` tablosunda kayıt yok | Kullanıcıların uygulamayı açıp giriş yapması ve bildirim izni vermesi gerekir. Supabase Table Editor’da `push_tokens`’a bakın. |
| 404 (API bulunamadı) | Netlify’da `send-push` yok veya farklı URL | Admin `.env`’e `VITE_PUSH_API_URL=https://PROJE_REF.supabase.co/functions/v1/send-push` ekleyip admin’i yeniden build edin. |
| 401 / “Oturum sona erdi” | Admin refresh token geçersiz | Admin panelinde çıkış yapıp tekrar giriş yapın. |
| 403 “Sadece admin bildirim gönderebilir” | Giriş yapan kullanıcı admin değil | `profiles` tablosunda ilgili kullanıcının `role = 'admin'` olduğundan emin olun. |
| Gönderildi görünüyor ama cihaza düşmüyor | Expo token geçersiz / cihaz bildirim kapalı | Uygulamanın EAS ile build edildiğinden ve `app.config.js` içinde `extra.eas.projectId` tanımlı olduğundan emin olun. Cihazda bildirimlerin kapalı olmadığını kontrol edin. |

### Token’ların kontrolü

- Supabase Dashboard → **Table Editor** → `push_tokens`: Kaç kayıt var, `token_type` değeri `expo` mu kontrol edin.
- Admin panelinde gönderim sonrası **Gönderim istatistikleri** tablosunda `total_recipients`, `success_count`, `failed_count` değerlerine bakın.

---

## 5. Özet checklist

- [ ] Supabase’de `push_tokens`, `app_settings`, `push_logs` ve RLS var.
- [ ] `send-push` Edge Function deploy edildi.
- [ ] Admin kullanıcı `profiles.role = 'admin'`.
- [ ] Admin paneli `VITE_PUSH_API_URL` ile doğru Edge Function URL’sine istek atıyor (veya Netlify proxy çalışıyor).
- [ ] Kullanıcılar uygulamada giriş yapıp bildirim izni vermiş (en az bir token `push_tokens`’ta).
- [ ] Admin panelinde güncel oturumla “Push bildirim gönder” formu kullanılıyor.

Bu adımlar tamamsa, “Push bildirim gönder” ile kayıtlı tüm cihazlara bildirim gider.
