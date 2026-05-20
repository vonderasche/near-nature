import { type ReactNode, useEffect } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { useRouter, useSegments } from 'expo-router';

import { authColors } from '@/constants/auth-theme';
import { useAuthContext } from '@/context/AuthContext';
import { routes } from '@/lib/routing/routes';

const GUEST_TAB = 'explorer-board';
const AUTH_REQUIRED_TABS = new Set(['camera', 'profile']);

function isGuestAllowedSegments(segs: readonly string[]): boolean {
  if (segs[0] === 'user') return true;
  if (segs[0] === '(tabs)') {
    const tab = segs[1];
    if (!tab || tab === 'index' || tab === GUEST_TAB) return true;
  }
  if (segs[0] === '(auth)' && !segs.includes('needs-profile')) return true;
  return false;
}

/**
 * Redirects: guests may browse Explorer Board (and public member profiles); Camera and Profile
 * require sign-in. Signed-in users need a `public.users` row before (tabs) or member routes.
 */
export function AuthGate({ children }: { children: ReactNode }) {
  const {
    isAuthenticated,
    isLoading,
    isPasswordRecovery,
    profileGateResolved,
    hasProfile,
  } = useAuthContext();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    const segs = segments as string[];
    if (isLoading || segs.length === 0) return;

    const inTabs = segs[0] === '(tabs)';
    const inUserProfile = segs[0] === 'user';
    const inAuth = segs[0] === '(auth)';
    const tab = segs[1];
    const onResetPassword = segs.includes('reset-password');
    const onNeedsProfile = segs.includes('needs-profile');

    if (isPasswordRecovery && isAuthenticated && !onResetPassword) {
      router.replace(routes.resetPassword);
      return;
    }

    if (!isAuthenticated) {
      if (onNeedsProfile) {
        router.replace(routes.login);
        return;
      }
      if (inTabs && tab && AUTH_REQUIRED_TABS.has(tab)) {
        router.replace(routes.login);
        return;
      }
      if (isGuestAllowedSegments(segs)) {
        return;
      }
      if (!inAuth) {
        router.replace(routes.explorerBoardTab);
      }
      return;
    }

    if (isAuthenticated && !isPasswordRecovery) {
      if (!profileGateResolved) return;
      if (!hasProfile) {
        if (!onNeedsProfile) {
          router.replace(routes.needsProfile);
        }
        return;
      }
    }

    if (isAuthenticated && hasProfile && inAuth && !onResetPassword && !onNeedsProfile) {
      router.replace(routes.tabs);
    }
  }, [
    isAuthenticated,
    isLoading,
    isPasswordRecovery,
    profileGateResolved,
    hasProfile,
    segments,
    router,
  ]);

  const profileGateLoading = isAuthenticated && !isPasswordRecovery && !profileGateResolved;
  if (isLoading || profileGateLoading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={authColors.text} />
      </View>
    );
  }

  return <>{children}</>;
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: authColors.background,
  },
});
