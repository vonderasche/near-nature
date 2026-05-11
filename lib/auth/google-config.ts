import { Platform } from 'react-native';

export type GoogleAuthEnv = {
  webClientId?: string;
  iosClientId?: string;
  androidClientId?: string;
};

export function readGoogleAuthEnv(): GoogleAuthEnv {
  return {
    webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
    iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
    androidClientId: process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID,
  };
}

/** Client ID required by `expo-auth-session` for the current platform. */
export function getGoogleClientIdForPlatform(env: GoogleAuthEnv = readGoogleAuthEnv()): string | undefined {
  if (Platform.OS === 'ios') return env.iosClientId;
  if (Platform.OS === 'android') return env.androidClientId;
  return env.webClientId;
}

export function isGoogleAuthConfigured(env: GoogleAuthEnv = readGoogleAuthEnv()): boolean {
  return Boolean(getGoogleClientIdForPlatform(env));
}
