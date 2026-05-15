-- Safe to re-run
drop trigger if exists on_detection_update_streak on public.detections;
drop function if exists update_streak();
drop table if exists public.streaks cascade;

create table public.streaks (
  id               uuid primary key default gen_random_uuid(),
  user_id          uuid not null references public.users(id) on delete cascade,
  current_streak   int not null default 0,
  longest_streak   int not null default 0,
  last_active_date date,
  created_at       timestamptz default now() not null,
  updated_at       timestamptz default now() not null,
  unique(user_id)
);

alter table public.streaks enable row level security;

create policy "Users can view their own streak"
  on public.streaks for select
  using (auth.uid() = user_id);

-- Inserts/updates are done only by trigger `update_streak` (security definer), not by clients.

-- Auto-update streak when a detection is inserted
create or replace function update_streak()
returns trigger as $$
declare
  existing_streak public.streaks;
  today           date := current_date;
begin
  select * into existing_streak
  from public.streaks
  where user_id = new.user_id;

  if not found then
    -- First ever detection, create streak row
    insert into public.streaks (user_id, current_streak, longest_streak, last_active_date)
    values (new.user_id, 1, 1, today);

  elsif existing_streak.last_active_date = today then
    -- Already detected today, no streak change
    null;

  elsif existing_streak.last_active_date = today - interval '1 day' then
    -- Consecutive day, increment streak
    update public.streaks
    set
      current_streak   = current_streak + 1,
      longest_streak   = greatest(longest_streak, current_streak + 1),
      last_active_date = today,
      updated_at       = now()
    where user_id = new.user_id;

  else
    -- Streak broken, reset to 1
    update public.streaks
    set
      current_streak   = 1,
      last_active_date = today,
      updated_at       = now()
    where user_id = new.user_id;
  end if;

  return new;
end;
$$ language plpgsql security definer
set search_path = public;

create trigger on_detection_update_streak
  after insert on public.detections
  for each row execute function update_streak();
