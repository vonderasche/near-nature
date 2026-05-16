-- Insert bucket, do nothing if it already exists
insert into storage.buckets (id, name, public)
values ('detections', 'detections', false)
on conflict (id) do nothing;

-- Drop existing policies before recreating
drop policy if exists "Users can upload their own detection images" on storage.objects;
drop policy if exists "Users can view their own detection images"  on storage.objects;
drop policy if exists "Users can delete their own detection images" on storage.objects;
drop policy if exists "Authenticated can read non-sensitive owners detection images" on storage.objects;
drop policy if exists "Authenticated can read profile avatars" on storage.objects;

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

-- Profile photos live at `{user_id}/profile-avatar.jpg` (not linked from detections).
create policy "Authenticated can read profile avatars"
  on storage.objects for select
  to authenticated
  using (
    bucket_id = 'detections'
    and (storage.foldername(name))[1] is not null
    and right(name, length('profile-avatar.jpg')) = 'profile-avatar.jpg'
  );

-- Signed URLs / gallery: any signed-in user may read an object only when a
-- non-sensitive detection owned by that object path's user references this object.
-- (Requires user_id in path to match row owner so image_url cannot be forged for another prefix.)
create policy "Authenticated can read non-sensitive owners detection images"
  on storage.objects for select
  to authenticated
  using (
    bucket_id = 'detections'
    and exists (
      select 1
      from public.detections d
      where d.is_sensitive = false
        and d.user_id = ((storage.foldername(name))[1])::uuid
        and position(name in d.image_url) > 0
    )
  );

-- Allow users to delete their own images
create policy "Users can delete their own detection images"
  on storage.objects for delete
  using (
    bucket_id = 'detections' and
    auth.uid()::text = (storage.foldername(name))[1]
  );