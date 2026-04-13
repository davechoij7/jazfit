-- Daily sticker rewards based on strength workouts + step goals
-- Evaluated at end-of-day when the steps webhook fires, with backfill support

CREATE TABLE daily_stickers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  date DATE NOT NULL,
  sticker_size TEXT NOT NULL CHECK (sticker_size IN ('big', 'medium', 'small', 'none')),
  had_workout BOOLEAN NOT NULL DEFAULT false,
  had_10k_steps BOOLEAN NOT NULL DEFAULT false,
  step_count INTEGER,
  seen_at TIMESTAMPTZ,          -- NULL = morning animation hasn't played yet
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, date)
);

ALTER TABLE daily_stickers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own stickers"
  ON daily_stickers FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own stickers"
  ON daily_stickers FOR UPDATE USING (auth.uid() = user_id);

-- Service role inserts via the steps webhook (no INSERT policy needed for auth.uid)
-- but add one anyway for backfill from authenticated context
CREATE POLICY "Users can insert own stickers"
  ON daily_stickers FOR INSERT WITH CHECK (auth.uid() = user_id);
