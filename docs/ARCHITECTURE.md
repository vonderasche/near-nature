# Near Nature — architecture overview

Nature-identification app built with **Expo Router**, **Supabase** (Auth, Postgres, Storage, Edge Functions), and on-device caches so profile and gallery feel instant after the first load.

For SQL setup order, see [`sql/README.md`](../sql/README.md).

**Diagrams in this doc**

| Section | Covers |
|---------|--------|
| [Startup and routing](#startup-and-routing) | AuthGate, guest vs signed-in paths |
| [App flow](#app-flow-tabs-and-data) | Tabs, caches, stale-while-revalidate sequence |
| [Image pipeline](#image-pipeline-capture--identify--enrich--save) | Capture → classify → enrich → save (TFLite, Gemini, enrichment waterfall) |
| [System overview](#system-overview) | App ↔ Supabase ↔ device ↔ external APIs |

---

## High-level shape

| Layer | Role |
|--------|------|
| **UI** | Three tabs: Camera, Explorer Board, Profile (+ auth, public member profiles). No Discover explore tab. |
| **Auth** | Supabase Auth session in AsyncStorage; `AuthGate` routes signed-in users to tabs only if `public.users` exists |
| **Postgres** | Users, detections, discoveries, point awards, streaks — mostly via RPCs and RLS |
| **Storage** | Private `detections` bucket; images shown via **signed URLs** |
| **Edge** | `identify-species` — Gemini vision fallback (web / unsigned dev; not direct DB) |
| **External** | iNaturalist (native status), Wikipedia (descriptions) — only when needed |
| **Device cache** | Profile, gallery metadata, scoring snapshot, signed URLs, saved-species map, layout prefs |

---

## Startup and routing

```mermaid
flowchart TD
  Launch([App launch]) --> Restore[Supabase restores session<br/>AsyncStorage JWT]
  Restore --> Gate{AuthGate}

  Gate -->|loading| Spinner[Full-screen spinner]
  Gate -->|no session| AuthScreens["(auth): login · signup · forgot password"]
  Gate -->|session + no public.users| NeedsProfile[needs-profile]
  Gate -->|session + profile| Tabs["(tabs): Camera · Explorer Board · Profile"]
  Gate -->|password recovery| ResetPw[reset-password]

  AuthScreens -->|sign-in success| ProfileCheck[Check public.users row]
  ProfileCheck -->|row exists| Tabs
  ProfileCheck -->|missing row| NeedsProfile

  subgraph guest["Guest browsing (no session)"]
    GuestBoard[Explorer Board tab ✓]
    GuestMember[Public member profiles ✓]
    GuestCam[Camera tab → login]
    GuestProf[Profile tab → login]
  end

  Tabs --> GuestBoard
```

`AuthGate` enforces this on every navigation. Password recovery can use `reset-password` without a full profile row.

**Post-login:** `usePostSignInNavigation` calls `router.replace` as a backup to `AuthGate`. Fresh sign-in sets `freshSignIn` → welcome modal once. `warmAuthUserCaches` runs after profile gate resolves.

**DB on startup:** `users` existence check, optional `ensure_public_user_profile` RPC. No gallery/scoring until those screens open.

---

## App flow (tabs and data)

```mermaid
flowchart LR
  subgraph tabs["Signed-in tabs"]
    Cam[Camera<br/>identify → save]
    Board[Explorer Board<br/>leaderboard]
    Prof[Profile<br/>badges + gallery]
  end

  Cam -->|save| Supa[(Supabase)]
  Board -->|RPC + cache| Supa
  Prof -->|RPC + cache| Supa

  subgraph device["Device cache (SQLite / AsyncStorage)"]
    ProfileC[own profile]
    GalleryC[gallery rows]
    ScoreC[scoring snapshot]
    BoardC[board page 1]
    WikiC[wiki_cache]
    CatalogC[species_records]
    SavedC[saved-species map]
  end

  Prof --> ProfileC
  Prof --> GalleryC
  Prof --> ScoreC
  Board --> BoardC
  Cam --> SavedC
  Cam --> WikiC
  Cam --> CatalogC

  Supa -->|signed URLs| Display[expo-image display]
  device -->|stale-while-revalidate| Supa
```

**Stale-while-revalidate:** cached data paints immediately; a subtle header spinner shows during background refresh. Pull-to-refresh forces network.

```mermaid
sequenceDiagram
  participant User
  participant Screen as Profile / Board
  participant Cache as SQLite cache
  participant API as Supabase RPC

  User->>Screen: Open screen
  Screen->>Cache: loadCached*
  Cache-->>Screen: cached rows (instant UI)
  Screen->>API: background fetch
  API-->>Screen: fresh data
  Screen->>Cache: saveCached*
  Screen-->>User: UI updates silently
```

---

## Image pipeline (capture → identify → enrich → save)

End-to-end path for a camera or gallery photo. **Full-resolution URI** is kept for save; classification uses a separate prepared image.

```mermaid
flowchart TB
  subgraph input["1 · Input"]
    Capture[Camera capture or gallery pick]
    FullUri["local file:// URI<br/>(full resolution kept)"]
    Capture --> FullUri
  end

  subgraph classify["2 · Classify"]
    Platform{Platform?}
    FullUri --> Platform

    Platform -->|iOS / Android| TflitePath[TFLite pipeline]
    Platform -->|web| GeminiPath[Gemini pipeline]

    TflitePath --> ClassOut["ClassificationResult[]<br/>latin · common · confidence"]
    GeminiPath --> ClassOut
  end

  subgraph enrich["3 · Enrich (enrichSpeciesFromApis)"]
    ClassOut --> PerCandidate[For each candidate]
    PerCandidate --> WikiTier{Description source}
    WikiTier -->|saved detection| SavedHit[SQLite saved-species map]
    WikiTier -->|catalog hit| CatalogHit[species_records]
    WikiTier -->|prior fetch| WikiHit[wiki_cache]
    WikiTier -->|miss| LiveWiki[Wikipedia API → write wiki_cache]

    PerCandidate --> StatusTier{Native status}
    StatusTier -->|primary only| INat[iNaturalist lookup]
    StatusTier -->|alternates| UnknownOrSaved[unknown or saved status]
  end

  subgraph ui["4 · Results UI"]
    SavedHit --> Results[Species list + wiki snippets<br/>+ TFLite routing banner]
    CatalogHit --> Results
    WikiHit --> Results
    LiveWiki --> Results
    INat --> Results
    UnknownOrSaved --> Results
  end

  subgraph save["5 · Save (background)"]
    Results --> SaveTap[User taps Save]
    SaveTap --> Retake[Return to live camera]
    SaveTap --> BG[saveInBackground]
    BG --> Upload[Storage: detections/userId/uuid.jpg]
    Upload --> Insert[INSERT detections]
    Insert --> Triggers[DB triggers: points · streaks · badges]
    Triggers --> Invalidate[Invalidate gallery + scoring cache<br/>update saved-species map]
  end
```

### TFLite path (native)

Bundled assets under `assets/tflite/near_nature_app_bundle/`.

```mermaid
flowchart LR
  Photo[photoUri] --> Pre["preprocessImageForMobileNet<br/>224×224 RGB · ImageNet norm"]
  Pre --> Float["Float32Array input"]

  Float --> Preview["Preview model<br/>20 taxon groups"]
  Preview --> Route["routing.json → specialist id"]
  Route -->|no bundled model| Empty[Empty result + notice]
  Route -->|specialist found| Spec["Specialist TFLite"]

  Spec --> Birds{birds?}
  Birds -->|yes| Rollup["species scores → genus top-3"]
  Birds -->|no| Genus["genus top-3"]

  Rollup --> Out["ClassificationResult[]<br/>latinName = genus"]
  Genus --> Out
```

| Stage | Model | Output |
|-------|--------|--------|
| Preview | `preview/preview_classifier.tflite` | Top taxon group (e.g. Bird, Butterfly) |
| Route | `routing.json` | Specialist folder or “no model” notice |
| Specialist | `inat2021_specialists/*/` | Top genus candidates (+ bird species rollup) |

### Gemini path (web fallback)

```mermaid
flowchart LR
  Photo[photoUri] --> Resize["resizeImageForUpload<br/>max edge 1280 · JPEG"]
  Resize --> B64[base64]
  B64 --> Edge{Signed in?}
  Edge -->|yes| Fn["Edge: identify-species<br/>GEMINI_API_KEY on server"]
  Edge -->|dev only| Dev["Direct API<br/>EXPO_PUBLIC_GEMINI_API_KEY"]
  Fn --> Parse[parseIdentificationResponse]
  Dev --> Parse
  Parse --> Filter[filterClassifications]
  Filter --> Out["ClassificationResult[]"]
```

### Enrichment waterfall (per candidate)

Wiki description resolves in strict order; first hit wins. iNaturalist runs for **candidate 0 only** (unless saved data exists).

```mermaid
flowchart TD
  Start([Candidate i]) --> Saved{Saved detection<br/>for latin name?}
  Saved -->|yes| UseSaved[Reuse status + description<br/>skip iNat/wiki network]
  Saved -->|no| WikiQ{i less than wikiLimit?}

  WikiQ -->|no| StatusOnly[Status only]
  WikiQ -->|yes| Cat{species_records?}
  Cat -->|hit| CatDesc[catalog description]
  Cat -->|miss| WC{wiki_cache?}
  WC -->|hit| CacheDesc[cached Wikipedia]
  WC -->|miss| WikiLive[Fetch Wikipedia<br/>persist to wiki_cache]

  Start --> Primary{i equals 0?}
  Primary -->|yes| INat[iNaturalist native status]
  Primary -->|no| AltStatus[status unknown unless saved]

  CatDesc --> Done([Species row])
  CacheDesc --> Done
  WikiLive --> Done
  UseSaved --> Done
  StatusOnly --> Done
  INat --> Done
  AltStatus --> Done
```

### Save pipeline (image bytes)

```mermaid
flowchart TD
  Save([Save tap]) --> Pending[Optimistic pending gallery tile]
  Pending --> Camera[UI returns to camera]

  Camera --> Read["readLocalFileAsBase64(full photoUri)"]
  Read --> INat2[iNaturalist at save time]
  INat2 --> Upload["uploadDetectionsObject<br/>detections/userId/uuid.jpg"]
  Upload --> Row["INSERT detections<br/>image_url · names · category · native_status"]
  Row --> Meta[upsertSpeciesMetadata + alternate names]
  Meta --> Local["SQLite user_detections + gallery cache prepend"]
  Row --> Trig[Postgres triggers]

  Trig --> Points[point_awards]
  Trig --> Streak[streaks]
  Trig --> Disc[discoveries first-species]
  Trig --> Mile[check_category_milestones]

  Local --> Done([Gallery + scoring refresh on revisit])
  Mile --> Done

  Upload -->|failure| Err[Modal: Dismiss or Open profile]
```

**DB during identify:** read-only from saved-species map, `species_records`, `wiki_cache`. **No write** until save.

### Camera tab — key modules

| Step | Primary modules |
|------|-----------------|
| Capture | `hooks/useCameraScreen.ts`, `hooks/usePickPhotoFromGallery.ts` |
| Classify (native) | `lib/camera/mobilenet/identifyPhotoWithTflite.ts`, `preprocessImageForMobileNet.ts` |
| Classify (web) | `hooks/useSpeciesIdentification.ts`, `api/gemini.ts`, Edge `identify-species` |
| Enrich | `lib/identification/enrichSpeciesFromApis.ts` |
| UI | `components/camera/camera-identification-panel.tsx` |
| Save | `hooks/useSaveDetection.ts`, `services/detectionService.ts` |

---

## Tab 2 — Explorer Board

- Loads paginated Explorer Board via RPC **`get_detection_count_leaderboard`**.
- **Device cache:** first page cached in SQLite (`explorer_board_cache`) or AsyncStorage on web — stale-while-revalidate on open; pull-to-refresh always hits the network.
- Search is **client-side** on loaded rows (280ms debounced).
- Member avatars/tiles use **signed URL** batch resolution (same pipeline as gallery).
- **FlashList** virtualizes list/grid inside parent scroll.
- Refresh on pull; `requestExplorerBoardRefresh()` after saves updates the board when revisited.
- Column count and list/grid layout preferences are cached locally (AsyncStorage).

---

## Tab 3 — Profile

Single scroll: collapsible identity → **Scoring & badges** (collapsed by default) → identification gallery.

### Scoring & badges (expand to load)

| Step | What happens |
|------|----------------|
| Collapsed | Section header only; snapshot hook not mounted |
| Expand | Read **scoring snapshot cache** → badge group grid (bonus / main / sub tiers) |
| Background | RPC **`get_user_scoring_snapshot`** (fallback: `get_user_score_by_category` + `point_awards`) |
| UI | One icon per discipline opens a popover of tier badges; dimmed = unearned |

Requires `sql/get_user_scoring_snapshot.sql` (or fallback RPCs) in Supabase.

### Gallery

| Step | What happens |
|------|----------------|
| Always visible | Below scoring section |
| Open / mount | **Gallery list cache** → instant grid |
| Toolbar | Category filter icon + grid-size menu + search (no section title) |
| Background | `detections` paginated SELECT → signed URLs → cache update |
| Delete | `DELETE detections` + invalidate gallery + scoring caches |

### Profile header

- Collapsible **username / motto / name / email / state** (editable motto & home state).
- **`useUser`:** cached `users` + **`get_public_user_profile`** RPC (stats).
- Pull-to-refresh: profile + gallery + scoring refetch.
- Avatar upload → Storage + `users` update.

---

## Public user profile (`/user/[userId]`)

- **`get_public_user_profile`** RPC + avatar / stats strip.
- **Badges** collapsible: **`get_public_user_awards`** — earned badges only (hidden if none).
- Gallery with `publicOnly` (non-sensitive detections).

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
| **Explorer Board list** | `near_nature:explorer_board_list` | First page of leaderboard rows | Never (global); overwritten on fetch |
| **Explorer Board columns** | AsyncStorage preference | 2/3/4 column grid | Never (UI pref) |
| **Gallery grid columns** | AsyncStorage preference | Column count | Never |
| **expo-image** | OS disk | Rendered bitmaps | OS-managed |
| **SQLite (`near_nature.db`)** | `expo-sqlite` on device | Global: `species_records`, `wiki_cache`, `explorer_board_cache`. User-scoped: profile, gallery list cache, scoring snapshot, saved-species map, signed URLs, **`user_detections`** | Sign out clears user-scoped SQLite rows; global catalog + board cache kept |

Stale-while-revalidate: show cache immediately, refresh in background when stale, then update cache. Device caches include `cachedAt`; entries younger than **15 minutes** skip background network unless pull-to-refresh or `force` refetch (save/delete still invalidates).

**SQLite notes:** Requires a native dev-client rebuild after installing `expo-sqlite` or adding migrations. Skipped on web (cache modules fall back to AsyncStorage). If SQLite init fails, a dismissible banner explains that caches fall back to network/AsyncStorage. Bundled genus catalog seeds on first launch or when the catalog version changes. On upgrade, legacy AsyncStorage cache keys are imported once into SQLite. **Sync model:** saves upload to Supabase then upsert locally; gallery/board/profile hooks show cached data immediately and refresh in the background.

**Implementation paths:**

- Local DB: `lib/db/initLocalDatabase.ts`, `context/LocalDatabaseContext.tsx`, `lib/db/speciesRepository.ts`, `lib/db/userCacheRepository.ts`, `lib/db/globalCacheRepository.ts`, `lib/db/detectionRepository.ts`
- Profile: `lib/profile/ownProfileCache.ts`, `hooks/useUser.ts`
- Gallery: `lib/detections/galleryListCache.ts`, `hooks/useUserDetectionGallery.ts`
- Explorer Board: `lib/explorerBoard/explorerBoardListCache.ts`, `hooks/useExplorerBoard.ts`
- Scoring: `lib/profile/scoringSnapshotCache.ts`, `hooks/useUserScoringSnapshot.ts`
- Signed URLs: `lib/detections/signedDetectionUrlCache.ts`, `signedDetectionUrlPersistentCache.ts`
- Saved species: `lib/identification/savedSpeciesSessionCache.ts`
- Sign-out local wipe: `lib/db/clearLocalUserDataOnSignOut.ts`

---

## When the database is called

| User action | Typical calls |
|-------------|----------------|
| Login / signup | Auth + `resolve_login_email` / availability RPCs |
| App open (signed in) | Session restore; profile row check |
| Open Profile | Cache hit → then `users` + `get_public_user_profile` |
| Open gallery (profile) | Cache → `detections` SELECT (paged) |
| Expand Scoring & badges | Cache → `get_user_scoring_snapshot` RPC |
| Identify photo (native) | On-device TFLite only (+ optional SQLite reads for enrichment) |
| Identify photo (web) | Edge `identify-species` or dev Gemini (+ optional SQLite reads for enrichment) |
| Save identification | Storage upload + `INSERT detections` (+ triggers) |
| Delete photo | `DELETE detections` + storage |
| Explorer Board | `get_detection_count_leaderboard` RPC (paged) |
| View other user | `get_public_user_profile` + `get_public_user_awards` + public gallery SELECT |
| Edit motto/state/avatar | `users` UPDATE (+ avatar storage) |

**Avoided on hot paths:** full `discoveries` scan for scoring UI, identification history until after save, redundant iNat for alternate species.

---

## Server-side logic (not called from app)

Postgres triggers on `detections` insert handle points, streaks, discoveries, and **`check_category_milestones`** (badges / tier awards using `subcategory` / `main_category`). The app reads results via `get_user_scoring_snapshot` and `point_awards`.

---

## System overview

High-level view of the app, backend, caches, and external APIs. For detail see **App flow** and **Image pipeline** above.

```mermaid
flowchart TB
  subgraph app["Expo app"]
    AuthGate[AuthGate]
    AuthGate --> AuthUI["(auth) login · signup"]
    AuthGate --> Tabs["(tabs) Camera · Board · Profile"]

    Tabs --> Cam[Camera<br/>TFLite / Gemini]
    Tabs --> Board[Explorer Board]
    Tabs --> Prof[Profile]

    Cam --> Enrich[Enrichment tiers]
  end

  subgraph device["Device (SQLite + AsyncStorage)"]
    D1[profile · gallery · scoring caches]
    D2[species_records · wiki_cache]
    D3[explorer_board_cache · signed URLs]
  end

  subgraph supabase["Supabase"]
    SA[Auth]
    ST[Storage detections/]
    PG[(Postgres + RLS + triggers)]
    EF[Edge identify-species]
    RPC[get_* RPCs]
  end

  subgraph external["External APIs"]
    INat[iNaturalist]
    Wiki[Wikipedia]
  end

  AuthGate --> SA
  Cam --> EF
  Cam --> D2
  Enrich --> D2
  Enrich --> INat
  Enrich --> Wiki
  Cam -->|save| ST
  Cam -->|save| PG
  Board --> RPC
  Prof --> RPC
  RPC --> PG
  ST -->|signed URLs| Prof
  ST -->|signed URLs| Board
  PG --> D1
  RPC --> D1
  RPC --> D3
```

---

## Production checklist

1. Run SQL patches in order (`add_naturalist_*`, `create_point_awards`, `check_category_milestones`, `get_user_score_by_category`, `get_user_scoring_snapshot`, `get_public_user_awards`).
2. Reload Supabase schema cache (Settings → API).
3. `npm run verify:supabase`
4. Deploy `identify-species` edge function; set `GEMINI_API_KEY` in Supabase secrets (required for web identification).
5. Physical Android dev: `npm run start:dev` then `npm run android:install` (see `.env.example`).
6. Rebuild native app after native dependency changes (e.g. FlashList).

**Removed:** Discover explore tab and `sql/discover/*` catalog — not deployed. `public.discoveries` remains for first-species bonus + tier counts.
