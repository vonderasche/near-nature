-- Allow logged-out users to view public Rankings / explore images via signed URLs.
-- Same rules as authenticated gallery reads: non-sensitive detections + profile avatars only.
-- Safe to re-run.

drop policy if exists "Anon can read profile avatars" on storage.objects;
drop policy if exists "Anon can read non-sensitive owners detection images" on storage.objects;

create policy "Anon can read profile avatars"
  on storage.objects for select
  to anon
  using (
    bucket_id = 'detections'
    and (storage.foldername(name))[1] is not null
    and right(name, length('profile-avatar.jpg')) = 'profile-avatar.jpg'
  );

create policy "Anon can read non-sensitive owners detection images"
  on storage.objects for select
  to anon
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
