import { router } from 'expo-router';
import { useEffect } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import type { AppTheme } from '@/constants/themes';
import { useAuthContext } from '@/context/AuthContext';
import { useTheme } from '@/hooks/useTheme';
import { useThemedStyles } from '@/hooks/useThemedStyles';
import { resolvePostAuthRoute } from '@/lib/routing/resolvePostAuthRoute';

function createAuthCallbackStyles(theme: AppTheme) {
  return StyleSheet.create({
    wrap: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.colors.background,
    },
  });
}

/**
 * Landing route for `nearnature://auth/callback` after Google OAuth.
 * Session tokens are applied in AuthContext via Linking; this screen routes onward.
 */
export default function AuthCallbackScreen() {
  const styles = useThemedStyles(createAuthCallbackStyles);
  const { theme } = useTheme();
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
      <ActivityIndicator size="large" color={theme.colors.textPrimary} />
    </View>
  );
}
