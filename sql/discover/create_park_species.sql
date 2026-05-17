-- Safe to re-run
-- Requires parks table to exist first
drop table if exists public.park_species cascade;

create table public.park_species (
  id                  uuid primary key default gen_random_uuid(),
  park_id             uuid not null references public.parks(id) on delete cascade,
  latin_name          text not null,
  common_name         text not null,
  category            text not null,
  iconic_taxon_name   text,
  observations_count  int default 0,
  image_url           text,
  inaturalist_id      int,
  created_at          timestamptz default now() not null,
  unique(park_id, latin_name)
);

create index park_species_park_id_idx  on public.park_species(park_id);
create index park_species_category_idx on public.park_species(category);
create index park_species_latin_idx    on public.park_species(latin_name);

alter table public.park_species enable row level security;

create policy "Anyone can view park species"
  on public.park_species for select
  using (true);

create policy "Service role can manage park species"
  on public.park_species for all
  using (true);

-- View: parks with species counts per category
create or replace view public.parks_with_counts as
select
  p.*,
  count(ps.id)                                        as total_species,
  count(ps.id) filter (where ps.category = 'bird')    as bird_count,
  count(ps.id) filter (where ps.category = 'mammal')  as mammal_count,
  count(ps.id) filter (where ps.category = 'reptile') as reptile_count,
  count(ps.id) filter (where ps.category = 'plant')   as plant_count,
  count(ps.id) filter (where ps.category = 'insect')  as insect_count
from public.parks p
left join public.park_species ps on ps.park_id = p.id
group by p.id;
