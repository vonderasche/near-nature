import * as WebBrowser from 'expo-web-browser';

import { completeSupabaseAuthSessionFromUrl } from '@/lib/auth/completeSupabaseAuthSessionFromUrl';
import { signInWithEmail } from '@/lib/auth/email-auth';
import { mapSupabaseAuthErrorMessage } from '@/lib/auth/mapSupabaseAuthError';
import {
  getOAuthRedirectUrl,
  getPasswordRecoveryRedirectUrl,
  listAuthRedirectUrlsForSupabase,
} from '@/lib/auth/oauthRedirect';
import { parseOAuthCallbackError } from '@/lib/auth/parseOAuthCallbackError';
import { clearLocalUserDataOnSignOut } from '@/lib/db/clearLocalUserDataOnSignOut';
import { devLog } from '@/lib/devLog';
import { supabase } from '@/lib/supabase';
import { ensurePublicUserProfile } from '@/services/userService';

export { getOAuthRedirectUrl, getPasswordRecoveryRedirectUrl, listAuthRedirectUrlsForSupabase };

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
  devLog('[auth] Google OAuth redirectTo', redirectTo);

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo,
      skipBrowserRedirect: true,
      queryParams: { prompt: 'select_account' },
    },
  });

  if (error) {
    throw new Error(mapSupabaseAuthErrorMessage(error.message));
  }
  if (!data.url) throw new Error('Could not start Google sign-in.');

  const result = await WebBrowser.openAuthSessionAsync(data.url, redirectTo);
  if (result.type === 'cancel' || result.type === 'dismiss') {
    throw new Error('Google sign-in was cancelled.');
  }
  if (result.type !== 'success') {
    throw new Error('Google sign-in did not complete. Try again.');
  }

  const oauthError = parseOAuthCallbackError(result.url);
  if (oauthError) {
    throw new Error(oauthError);
  }

  const completed = await completeSupabaseAuthSessionFromUrl(result.url);
  if (completed.error) {
    throw new Error(mapSupabaseAuthErrorMessage(completed.error.message));
  }
  if (!completed.data.session) {
    throw new Error('Google sign-in did not return a session.');
  }

  try {
    await ensurePublicUserProfile();
  } catch (profileError) {
    devLog('[auth] ensurePublicUserProfile after Google sign-in', profileError);
  }
}

export async function signOut(): Promise<void> {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) {
      devLog('[auth] global signOut failed, clearing local session', error.message);
      await supabase.auth.signOut({ scope: 'local' });
    }
  } catch (err: unknown) {
    devLog('[auth] signOut threw, clearing local session', err);
    try {
      await supabase.auth.signOut({ scope: 'local' });
    } catch (localErr: unknown) {
      devLog('[auth] local signOut failed', localErr);
    }
  }

  try {
    await clearLocalUserDataOnSignOut();
  } catch (err: unknown) {
    devLog('[auth] clearLocalUserDataOnSignOut failed', err);
  }
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
