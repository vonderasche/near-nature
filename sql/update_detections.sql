-- Safe to re-run
drop function if exists update_detection(uuid, text, text);

-- Update description or state on a detection
create or replace function update_detection(
  p_detection_id uuid,
  p_description  text default null,
  p_state        text default null
)
returns public.detections as $$
declare
  updated_detection public.detections;
begin
  -- Ensure the detection belongs to the requesting user
  if not exists (
    select 1 from public.detections
    where id = p_detection_id and user_id = auth.uid()
  ) then
    raise exception 'Detection not found or access denied';
  end if;

  update public.detections
  set
    description = coalesce(p_description, description),
    state       = coalesce(p_state,       state)
  where id = p_detection_id
  returning * into updated_detection;

  return updated_detection;
end;
$$ language plpgsql security definer
set search_path = public;
