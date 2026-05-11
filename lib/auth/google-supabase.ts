import type { AuthSessionResult } from 'expo-auth-session';

import { supabase } from '@/lib/supabase';

export type GoogleSupabaseResult = { ok: true } | { ok: false; message: string };

/**
 * Completes Supabase auth using the ID token from expo-auth-session (Google provider).
 * Pass `access_token` when present; some ID tokens include `at_hash` and require it.
 */
export async function signInWithGoogleAuthResult(
  result: AuthSessionResult
): Promise<GoogleSupabaseResult> {
  if (result.type !== 'success') {
    return { ok: false, message: 'Sign-in was cancelled.' };
  }

  const idToken = result.params.id_token;
  if (!idToken) {
    return {
      ok: false,
      message:
        'Missing Google ID token. In Supabase Dashboard, enable the Google provider and ensure your Google OAuth client matches the platform (web / iOS / Android).',
    };
  }

  const access_token = result.params.access_token;

  const { error } = await supabase.auth.signInWithIdToken({
    provider: 'google',
    token: idToken,
    ...(access_token ? { access_token } : {}),
  });

  if (error) {
    return { ok: false, message: error.message };
  }
  return { ok: true };
}
