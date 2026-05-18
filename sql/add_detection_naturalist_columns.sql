-- Canonical naturalist taxonomy on detections + discoveries (badge / tier scoring).
-- Requires: add_species_subcategories.sql, add_naturalist_category_enums.sql
-- Safe to re-run.

alter table public.detections
  add column if not exists subcategory text,
  add column if not exists main_category text;

alter table public.discoveries
  add column if not exists subcategory text,
  add column if not exists main_category text;

create index if not exists detections_subcategory_idx on public.detections(subcategory);
create index if not exists detections_main_category_idx on public.detections(main_category);
create index if not exists discoveries_subcategory_idx on public.discoveries(subcategory);
create index if not exists discoveries_main_category_idx on public.discoveries(main_category);

-- Backfill from legacy species_category
update public.detections d
set
  subcategory = public.category_to_subcategory(d.category::text),
  main_category = public.subcategory_to_main(public.category_to_subcategory(d.category::text))
where d.subcategory is null
  and public.category_to_subcategory(d.category::text) is not null;

update public.discoveries disc
set
  subcategory = public.category_to_subcategory(disc.category::text),
  main_category = public.subcategory_to_main(public.category_to_subcategory(disc.category::text))
where disc.subcategory is null
  and public.category_to_subcategory(disc.category::text) is not null;

create or replace function public.sync_detection_naturalist_categories()
returns trigger
language plpgsql
as $$
declare
  sub text;
  main text;
begin
  sub := nullif(trim(coalesce(new.subcategory, '')), '');
  if sub is null then
    sub := public.category_to_subcategory(new.category::text);
  end if;

  if sub is not null then
    main := public.subcategory_to_main(sub);
    new.subcategory := sub;
    new.main_category := main;
    begin
      new.category := sub::public.species_category;
    exception
      when invalid_text_representation then
        null;
    end;
  end if;

  return new;
end;
$$;

drop trigger if exists sync_detection_naturalist_categories on public.detections;
create trigger sync_detection_naturalist_categories
  before insert or update of category, subcategory, main_category
  on public.detections
  for each row execute function public.sync_detection_naturalist_categories();

-- Keep discoveries in sync when first logged from a detection
create or replace function handle_first_discovery()
returns trigger as $$
declare
  is_first_discovery boolean;
  bonus_points       int := 5;
begin
  select not exists (
    select 1 from public.discoveries
    where user_id   = new.user_id
    and   latin_name = new.latin_name
  ) into is_first_discovery;

  if is_first_discovery then
    insert into public.discoveries (
      user_id, latin_name, common_name, category, subcategory, main_category, detection_id
    ) values (
      new.user_id,
      new.latin_name,
      new.common_name,
      new.category,
      new.subcategory,
      new.main_category,
      new.id
    );

    update public.detections
    set points = points + bonus_points
    where id = new.id;

    perform public.check_category_milestones(new.user_id);
  end if;

  return new;
end;
$$ language plpgsql security definer
set search_path = public;

-- Prefer stored subcategory/main_category; fall back to legacy category enum.
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
