-- Her konu başlığına 10 örnek bilgi kartı ekler (tek içerik alanı).
-- Önce supabase-kpss-konulari.sql ile ders ve konuları oluşturun, sonra bu dosyayı çalıştırın.
-- Veritabanında flash_cards tablosu "content" sütununa sahip olmalı (supabase-flash-cards-single-content.sql veya güncel şema).

WITH kart_sablonu AS (
  SELECT * FROM (VALUES
    (1, 'Bu konuda temel kavram 1 nedir? Örnek açıklama ve cevap 1. İçeriği düzenleyebilirsiniz.'),
    (2, 'Bu konuda temel kavram 2 nedir? Örnek açıklama ve cevap 2. İçeriği düzenleyebilirsiniz.'),
    (3, 'Bu konuda temel kavram 3 nedir? Örnek açıklama ve cevap 3. İçeriği düzenleyebilirsiniz.'),
    (4, 'Bu konuda temel kavram 4 nedir? Örnek açıklama ve cevap 4. İçeriği düzenleyebilirsiniz.'),
    (5, 'Bu konuda temel kavram 5 nedir? Örnek açıklama ve cevap 5. İçeriği düzenleyebilirsiniz.'),
    (6, 'Bu konuda temel kavram 6 nedir? Örnek açıklama ve cevap 6. İçeriği düzenleyebilirsiniz.'),
    (7, 'Bu konuda temel kavram 7 nedir? Örnek açıklama ve cevap 7. İçeriği düzenleyebilirsiniz.'),
    (8, 'Bu konuda temel kavram 8 nedir? Örnek açıklama ve cevap 8. İçeriği düzenleyebilirsiniz.'),
    (9, 'Bu konuda temel kavram 9 nedir? Örnek açıklama ve cevap 9. İçeriği düzenleyebilirsiniz.'),
    (10, 'Bu konuda temel kavram 10 nedir? Örnek açıklama ve cevap 10. İçeriği düzenleyebilirsiniz.')
  ) AS v(ord, content)
),
konu_listesi AS (
  SELECT t.id AS topic_id
  FROM topics t
  JOIN subjects s ON s.id = t.subject_id
  WHERE (s.slug, t.slug) IN (
    ('turkce', 'sozcukte-anlam'),
    ('turkce', 'cumlenin-anlam'),
    ('turkce', 'sozcuk-turleri'),
    ('turkce', 'sozcukte-yapi'),
    ('turkce', 'cumlenin-ogeleri'),
    ('turkce', 'ses-olaylari'),
    ('turkce', 'yazim-kurallari'),
    ('turkce', 'noktalama-isaretleri'),
    ('turkce', 'paragrafta-anlam'),
    ('turkce', 'paragrafta-anlatim-yollari-bicimleri'),
    ('turkce', 'sozel-mantik'),
    ('tarih', 'islamiyet-oncesi-turk-devletleri'),
    ('tarih', 'ilk-musluman-turk-devletleri'),
    ('tarih', 'osmanli-devleti-siyasi'),
    ('tarih', 'osmanli-devleti-kultur-ve-uygarlik'),
    ('tarih', 'kurtulus-savasi-hazirlik-donemi'),
    ('tarih', 'kurtulus-savasi-cepheleri'),
    ('tarih', 'devrim-tarihi'),
    ('tarih', 'ataturk-donemi-ic-ve-dis-politika'),
    ('tarih', 'ataturk-ilkeleri-konusu'),
    ('tarih', 'cagdas-turk-ve-dunya-tarihi'),
    ('cografya', 'turkiye-cografi-konumu'),
    ('cografya', 'turkiye-yer-sekillleri-su-ortusu'),
    ('cografya', 'turkiye-iklimi-ve-bitki-ortusu'),
    ('cografya', 'toprak-ve-doga-cevre'),
    ('cografya', 'turkiye-beseri-cografyasi'),
    ('cografya', 'tarim-konusu'),
    ('cografya', 'madenler-ve-enerji-kaynaklari'),
    ('cografya', 'sanayi-konusu'),
    ('cografya', 'ulasim-konusu'),
    ('cografya', 'turizm-konusu'),
    ('vatandaslik', 'hukuka-giris'),
    ('vatandaslik', 'genel-esaslar'),
    ('vatandaslik', 'yasama'),
    ('vatandaslik', 'yurutme'),
    ('vatandaslik', 'idari-yapi'),
    ('vatandaslik', 'guncel-olaylar')
  )
)
INSERT INTO flash_cards (topic_id, content, sort_order)
SELECT kl.topic_id, ks.content, ks.ord
FROM konu_listesi kl
CROSS JOIN kart_sablonu ks;
