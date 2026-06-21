import { FlashList } from '@shopify/flash-list';
import { useCallback, useMemo } from 'react';
import { StyleSheet, useWindowDimensions, View } from 'react-native';

import { DetectionGalleryRow } from '@/components/profile/detection-gallery-row';
import {
  DetectionGalleryLoadMore,
  DetectionGalleryOverlays,
  DetectionGalleryStatus,
} from '@/components/profile/detection-gallery-overlays';
import { authSpacing } from '@/constants/auth-theme';
import { useGalleryItemActions } from '@/hooks/useGalleryItemActions';
import { buildGalleryListEntries, type GalleryListRowEntry } from '@/lib/detections/buildGalleryListEntries';
import {
  GALLERY_FLASH_LIST_DRAW_DISTANCE,
  galleryFlashListRowHeight,
  minGalleryTileSize,
  type GalleryGridColumns,
} from '@/lib/detections/galleryGridColumns';
import type { DetectionGalleryItem } from '@/types';
import type { UserFacingResult } from '@/types/user-facing-result';

type DetectionGalleryGridProps = {
  items: DetectionGalleryItem[];
  columnCount: GalleryGridColumns;
  loading: boolean;
  hasMore?: boolean;
  isLoadingMore?: boolean;
  onLoadMore?: () => void;
  error: string | null;
  onRetry: () => void;
  emptyMessage?: string;
  searchQuery?: string;
  sourceItemCount?: number;
  deletable?: boolean;
  onDeleteItem?: (item: DetectionGalleryItem) => Promise<UserFacingResult>;
  deletingId?: string | null;
  onViewMemberProfile?: (userId: string) => void;
  onOpenDetection?: (item: DetectionGalleryItem) => void;
};

export function DetectionGalleryGrid({
  items,
  columnCount,
  loading,
  hasMore = false,
  isLoadingMore = false,
  onLoadMore,
  error,
  onRetry,
  emptyMessage = 'No saved photos yet. Save an identification from the camera flow.',
  searchQuery = '',
  sourceItemCount = 0,
  deletable = false,
  onDeleteItem,
  deletingId = null,
  onViewMemberProfile,
  onOpenDetection,
}: DetectionGalleryGridProps) {
  const { width: windowWidth } = useWindowDimensions();
  const actions = useGalleryItemActions({
    items,
    deletable,
    onDeleteItem,
    deletingId,
    onOpenDetection,
  });

  const tileGap = authSpacing.sm;
  const tileSize = useMemo(() => {
    const horizontalPadding = authSpacing.lg * 2;
    const inner = Math.max(0, windowWidth - horizontalPadding);
    return Math.max(
      minGalleryTileSize(columnCount),
      Math.floor((inner - tileGap * (columnCount - 1)) / columnCount),
    );
  }, [windowWidth, columnCount, tileGap]);

  const listData = useMemo(
    () => buildGalleryListEntries(items, columnCount),
    [items, columnCount],
  );

  const rowHeight = galleryFlashListRowHeight(tileSize, tileGap);

  const renderItem = useCallback(
    ({ item }: { item: GalleryListRowEntry }) => (
      <DetectionGalleryRow
        row={item}
        tileSize={tileSize}
        tileGap={tileGap}
        deletable={deletable}
        onPressItemId={actions.handlePressItemId}
        onLongPressItemId={deletable && onDeleteItem ? actions.handleLongPressItemId : undefined}
      />
    ),
    [actions.handleLongPressItemId, actions.handlePressItemId, deletable, onDeleteItem, tileGap, tileSize],
  );

  const overrideItemLayout = useCallback(
    (layout: { span?: number; size?: number }) => {
      layout.size = rowHeight;
    },
    [rowHeight],
  );

  const status = (
    <DetectionGalleryStatus
      error={error}
      loading={loading}
      itemsCount={items.length}
      emptyMessage={emptyMessage}
      searchQuery={searchQuery}
      sourceItemCount={sourceItemCount}
      onRetry={onRetry}
    />
  );

  if (error || (loading && items.length === 0) || items.length === 0) {
    return status;
  }

  return (
    <>
      <View accessibilityLabel="Saved identification photos" style={styles.listWrap}>
        <FlashList
          data={listData}
          renderItem={renderItem}
          keyExtractor={(entry) => entry.id}
          scrollEnabled={false}
          drawDistance={GALLERY_FLASH_LIST_DRAW_DISTANCE}
          overrideItemLayout={overrideItemLayout}
        />
      </View>

      <DetectionGalleryLoadMore
        visible={hasMore && Boolean(onLoadMore)}
        isLoadingMore={isLoadingMore}
        onLoadMore={onLoadMore}
      />

      <DetectionGalleryOverlays
        actions={actions}
        onCloseDetail={actions.closeDetail}
        onViewMemberProfile={onViewMemberProfile}
      />
    </>
  );
}

const styles = StyleSheet.create({
  listWrap: {
    minHeight: 2,
  },
});
