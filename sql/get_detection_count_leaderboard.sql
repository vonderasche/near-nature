-- Leaderboard by number of saved (non-sensitive) detections.
-- Includes each user's motto from public.users (re-run this script after schema changes).
-- SECURITY DEFINER so all authenticated users can see aggregate rankings without
-- reading other users' individual detection rows under RLS.
-- Safe to re-run.

drop function if exists public.get_detection_count_leaderboard();

create or replace function public.get_detection_count_leaderboard()
returns table (
  leaderboard_rank   bigint,
  user_id            uuid,
  username           text,
  avatar_url         text,
  motto              text,
  detection_count    bigint
)
language sql
security definer
set search_path = public
stable
as $$
  select
    row_number() over (order by count(d.id) desc) as leaderboard_rank,
    u.id                                           as user_id,
    u.username                                     as username,
    coalesce(u.avatar_url, '')                     as avatar_url,
    coalesce(u.motto, '')                          as motto,
    count(d.id)::bigint                            as detection_count
  from public.users u
  inner join public.detections d
    on d.user_id = u.id
   and d.is_sensitive = false
  group by u.id, u.username, u.avatar_url, u.motto
  order by detection_count desc;
$$;

revoke all on function public.get_detection_count_leaderboard() from public;
grant execute on function public.get_detection_count_leaderboard() to authenticated;
