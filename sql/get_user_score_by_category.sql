-- Per-discipline score breakdown (detection points + milestone/badge awards + species count).
-- Owner-only: auth.uid() must match p_user_id.
-- Requires: add_detection_naturalist_columns.sql (discovery_canonical_* helpers)
-- Safe to re-run.

create or replace function public.award_key_to_main_category(p_award_key text)
returns text
language sql
immutable
as $$
  select case
    when p_award_key like 'main:%' then split_part(p_award_key, ':', 2)
    when p_award_key like 'sub:%' then public.subcategory_to_main(split_part(p_award_key, ':', 2))
    when p_award_key like 'badge:true_voyager:%' then split_part(p_award_key, ':', 3)
    when p_award_key = 'badge:ends_of_the_earth' then '_global'
    else null
  end;
$$;

drop function if exists public.get_user_score_by_category(uuid);

create or replace function public.get_user_score_by_category(p_user_id uuid)
returns table (
  main_category   text,
  detection_points bigint,
  award_points     bigint,
  total_points     bigint,
  species_count    bigint
)
language plpgsql
security definer
set search_path = public
stable
as $$
begin
  if auth.uid() is null or auth.uid() <> p_user_id then
    return;
  end if;

  return query
  with mains as (
    select * from (values
      ('botanist'),
      ('herpetologist'),
      ('ornithologist'),
      ('mammalogist'),
      ('entomologist'),
      ('arachnologist'),
      ('ichthyologist'),
      ('mycologist')
    ) as t(main_category)
  ),
  det as (
    select
      coalesce(
        public.discovery_canonical_main(d.category::text, d.subcategory, d.main_category),
        '_unknown'
      ) as mc,
      sum(d.points)::bigint as pts
    from public.detections d
    where d.user_id = p_user_id
    group by 1
  ),
  disc as (
    select
      coalesce(
        public.discovery_canonical_main(disc.category::text, disc.subcategory, disc.main_category),
        '_unknown'
      ) as mc,
      count(distinct disc.latin_name)::bigint as cnt
    from public.discoveries disc
    where disc.user_id = p_user_id
    group by 1
  ),
  aw as (
    select
      coalesce(public.award_key_to_main_category(pa.award_key), '_unknown') as mc,
      sum(pa.points)::bigint as pts
    from public.point_awards pa
    where pa.user_id = p_user_id
    group by 1
  ),
  combined as (
    select
      m.main_category,
      coalesce(det.pts, 0)::bigint as detection_points,
      coalesce(aw.pts, 0)::bigint as award_points,
      coalesce(disc.cnt, 0)::bigint as species_count
    from mains m
    left join det on det.mc = m.main_category
    left join aw on aw.mc = m.main_category
    left join disc on disc.mc = m.main_category
  ),
  extras as (
    select
      e.mc as main_category,
      coalesce(det.pts, 0)::bigint as detection_points,
      coalesce(aw.pts, 0)::bigint as award_points,
      coalesce(disc.cnt, 0)::bigint as species_count
    from (
      select distinct mc
      from (
        select mc from det
        union
        select mc from aw
        union
        select mc from disc
      ) u
      where mc not in (
        'botanist', 'herpetologist', 'ornithologist', 'mammalogist',
        'entomologist', 'arachnologist', 'ichthyologist', 'mycologist'
      )
    ) e
    left join det on det.mc = e.mc
    left join aw on aw.mc = e.mc
    left join disc on disc.mc = e.mc
  )
  select
    c.main_category,
    c.detection_points,
    c.award_points,
    c.detection_points + c.award_points as total_points,
    c.species_count
  from combined c
  union all
  select
    e.main_category,
    e.detection_points,
    e.award_points,
    e.detection_points + e.award_points,
    e.species_count
  from extras e
  where e.detection_points > 0
     or e.award_points > 0
     or e.species_count > 0
  order by 1;
end;
$$;

revoke all on function public.get_user_score_by_category(uuid) from public;
grant execute on function public.get_user_score_by_category(uuid) to authenticated;
