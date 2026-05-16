import { mapSupabaseAuthErrorMessage } from '@/lib/auth/mapSupabaseAuthError';
import { supabase } from '@/lib/supabase';

export type GoogleSupabaseResult = { ok: true } | { ok: false; message: string };

/**
 * Signs into Supabase with a Google OAuth ID token (native Google Sign-In or other flows).
 * Pass access_token when the provider returns one; some setups require both.
 */
export async function signInWithGoogleTokens(input: {
  idToken: string;
  accessToken?: string | null;
}): Promise<GoogleSupabaseResult> {
  const idToken = input.idToken.trim();
  if (!idToken) {
    return {
      ok: false,
      message:
        'Missing Google ID token. Confirm EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID (Web OAuth client) is set and matches Supabase → Auth → Google.',
    };
  }

  const accessToken = input.accessToken?.trim();

  const { error } = await supabase.auth.signInWithIdToken({
    provider: 'google',
    token: idToken,
    ...(accessToken ? { access_token: accessToken } : {}),
  });

  if (error) {
    return { ok: false, message: mapSupabaseAuthErrorMessage(error.message) };
  }
  return { ok: true };
}
