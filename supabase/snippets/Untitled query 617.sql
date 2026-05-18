-- One-time migration for databases that already had the old streak RLS policy.
-- Safe to re-run.
drop policy if exists "Users can update their own streak" on public.streaks;
