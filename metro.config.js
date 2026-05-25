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

module.exports = config;
