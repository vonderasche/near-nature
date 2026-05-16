import { Platform } from 'react-native';

function trimEnv(value: string | undefined): string | undefined {
  const t = value?.trim();
  return t && t.length > 0 ? t : undefined;
}

export type GoogleAuthEnv = {
  webClientId?: string;
  iosClientId?: string;
  androidClientId?: string;
};

export function readGoogleAuthEnv(): GoogleAuthEnv {
  return {
    webClientId: trimEnv(process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID),
    iosClientId: trimEnv(process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID),
    androidClientId: trimEnv(process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID),
  };
}

/** True when native Google Sign-In can run (needs Web client ID everywhere; iOS also needs iosClientId unless you rely on plist setup outside env). */
export function isGoogleAuthConfigured(env: GoogleAuthEnv = readGoogleAuthEnv()): boolean {
  if (Platform.OS === 'web') return false;
  if (!env.webClientId) return false;
  if (Platform.OS === 'ios' && !env.iosClientId) return false;
  return true;
}
