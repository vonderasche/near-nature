import { type ReactNode, useEffect } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { useRouter, useSegments } from 'expo-router';

import { authColors } from '@/constants/auth-theme';
import { useAuthContext } from '@/context/AuthContext';
import { routes } from '@/lib/routing/routes';

/**
 * Redirects: signed-out users stay on (auth); signed-in users need a `public.users` row
 * before (tabs) or member routes; password recovery can use reset-password without a profile.
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
    const inDiscover = segs[0] === 'discover';
    const inUserProfile = segs[0] === 'user';
    const inAuth = segs[0] === '(auth)';
    const onResetPassword = segs.includes('reset-password');
    const onNeedsProfile = segs.includes('needs-profile');

    if (isPasswordRecovery && isAuthenticated && !onResetPassword) {
      router.replace(routes.resetPassword);
      return;
    }

    if (!isAuthenticated) {
      if (inTabs || inDiscover || inUserProfile || onNeedsProfile) {
        router.replace(routes.login);
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

    if (isAuthenticated && hasProfile && inAuth && !onResetPassword) {
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
