import { FlashList } from '@shopify/flash-list';
import { useRouter } from 'expo-router';
import { useCallback, useMemo } from 'react';
import { ActivityIndicator, StyleSheet, Text, useWindowDimensions, View } from 'react-native';

import { AuthButton } from '@/components/auth/auth-button';
import { ExplorerBoardMemberGridTile } from '@/components/explorer-board/explorer-board-member-grid-tile';
import { ExplorerBoardMemberListItem } from '@/components/explorer-board/explorer-board-member-list-item';
import { CenteredActivityIndicator } from '@/components/shared/centered-activity-indicator';
import { InlineFormError } from '@/components/shared/inline-form-error';
import { useExplorerBoardDisplayUrls } from '@/hooks/useExplorerBoardDisplayUrls';
import { useListSectionSupportingStyles } from '@/components/shared/list-detail-card';
import { useTheme } from '@/hooks/useTheme';
import type { ExplorerBoardColumns } from '@/lib/explorerBoard/explorerBoardColumns';
import {
  EXPLORER_BOARD_FLASH_LIST_DRAW_DISTANCE,
  minExplorerBoardTileSize,
} from '@/lib/explorerBoard/explorerBoardColumns';
import type { ExplorerBoardLayoutMode } from '@/lib/explorerBoard/explorerBoardLayout';
import { routePublicUserProfile } from '@/lib/routing/routes';
import type { ExplorerBoardMemberRow } from '@/services/explorerBoardService';

type Props = {
  rows: ExplorerBoardMemberRow[];
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
  layoutMode,
  columnCount,
  loading,
  isLoadingMore = false,
  hasMore = false,
  onLoadMore,
  error,
}: Props) {
  const { theme } = useTheme();
  const listSectionSupportingStyles = useListSectionSupportingStyles();
  const router = useRouter();
  const { width: windowWidth } = useWindowDimensions();
  const { resolveDisplayUrl } = useExplorerBoardDisplayUrls(
    loading && rows.length === 0 ? [] : rows,
  );

  const compact = columnCount >= 4;
  const tileSize = useMemo(() => {
    const horizontalPadding = theme.spacing.lg * 2;
    const gap = theme.spacing.sm;
    const inner = Math.max(0, windowWidth - horizontalPadding);
    return Math.max(
      minExplorerBoardTileSize(columnCount),
      Math.floor((inner - gap * (columnCount - 1)) / columnCount),
    );
  }, [windowWidth, columnCount, theme.spacing.lg, theme.spacing.sm]);

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
        resolveDisplayUrl={resolveDisplayUrl}
        onPressMember={openMember}
      />
    ),
    [columnCount, compact, openMember, resolveDisplayUrl, tileSize],
  );

  const isGrid = layoutMode === 'grid';
  const gridRowHeight = tileSize + theme.spacing.sm;

  const overrideGridItemLayout = useCallback(
    (layout: { span?: number; size?: number }) => {
      if (isGrid) {
        layout.size = gridRowHeight;
      }
    },
    [gridRowHeight, isGrid],
  );

  if (error) {
    return <InlineFormError>{error}</InlineFormError>;
  }

  if (loading) {
    return (
      <CenteredActivityIndicator
        color={theme.colors.textSecondary}
        accessibilityLabel="Loading Rankings"
      />
    );
  }

  if (rows.length === 0) {
    return (
      <Text style={listSectionSupportingStyles.muted}>
        No rankings yet. Save identifications to appear here.
      </Text>
    );
  }

  return (
    <View accessibilityLabel="Rankings, sorted by native species discovered">
      <View style={styles.listWrap}>
        <FlashList
          data={rows}
          key={isGrid ? `grid-${columnCount}` : 'list'}
          numColumns={isGrid ? columnCount : 1}
          renderItem={isGrid ? renderGridItem : renderListItem}
          keyExtractor={(item) => item.userId}
          scrollEnabled={false}
          drawDistance={EXPLORER_BOARD_FLASH_LIST_DRAW_DISTANCE}
          overrideItemLayout={isGrid ? overrideGridItemLayout : undefined}
        />
      </View>

      {hasMore && onLoadMore ? (
        <View style={[styles.loadMoreWrap, { marginTop: theme.spacing.md }]}>
          {isLoadingMore ? (
            <ActivityIndicator
              color={theme.colors.textSecondary}
              accessibilityLabel="Loading more rankings"
            />
          ) : (
            <AuthButton
              title="Load more"
              variant="outline"
              onPress={onLoadMore}
              fillParent
              accessibilityLabel="Load more Rankings"
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
    alignItems: 'center',
    minHeight: 44,
    justifyContent: 'center',
  },
});
