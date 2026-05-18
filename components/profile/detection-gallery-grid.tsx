import { FlashList } from '@shopify/flash-list';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, useWindowDimensions, View } from 'react-native';

import { AuthButton } from '@/components/auth/auth-button';
import { DetectionGalleryDetailModal } from '@/components/profile/detection-gallery-detail-modal';
import { DetectionGalleryTile } from '@/components/profile/detection-gallery-tile';
import { ThemedConfirmModal, ThemedMessageModal } from '@/components/ui/themed-sheet-dialog';
import { ThemedText } from '@/components/themed-text';
import { authColors, authSpacing } from '@/constants/auth-theme';
import { buildGalleryListEntries, type GalleryListEntry } from '@/lib/detections/buildGalleryListEntries';
import { formatGalleryNativeCategoryLabel } from '@/lib/detections/galleryNativeCategory';
import { minGalleryTileSize, type GalleryGridColumns } from '@/lib/detections/galleryGridColumns';
import { isSearchQueryActive } from '@/lib/search/normalizeSearchQuery';
import type { DetectionGalleryItem, GalleryNativeCategory } from '@/types';
import { userFacingErr, type UserFacingResult } from '@/types/user-facing-result';

type DetectionGalleryGridProps = {
  items: DetectionGalleryItem[];
  columnCount: GalleryGridColumns;
  loading: boolean;
  hasMore?: boolean;
  isLoadingMore?: boolean;
  onLoadMore?: () => void;
  error: string | null;
  onRetry: () => void;
  borderColor: string;
  mutedColor: string;
  activityColor: string;
  emptyMessage?: string;
  searchQuery?: string;
  sourceItemCount?: number;
  deletable?: boolean;
  onDeleteItem?: (item: DetectionGalleryItem) => Promise<UserFacingResult>;
  deletingId?: string | null;
};

const SECTION_HEADER_HEIGHT = 36;

/**
 * Virtualized gallery grid (FlashList, scroll disabled — parent profile ScrollView scrolls).
 */
export function DetectionGalleryGrid({
  items,
  columnCount,
  loading,
  hasMore = false,
  isLoadingMore = false,
  onLoadMore,
  error,
  onRetry,
  borderColor,
  mutedColor,
  activityColor,
  emptyMessage = 'No saved photos yet. Save an identification from the camera flow.',
  searchQuery = '',
  sourceItemCount = 0,
  deletable = false,
  onDeleteItem,
  deletingId = null,
}: DetectionGalleryGridProps) {
  const { width: windowWidth } = useWindowDimensions();
  const [selected, setSelected] = useState<DetectionGalleryItem | null>(null);
  const [pendingDelete, setPendingDelete] = useState<DetectionGalleryItem | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    if (!deletable || !onDeleteItem) {
      setPendingDelete(null);
      setDeleteError(null);
      setDeleteLoading(false);
    }
  }, [deletable, onDeleteItem]);

  const requestDelete = useCallback(
    async (it: DetectionGalleryItem): Promise<UserFacingResult> => {
      if (!onDeleteItem) return userFacingErr('Delete is not available.');
      const r = await onDeleteItem(it);
      if (r.ok) setSelected(null);
      return r;
    },
    [onDeleteItem],
  );

  const confirmDeleteFromSheet = useCallback(async () => {
    if (!pendingDelete) return;
    setDeleteLoading(true);
    try {
      const res = await requestDelete(pendingDelete);
      if (!res.ok) {
        setDeleteError(res.message);
      }
      setPendingDelete(null);
    } finally {
      setDeleteLoading(false);
    }
  }, [pendingDelete, requestDelete]);

  const confirmAndDelete = useCallback(
    (it: DetectionGalleryItem) => {
      if (!onDeleteItem) return;
      setPendingDelete(it);
    },
    [onDeleteItem],
  );

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

  const estimatedRowHeight = tileSize + tileGap;

  const renderItem = useCallback(
    ({ item }: { item: GalleryListEntry }) => {
      if (item.kind === 'section') {
        return (
          <ThemedText
            type="defaultSemiBold"
            style={[styles.sectionTitle, { color: mutedColor, height: SECTION_HEADER_HEIGHT }]}>
            {formatGalleryNativeCategoryLabel(item.category)}
          </ThemedText>
        );
      }

      const category: GalleryNativeCategory =
        item.items[0]?.nativeCategory === 'native' ? 'native' : 'non-native';

      return (
        <View style={[styles.row, { gap: tileGap, marginBottom: tileGap, height: tileSize }]}>
          {item.items.map((tile) => (
            <DetectionGalleryTile
              key={tile.id}
              item={tile}
              category={category}
              size={tileSize}
              borderColor={borderColor}
              deletable={deletable}
              onPress={() => setSelected(tile)}
              onLongPress={deletable && onDeleteItem ? () => confirmAndDelete(tile) : undefined}
            />
          ))}
        </View>
      );
    },
    [
      borderColor,
      confirmAndDelete,
      deletable,
      mutedColor,
      onDeleteItem,
      tileGap,
      tileSize,
    ],
  );

  const overrideItemLayout = useCallback(
    (layout: { span?: number; size?: number }, item: GalleryListEntry) => {
      if (item.kind === 'section') {
        layout.size = SECTION_HEADER_HEIGHT + authSpacing.sm;
      } else {
        layout.size = estimatedRowHeight;
      }
    },
    [estimatedRowHeight],
  );

  if (error) {
    return (
      <View style={styles.messageBlock}>
        <ThemedText style={[styles.message, { color: mutedColor }]}>{error}</ThemedText>
        <Pressable
          onPress={onRetry}
          accessibilityRole="button"
          accessibilityLabel="Retry loading gallery">
          <ThemedText type="link" style={styles.retry}>
            Try again
          </ThemedText>
        </Pressable>
      </View>
    );
  }

  if (loading && items.length === 0) {
    return (
      <View style={styles.loaderWrap} accessibilityLabel="Loading gallery">
        <ActivityIndicator color={activityColor} />
      </View>
    );
  }

  if (items.length === 0) {
    const searchActive = isSearchQueryActive(searchQuery);
    const message =
      searchActive && sourceItemCount > 0
        ? `No identifications match "${searchQuery.trim()}". Try another name or keyword from the description.`
        : emptyMessage;
    return <ThemedText style={[styles.empty, { color: mutedColor }]}>{message}</ThemedText>;
  }

  const showLoadMore = hasMore && Boolean(onLoadMore);

  return (
    <>
      <View accessibilityLabel="Saved identification photos" style={styles.listWrap}>
        <FlashList
          data={listData}
          renderItem={renderItem}
          keyExtractor={(entry) => entry.id}
          estimatedItemSize={estimatedRowHeight}
          scrollEnabled={false}
          overrideItemLayout={overrideItemLayout}
          extraData={{ tileSize, columnCount, borderColor, deletable }}
        />
      </View>

      {showLoadMore ? (
        <View style={styles.loadMoreWrap}>
          {isLoadingMore ? (
            <ActivityIndicator color={activityColor} accessibilityLabel="Loading more photos" />
          ) : (
            <AuthButton
              title="Load more"
              variant="outline"
              onPress={onLoadMore!}
              fillParent
              accessibilityLabel="Load more gallery photos"
            />
          )}
        </View>
      ) : null}

      <DetectionGalleryDetailModal
        visible={selected !== null}
        item={selected}
        onClose={() => setSelected(null)}
        deletable={Boolean(deletable && onDeleteItem)}
        onRequestDelete={deletable && onDeleteItem ? requestDelete : undefined}
        deleteBusy={Boolean(selected && deletingId === selected.id)}
      />

      <ThemedConfirmModal
        visible={pendingDelete !== null}
        title="Delete this photo?"
        message="It will be removed from your gallery. This cannot be undone."
        confirmLabel="Delete"
        onCancel={() => setPendingDelete(null)}
        onConfirm={confirmDeleteFromSheet}
        confirmLoading={deleteLoading || Boolean(pendingDelete && deletingId === pendingDelete.id)}
      />
      <ThemedMessageModal
        visible={deleteError !== null}
        title="Could not delete"
        message={deleteError ?? ''}
        onDismiss={() => setDeleteError(null)}
      />
    </>
  );
}

const styles = StyleSheet.create({
  listWrap: {
    minHeight: 2,
  },
  sectionTitle: {
    fontSize: 15,
    marginBottom: authSpacing.sm,
    justifyContent: 'center',
  },
  row: {
    flexDirection: 'row',
    flexWrap: 'nowrap',
  },
  loaderWrap: {
    paddingVertical: authSpacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  messageBlock: {
    gap: authSpacing.sm,
  },
  message: {
    fontSize: 14,
  },
  retry: {
    alignSelf: 'flex-start',
  },
  empty: {
    fontSize: 14,
    lineHeight: 20,
  },
  loadMoreWrap: {
    marginTop: authSpacing.md,
    alignItems: 'center',
    minHeight: 44,
    justifyContent: 'center',
  },
});
