# Prints ML telemetry Supabase setup steps and runs verify when .env is configured.
$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $PSScriptRoot

Write-Host ""
Write-Host "ML telemetry setup (Near Nature)" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. Supabase Studio -> SQL Editor. Run in order:"
Write-Host "   - sql/create_ml_telemetry_events.sql"
Write-Host "   - sql/ml_telemetry_reports.sql"
Write-Host "   - sql/storage_bucket_ml_telemetry.sql  (optional thumbnails)"
Write-Host ""
Write-Host "2. Settings -> API -> Reload schema cache"
Write-Host ""
Write-Host "3. In .env:"
Write-Host "   EXPO_PUBLIC_CLASSIFICATION_DEBUG=1"
Write-Host "   SUPABASE_SERVICE_ROLE_KEY=...  (for npm run report:ml-telemetry)"
Write-Host ""
Write-Host "4. Rebuild the app. In Settings -> Identification feedback, opt in."
Write-Host ""
Write-Host "5. Verify RPCs and views:"
Write-Host ""

Push-Location $root
try {
  npm run verify:supabase
} finally {
  Pop-Location
}

Write-Host ""
Write-Host "Reports: npm run report:ml-telemetry" -ForegroundColor DarkGray
Write-Host ""
