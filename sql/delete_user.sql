-- Safe to re-run
drop function if exists delete_user_account(uuid);

-- Function to fully delete a user (profile + auth account)
create or replace function delete_user_account(user_id uuid)
returns void as $$
begin
  -- Verify the requesting user can only delete themselves
  if auth.uid() != user_id then
    raise exception 'You can only delete your own account';
  end if;

  -- Delete profile (cascades from auth.users anyway, but explicit is safer)
  delete from public.users where id = user_id;

  -- Delete from Supabase auth (requires service role in production)
  delete from auth.users where id = user_id;
end;
$$ language plpgsql security definer;
