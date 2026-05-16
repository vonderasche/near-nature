import { StyleSheet, Text, View } from 'react-native';

import { authColors, authSpacing, authTypography } from '@/constants/auth-theme';
import { usStateLabel } from '@/constants/us-states';

type PublicUserProfileSummaryProps = {
  username: string;
  motto: string | null | undefined;
  state: string | null | undefined;
  mutedColor: string;
  mottoPlaceholder?: string;
};

/**
 * Same visual rhythm as {@link UserProfileSummary} without editable rows or email.
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
      <Text style={styles.username}>{username}</Text>
      {stateTrimmed ? <Text style={[styles.meta, { color: mutedColor }]}>{usStateLabel(stateTrimmed)}</Text> : null}
      <Text style={[mottoTrimmed ? styles.motto : styles.mottoPlaceholder, { color: mutedColor }]}>
        {mottoTrimmed ?? mottoPlaceholder}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  block: {
    alignItems: 'center',
    gap: authSpacing.xs,
    maxWidth: 420,
    paddingHorizontal: authSpacing.md,
  },
  username: {
    ...authTypography.title,
    fontSize: 22,
    lineHeight: 28,
    color: authColors.text,
    textAlign: 'center',
  },
  meta: {
    ...authTypography.subtitle,
    textAlign: 'center',
  },
  motto: {
    ...authTypography.body,
    textAlign: 'center',
    lineHeight: 22,
  },
  mottoPlaceholder: {
    ...authTypography.subtitle,
    fontStyle: 'italic',
    textAlign: 'center',
    lineHeight: 22,
  },
});
