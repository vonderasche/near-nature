-- Community discovery: search public (non-sensitive) identifications across all members.
-- Requires: create_detections.sql, add_detection_search.sql (search_text / search_vector).
-- Safe to re-run.

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
security invoker
set search_path = public
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
