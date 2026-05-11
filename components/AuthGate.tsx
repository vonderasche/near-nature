import { type ReactNode, useEffect } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { useRouter, useSegments } from 'expo-router';

import { useAuthContext } from '@/context/AuthContext';

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
    const inAuth = segs[0] === '(auth)';
    const onResetPassword = segs.includes('reset-password');

    if (isPasswordRecovery && isAuthenticated && !onResetPassword) {
      router.replace('/reset-password');
      return;
    }

    if (!isAuthenticated) {
      if (inTabs) {
        router.replace('/login');
      }
      return;
    }

    if (isAuthenticated && inAuth && !onResetPassword) {
      router.replace('/(tabs)');
    }
  }, [isAuthenticated, isLoading, isPasswordRecovery, segments, router]);

  if (isLoading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" />
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
  },
});
