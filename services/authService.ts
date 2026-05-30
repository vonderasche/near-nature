import * as Linking from 'expo-linking';
import * as WebBrowser from 'expo-web-browser';

import { completeSupabaseAuthSessionFromUrl } from '@/lib/auth/completeSupabaseAuthSessionFromUrl';
import { signInWithEmail } from '@/lib/auth/email-auth';
import { clearLocalUserDataOnSignOut } from '@/lib/db/clearLocalUserDataOnSignOut';
import { supabase } from '@/lib/supabase';

/** Add this URL (and your dev `exp://` variant) under Supabase Auth → URL configuration → Redirect URLs. */
export function getPasswordRecoveryRedirectUrl(): string {
  return Linking.createURL('/reset-password');
}

/** Add this URL under Supabase Auth -> URL configuration -> Redirect URLs. */
export function getOAuthRedirectUrl(): string {
  return Linking.createURL('/auth/callback');
}

export async function signUp(email: string, password: string, fullName: string) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { full_name: fullName } },
  });
  if (error) throw error;
  return data;
}

/** Email or `public.users.username` (same resolution as login screen). */
export async function signIn(emailOrUsername: string, password: string) {
  const result = await signInWithEmail(emailOrUsername, password);
  if (!result.ok) {
    throw new Error(result.message);
  }
}

export async function signInWithGoogle() {
  const redirectTo = getOAuthRedirectUrl();
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo,
      skipBrowserRedirect: true,
    },
  });

  if (error) throw error;
  if (!data.url) throw new Error('Could not start Google sign-in.');

  const result = await WebBrowser.openAuthSessionAsync(data.url, redirectTo);
  if (result.type !== 'success') {
    throw new Error('Google sign-in was cancelled.');
  }

  const completed = await completeSupabaseAuthSessionFromUrl(result.url);
  if (completed.error) throw completed.error;
  if (!completed.data.session) {
    throw new Error('Google sign-in did not return a session.');
  }
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  await clearLocalUserDataOnSignOut();
  if (error) throw error;
}

/**
 * Clears the local session without revoking refresh tokens on the server.
 * Use after the auth user was removed server-side (e.g. delete-account Edge Function),
 * where a global sign-out can fail with "session missing".
 */
export async function signOutLocalOnly(): Promise<void> {
  await supabase.auth.signOut({ scope: 'local' });
  await clearLocalUserDataOnSignOut();
}

export async function sendPasswordReset(email: string) {
  const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
    redirectTo: getPasswordRecoveryRedirectUrl(),
  });
  if (error) throw error;
}

export async function updatePassword(newPassword: string) {
  const { error } = await supabase.auth.updateUser({ password: newPassword });
  if (error) throw error;
}

export async function getSession() {
  const { data, error } = await supabase.auth.getSession();
  if (error) throw error;
  return data.session;
}
