-- Safe to re-run
drop index if exists one_species_per_day;
drop table if exists public.detections cascade;
drop type if exists species_category cascade;
drop type if exists native_status cascade;

-- Enums
create type species_category as enum (
  'mammal',
  'reptile',
  'fish',
  'insect',
  'bird',
  'plant_tree',
  'plant_flower',
  'plant_other',
  'amphibian',
  'other'
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

-- TEMPORARY (duplicate species same day allowed): unique index disabled.
-- Re-enable for production: sql/enable_one_species_per_day_temp.sql
-- Existing DBs: sql/disable_one_species_per_day_temp.sql drops the index if it was already created.
-- create unique index one_species_per_day
--   on public.detections(user_id, latin_name, ((detected_at at time zone 'UTC')::date));

-- Indexes
create index detections_user_id_idx     on public.detections(user_id);
create index detections_state_idx       on public.detections(state);
create index detections_category_idx    on public.detections(category);
create index detections_native_idx      on public.detections(native_status);
create index detections_detected_at_idx on public.detections(detected_at desc);

-- Row Level Security
alter table public.detections enable row level security;

create policy "Users can view their own detections"
  on public.detections for select
  using (auth.uid() = user_id);

create policy "Users can insert their own detections"
  on public.detections for insert
  with check (auth.uid() = user_id);

create policy "Users can delete their own detections"
  on public.detections for delete
  using (auth.uid() = user_id);

create policy "Non-sensitive detections are publicly viewable"
  on public.detections for select
  using (is_sensitive = false);