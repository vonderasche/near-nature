import { StyleSheet, Text, View } from 'react-native';
import { useCallback } from 'react';

import { AuthButton } from '@/components/auth/auth-button';
import { HeroIcon, type HeroIconName } from '@/components/ui/hero-icon';
import { SheetModalShell, useSheetModalShellStyles } from '@/components/ui/sheet-modal-shell';
import type { AppTheme } from '@/constants/themes';
import { useAuthContext } from '@/context/AuthContext';
import { useFirstLoginWelcome } from '@/hooks/useFirstLoginWelcome';
import { useTheme } from '@/hooks/useTheme';
import { useThemedStyles } from '@/hooks/useThemedStyles';

type WelcomePoint = {
  icon: HeroIconName;
  title: string;
  body: string;
};

const WELCOME_POINTS: readonly WelcomePoint[] = [
  {
    icon: 'camera',
    title: 'Capture nature around you',
    body: 'Use the camera to photograph plants and wildlife. Clear, close photos help identification.',
  },
  {
    icon: 'sparkles',
    title: 'Save confirmed discoveries',
    body: 'After an identification, save it to build your personal discovery gallery.',
  },
  {
    icon: 'trophy',
    title: 'Earn badges with unique species',
    body: 'Badges track distinct species, so several photos of the same species count once.',
  },
];

function createWelcomeStyles(theme: AppTheme) {
  return StyleSheet.create({
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.sm,
    },
    points: {
      gap: theme.spacing.sm,
    },
    pointRow: {
      flexDirection: 'row',
      gap: theme.spacing.sm,
    },
    iconWrap: {
      width: 32,
      height: 32,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    pointText: {
      flex: 1,
      gap: 2,
    },
    pointTitle: {
      ...theme.typography.label,
      color: theme.colors.textPrimary,
    },
    pointBody: {
      ...theme.typography.subtitle,
      color: theme.colors.textMuted,
      lineHeight: 18,
    },
  });
}

export function FirstLoginWelcomeModal() {
  const sheetStyles = useSheetModalShellStyles();
  const styles = useThemedStyles(createWelcomeStyles);
  const { theme } = useTheme();

  const {
    userId,
    isAuthenticated,
    isLoading,
    isPasswordRecovery,
    profileGateResolved,
    hasProfile,
    freshSignIn,
    clearFreshSignIn,
  } = useAuthContext();

  const { visible, dismiss } = useFirstLoginWelcome({
    userId,
    enabled:
      freshSignIn &&
      isAuthenticated &&
      !isLoading &&
      !isPasswordRecovery &&
      profileGateResolved &&
      hasProfile,
  });

  const handleDismiss = useCallback(async () => {
    await dismiss();
    clearFreshSignIn();
  }, [clearFreshSignIn, dismiss]);

  return (
    <SheetModalShell visible={visible} onRequestClose={() => void handleDismiss()} backdropDisabled>
      <View style={styles.header}>
        <HeroIcon name="sparkles" size={26} color={theme.colors.textPrimary} />
        <Text style={sheetStyles.sheetTitle}>Welcome to Near Nature</Text>
      </View>

      <Text style={sheetStyles.sheetMessage}>
        Here&apos;s the quick start for capturing discoveries and earning badges.
      </Text>

      <View style={styles.points}>
        {WELCOME_POINTS.map((point) => (
          <View key={point.title} style={styles.pointRow}>
            <View style={styles.iconWrap}>
              <HeroIcon name={point.icon} size={18} color={theme.colors.textPrimary} />
            </View>
            <View style={styles.pointText}>
              <Text style={styles.pointTitle}>{point.title}</Text>
              <Text style={styles.pointBody}>{point.body}</Text>
            </View>
          </View>
        ))}
      </View>

      <AuthButton title="Start exploring" fillParent onPress={() => void handleDismiss()} />
    </SheetModalShell>
  );
}
