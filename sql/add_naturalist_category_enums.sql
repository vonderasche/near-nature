-- Additional species_category values for naturalist subcategories. Safe to re-run (PG 15+).

do $$
declare
  v text;
  vals text[] := array[
    'wildflowers', 'trees_shrubs', 'ferns_mosses', 'cacti_succulents',
    'butterflies_moths', 'beetles', 'bees_wasps', 'dragonflies', 'other_insects',
    'spiders', 'scorpions', 'ticks_mites', 'other_arachnids',
    'freshwater_fish', 'saltwater_fish', 'shellfish', 'other_fish',
    'mushrooms', 'slime_molds', 'lichens', 'other_fungi'
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
