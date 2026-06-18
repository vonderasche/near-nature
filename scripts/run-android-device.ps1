# Build/install the Android dev client and connect it to Metro on a physical device or emulator.
param(
  [switch]$InstallOnly
)

$ErrorActionPreference = 'Stop'
$Root = Split-Path -Parent $PSScriptRoot
Set-Location $Root

$AppId = 'com.vonderasche.near_nature'
$GradleArch = 'x86_64'

function Ensure-AndroidBuildEnv {
  if (-not $env:ANDROID_HOME -and -not $env:ANDROID_SDK_ROOT) {
    $defaultSdk = Join-Path $env:LOCALAPPDATA 'Android\Sdk'
    if (Test-Path $defaultSdk) {
      $env:ANDROID_HOME = $defaultSdk
    }
  }

  if (-not $env:JAVA_HOME) {
    $javaCandidates = @(
      'C:\Program Files\Eclipse Adoptium\jdk-17.0.19.10-hotspot',
      'C:\Program Files\Android\Android Studio\jbr',
      'C:\Program Files\Java\jdk-17'
    )
    foreach ($candidate in $javaCandidates) {
      $javaExe = Join-Path $candidate 'bin\java.exe'
      if (Test-Path $javaExe) {
        $env:JAVA_HOME = $candidate.TrimEnd('\')
        break
      }
    }
  }

  $pathAdds = @()
  if ($env:JAVA_HOME) {
    $pathAdds += (Join-Path $env:JAVA_HOME 'bin')
  }
  if ($env:ANDROID_HOME) {
    $pathAdds += @(
      (Join-Path $env:ANDROID_HOME 'platform-tools'),
      (Join-Path $env:ANDROID_HOME 'emulator')
    )
  }
  foreach ($entry in $pathAdds) {
    if ((Test-Path $entry) -and ($env:Path -notlike "*$entry*")) {
      $env:Path = "$entry;$env:Path"
    }
  }

  if (-not (Get-Command java -ErrorAction SilentlyContinue)) {
    Write-Error @"
Java 17 was not found. Set JAVA_HOME to your JDK folder (e.g. Eclipse Adoptium 17), add %JAVA_HOME%\bin to Path, then restart the terminal.
"@
  }

  # Always use a short Gradle home (Cursor sandbox / long TEMP paths break native C++ builds on Windows).
  $shortGradleHome = 'C:\gradle'
  if (-not (Test-Path $shortGradleHome)) {
    New-Item -ItemType Directory -Path $shortGradleHome -Force | Out-Null
  }
  $env:GRADLE_USER_HOME = $shortGradleHome
}

function Wait-ForMetroPort {
  param(
    [int]$Port,
    [int]$TimeoutSeconds = 120
  )

  $deadline = (Get-Date).AddSeconds($TimeoutSeconds)
  while ((Get-Date) -lt $deadline) {
    if (Get-NetTCPConnection -LocalPort $Port -State Listen -ErrorAction SilentlyContinue) {
      return $true
    }
    Start-Sleep -Seconds 2
  }
  return $false
}

function Invoke-AndroidGradleInstall {
  param([int]$DevServerPort)

  $androidDir = Join-Path $Root 'android'
  if (-not (Test-Path $androidDir)) {
    Write-Error "Missing android/ folder. Run: npx expo prebuild --platform android"
  }

  Write-Host "Gradle install (arch $GradleArch, GRADLE_USER_HOME=$env:GRADLE_USER_HOME)..." -ForegroundColor Cyan

  Push-Location $androidDir
  try {
    & .\gradlew.bat --stop 2>$null | Out-Null
    $gradleArgs = @(
      'app:installDebug',
      '-x', 'lint',
      '-x', 'test',
      "-PreactNativeArchitectures=$GradleArch",
      "-PreactNativeDevServerPort=$DevServerPort",
      '--configure-on-demand',
      '--build-cache'
    )
    & .\gradlew.bat @gradleArgs
    if ($LASTEXITCODE -ne 0) {
      exit $LASTEXITCODE
    }
  } finally {
    Pop-Location
  }
}

function Launch-AndroidApp {
  if (-not (Get-Command adb -ErrorAction SilentlyContinue)) {
    return
  }
  # am start is quieter than monkey; Start-Process avoids PowerShell treating adb stderr as a terminating error.
  Start-Process -FilePath 'adb' -ArgumentList @('shell', 'am', 'start', '-n', "$AppId/.MainActivity") -NoNewWindow -Wait | Out-Null
}

Ensure-AndroidBuildEnv

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
  if ($devices.Count -eq 0) {
    Write-Error @"
No Android device/emulator found. Start an emulator in Android Studio (Device Manager), then run: adb devices
"@
  }
  adb reverse tcp:$Port tcp:$Port 2>$null | Out-Null
  Write-Host "adb reverse tcp:$Port -> PC (dev client uses localhost:$Port)" -ForegroundColor Green
}

$metroListening = Get-NetTCPConnection -LocalPort $Port -State Listen -ErrorAction SilentlyContinue

if ($Root.Length -gt 80 -or $Root -match '\s') {
  Write-Host ''
  Write-Host 'Note: This project path is long or contains spaces. If the build fails with' -ForegroundColor Yellow
  Write-Host '"Filename longer than 260 characters", move the repo to C:\dev\near_nature' -ForegroundColor Yellow
  Write-Host ''
}

if ($InstallOnly -or $metroListening) {
  if ($metroListening) {
    Write-Host "Metro already on port $Port - building and installing only." -ForegroundColor Yellow
  }
  Invoke-AndroidGradleInstall -DevServerPort $Port
  Launch-AndroidApp
  exit 0
}

Write-Host "Starting Metro, then building Android (port $Port, arch $GradleArch)..." -ForegroundColor Green
$metroProc = Start-Process -FilePath 'npm.cmd' -ArgumentList 'run', 'start:dev' -WorkingDirectory $Root -PassThru -WindowStyle Normal

if (-not (Wait-ForMetroPort -Port $Port)) {
  if (-not $metroProc.HasExited) {
    Stop-Process -Id $metroProc.Id -Force -ErrorAction SilentlyContinue
  }
  Write-Error "Metro did not start on port $Port within 2 minutes. Run npm run start:dev manually, then npm run android:install"
}

Invoke-AndroidGradleInstall -DevServerPort $Port
Launch-AndroidApp

Write-Host ''
Write-Host 'App installed. Metro is running in a separate window - leave it open while developing.' -ForegroundColor Green
