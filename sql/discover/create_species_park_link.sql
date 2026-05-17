-- Safe to re-run
-- Links explore_species to parks via park_species
-- Adds helper functions for the app

-- Function: get species found at a specific park
create or replace function get_park_species(
  p_park_id  uuid,
  p_category text default null    -- optional filter: bird, mammal, etc.
)
returns table (
  latin_name          text,
  common_name         text,
  category            text,
  iconic_taxon_name   text,
  observations_count  int,
  image_url           text,
  inaturalist_id      int,
  is_in_explore       boolean,    -- true if in the top Florida species list
  is_native           boolean     -- null if unknown
) as $$
begin
  return query
  select
    ps.latin_name,
    ps.common_name,
    ps.category,
    ps.iconic_taxon_name,
    ps.observations_count,
    ps.image_url,
    ps.inaturalist_id,
    (es.id is not null)     as is_in_explore,
    null::boolean           as is_native   -- populated by iNaturalist API in app
  from public.park_species ps
  left join public.explore_species es
    on es.latin_name = ps.latin_name
  where ps.park_id = p_park_id
    and (p_category is null or ps.category = p_category)
  order by ps.observations_count desc;
end;
$$ language plpgsql security definer;


-- Function: get parks where a species has been observed
create or replace function get_parks_for_species(
  p_latin_name text
)
returns table (
  park_id    uuid,
  park_name  text,
  county     text,
  lat        numeric,
  lng        numeric,
  obs_count  int
) as $$
begin
  return query
  select
    p.id,
    p.name,
    p.county,
    p.lat,
    p.lng,
    ps.observations_count
  from public.park_species ps
  join public.parks p on p.id = ps.park_id
  where ps.latin_name = p_latin_name
  order by ps.observations_count desc;
end;
$$ language plpgsql security definer;


-- Function: get nearby parks within a radius (in km)
create or replace function get_nearby_parks(
  p_lat      numeric,
  p_lng      numeric,
  p_radius   numeric default 50   -- km
)
returns table (
  park_id        uuid,
  name           text,
  county         text,
  lat            numeric,
  lng            numeric,
  distance_km    numeric,
  total_species  bigint,
  bird_count     bigint,
  mammal_count   bigint
) as $$
begin
  return query
  select
    p.id,
    p.name,
    p.county,
    p.lat,
    p.lng,
    -- Haversine approximation in km
    round(
      (6371 * acos(
        cos(radians(p_lat)) * cos(radians(p.lat)) *
        cos(radians(p.lng) - radians(p_lng)) +
        sin(radians(p_lat)) * sin(radians(p.lat))
      ))::numeric, 1
    )                                                     as distance_km,
    count(ps.id)                                          as total_species,
    count(ps.id) filter (where ps.category = 'bird')     as bird_count,
    count(ps.id) filter (where ps.category = 'mammal')   as mammal_count
  from public.parks p
  left join public.park_species ps on ps.park_id = p.id
  where (
    6371 * acos(
      cos(radians(p_lat)) * cos(radians(p.lat)) *
      cos(radians(p.lng) - radians(p_lng)) +
      sin(radians(p_lat)) * sin(radians(p.lat))
    )
  ) <= p_radius
  group by p.id, p.name, p.county, p.lat, p.lng
  order by distance_km asc;
end;
$$ language plpgsql security definer;
