# Release APK with live camera preview models only (no bundled specialist / MobileViT weights).
# Usage: npm run android:preview-apk
& (Join-Path $PSScriptRoot "build-friends-apk.ps1") -PreviewModelsOnly
