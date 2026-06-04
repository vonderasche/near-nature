# Live preview in release APKs (Windows)

Friends APK builds enable **live camera AI** (VisionCamera frame processors + resize plugin) by default.

## Why a second folder?

Native CMake/ninja fails when the project path contains **spaces** (e.g. `near nature`). The build script mirrors the repo to a short path without spaces:

- Default: `C:\dev\near_nature`
- Override: set `NEAR_NATURE_PREVIEW_BUILD_ROOT`

## One-time setup (required on this machine)

```powershell
npm run setup:preview-build-root
```

This syncs the repo and runs `npm install` at the build root once.

## Build friends APK (preview ON)

```powershell
npm run android:friends-apk
```

Output: `dist/near_nature-friends.apk`

## Without live preview (emergency)

```powershell
.\scripts\build-friends-apk.ps1 -SkipLivePreview
```

## Alternative

Clone or move the repo to a path without spaces and work from there — no mirror needed.

```powershell
git clone <repo-url> C:\dev\near_nature
cd C:\dev\near_nature
npm install
npm run android:friends-apk
```
