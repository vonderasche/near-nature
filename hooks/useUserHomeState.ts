import { useLayoutEffect, useState } from 'react';

import { DEFAULT_USER_STATE } from '@/constants/user-defaults';
import { normalizeUsStateCode } from '@/constants/us-states';
import { useAuthContext } from '@/context/AuthContext';
import { loadCachedOwnProfile } from '@/lib/profile/ownProfileCache';
import { getUser } from '@/services/userService';

export type UserHomeState = {
  /**
   * Two-letter US state for native-species identification.
   * Empty while `loading` is true for a signed-in user (no cache and network not finished yet).
   */
  stateCode: string;
  /** True when `public.users.state` is set on the profile. */
  hasHomeState: boolean;
  loading: boolean;
};

type ProfileRow = { code: string; hasHome: boolean };

function profileFromUserState(raw: string | null | undefined): ProfileRow {
  const fromProfile = normalizeUsStateCode(raw);
  return {
    hasHome: Boolean(fromProfile),
    code: fromProfile ?? DEFAULT_USER_STATE,
  };
}

/**
 * Loads the signed-in user's `public.users.state` for native-species lookups.
 * Seeds from {@link loadCachedOwnProfile} (same device cache as the Profile tab) so home state is
 * available immediately after a prior session, then refreshes from Supabase.
 */
export function useUserHomeState(): UserHomeState {
  const { userId } = useAuthContext();
  const [profile, setProfile] = useState<ProfileRow | null>(null);

  useLayoutEffect(() => {
    if (!userId) {
      setProfile({ code: DEFAULT_USER_STATE, hasHome: false });
      return;
    }
    setProfile(null);
    let cancelled = false;
    void (async () => {
      let servedFromCache = false;
      try {
        const cached = await loadCachedOwnProfile(userId);
        if (cancelled) return;
        if (cached?.user) {
          servedFromCache = true;
          setProfile(profileFromUserState(cached.user.state));
        }

        const user = await getUser(userId);
        if (cancelled) return;
        if (user) {
          setProfile(profileFromUserState(user.state));
        } else if (!servedFromCache) {
          setProfile({ code: DEFAULT_USER_STATE, hasHome: false });
        }
      } catch {
        if (!cancelled && !servedFromCache) {
          setProfile({ code: DEFAULT_USER_STATE, hasHome: false });
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [userId]);

  const loading = Boolean(userId) && profile === null;
  const stateCode = !userId ? (profile?.code ?? DEFAULT_USER_STATE) : (profile?.code ?? '');
  const hasHomeState = profile?.hasHome ?? false;

  return { stateCode, hasHomeState, loading };
}
