# SQL setup (Near Nature)

All scripts in this folder are written to be **safe to re-run** (they drop/recreate objects by name before creating them again).

Run each file in the **Supabase SQL Editor** (or `psql`), **one file at a time**, in the order below.

---

## Full database rebuild (`public` schema)

Use this when setting up a **new** project or when you want to recreate tables, triggers, storage policies, and RPCs from scratch.

> **Warning:** `create_user.sql` and `create_detections.sql` drop their tables with `CASCADE`. That deletes profile rows, detections, discoveries, streaks, and anything else that references them.  
> **Auth users** in `auth.users` are not deleted; run `backfill_public_users_from_auth.sql` afterward if profiles are missing.

| Step | File | What it sets up |
|------|------|-----------------|
| 1 | `create_user.sql` | `public.users`, RLS, `updated_at`, signup trigger on `auth.users` |
| 2 | `resolve_login_email.sql` | RPC: sign in with **email or username** |
| 3 | `check_user_exists.sql` | RPCs: email / username availability |
| 4 | `update_user.sql` | RPC: `update_user_profile` |
| 5 | `delete_user.sql` | RPC: `delete_user_account` |
| 6 | `create_detections.sql` | Enums, `public.detections`, RLS (no `one_species_per_day` index by default) |
| 7 | `update_detections.sql` | RPC: update detection |
| 8 | `delete_detections.sql` | RPCs: delete detection(s) |
| 9 | `create_leaderboard.sql` | `calculate_points` **before insert** on detections; legacy `get_leaderboard` |
| 10 | `create_streaks.sql` | `public.streaks`, streak **after insert** on detections |
| 11 | `create_discoveries.sql` | `public.discoveries`, first-species bonus **after insert** on detections |
| 12 | `storage_bucket_detections.sql` | `detections` storage bucket + RLS (includes profile-avatar read policy) |
| 13 | `get_detection_count_leaderboard.sql` | RPC: Explorer Board (points total, recent previews, native / non-native species) |
| 14 | `get_public_user_profile.sql` | RPC: public profile + streak, points & species stats |
| 15 | `explore_species_public_read.sql` | RLS **select** on `public.explore_species` (table must already exist) |
| 16 | `disable_one_species_per_day_temp.sql` | **Recommended for current app:** allows repeat saves of same species per day |
| 17 | `drop_streak_client_update_policy.sql` | Removes obsolete client `UPDATE` policy on streaks (harmless on fresh DB) |

### After a full rebuild

| When | File |
|------|------|
| Auth accounts exist but no `public.users` rows | `backfill_public_users_from_auth.sql` |
| Discover tab needs data | Create/import `public.explore_species` (CSV in Table Editor), then run step 15 if you skipped it |
| Friends APK / edge identification | Deploy Edge Function `identify-species`; set Supabase secret `ANTHROPIC_API_KEY` |

### `explore_species` table

There is **no** `create_explore_species.sql` in this repo. The table is created and filled separately (e.g. CSV import). Step 15 only adds RLS so authenticated users can read it.

---

## Patch an existing database (no full rebuild)

If tables already exist and you only need to refresh policies or RPCs:

| Goal | File(s) |
|------|---------|
| Storage + avatars + Discover read access | `friends_release_bootstrap.sql` (subset of steps 12 + 15) |
| Explorer Board RPC only | `get_detection_count_leaderboard.sql` |
| Public profile / stats RPC only | `get_public_user_profile.sql` |
| Discover tab RLS only | `explore_species_public_read.sql` |
| Full storage policies (canonical) | `storage_bucket_detections.sql` |

`friends_release_bootstrap.sql` is a shortcut for testers; for a clean install, prefer the **full rebuild** order above.

---

## Optional: one detection per species per day

| Intent | File |
|--------|------|
| **Current default** — allow multiple saves per species per day | `disable_one_species_per_day_temp.sql` (included in full rebuild step 16) |
| Production rule — one save per species per user per UTC day | `enable_one_species_per_day_temp.sql` (fails if duplicate rows already exist) |

---

## Points system

| Action | Points |
|--------|--------|
| Native species identified | +10 |
| Non-native (invasive) species logged | +2 |
| First time you log that species (discovery) | +5 bonus on that detection |

---

## App notes

- GPS coordinates are never stored — only US state code on detections.
- Sensitive species are hidden from public gallery and leaderboard aggregates.
- Detections below the confidence threshold are saved but marked unverified.
- The app uses **`get_detection_count_leaderboard`**, not legacy `get_leaderboard`.
