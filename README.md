# KPSS Bilgi Kartları

TikTok tarzı dikey kaydırmalı KPSS bilgi kartları ve test mobil uygulaması (Expo + Supabase).

## Yapı

- **mobile/** – Expo (React Native) uygulaması
  - Giriş / Kayıt (Supabase Auth)
  - Ders seçimi → Konu seçimi → Bilgi kartları → Test
- **supabase-schema.sql** – Veritabanı şeması (Supabase SQL Editor’da çalıştırın)

## Hızlı başlangıç

1. Supabase’de proje oluşturup **supabase-schema.sql** çalıştırın.
2. `mobile/.env` oluşturup `EXPO_PUBLIC_SUPABASE_URL` ve `EXPO_PUBLIC_SUPABASE_ANON_KEY` ekleyin.
3. `cd mobile` → `npm install` → `npm start` → Expo Go ile açın.

Detaylı adımlar için **CALISTIRMA.md** dosyasına bakın.
