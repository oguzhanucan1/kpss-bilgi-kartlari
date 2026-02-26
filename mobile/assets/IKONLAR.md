# Uygulama İkonları

İkonları değiştirmek için aşağıdaki dosyaları `mobile/assets/` klasörüne koyun:

| Dosya | Açıklama | Önerilen boyut |
|-------|----------|----------------|
| `icon.png` | Ana uygulama ikonu (iOS/Android) | **1024×1024** px |
| `adaptive-icon.png` | Android adaptif ikon (ön plan) | **1024×1024** px (önemli kısım ortada %66 alanda) |
| `splash-icon.png` | Açılış (splash) ekranı görseli | **1024×1024** px veya oranlı |
| `favicon.png` | Web favicon | **48×48** px |

## Hızlı adımlar

1. İkonlarınızı yukarıdaki boyutlarda hazırlayın (PNG, şeffaf arka plan kullanabilirsiniz).
2. Dosyaları `mobile/assets/` klasörüne kopyalayın; isimler tam olarak yukarıdaki gibi olmalı.
3. Projeyi yeniden derleyin:
   - Yerel: `npx expo start` ile test, `eas build` ile yeni APK/IPA.

Android adaptif ikonda arka plan rengi `app.json` içinde `android.adaptiveIcon.backgroundColor` ile ayarlanır (şu an `#ffffff`).
