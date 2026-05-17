-- Safe to re-run. WARNING: drops parks and park_species (all rows lost). Re-seed after.
drop table if exists public.park_species cascade;
drop table if exists public.parks cascade;

create table public.parks (
  id           uuid primary key default gen_random_uuid(),
  name         text not null,
  lat          numeric(9, 6) not null,
  lng          numeric(9, 6) not null,
  county       text not null,
  state        text not null default 'Florida',
  description  text,
  website_url  text,
  image_url    text,
  created_at   timestamptz default now() not null,
  updated_at   timestamptz default now() not null
);

create index parks_state_idx  on public.parks(state);
create index parks_county_idx on public.parks(county);

create trigger parks_updated_at
  before update on public.parks
  for each row execute function update_updated_at();

alter table public.parks enable row level security;

create policy "Anyone can view parks"
  on public.parks for select
  using (true);

create policy "Service role can manage parks"
  on public.parks for all
  using (true);
