-- Public profile fields for another user (no email or legal name).
-- SECURITY DEFINER: RLS on public.users only allows self-select; this exposes safe columns.
-- Safe to re-run.

drop function if exists public.get_public_user_profile(uuid);

create or replace function public.get_public_user_profile(p_user_id uuid)
returns table (
  user_id    uuid,
  username   text,
  motto      text,
  avatar_url text
)
language sql
security definer
set search_path = public
stable
as $$
  select
    u.id,
    u.username,
    coalesce(u.motto, ''),
    coalesce(u.avatar_url, '')
  from public.users u
  where u.id = p_user_id;
$$;

revoke all on function public.get_public_user_profile(uuid) from public;
grant execute on function public.get_public_user_profile(uuid) to authenticated;
