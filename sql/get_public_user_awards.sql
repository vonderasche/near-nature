-- Public read of a member's earned milestone / badge awards (for profile display).
-- SECURITY DEFINER: bypasses point_awards RLS; only exposes award metadata.
-- Safe to re-run.

drop function if exists public.get_public_user_awards(uuid);

create or replace function public.get_public_user_awards(p_user_id uuid)
returns table (
  award_key               text,
  points                  int,
  label                   text,
  awarded_at              timestamptz,
  badge_kind              text,
  main_category           text,
  subcategory             text,
  tier                    text,
  unique_species_count    int,
  required_unique_species int,
  earned                  boolean
)
language sql
security definer
set search_path = public
stable
as $$
  select
    pa.award_key,
    pa.points,
    pa.label,
    pa.awarded_at,
    bd.badge_kind,
    bd.main_category,
    bd.subcategory,
    bd.tier,
    ubp.unique_species_count,
    ubp.required_unique_species,
    coalesce(ubp.earned, true) as earned
  from public.point_awards pa
  inner join public.users u on u.id = pa.user_id
  left join public.badge_definitions bd on bd.award_key = pa.award_key
  left join public.user_badge_progress ubp
    on ubp.user_id = pa.user_id
    and ubp.award_key = pa.award_key
  where pa.user_id = p_user_id
  order by pa.awarded_at desc;
$$;

revoke all on function public.get_public_user_awards(uuid) from public;
grant execute on function public.get_public_user_awards(uuid) to authenticated;
