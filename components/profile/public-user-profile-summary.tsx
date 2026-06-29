import { StyleSheet, Text, View } from 'react-native';

import type { AppTheme } from '@/constants/themes';
import { usStateLabel } from '@/constants/us-states';
import { useThemedStyles } from '@/hooks/useThemedStyles';

type PublicUserProfileSummaryProps = {
  username: string;
  motto: string | null | undefined;
  state: string | null | undefined;
  mottoPlaceholder?: string;
};

function createPublicProfileSummaryStyles(theme: AppTheme) {
  return StyleSheet.create({
    block: {
      alignItems: 'center',
      gap: theme.spacing.xs,
      maxWidth: 420,
      paddingHorizontal: theme.spacing.md,
    },
    username: {
      ...theme.typography.title,
      fontSize: 22,
      lineHeight: 28,
      color: theme.colors.textPrimary,
      textAlign: 'center',
    },
    meta: {
      ...theme.typography.subtitle,
      textAlign: 'center',
      color: theme.colors.textMuted,
    },
    motto: {
      ...theme.typography.body,
      textAlign: 'center',
      lineHeight: 22,
      color: theme.colors.textMuted,
    },
    mottoPlaceholder: {
      ...theme.typography.subtitle,
      fontStyle: 'italic',
      textAlign: 'center',
      lineHeight: 22,
      color: theme.colors.textMuted,
    },
  });
}

/**
 * Same visual rhythm as {@link UserProfileSummary} without editable rows or email.
 */
export function PublicUserProfileSummary({
  username,
  motto,
  state,
  mottoPlaceholder = 'No motto set.',
}: PublicUserProfileSummaryProps) {
  const styles = useThemedStyles(createPublicProfileSummaryStyles);
  const mottoTrimmed = motto?.trim();
  const stateTrimmed = state?.trim();

  return (
    <View style={styles.block}>
      <Text style={styles.username}>{username}</Text>
      {stateTrimmed ? <Text style={styles.meta}>{usStateLabel(stateTrimmed)}</Text> : null}
      <Text style={mottoTrimmed ? styles.motto : styles.mottoPlaceholder}>
        {mottoTrimmed ?? mottoPlaceholder}
      </Text>
    </View>
  );
}
