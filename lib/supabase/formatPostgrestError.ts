import { mapSupabaseAuthErrorMessage } from '@/lib/auth/mapSupabaseAuthError';

type PostgrestLikeError = {
  message?: string;
  details?: string;
  hint?: string;
  code?: string;
};

/** User-facing copy for Supabase PostgREST / RPC failures. */
export function formatPostgrestError(error: unknown, fallback: string): string {
  if (!error || typeof error !== 'object') {
    return fallback;
  }

  const e = error as PostgrestLikeError;
  const code = e.code ?? '';
  const message = (e.message ?? '').toLowerCase();

  if (code === 'PGRST116' || message.includes('0 rows')) {
    return 'No profile row found for your account. Sign out and sign in again.';
  }

  if (code === '42501' || message.includes('row-level security') || message.includes('permission denied')) {
    if (message.includes('update_own_user_profile')) {
      return (
        'Profile save is blocked on the server. In Supabase → SQL Editor, run sql/update_own_user_profile.sql, reload the schema cache, then try again.'
      );
    }
    return 'Could not save profile (permission denied). Sign out and sign in again.';
  }

  if (message.includes('not authenticated') || message.includes('jwt')) {
    return 'Session expired. Sign out and sign in again.';
  }

  const combined = [e.message, e.details, e.hint]
    .filter((part): part is string => typeof part === 'string' && part.trim().length > 0)
    .join(' ');

  if (combined.length > 0) {
    return mapSupabaseAuthErrorMessage(combined);
  }

  return fallback;
}
