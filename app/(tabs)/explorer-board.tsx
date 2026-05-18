import { useCallback, useState } from 'react';
import { RefreshControl, StyleSheet, View } from 'react-native';

import { TabScreenWithLogout } from '@/components/layout/tab-screen-with-logout';
import { DetectionCountExplorerBoard } from '@/components/explorer-board/detection-count-explorer-board';
import { ExplorerBoardViewModeToggle } from '@/components/explorer-board/explorer-board-view-mode-toggle';
import { GridLayoutMenu } from '@/components/ui/grid-layout-menu';
import { ScreenSearchField } from '@/components/ui/screen-search-field';
import { authColors, authSpacing } from '@/constants/auth-theme';
import { Colors } from '@/constants/auth-theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useExplorerBoard } from '@/hooks/useExplorerBoard';
import { useExplorerBoardColumns } from '@/hooks/useExplorerBoardColumns';
import { useExplorerBoardLayout } from '@/hooks/useExplorerBoardLayout';
import {
  EXPLORER_BOARD_COLUMN_OPTIONS,
  isExplorerBoardColumns,
} from '@/lib/explorerBoard/explorerBoardColumns';
import type { GalleryGridColumns } from '@/lib/detections/galleryGridColumns';

export default function ExplorerBoardScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const tint = Colors[colorScheme].tint;
  const { rows, isLoading, isLoadingMore, hasMore, error, loadMore, refetch } =
    useExplorerBoard();
  const { layoutMode, setLayout } = useExplorerBoardLayout();
  const { columns, setColumnCount } = useExplorerBoardColumns();
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

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
          <ExplorerBoardViewModeToggle
            value={layoutMode}
            onChange={setLayout}
            mutedColor={authColors.textMuted}
          />
          {layoutMode === 'grid' ? (
            <GridLayoutMenu
              value={columns}
              onChange={(n: GalleryGridColumns) => {
                if (isExplorerBoardColumns(n)) setColumnCount(n);
              }}
              columnOptions={EXPLORER_BOARD_COLUMN_OPTIONS}
              mutedColor={authColors.textMuted}
              borderColor={authColors.border}
              context="explorer board"
            />
          ) : null}
        </View>
      }
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor={tint}
          colors={[tint]}
        />
      }>
      <ScreenSearchField
        value={searchQuery}
        onChangeText={setSearchQuery}
        placeholder="Search username or motto…"
        accessibilityLabel="Search explorer board members"
      />
      <DetectionCountExplorerBoard
        rows={rows}
        searchQuery={searchQuery}
        layoutMode={layoutMode}
        columnCount={columns}
        loading={isLoading}
        isLoadingMore={isLoadingMore}
        hasMore={hasMore}
        onLoadMore={() => void loadMore()}
        error={error}
      />
    </TabScreenWithLogout>
  );
}

const styles = StyleSheet.create({
  toolbar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: authSpacing.xs,
  },
});
