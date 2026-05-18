import { Pressable, StyleSheet } from 'react-native';

import { ExplorerBoardMemberAvatar } from '@/components/explorer-board/explorer-board-member-avatar';
import { ListDetailCard } from '@/components/shared/list-detail-card';
import { authColors } from '@/constants/auth-theme';
import {
  formatExplorerBoardAccessibilityCounts,
  formatExplorerBoardSpeciesMeta,
} from '@/lib/explorerBoard/formatExplorerBoardSpeciesCounts';
import { parseExplorerBoardMotto } from '@/lib/explorerBoard/formatExplorerBoardMotto';
import type { ExplorerBoardMemberRow } from '@/services/explorerBoardService';

type Props = {
  row: ExplorerBoardMemberRow;
  resolveDisplayUrl: (storedUrl: string | null | undefined) => string | null;
  onPressMember: (row: ExplorerBoardMemberRow) => void;
};

function rankBadge(row: ExplorerBoardMemberRow): string | null {
  return row.rank > 0 ? String(row.rank) : null;
}

function accessibilityTitle(row: ExplorerBoardMemberRow): string {
  return row.rank > 0 ? `Rank ${row.rank}, ${row.username}` : row.username;
}

export function ExplorerBoardMemberListItem({ row, resolveDisplayUrl, onPressMember }: Props) {
  const motto = parseExplorerBoardMotto(row.motto);
  const a11yTitle = accessibilityTitle(row);

  return (
    <Pressable
      onPress={() => onPressMember(row)}
      style={({ pressed }) => pressed && styles.rowPressed}
      android_ripple={{ color: 'rgba(255,255,255,0.08)' }}
      accessibilityRole="button"
      accessibilityHint="Opens this member's public profile"
      accessibilityLabel={`${a11yTitle}, ${motto ?? 'No motto'}, ${formatExplorerBoardAccessibilityCounts(row)}`}>
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
        meta={formatExplorerBoardSpeciesMeta(row)}
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  rowPressed: {
    opacity: 0.92,
  },
});
