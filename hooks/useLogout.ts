import { useCallback, useState } from 'react';
import { Alert } from 'react-native';

import { useAuth } from '@/hooks/useAuth';

export type UseLogoutResult = {
  /** Calls {@link useAuth} `logout` and surfaces failures in an alert. */
  logout: () => Promise<void>;
  busy: boolean;
};

/**
 * Sign-out action with loading state and a single error alert on failure.
 */
export function useLogout(): UseLogoutResult {
  const { logout: signOut } = useAuth();
  const [busy, setBusy] = useState(false);

  const logout = useCallback(async () => {
    setBusy(true);
    try {
      await signOut();
    } catch (err: unknown) {
      Alert.alert('Log out', err instanceof Error ? err.message : 'Something went wrong.');
    } finally {
      setBusy(false);
    }
  }, [signOut]);

  return { logout, busy };
}
