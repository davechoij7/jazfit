-- Allow authenticated users to insert custom exercises (is_default = false only)
create policy "Users can insert custom exercises"
  on exercises for insert
  to authenticated
  with check (is_default = false);
