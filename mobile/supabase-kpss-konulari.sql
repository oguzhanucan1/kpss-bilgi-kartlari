-- KPSS Ders ve Konu Başlıkları
-- Supabase Dashboard → SQL Editor'da bu dosyayı çalıştırın.
-- Önce subjects ve topics tablolarının var olduğundan emin olun (supabase-schema.sql).

-- 1. Dersleri ekle (varsa atla)
INSERT INTO subjects (name, slug, icon_emoji, sort_order)
VALUES
  ('Türkçe', 'turkce', '📖', 1),
  ('Tarih', 'tarih', '📜', 2),
  ('Coğrafya', 'cografya', '🌍', 3),
  ('Vatandaşlık', 'vatandaslik', '⚖️', 4)
ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name, sort_order = EXCLUDED.sort_order;

-- 2. Konuları ekle (subject slug ile eşleştirerek)
-- Türkçe konuları
INSERT INTO topics (subject_id, name, slug, sort_order)
SELECT id, v.name, v.slug, v.ord FROM subjects s,
(VALUES
  ('turkce', 'Sözcükte Anlam', 'sozcukte-anlam', 1),
  ('turkce', 'Cümlenin Anlam', 'cumlenin-anlam', 2),
  ('turkce', 'Sözcük Türleri', 'sozcuk-turleri', 3),
  ('turkce', 'Sözcükte Yapı', 'sozcukte-yapi', 4),
  ('turkce', 'Cümlenin Ögeleri', 'cumlenin-ogeleri', 5),
  ('turkce', 'Ses Olayları', 'ses-olaylari', 6),
  ('turkce', 'Yazım Kuralları', 'yazim-kurallari', 7),
  ('turkce', 'Noktalama İşaretleri', 'noktalama-isaretleri', 8),
  ('turkce', 'Paragrafta Anlam', 'paragrafta-anlam', 9),
  ('turkce', 'Paragrafta Anlatım Yolları, Biçimleri', 'paragrafta-anlatim-yollari-bicimleri', 10),
  ('turkce', 'Sözel Mantık', 'sozel-mantik', 11)
) AS v(subject_slug, name, slug, ord)
WHERE s.slug = v.subject_slug
ON CONFLICT (subject_id, slug) DO UPDATE SET name = EXCLUDED.name, sort_order = EXCLUDED.sort_order;

-- Tarih konuları
INSERT INTO topics (subject_id, name, slug, sort_order)
SELECT id, v.name, v.slug, v.ord FROM subjects s,
(VALUES
  ('tarih', 'İslamiyet''ten Önceki Türk Devletleri', 'islamiyet-oncesi-turk-devletleri', 1),
  ('tarih', 'İlk Müslüman Türk Devletleri', 'ilk-musluman-turk-devletleri', 2),
  ('tarih', 'Osmanlı Devleti Siyasi', 'osmanli-devleti-siyasi', 3),
  ('tarih', 'Osmanlı Devleti Kültür ve Uygarlık', 'osmanli-devleti-kultur-ve-uygarlik', 4),
  ('tarih', 'Kurtuluş Savaşı Hazırlık Dönemi', 'kurtulus-savasi-hazirlik-donemi', 5),
  ('tarih', 'Kurtuluş Savaşı Cepheleri', 'kurtulus-savasi-cepheleri', 6),
  ('tarih', 'Devrim Tarihi', 'devrim-tarihi', 7),
  ('tarih', 'Atatürk Dönemi İç ve Dış Politika', 'ataturk-donemi-ic-ve-dis-politika', 8),
  ('tarih', 'Atatürk İlkeleri Konusu', 'ataturk-ilkeleri-konusu', 9),
  ('tarih', 'Çağdaş Türk ve Dünya Tarihi', 'cagdas-turk-ve-dunya-tarihi', 10)
) AS v(subject_slug, name, slug, ord)
WHERE s.slug = v.subject_slug
ON CONFLICT (subject_id, slug) DO UPDATE SET name = EXCLUDED.name, sort_order = EXCLUDED.sort_order;

-- Coğrafya konuları
INSERT INTO topics (subject_id, name, slug, sort_order)
SELECT id, v.name, v.slug, v.ord FROM subjects s,
(VALUES
  ('cografya', 'Türkiye Coğrafi Konumu', 'turkiye-cografi-konumu', 1),
  ('cografya', 'Türkiye''nin Yer Şekilleri Su Örtüsü', 'turkiye-yer-sekillleri-su-ortusu', 2),
  ('cografya', 'Türkiye''nin İklimi ve Bitki Örtüsü', 'turkiye-iklimi-ve-bitki-ortusu', 3),
  ('cografya', 'Toprak ve Doğa Çevre', 'toprak-ve-doga-cevre', 4),
  ('cografya', 'Türkiye''nin Beşeri Coğrafyası', 'turkiye-beseri-cografyasi', 5),
  ('cografya', 'Tarım Konusu', 'tarim-konusu', 6),
  ('cografya', 'Madenler ve Enerji Kaynakları', 'madenler-ve-enerji-kaynaklari', 7),
  ('cografya', 'Sanayi Konusu', 'sanayi-konusu', 8),
  ('cografya', 'Ulaşım Konusu', 'ulasim-konusu', 9),
  ('cografya', 'Turizm Konusu', 'turizm-konusu', 10)
) AS v(subject_slug, name, slug, ord)
WHERE s.slug = v.subject_slug
ON CONFLICT (subject_id, slug) DO UPDATE SET name = EXCLUDED.name, sort_order = EXCLUDED.sort_order;

-- Vatandaşlık konuları
INSERT INTO topics (subject_id, name, slug, sort_order)
SELECT id, v.name, v.slug, v.ord FROM subjects s,
(VALUES
  ('vatandaslik', 'Hukuka Giriş', 'hukuka-giris', 1),
  ('vatandaslik', 'Genel Esaslar', 'genel-esaslar', 2),
  ('vatandaslik', 'Yasama', 'yasama', 3),
  ('vatandaslik', 'Yürütme', 'yurutme', 4),
  ('vatandaslik', 'İdari Yapı', 'idari-yapi', 5),
  ('vatandaslik', 'Güncel Olaylar', 'guncel-olaylar', 6)
) AS v(subject_slug, name, slug, ord)
WHERE s.slug = v.subject_slug
ON CONFLICT (subject_id, slug) DO UPDATE SET name = EXCLUDED.name, sort_order = EXCLUDED.sort_order;
