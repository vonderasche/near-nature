# SQL Setup

All files are safe to re-run. Run in this order in the Supabase SQL Editor:

1. `create_user.sql`         — users table, RLS, auto-create profile trigger
2. `resolve_login_email.sql` — RPC so users can sign in with **email or username** (run after `create_user.sql`)
3. `check_user_exists.sql`   — email and username availability checks
4. `update_user.sql`         — update profile function
5. `delete_user.sql`         — delete account function
6. `create_detections.sql`   — detections table, enums, RLS, duplicate prevention
7. `update_detections.sql`   — update detection function
8. `delete_detections.sql`   — delete detection functions
9. `create_streaks.sql`      — streaks table, auto-update streak trigger
10. `create_discoveries.sql`  — discoveries table, first discovery trigger + bonus points
11. `create_leaderboard.sql` — points trigger, leaderboard function (all_time/month/ytd)
12. `storage_bucket_detections.sql` — storage bucket + policies
13. `get_detection_count_leaderboard.sql` — detection-count leaderboard RPC (includes `motto` from `public.users`)
14. `get_public_user_profile.sql` — safe public profile RPC for other users’ profiles


## Points System

| Action                        | Points |
|-------------------------------|--------|
| Native species identified     | +10    |
| Invasive species logged       | +2     |
| First discovery of a species  | +5 bonus |

## Notes

- GPS coordinates are never stored — only state name is saved
- Sensitive (endangered/threatened) species are hidden from leaderboard and public views
- One detection per species per user per day (prevents point farming)
- Detections below 70% confidence are saved but marked unverified
