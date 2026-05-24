import { type ReactNode } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { Redirect, useSegments } from 'expo-router';

import { authColors } from '@/constants/auth-theme';
import { useAuthContext } from '@/context/AuthContext';
import { resolveAuthGateRedirect } from '@/lib/routing/resolveAuthGateRedirect';

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

  const profileGateLoading = isAuthenticated && !isPasswordRecovery && !profileGateResolved;
  if (isLoading || profileGateLoading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={authColors.text} />
      </View>
    );
  }

  const redirect = resolveAuthGateRedirect({
    segments,
    isAuthenticated,
    isPasswordRecovery,
    profileGateResolved,
    hasProfile,
  });

  if (redirect != null) {
    return <Redirect href={redirect} />;
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
