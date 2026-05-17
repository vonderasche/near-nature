-- Aggregate park counts for Discover hub (avoids loading full park rows).
-- Safe to re-run.

drop function if exists public.get_park_summary_for_state(text);

create or replace function public.get_park_summary_for_state(p_state text)
returns table (
  park_count         bigint,
  species_sightings  bigint
)
language sql
security definer
set search_path = public
stable
as $$
  select
    count(*)::bigint as park_count,
    coalesce(sum(pwc.total_species), 0)::bigint as species_sightings
  from public.parks_with_counts pwc
  where pwc.state = trim(p_state);
$$;

revoke all on function public.get_park_summary_for_state(text) from public;
grant execute on function public.get_park_summary_for_state(text) to authenticated;
