-- Safe to re-run
drop table if exists public.explore_species cascade;

create table public.explore_species (
  id                  uuid primary key default gen_random_uuid(),
  inaturalist_id      int,
  latin_name          text unique not null,
  common_name         text not null,
  type                text not null check (type in ('animals', 'plants')),
  iconic_taxon_name   text,
  observations_count  int default 0,
  rank                int not null,
  state               text not null default 'Florida',
  wikipedia_url       text,
  image_url           text,
  wiki_summary        text,
  wiki_image_url      text,
  is_iconic           boolean default false,
  is_featured         boolean default false,
  featured_week_start date,
  bonus_points        int default 5,
  created_at          timestamptz default now() not null,
  updated_at          timestamptz default now() not null
);

create index explore_species_type_idx     on public.explore_species(type);
create index explore_species_state_idx    on public.explore_species(state);
create index explore_species_rank_idx     on public.explore_species(rank);
create index explore_species_featured_idx on public.explore_species(is_featured);
create index explore_species_iconic_idx   on public.explore_species(is_iconic);

create trigger explore_species_updated_at
  before update on public.explore_species
  for each row execute function update_updated_at();

alter table public.explore_species enable row level security;

create policy "Anyone can view explore species"
  on public.explore_species for select
  using (true);

create policy "Service role can manage explore species"
  on public.explore_species for all
  using (true);
