import { Platform } from 'react-native';
import {
  GoogleSignin,
  isCancelledResponse,
  isErrorWithCode,
  statusCodes,
} from '@react-native-google-signin/google-signin';

import type { GoogleAuthEnv } from '@/lib/auth/google-config';
import { readGoogleAuthEnv } from '@/lib/auth/google-config';
import type { GoogleSupabaseResult } from '@/lib/auth/google-supabase';
import { signInWithGoogleTokens } from '@/lib/auth/google-supabase';

let nativeConfigureFingerprint: string | null = null;

function fingerprintFor(env: GoogleAuthEnv): string {
  const web = env.webClientId ?? '';
  const ios = env.iosClientId ?? '';
  return `${Platform.OS}|${web}|${ios}`;
}

function preconditionErrors(env: GoogleAuthEnv): GoogleSupabaseResult | null {
  if (!env.webClientId) {
    return {
      ok: false,
      message:
        'Add EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID (OAuth Web client ID — same as Supabase Dashboard → Authentication → Providers → Google) to `.env`, then restart Expo or rebuild your APK.',
    };
  }

  if (Platform.OS === 'ios' && !env.iosClientId) {
    return {
      ok: false,
      message:
        'On iOS, add EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID from Google Cloud OAuth “iOS” client, then rebuild the native app.',
    };
  }

  return null;
}

export function ensureGoogleNativeConfigured(env: GoogleAuthEnv = readGoogleAuthEnv()): GoogleSupabaseResult | null {
  const pre = preconditionErrors(env);
  if (pre) return pre;

  const fp = fingerprintFor(env);
  if (nativeConfigureFingerprint === fp) return null;

  GoogleSignin.configure({
    webClientId: env.webClientId!,
    ...(Platform.OS === 'ios' && env.iosClientId ? { iosClientId: env.iosClientId } : {}),
    scopes: ['profile', 'email'],
  });

  nativeConfigureFingerprint = fp;
  return null;
}

/**
 * Native Google Sign-In → Supabase `signInWithIdToken`. Supports Android/iOS builds only.
 */
export async function signInWithGoogleNative(): Promise<GoogleSupabaseResult> {
  if (Platform.OS === 'web') {
    return {
      ok: false,
      message: 'Google sign-in runs in the iOS/Android build. Install the dev client or APK, or use Expo Go.',
    };
  }

  const env = readGoogleAuthEnv();
  const blocked = ensureGoogleNativeConfigured(env);
  if (blocked && !blocked.ok) return blocked;

  try {
    if (Platform.OS === 'android') {
      await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
    }

    const response = await GoogleSignin.signIn();
    if (isCancelledResponse(response)) {
      return { ok: false, message: 'Sign-in was cancelled.' };
    }
    if (response.type !== 'success') {
      return { ok: false, message: 'Google sign-in did not finish. Try again.' };
    }

    let idToken = response.data.idToken;
    const tokens = await GoogleSignin.getTokens().catch(() => null);
    if (tokens?.idToken) idToken = tokens.idToken;

    const accessToken = tokens?.accessToken;

    if (!idToken) {
      return {
        ok: false,
        message:
          'Google did not return an ID token. Verify EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID and OAuth consent + clients in Google Cloud.',
      };
    }

    return signInWithGoogleTokens({ idToken, accessToken });
  } catch (e: unknown) {
    if (isErrorWithCode(e) && e.code === statusCodes.SIGN_IN_CANCELLED) {
      return { ok: false, message: 'Sign-in was cancelled.' };
    }
    const msg = e instanceof Error && e.message ? e.message : 'Google sign-in failed.';
    return { ok: false, message: msg };
  }
}
