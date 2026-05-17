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
| 13 | `get_detection_count_leaderboard.sql` | RPC: Explorer Board paginated (`p_limit`, `p_offset`; points, previews, species) |
| 14 | `get_public_user_profile.sql` | RPC: public profile + streak, points & species stats |
| 15 | `disable_one_species_per_day_temp.sql` | **Recommended for current app:** allows repeat saves per species per day |
| 16 | `drop_streak_client_update_policy.sql` | Removes obsolete client `UPDATE` policy on streaks (harmless on fresh DB) |
| 17 | `discover/create_explore_species.sql` | Curated `explore_species` table + RLS |
| 18 | `discover/create_seasonality.sql` | Monthly seasonality keyed by `latin_name` |
| 19 | `discover/create_parks.sql` | `parks` table |
| 20 | `discover/create_park_species.sql` | `park_species` + `parks_with_counts` view |
| 21 | `discover/create_species_park_link.sql` | RPCs: `get_park_species`, `get_nearby_parks`, etc. |
| 22 | `discover/create_featured_rotation.sql` | Featured species rotation + detection bonus trigger |
| 23 | `discover/explore_app_grants.sql` | Grants for Discover RPCs and park views |
| 24 | `discover/seed/florida_data.sql` then `discover/seed_florida_discover_all.sql` | Florida Discover seed (see [discover/README.md](./discover/README.md)) |
| — | `discover/get_park_summary_for_state.sql` | Optional: hub park counts without full park list |

### After a full rebuild

| When | File |
|------|------|
| Auth accounts exist but no `public.users` rows | `backfill_public_users_from_auth.sql` |
| Discover tab needs data | Run steps 17–24, or import your own CSV then `discover/explore_app_grants.sql` |
| Friends APK / edge identification | `.\scripts\deploy-identify-species.ps1` and `ANTHROPIC_API_KEY` secret |

### Beta production quick start (items 1–3)

```powershell
.\scripts\beta-production-setup.ps1    # prints SQL file order
.\scripts\deploy-identify-species.ps1    # item 3: deploy Edge Function
```

**Item 1 — SQL:** Run core steps 1–16 if needed, then discover steps 17–23.  
If you already imported `explore_species` via CSV, **skip** `discover/create_explore_species.sql` (it drops the table).

**Item 2 — Seed:** Run `discover/seed/florida_data.sql`, then `discover/seed_florida_discover_all.sql` (see [discover/README.md](./discover/README.md)).

**Item 3 — Edge:** `supabase secrets set ANTHROPIC_API_KEY=...` then deploy script above. Remove `EXPO_PUBLIC_ANTHROPIC_API_KEY` from release `.env`.

---

## Patch an existing database (no full rebuild)

If tables already exist and you only need to refresh policies or RPCs:

| Goal | File(s) |
|------|---------|
| Storage + avatars + Discover read access | `friends_release_bootstrap.sql` (subset of steps 12 + 15) |
| Explorer Board RPC only | `get_detection_count_leaderboard.sql` |
| Public profile / stats RPC only | `get_public_user_profile.sql` |
| Discover grants only | `discover/explore_app_grants.sql` |
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
