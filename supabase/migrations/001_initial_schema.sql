-- JazFit Database Schema
-- Run this in Supabase SQL Editor

-- ============================================
-- PROFILES
-- ============================================
create table profiles (
  id uuid references auth.users on delete cascade primary key,
  created_at timestamptz default now() not null,
  name text,
  preferences jsonb default '{}'::jsonb
);

alter table profiles enable row level security;

create policy "Users can view own profile"
  on profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on profiles for update
  using (auth.uid() = id);

create policy "Users can insert own profile"
  on profiles for insert
  with check (auth.uid() = id);

-- Auto-create profile on signup
create or replace function handle_new_user()
returns trigger as $$
begin
  insert into profiles (id, name)
  values (new.id, new.raw_user_meta_data->>'name');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure handle_new_user();

-- ============================================
-- EXERCISES (reference data)
-- ============================================
create table exercises (
  id uuid default gen_random_uuid() primary key,
  name text not null unique,
  muscle_groups text[] not null,
  equipment_type text not null,
  is_default boolean default true not null
);

alter table exercises enable row level security;

create policy "Authenticated users can view exercises"
  on exercises for select
  to authenticated
  using (true);

-- ============================================
-- USER EXERCISES (gym-specific pool)
-- ============================================
create table user_exercises (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  exercise_id uuid references exercises on delete cascade not null,
  is_available boolean default true not null,
  unique (user_id, exercise_id)
);

alter table user_exercises enable row level security;

create policy "Users can view own exercises"
  on user_exercises for select
  using (auth.uid() = user_id);

create policy "Users can insert own exercises"
  on user_exercises for insert
  with check (auth.uid() = user_id);

create policy "Users can update own exercises"
  on user_exercises for update
  using (auth.uid() = user_id);

create policy "Users can delete own exercises"
  on user_exercises for delete
  using (auth.uid() = user_id);

-- ============================================
-- WORKOUT SESSIONS
-- ============================================
create table workout_sessions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  date date default current_date not null,
  muscle_groups_focus text[] not null default '{}',
  duration_seconds integer,
  notes text,
  created_at timestamptz default now() not null,
  completed_at timestamptz
);

alter table workout_sessions enable row level security;

create policy "Users can view own sessions"
  on workout_sessions for select
  using (auth.uid() = user_id);

create policy "Users can insert own sessions"
  on workout_sessions for insert
  with check (auth.uid() = user_id);

create policy "Users can update own sessions"
  on workout_sessions for update
  using (auth.uid() = user_id);

create policy "Users can delete own sessions"
  on workout_sessions for delete
  using (auth.uid() = user_id);

create index idx_workout_sessions_user_date
  on workout_sessions (user_id, date desc);

-- ============================================
-- EXERCISE LOGS (exercises within a session)
-- ============================================
create table exercise_logs (
  id uuid default gen_random_uuid() primary key,
  session_id uuid references workout_sessions on delete cascade not null,
  exercise_id uuid references exercises on delete cascade not null,
  order_index integer not null default 0
);

alter table exercise_logs enable row level security;

create policy "Users can view own exercise logs"
  on exercise_logs for select
  using (
    exists (
      select 1 from workout_sessions
      where workout_sessions.id = exercise_logs.session_id
      and workout_sessions.user_id = auth.uid()
    )
  );

create policy "Users can insert own exercise logs"
  on exercise_logs for insert
  with check (
    exists (
      select 1 from workout_sessions
      where workout_sessions.id = exercise_logs.session_id
      and workout_sessions.user_id = auth.uid()
    )
  );

create policy "Users can update own exercise logs"
  on exercise_logs for update
  using (
    exists (
      select 1 from workout_sessions
      where workout_sessions.id = exercise_logs.session_id
      and workout_sessions.user_id = auth.uid()
    )
  );

create policy "Users can delete own exercise logs"
  on exercise_logs for delete
  using (
    exists (
      select 1 from workout_sessions
      where workout_sessions.id = exercise_logs.session_id
      and workout_sessions.user_id = auth.uid()
    )
  );

create index idx_exercise_logs_session
  on exercise_logs (session_id);

-- ============================================
-- SET LOGS (individual sets within an exercise)
-- ============================================
create table set_logs (
  id uuid default gen_random_uuid() primary key,
  exercise_log_id uuid references exercise_logs on delete cascade not null,
  set_number integer not null,
  target_weight numeric,
  actual_weight numeric,
  target_reps integer,
  actual_reps integer,
  completed_at timestamptz
);

alter table set_logs enable row level security;

create policy "Users can view own set logs"
  on set_logs for select
  using (
    exists (
      select 1 from exercise_logs
      join workout_sessions on workout_sessions.id = exercise_logs.session_id
      where exercise_logs.id = set_logs.exercise_log_id
      and workout_sessions.user_id = auth.uid()
    )
  );

create policy "Users can insert own set logs"
  on set_logs for insert
  with check (
    exists (
      select 1 from exercise_logs
      join workout_sessions on workout_sessions.id = exercise_logs.session_id
      where exercise_logs.id = set_logs.exercise_log_id
      and workout_sessions.user_id = auth.uid()
    )
  );

create policy "Users can update own set logs"
  on set_logs for update
  using (
    exists (
      select 1 from exercise_logs
      join workout_sessions on workout_sessions.id = exercise_logs.session_id
      where exercise_logs.id = set_logs.exercise_log_id
      and workout_sessions.user_id = auth.uid()
    )
  );

create policy "Users can delete own set logs"
  on set_logs for delete
  using (
    exists (
      select 1 from exercise_logs
      join workout_sessions on workout_sessions.id = exercise_logs.session_id
      where exercise_logs.id = set_logs.exercise_log_id
      and workout_sessions.user_id = auth.uid()
    )
  );

create index idx_set_logs_exercise_log
  on set_logs (exercise_log_id);

-- ============================================
-- BODY MEASUREMENTS (Phase 2 — table created now)
-- ============================================
create table body_measurements (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  date date default current_date not null,
  weight numeric,
  waist numeric,
  hips numeric,
  chest numeric,
  arms numeric,
  thighs numeric,
  created_at timestamptz default now() not null
);

alter table body_measurements enable row level security;

create policy "Users can view own measurements"
  on body_measurements for select
  using (auth.uid() = user_id);

create policy "Users can insert own measurements"
  on body_measurements for insert
  with check (auth.uid() = user_id);

create policy "Users can update own measurements"
  on body_measurements for update
  using (auth.uid() = user_id);

create policy "Users can delete own measurements"
  on body_measurements for delete
  using (auth.uid() = user_id);

create index idx_body_measurements_user_date
  on body_measurements (user_id, date desc);
