-- Reklam alanları v2: Boyut (width_px, height_px) + kazanç odaklı tüm slotlar
-- Mevcut projede ad_slots zaten varsa sadece bu dosyayı çalıştırın. Yeni kurulumda önce supabase-ad-slots.sql sonra bu.

-- Boyut sütunları (yoksa ekle)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'ad_slots' AND column_name = 'width_px') THEN
    ALTER TABLE public.ad_slots ADD COLUMN width_px INT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'ad_slots' AND column_name = 'height_px') THEN
    ALTER TABLE public.ad_slots ADD COLUMN height_px INT;
  END IF;
END $$;

-- Mevcut cards_every_10 için boyut güncelle (tam ekran = null)
UPDATE public.ad_slots SET width_px = NULL, height_px = NULL WHERE slug = 'cards_every_10';

-- Kazanç odaklı tüm reklam alanları (slug, name, boyut: width_px x height_px, sort_order)
-- 320x50 = Mobil banner (yüksek gösterim), null = tam ekran / interstisyel
INSERT INTO public.ad_slots (slug, name, ad_type, is_active, sort_order, width_px, height_px) VALUES
  ('home_banner', 'Anasayfa – alt banner', 'image', true, 20, 320, 50),
  ('subject_list_banner', 'Dersler sayfası – alt banner', 'image', true, 30, 320, 50),
  ('topic_list_banner', 'Konular sayfası – alt banner', 'image', true, 40, 320, 50),
  ('test_banner', 'Test sayfası – alt banner', 'image', true, 50, 320, 50),
  ('saved_banner', 'Kaydedilen sayfası – alt banner', 'image', true, 60, 320, 50),
  ('analiz_banner', 'Analiz sayfası – alt banner', 'image', true, 70, 320, 50)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  width_px = EXCLUDED.width_px,
  height_px = EXCLUDED.height_px,
  sort_order = EXCLUDED.sort_order,
  updated_at = now();
