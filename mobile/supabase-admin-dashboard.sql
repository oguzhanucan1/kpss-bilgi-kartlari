-- Dashboard istatistikleri için: admin card_views ve user_progress tablolarını okuyabilsin
-- Supabase SQL Editor'da çalıştırın (is_admin() ve profiles.role tanımlı olmalı).
-- Önce supabase-analytics.sql (card_views) ve supabase-schema.sql (user_progress) çalıştırılmış olmalı.

-- Admin tüm card_views kayıtlarını okuyabilsin (grafik / en çok görüntülenen ders için)
DROP POLICY IF EXISTS "card_views select own" ON public.card_views;
CREATE POLICY "card_views select own" ON public.card_views
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id OR public.is_admin());

-- Admin tüm user_progress kayıtlarını okuyabilsin (test başarı oranı için)
DROP POLICY IF EXISTS "Progress read" ON public.user_progress;
CREATE POLICY "Progress read" ON public.user_progress
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id OR public.is_admin());
