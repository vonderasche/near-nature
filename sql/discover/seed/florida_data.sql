-- Canonical Florida Discover seed data (single source of truth).
-- Called by sql/discover/seed_florida_*.sql wrappers. Safe to re-run (upserts).

-- Guards -----------------------------------------------------------------------

create or replace function public.florida_guard_explore_species()
returns void language plpgsql as $$
begin
  if not exists (
    select 1 from information_schema.tables
    where table_schema = 'public' and table_name = 'explore_species'
  ) then
    raise exception 'Missing explore_species — run sql/discover/create_explore_species.sql first';
  end if;
end;
$$;

create or replace function public.florida_guard_parks()
returns void language plpgsql as $$
begin
  if not exists (
    select 1 from information_schema.tables
    where table_schema = 'public' and table_name = 'parks'
  ) then
    raise exception 'Missing parks — run sql/discover/create_parks.sql first';
  end if;
end;
$$;

create or replace function public.florida_guard_park_species()
returns void language plpgsql as $$
begin
  if not exists (
    select 1 from information_schema.tables
    where table_schema = 'public' and table_name = 'park_species'
  ) then
    raise exception 'Missing park_species — run sql/discover/create_park_species.sql first';
  end if;
end;
$$;

-- Data -------------------------------------------------------------------------

create or replace function public.florida_seed_explore_species()
returns void language plpgsql as $$
begin
  insert into public.explore_species (
    latin_name, common_name, type, iconic_taxon_name, observations_count, rank,
    state, wiki_summary, is_iconic, bonus_points
  ) values
    ('Turdus migratorius', 'American Robin', 'animals', 'Aves', 887974, 1, 'Florida',
     'A familiar thrush; often seen on lawns and in parks.', true, 5),
    ('Apis mellifera', 'Western Honey Bee', 'animals', 'Insecta', 512340, 2, 'Florida',
     'Important pollinator; commonly photographed on flowers.', false, 5),
    ('Danaus plexippus', 'Monarch', 'animals', 'Insecta', 445120, 3, 'Florida',
     'Milkweed butterfly; migrates through Florida.', true, 5),
    ('Alligator mississippiensis', 'American Alligator', 'animals', 'Reptilia', 398200, 4, 'Florida',
     'Iconic reptile of Florida wetlands.', true, 5),
    ('Ardea alba', 'Great Egret', 'animals', 'Aves', 356800, 5, 'Florida',
     'Large white heron of marshes and coasts.', false, 5),
    ('Trichechus manatus', 'West Indian Manatee', 'animals', 'Mammalia', 289400, 6, 'Florida',
     'Gentle marine mammal; springs and warm coastal waters.', true, 5),
    ('Odocoileus virginianus', 'White-tailed Deer', 'animals', 'Mammalia', 275000, 7, 'Florida',
     'Common mammal in hammocks and suburbs.', false, 5),
    ('Quercus virginiana', 'Live Oak', 'plants', 'Plantae', 245600, 1, 'Florida',
     'Large spreading oak with Spanish moss.', true, 5),
    ('Serenoa repens', 'Saw Palmetto', 'plants', 'Plantae', 198400, 2, 'Florida',
     'Palm scrub indicator species across the peninsula.', false, 5),
    ('Citrus sinensis', 'Sweet Orange', 'plants', 'Plantae', 156200, 3, 'Florida',
     'Cultivated citrus; symbolic of Florida agriculture.', false, 5),
    ('Tillandsia usneoides', 'Spanish Moss', 'plants', 'Plantae', 142800, 4, 'Florida',
     'Epiphytic bromeliad draping live oaks.', false, 5),
    ('Sabal palmetto', 'Cabbage Palm', 'plants', 'Plantae', 131500, 5, 'Florida',
     'Florida state tree; common in coastal and inland habitats.', true, 5)
  on conflict (latin_name) do update set
    common_name = excluded.common_name,
    type = excluded.type,
    iconic_taxon_name = excluded.iconic_taxon_name,
    observations_count = excluded.observations_count,
    rank = excluded.rank,
    state = excluded.state,
    wiki_summary = excluded.wiki_summary,
    is_iconic = excluded.is_iconic,
    bonus_points = excluded.bonus_points,
    updated_at = now();
end;
$$;

create or replace function public.florida_seed_seasonality()
returns void language plpgsql as $$
begin
  if not exists (
    select 1 from information_schema.tables
    where table_schema = 'public' and table_name = 'species_seasonality'
  ) then
    return;
  end if;

  insert into public.species_seasonality (latin_name, best_month, total_obs, peak_start, peak_end) values
    ('Turdus migratorius', to_char(current_date, 'Mon'), 50000, 'Oct', 'Apr'),
    ('Danaus plexippus', to_char(current_date, 'Mon'), 32000, 'Oct', 'Mar'),
    ('Alligator mississippiensis', to_char(current_date, 'Mon'), 28000, 'Jan', 'Dec'),
    ('Quercus virginiana', to_char(current_date, 'Mon'), 41000, 'Jan', 'Dec'),
    ('Sabal palmetto', to_char(current_date, 'Mon'), 38000, 'Jan', 'Dec')
  on conflict (latin_name) do update set
    best_month = excluded.best_month,
    total_obs = excluded.total_obs,
    peak_start = excluded.peak_start,
    peak_end = excluded.peak_end,
    updated_at = now();
end;
$$;

create or replace function public.florida_seed_parks()
returns void language plpgsql as $$
begin
  insert into public.parks (id, name, lat, lng, county, state, description) values
    ('a1000001-0001-4001-8001-000000000001', 'Everglades National Park', 25.286615, -80.898650, 'Miami-Dade / Monroe', 'Florida', 'Subtropical wetlands — alligators, wading birds, and sawgrass prairies.'),
    ('a1000001-0001-4001-8001-000000000002', 'Dry Tortugas National Park', 24.628500, -82.873200, 'Monroe', 'Florida', 'Remote islands and reef — seabirds, sea turtles, and clear water.'),
    ('a1000001-0001-4001-8001-000000000003', 'Myakka River State Park', 27.241000, -82.316700, 'Sarasota', 'Florida', 'River, prairie, and oak hammocks east of Sarasota.'),
    ('a1000001-0001-4001-8001-000000000004', 'Wekiwa Springs State Park', 28.709000, -81.458000, 'Orange', 'Florida', 'Spring run and mesic flatwoods north of Orlando.'),
    ('a1000001-0001-4001-8001-000000000005', 'Corkscrew Swamp Sanctuary', 26.375000, -81.519000, 'Collier', 'Florida', 'Old-growth cypress swamp and boardwalk near Naples.'),
    ('a1000001-0001-4001-8001-000000000006', 'Bill Baggs Cape Florida State Park', 25.666000, -80.154000, 'Miami-Dade', 'Florida', 'Coastal hammock and beach at the tip of Key Biscayne.')
  on conflict (id) do update set
    name = excluded.name,
    lat = excluded.lat,
    lng = excluded.lng,
    county = excluded.county,
    state = excluded.state,
    description = excluded.description,
    updated_at = now();
end;
$$;

create or replace function public.florida_seed_park_species()
returns void language plpgsql as $$
begin
  insert into public.park_species (park_id, latin_name, common_name, category, iconic_taxon_name, observations_count) values
    ('a1000001-0001-4001-8001-000000000001', 'Alligator mississippiensis', 'American Alligator', 'reptile', 'Reptilia', 12400),
    ('a1000001-0001-4001-8001-000000000001', 'Ardea alba', 'Great Egret', 'bird', 'Aves', 9800),
    ('a1000001-0001-4001-8001-000000000001', 'Trichechus manatus', 'West Indian Manatee', 'mammal', 'Mammalia', 2100),
    ('a1000001-0001-4001-8001-000000000003', 'Turdus migratorius', 'American Robin', 'bird', 'Aves', 4500),
    ('a1000001-0001-4001-8001-000000000003', 'Serenoa repens', 'Saw Palmetto', 'plant', 'Plantae', 1800),
    ('a1000001-0001-4001-8001-000000000005', 'Quercus virginiana', 'Live Oak', 'plant', 'Plantae', 3200),
    ('a1000001-0001-4001-8001-000000000005', 'Tillandsia usneoides', 'Spanish Moss', 'plant', 'Plantae', 2800)
  on conflict (park_id, latin_name) do update set
    common_name = excluded.common_name,
    category = excluded.category,
    iconic_taxon_name = excluded.iconic_taxon_name,
    observations_count = excluded.observations_count;
end;
$$;

create or replace function public.florida_rotate_featured()
returns void language plpgsql as $$
begin
  perform public.rotate_featured_species();
exception
  when undefined_function then
    raise warning 'rotate_featured_species missing — run sql/discover/create_featured_rotation.sql then: select rotate_featured_species();';
end;
$$;
