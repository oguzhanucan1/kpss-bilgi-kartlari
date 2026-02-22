-- Kartları tek alan (content) yapmak için: ön/arka yüz kaldırılıyor
-- Mevcut veritabanında front_text ve back_text varsa bu migration'ı çalıştırın.
-- Supabase SQL Editor'da çalıştırın.

-- 1) content sütunu yoksa ekle
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'flash_cards' AND column_name = 'content'
  ) THEN
    ALTER TABLE public.flash_cards ADD COLUMN content TEXT;
  END IF;
END $$;

-- 2) front_text/back_text varsa content'e birleştir
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'flash_cards' AND column_name = 'front_text') THEN
    UPDATE public.flash_cards SET content = COALESCE(front_text, '') || E'\n\n' || COALESCE(back_text, '') WHERE content IS NULL;
    ALTER TABLE public.flash_cards ALTER COLUMN content SET NOT NULL;
    ALTER TABLE public.flash_cards DROP COLUMN IF EXISTS front_text;
    ALTER TABLE public.flash_cards DROP COLUMN IF EXISTS back_text;
  ELSIF (SELECT content FROM public.flash_cards LIMIT 1) IS NULL THEN
    UPDATE public.flash_cards SET content = '' WHERE content IS NULL;
    ALTER TABLE public.flash_cards ALTER COLUMN content SET NOT NULL;
  END IF;
END $$;
