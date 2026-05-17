-- Safe to re-run
drop table if exists public.species_seasonality cascade;

create table public.species_seasonality (
  id           uuid primary key default gen_random_uuid(),
  latin_name   text not null unique references public.explore_species(latin_name) on delete cascade,
  jan          int default 0,
  feb          int default 0,
  mar          int default 0,
  apr          int default 0,
  may          int default 0,
  jun          int default 0,
  jul          int default 0,
  aug          int default 0,
  sep          int default 0,
  oct          int default 0,
  nov          int default 0,
  dec          int default 0,
  peak_start   text,                -- e.g. "Oct"
  peak_end     text,                -- e.g. "Apr"
  best_month   text,                -- single best month
  total_obs    int default 0,
  created_at   timestamptz default now() not null,
  updated_at   timestamptz default now() not null
);

create index seasonality_latin_idx on public.species_seasonality(latin_name);

create trigger species_seasonality_updated_at
  before update on public.species_seasonality
  for each row execute function update_updated_at();

alter table public.species_seasonality enable row level security;

create policy "Anyone can view seasonality"
  on public.species_seasonality for select
  using (true);

create policy "Service role can manage seasonality"
  on public.species_seasonality for all
  using (true);
