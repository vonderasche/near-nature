# Copies the Florida genus profile catalog into the app bundle.
# After syncing, bump SPECIES_CATALOG_VERSION in lib/db/seedSpeciesCatalog.ts if the source file changed.

$Source = "e:\PROGRAMMING\Portfolio\near nature\python\DATASET\INAT2021_FLORIDA_MASTER\genus_profiles.enriched.min.json"
$Dest = Join-Path $PSScriptRoot "..\assets\tflite\near_nature_app_bundle\genus_info\genus_profiles.enriched.min.json"

if (-not (Test-Path $Source)) {
  Write-Error "Source not found: $Source"
  exit 1
}

Copy-Item -Path $Source -Destination $Dest -Force
Write-Host "Synced genus catalog to $Dest"
