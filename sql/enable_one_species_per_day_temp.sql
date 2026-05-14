-- Re-enable one detection per species per user per UTC day (undo disable_one_species_per_day_temp.sql).
-- Fails if duplicate (user_id, latin_name, utc_date) rows exist — delete or merge those first.

create unique index if not exists one_species_per_day
  on public.detections(user_id, latin_name, ((detected_at at time zone 'UTC')::date));
