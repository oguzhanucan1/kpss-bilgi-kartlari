-- Admin panelinde tüm kullanıcıları (profiles) listeleyebilmek için
-- Supabase SQL Editor'da çalıştırın.

-- Admin, tüm profilleri okuyabilsin (kullanıcılar sayfası için)
DROP POLICY IF EXISTS "Admin can select all profiles" ON public.profiles;
CREATE POLICY "Admin can select all profiles" ON public.profiles
  FOR SELECT TO authenticated
  USING (public.is_admin());
