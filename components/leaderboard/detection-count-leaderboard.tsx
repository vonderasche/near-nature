import { useRouter } from 'expo-router';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';

import { LeaderboardMemberAvatar } from '@/components/leaderboard/leaderboard-member-avatar';
import { InlineFormError } from '@/components/screen/inline-form-error';
import { ListDetailCard, listSectionSupportingStyles } from '@/components/screen/list-detail-card';
import { authColors } from '@/constants/auth-theme';
import { parseLeaderboardMotto } from '@/lib/leaderboard/formatLeaderboardMotto';
import { routePublicUserProfile } from '@/lib/routing/routes';
import type { DetectionLeaderboardRow } from '@/services/leaderboardService';

type Props = {
  rows: DetectionLeaderboardRow[];
  loading: boolean;
  error: string | null;
};

function detectionLabel(n: number): string {
  return `${n} ${n === 1 ? 'detection' : 'detections'}`;
}

function leaderboardTitle(row: DetectionLeaderboardRow): string {
  return row.rank > 0 ? `#${row.rank} · @${row.username}` : `@${row.username}`;
}

/**
 * Ordered list by detection count (RPC). Shows rank, username, motto, and detection count.
 */
export function DetectionCountLeaderboard({ rows, loading, error }: Props) {
  const router = useRouter();

  if (error) {
    return <InlineFormError>{error}</InlineFormError>;
  }

  if (loading) {
    return (
      <View style={listSectionSupportingStyles.centered} accessibilityLabel="Loading leaderboard">
        <ActivityIndicator color={authColors.textMuted} />
      </View>
    );
  }

  if (rows.length === 0) {
    return (
      <Text style={listSectionSupportingStyles.muted}>No rankings yet. Save identifications to appear here.</Text>
    );
  }

  return (
    <View accessibilityLabel="Leaderboard by detections">
      {rows.map((row) => {
        const motto = parseLeaderboardMotto(row.motto);
        const title = leaderboardTitle(row);

        return (
          <Pressable
            key={row.userId}
            onPress={() => router.push(routePublicUserProfile(row.userId))}
            style={({ pressed }) => pressed && styles.rowPressed}
            android_ripple={{ color: 'rgba(255,255,255,0.08)' }}
            accessibilityRole="button"
            accessibilityHint="Opens this member's public profile"
            accessibilityLabel={`${title}, ${motto ?? 'No motto'}, ${detectionLabel(row.detectionCount)}`}>
            <ListDetailCard
              leading={
                <LeaderboardMemberAvatar
                  storedUrl={row.avatarUrl}
                  borderColor={authColors.border}
                  mutedColor={authColors.textMuted}
                />
              }
              title={title}
              subtitle={motto}
              meta={detectionLabel(row.detectionCount)}
            />
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  rowPressed: {
    opacity: 0.92,
  },
});
