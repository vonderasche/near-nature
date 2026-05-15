-- Safe to re-run
drop function if exists delete_detection(uuid);
drop function if exists delete_all_detections();

-- Delete a single detection
create or replace function delete_detection(p_detection_id uuid)
returns void as $$
begin
  if not exists (
    select 1 from public.detections
    where id = p_detection_id and user_id = auth.uid()
  ) then
    raise exception 'Detection not found or access denied';
  end if;

  delete from public.detections where id = p_detection_id;
end;
$$ language plpgsql security definer
set search_path = public;

-- Delete all detections for the current user
create or replace function delete_all_detections()
returns void as $$
begin
  delete from public.detections where user_id = auth.uid();
end;
$$ language plpgsql security definer
set search_path = public;
