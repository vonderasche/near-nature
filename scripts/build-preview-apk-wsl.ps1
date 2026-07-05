# Launch WSL preview APK build (requires Ubuntu WSL — not docker-desktop).
# Usage: npm run android:preview-apk:wsl
#
# First-time setup:
#   wsl --install Ubuntu-24.04
#   wsl -d Ubuntu-24.04
#   sudo apt update && sudo apt install -y nodejs npm rsync

$ErrorActionPreference = "Stop"

function ConvertTo-WslPath([string]$WindowsPath) {
    $full = (Resolve-Path $WindowsPath).Path
    if ($full -match '^([A-Za-z]):\\(.*)$') {
        $drive = $Matches[1].ToLower()
        $rest = $Matches[2] -replace '\\', '/'
        return "/mnt/$drive/$rest"
    }
    return $WindowsPath
}

$Script = Join-Path $PSScriptRoot "build-preview-apk-wsl.sh"
$WslScript = ConvertTo-WslPath $Script

$distro = $env:NEAR_NATURE_WSL_DISTRO
if (-not $distro) {
    $listed = @(wsl -l -q 2>$null | ForEach-Object { $_.Trim() } | Where-Object { $_ -and $_ -notmatch 'docker' })
    $distro = @($listed | Where-Object { $_ -match '^Ubuntu' } | Select-Object -First 1)
    if (-not $distro) { $distro = @($listed | Select-Object -First 1) }
}
if (-not $distro) {
    Write-Error @"
No usable WSL distro found (only docker-desktop is installed).

Install Ubuntu, then re-run:
  wsl --install Ubuntu-24.04
  wsl -d Ubuntu-24.04
  sudo apt update && sudo apt install -y nodejs npm rsync
  npm run android:preview-apk:wsl
"@
}

Write-Host "Using WSL distro: $distro" -ForegroundColor Cyan
wsl -d $distro bash -lc "chmod +x '$WslScript' && bash '$WslScript'"
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
