# Resolves where to run Android native builds for live camera preview (no spaces in path).
# Dot-source from build-friends-apk.ps1 or run directly to print the path.

$ErrorActionPreference = 'Stop'

$DefaultPreviewBuildRoot = 'C:\dev\near_nature'

function Test-PathHasSpaces([string]$Path) {
    return $Path -match '\s'
}

function Get-ConfiguredPreviewBuildRoot() {
    if ($env:NEAR_NATURE_PREVIEW_BUILD_ROOT) {
        return (Resolve-Path $env:NEAR_NATURE_PREVIEW_BUILD_ROOT -ErrorAction Stop).Path
    }
    return $DefaultPreviewBuildRoot
}

function Sync-ProjectToPreviewBuildRoot([string]$SourceRoot, [string]$DestRoot) {
    if (-not (Test-Path $SourceRoot)) {
        throw "Source project not found: $SourceRoot"
    }

    New-Item -ItemType Directory -Force -Path $DestRoot | Out-Null

    Write-Host "Syncing project to preview build root (incremental)..." -ForegroundColor Cyan
    Write-Host "  From: $SourceRoot"
    Write-Host "  To:   $DestRoot"

    $robocopyArgs = @(
        $SourceRoot,
        $DestRoot,
        '/E',
        '/XD', 'node_modules', '.git', 'dist', 'android\app\build', 'android\build', 'android\.cxx',
        '/NFL', '/NDL', '/NJH', '/NJS', '/nc', '/ns', '/np'
    )
    & robocopy @robocopyArgs | Out-Null
    # Robocopy exit codes 0-7 are success (0 = nothing copied).
    if ($LASTEXITCODE -ge 8) {
        throw "robocopy failed with exit code $LASTEXITCODE"
    }

    $destModules = Join-Path $DestRoot 'node_modules'
    if (-not (Test-Path $destModules)) {
        Write-Host "First sync: installing npm dependencies at build root (one-time)..." -ForegroundColor Yellow
        Push-Location $DestRoot
        try {
            npm install
            if ($LASTEXITCODE -ne 0) {
                throw "npm install failed at $DestRoot"
            }
        } finally {
            Pop-Location
        }
    }

    $envFile = Join-Path $SourceRoot '.env'
    if (Test-Path $envFile) {
        Copy-Item -Force $envFile (Join-Path $DestRoot '.env')
    }
}

<#
.SYNOPSIS
  Returns the directory to use for Gradle when live preview is required.

.PARAMETER SourceRoot
  Current repo root (may contain spaces).

.PARAMETER RequireNoSpaces
  When true, uses NEAR_NATURE_PREVIEW_BUILD_ROOT or syncs to C:\dev\near_nature if SourceRoot has spaces.
#>
function Resolve-PreviewBuildRoot {
    param(
        [Parameter(Mandatory = $true)]
        [string]$SourceRoot,
        [switch]$RequireNoSpaces
    )

    $sourceRoot = (Resolve-Path $SourceRoot).Path

    if (-not $RequireNoSpaces) {
        return @{
            BuildRoot = $sourceRoot
            UsedMirror = $false
            SourceRoot = $sourceRoot
        }
    }

    if (-not (Test-PathHasSpaces $sourceRoot)) {
        return @{
            BuildRoot = $sourceRoot
            UsedMirror = $false
            SourceRoot = $sourceRoot
        }
    }

    $destRoot = Get-ConfiguredPreviewBuildRoot
    if (Test-PathHasSpaces $destRoot) {
        throw @"
Preview build root must not contain spaces.
Set NEAR_NATURE_PREVIEW_BUILD_ROOT to a short path, e.g. C:\dev\near_nature
"@
    }

    Sync-ProjectToPreviewBuildRoot -SourceRoot $sourceRoot -DestRoot $destRoot

    return @{
        BuildRoot = $destRoot
        UsedMirror = $true
        SourceRoot = $sourceRoot
    }
}
