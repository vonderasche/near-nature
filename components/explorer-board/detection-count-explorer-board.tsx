import { useRouter } from 'expo-router';
import { useMemo } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { AuthButton } from '@/components/auth/auth-button';
import { ExplorerBoardMemberGrid } from '@/components/explorer-board/explorer-board-member-grid';
import { ExplorerBoardMemberList } from '@/components/explorer-board/explorer-board-member-list';
import { InlineFormError } from '@/components/shared/inline-form-error';
import { useExplorerBoardDisplayUrls } from '@/hooks/useExplorerBoardDisplayUrls';
import { listSectionSupportingStyles } from '@/components/shared/list-detail-card';
import { authColors, authSpacing } from '@/constants/auth-theme';
import type { ExplorerBoardColumns } from '@/lib/explorerBoard/explorerBoardColumns';
import type { ExplorerBoardLayoutMode } from '@/lib/explorerBoard/explorerBoardLayout';
import { filterExplorerBoardRows } from '@/lib/explorerBoard/filterExplorerBoardRows';
import { routePublicUserProfile } from '@/lib/routing/routes';
import { isSearchQueryActive } from '@/lib/search/normalizeSearchQuery';
import type { ExplorerBoardMemberRow } from '@/services/explorerBoardService';

type Props = {
  rows: ExplorerBoardMemberRow[];
  searchQuery: string;
  layoutMode: ExplorerBoardLayoutMode;
  columnCount: ExplorerBoardColumns;
  loading: boolean;
  isLoadingMore?: boolean;
  hasMore?: boolean;
  onLoadMore?: () => void;
  error: string | null;
};

/**
 * Explorer board: list cards or member image grid (latest identification per tile).
 */
export function DetectionCountExplorerBoard({
  rows,
  searchQuery,
  layoutMode,
  columnCount,
  loading,
  isLoadingMore = false,
  hasMore = false,
  onLoadMore,
  error,
}: Props) {
  const router = useRouter();
  const filteredRows = useMemo(
    () => filterExplorerBoardRows(rows, searchQuery),
    [rows, searchQuery],
  );
  const { resolveDisplayUrl } = useExplorerBoardDisplayUrls(
    loading && rows.length === 0 ? [] : filteredRows,
  );

  const openMember = (row: ExplorerBoardMemberRow) => {
    router.push(routePublicUserProfile(row.userId));
  };

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
      <Text style={listSectionSupportingStyles.muted}>
        No rankings yet. Save identifications to appear here.
      </Text>
    );
  }

  if (filteredRows.length === 0 && isSearchQueryActive(searchQuery)) {
    return (
      <Text style={listSectionSupportingStyles.muted}>
        {`No members match "${searchQuery.trim()}". Try another username or motto.`}
      </Text>
    );
  }

  return (
    <View accessibilityLabel="Explorer board by native species discovered">
      {layoutMode === 'grid' ? (
        <ExplorerBoardMemberGrid
          rows={filteredRows}
          columnCount={columnCount}
          borderColor={authColors.border}
          mutedColor={authColors.textMuted}
          resolveDisplayUrl={resolveDisplayUrl}
          onPressMember={openMember}
        />
      ) : (
        <ExplorerBoardMemberList
          rows={filteredRows}
          resolveDisplayUrl={resolveDisplayUrl}
          onPressMember={openMember}
        />
      )}

      {hasMore && onLoadMore ? (
        <View style={styles.loadMoreWrap}>
          {isLoadingMore ? (
            <ActivityIndicator color={authColors.textMuted} accessibilityLabel="Loading more rankings" />
          ) : (
            <AuthButton
              title="Load more"
              variant="outline"
              onPress={onLoadMore}
              fillParent
              accessibilityLabel="Load more explorer board rankings"
            />
          )}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  loadMoreWrap: {
    marginTop: authSpacing.md,
    alignItems: 'center',
    minHeight: 44,
    justifyContent: 'center',
  },
});
