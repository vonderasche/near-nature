import { useCallback, useState } from 'react';

import { useAuth } from '@/hooks/useAuth';

export type UseLogoutResult = {
  /** Calls {@link useAuth} `logout`; failures set {@link UseLogoutResult.logoutError}. */
  logout: () => Promise<void>;
  busy: boolean;
  logoutError: string | null;
  clearLogoutError: () => void;
};

/**
 * Sign-out action with loading state; failures are returned for a themed dialog (not native `Alert`).
 */
export function useLogout(): UseLogoutResult {
  const { logout: signOut } = useAuth();
  const [busy, setBusy] = useState(false);
  const [logoutError, setLogoutError] = useState<string | null>(null);

  const clearLogoutError = useCallback(() => {
    setLogoutError(null);
  }, []);

  const logout = useCallback(async () => {
    setBusy(true);
    setLogoutError(null);
    try {
      await signOut();
    } catch (err: unknown) {
      setLogoutError(err instanceof Error ? err.message : 'Something went wrong.');
    } finally {
      setBusy(false);
    }
  }, [signOut]);

  return { logout, busy, logoutError, clearLogoutError };
}
