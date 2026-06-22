import { FlashList } from '@shopify/flash-list';
import { useCallback, useMemo } from 'react';
import { StyleSheet, useWindowDimensions, View } from 'react-native';

import { DiscoverGridRow } from '@/components/discover/discover-grid-row';
import { useTheme } from '@/hooks/useTheme';
import {
  buildDiscoverGridRows,
  type DiscoverGridItem,
  type DiscoverGridRowEntry,
} from '@/lib/discover/buildDiscoverGridRows';
import {
  discoverGridFlashListRowHeight,
  DISCOVER_FLASH_LIST_DRAW_DISTANCE,
} from '@/lib/discover/discoverFlashListLayout';
import {
  minGalleryTileSize,
  type GalleryGridColumns,
} from '@/lib/detections/galleryGridColumns';

export type { DiscoverGridItem } from '@/lib/discover/buildDiscoverGridRows';

type Props = {
  items: readonly DiscoverGridItem[];
  columnCount: GalleryGridColumns;
  accessibilityLabel?: string;
};

export function DiscoverItemGrid({
  items,
  columnCount,
  accessibilityLabel = 'Discover grid',
}: Props) {
  const { theme } = useTheme();
  const { width: windowWidth } = useWindowDimensions();
  const tileGap = theme.spacing.sm;
  const titleGap = theme.spacing.xs;
  const tileSize = useMemo(() => {
    const horizontalPadding = theme.spacing.lg * 2;
    const inner = Math.max(0, windowWidth - horizontalPadding);
    return Math.max(
      minGalleryTileSize(columnCount),
      Math.floor((inner - tileGap * (columnCount - 1)) / columnCount),
    );
  }, [columnCount, theme.spacing.lg, tileGap, windowWidth]);

  const listData = useMemo(
    () => buildDiscoverGridRows(items, columnCount),
    [columnCount, items],
  );

  const rowHeight = discoverGridFlashListRowHeight(tileSize, tileGap, titleGap);

  const renderItem = useCallback(
    ({ item }: { item: DiscoverGridRowEntry }) => (
      <DiscoverGridRow row={item} tileSize={tileSize} tileGap={tileGap} rowHeight={rowHeight} />
    ),
    [rowHeight, tileGap, tileSize],
  );

  const overrideItemLayout = useCallback(
    (layout: { span?: number; size?: number }) => {
      layout.size = rowHeight;
    },
    [rowHeight],
  );

  if (items.length === 0) {
    return null;
  }

  return (
    <View accessibilityLabel={accessibilityLabel} style={styles.listWrap}>
      <FlashList
        data={listData}
        renderItem={renderItem}
        keyExtractor={(entry) => entry.id}
        scrollEnabled={false}
        drawDistance={DISCOVER_FLASH_LIST_DRAW_DISTANCE}
        overrideItemLayout={overrideItemLayout}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  listWrap: {
    minHeight: 2,
  },
});
