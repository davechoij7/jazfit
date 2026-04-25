-- Simplify daily_stickers: only strength workouts earn stickers, and the
-- sticker is identified by workout_type (Upper or Lower) so the UI can render
-- the matching Snoopy. Drops the size tier system (big/medium/small) and the
-- steps-derived fields entirely.
--
-- Idempotent: safe to re-run from any partially-applied state.

-- 1. Add workout_type column if missing
alter table daily_stickers add column if not exists workout_type text;

-- 2. Backfill from the most recent completed strength session on each date.
--    Only fills nulls so re-runs are no-ops.
update daily_stickers ds
set workout_type = sub.workout_type
from (
  select distinct on (ws.user_id, ws.date)
    ws.user_id, ws.date, ws.workout_type
  from workout_sessions ws
  where ws.workout_type in ('Upper', 'Lower')
    and ws.completed_at is not null
  order by ws.user_id, ws.date, ws.completed_at desc
) sub
where sub.user_id = ds.user_id
  and sub.date = ds.date
  and ds.workout_type is null;

-- 3. Drop rows that had no matching strength session (legacy steps-only stickers)
delete from daily_stickers where workout_type is null;

-- 4. Backfill missing stickers for completed strength sessions that never got a
--    row. Provides values for the pre-drop NOT NULL columns; they're removed in
--    step 5 so the values don't matter long-term.
insert into daily_stickers (
  user_id, date, workout_type, sticker_size, had_workout, created_at, seen_at
)
select distinct on (ws.user_id, ws.date)
  ws.user_id, ws.date, ws.workout_type, 'medium', true, ws.completed_at, ws.completed_at
from workout_sessions ws
where ws.workout_type in ('Upper', 'Lower')
  and ws.completed_at is not null
  and not exists (
    select 1 from daily_stickers ds
    where ds.user_id = ws.user_id and ds.date = ws.date
  )
order by ws.user_id, ws.date, ws.completed_at desc;

-- 5. Lock workout_type down + drop the obsolete columns
alter table daily_stickers alter column workout_type set not null;

alter table daily_stickers
  drop column if exists sticker_size,
  drop column if exists had_workout,
  drop column if exists had_10k_steps,
  drop column if exists step_count;

alter table daily_stickers
  drop constraint if exists daily_stickers_workout_type_check;

alter table daily_stickers
  add constraint daily_stickers_workout_type_check
  check (workout_type in ('Upper', 'Lower'));
