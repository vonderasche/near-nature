import Constants from 'expo-constants';
import * as Linking from 'expo-linking';

/** Deep link Supabase redirects to after Google OAuth (add to Auth → URL configuration). */
export function getOAuthRedirectUrl(): string {
  return Linking.createURL('/auth/callback');
}

/** Password reset emails (add to Auth → URL configuration). */
export function getPasswordRecoveryRedirectUrl(): string {
  return Linking.createURL('/reset-password');
}

/**
 * Every redirect URL to allowlist in Supabase Dashboard → Authentication → URL configuration.
 * Include all rows when setting up Google on hosted Supabase.
 */
export function listAuthRedirectUrlsForSupabase(): string[] {
  const urls = new Set<string>([getOAuthRedirectUrl(), getPasswordRecoveryRedirectUrl()]);

  if (__DEV__) {
    const hostUri = Constants.expoConfig?.hostUri;
    if (hostUri) {
      urls.add(`exp://${hostUri}/--/auth/callback`);
      urls.add(`exp://${hostUri}/--/reset-password`);
    }
  }

  return [...urls];
}
