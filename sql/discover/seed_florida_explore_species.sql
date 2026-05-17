-- Florida explore_species + seasonality + featured rotation.
-- Prerequisite: sql/discover/seed/florida_data.sql

select public.florida_guard_explore_species();
select public.florida_seed_explore_species();
select public.florida_seed_seasonality();
select public.florida_rotate_featured();

select 'explore_species' as table_name, count(*)::bigint as row_count from public.explore_species;
