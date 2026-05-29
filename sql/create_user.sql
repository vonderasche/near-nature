-- Safe to re-run (drop table first so fresh DBs never reference missing public.users)
drop trigger if exists on_auth_user_created on auth.users;
drop table if exists public.users cascade;
drop function if exists handle_new_user();
drop function if exists update_updated_at();

-- Create users table
create table public.users (
  id          uuid primary key references auth.users(id) on delete cascade,
  email       text unique not null,
  username    text unique not null,
  first_name  text not null,
  last_name   text not null,
  motto       text,
  avatar_url  text,
  state           text,
  date_of_birth   date,
  created_at      timestamptz default now() not null,
  updated_at      timestamptz default now() not null
);

-- Auto-update updated_at on row change
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql
set search_path = public;

create trigger users_updated_at
  before update on public.users
  for each row execute function update_updated_at();

-- Row Level Security
alter table public.users enable row level security;

create policy "Users can view their own profile"
  on public.users for select
  using ((select auth.uid()) = id);

create policy "Users can update their own profile"
  on public.users for update
  using ((select auth.uid()) = id);

create policy "Users can delete their own profile"
  on public.users for delete
  using ((select auth.uid()) = id);

-- Shared insert (also used by ensure_public_user_profile.sql on existing DBs)
create or replace function public.insert_public_user_from_auth(p_user_id uuid)
returns boolean
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  au record;
  base_username text;
  try_username text;
  attempt int;
  dob_text text;
  dob_parsed date;
begin
  if p_user_id is null then
    return false;
  end if;

  if exists (select 1 from public.users u where u.id = p_user_id) then
    return true;
  end if;

  select * into au from auth.users where id = p_user_id;
  if not found then
    return false;
  end if;

  dob_text := nullif(trim(coalesce(au.raw_user_meta_data, '{}'::jsonb)->>'date_of_birth'), '');
  dob_parsed := case when dob_text ~ '^\d{4}-\d{2}-\d{2}$' then dob_text::date else null end;

  base_username := coalesce(
    nullif(trim(coalesce(au.raw_user_meta_data, '{}'::jsonb)->>'username'), ''),
    regexp_replace(split_part(lower(au.email::text), '@', 1), '[^a-zA-Z0-9_]', '_', 'g')
      || '_' || left(replace(au.id::text, '-', ''), 8)
  );

  try_username := base_username;
  for attempt in 0..12 loop
    begin
      insert into public.users (
        id,
        email,
        username,
        first_name,
        last_name,
        motto,
        avatar_url,
        state,
        date_of_birth
      )
      values (
        au.id,
        au.email,
        try_username,
        coalesce(
          nullif(trim(coalesce(au.raw_user_meta_data, '{}'::jsonb)->>'first_name'), ''),
          nullif(
            split_part(
              trim(
                coalesce(
                  coalesce(au.raw_user_meta_data, '{}'::jsonb)->>'full_name',
                  coalesce(au.raw_user_meta_data, '{}'::jsonb)->>'name',
                  ''
                )
              ),
              ' ',
              1
            ),
            ''
          ),
          'User'
        ),
        coalesce(
          nullif(trim(coalesce(au.raw_user_meta_data, '{}'::jsonb)->>'last_name'), ''),
          nullif(
            regexp_replace(
              trim(
                coalesce(
                  coalesce(au.raw_user_meta_data, '{}'::jsonb)->>'full_name',
                  coalesce(au.raw_user_meta_data, '{}'::jsonb)->>'name',
                  ''
                )
              ),
              '^\S+\s*',
              ''
            ),
            ''
          ),
          'Member'
        ),
        nullif(trim(coalesce(au.raw_user_meta_data, '{}'::jsonb)->>'motto'), ''),
        nullif(trim(coalesce(au.raw_user_meta_data, '{}'::jsonb)->>'avatar_url'), ''),
        nullif(trim(coalesce(au.raw_user_meta_data, '{}'::jsonb)->>'state'), ''),
        dob_parsed
      );
      return true;
    exception
      when unique_violation then
        if attempt >= 12 then
          raise;
        end if;
        try_username := base_username || '_' || (attempt + 1)::text;
    end;
  end loop;

  return false;
end;
$$;

create or replace function public.ensure_public_user_profile()
returns boolean
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  uid uuid := auth.uid();
begin
  if uid is null then
    raise exception 'Not authenticated';
  end if;
  return public.insert_public_user_from_auth(uid);
end;
$$;

revoke all on function public.insert_public_user_from_auth(uuid) from public;
revoke all on function public.ensure_public_user_profile() from public;
revoke execute on function public.ensure_public_user_profile() from anon;
grant execute on function public.ensure_public_user_profile() to authenticated;

create or replace function handle_new_user()
returns trigger as $$
declare
  created boolean;
begin
  created := public.insert_public_user_from_auth(new.id);
  if not created then
    raise exception 'Could not create public.users profile for %', new.id;
  end if;
  return new;
end;
$$ language plpgsql security definer
set search_path = public, auth;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();
