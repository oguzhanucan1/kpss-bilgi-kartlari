# Push bildirim sunucusu (Firebase Admin + Expo)

Admin panelinden push bildirim göndermek için bu Node.js sunucusunu kullanın. Firebase Admin (FCM) ve Expo Push API ile gönderim yapar.

## Kurulum

1. Bağımlılıkları yükleyin:
   ```bash
   cd server && npm install
   ```

2. **Firebase service account:** Firebase Console → Proje ayarları → Service hesaplar → Yeni özel anahtar oluştur. İndirdiğiniz JSON dosyasını `server/serviceAccountKey.json` olarak bu klasöre kopyalayın.
   - Alternatif: `GOOGLE_APPLICATION_CREDENTIALS` ile dosya yolunu verin.

3. `.env` oluşturun (`.env.example` kopyalayıp doldurun):
   - `SUPABASE_URL` – Supabase proje URL
   - `SUPABASE_SERVICE_ROLE_KEY` – Service role key (Supabase Dashboard → Ayarlar → API)

## Çalıştırma

```bash
npm start
# veya geliştirme (otomatik yeniden başlatma)
npm run dev
```

Sunucu varsayılan olarak `http://localhost:4000` adresinde çalışır.

## Admin paneli bağlama

Admin panelinde (`.env` veya `.env.local`):

```env
VITE_PUSH_API_URL=http://localhost:4000/api/send-push
```

Ardından admin panelinde **Push Bildirim** sayfasından bildirim gönderebilirsiniz. Oturum açmış admin kullanıcısı ile istek atılır.

## API

- **POST /api/send-push**
  - Header: `Authorization: Bearer <supabase_access_token>`
  - Body: `{ "title": "Başlık", "body": "Mesaj" }`
  - Yanıt: `{ "sent", "failed", "total" }`
