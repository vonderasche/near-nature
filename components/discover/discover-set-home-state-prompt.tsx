import { router } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import { AuthButton } from '@/components/auth/auth-button';
import { authColors, authSpacing, authTypography } from '@/constants/auth-theme';
import { discoverNeedsHomeStateMessage } from '@/lib/explore/discoverPreviewCopy';
import { routes } from '@/lib/routing/routes';

export function DiscoverSetHomeStatePrompt() {
  return (
    <View style={styles.wrap}>
      <Text style={styles.text}>{discoverNeedsHomeStateMessage()}</Text>
      <AuthButton
        title="Go to Profile"
        variant="outline"
        onPress={() => router.push(routes.profileTab)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: authSpacing.md,
    paddingVertical: authSpacing.sm,
  },
  text: {
    ...authTypography.subtitle,
    color: authColors.textMuted,
    lineHeight: 20,
  },
});
