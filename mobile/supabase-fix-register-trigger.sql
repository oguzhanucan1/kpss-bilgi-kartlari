-- Kayıt hatası düzeltmesi: Yeni kullanıcı kaydında profiles satırı oluşturan trigger
-- Supabase Dashboard → SQL Editor'da çalıştırın.
-- Sorun: profiles tablosunda username NOT NULL ise eski trigger sadece full_name ekliyordu, INSERT başarısız oluyordu.

-- 1) profiles'da username sütunu yoksa ekle (NOT NULL ise sonra doldurulacak)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'username'
  ) THEN
    ALTER TABLE public.profiles ADD COLUMN username TEXT UNIQUE;
    UPDATE public.profiles SET username = 'user_' || REPLACE(SUBSTRING(id::text FROM 1 FOR 8), '-', '') WHERE username IS NULL;
    ALTER TABLE public.profiles ALTER COLUMN username SET NOT NULL;
  END IF;
END $$;

-- 2) Trigger fonksiyonu: username zorunlu ise e-posta ön ekinden veya benzersiz id'den üret
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  base_username TEXT;
  final_username TEXT;
BEGIN
  -- Benzersiz username: önce e-posta @ öncesi, geçersizse user_<uuid8>
  base_username := LOWER(TRIM(SPLIT_PART(COALESCE(NEW.email, ''), '@', 1)));
  IF base_username = '' OR LENGTH(base_username) < 2 THEN
    base_username := 'user_' || REPLACE(SUBSTRING(NEW.id::text FROM 1 FOR 8), '-', '');
  END IF;
  final_username := base_username;
  -- Çakışma varsa sonuna kısa id ekle
  WHILE EXISTS (SELECT 1 FROM public.profiles WHERE username = final_username) LOOP
    final_username := base_username || '_' || REPLACE(SUBSTRING(NEW.id::text FROM 1 FOR 6), '-', '');
    EXIT;
  END LOOP;

  INSERT INTO public.profiles (id, username, full_name)
  VALUES (
    NEW.id,
    final_username,
    NEW.raw_user_meta_data->>'full_name'
  );
  RETURN NEW;
EXCEPTION
  WHEN unique_violation THEN
    -- username çakışması: sadece id ile dene
    INSERT INTO public.profiles (id, username, full_name)
    VALUES (NEW.id, 'user_' || REPLACE(SUBSTRING(NEW.id::text FROM 1 FOR 8), '-', ''), NEW.raw_user_meta_data->>'full_name');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
