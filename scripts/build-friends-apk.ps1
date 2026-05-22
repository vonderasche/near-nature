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
    'EXPO_PUBLIC_SUPABASE_ANON_KEY'
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
Write-Host "  1. .\scripts\beta-production-setup.ps1  (SQL order)"
Write-Host "  2. .\scripts\deploy-identify-species.ps1"
Write-Host "  3. Do not put EXPO_PUBLIC_GEMINI_API_KEY in .env for friends builds"
Write-Host ""
Write-Host "Friends: copy APK to phone, open it, allow install from unknown sources if asked." -ForegroundColor Cyan
