# SQL Setup

All files are safe to re-run. Run in this order in the Supabase SQL Editor:

1. `create_user.sql`         — users table, RLS, auto-create profile trigger
2. `check_user_exists.sql`   — email and username availability checks
3. `update_user.sql`         — update profile function
4. `delete_user.sql`         — delete account function
5. `create_detections.sql`   — detections table, enums, RLS, duplicate prevention
6. `update_detections.sql`   — update detection function
7. `delete_detections.sql`   — delete detection functions
8. `create_streaks.sql`      — streaks table, auto-update streak trigger
9. `create_discoveries.sql`  — discoveries table, first discovery trigger + bonus points
10. `create_leaderboard.sql` — points trigger, leaderboard function (all_time/month/ytd)

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
