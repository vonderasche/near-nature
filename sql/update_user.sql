-- Safe to re-run
drop function if exists update_user_profile(uuid, text, text, text, text, text);

-- Function to update user profile
create or replace function update_user_profile(
  user_id      uuid,
  p_username   text default null,
  p_first_name text default null,
  p_last_name  text default null,
  p_motto      text default null,
  p_avatar_url text default null
)
returns public.users as $$
declare
  updated_user public.users;
begin
  -- Check username is not already taken by someone else
  if p_username is not null then
    if exists (
      select 1 from public.users
      where username = p_username and id != user_id
    ) then
      raise exception 'Username % is already taken', p_username;
    end if;
  end if;

  update public.users
  set
    username   = coalesce(p_username,   username),
    first_name = coalesce(p_first_name, first_name),
    last_name  = coalesce(p_last_name,  last_name),
    motto      = coalesce(p_motto,      motto),
    avatar_url = coalesce(p_avatar_url, avatar_url)
  where id = user_id
  returning * into updated_user;

  if not found then
    raise exception 'User % not found', user_id;
  end if;

  return updated_user;
end;
$$ language plpgsql security definer;
