-- Allow signed-in users to read curated explore species (reference data).
-- Safe to re-run. Adjust policies if you want anonymous read instead.

alter table public.explore_species enable row level security;

drop policy if exists "Authenticated users can read explore species" on public.explore_species;

create policy "Authenticated users can read explore species"
  on public.explore_species
  for select
  to authenticated
  using (true);

grant select on public.explore_species to authenticated;
