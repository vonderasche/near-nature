import { signOutLocalOnly } from '@/services/authService';
import { supabase } from '@/lib/supabase';

import { looksLikeStaleStoredRefresh } from '@/lib/auth/staleRefreshTokenError';

/** JWT is stored locally but auth.users row is gone (SQL delete, wrong project, etc.). */
export function looksLikeMissingAuthUser(error: unknown): boolean {
  const msg =
    typeof error === 'object' &&
    error !== null &&
    'message' in error &&
    typeof (error as { message: unknown }).message === 'string'
      ? (error as { message: string }).message.toLowerCase()
      : '';
  if (!msg) return false;
  return (
    msg.includes('user from sub claim') ||
    msg.includes('user not found') ||
    msg.includes('invalid claim') ||
    msg.includes('session_not_found') ||
    msg.includes('does not exist')
  );
}

/**
 * Confirms the session against the server. Clears a stale local session when the auth user
 * no longer exists or tokens are invalid.
 */
export async function clearOrphanAuthSession(): Promise<boolean> {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (!error && user) {
    return false;
  }

  if (error && !looksLikeStaleStoredRefresh(error) && !looksLikeMissingAuthUser(error)) {
    return false;
  }

  await signOutLocalOnly();
  return true;
}
