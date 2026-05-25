-- Badge definitions + per-user progress cache. Safe to re-run.
-- Deployment:
--   1. Run this file.
--   2. Run sql/check_category_milestones.sql.
--   3. Backfill:
--      select public.check_category_milestones(d.user_id)
--      from (
--        select distinct user_id
--        from public.discoveries
--        where user_id is not null
--      ) d;

create table if not exists public.badge_definitions (
  award_key               text primary key,
  badge_kind              text not null check (badge_kind in ('main', 'sub', 'bonus')),
  main_category           text,
  subcategory             text,
  tier                    text check (tier is null or tier in ('explorer', 'adventurer', 'voyager')),
  label                   text not null,
  points                  int not null check (points > 0),
  required_unique_species int check (required_unique_species is null or required_unique_species > 0),
  active                  boolean not null default true,
  sort_order              int not null default 0,
  created_at              timestamptz not null default now(),
  updated_at              timestamptz not null default now()
);

create table if not exists public.user_badge_progress (
  user_id                 uuid not null references public.users(id) on delete cascade,
  award_key               text not null references public.badge_definitions(award_key) on delete cascade,
  unique_species_count    int not null default 0 check (unique_species_count >= 0),
  required_unique_species int check (required_unique_species is null or required_unique_species > 0),
  earned                  boolean not null default false,
  updated_at              timestamptz not null default now(),
  primary key (user_id, award_key)
);

create index if not exists badge_definitions_active_sort_idx
  on public.badge_definitions(active, sort_order);

create index if not exists badge_definitions_kind_category_idx
  on public.badge_definitions(badge_kind, main_category, subcategory, tier);

create index if not exists user_badge_progress_user_earned_idx
  on public.user_badge_progress(user_id, earned);

alter table public.badge_definitions enable row level security;
alter table public.user_badge_progress enable row level security;

drop policy if exists "Badge definitions are readable" on public.badge_definitions;
create policy "Badge definitions are readable"
  on public.badge_definitions for select
  using (true);

drop policy if exists "Users can view their own badge progress" on public.user_badge_progress;
create policy "Users can view their own badge progress"
  on public.user_badge_progress for select
  using ((select auth.uid()) = user_id);

grant select on table public.badge_definitions to anon, authenticated;
grant select on table public.user_badge_progress to authenticated;

create or replace function public.touch_badge_definitions_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists badge_definitions_touch_updated_at on public.badge_definitions;
create trigger badge_definitions_touch_updated_at
  before update on public.badge_definitions
  for each row execute function public.touch_badge_definitions_updated_at();

with
tiers(tier, main_required, main_points, sub_required, sub_points, tier_sort) as (
  values
    ('explorer', 10, 50, 3, 25, 1),
    ('adventurer', 25, 150, 25, 75, 2),
    ('voyager', 50, 500, 50, 250, 3)
),
mains(main_category, label, main_sort) as (
  values
    ('botanist', 'Botanist', 1),
    ('herpetologist', 'Herpetologist', 2),
    ('ornithologist', 'Ornithologist', 3),
    ('mammalogist', 'Mammalogist', 4)
),
subcategories(subcategory, label, main_category, active, sub_sort) as (
  values
    ('wildflowers', 'Wildflowers', 'botanist', true, 1),
    ('trees_shrubs', 'Trees & Shrubs', 'botanist', true, 2),
    ('ferns_mosses', 'Ferns & Mosses', 'botanist', true, 3),
    ('lizards', 'Lizards', 'herpetologist', true, 4),
    ('snakes', 'Snakes', 'herpetologist', true, 5),
    ('frogs_toads', 'Frogs & Toads', 'herpetologist', true, 6),
    ('turtles_tortoises', 'Turtles & Tortoises', 'herpetologist', true, 7),
    ('salamanders', 'Salamanders', 'herpetologist', true, 8),
    ('songbirds', 'Songbirds', 'ornithologist', true, 9),
    ('raptors', 'Raptors', 'ornithologist', true, 10),
    ('wading_birds', 'Wading Birds', 'ornithologist', true, 11),
    ('waterfowl', 'Waterfowl', 'ornithologist', true, 12),
    ('shorebirds', 'Shorebirds', 'ornithologist', true, 13),
    -- Hidden requirements used by the True Voyager composite badge.
    ('small_mammals', 'Small Mammals', 'mammalogist', false, 14),
    ('deer_hoofed', 'Deer & Hoofed', 'mammalogist', false, 15),
    ('bats', 'Bats', 'mammalogist', false, 16),
    ('marine_mammals', 'Marine Mammals', 'mammalogist', false, 17),
    ('carnivores', 'Carnivores', 'mammalogist', false, 18)
),
definitions as (
  select
    'main:' || m.main_category || ':' || t.tier as award_key,
    'main'::text as badge_kind,
    m.main_category,
    null::text as subcategory,
    t.tier,
    m.label || ' ' || initcap(t.tier) as label,
    t.main_points as points,
    t.main_required as required_unique_species,
    true as active,
    1000 + (m.main_sort * 100) + t.tier_sort as sort_order
  from mains m
  cross join tiers t

  union all

  select
    'sub:' || s.subcategory || ':' || t.tier as award_key,
    'sub'::text as badge_kind,
    s.main_category,
    s.subcategory,
    t.tier,
    s.label || ' ' || initcap(t.tier) as label,
    t.sub_points as points,
    t.sub_required as required_unique_species,
    s.active,
    2000 + (s.sub_sort * 100) + t.tier_sort as sort_order
  from subcategories s
  cross join tiers t

  union all

  select *
  from (values
    (
      'badge:ends_of_the_earth',
      'bonus',
      null,
      null,
      null,
      'Ends of the Earth',
      1000,
      null,
      true,
      10
    ),
    (
      'badge:true_voyager:botanist',
      'bonus',
      'botanist',
      null,
      null,
      'True Voyager — Botanist',
      2000,
      null,
      true,
      20
    ),
    (
      'badge:true_voyager:herpetologist',
      'bonus',
      'herpetologist',
      null,
      null,
      'True Voyager — Herpetologist',
      2000,
      null,
      true,
      30
    ),
    (
      'badge:true_voyager:ornithologist',
      'bonus',
      'ornithologist',
      null,
      null,
      'True Voyager — Ornithologist',
      2000,
      null,
      true,
      40
    ),
    (
      'badge:true_voyager:mammalogist',
      'bonus',
      'mammalogist',
      null,
      null,
      'True Voyager — Mammalogist',
      2000,
      null,
      true,
      50
    )
  ) as b(
    award_key,
    badge_kind,
    main_category,
    subcategory,
    tier,
    label,
    points,
    required_unique_species,
    active,
    sort_order
  )
)
insert into public.badge_definitions (
  award_key,
  badge_kind,
  main_category,
  subcategory,
  tier,
  label,
  points,
  required_unique_species,
  active,
  sort_order
)
select
  award_key,
  badge_kind,
  main_category,
  subcategory,
  tier,
  label,
  points,
  required_unique_species,
  active,
  sort_order
from definitions
on conflict (award_key) do update
set badge_kind = excluded.badge_kind,
    main_category = excluded.main_category,
    subcategory = excluded.subcategory,
    tier = excluded.tier,
    label = excluded.label,
    points = excluded.points,
    required_unique_species = excluded.required_unique_species,
    active = excluded.active,
    sort_order = excluded.sort_order;
