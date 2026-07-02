# Near Nature

A mobile nature-identification app built with **Expo**, **Supabase**, and on-device **TensorFlow Lite**. Point your camera at plants and wildlife, get genus-level suggestions enriched with Wikipedia and iNaturalist data, save discoveries to your gallery, and climb naturalist badges and community rankings.

---

## Features

### Camera & identification

- **Live preview inference** — optional on-device classifier on the viewfinder (scene gate, kingdom, or routing preview models); frame-sampled, not saved.
- **Capture or gallery pick** → on-device **TFLite** cascade on iOS/Android (MobileViT routing → regional specialist models → top genus candidates).
- **Web fallback** via Supabase Edge `identify-species` (Gemini vision) when TFLite is unavailable.
- **Enrichment waterfall** per candidate: saved detection → local species catalog → Wikipedia cache → live Wikipedia; iNaturalist native status for the primary match.
- **Background save** — UI returns to the camera immediately while upload and DB insert finish.

### Profile, gallery & scoring

- **Personal gallery** with grid/list layouts, search, and category filters.
- **Naturalist badges** — Explorer / Adventurer / Voyager tiers per discipline and subcategory (botanist, ornithologist, herpetologist, mammalogist, etc.).
- **Points & streaks** from saved identifications; first-species discovery bonus.
- **Collapsible scoring section** with discipline popovers and earned-badge tiles.
- **Public member profiles** — view another explorer’s gallery, stats, and badges.

### Explorer Board (Rankings tab)

- **Leaderboard** by native-species discovery count (paginated RPC).
- **Community search** — photo grid across public identifications when the search field is active.
- **Stale-while-revalidate** caching for instant open, background refresh.

### Regional modularity

- **Four US Census regions** — South (live), Northeast, Midwest, West (coming soon).
- **Region picker** on Profile with an interactive US map; home state drives default region.
- **On-demand model bundles** — specialist TFLite weights download per region from Supabase Storage (slim APK ships preview models only).

### Appearance & settings

- **Themes** — Dark, Light, and Light forest (Settings → Appearance).
- **Account** — email/username login, Google OAuth, profile motto, home state, avatar upload.
- **Identification feedback** (opt-in, dev builds) — optional ML telemetry and misclassification review when `EXPO_PUBLIC_CLASSIFICATION_DEBUG=1`.

### Offline-friendly caches

- **SQLite** on device for profile, gallery metadata, scoring snapshot, species catalog, Wikipedia cache, and Explorer Board pages.
- **Signed URLs** for private detection images in Supabase Storage.

---

## How to use the app

### Guest vs signed in

```mermaid
flowchart TD
  Launch([Open app]) --> Board[Rankings tab — browse leaderboard]
  Launch --> GuestCam{Camera tab?}
  GuestCam -->|tap| LoginPrompt[Sign in prompt]
  Launch --> GuestProf{Profile tab?}
  GuestProf -->|tap| LoginPrompt
  LoginPrompt --> Auth["Login · Sign up · Google"]
  Auth --> Tabs[Signed-in experience]

  subgraph signedIn [Signed in]
    Tabs --> Camera[Camera — identify & save]
    Tabs --> Rankings[Rankings — leaderboard & search]
    Tabs --> Profile[Profile — gallery & badges]
  end

  Board --> Member[View public member profiles]
  Member --> Gallery[Their public gallery]
```

### Identify and save (happy path)

```mermaid
sequenceDiagram
  participant You
  participant Camera as Camera tab
  participant ML as On-device TFLite
  participant Enrich as Wiki · iNat · catalog
  participant Cloud as Supabase

  You->>Camera: Point at subject & capture
  Camera->>ML: Classify photo
  ML-->>Camera: Top genus candidates
  Camera->>Enrich: Enrich descriptions & native status
  Enrich-->>Camera: Species results list
  You->>Camera: Tap Save
  Camera-->>You: Return to live camera
  Camera->>Cloud: Upload image + insert detection
  Cloud-->>Camera: Points · streaks · badges updated
  You->>Profile: Gallery shows new identification
```

### Main tabs

```mermaid
flowchart LR
  subgraph tabs [Bottom tabs]
    Cam[Camera<br/>Identify & save]
    Rank[Rankings<br/>Leaderboard & community search]
    Prof[Profile<br/>Gallery · badges · region]
  end

  Cam --> Results[Identification results]
  Results --> Save[(Your gallery)]

  Rank --> LB[Species count leaderboard]
  Rank --> Search[Public photo search]

  Prof --> Score[Scoring & badges]
  Prof --> Gal[Detection gallery]
  Prof --> Region[Region map & download]
  Prof --> Settings[Settings · themes]
```

### Badge progress (naturalist disciplines)

```mermaid
flowchart TD
  Save[Save a new species] --> Disc[First sighting logged in discoveries]
  Disc --> Count[Distinct species per subcategory]
  Count --> Tiers{Tier thresholds}
  Tiers -->|10 species| Explorer[Explorer badge]
  Tiers -->|25 species| Adventurer[Adventurer badge]
  Tiers -->|50 species| Voyager[Voyager badge]
  Explorer --> Main[Main discipline badges<br/>e.g. Botanist · Ornithologist]
```

### Image inference

Three inference paths — only **capture** and **cloud** results can be saved.

```mermaid
flowchart TB
  subgraph preview [Live preview — viewfinder only]
    VF[Camera frames] --> PM[Preview TFLite<br/>scene gate · kingdom · routing]
    PM --> Label[Top label overlay]
  end

  subgraph native [Capture / gallery — iOS & Android]
    Img[Photo file] --> MV[MobileViT routing]
    MV --> SP[Regional specialist TFLite]
    SP --> Genus[Top 3 genus matches]
  end

  subgraph web [Web / cloud fallback]
    Img2[Photo file] --> GM[Gemini via Edge API]
    GM --> Species[Species suggestions]
  end

  Genus --> Enrich[Wiki · iNat · catalog enrich]
  Species --> Enrich
  Enrich --> Save[Save to gallery]
  preview -.->|not saved| Skip[Display only]
```

| Path | Runs when | Models | Saved? |
|------|-----------|--------|--------|
| Live preview | Camera open, AI toggle on | `assets/tflite/preview_models/*` | No |
| Capture TFLite | Shutter or gallery pick | MobileViT + regional `inat2021_specialists_v2` | After Save |
| Cloud Gemini | Web, or no on-device model | `identify-species` edge function | After Save |

See [`docs/ARCHITECTURE.md`](./docs/ARCHITECTURE.md#image-inference) for cascade diagrams, regional model loading, and debug telemetry.

---

## Get started (development)

### Prerequisites

- Node.js 20+
- [Android Studio](https://developer.android.com/studio) (physical ARM device or emulator) for native builds
- A Supabase project — copy `.env.example` → `.env` and fill `EXPO_PUBLIC_SUPABASE_URL` and `EXPO_PUBLIC_SUPABASE_ANON_KEY`

### Install & run

```bash
npm install
npm run start:dev          # Metro + dev client (LAN)
npm run android:install    # Build & install on connected device
```

Other useful scripts:

| Script | Purpose |
|--------|---------|
| `npm run typecheck` | TypeScript |
| `npm run test` | Vitest unit tests |
| `npm run verify:supabase` | Smoke-test RPCs against your Supabase project |
| `npm run android:preview-apk` | Release APK with preview TFLite models only |
| `npm run seed:florida-parks` | Upsert Florida state parks into Supabase |
| `npm run setup:ml-telemetry` | Print ML telemetry SQL order + verify |

### Supabase setup

Run SQL scripts in the order documented in [`sql/README.md`](./sql/README.md), then reload the schema cache and run `npm run verify:supabase`.

Deploy the `identify-species` edge function and set `GEMINI_API_KEY` for web identification.

### Local TFLite models

Large model weights are **not committed**. See [`docs/LOCAL_MODEL_SETUP.md`](./docs/LOCAL_MODEL_SETUP.md) for folder layout and [`docs/PREVIEW_BUILD.md`](./docs/PREVIEW_BUILD.md) for slim APK builds.

---

## Project documentation

| Doc | Contents |
|-----|----------|
| [`docs/ARCHITECTURE.md`](./docs/ARCHITECTURE.md) | Deep technical diagrams — auth gate, **image inference**, caches, save pipeline |
| [`sql/README.md`](./sql/README.md) | Database setup order, RPCs, telemetry |
| [`docs/LOCAL_MODEL_SETUP.md`](./docs/LOCAL_MODEL_SETUP.md) | Bundled vs regional TFLite assets |
| [`docs/PREVIEW_BUILD.md`](./docs/PREVIEW_BUILD.md) | Windows APK build notes |
| [`docs/GOOGLE_SIGN_IN.md`](./docs/GOOGLE_SIGN_IN.md) | OAuth configuration |

---

## Tech stack

| Layer | Technology |
|-------|------------|
| App | Expo Router, React Native, TypeScript |
| Auth & backend | Supabase Auth, Postgres, Storage, Edge Functions |
| On-device ML | `react-native-fast-tflite`, Vision Camera frame processors |
| Caching | expo-sqlite, AsyncStorage |
| Lists | Shopify FlashList |
| Maps | `@svg-maps/usa` region picker |

---

## Repository layout

```
app/                  Expo Router screens (tabs, auth, profile, camera)
components/           UI by feature (camera, profile, auth, settings)
lib/                  Business logic (camera, identification, parks, profile)
services/             Supabase-facing services
sql/                  Postgres migrations & RPCs (run in Supabase SQL Editor)
assets/               Images, bundled CSVs, TFLite preview models
docs/                 Architecture & setup guides
scripts/              Seeds, APK builds, verification, telemetry reports
```

---

## License

Private portfolio project. Model assets and third-party data (iNaturalist, Wikipedia, Florida DEP parks) carry their own licenses — see bundled asset READMEs where applicable.
