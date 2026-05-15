-- Safe to re-run
drop trigger if exists set_detection_points on public.detections;
drop function if exists calculate_points();
drop function if exists get_leaderboard(text, text);
drop view if exists public.leaderboard cascade;
drop view if exists public.leaderboard_by_state cascade;

-- Points trigger (runs before insert)
create or replace function calculate_points()
returns trigger as $$
begin
  new.points := case
    when new.native_status = 'native'   then 10
    when new.native_status = 'invasive' then 2
    else 0
  end;

  -- Auto-verify if confidence meets threshold
  new.is_verified := new.confidence >= new.confidence_threshold;

  -- Flag sensitive species as not verified regardless
  if new.is_sensitive then
    new.is_verified := false;
  end if;

  return new;
end;
$$ language plpgsql;

create trigger set_detection_points
  before insert on public.detections
  for each row execute function calculate_points();

-- Leaderboard function — supports all_time, month, ytd and optional state filter
create or replace function get_leaderboard(
  p_scope text default 'all_time',  -- 'all_time' | 'month' | 'ytd'
  p_state text default null         -- null = global
)
returns table (
  user_id                uuid,
  username               text,
  avatar_url             text,
  state                  text,
  total_points           bigint,
  native_count           bigint,
  unique_species         bigint,
  current_streak         int,
  rank                   bigint
) as $$
declare
  date_filter timestamptz;
begin
  date_filter := case p_scope
    when 'month' then date_trunc('month', now())
    when 'ytd'   then date_trunc('year',  now())
    else          '1970-01-01'::timestamptz
  end;

  return query
  select
    u.id,
    u.username,
    u.avatar_url,
    u.state,
    coalesce(sum(d.points), 0)                              as total_points,
    count(d.id) filter (where d.native_status = 'native')  as native_count,
    count(distinct d.latin_name)                            as unique_species,
    coalesce(s.current_streak, 0)                          as current_streak,
    rank() over (order by coalesce(sum(d.points), 0) desc) as rank
  from public.users u
  left join public.detections d
    on  d.user_id = u.id
    and d.detected_at >= date_filter
    and d.is_sensitive = false          -- never expose sensitive species
  left join public.streaks s
    on  s.user_id = u.id
  where (p_state is null or u.state = p_state)
  group by u.id, u.username, u.avatar_url, u.state, s.current_streak;
end;
$$ language plpgsql security definer
set search_path = public;

revoke all on function public.get_leaderboard(text, text) from public;
grant execute on function public.get_leaderboard(text, text) to authenticated;
