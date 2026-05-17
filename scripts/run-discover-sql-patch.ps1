# Applies Discover/leaderboard SQL patches via Supabase CLI (requires DB password).
# Usage:
#   $env:SUPABASE_DB_PASSWORD = '<from Dashboard -> Project Settings -> Database>'
#   .\scripts\run-discover-sql-patch.ps1
#
# Or link once: npx supabase link --project-ref axvubbqcdbxsetqwvjof

$ErrorActionPreference = "Stop"
$Root = Split-Path -Parent $PSScriptRoot
$sql = Join-Path $Root "sql\discover"
$ref = "axvubbqcdbxsetqwvjof"

if (-not $env:SUPABASE_DB_PASSWORD) {
  Write-Host "Set SUPABASE_DB_PASSWORD (Database password from Supabase Dashboard) and re-run." -ForegroundColor Yellow
  exit 1
}

$leaderboardSql = Join-Path $Root "sql\get_detection_count_leaderboard.sql"
$discoverFiles = @(
  "get_park_summary_for_state.sql",
  "explore_app_grants.sql",
  "seed/florida_data.sql",
  "seed_florida_discover_all.sql"
)

foreach ($item in @(@{ path = $leaderboardSql; label = "sql/get_detection_count_leaderboard.sql" }) + ($discoverFiles | ForEach-Object { @{ path = Join-Path $sql $_; label = "sql/discover/$_" } })) {
  if (-not (Test-Path $item.path)) { throw "Missing $($item.path)" }
  Write-Host "Executing $($item.label) ..." -ForegroundColor Cyan
  npx supabase db execute --project-ref $ref --file $item.path
}

Write-Host ""
Write-Host "Done. Reload API schema cache in Dashboard, then: npm run verify:supabase" -ForegroundColor Green
