import { useCallback, useState } from 'react';
import { RefreshControl, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';

import { AuthButton } from '@/components/auth/auth-button';
import { TabScreenWithLogout } from '@/components/layout/tab-screen-with-logout';
import { DetectionCountExplorerBoard } from '@/components/explorer-board/detection-count-explorer-board';
import { ExplorerBoardDiscoveryGrid } from '@/components/explorer-board/explorer-board-discovery-grid';
import { ExplorerBoardViewModeToggle } from '@/components/explorer-board/explorer-board-view-mode-toggle';
import { GridLayoutMenu } from '@/components/ui/grid-layout-menu';
import { ScreenSearchField } from '@/components/ui/screen-search-field';
import { useAuthContext } from '@/context/AuthContext';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { useExplorerBoard } from '@/hooks/useExplorerBoard';
import { useExplorerBoardColumns } from '@/hooks/useExplorerBoardColumns';
import { useExplorerBoardLayout } from '@/hooks/useExplorerBoardLayout';
import { usePublicDetectionExplore } from '@/hooks/usePublicDetectionExplore';
import { useTheme } from '@/hooks/useTheme';
import {
  EXPLORER_BOARD_COLUMN_OPTIONS,
  isExplorerBoardColumns,
} from '@/lib/explorerBoard/explorerBoardColumns';
import type { GalleryGridColumns } from '@/lib/detections/galleryGridColumns';
import { routes } from '@/lib/routing/routes';
import { isSearchQueryActive } from '@/lib/search/normalizeSearchQuery';

export default function ExplorerBoardScreen() {
  const { theme } = useTheme();
  const { isAuthenticated } = useAuthContext();
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearchQuery = useDebouncedValue(searchQuery, 280);
  const searchActive = isSearchQueryActive(debouncedSearchQuery);
  const {
    rows,
    isLoading: boardLoading,
    isRefreshing,
    isLoadingMore: boardLoadingMore,
    hasMore: boardHasMore,
    error: boardError,
    loadMore: loadMoreBoard,
    refetch: refetchBoard,
  } = useExplorerBoard();
  const {
    items: exploreItems,
    isLoading: exploreLoading,
    isLoadingMore: exploreLoadingMore,
    hasMore: exploreHasMore,
    totalCount: exploreTotalCount,
    error: exploreError,
    loadMore: loadMoreExplore,
    refetch: refetchExplore,
  } = usePublicDetectionExplore(debouncedSearchQuery);
  const { layoutMode, setLayout } = useExplorerBoardLayout();
  const { columns, setColumnCount } = useExplorerBoardColumns();

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      if (searchActive) {
        await refetchExplore();
      } else {
        await refetchBoard();
      }
    } finally {
      setRefreshing(false);
    }
  }, [refetchBoard, refetchExplore, searchActive]);

  const subtitle = searchActive
    ? 'Public identifications from the community matching your search.'
    : layoutMode === 'grid'
      ? "Ranked by native species discovered. Each tile shows a member's latest identification."
      : 'Ranked by native species discovered. Points and species counts per member.';

  return (
    <TabScreenWithLogout
      title="Explorer Board"
      subtitle={subtitle}
      hideLogout
      titleAccessory={
        searchActive ? null : (
          <View style={[styles.toolbar, { gap: theme.spacing.xs }]}>
            <ExplorerBoardViewModeToggle value={layoutMode} onChange={setLayout} />
            {layoutMode === 'grid' ? (
              <GridLayoutMenu
                value={columns}
                onChange={(n: GalleryGridColumns) => {
                  if (isExplorerBoardColumns(n)) setColumnCount(n);
                }}
                columnOptions={EXPLORER_BOARD_COLUMN_OPTIONS}
                context="explorer board"
              />
            ) : null}
          </View>
        )
      }
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor={theme.colors.textPrimary}
          colors={[theme.colors.textPrimary]}
        />
      }
      backgroundRefreshing={isRefreshing && !refreshing && !searchActive}>
      <ScreenSearchField
        value={searchQuery}
        onChangeText={setSearchQuery}
        placeholder="Search species, descriptions, or members…"
        accessibilityLabel="Search Explorer Board"
        accessibilityHint="When you type a species or keyword, shows matching public identifications. Leave empty for the rankings."
      />
      {searchActive ? (
        <>
          {exploreLoading ? (
            <Text style={[styles.searchHint, { color: theme.colors.textSecondary }]}>
              Searching community identifications…
            </Text>
          ) : null}
          <ExplorerBoardDiscoveryGrid
            items={exploreItems}
            loading={exploreLoading}
            isLoadingMore={exploreLoadingMore}
            hasMore={exploreHasMore}
            totalCount={exploreTotalCount}
            searchQuery={debouncedSearchQuery}
            error={exploreError}
            onRetry={() => void refetchExplore()}
            onLoadMore={() => void loadMoreExplore()}
          />
        </>
      ) : (
        <DetectionCountExplorerBoard
          rows={rows}
          layoutMode={layoutMode}
          columnCount={columns}
          loading={boardLoading}
          isLoadingMore={boardLoadingMore}
          hasMore={boardHasMore}
          onLoadMore={() => void loadMoreBoard()}
          error={boardError}
        />
      )}

      {!isAuthenticated ? (
        <AuthButton title="Log in to identify species" onPress={() => router.push(routes.login)} />
      ) : null}
    </TabScreenWithLogout>
  );
}

const styles = StyleSheet.create({
  toolbar: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  searchHint: {
    fontSize: 13,
    lineHeight: 18,
  },
});
