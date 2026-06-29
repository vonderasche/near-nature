-- Private bucket for optional ML telemetry debug thumbnails ({user_id}/{session_id}.jpg).
-- Run after create_ml_telemetry_events.sql. Safe to re-run.

insert into storage.buckets (id, name, public)
values ('ml-telemetry', 'ml-telemetry', false)
on conflict (id) do nothing;

drop policy if exists "Users upload own ml telemetry thumbnails" on storage.objects;
drop policy if exists "Users read own ml telemetry thumbnails" on storage.objects;
drop policy if exists "Users delete own ml telemetry thumbnails" on storage.objects;

create policy "Users upload own ml telemetry thumbnails"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'ml-telemetry'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "Users read own ml telemetry thumbnails"
  on storage.objects for select
  to authenticated
  using (
    bucket_id = 'ml-telemetry'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "Users delete own ml telemetry thumbnails"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'ml-telemetry'
    and auth.uid()::text = (storage.foldername(name))[1]
  );
