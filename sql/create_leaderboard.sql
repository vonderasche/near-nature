-- Detection points trigger (before insert). Safe to re-run.
-- Explorer board rankings use get_detection_count_leaderboard.sql (not this file).

drop trigger if exists set_detection_points on public.detections;
drop function if exists calculate_points();
drop function if exists get_leaderboard(text, text);
drop view if exists public.leaderboard cascade;
drop view if exists public.leaderboard_by_state cascade;

create or replace function calculate_points()
returns trigger as $$
begin
  new.points := case
    when new.native_status = 'native'   then 10
    when new.native_status = 'invasive' then 2
    else 0
  end;

  new.is_verified := new.confidence >= new.confidence_threshold;

  if new.is_sensitive then
    new.is_verified := false;
  end if;

  return new;
end;
$$ language plpgsql;

create trigger set_detection_points
  before insert on public.detections
  for each row execute function calculate_points();
