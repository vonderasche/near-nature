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
| `create_leaderboard.sql` | `calculate_points` trigger on insert (legacy filename; powers Explorer board points) |
| `create_streaks.sql` | `public.streaks`, streak trigger on insert |
| `create_discoveries.sql` | `public.discoveries`, first-species bonus trigger |
| `storage_bucket_detections.sql` | Storage bucket + policies |
| `get_detection_count_leaderboard.sql` | RPC: Explorer board rankings (paginated; legacy SQL name) |
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
| `drop_legacy_rpc.sql` | One-off: drops unused RPCs and old indexes |

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
| 9 | `get_detection_count_leaderboard.sql` | Explorer board RPC |
| 10 | `get_public_user_profile.sql` | Public profile RPC |
| 11 | `drop_streak_client_update_policy.sql` | Policy cleanup (harmless on fresh DB) |

### After rebuild

| Need | Action |
|------|--------|
| Auth users without `public.users` | Run `ensure_public_user_profile.sql`, then `backfill_public_users_from_auth.sql` if many users are affected |
| Species identification in app | `.\scripts\deploy-identify-species.ps1` and `ANTHROPIC_API_KEY` in Edge secrets |
| Delete account in app | Deploy `delete-account` Edge Function (not SQL) |
| Confirm RPCs | `npm run verify:supabase` |

Do **not** put `EXPO_PUBLIC_ANTHROPIC_API_KEY` in production app `.env` — use the Edge Function only.

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
| Explorer board | `get_detection_count_leaderboard.sql` |
| Member profiles | `get_public_user_profile.sql` |
| Username login | `resolve_login_email.sql` |
| Missing profile after sign-in | `ensure_public_user_profile.sql` |
| Points on save | `create_leaderboard.sql` |

Then reload the schema cache and run `npm run verify:supabase`.

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

**Badges:** Ends of the Earth (Voyager in all 8 main categories) +1,000 · True Voyager per discipline (main + all subs Voyager) +2,000.

SQL: `create_point_awards.sql`, `check_category_milestones.sql` (runs after each new discovery).

---

## What the app uses

| Feature | Database |
|---------|----------|
| Sign up / edit profile | `public.users` (PostgREST + RLS); availability RPCs at sign-up |
| Sign in with email or username | RPC `resolve_login_email` |
| Save / delete photo | `public.detections` + Storage |
| Explorer board | RPC `get_detection_count_leaderboard` |
| View another member | RPC `get_public_user_profile` |
| Delete account | Edge Function `delete-account` |

**Behavior notes:** Same species can be saved multiple times per day. GPS is never stored (US state code only). Sensitive species are hidden from public gallery and Explorer board aggregates.
