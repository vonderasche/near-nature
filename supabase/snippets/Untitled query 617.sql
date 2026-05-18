-- Awards category tier + badge points after a new discovery. Safe to re-run.
-- Keep tier point values in sync with constants/naturalist-categories.ts

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
    when 'insect' then 'other_insects'
    when 'fish' then 'freshwater_fish'
    when 'butterflies_moths' then 'butterflies_moths'
    when 'beetles' then 'beetles'
    when 'bees_wasps' then 'bees_wasps'
    when 'dragonflies' then 'dragonflies'
    when 'other_insects' then 'other_insects'
    when 'spiders' then 'spiders'
    when 'scorpions' then 'scorpions'
    when 'ticks_mites' then 'ticks_mites'
    when 'other_arachnids' then 'other_arachnids'
    when 'freshwater_fish' then 'freshwater_fish'
    when 'saltwater_fish' then 'saltwater_fish'
    when 'shellfish' then 'shellfish'
    when 'other_fish' then 'other_fish'
    when 'mushrooms' then 'mushrooms'
    when 'slime_molds' then 'slime_molds'
    when 'lichens' then 'lichens'
    when 'other_fungi' then 'other_fungi'
    when 'other' then 'other_fungi'
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
    when 'butterflies_moths' then 'entomologist'
    when 'beetles' then 'entomologist'
    when 'bees_wasps' then 'entomologist'
    when 'dragonflies' then 'entomologist'
    when 'other_insects' then 'entomologist'
    when 'spiders' then 'arachnologist'
    when 'scorpions' then 'arachnologist'
    when 'ticks_mites' then 'arachnologist'
    when 'other_arachnids' then 'arachnologist'
    when 'freshwater_fish' then 'ichthyologist'
    when 'saltwater_fish' then 'ichthyologist'
    when 'shellfish' then 'ichthyologist'
    when 'other_fish' then 'ichthyologist'
    when 'mushrooms' then 'mycologist'
    when 'slime_molds' then 'mycologist'
    when 'lichens' then 'mycologist'
    when 'other_fungi' then 'mycologist'
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
declare
  r record;
  sub text;
  main_id text;
  sub_cnt int;
  main_cnt int;
  sub_tier text;
  main_tier text;
  award_key text;
  pts int;
  lbl text;
  main_label text;
  sub_label text;
  all_subs_voyager boolean;
  all_mains_voyager boolean;
  existing_keys text[];
begin
  select coalesce(array_agg(pa.award_key), array[]::text[])
  into existing_keys
  from public.point_awards pa
  where pa.user_id = p_user_id;

  -- Main category tiers
  for main_id, main_label in
    select * from (values
      ('botanist', 'Botanist'),
      ('herpetologist', 'Herpetologist'),
      ('ornithologist', 'Ornithologist'),
      ('mammalogist', 'Mammalogist'),
      ('entomologist', 'Entomologist'),
      ('arachnologist', 'Arachnologist'),
      ('ichthyologist', 'Ichthyologist'),
      ('mycologist', 'Mycologist')
    ) as t(id, lbl)
  loop
    select count(distinct d.latin_name)::int
    into main_cnt
    from public.discoveries d
    where d.user_id = p_user_id
      and public.discovery_canonical_main(d.category::text, d.subcategory, d.main_category) = main_id;

    main_tier := public.tier_for_species_count(main_cnt);
    if main_tier is null then
      continue;
    end if;

    foreach sub_tier in array array['explorer', 'adventurer', 'voyager'] loop
      if (sub_tier = 'explorer' and main_cnt < 10)
        or (sub_tier = 'adventurer' and main_cnt < 25)
        or (sub_tier = 'voyager' and main_cnt < 50) then
        continue;
      end if;

      award_key := 'main:' || main_id || ':' || sub_tier;
      if award_key = any(existing_keys) then
        continue;
      end if;

      pts := case sub_tier
        when 'explorer' then 50
        when 'adventurer' then 150
        else 500
      end;

      lbl := main_label || ' ' || initcap(sub_tier);

      insert into public.point_awards (user_id, award_key, points, label)
      values (p_user_id, award_key, pts, lbl)
      on conflict (user_id, award_key) do nothing;

      existing_keys := existing_keys || award_key;
    end loop;
  end loop;

  -- Subcategory tiers
  for sub, sub_label, main_id in
    select * from (values
      ('wildflowers', 'Wildflowers', 'botanist'),
      ('trees_shrubs', 'Trees & Shrubs', 'botanist'),
      ('ferns_mosses', 'Ferns & Mosses', 'botanist'),
      ('aquatic_plants', 'Aquatic Plants', 'botanist'),
      ('cacti_succulents', 'Cacti & Succulents', 'botanist'),
      ('lizards', 'Lizards', 'herpetologist'),
      ('snakes', 'Snakes', 'herpetologist'),
      ('frogs_toads', 'Frogs & Toads', 'herpetologist'),
      ('turtles_tortoises', 'Turtles & Tortoises', 'herpetologist'),
      ('salamanders', 'Salamanders', 'herpetologist'),
      ('songbirds', 'Songbirds', 'ornithologist'),
      ('raptors', 'Raptors', 'ornithologist'),
      ('wading_birds', 'Wading Birds', 'ornithologist'),
      ('waterfowl', 'Waterfowl', 'ornithologist'),
      ('shorebirds', 'Shorebirds', 'ornithologist'),
      ('small_mammals', 'Small Mammals', 'mammalogist'),
      ('deer_hoofed', 'Deer & Hoofed', 'mammalogist'),
      ('bats', 'Bats', 'mammalogist'),
      ('marine_mammals', 'Marine Mammals', 'mammalogist'),
      ('carnivores', 'Carnivores', 'mammalogist'),
      ('butterflies_moths', 'Butterflies & Moths', 'entomologist'),
      ('beetles', 'Beetles', 'entomologist'),
      ('bees_wasps', 'Bees & Wasps', 'entomologist'),
      ('dragonflies', 'Dragonflies & Damselflies', 'entomologist'),
      ('other_insects', 'Other Insects', 'entomologist'),
      ('spiders', 'Spiders', 'arachnologist'),
      ('scorpions', 'Scorpions', 'arachnologist'),
      ('ticks_mites', 'Ticks & Mites', 'arachnologist'),
      ('other_arachnids', 'Other Arachnids', 'arachnologist'),
      ('freshwater_fish', 'Freshwater Fish', 'ichthyologist'),
      ('saltwater_fish', 'Saltwater Fish', 'ichthyologist'),
      ('shellfish', 'Shellfish & Crustaceans', 'ichthyologist'),
      ('other_fish', 'Other Fish', 'ichthyologist'),
      ('mushrooms', 'Mushrooms', 'mycologist'),
      ('slime_molds', 'Slime Molds', 'mycologist'),
      ('lichens', 'Lichens', 'mycologist'),
      ('other_fungi', 'Other Fungi', 'mycologist')
    ) as t(sub_id, sub_lbl, main_id)
  loop
    select count(distinct d.latin_name)::int
    into sub_cnt
    from public.discoveries d
    where d.user_id = p_user_id
      and public.discovery_canonical_subcategory(d.category::text, d.subcategory) = sub;

    sub_tier := public.tier_for_species_count(sub_cnt);
    if sub_tier is null then
      continue;
    end if;

    foreach main_tier in array array['explorer', 'adventurer', 'voyager'] loop
      if (main_tier = 'explorer' and sub_cnt < 10)
        or (main_tier = 'adventurer' and sub_cnt < 25)
        or (main_tier = 'voyager' and sub_cnt < 50) then
        continue;
      end if;

      award_key := 'sub:' || sub || ':' || main_tier;
      if award_key = any(existing_keys) then
        continue;
      end if;

      pts := case main_tier
        when 'explorer' then 25
        when 'adventurer' then 75
        else 250
      end;

      lbl := sub_label || ' ' || initcap(main_tier);

      insert into public.point_awards (user_id, award_key, points, label)
      values (p_user_id, award_key, pts, lbl)
      on conflict (user_id, award_key) do nothing;

      existing_keys := existing_keys || award_key;
    end loop;
  end loop;

  -- True Voyager badges (main voyager + all subs voyager)
  for main_id, main_label in
    select * from (values
      ('botanist', 'Botanist'),
      ('herpetologist', 'Herpetologist'),
      ('ornithologist', 'Ornithologist'),
      ('mammalogist', 'Mammalogist'),
      ('entomologist', 'Entomologist'),
      ('arachnologist', 'Arachnologist'),
      ('ichthyologist', 'Ichthyologist'),
      ('mycologist', 'Mycologist')
    ) as t(id, lbl)
  loop
    award_key := 'badge:true_voyager:' || main_id;
    if award_key = any(existing_keys) then
      continue;
    end if;

    select count(distinct d.latin_name)::int
    into main_cnt
    from public.discoveries d
    where d.user_id = p_user_id
      and public.discovery_canonical_main(d.category::text, d.subcategory, d.main_category) = main_id;

    if public.tier_for_species_count(main_cnt) <> 'voyager' then
      continue;
    end if;

    all_subs_voyager := true;
    for sub in
      select unnest(case main_id
        when 'botanist' then array['wildflowers','trees_shrubs','ferns_mosses','aquatic_plants','cacti_succulents']
        when 'herpetologist' then array['lizards','snakes','frogs_toads','turtles_tortoises','salamanders']
        when 'ornithologist' then array['songbirds','raptors','wading_birds','waterfowl','shorebirds']
        when 'mammalogist' then array['small_mammals','deer_hoofed','bats','marine_mammals','carnivores']
        when 'entomologist' then array['butterflies_moths','beetles','bees_wasps','dragonflies','other_insects']
        when 'arachnologist' then array['spiders','scorpions','ticks_mites','other_arachnids']
        when 'ichthyologist' then array['freshwater_fish','saltwater_fish','shellfish','other_fish']
        else array['mushrooms','slime_molds','lichens','other_fungi']
      end)
    loop
      select count(distinct d.latin_name)::int
      into sub_cnt
      from public.discoveries d
      where d.user_id = p_user_id
        and public.discovery_canonical_subcategory(d.category::text, d.subcategory) = sub;

      if public.tier_for_species_count(sub_cnt) <> 'voyager' then
        all_subs_voyager := false;
        exit;
      end if;
    end loop;

    if not all_subs_voyager then
      continue;
    end if;

    insert into public.point_awards (user_id, award_key, points, label)
    values (p_user_id, award_key, 2000, 'True Voyager — ' || main_label)
    on conflict (user_id, award_key) do nothing;

    existing_keys := existing_keys || award_key;
  end loop;

  -- Ends of the Earth
  if not ('badge:ends_of_the_earth' = any(existing_keys)) then
    all_mains_voyager := true;
    foreach main_id in array array[
      'botanist','herpetologist','ornithologist','mammalogist',
      'entomologist','arachnologist','ichthyologist','mycologist'
    ] loop
      select count(distinct d.latin_name)::int
      into main_cnt
      from public.discoveries d
      where d.user_id = p_user_id
        and public.discovery_canonical_main(d.category::text, d.subcategory, d.main_category) = main_id;

      if public.tier_for_species_count(main_cnt) <> 'voyager' then
        all_mains_voyager := false;
        exit;
      end if;
    end loop;

    if all_mains_voyager then
      insert into public.point_awards (user_id, award_key, points, label)
      values (p_user_id, 'badge:ends_of_the_earth', 1000, 'Ends of the Earth')
      on conflict (user_id, award_key) do nothing;
    end if;
  end if;
end;
$$;

revoke all on function public.check_category_milestones(uuid) from public;
