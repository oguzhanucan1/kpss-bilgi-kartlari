-- Kart resimleri bucket'ı (card-images) için yükleme politikası
-- Supabase Dashboard → SQL Editor'da bu dosyayı açıp çalıştırın.
-- Önce Storage'dan "card-images" adında public bucket oluşturmanız gerekir.

-- Giriş yapmış (authenticated) kullanıcılar card-images bucket'ına dosya yükleyebilir
create policy "Authenticated users can upload to card-images"
on storage.objects
for insert
to authenticated
with check ( bucket_id = 'card-images' );
