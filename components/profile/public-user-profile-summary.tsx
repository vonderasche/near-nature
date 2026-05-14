import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { authSpacing } from '@/constants/auth-theme';

type PublicUserProfileSummaryProps = {
  username: string;
  motto: string | null | undefined;
  mutedColor: string;
  mottoPlaceholder?: string;
};

/**
 * Same visual rhythm as {@link UserProfileSummary} without name or email (other users).
 */
export function PublicUserProfileSummary({
  username,
  motto,
  mutedColor,
  mottoPlaceholder = 'No motto set.',
}: PublicUserProfileSummaryProps) {
  const mottoTrimmed = motto?.trim();
  return (
    <View style={styles.block}>
      <ThemedText style={[styles.username, { color: mutedColor }]}>@{username}</ThemedText>
      <ThemedText style={[mottoTrimmed ? styles.motto : styles.mottoPlaceholder, { color: mutedColor }]}>
        {mottoTrimmed ?? mottoPlaceholder}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  block: {
    alignItems: 'center',
    gap: authSpacing.sm,
  },
  username: {
    fontSize: 14,
    textAlign: 'center',
  },
  motto: {
    fontSize: 15,
    textAlign: 'center',
    marginTop: authSpacing.xs,
    paddingHorizontal: authSpacing.md,
  },
  mottoPlaceholder: {
    fontSize: 15,
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: authSpacing.xs,
    paddingHorizontal: authSpacing.md,
  },
});
