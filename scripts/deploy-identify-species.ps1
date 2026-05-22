# Deploy identify-species Edge Function and verify secrets (item 3).
# Prerequisites: Supabase CLI, project linked (`supabase link --project-ref <ref>`)
# Usage:
#   .\scripts\deploy-identify-species.ps1
#   .\scripts\deploy-identify-species.ps1 -ProjectRef axvubbqcdbxsetqwvjof
# Set secret (once): supabase secrets set GEMINI_API_KEY=...

param(
  [string]$ProjectRef = ""
)

$ErrorActionPreference = "Stop"
$Root = Split-Path -Parent $PSScriptRoot
Set-Location $Root

function Get-EnvVar([string]$Name) {
  $line = Get-Content .env -ErrorAction SilentlyContinue | Where-Object { $_ -match "^\s*$([regex]::Escape($Name))\s*=" } | Select-Object -First 1
  if (-not $line) { return $null }
  return ($line -split '=', 2)[1].Trim().Trim('"').Trim("'")
}

if (-not (Get-Command supabase -ErrorAction SilentlyContinue)) {
  Write-Host "Supabase CLI not found." -ForegroundColor Red
  Write-Host "Install: https://supabase.com/docs/guides/cli" -ForegroundColor White
  Write-Host "Then: supabase login" -ForegroundColor White
  Write-Host "      supabase link --project-ref <your-project-ref>" -ForegroundColor White
  Write-Host "      supabase secrets set GEMINI_API_KEY=<key>" -ForegroundColor White
  Write-Host "      supabase functions deploy identify-species" -ForegroundColor White
  exit 1
}

if ($ProjectRef) {
  Write-Host "Linking project $ProjectRef ..." -ForegroundColor Cyan
  supabase link --project-ref $ProjectRef
  if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
}

$linked = Test-Path (Join-Path $Root "supabase\.temp\project-ref")
if (-not $linked -and -not $ProjectRef) {
  $url = Get-EnvVar "EXPO_PUBLIC_SUPABASE_URL"
  if ($url -match 'https://([a-z0-9]+)\.supabase\.co') {
    $guess = $Matches[1]
    Write-Host "Not linked. From .env, project ref may be: $guess" -ForegroundColor Yellow
    Write-Host "Run: supabase link --project-ref $guess" -ForegroundColor White
  } else {
    Write-Host "Run: supabase link --project-ref <your-project-ref>" -ForegroundColor Yellow
  }
  exit 1
}

Write-Host "Deploying identify-species ..." -ForegroundColor Cyan
supabase functions deploy identify-species
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

Write-Host ""
Write-Host "Deployed identify-species." -ForegroundColor Green
Write-Host ""
Write-Host "Required secrets (set if not already):" -ForegroundColor Yellow
Write-Host "  supabase secrets set GEMINI_API_KEY=<your-google-ai-key>" -ForegroundColor White
Write-Host "  supabase secrets set GEMINI_MODEL=gemini-2.0-flash   # optional" -ForegroundColor DarkGray
Write-Host ""
Write-Host "Friends/release builds: remove EXPO_PUBLIC_GEMINI_API_KEY from .env" -ForegroundColor Yellow
Write-Host "  so the app uses the Edge Function (see api/gemini.ts)." -ForegroundColor DarkGray
Write-Host ""
Write-Host "Test: sign in on device, capture photo, run identification." -ForegroundColor Cyan
Write-Host ""
