-- ML telemetry events for classification debugging and error reporting.
-- Run after create_user.sql / create_detections.sql. Safe to re-run.

create table if not exists public.ml_telemetry_events (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null references public.users(id) on delete cascade,
  created_at      timestamptz not null default now(),

  session_id      uuid not null,
  domain          text not null,
  event_name      text not null,
  pipeline        text not null,
  outcome         text not null check (outcome in ('success', 'empty', 'error')),

  region_id       text,
  platform        text not null,
  app_version     text not null,

  detection_id    uuid references public.detections(id) on delete set null,
  flags           text[] not null default '{}',
  payload         jsonb not null default '{}'::jsonb,
  image_path      text,
  error_message   text
);

create index if not exists ml_telemetry_events_created_at_idx
  on public.ml_telemetry_events (created_at desc);

create index if not exists ml_telemetry_events_domain_event_created_idx
  on public.ml_telemetry_events (domain, event_name, created_at desc);

create index if not exists ml_telemetry_events_user_session_idx
  on public.ml_telemetry_events (user_id, session_id);

create index if not exists ml_telemetry_events_flags_gin_idx
  on public.ml_telemetry_events using gin (flags);

alter table public.ml_telemetry_events enable row level security;

drop policy if exists ml_telemetry_events_select_own on public.ml_telemetry_events;
create policy ml_telemetry_events_select_own
  on public.ml_telemetry_events
  for select
  to authenticated
  using ((select auth.uid()) = user_id);

drop policy if exists ml_telemetry_events_insert_own on public.ml_telemetry_events;
create policy ml_telemetry_events_insert_own
  on public.ml_telemetry_events
  for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

-- Batch insert from the mobile app (SECURITY DEFINER so we can validate + set user_id).
drop function if exists public.insert_ml_telemetry_events(jsonb);

create or replace function public.insert_ml_telemetry_events(p_events jsonb)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  uid uuid := auth.uid();
  inserted_count integer := 0;
begin
  if uid is null then
    raise exception 'Not authenticated';
  end if;

  if p_events is null or jsonb_typeof(p_events) <> 'array' then
    raise exception 'p_events must be a JSON array';
  end if;

  insert into public.ml_telemetry_events (
    user_id,
    session_id,
    domain,
    event_name,
    pipeline,
    outcome,
    region_id,
    platform,
    app_version,
    detection_id,
    flags,
    payload,
    image_path,
    error_message
  )
  select
    uid,
    (event->>'session_id')::uuid,
    coalesce(nullif(trim(event->>'domain'), ''), 'classification'),
    event->>'event_name',
    coalesce(nullif(trim(event->>'pipeline'), ''), 'none'),
    coalesce(nullif(trim(event->>'outcome'), ''), 'success'),
    nullif(trim(event->>'region_id'), ''),
    coalesce(nullif(trim(event->>'platform'), ''), 'unknown'),
    coalesce(nullif(trim(event->>'app_version'), ''), 'unknown'),
    nullif(trim(event->>'detection_id'), '')::uuid,
    coalesce(
      (
        select array_agg(value)
        from jsonb_array_elements_text(coalesce(event->'flags', '[]'::jsonb)) as t(value)
      ),
      '{}'::text[]
    ),
    coalesce(event->'payload', '{}'::jsonb),
    nullif(trim(event->>'image_path'), ''),
    nullif(trim(event->>'error_message'), '')
  from jsonb_array_elements(p_events) as event
  where event->>'session_id' is not null
    and event->>'event_name' is not null;

  get diagnostics inserted_count = row_count;
  return inserted_count;
end;
$$;

revoke all on function public.insert_ml_telemetry_events(jsonb) from public;
grant execute on function public.insert_ml_telemetry_events(jsonb) to authenticated;

-- Link saved detections to all events in a telemetry session for the signed-in user.
drop function if exists public.link_ml_telemetry_session(uuid, uuid);

create or replace function public.link_ml_telemetry_session(
  p_session_id uuid,
  p_detection_id uuid
)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  uid uuid := auth.uid();
  updated_count integer := 0;
begin
  if uid is null then
    raise exception 'Not authenticated';
  end if;

  if p_session_id is null or p_detection_id is null then
    raise exception 'session_id and detection_id are required';
  end if;

  if not exists (
    select 1
    from public.detections d
    where d.id = p_detection_id
      and d.user_id = uid
  ) then
    raise exception 'Detection not found for current user';
  end if;

  update public.ml_telemetry_events e
  set detection_id = p_detection_id
  where e.user_id = uid
    and e.session_id = p_session_id
    and e.detection_id is null;

  get diagnostics updated_count = row_count;
  return updated_count;
end;
$$;

revoke all on function public.link_ml_telemetry_session(uuid, uuid) from public;
grant execute on function public.link_ml_telemetry_session(uuid, uuid) to authenticated;
