-- TEMPORARY: allow multiple saves of the same species per user per UTC day.
-- Run once in Supabase SQL editor (or migrate) while testing repeat identifications.
-- Revert with: sql/enable_one_species_per_day_temp.sql (only if no duplicate rows exist for that key).

drop index if exists public.one_species_per_day;
