-- Ensure RLS policy exists for daily_steps reads.
-- The original migration (004) may not have been applied to production.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'daily_steps'
      AND policyname = 'Users can manage own steps'
  ) THEN
    CREATE POLICY "Users can manage own steps"
      ON daily_steps FOR ALL USING (auth.uid() = user_id);
  END IF;
END $$;
