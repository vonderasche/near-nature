# Near Nature — architecture overview

Nature-identification app built with **Expo Router**, **Supabase** (Auth, Postgres, Storage, Edge Functions), and on-device caches so profile and gallery feel instant after the first load.

For SQL setup order, see [`sql/README.md`](../sql/README.md).

---

## High-level shape

| Layer | Role |
|--------|------|
| **UI** | Three tabs: Camera, Explorer Board, Profile (+ auth screens, public user profiles) |
| **Auth** | Supabase Auth session in AsyncStorage; `AuthGate` routes signed-in users to tabs only if `public.users` exists |
| **Postgres** | Users, detections, discoveries, point awards, streaks — mostly via RPCs and RLS |
| **Storage** | Private `detections` bucket; images shown via **signed URLs** |
| **Edge** | `identify-species` — Claude vision (not direct DB) |
| **External** | iNaturalist (native status), Wikipedia (descriptions) — only when needed |
| **Device cache** | Profile, gallery metadata, scoring snapshot, signed URLs, saved-species map, layout prefs |

---

## Startup and routing

```
App launch
    │
    ▼
Supabase client restores session (AsyncStorage: auth tokens)
    │
    ▼
AuthContext: check public.users row exists?
    │
    ├─ No session ──► (auth): login / signup / forgot password
    ├─ Session, no profile ──► needs-profile
    └─ Session + profile ──► (tabs): Camera | Explorer Board | Profile
```

`AuthGate` enforces this on every navigation. Password recovery can use `reset-password` without a full profile row.

**DB on startup:** `users` existence check, optional `ensure_public_user_profile` RPC. No gallery/scoring until those screens open.

---

## Tab 1 — Camera (identify → save)

### Identify flow (network-heavy)

1. User captures or picks a photo (full resolution kept for save).
2. Image resized for vision (**max edge 1280**) → base64.
3. **Supabase Edge** `identify-species` (or dev-only direct Anthropic API) → list of classifications (latin/common names, confidence).
4. **Enrichment** (`enrichSpeciesFromApis`):
   - **Saved species session** (in-memory map, warmed on profile load): if the user already saved this latin name, reuse status + description — **no iNat/wiki**.
   - Otherwise: **iNaturalist only for the primary (first) candidate**; alternates get `unknown` unless saved data exists.
   - **Wikipedia** for up to 3 candidates (parallel with status for primary).
5. UI shows species list, wiki snippets, save button.

**DB during identify:** optional `detections` read only if session cache misses a latin name. **No write** until save.

### Save flow

1. User taps save → UI returns to camera; upload runs in background.
2. **iNat** again at save time (for DB `native_status` / `inaturalist_id`).
3. **Storage:** image → `detections/{userId}/{uuid}.jpg`.
4. **Postgres:** `INSERT detections` (category, subcategory, main_category, points, etc.).
5. **DB triggers** (server-side, no extra app calls): points, streaks, first-species `discoveries` row, milestone checks (`check_category_milestones`).
6. **Cache invalidation:** gallery list cache, scoring snapshot cache; **session map** updated for that species.
7. Identification **history** refetches (camera panel only after save, not on every identify).

---

## Tab 2 — Explorer Board

- Loads paginated Explorer Board via RPC **`get_detection_count_leaderboard`**.
- Search is **client-side** on loaded rows (280ms debounced).
- Member avatars/tiles use **signed URL** batch resolution (same pipeline as gallery).
- **FlashList** virtualizes list/grid inside parent scroll.
- Refresh on pull; `requestExplorerBoardRefresh()` after saves updates the board when revisited.

**No device cache** for Explorer Board rows (always fresh from RPC). Column count preference is cached locally.

---

## Tab 3 — Profile

Two sub-tabs: **Gallery** | **Scoring & badges**.

### Gallery

| Step | What happens |
|------|----------------|
| Open / mount | Read **gallery list cache** (AsyncStorage: row metadata, no signed URLs) → instant grid |
| Background | `detections` paginated SELECT → merge → hydrate signed URLs → update cache |
| Search | Debounced 280ms, filters **in memory** |
| Images | Sign path: **memory → AsyncStorage → Supabase sign**; `expo-image` disk cache |
| Delete | `DELETE detections` + storage cleanup → invalidate gallery + scoring caches |

### Scoring & badges (mounted only when tab selected)

| Step | What happens |
|------|----------------|
| Open tab | Read **scoring snapshot cache** (AsyncStorage) → show tree + summary |
| Background | Single RPC **`get_user_scoring_snapshot`** → score rows, awards, sub/main species counts |
| UI | Builds discipline tree + “points by discipline” summary client-side |

Requires `sql/get_user_scoring_snapshot.sql` applied in Supabase.

### Profile header

- **`useUser`:** cached `users` + **`get_public_user_profile`** RPC (stats: points, species counts, streak).
- Pull-to-refresh: profile + gallery refetch + scoring refetch.
- Avatar upload → Storage + `users` update.

---

## Public user profile (`/user/[userId]`)

- **`get_public_user_profile`** RPC.
- Gallery with `publicOnly` (non-sensitive detections), same gallery cache key variant.
- No scoring tab (owner-only RPCs).

---

## Device cache reference

| Cache | Key / location | Contents | Cleared on |
|-------|----------------|----------|------------|
| **Auth session** | Supabase → AsyncStorage | JWT / refresh | Sign out |
| **Own profile** | `near_nature:own_profile:{userId}` | User row + public stats | Sign out, account delete |
| **Gallery list** | `near_nature:gallery_list:{userId}:{publicOnly}` | Detection rows (no signed URLs) | Sign out, save, delete, force refetch |
| **Scoring snapshot** | `near_nature:scoring_snapshot:{userId}` | Mains, awards, score breakdown | Sign out, save, delete |
| **Signed URLs** | Memory + `near_nature:signed_url:{path}` | Supabase signed image URLs | Sign out (+ memory on expiry) |
| **Saved species session** | In-memory `Map` | Latest detection per latin name | Sign out; warmed on profile load |
| **Explorer Board columns** | AsyncStorage preference | 2/3/4 column grid | Never (UI pref) |
| **Gallery grid columns** | AsyncStorage preference | Column count | Never |
| **expo-image** | OS disk | Rendered bitmaps | OS-managed |

Stale-while-revalidate: show cache immediately, refresh in background, then update cache.

**Implementation paths:**

- Profile: `lib/profile/ownProfileCache.ts`, `hooks/useUser.ts`
- Gallery: `lib/detections/galleryListCache.ts`, `hooks/useUserDetectionGallery.ts`
- Scoring: `lib/profile/scoringSnapshotCache.ts`, `hooks/useUserScoringSnapshot.ts`
- Signed URLs: `lib/detections/signedDetectionUrlCache.ts`, `signedDetectionUrlPersistentCache.ts`
- Saved species: `lib/identification/savedSpeciesSessionCache.ts`

---

## When the database is called

| User action | Typical calls |
|-------------|----------------|
| Login / signup | Auth + `resolve_login_email` / availability RPCs |
| App open (signed in) | Session restore; profile row check |
| Open Profile | Cache hit → then `users` + `get_public_user_profile` |
| Open Gallery tab | Cache → `detections` SELECT (paged) |
| Open Scoring tab | Cache → `get_user_scoring_snapshot` RPC |
| Identify photo | Edge function only (+ optional `detections` read for saved species) |
| Save identification | Storage upload + `INSERT detections` (+ triggers) |
| Delete photo | `DELETE detections` + storage |
| Explorer Board | `get_detection_count_leaderboard` RPC (paged) |
| View other user | `get_public_user_profile` + public gallery SELECT |
| Edit motto/state/avatar | `users` UPDATE (+ avatar storage) |

**Avoided on hot paths:** full `discoveries` scan for scoring UI, identification history until after save, redundant iNat for alternate species.

---

## Server-side logic (not called from app)

Postgres triggers on `detections` insert handle points, streaks, discoveries, and **`check_category_milestones`** (badges / tier awards using `subcategory` / `main_category`). The app reads results via `get_user_scoring_snapshot` and `point_awards`.

---

## System diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           NEAR NATURE (Expo App)                            │
├─────────────────────────────────────────────────────────────────────────────┤
│  AuthGate ──► (auth) login/signup    OR    (tabs) Camera | Board | Profile  │
└─────────────────────────────────────────────────────────────────────────────┘
         │                              │              │              │
         ▼                              ▼              ▼              ▼
   ┌──────────┐              ┌──────────────┐  ┌────────────┐  ┌─────────────┐
   │ Supabase │              │    CAMERA    │  │  EXPLORER  │  │   PROFILE   │
   │   Auth   │              │              │  │   BOARD    │  │             │
   └────┬─────┘              └──────┬───────┘  └─────┬──────┘  └──────┬──────┘
        │                           │                │                 │
        │                    ┌──────▼───────┐        │          ┌──────┴──────┐
        │                    │ Resize 1280  │        │          │ Gallery │Score│
        │                    │ Edge: Claude │        │          └──────┬──────┘
        │                    └──────┬───────┘        │                 │
        │                           │                │                 │
        │              ┌────────────┼────────────┐   │                 │
        │              ▼            ▼            ▼   │                 │
        │         [Session]    [iNat #0]    [Wiki≤3] │                 │
        │         species map  primary only          │                 │
        │              │            │            │   │                 │
        │              └────────────┼────────────┘   │                 │
        │                           │ SAVE            │                 │
        ▼                           ▼                 ▼                 ▼
┌───────────────────────────────────────────────────────────────────────────────┐
│                              SUPABASE BACKEND                                 │
│  ┌─────────────┐   ┌──────────────────┐   ┌─────────────────────────────┐     │
│  │   Storage   │   │  Edge: identify- │   │  Postgres (RLS)             │     │
│  │ detections/ │   │  species (vision)│   │  users · detections         │     │
│  │   bucket    │   └──────────────────┘   │  discoveries · point_awards │     │
│  └──────▲──────┘                          │  streaks · triggers         │     │
│         │ upload                          └───────────┬─────────────────┘     │
│         │                                             │ RPCs                  │
│         │                              get_detection_count_leaderboard        │
│         │                              get_public_user_profile              │
│         │                              get_user_scoring_snapshot            │
│         └──────── signed URLs ◄────────────────────────────────────────────   │
└───────────────────────────────────────────────────────────────────────────────┘
         ▲                           ▲                           ▲
         │                           │                           │
┌────────┴───────────────────────────┴───────────────────────────┴──────────────┐
│                         DEVICE CACHE (AsyncStorage + RAM)                     │
│  auth tokens │ own profile │ gallery rows │ scoring JSON │ signed URLs      │
│              │             │              │              │ saved-species Map │
│              │             │              │              │ layout prefs       │
└───────────────────────────────────────────────────────────────────────────────┘
         ▲
         │  iNaturalist / Wikipedia (only when not in saved-species map)
         └──────────────────────────────────────────────────────────────────────
```

---

## Identification + cache decision flow

```
                    [Photo captured]
                           │
                           ▼
                  ┌────────────────┐
                  │ Claude (edge)  │
                  └────────┬───────┘
                           │ classifications[]
                           ▼
              ┌────────────────────────────┐
              │ For each candidate (i):   │
              └────────────┬───────────────┘
                           │
         ┌─────────────────┼─────────────────┐
         ▼                 ▼                 ▼
   saved session?     i == 0 ?          i < wikiLimit?
         │                 │                 │
    yes ─┴─ skip APIs   yes ─┴─ iNat      yes ─┴─ Wikipedia
    no  ─── fetch DB    no  ─── status=unknown   no  ─── skip wiki
         for missings       (unless saved)
```

---

## Production checklist

1. Run SQL patches in order (`add_naturalist_*`, `get_user_score_by_category`, `get_user_scoring_snapshot`).
2. Reload Supabase schema cache (Settings → API).
3. Deploy `identify-species` edge function.
4. Rebuild native app after native dependency changes (e.g. FlashList).
