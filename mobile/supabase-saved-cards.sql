-- Kaydedilen kartlar (kullanıcı bazlı)
-- Supabase Dashboard → SQL Editor'da çalıştırın.

CREATE TABLE IF NOT EXISTS saved_cards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  flash_card_id UUID NOT NULL REFERENCES flash_cards(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, flash_card_id)
);

CREATE INDEX idx_saved_cards_user ON saved_cards(user_id);

ALTER TABLE saved_cards ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Saved cards read own" ON saved_cards FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Saved cards insert own" ON saved_cards FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Saved cards delete own" ON saved_cards FOR DELETE TO authenticated USING (auth.uid() = user_id);
