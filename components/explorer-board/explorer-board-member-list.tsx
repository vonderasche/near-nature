import { Pressable, StyleSheet } from 'react-native';

import { ExplorerBoardMemberAvatar } from '@/components/explorer-board/explorer-board-member-avatar';
import { ListDetailCard } from '@/components/screen/list-detail-card';
import { authColors } from '@/constants/auth-theme';
import {
  formatLeaderboardAccessibilityCounts,
  formatLeaderboardSpeciesMeta,
} from '@/lib/leaderboard/formatLeaderboardSpeciesCounts';
import { parseLeaderboardMotto } from '@/lib/leaderboard/formatLeaderboardMotto';
import type { DetectionLeaderboardRow } from '@/services/leaderboardService';

type Props = {
  rows: DetectionLeaderboardRow[];
  resolveDisplayUrl: (storedUrl: string | null | undefined) => string | null;
  onPressMember: (row: DetectionLeaderboardRow) => void;
};

function rankBadge(row: DetectionLeaderboardRow): string | null {
  return row.rank > 0 ? String(row.rank) : null;
}

function accessibilityTitle(row: DetectionLeaderboardRow): string {
  return row.rank > 0 ? `Rank ${row.rank}, ${row.username}` : row.username;
}

/**
 * Classic explorer board rows: avatar, rank, username, motto, and species stats.
 */
export function ExplorerBoardMemberList({ rows, resolveDisplayUrl, onPressMember }: Props) {
  return (
    <>
      {rows.map((row) => {
        const motto = parseLeaderboardMotto(row.motto);
        const a11yTitle = accessibilityTitle(row);

        return (
          <Pressable
            key={row.userId}
            onPress={() => onPressMember(row)}
            style={({ pressed }) => pressed && styles.rowPressed}
            android_ripple={{ color: 'rgba(255,255,255,0.08)' }}
            accessibilityRole="button"
            accessibilityHint="Opens this member's public profile"
            accessibilityLabel={`${a11yTitle}, ${motto ?? 'No motto'}, ${formatLeaderboardAccessibilityCounts(row)}`}>
            <ListDetailCard
              leading={
                <ExplorerBoardMemberAvatar
                  storedUrl={row.avatarUrl}
                  displayUri={resolveDisplayUrl(row.avatarUrl)}
                  borderColor={authColors.border}
                  mutedColor={authColors.textMuted}
                />
              }
              cornerBadge={rankBadge(row)}
              title={row.username}
              subtitle={motto}
              meta={formatLeaderboardSpeciesMeta(row)}
            />
          </Pressable>
        );
      })}
    </>
  );
}

const styles = StyleSheet.create({
  rowPressed: {
    opacity: 0.92,
  },
});
