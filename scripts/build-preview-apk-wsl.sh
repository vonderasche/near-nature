#!/usr/bin/env bash
# Build near_nature preview APK inside WSL (avoids Windows 260-char path limits).
#
# Prerequisites (once):
#   wsl --install Ubuntu-24.04
#   # In Ubuntu: sudo apt update && sudo apt install -y nodejs npm openjdk-17-jdk
#   # Android Studio + SDK on Windows (default: %LOCALAPPDATA%\Android\Sdk)
#
# Usage (from Windows PowerShell):
#   wsl -d Ubuntu-24.04 bash /mnt/e/PROGRAMMING/Portfolio/NearNature/near_nature/scripts/build-preview-apk-wsl.sh
#
# Or from Ubuntu after cd to the repo:
#   bash scripts/build-preview-apk-wsl.sh

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SOURCE_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
BUILD_ROOT="${NEAR_NATURE_WSL_BUILD_ROOT:-$HOME/near_nature_build}"

# Re-use Windows Android SDK + JDK from WSL (no duplicate 10GB install).
WIN_USER="${WIN_USER:-$(cmd.exe /c 'echo %USERNAME%' 2>/dev/null | tr -d '\r')}"
ANDROID_HOME="${ANDROID_HOME:-/mnt/c/Users/${WIN_USER}/AppData/Local/Android/Sdk}"
JAVA_HOME="${JAVA_HOME:-/mnt/c/Program Files/Android/Android Studio/jbr}"

if [[ ! -d "$ANDROID_HOME" ]]; then
  echo "Android SDK not found at $ANDROID_HOME"
  echo "Install Android Studio on Windows or set ANDROID_HOME."
  exit 1
fi

if [[ ! -x "$JAVA_HOME/bin/java" ]]; then
  echo "JDK not found at $JAVA_HOME"
  echo "Install Android Studio on Windows or set JAVA_HOME."
  exit 1
fi

export ANDROID_HOME ANDROID_SDK_ROOT="$ANDROID_HOME" JAVA_HOME
export PATH="$JAVA_HOME/bin:$ANDROID_HOME/platform-tools:$PATH"
export GRADLE_USER_HOME="${GRADLE_USER_HOME:-$HOME/.gradle}"
export NODE_ENV=production
export EXPO_PUBLIC_SLIM_APK=1
export CMAKE_BUILD_PARALLEL_LEVEL="${CMAKE_BUILD_PARALLEL_LEVEL:-2}"

echo "=== Near Nature preview APK (WSL) ==="
echo "Source:  $SOURCE_ROOT"
echo "Build:   $BUILD_ROOT"
echo "ANDROID_HOME=$ANDROID_HOME"
echo "JAVA_HOME=$JAVA_HOME"
echo "GRADLE_USER_HOME=$GRADLE_USER_HOME"

mkdir -p "$BUILD_ROOT"
rsync -a --delete \
  --exclude node_modules \
  --exclude .git \
  --exclude dist \
  --exclude android \
  "$SOURCE_ROOT/" "$BUILD_ROOT/"

if [[ -f "$SOURCE_ROOT/.env" ]]; then
  cp "$SOURCE_ROOT/.env" "$BUILD_ROOT/.env"
fi

cd "$BUILD_ROOT"

if [[ ! -d node_modules ]] || [[ "$SOURCE_ROOT/package-lock.json" -nt node_modules ]]; then
  echo "npm ci…"
  npm ci
fi

if [[ ! -d android ]]; then
  echo "expo prebuild --platform android…"
  npx expo prebuild --platform android --no-install
fi

SDK_DIR="${ANDROID_HOME//\\//}"
echo "sdk.dir=$SDK_DIR" > android/local.properties

# Live preview ON (frame processors).
PROPS=android/gradle.properties
grep -q '^VisionCamera_enableFrameProcessors=' "$PROPS" \
  && sed -i 's/^VisionCamera_enableFrameProcessors=.*/VisionCamera_enableFrameProcessors=true/' "$PROPS" \
  || echo 'VisionCamera_enableFrameProcessors=true' >> "$PROPS"
grep -q '^expo.useLegacyPackaging=' "$PROPS" \
  && sed -i 's/^expo.useLegacyPackaging=.*/expo.useLegacyPackaging=true/' "$PROPS" \
  || echo 'expo.useLegacyPackaging=true' >> "$PROPS"

echo "Gradle assembleRelease (arm64)…"
cd android
./gradlew assembleRelease -x lint --no-daemon --no-parallel -PreactNativeArchitectures=arm64-v8a

APK="app/build/outputs/apk/release/app-release.apk"
if [[ ! -f "$APK" ]]; then
  echo "APK not found at $APK"
  exit 1
fi

mkdir -p "$SOURCE_ROOT/dist"
cp -f "$APK" "$SOURCE_ROOT/dist/near_nature-preview.apk"
SIZE_MB="$(du -m "$SOURCE_ROOT/dist/near_nature-preview.apk" | cut -f1)"
echo ""
echo "Done."
echo "  APK: $SOURCE_ROOT/dist/near_nature-preview.apk"
echo "  Size: ~${SIZE_MB} MB"
