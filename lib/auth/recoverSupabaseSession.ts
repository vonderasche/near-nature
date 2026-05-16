import type { Session } from '@supabase/supabase-js';

import { supabase } from '@/lib/supabase';
import { looksLikeStaleStoredRefresh } from '@/lib/auth/staleRefreshTokenError';

/**
 * Loads the persisted session and clears corrupt / revoked refresh tokens quietly.
 *
 * Typical causes:
 * - Supabase JWT secret rotated or project rebuilt
 * - User signed out elsewhere / revoked sessions
 * - `EXPO_PUBLIC_SUPABASE_URL` or anon key changed but AsyncStorage still has the old project's session
 *
 * Calls `refreshSession` only when the access token is missing or expires soon (~2 min buffer).
 */
export async function getSessionClearingStaleRefresh(): Promise<Session | null> {
  const {
    data: { session },
    error,
  } = await supabase.auth.getSession();

  if (error && looksLikeStaleStoredRefresh(error)) {
    await supabase.auth.signOut({ scope: 'local' });
    return null;
  }

  const current = session ?? null;
  if (!current?.refresh_token) {
    return current;
  }

  const expSec = current.expires_at ?? null;
  const expMs = typeof expSec === 'number' ? expSec * 1000 : 0;
  const needsRefreshProbe = !expMs || expMs <= Date.now() + 120_000;

  if (!needsRefreshProbe) {
    return current;
  }

  const { data, error: refreshErr } = await supabase.auth.refreshSession();
  if (!refreshErr) {
    return data.session ?? current;
  }

  if (looksLikeStaleStoredRefresh(refreshErr)) {
    await supabase.auth.signOut({ scope: 'local' });
    return null;
  }

  return current;
}
