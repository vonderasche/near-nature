-- Creates public.users for the signed-in auth user when the row is missing.
-- Use when handle_new_user did not run (SQL not applied) or failed on username conflict.
-- Safe to re-run.

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
          'User'
        ),
        coalesce(
          nullif(trim(coalesce(au.raw_user_meta_data, '{}'::jsonb)->>'last_name'), ''),
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
grant execute on function public.ensure_public_user_profile() to authenticated;

-- Harden signup trigger: retry on username collision
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
