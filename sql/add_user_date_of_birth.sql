-- Add date of birth for age verification (existing projects). Safe to re-run.
-- Fresh installs: included in create_user.sql instead.

alter table public.users
  add column if not exists date_of_birth date;

-- Recreate signup trigger so new auth users get date_of_birth from metadata.
drop trigger if exists on_auth_user_created on auth.users;
drop function if exists handle_new_user();

create or replace function handle_new_user()
returns trigger as $$
declare
  dob_text text;
  dob_parsed date;
begin
  dob_text := nullif(trim(coalesce(new.raw_user_meta_data, '{}'::jsonb)->>'date_of_birth'), '');
  dob_parsed := case when dob_text ~ '^\d{4}-\d{2}-\d{2}$' then dob_text::date else null end;

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
    nullif(trim(coalesce(new.raw_user_meta_data, '{}'::jsonb)->>'state'), ''),
    dob_parsed
  );
  return new;
end;
$$ language plpgsql security definer
set search_path = public;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();
