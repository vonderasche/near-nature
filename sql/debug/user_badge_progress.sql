-- Debug badge progress for one user.
-- Replace null::uuid below with '<user-id>'::uuid to inspect a specific user.
-- If left as null::uuid, the query picks the user with the most discoveries.

-- Find candidate users with discoveries.
select
  d.user_id,
  count(*) as discovery_rows,
  count(distinct lower(trim(d.latin_name))) as unique_species
from public.discoveries d
where d.user_id is not null
group by d.user_id
order by unique_species desc, discovery_rows desc
limit 20;

-- Refresh and inspect badge progress for a target user.
with target as (
  select coalesce(
    null::uuid,
    (
      select d.user_id
      from public.discoveries d
      where d.user_id is not null
      group by d.user_id
      order by count(distinct lower(trim(d.latin_name))) desc, count(*) desc
      limit 1
    )
  ) as user_id
),
refresh as (
  select public.check_category_milestones(t.user_id) as refreshed
  from target t
  where t.user_id is not null
),
progress as (
  select
    t.user_id,
    bd.award_key,
    bd.label,
    bd.badge_kind,
    bd.main_category,
    bd.subcategory,
    bd.tier,
    coalesce(ubp.unique_species_count, 0) as unique_species_count,
    ubp.required_unique_species,
    coalesce(ubp.earned, false) as earned,
    bd.points,
    ubp.updated_at,
    bd.sort_order
  from target t
  cross join public.badge_definitions bd
  left join public.user_badge_progress ubp
    on ubp.user_id = t.user_id
    and ubp.award_key = bd.award_key
  left join refresh r on true
  where t.user_id is not null
    and bd.active
)
select
  user_id,
  award_key,
  label,
  badge_kind,
  main_category,
  subcategory,
  tier,
  unique_species_count,
  required_unique_species,
  earned,
  points,
  updated_at
from progress
order by sort_order, award_key;
