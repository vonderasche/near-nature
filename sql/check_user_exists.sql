-- Sign-up availability checks (anon-safe via SECURITY DEFINER). Run after create_user.sql.

drop function if exists public.check_email_exists(text);
drop function if exists public.check_username_exists(text);

create or replace function public.check_email_exists(p_email text)
returns boolean
language sql
security definer
set search_path = public, auth
stable
as $$
  select exists (
    select 1
    from auth.users
    where lower(email) = lower(trim(p_email))
  );
$$;

create or replace function public.check_username_exists(p_username text)
returns boolean
language sql
security definer
set search_path = public, auth
stable
as $$
  select exists (
    select 1
    from public.users u
    where lower(u.username) = lower(trim(p_username))
  )
  or exists (
    select 1
    from auth.users au
    where lower(coalesce(au.raw_user_meta_data->>'username', '')) = lower(trim(p_username))
  );
$$;

revoke all on function public.check_email_exists(text) from public;
revoke all on function public.check_username_exists(text) from public;
grant execute on function public.check_email_exists(text) to anon, authenticated;
grant execute on function public.check_username_exists(text) to anon, authenticated;
