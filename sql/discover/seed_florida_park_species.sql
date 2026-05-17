-- Florida parks + park_species (use when sample seed failed at park_species).
-- Prerequisite: sql/discover/seed/florida_data.sql

select public.florida_guard_parks();
select public.florida_seed_parks();
select public.florida_guard_park_species();
select public.florida_seed_park_species();
select public.florida_rotate_featured();

select 'parks_florida' as table_name, count(*)::bigint as row_count from public.parks where state = 'Florida'
union all
select 'park_species', count(*)::bigint from public.park_species;
