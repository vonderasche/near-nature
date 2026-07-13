-- Fix: operator does not exist: text %> text
-- After harden_security_linter.sql moves pg_trgm to the extensions schema, search
-- helpers must include extensions in search_path for the %> trigram operator.
-- Safe to re-run.

create or replace function public.detection_matches_search_query(
  p_search_text text,
  p_search_vector tsvector,
  p_query text
)
returns boolean
language plpgsql
immutable
set search_path = public, extensions, pg_catalog
as $$
declare
  v_query text := lower(trim(coalesce(p_query, '')));
begin
  if v_query = '' then
    return true;
  end if;

  if coalesce(p_search_text, '') <> '' and not exists (
    select 1
    from regexp_split_to_table(v_query, '\s+') as w(word)
    where length(word) > 0
      and position(word in p_search_text) = 0
  ) then
    return true;
  end if;

  if length(v_query) >= 3 then
    return (
      coalesce(p_search_vector, ''::tsvector) @@ websearch_to_tsquery('english', v_query)
      or coalesce(p_search_text, '') %> v_query
    );
  end if;

  return false;
end;
$$;

drop function if exists public.search_public_detections(text, integer, integer);

create or replace function public.search_public_detections(
  p_query text default '',
  p_offset integer default 0,
  p_limit integer default 18
)
returns table (
  id uuid,
  user_id uuid,
  username text,
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
security definer
set search_path = public, extensions, pg_catalog
as $$
declare
  v_query text := trim(coalesce(p_query, ''));
  v_limit integer := greatest(1, least(coalesce(p_limit, 18), 50));
  v_offset integer := greatest(0, coalesce(p_offset, 0));
begin
  if v_query = '' then
    return;
  end if;

  return query
  with base as (
    select
      d.id,
      d.user_id,
      u.username,
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
    inner join public.users u on u.id = d.user_id
    where d.is_sensitive = false
      and (
        public.detection_matches_search_query(d.search_text, d.search_vector, v_query)
        or public.detection_row_matches_search_query(
          d.common_name,
          d.latin_name,
          d.description,
          d.category::text,
          d.subcategory,
          d.main_category,
          v_query
        )
        or u.username ilike '%' || v_query || '%'
      )
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

revoke all on function public.search_public_detections(text, integer, integer) from public;
grant execute on function public.search_public_detections(text, integer, integer) to authenticated;
grant execute on function public.search_public_detections(text, integer, integer) to anon;

notify pgrst, 'reload schema';
