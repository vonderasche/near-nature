-- Purge old ML telemetry events (run manually or schedule via pg_cron).
-- Example: delete from public.ml_telemetry_events where created_at < now() - interval '90 days';

delete from public.ml_telemetry_events
where created_at < now() - interval '90 days';
