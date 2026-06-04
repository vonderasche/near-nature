# One-time setup for live-preview release APKs on Windows when the repo path has spaces.
# Creates/syncs to C:\dev\near_nature (or NEAR_NATURE_PREVIEW_BUILD_ROOT).

$ErrorActionPreference = 'Stop'
. (Join-Path $PSScriptRoot 'resolve-preview-build-root.ps1')

$SourceRoot = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path
$destRoot = Get-ConfiguredPreviewBuildRoot

Write-Host "Near Nature - preview build root setup" -ForegroundColor Cyan
Write-Host ""
Write-Host "Live camera AI needs a project path WITHOUT spaces on Windows."
Write-Host "Your repo: $SourceRoot"
Write-Host "Build root: $destRoot"
Write-Host ""

if (-not (Test-PathHasSpaces $SourceRoot)) {
    Write-Host "Your repo path has no spaces. You can build in place:" -ForegroundColor Green
    Write-Host "  npm run android:friends-apk"
    exit 0
}

Write-Host "Syncing project to build root..." -ForegroundColor Yellow
Sync-ProjectToPreviewBuildRoot -SourceRoot $SourceRoot -DestRoot $destRoot

Write-Host ""
Write-Host "Done." -ForegroundColor Green
Write-Host "  Build root: $destRoot"
Write-Host ""
Write-Host "Future friends APKs (live preview ON):" -ForegroundColor Cyan
Write-Host "  npm run android:friends-apk"
Write-Host ""
Write-Host "Optional: set permanently for this user:" -ForegroundColor DarkGray
Write-Host ('  [Environment]::SetEnvironmentVariable(''NEAR_NATURE_PREVIEW_BUILD_ROOT'', ''' + $destRoot + ''', ''User'')')
