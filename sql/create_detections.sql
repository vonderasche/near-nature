-- Safe to re-run
drop table if exists public.detections cascade;
drop type if exists species_category cascade;
drop type if exists native_status cascade;

-- Enums
create type species_category as enum (
  -- legacy broad categories (older rows)
  'mammal',
  'reptile',
  'fish',
  'insect',
  'bird',
  'amphibian',
  'plant_tree',
  'plant_flower',
  'plant_other',
  'other',
  -- animal subcategories
  'lizards',
  'snakes',
  'frogs_toads',
  'turtles_tortoises',
  'salamanders',
  'songbirds',
  'raptors',
  'wading_birds',
  'waterfowl',
  'shorebirds',
  'small_mammals',
  'deer_hoofed',
  'bats',
  'marine_mammals',
  'carnivores',
  -- plant subcategories
  'trees',
  'shrubs',
  'flowers',
  'grasses_sedges',
  'ferns',
  'mosses_lichens',
  'vines',
  'succulents_cacti',
  'aquatic_plants'
);

create type native_status as enum (
  'native',
  'invasive',
  'unknown'
);

create table public.detections (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null references public.users(id) on delete cascade,

  -- Image
  image_url       text not null,
  detected_at     timestamptz default now() not null,

  -- Claude API results
  common_name     text not null,
  latin_name      text not null,
  confidence      numeric(5, 2) not null check (confidence >= 0 and confidence <= 100),
  category        species_category not null,
  subcategory     text,   -- canonical subcategory for badge tiers
  main_category   text,   -- main discipline: botanist, entomologist, …
  description     text,

  -- iNaturalist results
  native_status   native_status not null default 'unknown',
  state           text not null,               -- state name only, never coordinates
  inaturalist_id  text,                        -- iNaturalist taxon ID for linking

  -- Safety
  is_sensitive    boolean default false,       -- endangered or threatened species

  -- Verification
  is_verified          boolean default false,
  confidence_threshold numeric(5,2) default 70.00,

  -- Scoring
  points          int not null default 0,

  created_at      timestamptz default now() not null
);

-- Indexes
create index detections_user_id_idx     on public.detections(user_id);
create index detections_state_idx       on public.detections(state);
create index detections_category_idx    on public.detections(category);
create index detections_native_idx      on public.detections(native_status);
create index detections_detected_at_idx on public.detections(detected_at desc);
create index detections_user_detected_at_idx on public.detections(user_id, detected_at desc);
create index detections_public_gallery_idx
  on public.detections(user_id, detected_at desc)
  where is_sensitive = false;

-- Row Level Security
alter table public.detections enable row level security;

create policy "Users can select own or public non-sensitive detections"
  on public.detections for select
  using ((select auth.uid()) = user_id or is_sensitive = false);

create policy "Users can insert their own detections"
  on public.detections for insert
  with check ((select auth.uid()) = user_id);

create policy "Users can delete their own detections"
  on public.detections for delete
  using ((select auth.uid()) = user_id);