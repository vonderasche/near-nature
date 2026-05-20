import { FlashList } from '@shopify/flash-list';
import { useRouter } from 'expo-router';
import { useCallback, useMemo } from 'react';
import { ActivityIndicator, StyleSheet, Text, useWindowDimensions, View } from 'react-native';

import { AuthButton } from '@/components/auth/auth-button';
import { ExplorerBoardMemberGridTile } from '@/components/explorer-board/explorer-board-member-grid-tile';
import { ExplorerBoardMemberListItem } from '@/components/explorer-board/explorer-board-member-list-item';
import { InlineFormError } from '@/components/shared/inline-form-error';
import { useExplorerBoardDisplayUrls } from '@/hooks/useExplorerBoardDisplayUrls';
import { listSectionSupportingStyles } from '@/components/shared/list-detail-card';
import { authColors, authSpacing } from '@/constants/auth-theme';
import type { ExplorerBoardColumns } from '@/lib/explorerBoard/explorerBoardColumns';
import { minExplorerBoardTileSize } from '@/lib/explorerBoard/explorerBoardColumns';
import type { ExplorerBoardLayoutMode } from '@/lib/explorerBoard/explorerBoardLayout';
import { filterExplorerBoardRows } from '@/lib/explorerBoard/filterExplorerBoardRows';
import { routePublicUserProfile } from '@/lib/routing/routes';
import { isSearchQueryActive } from '@/lib/search/normalizeSearchQuery';
import type { ExplorerBoardMemberRow } from '@/services/explorerBoardService';

const LIST_ROW_ESTIMATE = 96;

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
 * Explorer Board: virtualized list cards or member image grid.
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
  const { width: windowWidth } = useWindowDimensions();
  const filteredRows = useMemo(
    () => filterExplorerBoardRows(rows, searchQuery),
    [rows, searchQuery],
  );
  const { resolveDisplayUrl } = useExplorerBoardDisplayUrls(
    loading && rows.length === 0 ? [] : filteredRows,
  );

  const compact = columnCount >= 4;
  const tileSize = useMemo(() => {
    const horizontalPadding = authSpacing.lg * 2;
    const gap = authSpacing.sm;
    const inner = Math.max(0, windowWidth - horizontalPadding);
    return Math.max(
      minExplorerBoardTileSize(columnCount),
      Math.floor((inner - gap * (columnCount - 1)) / columnCount),
    );
  }, [windowWidth, columnCount]);

  const gridRowEstimate = tileSize + (compact ? authSpacing.xs : tileSize * 0.35);

  const openMember = useCallback(
    (row: ExplorerBoardMemberRow) => {
      router.push(routePublicUserProfile(row.userId));
    },
    [router],
  );

  const renderListItem = useCallback(
    ({ item }: { item: ExplorerBoardMemberRow }) => (
      <ExplorerBoardMemberListItem
        row={item}
        resolveDisplayUrl={resolveDisplayUrl}
        onPressMember={openMember}
      />
    ),
    [openMember, resolveDisplayUrl],
  );

  const renderGridItem = useCallback(
    ({ item }: { item: ExplorerBoardMemberRow }) => (
      <ExplorerBoardMemberGridTile
        row={item}
        tileSize={tileSize}
        compact={compact}
        columnCount={columnCount}
        borderColor={authColors.border}
        mutedColor={authColors.textMuted}
        resolveDisplayUrl={resolveDisplayUrl}
        onPressMember={openMember}
      />
    ),
    [columnCount, compact, openMember, resolveDisplayUrl, tileSize],
  );

  if (error) {
    return <InlineFormError>{error}</InlineFormError>;
  }

  if (loading) {
    return (
      <View style={listSectionSupportingStyles.centered} accessibilityLabel="Loading Explorer Board">
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

  const isGrid = layoutMode === 'grid';
  const estimatedItemSize = isGrid ? gridRowEstimate : LIST_ROW_ESTIMATE;

  return (
    <View accessibilityLabel="Explorer Board, ranked by native species discovered">
      <View style={styles.listWrap}>
        <FlashList
          data={filteredRows}
          key={isGrid ? `grid-${columnCount}` : 'list'}
          numColumns={isGrid ? columnCount : 1}
          renderItem={isGrid ? renderGridItem : renderListItem}
          keyExtractor={(item) => item.userId}
          estimatedItemSize={estimatedItemSize}
          scrollEnabled={false}
          extraData={{ tileSize, columnCount, compact, layoutMode }}
        />
      </View>

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
              accessibilityLabel="Load more Explorer Board rankings"
            />
          )}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  listWrap: {
    minHeight: 2,
  },
  loadMoreWrap: {
    marginTop: authSpacing.md,
    alignItems: 'center',
    minHeight: 44,
    justifyContent: 'center',
  },
});
