-- Shared genus/species catalog (bundled seed + community proposals from cloud ID).
-- Requires: add_detection_search.sql (normalize_latin_name_for_search)
-- Safe to re-run.

create table if not exists public.species_catalog (
  id                          text primary key,
  scientific_name             text not null,
  scientific_name_normalized  text not null,
  common_name                 text not null default '',
  taxon_group                 text not null default '',
  florida_status              text not null default 'unknown',
  family                      text,
  genus                       text,
  description                 text not null default '',
  identification_traits       jsonb not null default '[]'::jsonb,
  interesting_facts           jsonb not null default '[]'::jsonb,
  source_urls                 jsonb not null default '{}'::jsonb,
  inat_taxon_id               bigint,
  specialist_id               text,
  catalog_source              text not null default 'bundled'
    check (catalog_source in ('bundled', 'community', 'enrichment')),
  proposed_by                 uuid references auth.users (id) on delete set null,
  updated_at                  timestamptz not null default now()
);

create index if not exists species_catalog_updated_at_idx
  on public.species_catalog (updated_at);

create index if not exists species_catalog_scientific_norm_idx
  on public.species_catalog (scientific_name_normalized);

alter table public.species_catalog enable row level security;

-- Reads/writes go through SECURITY DEFINER RPCs (same pattern as species_metadata).

create or replace function public.sync_species_catalog(
  p_updated_after timestamptz default null,
  p_limit int default 500,
  p_offset int default 0,
  p_catalog_sources text[] default null
)
returns table (
  id text,
  scientific_name text,
  common_name text,
  taxon_group text,
  florida_status text,
  family text,
  genus text,
  description text,
  identification_traits jsonb,
  interesting_facts jsonb,
  source_urls jsonb,
  inat_taxon_id bigint,
  specialist_id text,
  catalog_source text,
  updated_at timestamptz
)
language sql
stable
security definer
set search_path = pg_catalog, public
as $$
  select
    sc.id,
    sc.scientific_name,
    sc.common_name,
    sc.taxon_group,
    sc.florida_status,
    sc.family,
    sc.genus,
    sc.description,
    sc.identification_traits,
    sc.interesting_facts,
    sc.source_urls,
    sc.inat_taxon_id,
    sc.specialist_id,
    sc.catalog_source,
    sc.updated_at
  from public.species_catalog sc
  where (p_updated_after is null or sc.updated_at > p_updated_after)
    and (p_catalog_sources is null or sc.catalog_source = any (p_catalog_sources))
  order by sc.updated_at asc, sc.id asc
  limit greatest(1, least(coalesce(p_limit, 500), 1000))
  offset greatest(0, coalesce(p_offset, 0));
$$;

revoke all on function public.sync_species_catalog(timestamptz, int, int, text[]) from public;
grant execute on function public.sync_species_catalog(timestamptz, int, int, text[]) to authenticated;

create or replace function public.propose_species_catalog_entry(
  p_latin_name text,
  p_common_name text default null,
  p_taxon_group text default null,
  p_description text default null,
  p_florida_status text default 'unknown',
  p_inat_taxon_id bigint default null,
  p_source_urls jsonb default '{}'::jsonb,
  p_specialist_id text default null
)
returns text
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
declare
  v_latin text := trim(coalesce(p_latin_name, ''));
  v_genus text;
  v_norm text;
  v_existing public.species_catalog%rowtype;
  v_uid uuid := auth.uid();
begin
  if v_uid is null then
    raise exception 'Authentication required';
  end if;

  if v_latin = '' then
    return null;
  end if;

  v_genus := lower(split_part(v_latin, ' ', 1));
  if v_genus = '' then
    return null;
  end if;

  v_norm := public.normalize_latin_name_for_search(v_genus);

  select *
  into v_existing
  from public.species_catalog sc
  where sc.id = v_genus
     or sc.scientific_name_normalized = v_norm
  limit 1;

  if found then
    update public.species_catalog sc
    set
      common_name = case
        when coalesce(trim(p_common_name), '') <> '' and (sc.common_name = '' or sc.catalog_source in ('community', 'enrichment'))
          then trim(p_common_name)
        else sc.common_name
      end,
      taxon_group = coalesce(nullif(trim(p_taxon_group), ''), sc.taxon_group),
      description = case
        when coalesce(trim(p_description), '') <> '' and length(sc.description) < 40
          then trim(p_description)
        else sc.description
      end,
      florida_status = case
        when coalesce(trim(p_florida_status), 'unknown') <> 'unknown'
          then trim(p_florida_status)
        else sc.florida_status
      end,
      inat_taxon_id = coalesce(p_inat_taxon_id, sc.inat_taxon_id),
      source_urls = sc.source_urls || coalesce(p_source_urls, '{}'::jsonb),
      specialist_id = coalesce(nullif(trim(p_specialist_id), ''), sc.specialist_id),
      catalog_source = case
        when sc.catalog_source = 'bundled' then 'enrichment'
        else sc.catalog_source
      end,
      updated_at = now()
    where sc.id = v_existing.id;

    perform public.upsert_species_metadata(
      v_existing.scientific_name,
      coalesce(nullif(trim(p_common_name), ''), v_existing.common_name),
      '{}'::text[]
    );

    return v_existing.id;
  end if;

  insert into public.species_catalog (
    id,
    scientific_name,
    scientific_name_normalized,
    common_name,
    taxon_group,
    florida_status,
    family,
    genus,
    description,
    identification_traits,
    interesting_facts,
    source_urls,
    inat_taxon_id,
    specialist_id,
    catalog_source,
    proposed_by,
    updated_at
  )
  values (
    v_genus,
    initcap(v_genus),
    v_norm,
    coalesce(nullif(trim(p_common_name), ''), initcap(v_genus)),
    coalesce(nullif(trim(p_taxon_group), ''), ''),
    coalesce(nullif(trim(p_florida_status), ''), 'unknown'),
    null,
    initcap(v_genus),
    coalesce(trim(p_description), ''),
    '[]'::jsonb,
    '[]'::jsonb,
    coalesce(p_source_urls, '{}'::jsonb),
    p_inat_taxon_id,
    nullif(trim(p_specialist_id), ''),
    'community',
    v_uid,
    now()
  );

  perform public.upsert_species_metadata(
    initcap(v_genus),
    coalesce(nullif(trim(p_common_name), ''), initcap(v_genus)),
    '{}'::text[]
  );

  return v_genus;
end;
$$;

revoke all on function public.propose_species_catalog_entry(
  text, text, text, text, text, bigint, jsonb, text
) from public;
revoke execute on function public.propose_species_catalog_entry(
  text, text, text, text, text, bigint, jsonb, text
) from anon;
grant execute on function public.propose_species_catalog_entry(
  text, text, text, text, text, bigint, jsonb, text
) to authenticated;
