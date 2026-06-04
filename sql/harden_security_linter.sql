-- Security hardening for Supabase Database Linter warnings.
-- Safe to re-run on existing projects. After running: reload schema cache.
--
-- Fixes:
--   0003  auth_rls_initplan (select auth.uid() in RLS policies)
--   0006  multiple_permissive_policies on detections SELECT (merged into one policy)
--   0011  function search_path mutable
--   0024  permissive species_metadata RLS (writes via RPC only)
--   0014  move pg_trgm out of public schema
--   0026  reduce anon GraphQL/PostgREST table exposure (keeps public detections)
--   0027  revoke authenticated SELECT on species_metadata (app uses RPCs only)
--   0028  revoke anon EXECUTE on owner-only / write RPCs (keeps intentional public RPCs)
--
-- Remaining WARNs by design: detections visible to anon; authenticated table GraphQL
-- exposure on tables the app queries via PostgREST; 0028/0029 on intentional public RPCs.

-- ── 1. Pin search_path on helper + trigger functions ─────────────────────────

alter function public.update_updated_at() set search_path = public;
alter function public.calculate_points() set search_path = public;
alter function public.sync_detection_naturalist_categories() set search_path = public;
alter function public.sync_detection_search_fields() set search_path = public;

alter function public.tier_for_species_count(int) set search_path = public;
alter function public.category_to_subcategory(text) set search_path = public;
alter function public.subcategory_to_main(text) set search_path = public;
alter function public.discovery_canonical_subcategory(text, text) set search_path = public;
alter function public.discovery_canonical_main(text, text, text) set search_path = public;

alter function public.award_key_to_main_category(text) set search_path = public;

alter function public.normalize_latin_name_for_search(text) set search_path = public;
alter function public.latin_genus_for_search(text) set search_path = public;
alter function public.taxonomy_tokens_for_search(text, text, text) set search_path = public;
alter function public.merge_species_aliases(text[], text[]) set search_path = public;

alter function public.build_detection_search_text(text, text, text, text, text, text, text[])
  set search_path = public;
alter function public.build_detection_search_vector(text, text, text, text, text, text, text[])
  set search_path = public;

-- ── 2. species_metadata: read via RLS; writes only through upsert_species_metadata ─

drop policy if exists "Authenticated users can upsert species metadata" on public.species_metadata;
drop policy if exists "Authenticated users can update species metadata" on public.species_metadata;

drop policy if exists "Authenticated users can read species metadata" on public.species_metadata;
create policy "Authenticated users can read species metadata"
  on public.species_metadata for select
  to authenticated
  using (true);

-- ── 3. Revoke direct table SELECT from anon (app uses RPCs / RLS on detections) ─

revoke select on table public.users from anon;
revoke select on table public.discoveries from anon;
revoke select on table public.point_awards from anon;
revoke select on table public.streaks from anon;
revoke select on table public.species_metadata from anon;

-- Guest public member profiles: awards via RPC (not point_awards table)
revoke all on function public.get_public_user_awards(uuid) from public;
grant execute on function public.get_public_user_awards(uuid) to authenticated, anon;

-- ── 4. Trigger / internal functions: not callable via PostgREST ───────────────

revoke all on function public.check_category_milestones(uuid) from public;
revoke execute on function public.check_category_milestones(uuid) from anon, authenticated;

revoke all on function public.handle_first_discovery() from public;
revoke execute on function public.handle_first_discovery() from anon, authenticated;

revoke all on function public.handle_new_user() from public;
revoke execute on function public.handle_new_user() from anon, authenticated;

revoke all on function public.update_streak() from public;
revoke execute on function public.update_streak() from anon, authenticated;

revoke all on function public.insert_public_user_from_auth(uuid) from public;
revoke execute on function public.insert_public_user_from_auth(uuid) from anon, authenticated;

revoke all on function public.calculate_points() from public;
revoke execute on function public.calculate_points() from anon, authenticated;

revoke all on function public.update_updated_at() from public;
revoke execute on function public.update_updated_at() from anon, authenticated;

revoke all on function public.sync_detection_naturalist_categories() from public;
revoke execute on function public.sync_detection_naturalist_categories() from anon, authenticated;

revoke all on function public.sync_detection_search_fields() from public;
revoke execute on function public.sync_detection_search_fields() from anon, authenticated;

-- ── 5. RLS performance: initplan + merge duplicate detections SELECT policies ─

-- public.detections
drop policy if exists "Users can view their own detections" on public.detections;
drop policy if exists "Non-sensitive detections are publicly viewable" on public.detections;
drop policy if exists "Users can select own or public non-sensitive detections" on public.detections;
drop policy if exists "Users can insert their own detections" on public.detections;
drop policy if exists "Users can delete their own detections" on public.detections;

create policy "Users can select own or public non-sensitive detections"
  on public.detections for select
  using ((select auth.uid()) = user_id or is_sensitive = false);

create policy "Users can insert their own detections"
  on public.detections for insert
  with check ((select auth.uid()) = user_id);

create policy "Users can delete their own detections"
  on public.detections for delete
  using ((select auth.uid()) = user_id);

-- public.users
drop policy if exists "Users can view their own profile" on public.users;
drop policy if exists "Users can update their own profile" on public.users;
drop policy if exists "Users can delete their own profile" on public.users;

create policy "Users can view their own profile"
  on public.users for select
  using ((select auth.uid()) = id);

create policy "Users can update their own profile"
  on public.users for update
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

create policy "Users can delete their own profile"
  on public.users for delete
  using ((select auth.uid()) = id);

-- public.streaks
drop policy if exists "Users can view their own streak" on public.streaks;
create policy "Users can view their own streak"
  on public.streaks for select
  using ((select auth.uid()) = user_id);

-- public.point_awards
drop policy if exists "Users can view their own point awards" on public.point_awards;
create policy "Users can view their own point awards"
  on public.point_awards for select
  using ((select auth.uid()) = user_id);

-- public.discoveries
drop policy if exists "Users can view their own discoveries" on public.discoveries;
create policy "Users can view their own discoveries"
  on public.discoveries for select
  using ((select auth.uid()) = user_id);

-- ── 6. pg_trgm trigram indexes + tighten RPC / species_metadata exposure ─────
-- Requires public._create_gin_trgm_index (from add_detection_search.sql or pg_trgm_bootstrap.sql).

create schema if not exists extensions;
grant usage on schema extensions to postgres, anon, authenticated, service_role;

drop index if exists public.species_metadata_latin_norm_trgm_idx;
drop index if exists public.detections_search_text_trgm_idx;
drop index if exists public.detections_latin_normalized_trgm_idx;
drop index if exists public.detections_common_name_trgm_idx;

do $$
begin
  if exists (select 1 from pg_extension where extname = 'pg_trgm') then
    begin
      alter extension pg_trgm set schema extensions;
    exception
      when others then
        null;
    end;
  end if;
end $$;

select public._create_gin_trgm_index(
  'species_metadata_latin_norm_trgm_idx',
  'public.species_metadata'::regclass,
  'latin_name_normalized'
);
select public._create_gin_trgm_index(
  'detections_search_text_trgm_idx',
  'public.detections'::regclass,
  'search_text'
);
select public._create_gin_trgm_index(
  'detections_latin_normalized_trgm_idx',
  'public.detections'::regclass,
  'latin_name_normalized'
);
select public._create_gin_trgm_index(
  'detections_common_name_trgm_idx',
  'public.detections'::regclass,
  'common_name'
);

-- species_metadata: no direct PostgREST reads (search/upsert use SECURITY DEFINER RPCs)
revoke select on table public.species_metadata from authenticated;

-- BEFORE INSERT/UPDATE on detections reads species_metadata (must not use caller grants)
alter function public.sync_detection_search_fields() security definer;
alter function public.sync_detection_search_fields() set search_path = public;

revoke execute on function public.upsert_species_metadata(text, text, text[]) from anon;
grant execute on function public.upsert_species_metadata(text, text, text[]) to authenticated;

revoke execute on function public.get_user_score_by_category(uuid) from anon;
grant execute on function public.get_user_score_by_category(uuid) to authenticated;

revoke execute on function public.get_user_scoring_snapshot(uuid) from anon;
grant execute on function public.get_user_scoring_snapshot(uuid) to authenticated;

revoke execute on function public.ensure_public_user_profile() from anon;
grant execute on function public.ensure_public_user_profile() to authenticated;

revoke execute on function public.update_own_user_profile(jsonb) from anon;
grant execute on function public.update_own_user_profile(jsonb) to authenticated;
