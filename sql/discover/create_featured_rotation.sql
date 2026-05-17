-- Safe to re-run
drop function if exists rotate_featured_species();
drop function if exists get_featured_species();

-- Function to rotate featured species every week
-- Call this via a Supabase cron job or manually each Monday
create or replace function rotate_featured_species()
returns void as $$
declare
  new_animal public.explore_species;
  new_plant  public.explore_species;
  week_start date := date_trunc('week', current_date)::date;
begin
  -- Clear current featured
  update public.explore_species
  set
    is_featured         = false,
    featured_week_start = null
  where is_featured = true;

  -- Pick a new featured animal
  -- Weighted toward iconic species and high observation counts
  select * into new_animal
  from public.explore_species
  where type = 'animals'
    and (
      -- Prefer species in season this month
      latin_name in (
        select latin_name from public.species_seasonality
        where best_month = to_char(current_date, 'Mon')
      )
      or is_iconic = true
    )
  order by
    is_iconic desc,
    observations_count desc,
    -- Avoid recently featured (if tracked)
    random()
  limit 1;

  -- Pick a new featured plant
  select * into new_plant
  from public.explore_species
  where type = 'plants'
    and (
      latin_name in (
        select latin_name from public.species_seasonality
        where best_month = to_char(current_date, 'Mon')
      )
      or is_iconic = true
    )
  order by
    is_iconic desc,
    observations_count desc,
    random()
  limit 1;

  -- Set new featured
  if new_animal.id is not null then
    update public.explore_species
    set
      is_featured         = true,
      featured_week_start = week_start,
      bonus_points        = 15       -- higher bonus for featured
    where id = new_animal.id;
    raise notice 'Featured animal: %', new_animal.common_name;
  end if;

  if new_plant.id is not null then
    update public.explore_species
    set
      is_featured         = true,
      featured_week_start = week_start,
      bonus_points        = 15
    where id = new_plant.id;
    raise notice 'Featured plant: %', new_plant.common_name;
  end if;
end;
$$ language plpgsql security definer;

-- Function to get current featured species
create or replace function get_featured_species()
returns table (
  id                  uuid,
  latin_name          text,
  common_name         text,
  type                text,
  image_url           text,
  wiki_image_url      text,
  wiki_summary        text,
  observations_count  int,
  iconic_taxon_name   text,
  bonus_points        int,
  featured_week_start date
) as $$
begin
  return query
  select
    es.id,
    es.latin_name,
    es.common_name,
    es.type,
    es.image_url,
    es.wiki_image_url,
    es.wiki_summary,
    es.observations_count,
    es.iconic_taxon_name,
    es.bonus_points,
    es.featured_week_start
  from public.explore_species es
  where es.is_featured = true
  order by es.type;  -- animals first, then plants
end;
$$ language plpgsql security definer;

-- Trigger bonus points when user finds a featured species
create or replace function check_featured_species_bonus()
returns trigger as $$
declare
  featured_species public.explore_species;
  bonus            int := 0;
begin
  -- Check if this detection matches a currently featured species
  select * into featured_species
  from public.explore_species
  where latin_name = new.latin_name
    and is_featured = true
  limit 1;

  if featured_species.id is not null then
    bonus := featured_species.bonus_points;

    update public.detections
    set points = points + bonus
    where id = new.id;

    raise notice 'Featured species bonus: +% pts for %',
      bonus, new.common_name;
  end if;

  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_detection_check_featured on public.detections;

create trigger on_detection_check_featured
  after insert on public.detections
  for each row execute function check_featured_species_bonus();

-- Run initial rotation
select rotate_featured_species();
