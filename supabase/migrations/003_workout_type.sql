alter table workout_sessions
  add column if not exists workout_type text;

alter table workout_sessions
  drop constraint if exists workout_sessions_workout_type_check;

alter table workout_sessions
  add constraint workout_sessions_workout_type_check
  check (
    workout_type is null or
    workout_type in ('Upper', 'Lower', 'Yoga', 'Barre', 'Walk', 'Run')
  );
