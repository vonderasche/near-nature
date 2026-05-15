-- Safe to re-run
drop trigger if exists on_auth_user_created on auth.users;
drop trigger if exists users_updated_at on public.users;
drop function if exists handle_new_user();
drop function if exists update_updated_at();
drop table if exists public.users cascade;

-- Create users table
create table public.users (
  id          uuid primary key references auth.users(id) on delete cascade,
  email       text unique not null,
  username    text unique not null,
  first_name  text not null,
  last_name   text not null,
  motto       text,
  avatar_url  text,
  state       text,
  created_at  timestamptz default now() not null,
  updated_at  timestamptz default now() not null
);

-- Auto-update updated_at on row change
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger users_updated_at
  before update on public.users
  for each row execute function update_updated_at();

-- Row Level Security
alter table public.users enable row level security;

create policy "Users can view their own profile"
  on public.users for select
  using (auth.uid() = id);

create policy "Users can update their own profile"
  on public.users for update
  using (auth.uid() = id);

create policy "Users can delete their own profile"
  on public.users for delete
  using (auth.uid() = id);

-- Auto-create profile on sign up (metadata fallbacks for OAuth / partial signup data)
create or replace function handle_new_user()
returns trigger as $$
begin
  insert into public.users (
    id,
    email,
    username,
    first_name,
    last_name,
    motto,
    avatar_url,
    state
  )
  values (
    new.id,
    new.email,
    coalesce(
      nullif(trim(coalesce(new.raw_user_meta_data, '{}'::jsonb)->>'username'), ''),
      regexp_replace(split_part(lower(new.email::text), '@', 1), '[^a-zA-Z0-9_]', '_', 'g')
        || '_' || left(replace(new.id::text, '-', ''), 8)
    ),
    coalesce(
      nullif(trim(coalesce(new.raw_user_meta_data, '{}'::jsonb)->>'first_name'), ''),
      nullif(
        split_part(
          trim(
            coalesce(
              coalesce(new.raw_user_meta_data, '{}'::jsonb)->>'full_name',
              coalesce(new.raw_user_meta_data, '{}'::jsonb)->>'name',
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
      nullif(trim(coalesce(new.raw_user_meta_data, '{}'::jsonb)->>'last_name'), ''),
      nullif(
        regexp_replace(
          trim(
            coalesce(
              coalesce(new.raw_user_meta_data, '{}'::jsonb)->>'full_name',
              coalesce(new.raw_user_meta_data, '{}'::jsonb)->>'name',
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
    nullif(trim(coalesce(new.raw_user_meta_data, '{}'::jsonb)->>'motto'), ''),
    nullif(trim(coalesce(new.raw_user_meta_data, '{}'::jsonb)->>'avatar_url'), ''),
    nullif(trim(coalesce(new.raw_user_meta_data, '{}'::jsonb)->>'state'), '')
  );
  return new;
end;
$$ language plpgsql security definer
set search_path = public;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();
