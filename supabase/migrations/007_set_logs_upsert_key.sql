-- Unique constraint on (exercise_log_id, set_number) so the active-workout UI
-- can upsert set rows on every edit instead of insert-only.
--
-- Dedupe any pre-existing duplicates (shouldn't exist in practice, but safe) —
-- keep the most recently completed row for each (exercise_log_id, set_number).

delete from set_logs a
using set_logs b
where a.exercise_log_id = b.exercise_log_id
  and a.set_number = b.set_number
  and a.id <> b.id
  and (
    coalesce(a.completed_at, 'epoch'::timestamptz) < coalesce(b.completed_at, 'epoch'::timestamptz)
    or (
      coalesce(a.completed_at, 'epoch'::timestamptz) = coalesce(b.completed_at, 'epoch'::timestamptz)
      and a.id < b.id
    )
  );

alter table set_logs
  add constraint set_logs_exercise_log_id_set_number_key
  unique (exercise_log_id, set_number);
