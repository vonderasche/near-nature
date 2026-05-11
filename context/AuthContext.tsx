import type { Session } from '@supabase/supabase-js';
import * as Linking from 'expo-linking';
import { createContext, type ReactNode, useCallback, useContext, useEffect, useMemo, useState } from 'react';

import { parseSupabaseAuthParamsFromUrl } from '@/lib/auth/parseAuthCallbackUrl';
import { supabase } from '@/lib/supabase';

type AuthContextType = {
  session: Session | null;
  userId: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isPasswordRecovery: boolean;
  clearPasswordRecovery: () => void;
};

const AuthContext = createContext<AuthContextType>({
  session: null,
  userId: null,
  isAuthenticated: false,
  isLoading: true,
  isPasswordRecovery: false,
  clearPasswordRecovery: () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPasswordRecovery, setIsPasswordRecovery] = useState(false);

  const clearPasswordRecovery = useCallback(() => {
    setIsPasswordRecovery(false);
  }, []);

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
      const {
        data: { session: initial },
      } = await supabase.auth.getSession();
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

  const value = useMemo(
    () => ({
      session,
      userId: session?.user?.id ?? null,
      isAuthenticated: !!session,
      isLoading,
      isPasswordRecovery,
      clearPasswordRecovery,
    }),
    [session, isLoading, isPasswordRecovery, clearPasswordRecovery]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuthContext() {
  return useContext(AuthContext);
}
