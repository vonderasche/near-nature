# Discover / Explore SQL setup

All Discover-related scripts live in **`sql/discover/`** (schema, seeds, and `clear_discover_data.sql`).

Run in the **Supabase SQL Editor** in this order.

## Schema (once)

1. `create_explore_species.sql`
2. `create_seasonality.sql`
3. `create_parks.sql`
4. `create_park_species.sql`
5. `create_species_park_link.sql` — RPCs: `get_park_species`, `get_nearby_parks`, etc.
6. `create_featured_rotation.sql`
7. `explore_app_grants.sql`
8. `explore_species_public_read.sql` (if using RLS read policies)
9. `get_park_summary_for_state.sql` — hub park counts without loading full rows

## Seed data (Florida beta)

1. **`seed/florida_data.sql`** — installs `florida_seed_*` functions (canonical rows). **Run this first.**
2. One of:
   - **`seed_florida_discover_all.sql`** — recommended one-shot (species + parks + park_species + featured + verification)
   - **`seed_florida_explore_species.sql`** — species + seasonality + featured only
   - **`seed_florida_park_species.sql`** — parks + park_species (recovery script)
   - **`seed_florida_sample.sql`** — deprecated alias of discover_all steps

## DDL vs RPC split

| File | Purpose |
|------|---------|
| `create_park_species.sql` | `park_species` table DDL |
| `create_species_park_link.sql` | Join RPCs only (no table DDL) |

## Clear all Discover content

Run `clear_discover_data.sql` to empty species, parks, and featured data (keeps tables and seed functions).

## App notes

- Featured rotation: `select rotate_featured_species();` or call via seed wrappers.
- Hub summary uses `get_park_summary_for_state(state)` when deployed; otherwise the app falls back to listing parks.
