-- Replace numeric age column with date of birth
ALTER TABLE public.players
  ADD COLUMN IF NOT EXISTS birth_date date;

-- If there was an existing age column with data, this migration intentionally
-- does NOT attempt to convert age numbers to dates (not reversible).
-- New players will have birth_date populated from the form.

ALTER TABLE public.players
  DROP COLUMN IF EXISTS age;
