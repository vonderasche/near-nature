import { Platform } from 'react-native';

/** Near Nature v3 TFLite cascade (scene gate → kingdom → plant router → specialists). */
export function isV3CascadeEnabled(): boolean {
  if (Platform.OS !== 'ios' && Platform.OS !== 'android') {
    return false;
  }

  const raw = process.env.EXPO_PUBLIC_V3_CASCADE?.trim().toLowerCase();
  if (raw === '0' || raw === 'false' || raw === 'off') {
    return false;
  }

  return true;
}
