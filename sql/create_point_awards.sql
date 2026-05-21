-- One-time tier and badge bonuses (category milestone system). Safe to re-run.

drop table if exists public.point_awards cascade;

create table public.point_awards (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references public.users(id) on delete cascade,
  award_key   text not null,
  points      int not null check (points > 0),
  label       text not null,
  awarded_at  timestamptz not null default now(),
  unique (user_id, award_key)
);

create index point_awards_user_id_idx on public.point_awards(user_id);

alter table public.point_awards enable row level security;

create policy "Users can view their own point awards"
  on public.point_awards for select
  using ((select auth.uid()) = user_id);

-- Inserts only via security definer triggers / functions.
