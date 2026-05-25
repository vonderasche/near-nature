-- Detection search: normalized Latin names, denormalized search_text, FTS, trigram, species aliases.
-- Requires: create_detections.sql, add_detection_naturalist_columns.sql
-- Safe to re-run.

create schema if not exists extensions;
create extension if not exists pg_trgm with schema extensions;
grant usage on schema extensions to postgres, anon, authenticated, service_role;

-- ── Shared species aliases (synonyms / alternate common names) ───────────────

create table if not exists public.species_metadata (
  latin_name              text primary key,
  latin_name_normalized   text not null,
  common_name             text,
  aliases                 text[] not null default '{}',
  updated_at              timestamptz not null default now()
);

create index if not exists species_metadata_latin_norm_trgm_idx
  on public.species_metadata using gin (latin_name_normalized extensions.gin_trgm_ops);

alter table public.species_metadata enable row level security;

drop policy if exists "Authenticated users can read species metadata" on public.species_metadata;
create policy "Authenticated users can read species metadata"
  on public.species_metadata for select
  to authenticated
  using (true);

drop policy if exists "Authenticated users can upsert species metadata" on public.species_metadata;
create policy "Authenticated users can upsert species metadata"
  on public.species_metadata for insert
  to authenticated
  with check (true);

drop policy if exists "Authenticated users can update species metadata" on public.species_metadata;
create policy "Authenticated users can update species metadata"
  on public.species_metadata for update
  to authenticated
  using (true)
  with check (true);

-- ── Normalize Latin / scientific names for search ───────────────────────────

create or replace function public.normalize_latin_name_for_search(p_latin text)
returns text
language plpgsql
immutable
as $$
declare
  v text := trim(coalesce(p_latin, ''));
begin
  while v ~ '\([^)]*\)' loop
    v := regexp_replace(v, '\s*\([^)]*\)', '', 'g');
  end loop;
  v := trim(split_part(v, ',', 1));
  v := lower(regexp_replace(v, '\s+', ' ', 'g'));
  return trim(v);
end;
$$;

create or replace function public.latin_genus_for_search(p_latin text)
returns text
language sql
immutable
as $$
  select nullif(split_part(public.normalize_latin_name_for_search(p_latin), ' ', 1), '');
$$;

-- Human-readable taxonomy tokens for search_text (underscores → spaces).
create or replace function public.taxonomy_tokens_for_search(
  p_category text,
  p_subcategory text,
  p_main_category text
)
returns text
language sql
immutable
as $$
  select trim(
    concat_ws(
      ' ',
      replace(coalesce(nullif(trim(p_main_category), ''), ''), '_', ' '),
      replace(coalesce(nullif(trim(p_subcategory), ''), ''), '_', ' '),
      replace(coalesce(nullif(trim(p_category), ''), ''), '_', ' ')
    )
  );
$$;

create or replace function public.merge_species_aliases(
  p_existing text[],
  p_new text[]
)
returns text[]
language sql
immutable
as $$
  select coalesce(
    (
      select array_agg(distinct lower(trim(a)) order by lower(trim(a)))
      from (
        select unnest(coalesce(p_existing, '{}'::text[])) as a
        union
        select unnest(coalesce(p_new, '{}'::text[])) as a
      ) s
      where length(trim(a)) > 0
    ),
    '{}'::text[]
  );
$$;

create or replace function public.upsert_species_metadata(
  p_latin_name text,
  p_common_name text default null,
  p_aliases text[] default '{}'
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_latin text := trim(coalesce(p_latin_name, ''));
  v_norm text;
  v_existing text[];
  v_merged text[];
begin
  if v_latin = '' then
    return;
  end if;

  v_norm := public.normalize_latin_name_for_search(v_latin);

  select sm.aliases
  into v_existing
  from public.species_metadata sm
  where sm.latin_name = v_latin;

  v_merged := public.merge_species_aliases(
    v_existing,
    array_remove(
      array_cat(
        coalesce(p_aliases, '{}'::text[]),
        case when nullif(trim(coalesce(p_common_name, '')), '') is null
          then '{}'::text[]
          else array[trim(p_common_name)]
        end
      ),
      null
    )
  );

  insert into public.species_metadata (latin_name, latin_name_normalized, common_name, aliases, updated_at)
  values (v_latin, v_norm, nullif(trim(coalesce(p_common_name, '')), ''), v_merged, now())
  on conflict (latin_name) do update
  set
    latin_name_normalized = excluded.latin_name_normalized,
    common_name = coalesce(excluded.common_name, public.species_metadata.common_name),
    aliases = public.merge_species_aliases(public.species_metadata.aliases, excluded.aliases),
    updated_at = now();

  update public.detections d
  set
    latin_name_normalized = v_norm,
    search_text = public.build_detection_search_text(
      d.common_name,
      d.latin_name,
      d.description,
      d.category::text,
      d.subcategory,
      d.main_category,
      v_merged
    ),
    search_vector = public.build_detection_search_vector(
      d.common_name,
      d.latin_name,
      d.description,
      d.category::text,
      d.subcategory,
      d.main_category,
      v_merged
    )
  where lower(trim(d.latin_name)) = lower(v_latin);
end;
$$;

revoke all on function public.upsert_species_metadata(text, text, text[]) from public;
revoke execute on function public.upsert_species_metadata(text, text, text[]) from anon;
grant execute on function public.upsert_species_metadata(text, text, text[]) to authenticated;

-- ── Denormalized search columns on detections ─────────────────────────────────

alter table public.detections
  add column if not exists latin_name_normalized text,
  add column if not exists search_text text,
  add column if not exists search_vector tsvector;

create or replace function public.build_detection_search_text(
  p_common_name text,
  p_latin_name text,
  p_description text,
  p_category text,
  p_subcategory text,
  p_main_category text,
  p_aliases text[]
)
returns text
language sql
immutable
as $$
  select lower(
    trim(
      concat_ws(
        ' ',
        trim(coalesce(p_common_name, '')),
        trim(coalesce(p_latin_name, '')),
        public.normalize_latin_name_for_search(p_latin_name),
        public.latin_genus_for_search(p_latin_name),
        trim(coalesce(p_description, '')),
        public.taxonomy_tokens_for_search(p_category, p_subcategory, p_main_category),
        array_to_string(coalesce(p_aliases, '{}'::text[]), ' ')
      )
    )
  );
$$;

create or replace function public.build_detection_search_vector(
  p_common_name text,
  p_latin_name text,
  p_description text,
  p_category text,
  p_subcategory text,
  p_main_category text,
  p_aliases text[]
)
returns tsvector
language sql
immutable
as $$
  select
    setweight(to_tsvector('english', coalesce(nullif(trim(p_common_name), ''), '')), 'A')
    || setweight(to_tsvector('simple', coalesce(public.normalize_latin_name_for_search(p_latin_name), '')), 'A')
    || setweight(to_tsvector('simple', coalesce(public.latin_genus_for_search(p_latin_name), '')), 'B')
    || setweight(to_tsvector('english', coalesce(nullif(trim(p_description), ''), '')), 'C')
    || setweight(
      to_tsvector('english', public.taxonomy_tokens_for_search(p_category, p_subcategory, p_main_category)),
      'B'
    )
    || setweight(to_tsvector('english', coalesce(array_to_string(p_aliases, ' '), '')), 'B');
$$;

create or replace function public.sync_detection_search_fields()
returns trigger
language plpgsql
as $$
declare
  v_aliases text[];
  v_norm text;
begin
  v_norm := public.normalize_latin_name_for_search(new.latin_name);

  select coalesce(sm.aliases, '{}'::text[])
  into v_aliases
  from public.species_metadata sm
  where lower(trim(sm.latin_name)) = lower(trim(new.latin_name));

  new.latin_name_normalized := v_norm;
  new.search_text := public.build_detection_search_text(
    new.common_name,
    new.latin_name,
    new.description,
    new.category::text,
    new.subcategory,
    new.main_category,
    v_aliases
  );
  new.search_vector := public.build_detection_search_vector(
    new.common_name,
    new.latin_name,
    new.description,
    new.category::text,
    new.subcategory,
    new.main_category,
    v_aliases
  );

  return new;
end;
$$;

drop trigger if exists sync_detection_search_fields on public.detections;
create trigger sync_detection_search_fields
  before insert or update of
    common_name, latin_name, description, category, subcategory, main_category
  on public.detections
  for each row execute function public.sync_detection_search_fields();

-- Backfill existing rows
insert into public.species_metadata (latin_name, latin_name_normalized, common_name, aliases)
select distinct
  trim(d.latin_name),
  public.normalize_latin_name_for_search(d.latin_name),
  trim(d.common_name),
  '{}'::text[]
from public.detections d
where trim(d.latin_name) <> ''
on conflict (latin_name) do nothing;

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
    coalesce(sm.aliases, '{}'::text[])
  ),
  search_vector = public.build_detection_search_vector(
    d.common_name,
    d.latin_name,
    d.description,
    d.category::text,
    d.subcategory,
    d.main_category,
    coalesce(sm.aliases, '{}'::text[])
  )
from public.species_metadata sm
where lower(trim(sm.latin_name)) = lower(trim(d.latin_name));

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
    '{}'::text[]
  ),
  search_vector = public.build_detection_search_vector(
    d.common_name,
    d.latin_name,
    d.description,
    d.category::text,
    d.subcategory,
    d.main_category,
    '{}'::text[]
  )
where d.search_text is null;

create index if not exists detections_user_detected_at_idx
  on public.detections (user_id, detected_at desc);

create index if not exists detections_public_gallery_idx
  on public.detections (user_id, detected_at desc)
  where is_sensitive = false;

create index if not exists detections_search_vector_idx
  on public.detections using gin (search_vector);

create index if not exists detections_search_text_trgm_idx
  on public.detections using gin (search_text extensions.gin_trgm_ops);

-- ── Gallery category + search helpers ────────────────────────────────────────

create or replace function public.normalize_species_category_for_gallery(p_category text)
returns text
language sql
immutable
as $$
  select case trim(coalesce(p_category, ''))
    when 'mammal' then 'small_mammals'
    when 'reptile' then 'lizards'
    when 'fish' then 'small_mammals'
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

-- ── Server-side gallery list + search (FTS + trigram + token match) ────────────

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
