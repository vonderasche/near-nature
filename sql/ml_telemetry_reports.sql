-- Reporting views for ml_telemetry_events. Run after create_ml_telemetry_events.sql.
-- Views use security_invoker so RLS on ml_telemetry_events applies to the caller (not the view owner).

drop view if exists public.ml_telemetry_reclassify_mismatches_30d;
drop view if exists public.ml_telemetry_reclassify_rate_30d;
drop view if exists public.ml_telemetry_routing_misses_30d;
drop view if exists public.ml_telemetry_flag_counts_30d;

create view public.ml_telemetry_flag_counts_30d
with (security_invoker = true)
as
select
  e.domain,
  e.event_name,
  e.pipeline,
  coalesce(e.region_id, 'unknown') as region_id,
  flag,
  count(*) as event_count
from public.ml_telemetry_events e
cross join lateral unnest(e.flags) as flag
where e.created_at >= now() - interval '30 days'
group by 1, 2, 3, 4, 5
order by event_count desc;

create view public.ml_telemetry_routing_misses_30d
with (security_invoker = true)
as
select
  coalesce(e.payload->>'routing_label', 'unknown') as routing_label,
  e.region_id,
  count(*) filter (where 'empty_result' = any (e.flags)) as empty_count,
  count(*) filter (where 'routing_no_organism' = any (e.flags)) as no_organism_count,
  count(*) as total_events,
  round(avg((e.payload->'top_predictions'->0->>'confidence')::numeric), 3) as avg_top_confidence
from public.ml_telemetry_events e
where e.created_at >= now() - interval '30 days'
  and e.event_name = 'capture_identify'
group by 1, 2
order by empty_count desc, total_events desc;

create view public.ml_telemetry_reclassify_rate_30d
with (security_invoker = true)
as
with sessions as (
  select
    e.session_id,
    coalesce(e.region_id, 'unknown') as region_id,
    bool_or(e.event_name = 'cloud_reclassify' and e.outcome = 'success') as reclassified
  from public.ml_telemetry_events e
  where e.created_at >= now() - interval '30 days'
  group by e.session_id, coalesce(e.region_id, 'unknown')
)
select
  region_id,
  count(*) as session_count,
  count(*) filter (where reclassified) as reclassified_sessions,
  round(
    100.0 * count(*) filter (where reclassified) / nullif(count(*), 0),
    1
  ) as reclassify_pct
from sessions
group by region_id
order by reclassify_pct desc nulls last;

create view public.ml_telemetry_reclassify_mismatches_30d
with (security_invoker = true)
as
select
  e.id,
  e.created_at,
  e.region_id,
  coalesce(e.payload->>'routing_label', e.payload->'tflite_prediction'->>'routing_label') as routing_label,
  coalesce(
    e.payload->'comparison'->>'tflite_top_latin',
    e.payload->'tflite_prediction'->'top'->>'latin_name',
    e.payload->'prior_tflite_meta'->'genusTop'->0->>'genus'
  ) as tflite_top_latin,
  coalesce(
    e.payload->'comparison'->>'gemini_top_latin',
    e.payload->'gemini_prediction'->'top'->>'latin_name',
    e.payload->'top_predictions'->0->>'label'
  ) as gemini_top_latin,
  e.payload->'tflite_prediction' as tflite_prediction,
  e.payload->'gemini_prediction' as gemini_prediction,
  e.payload->'comparison' as comparison,
  e.flags
from public.ml_telemetry_events e
where e.created_at >= now() - interval '30 days'
  and e.event_name = 'cloud_reclassify'
  and (
    'reclassify_mismatch' = any (e.flags)
    or (e.payload->'comparison'->>'reclassify_mismatch')::boolean is true
  )
order by e.created_at desc;

grant select on public.ml_telemetry_flag_counts_30d to authenticated;
grant select on public.ml_telemetry_routing_misses_30d to authenticated;
grant select on public.ml_telemetry_reclassify_rate_30d to authenticated;
grant select on public.ml_telemetry_reclassify_mismatches_30d to authenticated;

-- Optional daily rollup table for high volume (refresh manually or via pg_cron).
create table if not exists public.ml_telemetry_daily_rollups (
  day date not null,
  domain text not null,
  event_name text not null,
  pipeline text not null,
  region_id text not null default 'unknown',
  flag text not null default '',
  event_count integer not null default 0,
  primary key (day, domain, event_name, pipeline, region_id, flag)
);

create or replace function public.refresh_ml_telemetry_daily_rollups(p_days integer default 7)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  refreshed integer := 0;
begin
  insert into public.ml_telemetry_daily_rollups (day, domain, event_name, pipeline, region_id, flag, event_count)
  select
    (e.created_at at time zone 'utc')::date as day,
    e.domain,
    e.event_name,
    e.pipeline,
    coalesce(e.region_id, 'unknown') as region_id,
    coalesce(flag, '') as flag,
    count(*) as event_count
  from public.ml_telemetry_events e
  left join lateral unnest(
    case when cardinality(e.flags) = 0 then array['']::text[] else e.flags end
  ) as flag on true
  where e.created_at >= now() - make_interval(days => p_days)
  group by 1, 2, 3, 4, 5, 6
  on conflict (day, domain, event_name, pipeline, region_id, flag)
  do update set event_count = excluded.event_count;

  get diagnostics refreshed = row_count;
  return refreshed;
end;
$$;

revoke all on function public.refresh_ml_telemetry_daily_rollups(integer) from public;
grant execute on function public.refresh_ml_telemetry_daily_rollups(integer) to authenticated;
