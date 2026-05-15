-- Public profile + stats (streak, detection/species counts) for any member.
-- SECURITY DEFINER: bypasses RLS on users/streaks/detections; only exposes safe aggregates.
-- Owner-only columns (all detections / all species) are filled only when auth.uid() = p_user_id.
-- Safe to re-run.

drop function if exists public.get_public_user_profile(uuid);

create or replace function public.get_public_user_profile(p_user_id uuid)
returns table (
  user_id                 uuid,
  username                text,
  motto                   text,
  avatar_url              text,
  current_streak          int,
  longest_streak          int,
  public_detection_count  bigint,
  public_species_count    bigint,
  owner_detection_count   bigint,
  owner_species_count     bigint
)
language sql
security definer
set search_path = public
stable
as $$
  select
    u.id,
    u.username,
    coalesce(u.motto, ''),
    coalesce(u.avatar_url, ''),
    coalesce(s.current_streak, 0)::int,
    coalesce(s.longest_streak, 0)::int,
    (
      select count(*)::bigint
      from public.detections d
      where d.user_id = u.id
        and d.is_sensitive = false
    ) as public_detection_count,
    (
      select count(distinct d.latin_name)::bigint
      from public.detections d
      where d.user_id = u.id
        and d.is_sensitive = false
    ) as public_species_count,
    case
      when auth.uid() is not null and auth.uid() = u.id then (
        select count(*)::bigint from public.detections d where d.user_id = u.id
      )
      else null::bigint
    end as owner_detection_count,
    case
      when auth.uid() is not null and auth.uid() = u.id then (
        select count(distinct d.latin_name)::bigint
        from public.detections d
        where d.user_id = u.id
      )
      else null::bigint
    end as owner_species_count
  from public.users u
  left join public.streaks s on s.user_id = u.id
  where u.id = p_user_id;
$$;

revoke all on function public.get_public_user_profile(uuid) from public;
grant execute on function public.get_public_user_profile(uuid) to authenticated;
