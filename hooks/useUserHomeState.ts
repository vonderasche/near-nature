import { useEffect, useState } from 'react';

import { normalizeUsStateCode } from '@/constants/us-states';
import { useAuthContext } from '@/context/AuthContext';
import { DEFAULT_USER_STATE } from '@/hooks/useIdentificationRouteParams';
import { getUser } from '@/services/userService';

/**
 * Loads the signed-in user's `public.users.state` for native-species lookups.
 */
export function useUserHomeState(): string {
  const { userId } = useAuthContext();
  const [stateCode, setStateCode] = useState(DEFAULT_USER_STATE);

  useEffect(() => {
    if (!userId) {
      setStateCode(DEFAULT_USER_STATE);
      return;
    }
    let cancelled = false;
    void (async () => {
      try {
        const user = await getUser(userId);
        const fromProfile = normalizeUsStateCode(user?.state);
        if (!cancelled) {
          setStateCode(fromProfile ?? DEFAULT_USER_STATE);
        }
      } catch {
        if (!cancelled) setStateCode(DEFAULT_USER_STATE);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [userId]);

  return stateCode;
}
