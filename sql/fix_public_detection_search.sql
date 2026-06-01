-- Fix Explorer Board search returning no results when gallery search works.
-- Safe to re-run. Requires helpers from add_detection_search.sql.
--
-- After running: Supabase → Settings → API → Reload schema cache.

create or replace function public.detection_tokens_match_haystack(
  p_haystack text,
  p_query text
)
returns boolean
language sql
immutable
as $$
  select case
    when trim(coalesce(p_query, '')) = '' then true
    when trim(coalesce(p_haystack, '')) = '' then false
    else not exists (
      select 1
      from regexp_split_to_table(lower(trim(p_query)), '\s+') as w(word)
      where length(word) > 0
        and position(word in lower(trim(p_haystack))) = 0
    )
  end;
$$;

create or replace function public.detection_row_matches_search_query(
  p_common_name text,
  p_latin_name text,
  p_description text,
  p_category text,
  p_subcategory text,
  p_main_category text,
  p_query text
)
returns boolean
language sql
immutable
as $$
  select public.detection_tokens_match_haystack(
    trim(
      concat_ws(
        ' ',
        trim(coalesce(p_common_name, '')),
        trim(coalesce(p_latin_name, '')),
        public.normalize_latin_name_for_search(p_latin_name),
        public.latin_genus_for_search(p_latin_name),
        trim(coalesce(p_description, '')),
        public.taxonomy_tokens_for_search(p_category, p_subcategory, p_main_category)
      )
    ),
    p_query
  );
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

-- Then run sql/search_public_detections.sql in the same session (updates the RPC body).
