-- FCM Push: Admin ayarları, token'lar, gönderim logları
-- Supabase SQL Editor'da çalıştırın. is_admin() tanımlı olmalı.

-- 1) Admin ayarları (FCM service account JSON burada saklanır)
CREATE TABLE IF NOT EXISTS public.app_settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "app_settings admin only" ON public.app_settings;
CREATE POLICY "app_settings admin only" ON public.app_settings
  FOR ALL TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- 2) Push token'ları (FCM token veya Expo token)
CREATE TABLE IF NOT EXISTS public.push_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  token TEXT NOT NULL,
  token_type TEXT NOT NULL DEFAULT 'expo' CHECK (token_type IN ('fcm', 'expo')),
  platform TEXT,
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id)
);

-- Eski tabloda expo_push_token varsa token + token_type'a geçir
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'push_tokens' AND column_name = 'expo_push_token') THEN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'push_tokens' AND column_name = 'token') THEN
      ALTER TABLE public.push_tokens ADD COLUMN token TEXT;
      ALTER TABLE public.push_tokens ADD COLUMN token_type TEXT DEFAULT 'expo';
    END IF;
    UPDATE public.push_tokens SET token = expo_push_token, token_type = 'expo' WHERE (token IS NULL OR token = '') AND expo_push_token IS NOT NULL;
    ALTER TABLE public.push_tokens DROP COLUMN IF EXISTS expo_push_token;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_push_tokens_user ON public.push_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_push_tokens_type ON public.push_tokens(token_type);

ALTER TABLE public.push_tokens ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "push_tokens insert own" ON public.push_tokens;
CREATE POLICY "push_tokens insert own" ON public.push_tokens
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "push_tokens update own" ON public.push_tokens;
CREATE POLICY "push_tokens update own" ON public.push_tokens
  FOR UPDATE TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "push_tokens admin select" ON public.push_tokens;
CREATE POLICY "push_tokens admin select" ON public.push_tokens
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id OR public.is_admin());

DROP POLICY IF EXISTS "push_tokens delete own" ON public.push_tokens;
CREATE POLICY "push_tokens delete own" ON public.push_tokens
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- 3) Gönderim logları (istatistikler)
CREATE TABLE IF NOT EXISTS public.push_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  body TEXT,
  sent_at TIMESTAMPTZ DEFAULT now(),
  total_recipients INT NOT NULL DEFAULT 0,
  success_count INT NOT NULL DEFAULT 0,
  failed_count INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_push_logs_sent_at ON public.push_logs(sent_at DESC);

ALTER TABLE public.push_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "push_logs admin only" ON public.push_logs;
CREATE POLICY "push_logs admin only" ON public.push_logs
  FOR ALL TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());
