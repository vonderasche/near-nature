import { router } from 'expo-router';
import { Pressable, StyleSheet, Text } from 'react-native';

import { authColors, authSpacing, authTypography } from '@/constants/auth-theme';
import { discoverGuestBannerText } from '@/lib/explore/discoverPreviewCopy';
import { routes } from '@/lib/routing/routes';

type Props = {
  stateName: string;
};

export function DiscoverGuestSignInBanner({ stateName }: Props) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={() => router.push(routes.login)}
      style={({ pressed }) => [styles.wrap, pressed && styles.pressed]}>
      <Text style={styles.text}>{discoverGuestBannerText(stateName)}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: {
    borderWidth: 1,
    borderColor: authColors.border,
    padding: authSpacing.sm,
    marginBottom: authSpacing.sm,
    backgroundColor: authColors.background,
  },
  pressed: {
    opacity: 0.9,
  },
  text: {
    ...authTypography.subtitle,
    fontSize: 13,
    color: authColors.textMuted,
    lineHeight: 18,
  },
});
