-- Awards category tier + badge points after a new discovery. Safe to re-run.
-- Badge thresholds and points are stored in public.badge_definitions.

create or replace function public.category_to_subcategory(cat text)
returns text
language sql
immutable
as $$
  select case lower(trim(cat))
    when 'wildflowers' then 'wildflowers'
    when 'trees_shrubs' then 'trees_shrubs'
    when 'ferns_mosses' then 'ferns_mosses'
    when 'aquatic_plants' then 'aquatic_plants'
    when 'cacti_succulents' then 'cacti_succulents'
    when 'succulents_cacti' then 'cacti_succulents'
    when 'flowers' then 'wildflowers'
    when 'trees' then 'trees_shrubs'
    when 'shrubs' then 'trees_shrubs'
    when 'ferns' then 'ferns_mosses'
    when 'mosses_lichens' then 'ferns_mosses'
    when 'grasses_sedges' then 'wildflowers'
    when 'vines' then 'trees_shrubs'
    when 'plant_tree' then 'trees_shrubs'
    when 'plant_flower' then 'wildflowers'
    when 'plant_other' then 'trees_shrubs'
    when 'lizards' then 'lizards'
    when 'snakes' then 'snakes'
    when 'frogs_toads' then 'frogs_toads'
    when 'turtles_tortoises' then 'turtles_tortoises'
    when 'salamanders' then 'salamanders'
    when 'songbirds' then 'songbirds'
    when 'raptors' then 'raptors'
    when 'wading_birds' then 'wading_birds'
    when 'waterfowl' then 'waterfowl'
    when 'shorebirds' then 'shorebirds'
    when 'small_mammals' then 'small_mammals'
    when 'deer_hoofed' then 'deer_hoofed'
    when 'bats' then 'bats'
    when 'marine_mammals' then 'marine_mammals'
    when 'carnivores' then 'carnivores'
    when 'mammal' then 'small_mammals'
    when 'reptile' then 'lizards'
    when 'amphibian' then 'frogs_toads'
    when 'bird' then 'songbirds'
    else null
  end;
$$;

create or replace function public.subcategory_to_main(sub text)
returns text
language sql
immutable
as $$
  select case sub
    when 'wildflowers' then 'botanist'
    when 'trees_shrubs' then 'botanist'
    when 'ferns_mosses' then 'botanist'
    when 'aquatic_plants' then 'botanist'
    when 'cacti_succulents' then 'botanist'
    when 'lizards' then 'herpetologist'
    when 'snakes' then 'herpetologist'
    when 'frogs_toads' then 'herpetologist'
    when 'turtles_tortoises' then 'herpetologist'
    when 'salamanders' then 'herpetologist'
    when 'songbirds' then 'ornithologist'
    when 'raptors' then 'ornithologist'
    when 'wading_birds' then 'ornithologist'
    when 'waterfowl' then 'ornithologist'
    when 'shorebirds' then 'ornithologist'
    when 'small_mammals' then 'mammalogist'
    when 'deer_hoofed' then 'mammalogist'
    when 'bats' then 'mammalogist'
    when 'marine_mammals' then 'mammalogist'
    when 'carnivores' then 'mammalogist'
    else null
  end;
$$;

create or replace function public.discovery_canonical_subcategory(
  p_category text,
  p_subcategory text
)
returns text
language sql
immutable
as $$
  select coalesce(
    nullif(trim(p_subcategory), ''),
    public.category_to_subcategory(p_category)
  );
$$;

create or replace function public.discovery_canonical_main(
  p_category text,
  p_subcategory text,
  p_main_category text
)
returns text
language sql
immutable
as $$
  select coalesce(
    nullif(trim(p_main_category), ''),
    public.subcategory_to_main(public.discovery_canonical_subcategory(p_category, p_subcategory))
  );
$$;

create or replace function public.tier_for_species_count(cnt int)
returns text
language sql
immutable
as $$
  select case
    when cnt >= 50 then 'voyager'
    when cnt >= 25 then 'adventurer'
    when cnt >= 10 then 'explorer'
    else null
  end;
$$;

create or replace function public.check_category_milestones(p_user_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if p_user_id is null then
    return;
  end if;

  with
  main_counts as (
    select
      public.discovery_canonical_main(d.category::text, d.subcategory, d.main_category) as main_category,
      count(distinct lower(trim(d.latin_name)))::int as unique_species_count
    from public.discoveries d
    where d.user_id = p_user_id
      and nullif(trim(d.latin_name), '') is not null
      and public.discovery_canonical_main(d.category::text, d.subcategory, d.main_category) is not null
    group by 1
  ),
  sub_counts as (
    select
      public.discovery_canonical_subcategory(d.category::text, d.subcategory) as subcategory,
      count(distinct lower(trim(d.latin_name)))::int as unique_species_count
    from public.discoveries d
    where d.user_id = p_user_id
      and nullif(trim(d.latin_name), '') is not null
      and public.discovery_canonical_subcategory(d.category::text, d.subcategory) is not null
    group by 1
  ),
  tier_progress as (
    select
      bd.award_key,
      coalesce(mc.unique_species_count, 0) as unique_species_count,
      bd.required_unique_species,
      coalesce(mc.unique_species_count, 0) >= bd.required_unique_species as earned
    from public.badge_definitions bd
    left join main_counts mc on mc.main_category = bd.main_category
    where bd.active
      and bd.badge_kind = 'main'

    union all

    select
      bd.award_key,
      coalesce(sc.unique_species_count, 0) as unique_species_count,
      bd.required_unique_species,
      coalesce(sc.unique_species_count, 0) >= bd.required_unique_species as earned
    from public.badge_definitions bd
    left join sub_counts sc on sc.subcategory = bd.subcategory
    where bd.active
      and bd.badge_kind = 'sub'
  ),
  true_voyager_progress as (
    select
      bd.award_key,
      coalesce(mc.unique_species_count, 0) as unique_species_count,
      bd.required_unique_species,
      (
        main_voyager.required_unique_species is not null
        and coalesce(mc.unique_species_count, 0) >= main_voyager.required_unique_species
        and (
          not exists (
            select 1
            from public.badge_definitions sub_voyager
            where sub_voyager.badge_kind = 'sub'
              and sub_voyager.main_category = bd.main_category
              and sub_voyager.tier = 'voyager'
              and sub_voyager.active
          )
          or not exists (
            select 1
            from public.badge_definitions sub_voyager
            left join sub_counts sc on sc.subcategory = sub_voyager.subcategory
            where sub_voyager.badge_kind = 'sub'
              and sub_voyager.main_category = bd.main_category
              and sub_voyager.tier = 'voyager'
              and sub_voyager.active
              and coalesce(sc.unique_species_count, 0) < sub_voyager.required_unique_species
          )
        )
      ) as earned
    from public.badge_definitions bd
    left join main_counts mc on mc.main_category = bd.main_category
    left join public.badge_definitions main_voyager
      on main_voyager.badge_kind = 'main'
      and main_voyager.main_category = bd.main_category
      and main_voyager.tier = 'voyager'
      and main_voyager.active
    where bd.active
      and bd.badge_kind = 'bonus'
      and bd.award_key like 'badge:true_voyager:%'
  ),
  ends_progress as (
    select
      bd.award_key,
      (
        select count(*)::int
        from public.badge_definitions main_voyager
        left join main_counts mc on mc.main_category = main_voyager.main_category
        where main_voyager.active
          and main_voyager.badge_kind = 'main'
          and main_voyager.tier = 'voyager'
          and coalesce(mc.unique_species_count, 0) >= main_voyager.required_unique_species
      ) as unique_species_count,
      bd.required_unique_species,
      (
        exists (
          select 1
          from public.badge_definitions main_voyager
          where main_voyager.active
            and main_voyager.badge_kind = 'main'
            and main_voyager.tier = 'voyager'
        )
        and not exists (
          select 1
          from public.badge_definitions main_voyager
          left join main_counts mc on mc.main_category = main_voyager.main_category
          where main_voyager.active
            and main_voyager.badge_kind = 'main'
            and main_voyager.tier = 'voyager'
            and coalesce(mc.unique_species_count, 0) < main_voyager.required_unique_species
        )
      ) as earned
    from public.badge_definitions bd
    where bd.active
      and bd.award_key = 'badge:ends_of_the_earth'
  ),
  progress as (
    select * from tier_progress
    union all
    select * from true_voyager_progress
    union all
    select * from ends_progress
  )
  insert into public.user_badge_progress (
    user_id,
    award_key,
    unique_species_count,
    required_unique_species,
    earned,
    updated_at
  )
  select
    p_user_id,
    progress.award_key,
    progress.unique_species_count,
    progress.required_unique_species,
    progress.earned,
    now()
  from progress
  on conflict (user_id, award_key) do update
  set unique_species_count = excluded.unique_species_count,
      required_unique_species = excluded.required_unique_species,
      earned = excluded.earned,
      updated_at = excluded.updated_at;

  insert into public.point_awards (user_id, award_key, points, label)
  select ubp.user_id, bd.award_key, bd.points, bd.label
  from public.user_badge_progress ubp
  inner join public.badge_definitions bd on bd.award_key = ubp.award_key
  where ubp.user_id = p_user_id
    and ubp.earned
    and bd.active
  on conflict (user_id, award_key) do nothing;
end;
$$;

revoke all on function public.check_category_milestones(uuid) from public;
