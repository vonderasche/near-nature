# Prints Supabase SQL run order for beta production.
# Usage: .\scripts\beta-production-setup.ps1

$ErrorActionPreference = "Stop"
$Root = Split-Path -Parent $PSScriptRoot

Write-Host ""
Write-Host "Near Nature - Beta production Supabase setup" -ForegroundColor Cyan
Write-Host "Run each .sql FILE in Supabase SQL Editor (not this README / not sql/README.md)" -ForegroundColor Yellow
Write-Host ""

$core = @(
  "create_user.sql",
  "ensure_public_user_profile.sql",
  "resolve_login_email.sql",
  "check_user_exists.sql",
  "create_detections.sql",
  "create_leaderboard.sql",
  "create_point_awards.sql",
  "check_category_milestones.sql",
  "create_streaks.sql",
  "create_discoveries.sql",
  "storage_bucket_detections.sql",
  "get_detection_count_leaderboard.sql",
  "get_public_user_profile.sql",
  "get_public_user_awards.sql",
  "add_detection_naturalist_columns.sql",
  "get_user_score_by_category.sql",
  "get_user_scoring_snapshot.sql",
  "add_detection_search.sql",
  "create_species_catalog.sql",
  "create_florida_state_parks.sql",
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

Write-Host "Existing DB patches (run when tables already exist):" -ForegroundColor Green
Write-Host "  sql/ensure_public_user_profile.sql (if create_user.sql predates profile RPC)" -ForegroundColor White
Write-Host "  sql/check_user_exists.sql" -ForegroundColor White
Write-Host "  sql/add_user_date_of_birth.sql" -ForegroundColor White
Write-Host "  sql/add_species_subcategories.sql" -ForegroundColor White
Write-Host "  sql/add_naturalist_category_enums.sql" -ForegroundColor White
Write-Host "  sql/create_point_awards.sql (if not in core rebuild)" -ForegroundColor White
Write-Host "  sql/check_category_milestones.sql" -ForegroundColor White
Write-Host "  sql/create_species_catalog.sql (cloud genus catalog + Gemini community rows)" -ForegroundColor White
Write-Host "  sql/create_florida_state_parks.sql + npm run seed:florida-parks" -ForegroundColor White
Write-Host "  Re-run sql/create_discoveries.sql to wire milestone trigger" -ForegroundColor White
Write-Host "  sql/get_public_user_awards.sql (member profile earned badges)" -ForegroundColor White
Write-Host "  sql/get_user_scoring_snapshot.sql (own profile scoring tab)" -ForegroundColor White
Write-Host "  sql/drop_legacy_rpc.sql" -ForegroundColor White
Write-Host ""
Write-Host "Removed from app (do not deploy sql/discover/*):" -ForegroundColor DarkGray
Write-Host "  Discover explore tab (parks/species hub) — not part of this codebase" -ForegroundColor DarkGray
Write-Host ""
Write-Host "Edge function (terminal on your machine):" -ForegroundColor Green
Write-Host "  .\scripts\deploy-identify-species.ps1" -ForegroundColor White
Write-Host ""
Write-Host "After SQL: Supabase -> Settings -> API -> Reload schema cache" -ForegroundColor DarkGray
Write-Host "Verify remote: npm run verify:supabase" -ForegroundColor DarkGray
Write-Host ""
