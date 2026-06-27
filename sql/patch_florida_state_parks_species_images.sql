-- Add species image pipe-lists to existing florida_state_parks tables (safe to re-run).
alter table public.florida_state_parks
  add column if not exists top_plant_images text;

alter table public.florida_state_parks
  add column if not exists top_animal_images text;

comment on column public.florida_state_parks.top_plant_images is
  'Pipe-separated image URLs aligned with top_plants names.';

comment on column public.florida_state_parks.top_animal_images is
  'Pipe-separated image URLs aligned with top_animals names.';
