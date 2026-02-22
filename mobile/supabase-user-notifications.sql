-- Kullanıcıların gördüğü bildirim listesi ve okundu işareti
-- Supabase SQL Editor'da çalıştırın (supabase-fcm-push.sql sonrası).

-- 1) Kullanıcılar push_logs'u okuyabilsin (gönderilen bildirimleri listeleme)
DROP POLICY IF EXISTS "push_logs admin only" ON public.push_logs;
CREATE POLICY "push_logs admin all" ON public.push_logs
  FOR ALL TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY "push_logs authenticated read" ON public.push_logs
  FOR SELECT TO authenticated
  USING (true);

-- 2) Hangi bildirimi hangi kullanıcı okudu
CREATE TABLE IF NOT EXISTS public.user_notification_read (
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  push_log_id UUID NOT NULL REFERENCES public.push_logs(id) ON DELETE CASCADE,
  read_at TIMESTAMPTZ DEFAULT now(),
  PRIMARY KEY (user_id, push_log_id)
);

CREATE INDEX IF NOT EXISTS idx_user_notification_read_user ON public.user_notification_read(user_id);

ALTER TABLE public.user_notification_read ENABLE ROW LEVEL SECURITY;

CREATE POLICY "user_notification_read own" ON public.user_notification_read
  FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
