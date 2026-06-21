import { FlashList } from '@shopify/flash-list';
import { useCallback } from 'react';
import { StyleSheet, View } from 'react-native';

import { DetectionGalleryListItem } from '@/components/profile/detection-gallery-list-item';
import {
  DetectionGalleryLoadMore,
  DetectionGalleryOverlays,
  DetectionGalleryStatus,
} from '@/components/profile/detection-gallery-overlays';
import { useGalleryItemActions } from '@/hooks/useGalleryItemActions';
import { GALLERY_FLASH_LIST_DRAW_DISTANCE, GALLERY_LIST_ROW_HEIGHT } from '@/lib/detections/galleryGridColumns';
import type { DetectionGalleryItem } from '@/types';
import type { UserFacingResult } from '@/types/user-facing-result';

type DetectionGalleryListProps = {
  items: DetectionGalleryItem[];
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

export function DetectionGalleryList({
  items,
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
}: DetectionGalleryListProps) {
  const actions = useGalleryItemActions({
    items,
    deletable,
    onDeleteItem,
    deletingId,
    onOpenDetection,
  });

  const renderItem = useCallback(
    ({ item }: { item: DetectionGalleryItem }) => (
      <DetectionGalleryListItem
        item={item}
        deletable={deletable}
        onPress={() => actions.handlePressItemId(item.id)}
        onLongPress={deletable && onDeleteItem ? () => actions.handleLongPressItemId(item.id) : undefined}
      />
    ),
    [actions.handleLongPressItemId, actions.handlePressItemId, deletable, onDeleteItem],
  );

  const overrideItemLayout = useCallback((layout: { span?: number; size?: number }) => {
    layout.size = GALLERY_LIST_ROW_HEIGHT;
  }, []);

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
      <View accessibilityLabel="Saved identification list" style={styles.listWrap}>
        <FlashList
          data={items}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
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
