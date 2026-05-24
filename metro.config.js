const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

config.resolver.assetExts = [...config.resolver.assetExts, 'tflite'];

// Transient native CMake output (e.g. react-native-skia) can appear/disappear during
// builds and crash Metro's file watcher on Windows (ENOENT).
const cxxBlock = /[\\/]android[\\/]\.cxx[\\/].*/;
const existing = config.resolver.blockList;
const blockList = [cxxBlock];
if (existing) {
  blockList.push(...(Array.isArray(existing) ? existing : [existing]));
}
config.resolver.blockList = blockList;

module.exports = config;
