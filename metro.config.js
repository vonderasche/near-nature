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

// Release slim APK: bundle v14 live preview only; v16 capture downloads from Supabase.
if (process.env.EXPO_PUBLIC_SLIM_APK === '1') {
  const bundledTfliteRoot = /assets[\\/]tflite[\\/]preview_models[\\/]v14[\\/]/;
  const redirectTflite = path.resolve(
    __dirname,
    'assets/tflite/preview_models/v14/tflite/v14.tflite',
  );
  const previousResolveRequest = config.resolver.resolveRequest;
  config.resolver.resolveRequest = (context, moduleName, platform) => {
    const normalized =
      typeof moduleName === 'string' ? moduleName.replace(/\\/g, '/') : moduleName;
    if (
      typeof normalized === 'string' &&
      normalized.endsWith('.tflite') &&
      !bundledTfliteRoot.test(normalized)
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
