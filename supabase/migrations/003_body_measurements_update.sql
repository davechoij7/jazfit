-- Migration: Split arms/thighs into left/right columns
-- Non-destructive: old columns are kept and renamed for reference, new columns added

-- Add the new left/right columns
alter table body_measurements
  add column if not exists arms_left numeric,
  add column if not exists arms_right numeric,
  add column if not exists thighs_left numeric,
  add column if not exists thighs_right numeric;

-- Backfill: if existing rows have a single arms/thighs value, copy into both sides
update body_measurements
set
  arms_left = arms,
  arms_right = arms
where arms is not null and arms_left is null and arms_right is null;

update body_measurements
set
  thighs_left = thighs,
  thighs_right = thighs
where thighs is not null and thighs_left is null and thighs_right is null;

-- Keep old arms/thighs columns for safety (no destructive drops)
-- They are effectively deprecated in favor of arms_left/arms_right and thighs_left/thighs_right
