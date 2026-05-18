# Start Metro for a development build on emulator or physical device (LAN).
$ErrorActionPreference = 'Stop'
$Root = Split-Path -Parent $PSScriptRoot
Set-Location $Root

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
  Write-Host "Metro LAN host: $lanIp (port 8081)" -ForegroundColor Cyan
  Write-Host "Phone and PC must be on the same Wi‑Fi, or use USB with: adb reverse tcp:8081 tcp:8081" -ForegroundColor DarkGray
} else {
  Write-Warning 'Could not detect a LAN IP. Set REACT_NATIVE_PACKAGER_HOSTNAME in your environment if the device cannot connect.'
}

Write-Host 'Starting Expo dev server (dev client, LAN)...' -ForegroundColor Green
npx expo start --dev-client --lan --clear @args
