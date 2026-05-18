-- Safe to re-run
drop trigger if exists on_detection_check_discovery on public.detections;
drop function if exists handle_first_discovery();
drop table if exists public.discoveries cascade;

-- Tracks the first time a user identifies a unique species
create table public.discoveries (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references public.users(id) on delete cascade,
  latin_name    text not null,
  common_name   text not null,
  category      species_category not null,
  detection_id  uuid not null references public.detections(id) on delete cascade,
  discovered_at timestamptz default now() not null,
  unique(user_id, latin_name)   -- one entry per species per user
);

create index discoveries_user_id_idx  on public.discoveries(user_id);
create index discoveries_category_idx on public.discoveries(category);

alter table public.discoveries enable row level security;

create policy "Users can view their own discoveries"
  on public.discoveries for select
  using (auth.uid() = user_id);

-- Auto-log first discovery and award bonus points
create or replace function handle_first_discovery()
returns trigger as $$
declare
  is_first_discovery boolean;
  bonus_points       int := 5;
begin
  -- Check if this is a new species for this user
  select not exists (
    select 1 from public.discoveries
    where user_id   = new.user_id
    and   latin_name = new.latin_name
  ) into is_first_discovery;

  if is_first_discovery then
    -- Log the discovery
    insert into public.discoveries (
      user_id, latin_name, common_name, category, detection_id
    ) values (
      new.user_id, new.latin_name, new.common_name, new.category, new.id
    );

    -- Award bonus points on top of base points
    update public.detections
    set points = points + bonus_points
    where id = new.id;

    perform public.check_category_milestones(new.user_id);
  end if;

  return new;
end;
$$ language plpgsql security definer
set search_path = public;

create trigger on_detection_check_discovery
  after insert on public.detections
  for each row execute function handle_first_discovery();
