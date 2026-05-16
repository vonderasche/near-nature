# Builds a release APK for sideloading to friends (signed with debug keystore).
# Usage: .\scripts\build-friends-apk.ps1

$ErrorActionPreference = "Stop"
$Root = Split-Path -Parent $PSScriptRoot
Set-Location $Root

function Test-EnvVar([string]$Name) {
    $line = Get-Content .env -ErrorAction SilentlyContinue | Where-Object { $_ -match "^\s*$([regex]::Escape($Name))\s*=" } | Select-Object -First 1
    if (-not $line) { return $false }
    $val = ($line -split '=', 2)[1].Trim().Trim('"').Trim("'")
    return $val.Length -gt 0
}

if (-not (Test-Path .env)) {
    Write-Error "Missing .env - copy .env.example to .env and fill in values."
}

$required = @(
    'EXPO_PUBLIC_SUPABASE_URL',
    'EXPO_PUBLIC_SUPABASE_ANON_KEY',
    'EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID',
    'EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID'
)
$missing = @($required | Where-Object { -not (Test-EnvVar $_) })
if ($missing.Count -gt 0) {
    Write-Error ("Missing or empty in .env: " + ($missing -join ', '))
}

Write-Host "Building release APK (this may take several minutes)..." -ForegroundColor Cyan
npm run android:apk
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

$apk = Join-Path $Root "android\app\build\outputs\apk\release\app-release.apk"
if (-not (Test-Path $apk)) {
    Write-Error "APK not found at $apk"
}

$outDir = Join-Path $Root "dist"
New-Item -ItemType Directory -Force -Path $outDir | Out-Null
$dest = Join-Path $outDir "near_nature-friends.apk"
Copy-Item -Force $apk $dest

Write-Host ""
Write-Host "Done." -ForegroundColor Green
Write-Host "  APK: $dest"
Write-Host "  Size: $([math]::Round((Get-Item $dest).Length / 1MB, 1)) MB"
Write-Host ""
Write-Host "Supabase setup for friends:" -ForegroundColor Yellow
Write-Host "  1. SQL Editor: sql/friends_release_bootstrap.sql"
Write-Host "  2. SQL Editor: sql/get_detection_count_leaderboard.sql"
Write-Host "  3. SQL Editor: sql/get_public_user_profile.sql"
Write-Host "  4. Deploy Edge Function identify-species + secret ANTHROPIC_API_KEY"
Write-Host "  5. Do not put EXPO_PUBLIC_ANTHROPIC_API_KEY in .env for friends builds"
Write-Host ""
Write-Host "Google Cloud OAuth Android client SHA-1 for this keystore:" -ForegroundColor Yellow
$debugKeystore = Join-Path $Root "android\app\debug.keystore"
if (Test-Path $debugKeystore) {
    $keytoolOut = & keytool -list -v -keystore $debugKeystore -alias androiddebugkey -storepass android -keypass android 2>&1
    $keytoolOut | Select-String "SHA1:"
} else {
    Write-Host "  debug.keystore not found under android/app"
}
Write-Host ""
Write-Host "Friends: copy APK to phone, open it, allow install from unknown sources if asked." -ForegroundColor Cyan
