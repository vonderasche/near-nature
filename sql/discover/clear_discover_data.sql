-- Wipe all Discover / Explore curated content (empty hub, species list, parks).
-- Keeps tables, RPCs, and florida_seed_* functions so you can re-run seeds later.
--
-- Does NOT touch user detections, discoveries, or Explorer Board rankings.
--
-- Run in Supabase SQL Editor, or:
--   $env:SUPABASE_DB_PASSWORD = '<database password>'
--   npx supabase db execute --project-ref axvubbqcdbxsetqwvjof --file sql/discover/clear_discover_data.sql

delete from public.park_species;
delete from public.parks;
delete from public.explore_species; -- cascades species_seasonality

select 'explore_species' as table_name, count(*)::bigint as row_count from public.explore_species
union all
select 'parks', count(*)::bigint from public.parks
union all
select 'park_species', count(*)::bigint from public.park_species
union all
select 'species_seasonality', count(*)::bigint from public.species_seasonality;
