# APK Çıkarma Rehberi

## Yöntem 1: EAS Build (Önerilen – bulutta derleme)

Expo’nun sunucusunda APK üretir; Android Studio kurmana gerek kalmaz.

### 1. EAS CLI kur

```bash
npm install -g eas-cli
```

### 2. Expo hesabına giriş yap

```bash
eas login
```

(Expo hesabın yoksa [expo.dev](https://expo.dev) üzerinden ücretsiz kayıt ol.)

### 3. Projeyi EAS’e bağla (ilk seferde)

`mobile` klasöründe:

```bash
cd mobile
eas build:configure
```

İsterse “All done” deyip çık.

### 4. Supabase’i APK’ya gömme (EAS Secrets)

APK’da “Ayarlar Gerekli” hatası almamak için Supabase bilgilerini **build sırasında** vermen gerekir. `.env` dosyası EAS sunucusuna gönderilmez; bu yüzden EAS’ta **Secret** tanımla.

**Seçenek A – Komut satırı (mobile klasöründe):**

```bash
eas secret:create --name EXPO_PUBLIC_SUPABASE_URL --value "https://XXXX.supabase.co" --type string
eas secret:create --name EXPO_PUBLIC_SUPABASE_ANON_KEY --value "anon-key-buraya" --type string
```

`XXXX` ve `anon-key-buraya` yerine kendi Supabase proje URL’ini ve anon (public) key’ini yaz (Supabase Dashboard → Settings → API).

**Seçenek B – Expo Dashboard:**

1. [expo.dev](https://expo.dev) → Projen (mobile) → **Secrets**
2. **Create secret** ile ekle:
   - `EXPO_PUBLIC_SUPABASE_URL` = `https://xxxx.supabase.co`
   - `EXPO_PUBLIC_SUPABASE_ANON_KEY` = `eyJ...` (anon public key)

### 5. Android APK oluştur

```bash
eas build -p android --profile preview
```

- `preview` profili **APK** üretir (kurulum için uygun).
- Build tamamlanınca Expo sayfasında indirme linki çıkar; APK’yı oradan indirip telefona yükleyebilirsin.

### 6. (İsteğe bağlı) Production AAB (Play Store)

Mağaza için AAB istersen:

```bash
eas build -p android --profile production
```

---

## Yöntem 2: Yerel bilgisayarda APK (gradle)

Android SDK ve JDK kurulu olmalı.

### 1. Native projeyi oluştur

```bash
cd mobile
npx expo prebuild -p android
```

### 2. Release APK derle

**Windows (CMD/PowerShell):**

```bash
cd android
gradlew.bat assembleRelease
```

**macOS/Linux:**

```bash
cd android
./gradlew assembleRelease
```

### 3. APK’nın yeri

- `android/app/build/outputs/apk/release/app-release.apk`

Bu dosyayı telefona atıp kurabilirsin. İmzalama için `android/app/build.gradle` içinde `signingConfigs` tanımlı olmalı (keystore); yoksa “debug” imzalı APK üretmek için `assembleDebug` kullanabilirsin.

---

## Özet

| İhtiyaç              | Komut |
|----------------------|--------|
| Hızlı, kurulumu kolay APK | `eas build -p android --profile preview` |
| Play Store yüklemesi | `eas build -p android --profile production` |
| Kendi bilgisayarında APK | `npx expo prebuild -p android` sonra `gradlew assembleRelease` |

**Önemli (Supabase):** APK’da Supabase çalışsın istiyorsan bu değerleri **mutlaka EAS Secrets** olarak ekle (yukarıdaki “Supabase’i APK’ya gömme” adımı). Yalnızca bilgisayarındaki `.env` yetmez; EAS build sunucusuna `.env` gönderilmez.
