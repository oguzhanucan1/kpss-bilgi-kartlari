# Kart resimleri için Supabase Storage

Admin panelinde kart içeriğine resim ekleyebilmek için Supabase’te bir bucket tanımlanıp erişim politikaları (RLS) eklenmelidir. Storage, [Row Level Security (RLS)](https://supabase.com/docs/guides/database/postgres/row-level-security) ile korunur.

---

## 1. Bucket oluşturma

1. **Supabase Dashboard**’da projenizi açın.
2. Sol menüden **Storage**’a tıklayın.
3. **New bucket** (veya **Create a new bucket**) butonuna tıklayın.
4. **Name:** `card-images` yazın.
5. **Public bucket** seçeneğini işaretleyin (uygulama resimleri bu URL ile herkese açık okunacak).
6. **Create bucket** (veya **Save**) ile kaydedin.

Public bucket’ta indirme (SELECT) için ek politika gerekmez; yükleme (INSERT) için aşağıdaki politikayı eklemeniz gerekir.

---

## 2. Yükleme (INSERT) politikası ekleme

Storage’da işlemler `storage.objects` tablosu üzerinde RLS ile kontrol edilir. Varsayılan olarak hiçbir yükleme izni yoktur; politikayı siz eklemelisiniz.

### Yöntem A: SQL Editor ile (önerilen)

Projede hazır sorgu dosyası var: **`admin/card-images-storage-policy.sql`**. İçeriğini kopyalayıp SQL Editor’da çalıştırabilirsiniz.

1. Sol menüden **SQL Editor**’ı açın.
2. **New query** ile yeni sorgu açın.
3. Aşağıdaki SQL’i yapıştırın (veya `card-images-storage-policy.sql` dosyasından alın; bucket adı `card-images` ise aynen kullanın):

```sql
-- Giriş yapmış (authenticated) kullanıcılar card-images bucket'ına dosya yükleyebilir
create policy "Authenticated users can upload to card-images"
on storage.objects
for insert
to authenticated
with check ( bucket_id = 'card-images' );
```

4. **Run** (veya Ctrl+Enter) ile çalıştırın.

### Yöntem B: Dashboard üzerinden Storage Policies

1. Sol menüden **Storage**’a gidin.
2. **Policies** sekmesine tıklayın (Storage sayfasında üstte veya yan menüde).
3. **New policy** veya **Create policy** seçin.
4. Tablo olarak **storage.objects** (veya “Objects”) seçin.
5. **Policy name:** örn. `Authenticated upload to card-images`
6. **Allowed operation:** **INSERT** seçin.
7. **Target roles:** **authenticated** seçin.
8. **WITH CHECK expression** alanına şunu yazın: `bucket_id = 'card-images'`
9. Politikayı kaydedin.

*(Arayüz metinleri Supabase sürümüne göre “Add policy”, “WITH CHECK” vb. şekilde olabilir; mantık aynıdır.)*

---

## 3. Kontrol

- Admin panele giriş yapıp Kartlar sayfasında bir kartın içeriğinde **resim** ikonuna tıklayın, bir görsel seçip yükleyin.
- Hata alırsanız: bucket adının tam olarak `card-images` olduğunu ve yukarıdaki INSERT politikasının tanımlı olduğunu kontrol edin.

Bu bucket ve politika tanımlı olduktan sonra admin panelindeki “Kart içeriği” editöründe resim butonuna tıklayıp yüklediğiniz görseller kartlara gömülür ve uygulamada görünür.
