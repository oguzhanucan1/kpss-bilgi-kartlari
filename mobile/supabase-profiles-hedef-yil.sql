-- Hesap kurulumu hatası: profiles'da hedef_yil (ve gerekirse username) yoksa ekler
-- Supabase Dashboard → SQL Editor'da çalıştırın.

-- hedef_yil sütunu yoksa ekle
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'hedef_yil'
  ) THEN
    ALTER TABLE public.profiles ADD COLUMN hedef_yil TEXT;
  END IF;
END $$;

-- username sütunu yoksa ekle (hesap kurulumu bunu da kullanıyor)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'username'
  ) THEN
    ALTER TABLE public.profiles ADD COLUMN username TEXT UNIQUE;
  END IF;
END $$;
