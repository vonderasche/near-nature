-- Insert bucket, do nothing if it already exists
insert into storage.buckets (id, name, public)
values ('detections', 'detections', false)
on conflict (id) do nothing;

-- Drop existing policies before recreating
drop policy if exists "Users can upload their own detection images" on storage.objects;
drop policy if exists "Users can view their own detection images"  on storage.objects;
drop policy if exists "Users can delete their own detection images" on storage.objects;

-- Allow users to upload their own images
create policy "Users can upload their own detection images"
  on storage.objects for insert
  with check (
    bucket_id = 'detections' and
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Allow users to view their own images
create policy "Users can view their own detection images"
  on storage.objects for select
  using (
    bucket_id = 'detections' and
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Allow users to delete their own images
create policy "Users can delete their own detection images"
  on storage.objects for delete
  using (
    bucket_id = 'detections' and
    auth.uid()::text = (storage.foldername(name))[1]
  );