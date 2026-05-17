# Prints Supabase SQL run order for beta production items 1–2.
# Usage: .\scripts\beta-production-setup.ps1

$ErrorActionPreference = "Stop"
$Root = Split-Path -Parent $PSScriptRoot
$sql = Join-Path $Root "sql"

Write-Host ""
Write-Host "Near Nature - Beta production Supabase setup (items 1-2)" -ForegroundColor Cyan
Write-Host "Run each file in Supabase Dashboard -> SQL Editor -> New query" -ForegroundColor White
Write-Host ""

$core = @(
  "create_user.sql",
  "resolve_login_email.sql",
  "check_user_exists.sql",
  "update_user.sql",
  "delete_user.sql",
  "create_detections.sql",
  "update_detections.sql",
  "delete_detections.sql",
  "create_leaderboard.sql",
  "create_streaks.sql",
  "create_discoveries.sql",
  "storage_bucket_detections.sql",
  "get_detection_count_leaderboard.sql",
  "get_public_user_profile.sql",
  "disable_one_species_per_day_temp.sql",
  "drop_streak_client_update_policy.sql"
)

$discover = @(
  "create_explore_species.sql",
  "create_seasonality.sql",
  "create_parks.sql",
  "create_park_species.sql",
  "create_species_park_link.sql",
  "create_featured_rotation.sql",
  "explore_app_grants.sql",
  "get_park_summary_for_state.sql"
) | ForEach-Object { "discover/$_" }

$seed = @(
  "discover/seed/florida_data.sql",
  "discover/seed_florida_discover_all.sql"
)

function Show-Block([string]$title, [string[]]$files) {
  Write-Host $title -ForegroundColor Yellow
  $i = 1
  foreach ($f in $files) {
    $path = Join-Path $Root ("sql\" + ($f -replace '/', '\'))
    $mark = if (Test-Path $path) { " " } else { " (MISSING)" }
    Write-Host ("  {0,2}. {1}{2}" -f $i, $f, $mark)
    $i++
  }
  Write-Host ""
}

Write-Host "If this is a NEW project, run CORE first:" -ForegroundColor Green
Show-Block "Core schema" $core

Write-Host "If you already have users/detections, run DISCOVER only:" -ForegroundColor Green
Write-Host "  (Skip discover/create_explore_species.sql if you already imported explore_species CSV - it DROPs the table.)" -ForegroundColor DarkYellow
Show-Block "Discover + parks" $discover

Write-Host "Then SEED sample Florida data (park_species needs create_park_species.sql first):" -ForegroundColor Green
Show-Block "Seed" $seed
Write-Host "  If seed failed on park_species, run discover/create_park_species.sql then discover/seed_florida_park_species.sql" -ForegroundColor DarkYellow
Write-Host ""

Write-Host "Item 3 - Edge function (terminal on your machine):" -ForegroundColor Green
Write-Host "  .\scripts\deploy-identify-species.ps1" -ForegroundColor White
Write-Host ""
Write-Host "After SQL: Supabase -> Settings -> API -> Reload schema cache" -ForegroundColor DarkGray
Write-Host "Verify remote: npm run verify:supabase" -ForegroundColor DarkGray
Write-Host ""
