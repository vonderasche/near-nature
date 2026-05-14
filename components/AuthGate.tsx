import { type ReactNode, useEffect } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { useRouter, useSegments } from 'expo-router';

import { authColors } from '@/constants/auth-theme';
import { useAuthContext } from '@/context/AuthContext';
import { routes } from '@/lib/routing/routes';

/**
 * Redirects based on auth: signed-out users cannot access (tabs); signed-in users
 * leave the auth stack except the password reset screen (recovery session).
 */
export function AuthGate({ children }: { children: ReactNode }) {
  const { isAuthenticated, isLoading, isPasswordRecovery } = useAuthContext();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    const segs = segments as string[];
    if (isLoading || segs.length === 0) return;

    const inTabs = segs[0] === '(tabs)';
    const inUserProfile = segs[0] === 'user';
    const inAuth = segs[0] === '(auth)';
    const onResetPassword = segs.includes('reset-password');

    if (isPasswordRecovery && isAuthenticated && !onResetPassword) {
      router.replace(routes.resetPassword);
      return;
    }

    if (!isAuthenticated) {
      if (inTabs || inUserProfile) {
        router.replace(routes.login);
      }
      return;
    }

    if (isAuthenticated && inAuth && !onResetPassword) {
      router.replace(routes.tabs);
    }
  }, [isAuthenticated, isLoading, isPasswordRecovery, segments, router]);

  if (isLoading) {
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
