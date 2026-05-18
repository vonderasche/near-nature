-- Optional one-time cleanup on an existing Supabase project.
-- Safe to re-run. Run after deploying the trimmed sql/ scripts.
-- The app does not call these functions (uses RLS + direct table access + Edge Functions).

drop function if exists public.update_user_profile(uuid, text, text, text, text, text);
drop function if exists public.update_detection(uuid, text, text);
drop function if exists public.delete_detection(uuid);
drop function if exists public.delete_all_detections();
drop function if exists public.delete_user_account(uuid);
drop function if exists public.get_leaderboard(text, text);

drop view if exists public.leaderboard cascade;
drop view if exists public.leaderboard_by_state cascade;

drop index if exists public.one_species_per_day;
