-- Public read of a member's earned milestone / badge awards (for profile display).
-- SECURITY DEFINER: bypasses point_awards RLS; only exposes award metadata.
-- Safe to re-run.

drop function if exists public.get_public_user_awards(uuid);

create or replace function public.get_public_user_awards(p_user_id uuid)
returns table (
  award_key   text,
  points      int,
  label       text,
  awarded_at  timestamptz
)
language sql
security definer
set search_path = public
stable
as $$
  select pa.award_key, pa.points, pa.label, pa.awarded_at
  from public.point_awards pa
  inner join public.users u on u.id = pa.user_id
  where pa.user_id = p_user_id
  order by pa.awarded_at desc;
$$;

revoke all on function public.get_public_user_awards(uuid) from public;
grant execute on function public.get_public_user_awards(uuid) to authenticated;
