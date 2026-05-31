# SQL setup (Near Nature)

## How to run these scripts

1. Open **Supabase Dashboard → SQL Editor → New query**.
2. Open a **`.sql` file** from this folder in your code editor (e.g. `create_user.sql`).
3. Select all (`Ctrl+A`), copy, paste into the SQL Editor.
4. Confirm the **first line is SQL** (`--` comment or `create` / `drop`), **not** markdown like `# SQL setup`.
5. Click **Run**.
6. Repeat for the next file in order.
7. When finished: **Settings → API → Reload schema cache**, then run `npm run verify:supabase` from the project root.

> **Do not paste this README into the SQL Editor.** It is markdown (`.md`), not SQL.

All `.sql` scripts here are written to be **safe to re-run** (they drop/recreate objects by name where needed).

---

## Files in this folder

| File | Role |
|------|------|
| `create_user.sql` | `public.users`, RLS, profile trigger on signup |
| `resolve_login_email.sql` | RPC: login with email or username |
| `check_user_exists.sql` | RPCs: sign-up email / username availability |
| `create_detections.sql` | Enums, `public.detections`, RLS |
| `create_leaderboard.sql` | `calculate_points` trigger on insert (legacy filename; powers Explorer Board points) |
| `create_streaks.sql` | `public.streaks`, streak trigger on insert |
| `create_discoveries.sql` | `public.discoveries`, first-species bonus trigger |
| `storage_bucket_detections.sql` | Storage bucket + policies |
| `get_detection_count_leaderboard.sql` | RPC: Explorer Board rankings (paginated; optional `p_search` on username/motto) |
| `get_public_user_profile.sql` | RPC: public profile + stats |
| `drop_streak_client_update_policy.sql` | Removes obsolete streak `UPDATE` policy |
| `ensure_public_user_profile.sql` | RPC: create missing `public.users` row for signed-in user; hardens signup trigger |
| `backfill_public_users_from_auth.sql` | One-off: profiles for all existing auth users |
| `delete_auth_user_by_email.sql` | Dev reset: delete one auth user to sign up again |
| `add_user_date_of_birth.sql` | `date_of_birth` column + signup trigger (patch existing DB) |
| `add_species_subcategories.sql` | Plant/animal subcategory enum values (patch existing DB) |
| `add_naturalist_category_enums.sql` | Entomologist / ichthyologist / mycologist enum values (patch) |
| `add_detection_naturalist_columns.sql` | `subcategory` + `main_category` on detections/discoveries, backfill, sync trigger |
| `get_user_score_by_category.sql` | RPC: owner score breakdown by main discipline (detections + awards) |
| `get_user_scoring_snapshot.sql` | RPC: one JSON payload — score rows, awards, sub/main species counts (profile scoring) |
| `get_public_user_awards.sql` | RPC: earned badge rows for any member (public profile) |
| `add_detection_search.sql` | `species_metadata`, search columns/indexes on detections, `search_user_detections` RPC |
| `optimize_detection_gallery.sql` | Gallery indexes, faster search RPC, SQL category filter, alias refresh trigger |
| `check_category_milestones.sql` | Milestone / badge awards after first species discovery (trigger calls this) |
| `create_point_awards.sql` | `public.point_awards` table (tier bonuses) |
| `harden_security_linter.sql` | Supabase linter fixes: `search_path`, RPC grants, `species_metadata` RLS, anon table access |
| `drop_legacy_rpc.sql` | One-off: drops unused RPCs and old indexes |

Gallery list metadata is cached on device (`near_nature:gallery_list:…` in AsyncStorage); images use signed-URL memory cache + `expo-image` disk cache.

> **Note:** The old **Discover** explore tab (parks / species catalog under `sql/discover/`) was removed from the app. The `public.discoveries` table is unrelated — it stores each user’s first-time species logs for points and badges.

Print the bootstrap order in PowerShell:

```powershell
.\scripts\beta-production-setup.ps1
```

---

## Full database rebuild

Use for a **new** Supabase project or when you intentionally recreate the `public` schema.

> **Warning:** `create_user.sql` and `create_detections.sql` use `DROP TABLE … CASCADE`. That removes profiles, detections, discoveries, streaks, and dependent data.  
> **`auth.users` are not deleted.** Run `backfill_public_users_from_auth.sql` if accounts exist but `public.users` rows are missing.

| Step | File | What it sets up |
|------|------|-----------------|
| 1 | `create_user.sql` | Users table, RLS, `handle_new_user` on `auth.users` |
| 2 | `resolve_login_email.sql` | `resolve_login_email` RPC |
| 3 | `check_user_exists.sql` | Sign-up email / username availability RPCs |
| 4 | `create_detections.sql` | Detection enums/table/RLS (repeat species per day allowed) |
| 5 | `create_leaderboard.sql` | Points + verification on insert |
| 6 | `create_streaks.sql` | Streak table + trigger |
| 7 | `create_discoveries.sql` | First-species discovery + bonus points |
| 8 | `storage_bucket_detections.sql` | `detections` bucket and storage policies |
| 9 | `get_detection_count_leaderboard.sql` | Explorer Board RPC |
| 10 | `get_public_user_profile.sql` | Public profile RPC |
| 11 | `add_detection_naturalist_columns.sql` | Taxonomy columns + milestone helpers |
| 12 | `get_user_score_by_category.sql` | Owner score breakdown RPC |
| 13 | `get_user_scoring_snapshot.sql` | Owner scoring snapshot RPC |
| 14 | `get_public_user_awards.sql` | Public earned-badges RPC |
| 15 | `add_detection_search.sql` | Gallery search (FTS, trigram, aliases) |
| 16 | `optimize_detection_gallery.sql` | Gallery browse/search performance (existing DBs) |
| 17 | `drop_streak_client_update_policy.sql` | Policy cleanup (harmless on fresh DB) |
| 18 | `harden_security_linter.sql` | Security hardening (see below) |

### After rebuild

| Need | Action |
|------|--------|
| Auth users without `public.users` | Run `ensure_public_user_profile.sql`, then `backfill_public_users_from_auth.sql` if many users are affected |
| Species identification in app | Native: bundled TFLite models (no Edge). Web: `.\scripts\deploy-identify-species.ps1` and `GEMINI_API_KEY` in Edge secrets |
| Delete account in app | Deploy `delete-account` Edge Function (not SQL) |
| Confirm RPCs | `npm run verify:supabase` |

Do **not** put `EXPO_PUBLIC_GEMINI_API_KEY` in production app `.env` for release builds — use the Edge Function on web only.

---

## Existing database (patch only)

If tables already exist and you only need to refresh objects:

| Goal | Run |
|------|-----|
| Drop legacy RPCs / `one_species_per_day` index | `drop_legacy_rpc.sql` |
| Sign-up availability checks | `check_user_exists.sql` |
| Add date of birth (existing DB) | `add_user_date_of_birth.sql` |
| Species subcategories on detections | `add_species_subcategories.sql` |
| Storage + gallery/avatar read policies | `storage_bucket_detections.sql` |
| Explorer Board | `get_detection_count_leaderboard.sql` |
| Member profiles | `get_public_user_profile.sql` |
| Member earned badges | `get_public_user_awards.sql` |
| Profile scoring tab | `get_user_scoring_snapshot.sql`, `get_user_score_by_category.sql`, `add_badge_progress.sql`, `deactivate_legacy_badge_definitions.sql` |
| Naturalist taxonomy | `add_naturalist_category_enums.sql`, `add_detection_naturalist_columns.sql`, `check_category_milestones.sql` |
| Username login | `resolve_login_email.sql` |
| Missing profile after sign-in | `ensure_public_user_profile.sql` |
| Points on save | `create_leaderboard.sql` |
| Gallery search | `add_detection_search.sql` |
| Gallery search slow / filter incomplete | `optimize_detection_gallery.sql` (after `add_detection_search.sql`) |
| Supabase Dashboard security linter warnings | `harden_security_linter.sql` |

Then reload the schema cache and run `npm run verify:supabase`.

---

## Security hardening (`harden_security_linter.sql`)

Run this on **any** project that already has the app schema deployed (local or hosted Supabase). It addresses most **WARN** items from **Database → Linter** in the Supabase Dashboard (security and RLS performance).

**One file is enough** — you do not need to re-run the full bootstrap or every patch script for these fixes.

### What it fixes

| Linter | What we change |
|--------|----------------|
| `auth_rls_initplan` | `(select auth.uid())` in RLS on `detections`, `users`, `streaks`, `point_awards`, `discoveries` |
| `multiple_permissive_policies` | Single `SELECT` policy on `detections`: own rows **or** `is_sensitive = false` |
| `function_search_path_mutable` | `ALTER FUNCTION … SET search_path = public` on helpers and triggers |
| `rls_policy_always_true` | Removes direct `INSERT`/`UPDATE` on `species_metadata`; writes only via RPC `upsert_species_metadata` |
| `extension_in_public` | Moves `pg_trgm` to `extensions` schema; recreates trigram indexes |
| `pg_graphql_anon_table_exposed` (partial) | `REVOKE SELECT` from `anon` on `users`, `discoveries`, `point_awards`, `streaks`, `species_metadata` |
| `pg_graphql_authenticated_table_exposed` (partial) | `REVOKE SELECT` from `authenticated` on `species_metadata` (RPC-only) |
| `anon_security_definer_function_executable` (partial) | `REVOKE EXECUTE` on triggers/internal RPCs and owner-only RPCs (`upsert_species_metadata`, scoring snapshot, etc.) |

Also grants **`anon`** `EXECUTE` on `get_public_user_awards` so guests can load earned badges on public member profiles via RPC (not the `point_awards` table).

### What stays as-is (by design)

| Item | Why |
|------|-----|
| `detections` visible to `anon` | Guest Explorer Board and public member galleries read non-sensitive rows (RLS + PostgREST) |
| `authenticated` GraphQL on `detections`, `users`, `discoveries`, `point_awards`, `streaks` | App uses `.from(...)` with RLS; clearing requires RPC-only refactors |
| `0028` / `0029` on public RPCs | Linter flags any callable `SECURITY DEFINER` RPC; sign-up checks, leaderboard, and public profile RPCs are intentional |

### Order relative to other patches

1. If saves fail with **`award_key` is ambiguous**, run **`check_category_milestones.sql`** first (uses `v_award_key` in the function body).
2. Run **`harden_security_linter.sql`**.
3. **Reload schema cache**, then `npm run verify:supabase`.

`harden_security_linter.sql` does **not** replace the body of `check_category_milestones`; it only revokes client `EXECUTE` and pins `search_path` on related helpers.

---

## Points system

### Per save (detection row)

| Action | Points |
|--------|--------|
| Native species identified | +10 |
| Non-native (invasive) species logged | +2 |
| First time you log that species (discovery) | +5 on that detection |

### Category tiers (unique species per discipline / subcategory)

Counts use distinct `latin_name` in `public.discoveries`. Bonuses are one-time per tier (stored in `public.point_awards`).

| Scope | Explorer (10 sp.) | Adventurer (25 sp.) | Voyager (50 sp.) |
|-------|-------------------|---------------------|------------------|
| Main category | 50 | 150 | 500 |
| Subcategory | 25 | 75 | 250 |

**Badges:** Ends of the Earth (Voyager in all 4 main categories) +1,000 · True Voyager per discipline (main + all subs Voyager) +2,000.

SQL: `create_point_awards.sql`, `check_category_milestones.sql` (runs after each new discovery).

---

## What the app uses

| Feature | Database |
|---------|----------|
| Sign up / edit profile | `public.users` (PostgREST + RLS); availability RPCs at sign-up |
| Sign in with email or username | RPC `resolve_login_email` |
| Save / delete photo | `public.detections` + Storage |
| Explorer Board | RPC `get_detection_count_leaderboard` |
| View another member | RPC `get_public_user_profile`, `get_public_user_awards` |
| Own profile scoring / badges | RPC `get_user_scoring_snapshot` (fallback: `get_user_score_by_category` + `point_awards`) |
| Delete account | Edge Function `delete-account` |

**Behavior notes:** Same species can be saved multiple times per day. GPS is never stored (US state code only). Sensitive species are hidden from public gallery and Explorer Board aggregates.
