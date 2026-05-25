-- Gallery browse/search optimizations (safe to re-run on existing projects).
-- Requires: add_detection_search.sql applied.
-- After running: reload schema cache.

-- ── 1. Composite + partial indexes; drop redundant trigram indexes ───────────

create index if not exists detections_user_detected_at_idx
  on public.detections (user_id, detected_at desc);

create index if not exists detections_public_gallery_idx
  on public.detections (user_id, detected_at desc)
  where is_sensitive = false;

drop index if exists public.detections_latin_normalized_trgm_idx;
drop index if exists public.detections_common_name_trgm_idx;

-- ── 2. Category filter helper (mirrors app gallery filter) ─────────────────────

create or replace function public.normalize_species_category_for_gallery(p_category text)
returns text
language sql
immutable
as $$
  select case trim(coalesce(p_category, ''))
    when 'mammal' then 'small_mammals'
    when 'reptile' then 'lizards'
    when 'fish' then 'freshwater_fish'
    when 'insect' then 'small_mammals'
    when 'bird' then 'songbirds'
    when 'amphibian' then 'frogs_toads'
    when 'plant_tree' then 'trees_shrubs'
    when 'plant_flower' then 'wildflowers'
    when 'plant_other' then 'trees_shrubs'
    when 'flowers' then 'wildflowers'
    when 'trees' then 'trees_shrubs'
    when 'shrubs' then 'trees_shrubs'
    when 'ferns' then 'ferns_mosses'
    when 'mosses_lichens' then 'ferns_mosses'
    when 'grasses_sedges' then 'wildflowers'
    when 'vines' then 'trees_shrubs'
    when 'succulents_cacti' then 'cacti_succulents'
    else trim(coalesce(p_category, ''))
  end;
$$;

create or replace function public.detection_matches_gallery_category_filter(
  p_category text,
  p_subcategory text,
  p_main_category text,
  p_filter_group text,
  p_filter_subcategory text
)
returns boolean
language sql
immutable
as $$
  select case
    when nullif(trim(coalesce(p_filter_subcategory, '')), '') is not null then
      coalesce(nullif(trim(p_subcategory), ''), public.normalize_species_category_for_gallery(p_category))
        = trim(p_filter_subcategory)
    when nullif(trim(coalesce(p_filter_group, '')), '') = 'plant' then
      trim(coalesce(p_main_category, '')) = 'botanist'
      or coalesce(nullif(trim(p_subcategory), ''), public.normalize_species_category_for_gallery(p_category)) in (
        'wildflowers', 'trees_shrubs', 'ferns_mosses'
      )
      or trim(p_category) in (
        'plant_tree', 'plant_flower', 'plant_other', 'trees', 'shrubs', 'flowers',
        'grasses_sedges', 'ferns', 'mosses_lichens', 'vines', 'succulents_cacti'
      )
      or trim(p_category) like 'plant\_%' escape '\'
    when nullif(trim(coalesce(p_filter_group, '')), '') = 'animal' then
      trim(coalesce(p_main_category, '')) in ('herpetologist', 'ornithologist', 'mammalogist')
      or coalesce(nullif(trim(p_subcategory), ''), public.normalize_species_category_for_gallery(p_category)) in (
        'lizards', 'snakes', 'frogs_toads', 'turtles_tortoises', 'salamanders',
        'songbirds', 'raptors', 'wading_birds', 'waterfowl', 'shorebirds',
        'small_mammals', 'deer_hoofed', 'bats', 'marine_mammals', 'carnivores'
      )
      or trim(p_category) in (
        'mammal', 'reptile', 'fish', 'insect', 'bird', 'amphibian',
        'lizards', 'snakes', 'frogs_toads', 'turtles_tortoises', 'salamanders',
        'songbirds', 'raptors', 'wading_birds', 'waterfowl', 'shorebirds',
        'small_mammals', 'deer_hoofed', 'bats', 'marine_mammals', 'carnivores'
      )
    else true
  end;
$$;

-- ── 3. Search match helper (token match; FTS/trigram only for longer queries) ─

create or replace function public.detection_matches_search_query(
  p_search_text text,
  p_search_vector tsvector,
  p_query text
)
returns boolean
language plpgsql
immutable
as $$
declare
  v_query text := lower(trim(coalesce(p_query, '')));
begin
  if v_query = '' then
    return true;
  end if;

  if not exists (
    select 1
    from regexp_split_to_table(v_query, '\s+') as w(word)
    where length(word) > 0
      and position(word in coalesce(p_search_text, '')) = 0
  ) then
    return true;
  end if;

  if length(v_query) < 3 then
    return false;
  end if;

  return (
    p_search_vector @@ websearch_to_tsquery('english', v_query)
    or coalesce(p_search_text, '') %> v_query
  );
end;
$$;

-- ── 4. Unified gallery list/search RPC ─────────────────────────────────────────

drop function if exists public.search_user_detections(uuid, text, boolean, integer, integer);

create or replace function public.search_user_detections(
  p_user_id uuid,
  p_query text default '',
  p_public_only boolean default false,
  p_offset integer default 0,
  p_limit integer default 18,
  p_filter_group text default null,
  p_filter_subcategory text default null
)
returns table (
  id uuid,
  image_url text,
  detected_at timestamptz,
  common_name text,
  latin_name text,
  category public.species_category,
  subcategory text,
  main_category text,
  description text,
  native_status public.native_status,
  total_count bigint
)
language plpgsql
stable
security invoker
set search_path = public
as $$
declare
  v_query text := trim(coalesce(p_query, ''));
  v_limit integer := greatest(1, least(coalesce(p_limit, 18), 50));
  v_offset integer := greatest(0, coalesce(p_offset, 0));
begin
  if auth.uid() is null then
    raise exception 'Not authenticated';
  end if;

  return query
  with base as (
    select
      d.id,
      d.image_url,
      d.detected_at,
      d.common_name,
      d.latin_name,
      d.category,
      d.subcategory,
      d.main_category,
      d.description,
      d.native_status
    from public.detections d
    where d.user_id = p_user_id
      and (not p_public_only or d.is_sensitive = false)
      and public.detection_matches_gallery_category_filter(
        d.category::text,
        d.subcategory,
        d.main_category,
        p_filter_group,
        p_filter_subcategory
      )
      and public.detection_matches_search_query(d.search_text, d.search_vector, v_query)
  ),
  numbered as (
    select
      b.*,
      count(*) over () as total_count
    from base b
    order by b.detected_at desc
    offset v_offset
    limit v_limit
  )
  select * from numbered;
end;
$$;

revoke all on function public.search_user_detections(uuid, text, boolean, integer, integer, text, text) from public;
grant execute on function public.search_user_detections(uuid, text, boolean, integer, integer, text, text) to authenticated;

-- ── 5. Refresh detection search when species_metadata aliases change ───────────

create or replace function public.refresh_detections_search_for_species_metadata()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.detections d
  set
    latin_name_normalized = public.normalize_latin_name_for_search(d.latin_name),
    search_text = public.build_detection_search_text(
      d.common_name,
      d.latin_name,
      d.description,
      d.category::text,
      d.subcategory,
      d.main_category,
      new.aliases
    ),
    search_vector = public.build_detection_search_vector(
      d.common_name,
      d.latin_name,
      d.description,
      d.category::text,
      d.subcategory,
      d.main_category,
      new.aliases
    )
  where lower(trim(d.latin_name)) = lower(trim(new.latin_name));

  return new;
end;
$$;

drop trigger if exists refresh_detections_search_on_species_metadata on public.species_metadata;
create trigger refresh_detections_search_on_species_metadata
  after insert or update of aliases, common_name
  on public.species_metadata
  for each row execute function public.refresh_detections_search_for_species_metadata();
