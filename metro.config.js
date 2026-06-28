const path = require('path');
const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Transient native CMake output (e.g. react-native-skia) can appear/disappear during
// builds and crash Metro's file watcher on Windows (ENOENT).
const cxxBlock = /[\\/]android[\\/]\.cxx[\\/].*/;
const existing = config.resolver.blockList;
const blockList = [cxxBlock];
if (existing) {
  blockList.push(...(Array.isArray(existing) ? existing : [existing]));
}
config.resolver.blockList = blockList;

if (!config.resolver.assetExts.includes('tflite')) {
  config.resolver.assetExts.push('tflite');
}

if (!config.resolver.assetExts.includes('csv')) {
  config.resolver.assetExts.push('csv');
}

// Release slim APK: only `assets/tflite/preview_models/**/*.tflite` in the bundle.
// Other .tflite requires resolve to scene_gate (capture routing stays buildable; weights load from Supabase at runtime).
if (process.env.EXPO_PUBLIC_SLIM_APK === '1') {
  const previewTfliteRoot = /assets[\\/]tflite[\\/]preview_models[\\/]/;
  const redirectTflite = path.resolve(
    __dirname,
    'assets/tflite/preview_models/scene_gate/tflite/scene_gate.tflite',
  );
  const previousResolveRequest = config.resolver.resolveRequest;
  config.resolver.resolveRequest = (context, moduleName, platform) => {
    const normalized =
      typeof moduleName === 'string' ? moduleName.replace(/\\/g, '/') : moduleName;
    if (
      typeof normalized === 'string' &&
      normalized.endsWith('.tflite') &&
      !previewTfliteRoot.test(normalized)
    ) {
      return context.resolveRequest(context, redirectTflite, platform);
    }
    if (previousResolveRequest) {
      return previousResolveRequest(context, moduleName, platform);
    }
    return context.resolveRequest(context, moduleName, platform);
  };
}

module.exports = config;
