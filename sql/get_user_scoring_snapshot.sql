-- Owner-only scoring snapshot: score breakdown, awards, and species counts (one round trip).
-- Requires: get_user_score_by_category.sql, add_detection_naturalist_columns.sql
-- Safe to re-run.

drop function if exists public.get_user_scoring_snapshot(uuid);

create or replace function public.get_user_scoring_snapshot(p_user_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
stable
as $$
declare
  result jsonb;
begin
  if auth.uid() is null or auth.uid() <> p_user_id then
    return null;
  end if;

  select jsonb_build_object(
    'score_rows', coalesce((
      select jsonb_agg(
        jsonb_build_object(
          'main_category', s.main_category,
          'detection_points', s.detection_points,
          'award_points', s.award_points,
          'total_points', s.total_points,
          'species_count', s.species_count
        )
        order by s.main_category
      )
      from public.get_user_score_by_category(p_user_id) s
    ), '[]'::jsonb),
    'awards', coalesce((
      select jsonb_agg(
        jsonb_build_object(
          'award_key', pa.award_key,
          'points', pa.points,
          'label', pa.label,
          'awarded_at', pa.awarded_at
        )
        order by pa.awarded_at desc
      )
      from public.point_awards pa
      where pa.user_id = p_user_id
    ), '[]'::jsonb),
    'sub_species_counts', coalesce((
      select jsonb_agg(
        jsonb_build_object(
          'subcategory', agg.subcategory,
          'species_count', agg.species_count
        )
        order by agg.subcategory
      )
      from (
        select
          public.discovery_canonical_subcategory(d.category::text, d.subcategory) as subcategory,
          count(distinct lower(trim(d.latin_name)))::bigint as species_count
        from public.discoveries d
        where d.user_id = p_user_id
          and public.discovery_canonical_subcategory(d.category::text, d.subcategory) is not null
        group by 1
      ) agg
    ), '[]'::jsonb),
    'main_species_counts', coalesce((
      select jsonb_agg(
        jsonb_build_object(
          'main_category', agg.main_category,
          'species_count', agg.species_count
        )
        order by agg.main_category
      )
      from (
        select
          public.discovery_canonical_main(d.category::text, d.subcategory, d.main_category) as main_category,
          count(distinct lower(trim(d.latin_name)))::bigint as species_count
        from public.discoveries d
        where d.user_id = p_user_id
          and public.discovery_canonical_main(d.category::text, d.subcategory, d.main_category) is not null
        group by 1
      ) agg
    ), '[]'::jsonb)
  )
  into result;

  return result;
end;
$$;

revoke all on function public.get_user_scoring_snapshot(uuid) from public;
grant execute on function public.get_user_scoring_snapshot(uuid) to authenticated;
