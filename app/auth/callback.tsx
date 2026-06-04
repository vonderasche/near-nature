import { router } from 'expo-router';
import { useEffect } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { useAuthContext } from '@/context/AuthContext';
import { authColors } from '@/constants/auth-theme';
import { resolvePostAuthRoute } from '@/lib/routing/resolvePostAuthRoute';

/**
 * Landing route for `nearnature://auth/callback` after Google OAuth.
 * Session tokens are applied in AuthContext via Linking; this screen routes onward.
 */
export default function AuthCallbackScreen() {
  const { isAuthenticated, profileGateResolved, hasProfile, isPasswordRecovery } = useAuthContext();

  useEffect(() => {
    if (!profileGateResolved) return;

    const target = resolvePostAuthRoute({
      isPasswordRecovery,
      profileGateResolved,
      hasProfile,
    });

    if (target) {
      router.replace(target);
      return;
    }

    if (!isAuthenticated) {
      router.replace('/login');
    }
  }, [hasProfile, isAuthenticated, isPasswordRecovery, profileGateResolved]);

  return (
    <View style={styles.wrap}>
      <ActivityIndicator size="large" color={authColors.text} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: authColors.background,
  },
});
