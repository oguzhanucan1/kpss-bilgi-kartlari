-- Admin paneli için: profiles.role ve sadece adminin yazabildiği RLS politikaları
-- Supabase Dashboard → SQL Editor'da çalıştırın. Mobil uygulama aynı Supabase projesini kullanır.

-- 1) profiles tablosuna role sütunu (yoksa ekle)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'role'
  ) THEN
    ALTER TABLE public.profiles ADD COLUMN role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin'));
  END IF;
END $$;

-- 2) Admin kontrolü için fonksiyon (RLS politikalarında kullanılacak)
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'
  );
$$;

-- 3) İlk admin kullanıcıyı atamak için (e-posta ile - kendi e-postanızı yazın, bir kez çalıştırın)
-- UPDATE public.profiles SET role = 'admin' WHERE id = (SELECT id FROM auth.users WHERE email = 'ADMIN_EPOSTA@example.com' LIMIT 1);

-- 4) Dersler: admin tüm işlemler
DROP POLICY IF EXISTS "subjects admin all" ON public.subjects;
CREATE POLICY "subjects admin all" ON public.subjects
  FOR ALL TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- 5) Konular: admin tüm işlemler
DROP POLICY IF EXISTS "topics admin all" ON public.topics;
CREATE POLICY "topics admin all" ON public.topics
  FOR ALL TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- 6) Flash cards: admin tüm işlemler
DROP POLICY IF EXISTS "flash_cards admin all" ON public.flash_cards;
CREATE POLICY "flash_cards admin all" ON public.flash_cards
  FOR ALL TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- 7) Motivasyon sözleri: admin tüm işlemler (anon/authenticated okur, sadece admin yazar)
DROP POLICY IF EXISTS "motivation_quotes admin all" ON public.motivation_quotes;
CREATE POLICY "motivation_quotes admin all" ON public.motivation_quotes
  FOR ALL TO authenticated
  USING (public.is_admin() OR is_active = true)
  WITH CHECK (public.is_admin());

-- 8) Duyurular: admin tüm işlemler
DROP POLICY IF EXISTS "announcements admin all" ON public.announcements;
CREATE POLICY "announcements admin all" ON public.announcements
  FOR ALL TO authenticated
  USING (public.is_admin() OR is_active = true)
  WITH CHECK (public.is_admin());

-- Not: subjects, topics, flash_cards için mevcut "read" politikaları zaten var; 
-- "admin all" FOR ALL ile select de kapsanır. Eğer "read" politikaları sadece SELECT ise 
-- ve "admin all" sadece INSERT/UPDATE/DELETE yapıyorsa çakışma olabilir. 
-- Supabase'de aynı tabloda birden fazla policy aynı işlem için geçerli olabilir (OR).
-- Burada FOR ALL + USING (is_admin()) admin'e her şeyi veriyor. Normal kullanıcılar 
-- için mevcut "Subjects read" vb. politikalar SELECT'e izin veriyor. 
-- Admin hem okuyup hem yazacak. Eğer "subjects" tablosunda sadece "Subjects read" 
-- varsa, admin'in INSERT/UPDATE/DELETE yapması için yukarıdaki "subjects admin all" 
-- gerekli. SELECT için admin de "Subjects read" ile okuyabilir. Tamam.
