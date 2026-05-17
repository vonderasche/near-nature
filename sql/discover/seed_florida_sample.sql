-- Full Florida sample seed (species, seasonality, parks, park_species, featured).
-- DEPRECATED: prefer seed_florida_discover_all.sql after seed/florida_data.sql.
-- Prerequisite: seed/florida_data.sql + schema files in sql/discover/README.md

select public.florida_guard_explore_species();
select public.florida_seed_explore_species();
select public.florida_seed_seasonality();
select public.florida_guard_parks();
select public.florida_seed_parks();
select public.florida_guard_park_species();
select public.florida_seed_park_species();
select public.rotate_featured_species();
