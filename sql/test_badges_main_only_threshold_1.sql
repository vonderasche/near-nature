-- Test-only badge profile:
-- - One earnable badge per main discipline (explorer tier only)
-- - Disable subcategory tiers, higher main tiers, and bonus badges
-- - required_unique_species = 1 (e.g. first lizard → herpetologist)
--
-- Safe to re-run.

update public.badge_definitions
set active = false
where badge_kind in ('sub', 'bonus');

update public.badge_definitions
set active = false
where badge_kind = 'main'
  and tier in ('adventurer', 'voyager');

update public.badge_definitions
set active = true,
    required_unique_species = 1
where badge_kind = 'main'
  and tier = 'explorer'
  and main_category in ('botanist', 'herpetologist', 'ornithologist', 'mammalogist');

-- Optional: if older catalogs exist, keep only these 4 mains active.
update public.badge_definitions
set active = false
where badge_kind = 'main'
  and (main_category is null or main_category not in (
    'botanist',
    'herpetologist',
    'ornithologist',
    'mammalogist'
  ));

-- Recompute progress/awards for all users against the new active definitions.
select public.check_category_milestones(d.user_id)
from public.discoveries d
group by d.user_id;
