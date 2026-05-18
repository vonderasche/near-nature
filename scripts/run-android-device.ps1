# Build/install the Android dev client and connect it to Metro on a physical device or emulator.
param(
  [switch]$InstallOnly
)

$ErrorActionPreference = 'Stop'
$Root = Split-Path -Parent $PSScriptRoot
Set-Location $Root

$Port = 8081
$env:EXPO_DEV_SERVER_LISTEN_ADDRESS = '0.0.0.0'

function Get-LanIPv4 {
  $candidates = Get-NetIPAddress -AddressFamily IPv4 -ErrorAction SilentlyContinue |
    Where-Object {
      $_.IPAddress -notmatch '^127\.' -and
      $_.IPAddress -notmatch '^169\.254\.' -and
      $_.InterfaceAlias -notmatch 'vEthernet|Loopback'
    } |
    Sort-Object -Property InterfaceMetric
  return ($candidates | Select-Object -First 1).IPAddress
}

$lanIp = Get-LanIPv4
if ($lanIp) {
  $env:REACT_NATIVE_PACKAGER_HOSTNAME = $lanIp
}

if (Get-Command adb -ErrorAction SilentlyContinue) {
  $devices = @(adb devices 2>$null | Select-String '\tdevice$')
  if ($devices.Count -gt 0) {
    adb reverse tcp:$Port tcp:$Port 2>$null | Out-Null
    Write-Host "USB device: adb reverse tcp:$Port -> PC (dev client can use localhost:$Port)" -ForegroundColor Green
  }
}

$metroListening = Get-NetTCPConnection -LocalPort $Port -State Listen -ErrorAction SilentlyContinue

if ($InstallOnly -or $metroListening) {
  Write-Host ""
  Write-Host "Port $Port is already in use — using existing Metro (not starting a second server)." -ForegroundColor Yellow
  Write-Host "If the app shows a red error screen, run in another terminal:  npm run start:dev" -ForegroundColor Yellow
  Write-Host ""
  npx expo run:android --no-bundler --port $Port @args
  exit $LASTEXITCODE
}

Write-Host "Starting Metro and building Android (port $Port)..." -ForegroundColor Green
npx expo run:android --port $Port @args
