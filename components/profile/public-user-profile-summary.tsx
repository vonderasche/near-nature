import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { usStateLabel } from '@/constants/us-states';
import { authSpacing } from '@/constants/auth-theme';

type PublicUserProfileSummaryProps = {
  username: string;
  motto: string | null | undefined;
  state: string | null | undefined;
  mutedColor: string;
  mottoPlaceholder?: string;
};

/**
 * Same visual rhythm as {@link UserProfileSummary} without name or email (other users).
 */
export function PublicUserProfileSummary({
  username,
  motto,
  state,
  mutedColor,
  mottoPlaceholder = 'No motto set.',
}: PublicUserProfileSummaryProps) {
  const mottoTrimmed = motto?.trim();
  const stateTrimmed = state?.trim();
  return (
    <View style={styles.block}>
      <ThemedText style={[styles.username, { color: mutedColor }]}>{username}</ThemedText>
      {stateTrimmed ? (
        <ThemedText style={[styles.state, { color: mutedColor }]}>{usStateLabel(stateTrimmed)}</ThemedText>
      ) : null}
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
  state: {
    fontSize: 15,
    textAlign: 'center',
    paddingHorizontal: authSpacing.md,
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
