# Release APK for on-device camera + scoring tests (local detection storage, no Supabase saves).
# Usage: .\scripts\build-device-test-apk.ps1
#
# Sets EXPO_PUBLIC_LOCAL_DETECTIONS=true for this build. Camera saves stay on the phone;
# profile gallery and badge progress read from that local store. Auth + identify still use
# network (Supabase session + identify-species or EXPO_PUBLIC_ANTHROPIC_API_KEY).

$ErrorActionPreference = "Stop"
$Root = Split-Path -Parent $PSScriptRoot
Set-Location $Root

function Test-EnvVar([string]$Name) {
    $line = Get-Content .env -ErrorAction SilentlyContinue | Where-Object { $_ -match "^\s*$([regex]::Escape($Name))\s*=" } | Select-Object -First 1
    if (-not $line) { return $false }
    $val = ($line -split '=', 2)[1].Trim().Trim('"').Trim("'")
    return $val.Length -gt 0
}

function Set-EnvVar([string]$Name, [string]$Value) {
    $lines = @(Get-Content .env -ErrorAction SilentlyContinue)
    $pattern = "^\s*$([regex]::Escape($Name))\s*="
    $found = $false
    $out = foreach ($line in $lines) {
        if ($line -match $pattern) {
            $found = $true
            "$Name=$Value"
        } else {
            $line
        }
    }
    if (-not $found) {
        $out += "$Name=$Value"
    }
    $out | Set-Content -Encoding utf8 .env
}

if (-not (Test-Path .env)) {
    Write-Error "Missing .env - copy .env.example to .env and fill in values."
}

$required = @('EXPO_PUBLIC_SUPABASE_URL', 'EXPO_PUBLIC_SUPABASE_ANON_KEY')
$missing = @($required | Where-Object { -not (Test-EnvVar $_) })
if ($missing.Count -gt 0) {
    Write-Error ("Missing or empty in .env: " + ($missing -join ', '))
}

Set-EnvVar 'EXPO_PUBLIC_LOCAL_DETECTIONS' 'true'
Write-Host "EXPO_PUBLIC_LOCAL_DETECTIONS=true (camera saves on-device only)" -ForegroundColor Yellow

if (-not (Test-EnvVar 'EXPO_PUBLIC_ANTHROPIC_API_KEY')) {
    Write-Host "Tip: add EXPO_PUBLIC_ANTHROPIC_API_KEY for offline-from-edge identify on device," -ForegroundColor Yellow
    Write-Host "     or ensure identify-species Edge Function is deployed." -ForegroundColor Yellow
}

Write-Host "Bundling release APK (several minutes)..." -ForegroundColor Cyan
Push-Location android
try {
    .\gradlew.bat --stop 2>$null
    .\gradlew.bat assembleRelease -x lint -PreactNativeArchitectures=arm64-v8a --no-parallel
    if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
} finally {
    Pop-Location
}

$apk = Join-Path $Root "android\app\build\outputs\apk\release\app-release.apk"
if (-not (Test-Path $apk)) {
    Write-Error "APK not found at $apk"
}

$outDir = Join-Path $Root "dist"
New-Item -ItemType Directory -Force -Path $outDir | Out-Null
$dest = Join-Path $outDir "near_nature-device-test.apk"
Copy-Item -Force $apk $dest

Write-Host ""
Write-Host "Done." -ForegroundColor Green
Write-Host "  APK: $dest"
Write-Host "  Size: $([math]::Round((Get-Item $dest).Length / 1MB, 1)) MB"
Write-Host ""
Write-Host "Device test mode:" -ForegroundColor Cyan
Write-Host "  - Sign in still required (session only; detections are not uploaded)"
Write-Host "  - Saves appear in Profile gallery from local storage"
Write-Host "  - Badge row reflects species you saved on this device"
Write-Host "  - To return to cloud saves, set EXPO_PUBLIC_LOCAL_DETECTIONS=false and rebuild"
