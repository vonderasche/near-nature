import { useEffect, useState } from 'react';

import { normalizeUsStateCode } from '@/constants/us-states';
import { useAuthContext } from '@/context/AuthContext';
import { DEFAULT_USER_STATE } from '@/hooks/useIdentificationRouteParams';
import { getUser } from '@/services/userService';

export type UserHomeState = {
  /** Two-letter code used for iNaturalist / explore queries (defaults when unset). */
  stateCode: string;
  /** True when `public.users.state` is set on the profile. */
  hasHomeState: boolean;
  loading: boolean;
};

/**
 * Loads the signed-in user's `public.users.state` for native-species lookups.
 */
export function useUserHomeState(): UserHomeState {
  const { userId } = useAuthContext();
  const [stateCode, setStateCode] = useState(DEFAULT_USER_STATE);
  const [hasHomeState, setHasHomeState] = useState(false);
  const [loading, setLoading] = useState(Boolean(userId));

  useEffect(() => {
    if (!userId) {
      setStateCode(DEFAULT_USER_STATE);
      setHasHomeState(false);
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    void (async () => {
      try {
        const user = await getUser(userId);
        const fromProfile = normalizeUsStateCode(user?.state);
        if (!cancelled) {
          setHasHomeState(Boolean(fromProfile));
          setStateCode(fromProfile ?? DEFAULT_USER_STATE);
        }
      } catch {
        if (!cancelled) {
          setHasHomeState(false);
          setStateCode(DEFAULT_USER_STATE);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [userId]);

  return { stateCode, hasHomeState, loading };
}
