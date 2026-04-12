CREATE TABLE daily_steps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  date DATE NOT NULL,
  step_count INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, date)
);
ALTER TABLE daily_steps ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own steps"
  ON daily_steps FOR ALL USING (auth.uid() = user_id);
