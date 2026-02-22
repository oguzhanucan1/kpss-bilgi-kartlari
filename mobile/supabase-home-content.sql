-- Anasayfa: motivasyon sözleri ve duyurular
-- Supabase Dashboard → SQL Editor'da çalıştırın.

-- 1) Motivasyon sözleri
CREATE TABLE IF NOT EXISTS motivation_quotes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  text TEXT NOT NULL,
  sort_order INT NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_motivation_quotes_active_order ON motivation_quotes(is_active, sort_order);

ALTER TABLE motivation_quotes ENABLE ROW LEVEL SECURITY;

-- Herkes (giriş yapmış/giriş yapmamış) okuyabilsin
CREATE POLICY "motivation_quotes select all" ON motivation_quotes FOR SELECT TO anon, authenticated USING (is_active = true);

-- Örnek veri (tablo boşsa ekle; script'i tekrar çalıştırırsanız çoğaltmaz)
INSERT INTO motivation_quotes (text, sort_order)
SELECT * FROM (VALUES
  ('Başarı, küçük çabaların günlük tekrarıdır.'::TEXT, 1),
  ('Bugün oku, yarın lider ol.', 2),
  ('Disiplin, motivasyondan daha güçlüdür.', 3),
  ('Her kart, hedefe bir adım daha yakınsın.', 4),
  ('KPSS yolunda azimle ilerleyen kazanır.', 5),
  ('Küçük adımlar, büyük başarılara götürür.', 6)
) AS v(text, sort_order)
WHERE (SELECT count(*) FROM motivation_quotes) = 0;

-- 2) Duyurular
CREATE TABLE IF NOT EXISTS announcements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  excerpt TEXT,
  body TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_announcements_active_created ON announcements(is_active, created_at DESC);

ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "announcements select all" ON announcements FOR SELECT TO anon, authenticated USING (is_active = true);

-- Örnek duyurular (tablo boşsa ekle)
INSERT INTO announcements (title, excerpt, created_at)
SELECT * FROM (VALUES
  ('Yeni konular eklendi'::TEXT, 'Tarih ve Coğrafya derslerine yeni kartlar yüklendi.'::TEXT, (now() - interval '1 day')::TIMESTAMPTZ),
  ('Bakım çalışması', 'Yarın 02:00–04:00 arası kısa süreli bakım yapılacaktır.', (now() - interval '2 days')::TIMESTAMPTZ)
) AS v(title, excerpt, created_at)
WHERE (SELECT count(*) FROM announcements) = 0;
