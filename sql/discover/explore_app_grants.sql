-- Grants for Discover hub RPCs and park views (run after create_* scripts).
-- Safe to re-run.

grant execute on function public.get_featured_species() to authenticated, anon;
grant execute on function public.get_park_species(uuid, text) to authenticated, anon;
grant execute on function public.get_nearby_parks(numeric, numeric, numeric) to authenticated, anon;
grant execute on function public.get_parks_for_species(text) to authenticated, anon;

grant select on public.parks to authenticated, anon;
grant select on public.park_species to authenticated, anon;
grant select on public.parks_with_counts to authenticated, anon;
grant select on public.species_seasonality to authenticated, anon;
grant select on public.explore_species to authenticated, anon;
