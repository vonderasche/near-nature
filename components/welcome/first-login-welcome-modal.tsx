import { StyleSheet, Text, View } from 'react-native';

import { AuthButton } from '@/components/auth/auth-button';
import { HeroIcon, type HeroIconName } from '@/components/ui/hero-icon';
import { SheetModalShell, sheetModalShellStyles } from '@/components/ui/sheet-modal-shell';
import { authColors, authSpacing, authTypography } from '@/constants/auth-theme';
import { useAuthContext } from '@/context/AuthContext';
import { useFirstLoginWelcome } from '@/hooks/useFirstLoginWelcome';

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

export function FirstLoginWelcomeModal() {
  const {
    userId,
    isAuthenticated,
    isLoading,
    isPasswordRecovery,
    profileGateResolved,
    hasProfile,
  } = useAuthContext();

  const { visible, dismiss } = useFirstLoginWelcome({
    userId,
    enabled:
      isAuthenticated &&
      !isLoading &&
      !isPasswordRecovery &&
      profileGateResolved &&
      hasProfile,
  });

  return (
    <SheetModalShell visible={visible} onRequestClose={() => void dismiss()} backdropDisabled>
      <View style={styles.header}>
        <HeroIcon name="sparkles" size={26} color={authColors.text} />
        <Text style={sheetModalShellStyles.sheetTitle}>Welcome to Near Nature</Text>
      </View>

      <Text style={sheetModalShellStyles.sheetMessage}>
        Here&apos;s the quick start for capturing discoveries and earning badges.
      </Text>

      <View style={styles.points}>
        {WELCOME_POINTS.map((point) => (
          <View key={point.title} style={styles.pointRow}>
            <View style={styles.iconWrap}>
              <HeroIcon name={point.icon} size={18} color={authColors.text} />
            </View>
            <View style={styles.pointText}>
              <Text style={styles.pointTitle}>{point.title}</Text>
              <Text style={styles.pointBody}>{point.body}</Text>
            </View>
          </View>
        ))}
      </View>

      <AuthButton title="Start exploring" fillParent onPress={() => void dismiss()} />
    </SheetModalShell>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: authSpacing.sm,
  },
  points: {
    gap: authSpacing.sm,
  },
  pointRow: {
    flexDirection: 'row',
    gap: authSpacing.sm,
  },
  iconWrap: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: authColors.border,
  },
  pointText: {
    flex: 1,
    gap: 2,
  },
  pointTitle: {
    ...authTypography.label,
    color: authColors.text,
  },
  pointBody: {
    ...authTypography.subtitle,
    color: authColors.textMuted,
    lineHeight: 18,
  },
});
