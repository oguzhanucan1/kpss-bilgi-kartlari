# KPSS Bilgi Kartları – Çalıştırma

## 1. Supabase

- [Supabase Dashboard](https://supabase.com/dashboard) → projenizi seçin (veya yeni proje açın).
- **SQL Editor** → Bu projedeki **supabase-schema.sql** dosyasının içeriğini yapıştırıp çalıştırın.
- **Authentication → Providers** → Email açık olsun.

## 2. Mobil uygulama (Expo)

### Bağımlılıklar

```bash
cd C:\Users\PC\Desktop\pro\kpss-bilgi-karti\mobile
npm install
```

### Ortam değişkenleri

`mobile` klasöründe `.env` dosyası oluşturun:

```bash
cd mobile
copy .env.example .env
```

`.env` içeriği (Supabase Dashboard → Settings → API’den alın):

```
EXPO_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=anon-public-key
```

### Çalıştırma

```bash
cd mobile
npm start
```

Ardından **Expo Go** ile QR kodu tarayın veya emülatörde açın.

## 3. Expo Go ile açma

1. Telefona **Expo Go** uygulamasını kurun (Google Play / App Store).
2. Bilgisayar ve telefon **aynı Wi‑Fi** ağında olsun.
3. `npm start` sonrası çıkan **QR kodu** Expo Go (veya iPhone’da Kamera) ile tarayın.
4. Bağlantı olmazsa: `npx expo start --tunnel` deneyin.

## Özet

1. Supabase’de **supabase-schema.sql** çalıştırın.
2. **mobile/.env** oluşturup Supabase URL ve anon key yazın.
3. `cd mobile` → `npm start` → Expo Go ile QR tara.
