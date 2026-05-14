import { useRouter } from 'expo-router';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';

import { InlineFormError } from '@/components/screen/inline-form-error';
import { authColors, authSpacing, authTypography } from '@/constants/auth-theme';
import type { DetectionLeaderboardRow } from '@/hooks/useDetectionLeaderboard';
import { routePublicUserProfile } from '@/lib/routing/routes';

type Props = {
  rows: DetectionLeaderboardRow[];
  loading: boolean;
  error: string | null;
};

function detectionLabel(n: number): string {
  return `${n} ${n === 1 ? 'detection' : 'detections'}`;
}

/**
 * Ordered list by detection count (RPC). Avatar placeholder, username, count, and motto block.
 */
export function DetectionCountLeaderboard({ rows, loading, error }: Props) {
  const router = useRouter();

  if (error) {
    return <InlineFormError>{error}</InlineFormError>;
  }

  if (loading) {
    return (
      <View style={styles.centered} accessibilityLabel="Loading leaderboard">
        <ActivityIndicator color={authColors.text} />
      </View>
    );
  }

  if (rows.length === 0) {
    return (
      <Text style={styles.empty}>No rankings yet. Save identifications to appear here.</Text>
    );
  }

  return (
    <View style={styles.list} accessibilityLabel="Leaderboard by detections">
      {rows.map((row) => (
        <Pressable
          key={row.userId}
          onPress={() => router.push(routePublicUserProfile(row.userId))}
          style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}
          accessibilityRole="button"
          accessibilityHint="Opens their public profile"
          accessibilityLabel={`${row.rank}. ${row.username}, ${detectionLabel(row.detectionCount)}`}>
          <View style={styles.avatarPlaceholder} accessibilityRole="image" accessibilityLabel="Avatar placeholder" />
          <View style={styles.main}>
            <View style={styles.topLine}>
              <Text style={styles.username} numberOfLines={1}>
                {row.username}
              </Text>
              <Text style={styles.count}>{detectionLabel(row.detectionCount)}</Text>
            </View>

            <View style={styles.mottoSection}>
              <Text style={styles.mottoHeading}>Motto</Text>
              <Text style={styles.mottoBody}>
                {row.motto ?? 'No motto set.'}
              </Text>
            </View>
          </View>
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  list: {
    gap: authSpacing.md,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: authSpacing.md,
    paddingVertical: authSpacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: authColors.border,
  },
  rowPressed: {
    opacity: 0.85,
  },
  avatarPlaceholder: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: authColors.fieldBackground,
    borderWidth: 1,
    borderColor: authColors.border,
    marginTop: 2,
  },
  main: {
    flex: 1,
    minWidth: 0,
    gap: authSpacing.sm,
  },
  topLine: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: authSpacing.sm,
  },
  username: {
    ...authTypography.body,
    flex: 1,
    color: authColors.text,
    fontWeight: '600',
    minWidth: 0,
  },
  count: {
    ...authTypography.subtitle,
    color: authColors.textMuted,
    flexShrink: 0,
  },
  mottoSection: {
    gap: authSpacing.xs,
    paddingTop: authSpacing.xs,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: authColors.border,
  },
  mottoHeading: {
    ...authTypography.label,
    color: authColors.text,
  },
  mottoBody: {
    ...authTypography.subtitle,
    color: authColors.textMuted,
  },
  empty: {
    ...authTypography.subtitle,
    color: authColors.textMuted,
    textAlign: 'center',
    paddingVertical: authSpacing.md,
  },
  centered: {
    paddingVertical: authSpacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
