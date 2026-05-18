-- Adds plant and animal subcategory values to species_category (safe to re-run on PG 15+).
-- Run on existing databases after create_detections.sql. Fresh installs: values are in create_detections.sql.

do $$
declare
  v text;
  vals text[] := array[
    'lizards', 'snakes', 'frogs_toads', 'turtles_tortoises', 'salamanders',
    'songbirds', 'raptors', 'wading_birds', 'waterfowl', 'shorebirds',
    'small_mammals', 'deer_hoofed', 'bats', 'marine_mammals', 'carnivores',
    'trees', 'shrubs', 'flowers', 'grasses_sedges', 'ferns',
    'mosses_lichens', 'vines', 'succulents_cacti', 'aquatic_plants'
  ];
begin
  foreach v in array vals loop
    begin
      execute format('alter type species_category add value if not exists %L', v);
    exception
      when duplicate_object then null;
    end;
  end loop;
end $$;
