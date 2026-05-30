import { router } from 'expo-router';
import { useEffect } from 'react';

import { useAuthContext } from '@/context/AuthContext';
import { resolvePostAuthRoute } from '@/lib/routing/resolvePostAuthRoute';

type PostSignInNavigationLabels = {
  idle: string;
  completing: string;
};

const DEFAULT_LABELS: PostSignInNavigationLabels = {
  idle: 'Sign in',
  completing: 'Signing you in…',
};

/**
 * After credentials or OAuth sign-in succeeds, wait for the profile gate and navigate.
 * Backs up AuthGate `<Redirect>` so the login screen does not appear stuck.
 */
export function usePostSignInNavigation(
  pending: boolean,
  labels: PostSignInNavigationLabels = DEFAULT_LABELS,
): {
  completingSignIn: boolean;
  buttonTitle: string;
} {
  const {
    isAuthenticated,
    profileGateResolved,
    hasProfile,
    isPasswordRecovery,
  } = useAuthContext();

  const completingSignIn =
    pending && isAuthenticated && !isPasswordRecovery && !profileGateResolved;

  useEffect(() => {
    if (!pending || !isAuthenticated || !profileGateResolved) return;

    const target = resolvePostAuthRoute({
      isPasswordRecovery,
      profileGateResolved,
      hasProfile,
    });
    if (target) {
      router.replace(target);
    }
  }, [pending, isAuthenticated, isPasswordRecovery, profileGateResolved, hasProfile]);

  return {
    completingSignIn,
    buttonTitle: completingSignIn ? labels.completing : labels.idle,
  };
}
