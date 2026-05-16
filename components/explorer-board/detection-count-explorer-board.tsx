import { useRouter } from 'expo-router';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';

import { ExplorerBoardMemberAvatar } from '@/components/explorer-board/explorer-board-member-avatar';
import { InlineFormError } from '@/components/screen/inline-form-error';
import { ListDetailCard, listSectionSupportingStyles } from '@/components/screen/list-detail-card';
import { authColors } from '@/constants/auth-theme';
import { parseLeaderboardMotto } from '@/lib/leaderboard/formatLeaderboardMotto';
import {
  formatLeaderboardAccessibilityCounts,
  formatLeaderboardSpeciesMeta,
} from '@/lib/leaderboard/formatLeaderboardSpeciesCounts';
import { routePublicUserProfile } from '@/lib/routing/routes';
import type { DetectionLeaderboardRow } from '@/services/leaderboardService';

type Props = {
  rows: DetectionLeaderboardRow[];
  loading: boolean;
  error: string | null;
};

function explorerBoardRankBadge(row: DetectionLeaderboardRow): string | null {
  return row.rank > 0 ? String(row.rank) : null;
}

function explorerBoardAccessibilityTitle(row: DetectionLeaderboardRow): string {
  return row.rank > 0 ? `Rank ${row.rank}, ${row.username}` : row.username;
}

/**
 * Ordered list by distinct native species (RPC). Shows native and non-native species counts.
 */
export function DetectionCountExplorerBoard({ rows, loading, error }: Props) {
  const router = useRouter();

  if (error) {
    return <InlineFormError>{error}</InlineFormError>;
  }

  if (loading) {
    return (
      <View style={listSectionSupportingStyles.centered} accessibilityLabel="Loading explorer board">
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
    <View accessibilityLabel="Explorer board by native species discovered">
      {rows.map((row) => {
        const motto = parseLeaderboardMotto(row.motto);
        const a11yTitle = explorerBoardAccessibilityTitle(row);

        return (
          <Pressable
            key={row.userId}
            onPress={() => router.push(routePublicUserProfile(row.userId))}
            style={({ pressed }) => pressed && styles.rowPressed}
            android_ripple={{ color: 'rgba(255,255,255,0.08)' }}
            accessibilityRole="button"
            accessibilityHint="Opens this member's public profile"
            accessibilityLabel={`${a11yTitle}, ${motto ?? 'No motto'}, ${formatLeaderboardAccessibilityCounts(row)}`}>
            <ListDetailCard
              leading={
                <ExplorerBoardMemberAvatar
                  storedUrl={row.avatarUrl}
                  borderColor={authColors.border}
                  mutedColor={authColors.textMuted}
                />
              }
              cornerBadge={explorerBoardRankBadge(row)}
              title={row.username}
              subtitle={motto}
              meta={formatLeaderboardSpeciesMeta(row)}
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
