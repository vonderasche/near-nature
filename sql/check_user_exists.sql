-- Safe to re-run
drop function if exists check_email_exists(text);
drop function if exists check_username_exists(text);

-- Check if email exists
create or replace function check_email_exists(p_email text)
returns boolean as $$
begin
  return exists (
    select 1 from auth.users where email = p_email
  );
end;
$$ language plpgsql security definer;

-- Check if username exists (case-insensitive)
create or replace function check_username_exists(p_username text)
returns boolean as $$
begin
  return exists (
    select 1 from public.users where lower(username) = lower(p_username)
  );
end;
$$ language plpgsql security definer;
