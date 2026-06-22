import { Platform } from 'react-native';

/** MVP live preview: scene gate and kingdom models (capture uses legacy MobileViT routing). */
export function isMvpPreviewEnabled(): boolean {
  if (Platform.OS !== 'ios' && Platform.OS !== 'android') {
    return false;
  }

  const mvpRaw = process.env.EXPO_PUBLIC_MVP_CAPTURE?.trim().toLowerCase();
  if (mvpRaw === '0' || mvpRaw === 'false' || mvpRaw === 'off') {
    return false;
  }

  const legacyV3Raw = process.env.EXPO_PUBLIC_V3_CASCADE?.trim().toLowerCase();
  if (legacyV3Raw === '0' || legacyV3Raw === 'false' || legacyV3Raw === 'off') {
    return false;
  }

  return true;
}

/** @deprecated Use {@link isMvpPreviewEnabled} — name kept for existing call sites. */
export function isMvpCaptureEnabled(): boolean {
  return isMvpPreviewEnabled();
}
