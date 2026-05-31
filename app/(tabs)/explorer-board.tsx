import { useCallback, useState } from 'react';
import { RefreshControl, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';

import { AuthButton } from '@/components/auth/auth-button';
import { TabScreenWithLogout } from '@/components/layout/tab-screen-with-logout';
import { DetectionCountExplorerBoard } from '@/components/explorer-board/detection-count-explorer-board';
import { ExplorerBoardViewModeToggle } from '@/components/explorer-board/explorer-board-view-mode-toggle';
import { GridLayoutMenu } from '@/components/ui/grid-layout-menu';
import { ScreenSearchField } from '@/components/ui/screen-search-field';
import { authColors, authSpacing } from '@/constants/auth-theme';
import { useAuthContext } from '@/context/AuthContext';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { useExplorerBoard } from '@/hooks/useExplorerBoard';
import { useExplorerBoardColumns } from '@/hooks/useExplorerBoardColumns';
import { useExplorerBoardLayout } from '@/hooks/useExplorerBoardLayout';
import {
  EXPLORER_BOARD_COLUMN_OPTIONS,
  isExplorerBoardColumns,
} from '@/lib/explorerBoard/explorerBoardColumns';
import type { GalleryGridColumns } from '@/lib/detections/galleryGridColumns';
import { routes } from '@/lib/routing/routes';
import { isSearchQueryActive } from '@/lib/search/normalizeSearchQuery';

export default function ExplorerBoardScreen() {
  const { isAuthenticated } = useAuthContext();
  const router = useRouter();
  const { rows, isLoading, isRefreshing, isLoadingMore, hasMore, error, loadMore, refetch } =
    useExplorerBoard();
  const { layoutMode, setLayout } = useExplorerBoardLayout();
  const { columns, setColumnCount } = useExplorerBoardColumns();
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearchQuery = useDebouncedValue(searchQuery, 280);
  const searchActive = isSearchQueryActive(debouncedSearchQuery);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await refetch();
    } finally {
      setRefreshing(false);
    }
  }, [refetch]);

  const subtitle =
    layoutMode === 'grid'
      ? "Ranked by native species discovered. Each tile shows a member's latest identification."
      : 'Ranked by native species discovered. Points and species counts per member.';

  return (
    <TabScreenWithLogout
      title="Explorer Board"
      subtitle={subtitle}
      hideLogout
      titleAccessory={
        <View style={styles.toolbar}>
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
      }
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor={authColors.text}
          colors={[authColors.text]}
        />
      }
      backgroundRefreshing={isRefreshing && !refreshing}>
      <ScreenSearchField
        value={searchQuery}
        onChangeText={setSearchQuery}
        placeholder="Search loaded members…"
        accessibilityLabel="Search Explorer Board members"
        accessibilityHint="Filters members already loaded on this device. Scroll or pull to refresh to load more."
      />
      {searchActive ? (
        <Text style={styles.searchHint}>
          Search only includes members already loaded. Pull to refresh or scroll down to load more,
          then search again.
        </Text>
      ) : null}
      <DetectionCountExplorerBoard
        rows={rows}
        searchQuery={debouncedSearchQuery}
        layoutMode={layoutMode}
        columnCount={columns}
        loading={isLoading}
        isLoadingMore={isLoadingMore}
        hasMore={hasMore}
        onLoadMore={() => void loadMore()}
        error={error}
      />

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
    gap: authSpacing.xs,
  },
  searchHint: {
    fontSize: 13,
    lineHeight: 18,
    color: authColors.textMuted,
  },
});
