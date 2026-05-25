-- Badge progress deployment sanity checks.
-- Run after:
--   1. sql/add_badge_progress.sql
--   2. sql/check_category_milestones.sql
--   3. sql/get_user_scoring_snapshot.sql
--   4. sql/get_public_user_awards.sql
--   5. sql/backfill_badge_progress.sql

-- 1. Definition counts. Expected from current taxonomy: 71 total, 56 active.
select
  count(*) as total_definitions,
  count(*) filter (where active) as active_definitions,
  count(*) filter (where badge_kind = 'main' and active) as active_main_badges,
  count(*) filter (where badge_kind = 'sub' and active) as active_sub_badges,
  count(*) filter (where badge_kind = 'bonus' and active) as active_bonus_badges
from public.badge_definitions;

-- 2. Active definitions missing required_unique_species where they should have one.
select
  award_key,
  badge_kind,
  main_category,
  subcategory,
  tier
from public.badge_definitions
where active
  and badge_kind in ('main', 'sub')
  and required_unique_species is null
order by sort_order, award_key;

-- 3. Users with discoveries but no progress rows yet.
select
  d.user_id,
  count(distinct lower(trim(d.latin_name))) as unique_species
from public.discoveries d
left join public.user_badge_progress ubp on ubp.user_id = d.user_id
where d.user_id is not null
group by d.user_id
having count(ubp.award_key) = 0
order by unique_species desc;

-- 4. Users with fewer active progress rows than active badge definitions.
with active_definition_count as (
  select count(*)::int as expected_rows
  from public.badge_definitions
  where active
),
progress_counts as (
  select
    ubp.user_id,
    count(*)::int as progress_rows
  from public.user_badge_progress ubp
  inner join public.badge_definitions bd on bd.award_key = ubp.award_key
  where bd.active
  group by ubp.user_id
)
select
  pc.user_id,
  pc.progress_rows,
  adc.expected_rows
from progress_counts pc
cross join active_definition_count adc
where pc.progress_rows < adc.expected_rows
order by pc.progress_rows, pc.user_id;

-- 5. Earned progress rows missing point_awards ledger rows.
select
  ubp.user_id,
  ubp.award_key,
  bd.label
from public.user_badge_progress ubp
inner join public.badge_definitions bd on bd.award_key = ubp.award_key
left join public.point_awards pa
  on pa.user_id = ubp.user_id
  and pa.award_key = ubp.award_key
where ubp.earned
  and bd.active
  and pa.award_key is null
order by ubp.user_id, bd.sort_order, ubp.award_key;

-- 6. Ledger rows whose points disagree with current active definitions.
select
  pa.user_id,
  pa.award_key,
  pa.points as ledger_points,
  bd.points as definition_points,
  bd.label
from public.point_awards pa
inner join public.badge_definitions bd on bd.award_key = pa.award_key
where bd.active
  and pa.points <> bd.points
order by pa.user_id, bd.sort_order, pa.award_key;
