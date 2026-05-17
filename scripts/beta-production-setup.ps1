# Prints Supabase SQL run order for beta production.
# Usage: .\scripts\beta-production-setup.ps1

$ErrorActionPreference = "Stop"
$Root = Split-Path -Parent $PSScriptRoot

Write-Host ""
Write-Host "Near Nature - Beta production Supabase setup" -ForegroundColor Cyan
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

function Show-Block([string]$title, [string[]]$files) {
  Write-Host $title -ForegroundColor Yellow
  $i = 1
  foreach ($f in $files) {
    $path = Join-Path $Root ("sql\" + $f)
    $mark = if (Test-Path $path) { " " } else { " (MISSING)" }
    Write-Host ("  {0,2}. {1}{2}" -f $i, $f, $mark)
    $i++
  }
  Write-Host ""
}

Show-Block "Core schema (sql/)" $core

Write-Host "Edge function (terminal on your machine):" -ForegroundColor Green
Write-Host "  .\scripts\deploy-identify-species.ps1" -ForegroundColor White
Write-Host ""
Write-Host "After SQL: Supabase -> Settings -> API -> Reload schema cache" -ForegroundColor DarkGray
Write-Host "Verify remote: npm run verify:supabase" -ForegroundColor DarkGray
Write-Host ""
