-- Leaderboard ranked by distinct native species discovered (non-sensitive saves).
-- Also returns non-native species count for each member.
-- Includes motto from public.users.
-- SECURITY DEFINER so authenticated users can see aggregate rankings without
-- reading other users' individual detection rows under RLS.
-- Safe to re-run.

drop function if exists public.get_detection_count_leaderboard();

create or replace function public.get_detection_count_leaderboard()
returns table (
  leaderboard_rank        bigint,
  user_id                 uuid,
  username                text,
  avatar_url              text,
  motto                   text,
  native_species_count    bigint,
  non_native_species_count bigint
)
language sql
security definer
set search_path = public
stable
as $$
  with ranked as (
    select
      u.id                                            as user_id,
      u.username                                      as username,
      coalesce(u.avatar_url, '')                      as avatar_url,
      nullif(trim(u.motto), '')                       as motto,
      count(distinct d.latin_name) filter (
        where d.native_status = 'native'
      )::bigint                                       as native_species_count,
      count(distinct d.latin_name) filter (
        where d.native_status <> 'native'
      )::bigint                                       as non_native_species_count
    from public.users u
    inner join public.detections d
      on d.user_id = u.id
     and d.is_sensitive = false
    group by u.id, u.username, u.avatar_url, u.motto
  )
  select
    row_number() over (
      order by native_species_count desc, non_native_species_count desc, username asc
    ) as leaderboard_rank,
    user_id,
    username,
    avatar_url,
    motto,
    native_species_count,
    non_native_species_count
  from ranked
  order by leaderboard_rank asc;
$$;

revoke all on function public.get_detection_count_leaderboard() from public;
grant execute on function public.get_detection_count_leaderboard() to authenticated;
