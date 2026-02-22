-- Reklam alanları: admin panelinden aç/kapa, kendi resim veya AdMob
-- Supabase SQL Editor'da çalıştırın. is_admin() tanımlı olmalı (supabase-admin.sql).

CREATE TABLE IF NOT EXISTS public.ad_slots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  ad_type TEXT NOT NULL DEFAULT 'image' CHECK (ad_type IN ('image', 'admob')),
  image_url TEXT,
  link_url TEXT,
  admob_unit_id TEXT,
  is_active BOOLEAN DEFAULT true,
  sort_order INT DEFAULT 0,
  width_px INT,
  height_px INT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_ad_slots_active ON public.ad_slots(is_active);
CREATE INDEX IF NOT EXISTS idx_ad_slots_slug ON public.ad_slots(slug);

-- Herkes (anon + authenticated) sadece aktif slotları okuyabilsin; admin tümünü okuyup yazabilsin
ALTER TABLE public.ad_slots ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "ad_slots public read active" ON public.ad_slots;
CREATE POLICY "ad_slots public read active" ON public.ad_slots
  FOR SELECT TO anon, authenticated
  USING (is_active = true);

DROP POLICY IF EXISTS "ad_slots admin all" ON public.ad_slots;
CREATE POLICY "ad_slots admin all" ON public.ad_slots
  FOR ALL TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Seed: Tüm kazanç odaklı reklam alanları (width_px x height_px; null = tam ekran)
INSERT INTO public.ad_slots (slug, name, ad_type, is_active, sort_order, width_px, height_px) VALUES
  ('cards_every_10', 'Bilgi kartları – her 10 kaydırmada reklam', 'image', true, 10, NULL, NULL),
  ('home_banner', 'Anasayfa – alt banner', 'image', true, 20, 320, 50),
  ('subject_list_banner', 'Dersler sayfası – alt banner', 'image', true, 30, 320, 50),
  ('topic_list_banner', 'Konular sayfası – alt banner', 'image', true, 40, 320, 50),
  ('test_banner', 'Test sayfası – alt banner', 'image', true, 50, 320, 50),
  ('saved_banner', 'Kaydedilen sayfası – alt banner', 'image', true, 60, 320, 50),
  ('analiz_banner', 'Analiz sayfası – alt banner', 'image', true, 70, 320, 50)
ON CONFLICT (slug) DO NOTHING;
