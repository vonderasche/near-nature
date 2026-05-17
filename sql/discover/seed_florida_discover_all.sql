-- ONE-SHOT Florida Discover seed + verification.
-- Prerequisite: run sql/discover/seed/florida_data.sql once to install seed functions.
-- Schema: create_explore_species, create_seasonality, create_parks, create_park_species,
--         create_featured_rotation, explore_app_grants, get_park_summary_for_state (optional).

select public.florida_guard_explore_species();
select public.florida_seed_explore_species();
select public.florida_seed_seasonality();
select public.florida_guard_parks();
select public.florida_seed_parks();
select public.florida_guard_park_species();
select public.florida_seed_park_species();
select public.florida_rotate_featured();

select 'explore_species' as table_name, count(*)::bigint as row_count from public.explore_species
union all
select 'parks_florida', count(*)::bigint from public.parks where state = 'Florida'
union all
select 'park_species', count(*)::bigint from public.park_species
union all
select 'featured', count(*)::bigint from public.explore_species where is_featured = true;
