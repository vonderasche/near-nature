# Builds a release APK for sideloading to friends (signed with debug keystore).
# Live camera preview is ON by default (frame processors + resize plugin).
#
# Usage:
#   npm run android:friends-apk
#   .\scripts\build-friends-apk.ps1 -SkipLivePreview   # emergency only
#
# Windows + path with spaces: run once:
#   npm run setup:preview-build-root

param(
    [switch]$SkipLivePreview,
    [switch]$PreviewModelsOnly
)

$ErrorActionPreference = "Stop"
$Root = (Resolve-Path (Split-Path -Parent $PSScriptRoot)).Path
. (Join-Path $PSScriptRoot "resolve-preview-build-root.ps1")

function Set-EnvVar([string]$Name, [string]$Value, [string]$EnvFile) {
    $lines = @(Get-Content $EnvFile -ErrorAction SilentlyContinue)
    $pattern = "^\s*$([regex]::Escape($Name))\s*="
    $found = $false
    $out = foreach ($line in $lines) {
        if ($line -match $pattern) {
            $found = $true
            "$Name=$Value"
        } else {
            $line
        }
    }
    if (-not $found) {
        $out += "$Name=$Value"
    }
    $out | Set-Content -Encoding utf8 $EnvFile
}

function Test-EnvVar([string]$Name, [string]$EnvFile) {
    $line = Get-Content $EnvFile -ErrorAction SilentlyContinue | Where-Object { $_ -match "^\s*$([regex]::Escape($Name))\s*=" } | Select-Object -First 1
    if (-not $line) { return $false }
    $val = ($line -split '=', 2)[1].Trim().Trim('"').Trim("'")
    return $val.Length -gt 0
}

function Clear-NativeCxxCaches([string]$ProjectRoot) {
    Write-Host "Cleaning native .cxx caches..." -ForegroundColor Cyan
    @(
        (Join-Path $ProjectRoot "android\app\.cxx"),
        (Join-Path $ProjectRoot "android\.cxx")
    ) | ForEach-Object {
        if (Test-Path $_) {
            Remove-Item -Recurse -Force $_ -ErrorAction SilentlyContinue
        }
    }

    Get-ChildItem -Path (Join-Path $ProjectRoot "node_modules") -Recurse -Directory -Filter ".cxx" -ErrorAction SilentlyContinue |
        ForEach-Object {
            Remove-Item -Recurse -Force $_.FullName -ErrorAction SilentlyContinue
        }
}

function Set-GradleProperty([string]$GradlePropsPath, [string]$Name, [string]$Value) {
    if (-not (Test-Path $GradlePropsPath)) { return }
    $props = Get-Content $GradlePropsPath -Raw
    if ($props -match ([regex]::Escape($Name) + '\s*=')) {
        $props = $props -replace ([regex]::Escape($Name) + '\s*=\s*\S+'), "$Name=$Value"
    } else {
        $props = $props.TrimEnd() + "`r`n$Name=$Value`r`n"
    }
    Set-Content -Path $GradlePropsPath -Value $props -NoNewline
}

function Set-FrameProcessorsEnabled([string]$GradlePropsPath, [bool]$Enabled) {
    $value = if ($Enabled) { 'true' } else { 'false' }
    Set-GradleProperty $GradlePropsPath 'VisionCamera_enableFrameProcessors' $value
    Write-Host "VisionCamera_enableFrameProcessors=$value" -ForegroundColor Cyan
}

function Set-ReleasePackagingForDevices([string]$GradlePropsPath) {
    # Extract .so at install time — avoids 16 KB page alignment crashes on Android 15+ / Pixel 9+.
    Set-GradleProperty $GradlePropsPath 'expo.useLegacyPackaging' 'true'
    Write-Host "expo.useLegacyPackaging=true (16 KB page / sideload compatibility)" -ForegroundColor Cyan
}

function Test-ReleaseBundleHasSupabase([string]$ApkPath) {
    $tmp = Join-Path ([System.IO.Path]::GetTempPath()) ("nn_apk_" + [guid]::NewGuid().ToString("n"))
    New-Item -ItemType Directory -Force -Path $tmp | Out-Null
    try {
        Push-Location $tmp
        jar xf $ApkPath assets/index.android.bundle 2>$null
        $bundle = Join-Path $tmp 'assets\index.android.bundle'
        if (-not (Test-Path $bundle)) {
            Write-Warning "Could not verify JS bundle in APK (assets/index.android.bundle missing)."
            return
        }
        $text = [System.IO.File]::ReadAllText($bundle)
        if ($text -notmatch 'https://[a-z0-9]+\.supabase\.co') {
            Write-Error "Release bundle is missing EXPO_PUBLIC_SUPABASE_URL. Rebuild after syncing .env to the build root."
        }
        Write-Host "Release bundle: Supabase URL embedded." -ForegroundColor DarkGray
    } finally {
        Pop-Location
        Remove-Item -Recurse -Force $tmp -ErrorAction SilentlyContinue
    }
}

function Resolve-JavaHome {
    if ($env:JAVA_HOME -and (Test-Path (Join-Path $env:JAVA_HOME 'bin\java.exe'))) {
        return $env:JAVA_HOME
    }
    foreach ($candidate in @(
            "${env:ProgramFiles}\Android\Android Studio\jbr",
            "${env:LOCALAPPDATA}\Programs\Android\Android Studio\jbr",
            "${env:ProgramFiles}\Java\jdk*",
            "${env:ProgramFiles}\Eclipse Adoptium\jdk*"
        )) {
        $resolved = @(Resolve-Path $candidate -ErrorAction SilentlyContinue)
        foreach ($path in $resolved) {
            if (Test-Path (Join-Path $path 'bin\java.exe')) {
                return $path.Path
            }
        }
    }
    return $null
}

function Resolve-AndroidSdk {
    if ($env:ANDROID_HOME -and (Test-Path $env:ANDROID_HOME)) {
        return $env:ANDROID_HOME
    }
    if ($env:ANDROID_SDK_ROOT -and (Test-Path $env:ANDROID_SDK_ROOT)) {
        return $env:ANDROID_SDK_ROOT
    }
    $defaultSdk = Join-Path $env:LOCALAPPDATA 'Android\Sdk'
    if (Test-Path $defaultSdk) {
        return $defaultSdk
    }
    return $null
}

function Ensure-AndroidLocalProperties([string]$ProjectRoot) {
    $sdk = Resolve-AndroidSdk
    if (-not $sdk) {
        Write-Error "Android SDK not found. Install Android Studio or set ANDROID_HOME."
    }
    $env:ANDROID_HOME = $sdk
    $env:ANDROID_SDK_ROOT = $sdk
    $sdkDir = $sdk -replace '\\', '/'
    $localProps = Join-Path $ProjectRoot 'android\local.properties'
    "sdk.dir=$sdkDir" | Set-Content -Encoding utf8 $localProps
    Write-Host "ANDROID_HOME=$sdk" -ForegroundColor DarkGray
}

function Invoke-FriendsApkGradle([string]$ProjectRoot, [bool]$FrameProcessorsEnabled, [switch]$ForceJsRebundle) {
    $javaHome = Resolve-JavaHome
    if (-not $javaHome) {
        Write-Error "JAVA_HOME is not set and no JDK was found. Install Android Studio or set JAVA_HOME."
    }
    $env:JAVA_HOME = $javaHome
    $env:Path = (Join-Path $javaHome 'bin') + ';' + $env:Path
    Write-Host "JAVA_HOME=$javaHome" -ForegroundColor DarkGray

    $gradleProps = Join-Path $ProjectRoot "android\gradle.properties"
    Set-FrameProcessorsEnabled $gradleProps $FrameProcessorsEnabled
    Set-ReleasePackagingForDevices $gradleProps

    if ($FrameProcessorsEnabled) {
        Clear-NativeCxxCaches $ProjectRoot
        Remove-Item Env:FRIENDS_APK_DISABLE_RESIZE_PLUGIN -ErrorAction SilentlyContinue
    } else {
        $env:FRIENDS_APK_DISABLE_RESIZE_PLUGIN = '1'
    }

    $env:CMAKE_BUILD_PARALLEL_LEVEL = '1'
    $env:NODE_ENV = 'production'
    $shortGradleHome = if ($env:GRADLE_USER_HOME) { $env:GRADLE_USER_HOME } else { 'C:\dev\gradle-home' }
    New-Item -ItemType Directory -Force -Path $shortGradleHome | Out-Null
    $env:GRADLE_USER_HOME = $shortGradleHome
    Write-Host "GRADLE_USER_HOME=$shortGradleHome" -ForegroundColor DarkGray

    $androidDir = Join-Path $ProjectRoot "android"
    $gradlew = Join-Path $androidDir "gradlew.bat"
    if (-not (Test-Path $gradlew)) {
        Push-Location $ProjectRoot
        try {
            Write-Host "Generating android/ (expo prebuild)..." -ForegroundColor Yellow
            npx expo prebuild --platform android --no-install
            if ($LASTEXITCODE -ne 0) { return $LASTEXITCODE }
        } finally {
            Pop-Location
        }
    }

    Ensure-AndroidLocalProperties $ProjectRoot

    if ($ForceJsRebundle) {
        $env:EXPO_PUBLIC_SLIM_APK = '1'
        Write-Host "Rebundling JS (EXPO_PUBLIC_SLIM_APK=1, preview_models only)..." -ForegroundColor Cyan
        Push-Location $androidDir
        try {
            & $gradlew :app:createBundleReleaseJsAndAssets --rerun-tasks --no-daemon
            if ($LASTEXITCODE -ne 0) { return $LASTEXITCODE }
        } finally {
            Pop-Location
        }
    }

    Push-Location $androidDir
    try {
        # Physical phones: arm64 only on Windows (dual-arch often fails after .cxx clean).
        & $gradlew assembleRelease -x lint --no-daemon --no-parallel '-PreactNativeArchitectures=arm64-v8a'
        if ($null -eq $LASTEXITCODE) { return 0 }
        return $LASTEXITCODE
    } finally {
        Pop-Location
    }
}

Set-Location $Root
$EnvFile = Join-Path $Root ".env"

if (-not (Test-Path $EnvFile)) {
    Write-Error "Missing .env - copy .env.example to .env and fill in values."
}

$required = @('EXPO_PUBLIC_SUPABASE_URL', 'EXPO_PUBLIC_SUPABASE_ANON_KEY')
$missing = @($required | Where-Object { -not (Test-EnvVar $_ $EnvFile) })
if ($missing.Count -gt 0) {
    Write-Error ("Missing or empty in .env: " + ($missing -join ', '))
}

if ($PreviewModelsOnly) {
    Set-EnvVar 'EXPO_PUBLIC_SLIM_APK' '1' $EnvFile
    Write-Host "EXPO_PUBLIC_SLIM_APK=1 (bundle preview_models TFLite only)" -ForegroundColor Yellow
} else {
    Set-EnvVar 'EXPO_PUBLIC_SLIM_APK' '0' $EnvFile
}

$wantPreview = -not $SkipLivePreview
$resolved = Resolve-PreviewBuildRoot -SourceRoot $Root -RequireNoSpaces:$wantPreview
$BuildRoot = $resolved.BuildRoot
$UsedMirror = $resolved.UsedMirror

if ($UsedMirror) {
    Write-Host "Using preview build root (no spaces): $BuildRoot" -ForegroundColor Cyan
}

Copy-Item -Force $EnvFile (Join-Path $BuildRoot '.env')

if (-not $wantPreview) {
    Write-Host "Building release APK (arm phones, live preview OFF)..." -ForegroundColor Yellow
    $exitCode = Invoke-FriendsApkGradle $BuildRoot $false $PreviewModelsOnly
    $livePreviewInApk = $false
} else {
    Write-Host "Building release APK (arm phones, live preview ON)..." -ForegroundColor Cyan
    $exitCode = Invoke-FriendsApkGradle $BuildRoot $true $PreviewModelsOnly
    $livePreviewInApk = ($exitCode -eq 0)
}

if ($exitCode -ne 0) {
    Write-Host ""
    Write-Host "Build failed." -ForegroundColor Red
    if ($wantPreview -and ($UsedMirror -or (Test-PathHasSpaces $Root) -or (Test-PathTooLongForNativeBuild $Root))) {
        if (-not $UsedMirror) {
            Write-Host "  Run: npm run setup:preview-build-root" -ForegroundColor Yellow
        }
    }
    if ($wantPreview) {
        Write-Host "  Or build on Linux: eas build --platform android" -ForegroundColor Yellow
    }
    exit $exitCode
}

if ($wantPreview -and -not $livePreviewInApk) {
    Write-Error "Gradle succeeded but live preview was not enabled."
}

$apk = Join-Path $BuildRoot "android\app\build\outputs\apk\release\app-release.apk"
if (-not (Test-Path $apk)) {
    Write-Error "APK not found at $apk"
}

$outDir = Join-Path $Root "dist"
New-Item -ItemType Directory -Force -Path $outDir | Out-Null
$apkName = if ($PreviewModelsOnly) { 'near_nature-preview.apk' } else { 'near_nature-friends.apk' }
$dest = Join-Path $outDir $apkName
Copy-Item -Force $apk $dest
Test-ReleaseBundleHasSupabase $dest

Write-Host ""
Write-Host "Done." -ForegroundColor Green
Write-Host "  APK: $dest"
Write-Host "  Size: $([math]::Round((Get-Item $dest).Length / 1MB, 1)) MB"
if ($livePreviewInApk) {
    Write-Host "  Live camera AI: ON" -ForegroundColor Green
} else {
    Write-Host "  Live camera AI: OFF" -ForegroundColor Yellow
}
if ($PreviewModelsOnly) {
    Write-Host "  Bundled TFLite: preview_models only (specialists download per region)" -ForegroundColor Green
}
if ($UsedMirror) {
    Write-Host "  Built from: $BuildRoot" -ForegroundColor DarkGray
}
Write-Host ""
Write-Host "Supabase setup for friends:" -ForegroundColor Yellow
Write-Host "  1. .\scripts\beta-production-setup.ps1  (SQL order)"
Write-Host "  2. .\scripts\deploy-identify-species.ps1"
Write-Host "  3. Do not put EXPO_PUBLIC_GEMINI_API_KEY in .env for friends builds"
Write-Host ""
Write-Host "Friends: copy APK to a physical Android phone (ARM). It will not run on x86 PC emulators." -ForegroundColor Cyan
