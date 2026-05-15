-- Resolve email for password sign-in when the user types either email or username.
-- SECURITY DEFINER: anon cannot read public.users under RLS; this only returns the email string.
-- Trade-off: anyone with anon can map a known username to an email — acceptable for many apps;
-- tighten later with rate limits or an Edge Function if needed.
-- Run after create_user.sql (requires public.users). Safe to re-run.

drop function if exists public.resolve_login_email(text);

create or replace function public.resolve_login_email(p_identifier text)
returns text
language plpgsql
security definer
set search_path = public
stable
as $$
declare
  v text := trim(p_identifier);
begin
  if v is null or v = '' then
    return null;
  end if;
  if v ilike '%@%' then
    return v;
  end if;
  return (
    select u.email
    from public.users u
    where lower(u.username) = lower(v)
    limit 1
  );
end;
$$;

revoke all on function public.resolve_login_email(text) from public;
grant execute on function public.resolve_login_email(text) to anon;
grant execute on function public.resolve_login_email(text) to authenticated;
