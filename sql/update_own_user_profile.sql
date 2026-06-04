-- Patch own public.users row (motto, state, avatar, names) for the signed-in member.
-- SECURITY DEFINER: reliable after harden_security_linter.sql (direct PostgREST updates
-- can fail when the session is stale or RLS rejects the returning SELECT).
-- Safe to re-run. Run after create_user.sql / ensure_public_user_profile.sql.

drop function if exists public.update_own_user_profile(jsonb);

create or replace function public.update_own_user_profile(p_patch jsonb)
returns setof public.users
language plpgsql
security definer
set search_path = public
as $$
declare
  uid uuid := auth.uid();
begin
  if uid is null then
    raise exception 'Not authenticated';
  end if;

  if p_patch is null or p_patch = '{}'::jsonb then
    raise exception 'Nothing to update';
  end if;

  if not exists (select 1 from public.users u where u.id = uid) then
    perform public.insert_public_user_from_auth(uid);
  end if;

  return query
  update public.users u
  set
    username = case
      when p_patch ? 'username' and nullif(trim(p_patch->>'username'), '') is not null
        then trim(p_patch->>'username')
      else u.username
    end,
    first_name = case
      when p_patch ? 'first_name' and nullif(trim(p_patch->>'first_name'), '') is not null
        then trim(p_patch->>'first_name')
      else u.first_name
    end,
    last_name = case
      when p_patch ? 'last_name' and nullif(trim(p_patch->>'last_name'), '') is not null
        then trim(p_patch->>'last_name')
      else u.last_name
    end,
    motto = case
      when p_patch ? 'motto' then nullif(trim(p_patch->>'motto'), '')
      else u.motto
    end,
    avatar_url = case
      when p_patch ? 'avatar_url' then nullif(trim(p_patch->>'avatar_url'), '')
      else u.avatar_url
    end,
    state = case
      when p_patch ? 'state' then nullif(trim(p_patch->>'state'), '')
      else u.state
    end
  where u.id = uid
  returning *;
end;
$$;

revoke all on function public.update_own_user_profile(jsonb) from public;
revoke execute on function public.update_own_user_profile(jsonb) from anon;
grant execute on function public.update_own_user_profile(jsonb) to authenticated;

notify pgrst, 'reload schema';
