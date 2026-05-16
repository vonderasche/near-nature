import { Platform } from 'react-native';

import { isGoogleAuthConfigured } from '@/lib/auth/google-config';

/**
 * Clears the native Google account picker session so the next sign-in can choose another account.
 */
export async function signOutGoogleNative(): Promise<void> {
  if (Platform.OS === 'web' || !isGoogleAuthConfigured()) return;

  try {
    const { GoogleSignin } = await import('@react-native-google-signin/google-signin');
    await GoogleSignin.signOut();
  } catch {
    // Best-effort; Supabase session is still cleared separately.
  }
}
