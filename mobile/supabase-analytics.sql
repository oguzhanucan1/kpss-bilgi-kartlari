-- Analiz için tablolar: kart görüntüleme, süre, zorluk, tekrar planı, uygulama oturumu
-- Supabase Dashboard → SQL Editor'da çalıştırın (flash_cards tablosu mevcut olmalı).
-- Sıra: Önce bu dosyayı çalıştırın, sonra uygulamayı kullanın; Analiz sekmesi verileri gösterecektir.

-- 1) Kart görüntüleme: hangi kart ne zaman görüldü, kaç saniye bakıldı
CREATE TABLE IF NOT EXISTS card_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  flash_card_id UUID NOT NULL REFERENCES flash_cards(id) ON DELETE CASCADE,
  viewed_at TIMESTAMPTZ DEFAULT now(),
  duration_seconds INT NOT NULL DEFAULT 0
);

CREATE INDEX idx_card_views_user ON card_views(user_id);
CREATE INDEX idx_card_views_viewed_at ON card_views(viewed_at);
CREATE INDEX idx_card_views_user_viewed ON card_views(user_id, viewed_at);

ALTER TABLE card_views ENABLE ROW LEVEL SECURITY;

CREATE POLICY "card_views select own" ON card_views FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "card_views insert own" ON card_views FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- 2) Kart zorluk / yıldız (1-5)
CREATE TABLE IF NOT EXISTS card_ratings (
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  flash_card_id UUID NOT NULL REFERENCES flash_cards(id) ON DELETE CASCADE,
  rating SMALLINT NOT NULL CHECK (rating >= 1 AND rating <= 5),
  updated_at TIMESTAMPTZ DEFAULT now(),
  PRIMARY KEY (user_id, flash_card_id)
);

CREATE INDEX idx_card_ratings_user ON card_ratings(user_id);

ALTER TABLE card_ratings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "card_ratings select own" ON card_ratings FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "card_ratings insert own" ON card_ratings FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "card_ratings update own" ON card_ratings FOR UPDATE TO authenticated USING (auth.uid() = user_id);

-- 3) Tekrar planı (spaced repetition): son görüntüleme ve bir sonraki tekrar tarihi
CREATE TABLE IF NOT EXISTS card_review_state (
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  flash_card_id UUID NOT NULL REFERENCES flash_cards(id) ON DELETE CASCADE,
  last_viewed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  next_review_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  interval_days INT NOT NULL DEFAULT 1,
  updated_at TIMESTAMPTZ DEFAULT now(),
  PRIMARY KEY (user_id, flash_card_id)
);

CREATE INDEX idx_card_review_state_user ON card_review_state(user_id);
CREATE INDEX idx_card_review_state_next ON card_review_state(user_id, next_review_at);

ALTER TABLE card_review_state ENABLE ROW LEVEL SECURITY;

CREATE POLICY "card_review_state select own" ON card_review_state FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "card_review_state insert own" ON card_review_state FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "card_review_state update own" ON card_review_state FOR UPDATE TO authenticated USING (auth.uid() = user_id);

-- 4) Uygulama oturumu: uygulama açık kaldığı süre (foreground)
CREATE TABLE IF NOT EXISTS app_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  ended_at TIMESTAMPTZ
);

CREATE INDEX idx_app_sessions_user ON app_sessions(user_id);
CREATE INDEX idx_app_sessions_started ON app_sessions(started_at);

ALTER TABLE app_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "app_sessions select own" ON app_sessions FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "app_sessions insert own" ON app_sessions FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "app_sessions update own" ON app_sessions FOR UPDATE TO authenticated USING (auth.uid() = user_id);
