import type { Session } from '@supabase/supabase-js';
import * as Linking from 'expo-linking';
import { createContext, type ReactNode, useCallback, useContext, useEffect, useMemo, useState } from 'react';

import { clearOrphanAuthSession } from '@/lib/auth/orphanAuthSession';
import { parseSupabaseAuthParamsFromUrl } from '@/lib/auth/parseAuthCallbackUrl';
import { getSessionClearingStaleRefresh } from '@/lib/auth/recoverSupabaseSession';
import { supabase } from '@/lib/supabase';
import { resolveUserProfile } from '@/services/userService';

type AuthContextType = {
  session: Session | null;
  userId: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isPasswordRecovery: boolean;
  clearPasswordRecovery: () => void;
  /** True once we are not waiting on a `public.users` existence check for this session. */
  profileGateResolved: boolean;
  /** Whether `public.users` has a row for `userId`. Meaningless when not authenticated (false). */
  hasProfile: boolean;
  /** Re-query `public.users` after backfill / trigger fixes (e.g. from needs-profile screen). */
  refreshProfile: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType>({
  session: null,
  userId: null,
  isAuthenticated: false,
  isLoading: true,
  isPasswordRecovery: false,
  clearPasswordRecovery: () => {},
  profileGateResolved: true,
  hasProfile: false,
  refreshProfile: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPasswordRecovery, setIsPasswordRecovery] = useState(false);
  const [profileGateResolved, setProfileGateResolved] = useState(true);
  const [hasProfile, setHasProfile] = useState(false);

  const clearPasswordRecovery = useCallback(() => {
    setIsPasswordRecovery(false);
  }, []);

  const refreshProfile = useCallback(async () => {
    const {
      data: { session: current },
    } = await supabase.auth.getSession();
    const uid = current?.user?.id;
    if (!uid) {
      setProfileGateResolved(true);
      setHasProfile(false);
      return;
    }
    if (isPasswordRecovery) {
      setProfileGateResolved(true);
      setHasProfile(true);
      return;
    }
    if (await clearOrphanAuthSession()) {
      setProfileGateResolved(true);
      setHasProfile(false);
      setSession(null);
      return;
    }
    setProfileGateResolved(false);
    try {
      setHasProfile(await resolveUserProfile(uid));
    } catch {
      setHasProfile(false);
    } finally {
      setProfileGateResolved(true);
    }
  }, [isPasswordRecovery]);

  useEffect(() => {
    let mounted = true;

    async function applyAuthUrl(url: string | null) {
      if (!url || !mounted) return;
      const params = parseSupabaseAuthParamsFromUrl(url);
      if (!params) return;

      const { data, error } = await supabase.auth.setSession({
        access_token: params.access_token,
        refresh_token: params.refresh_token,
      });
      if (error || !mounted) return;

      if (params.type === 'recovery') {
        setIsPasswordRecovery(true);
      }
      setSession(data.session);
    }

    (async () => {
      await applyAuthUrl(await Linking.getInitialURL());
      const initial = await getSessionClearingStaleRefresh();
      if (mounted) {
        setSession(initial);
        setIsLoading(false);
      }
    })();

    const linkSub = Linking.addEventListener('url', ({ url }) => {
      void applyAuthUrl(url);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, newSession) => {
      if (!mounted) return;
      setSession(newSession);
      if (event === 'SIGNED_OUT') {
        setIsPasswordRecovery(false);
      }
      if (event === 'PASSWORD_RECOVERY') {
        setIsPasswordRecovery(true);
      }
    });

    return () => {
      mounted = false;
      linkSub.remove();
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!session?.user?.id) {
      setProfileGateResolved(true);
      setHasProfile(false);
      return;
    }
    if (isPasswordRecovery) {
      setProfileGateResolved(true);
      setHasProfile(true);
      return;
    }

    let cancelled = false;
    setProfileGateResolved(false);
    void (async () => {
      try {
        if (await clearOrphanAuthSession()) {
          if (!cancelled) {
            setSession(null);
            setHasProfile(false);
            setProfileGateResolved(true);
          }
          return;
        }
        const ok = await resolveUserProfile(session.user.id);
        if (!cancelled) {
          setHasProfile(ok);
          setProfileGateResolved(true);
        }
      } catch {
        if (!cancelled) {
          setHasProfile(false);
          setProfileGateResolved(true);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [session?.user?.id, isPasswordRecovery]);

  const value = useMemo(
    () => ({
      session,
      userId: session?.user?.id ?? null,
      isAuthenticated: !!session,
      isLoading,
      isPasswordRecovery,
      clearPasswordRecovery,
      profileGateResolved,
      hasProfile,
      refreshProfile,
    }),
    [
      session,
      isLoading,
      isPasswordRecovery,
      clearPasswordRecovery,
      profileGateResolved,
      hasProfile,
      refreshProfile,
    ]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuthContext() {
  return useContext(AuthContext);
}
