-- Deactivate legacy 8-discipline badge catalog entries after trimming to 4 mains.
-- Safe to re-run. Run after add_badge_progress.sql, then sql/backfill_badge_progress.sql.

update public.badge_definitions
set active = false
where badge_kind in ('main', 'sub')
  and (
    (main_category is not null and main_category not in (
      'botanist',
      'herpetologist',
      'ornithologist',
      'mammalogist'
    ))
    or (subcategory is not null and subcategory not in (
      'wildflowers',
      'trees_shrubs',
      'ferns_mosses',
      'lizards',
      'snakes',
      'frogs_toads',
      'turtles_tortoises',
      'salamanders',
      'songbirds',
      'raptors',
      'wading_birds',
      'waterfowl',
      'shorebirds'
    ))
  );

-- Mammalogist sub-tier rows stay inactive (True Voyager = main discipline only).
update public.badge_definitions
set active = false
where badge_kind = 'sub'
  and main_category = 'mammalogist';

-- Bonus badges for removed mains should not appear in active catalog.
update public.badge_definitions
set active = false
where badge_kind = 'bonus'
  and award_key in (
    'badge:true_voyager:entomologist',
    'badge:true_voyager:arachnologist',
    'badge:true_voyager:ichthyologist',
    'badge:true_voyager:mycologist'
  );
