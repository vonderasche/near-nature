# Builds a release APK for sideloading to friends (signed with debug keystore).
# Live camera preview is ON by default (frame processors + resize plugin).
#
# Usage:
#   npm run android:friends-apk
#   .\scripts\build-friends-apk.ps1 -SkipLivePreview   # emergency only
#
# Windows + path with spaces: run once:
#   npm run setup:preview-build-root

param(
    [switch]$SkipLivePreview
)

$ErrorActionPreference = "Stop"
$Root = (Resolve-Path (Split-Path -Parent $PSScriptRoot)).Path
. (Join-Path $PSScriptRoot "resolve-preview-build-root.ps1")

function Test-EnvVar([string]$Name, [string]$EnvFile) {
    $line = Get-Content $EnvFile -ErrorAction SilentlyContinue | Where-Object { $_ -match "^\s*$([regex]::Escape($Name))\s*=" } | Select-Object -First 1
    if (-not $line) { return $false }
    $val = ($line -split '=', 2)[1].Trim().Trim('"').Trim("'")
    return $val.Length -gt 0
}

function Clear-NativeCxxCaches([string]$ProjectRoot) {
    Write-Host "Cleaning native .cxx caches..." -ForegroundColor Cyan
    @(
        (Join-Path $ProjectRoot "android\app\.cxx"),
        (Join-Path $ProjectRoot "android\.cxx")
    ) | ForEach-Object {
        if (Test-Path $_) {
            Remove-Item -Recurse -Force $_ -ErrorAction SilentlyContinue
        }
    }

    Get-ChildItem -Path (Join-Path $ProjectRoot "node_modules") -Recurse -Directory -Filter ".cxx" -ErrorAction SilentlyContinue |
        ForEach-Object {
            Remove-Item -Recurse -Force $_.FullName -ErrorAction SilentlyContinue
        }
}

function Set-GradleProperty([string]$GradlePropsPath, [string]$Name, [string]$Value) {
    if (-not (Test-Path $GradlePropsPath)) { return }
    $props = Get-Content $GradlePropsPath -Raw
    if ($props -match ([regex]::Escape($Name) + '\s*=')) {
        $props = $props -replace ([regex]::Escape($Name) + '\s*=\s*\S+'), "$Name=$Value"
    } else {
        $props = $props.TrimEnd() + "`r`n$Name=$Value`r`n"
    }
    Set-Content -Path $GradlePropsPath -Value $props -NoNewline
}

function Set-FrameProcessorsEnabled([string]$GradlePropsPath, [bool]$Enabled) {
    $value = if ($Enabled) { 'true' } else { 'false' }
    Set-GradleProperty $GradlePropsPath 'VisionCamera_enableFrameProcessors' $value
    Write-Host "VisionCamera_enableFrameProcessors=$value" -ForegroundColor Cyan
}

function Set-ReleasePackagingForDevices([string]$GradlePropsPath) {
    # Extract .so at install time — avoids 16 KB page alignment crashes on Android 15+ / Pixel 9+.
    Set-GradleProperty $GradlePropsPath 'expo.useLegacyPackaging' 'true'
    Write-Host "expo.useLegacyPackaging=true (16 KB page / sideload compatibility)" -ForegroundColor Cyan
}

function Test-ReleaseBundleHasSupabase([string]$ApkPath) {
    $tmp = Join-Path ([System.IO.Path]::GetTempPath()) ("nn_apk_" + [guid]::NewGuid().ToString("n"))
    New-Item -ItemType Directory -Force -Path $tmp | Out-Null
    try {
        Push-Location $tmp
        jar xf $ApkPath assets/index.android.bundle 2>$null
        $bundle = Join-Path $tmp 'assets\index.android.bundle'
        if (-not (Test-Path $bundle)) {
            Write-Warning "Could not verify JS bundle in APK (assets/index.android.bundle missing)."
            return
        }
        $text = [System.IO.File]::ReadAllText($bundle)
        if ($text -notmatch 'https://[a-z0-9]+\.supabase\.co') {
            Write-Error "Release bundle is missing EXPO_PUBLIC_SUPABASE_URL. Rebuild after syncing .env to the build root."
        }
        Write-Host "Release bundle: Supabase URL embedded." -ForegroundColor DarkGray
    } finally {
        Pop-Location
        Remove-Item -Recurse -Force $tmp -ErrorAction SilentlyContinue
    }
}

function Invoke-FriendsApkGradle([string]$ProjectRoot, [bool]$FrameProcessorsEnabled) {
    $gradleProps = Join-Path $ProjectRoot "android\gradle.properties"
    Set-FrameProcessorsEnabled $gradleProps $FrameProcessorsEnabled
    Set-ReleasePackagingForDevices $gradleProps

    if ($FrameProcessorsEnabled) {
        Clear-NativeCxxCaches $ProjectRoot
        Remove-Item Env:FRIENDS_APK_DISABLE_RESIZE_PLUGIN -ErrorAction SilentlyContinue
    } else {
        $env:FRIENDS_APK_DISABLE_RESIZE_PLUGIN = '1'
    }

    $env:CMAKE_BUILD_PARALLEL_LEVEL = '1'
    $env:NODE_ENV = 'production'

    $androidDir = Join-Path $ProjectRoot "android"
    $gradlew = Join-Path $androidDir "gradlew.bat"
    if (-not (Test-Path $gradlew)) {
        Push-Location $ProjectRoot
        try {
            Write-Host "Generating android/ (expo prebuild)..." -ForegroundColor Yellow
            npx expo prebuild --platform android --no-install
            if ($LASTEXITCODE -ne 0) { return $LASTEXITCODE }
        } finally {
            Pop-Location
        }
    }

    Push-Location $androidDir
    try {
        # Physical phones only (arm). x86 emulators cannot run this APK.
        & $gradlew assembleRelease -x lint --no-daemon --no-parallel '-PreactNativeArchitectures=armeabi-v7a,arm64-v8a'
        if ($null -eq $LASTEXITCODE) { return 0 }
        return $LASTEXITCODE
    } finally {
        Pop-Location
    }
}

Set-Location $Root
$EnvFile = Join-Path $Root ".env"

if (-not (Test-Path $EnvFile)) {
    Write-Error "Missing .env - copy .env.example to .env and fill in values."
}

$required = @('EXPO_PUBLIC_SUPABASE_URL', 'EXPO_PUBLIC_SUPABASE_ANON_KEY')
$missing = @($required | Where-Object { -not (Test-EnvVar $_ $EnvFile) })
if ($missing.Count -gt 0) {
    Write-Error ("Missing or empty in .env: " + ($missing -join ', '))
}

$wantPreview = -not $SkipLivePreview
$resolved = Resolve-PreviewBuildRoot -SourceRoot $Root -RequireNoSpaces:$wantPreview
$BuildRoot = $resolved.BuildRoot
$UsedMirror = $resolved.UsedMirror

if ($UsedMirror) {
    Write-Host "Using preview build root (no spaces): $BuildRoot" -ForegroundColor Cyan
}

Copy-Item -Force $EnvFile (Join-Path $BuildRoot '.env')

if (-not $wantPreview) {
    Write-Host "Building release APK (arm phones, live preview OFF)..." -ForegroundColor Yellow
    $exitCode = Invoke-FriendsApkGradle $BuildRoot $false
    $livePreviewInApk = $false
} else {
    Write-Host "Building release APK (arm phones, live preview ON)..." -ForegroundColor Cyan
    $exitCode = Invoke-FriendsApkGradle $BuildRoot $true
    $livePreviewInApk = ($exitCode -eq 0)
}

if ($exitCode -ne 0) {
    Write-Host ""
    Write-Host "Build failed." -ForegroundColor Red
    if ($wantPreview -and ($UsedMirror -or (Test-PathHasSpaces $Root) -or (Test-PathTooLongForNativeBuild $Root))) {
        if (-not $UsedMirror) {
            Write-Host "  Run: npm run setup:preview-build-root" -ForegroundColor Yellow
        }
    }
    if ($wantPreview) {
        Write-Host "  Or build on Linux: eas build --platform android" -ForegroundColor Yellow
    }
    exit $exitCode
}

if ($wantPreview -and -not $livePreviewInApk) {
    Write-Error "Gradle succeeded but live preview was not enabled."
}

$apk = Join-Path $BuildRoot "android\app\build\outputs\apk\release\app-release.apk"
if (-not (Test-Path $apk)) {
    Write-Error "APK not found at $apk"
}

$outDir = Join-Path $Root "dist"
New-Item -ItemType Directory -Force -Path $outDir | Out-Null
$dest = Join-Path $outDir "near_nature-friends.apk"
Copy-Item -Force $apk $dest
Test-ReleaseBundleHasSupabase $dest

Write-Host ""
Write-Host "Done." -ForegroundColor Green
Write-Host "  APK: $dest"
Write-Host "  Size: $([math]::Round((Get-Item $dest).Length / 1MB, 1)) MB"
if ($livePreviewInApk) {
    Write-Host "  Live camera AI: ON" -ForegroundColor Green
} else {
    Write-Host "  Live camera AI: OFF" -ForegroundColor Yellow
}
if ($UsedMirror) {
    Write-Host "  Built from: $BuildRoot" -ForegroundColor DarkGray
}
Write-Host ""
Write-Host "Supabase setup for friends:" -ForegroundColor Yellow
Write-Host "  1. .\scripts\beta-production-setup.ps1  (SQL order)"
Write-Host "  2. .\scripts\deploy-identify-species.ps1"
Write-Host "  3. Do not put EXPO_PUBLIC_GEMINI_API_KEY in .env for friends builds"
Write-Host ""
Write-Host "Friends: copy APK to a physical Android phone (ARM). It will not run on x86 PC emulators." -ForegroundColor Cyan
