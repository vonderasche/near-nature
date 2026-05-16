-- =============================================================================
-- Near Nature — friends APK database bootstrap (Supabase SQL Editor)
-- Safe to re-run. Run this file once, then run the two RPC files listed at the end.
-- =============================================================================

-- ── Storage: detections bucket + profile avatar read policy ─────────────────
insert into storage.buckets (id, name, public)
values ('detections', 'detections', false)
on conflict (id) do nothing;

drop policy if exists "Users can upload their own detection images" on storage.objects;
drop policy if exists "Users can view their own detection images"  on storage.objects;
drop policy if exists "Users can delete their own detection images" on storage.objects;
drop policy if exists "Authenticated can read non-sensitive owners detection images" on storage.objects;
drop policy if exists "Authenticated can read profile avatars" on storage.objects;

create policy "Users can upload their own detection images"
  on storage.objects for insert
  with check (
    bucket_id = 'detections' and
    auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "Users can view their own detection images"
  on storage.objects for select
  using (
    bucket_id = 'detections' and
    auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "Authenticated can read profile avatars"
  on storage.objects for select
  to authenticated
  using (
    bucket_id = 'detections'
    and (storage.foldername(name))[1] is not null
    and right(name, length('profile-avatar.jpg')) = 'profile-avatar.jpg'
  );

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

create policy "Users can delete their own detection images"
  on storage.objects for delete
  using (
    bucket_id = 'detections' and
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- ── Discover tab: explore_species read access ─────────────────────────────────
alter table public.explore_species enable row level security;

drop policy if exists "Authenticated users can read explore species" on public.explore_species;

create policy "Authenticated users can read explore species"
  on public.explore_species
  for select
  to authenticated
  using (true);

grant select on public.explore_species to authenticated;

-- ── Also run in SQL Editor (full definitions; safe to re-run): ────────────────
--   sql/create_discoveries.sql                (first-species discovery + bonus points)
--   sql/get_detection_count_leaderboard.sql   (Explorer Board)
--   sql/get_public_user_profile.sql           (public profiles + stats)
--
-- Edge Function (Supabase Dashboard → Edge Functions):
--   Deploy supabase/functions/identify-species
--   Secrets: ANTHROPIC_API_KEY, optional ANTHROPIC_MODEL=claude-sonnet-4-6
