-- Test-only badge profile:
-- - Keep only the 4 main discipline badges active (botanist, herpetologist, ornithologist, mammalogist)
-- - Disable subcategory + bonus badges
-- - Set required_unique_species = 1 for active main badges
--
-- Safe to re-run.

update public.badge_definitions
set active = false
where badge_kind in ('sub', 'bonus');

update public.badge_definitions
set active = true,
    required_unique_species = 1
where badge_kind = 'main'
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
