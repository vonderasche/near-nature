-- Backfill public.users for auth users that have no profile row yet.
-- Typical causes: public.users was dropped/recreated, trigger was missing at signup,
-- or accounts were created outside this app without the expected user_metadata keys.
--
-- Run in Supabase SQL Editor (uses access to auth.users). Safe to re-run: only inserts missing ids.

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
select
  au.id,
  au.email::text,
  -- Unique username: prefer metadata; else email local part + short id suffix
  coalesce(
    nullif(trim(coalesce(au.raw_user_meta_data, '{}'::jsonb)->>'username'), ''),
    regexp_replace(split_part(lower(au.email::text), '@', 1), '[^a-zA-Z0-9_]', '_', 'g')
      || '_' || left(replace(au.id::text, '-', ''), 8)
  ),
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
  nullif(trim(coalesce(au.raw_user_meta_data, '{}'::jsonb)->>'state'), '')
from auth.users au
where not exists (select 1 from public.users u where u.id = au.id)
on conflict (id) do nothing;
