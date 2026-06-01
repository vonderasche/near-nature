import { FlashList } from '@shopify/flash-list';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';

import { AuthButton } from '@/components/auth/auth-button';
import { DetectionGalleryDetailModal } from '@/components/profile/detection-gallery-detail-modal';
import {
  DetectionGalleryListItem,
} from '@/components/profile/detection-gallery-list-item';
import { CenteredActivityIndicator } from '@/components/shared/centered-activity-indicator';
import { ThemedConfirmModal, ThemedMessageModal } from '@/components/ui/themed-sheet-dialog';
import { ThemedText } from '@/components/themed-text';
import { authColors, authSpacing } from '@/constants/auth-theme';
import { GALLERY_FLASH_LIST_DRAW_DISTANCE, GALLERY_LIST_ROW_HEIGHT } from '@/lib/detections/galleryGridColumns';
import { isSearchQueryActive } from '@/lib/search/normalizeSearchQuery';
import type { DetectionGalleryItem } from '@/types';
import { userFacingErr, type UserFacingResult } from '@/types/user-facing-result';

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
};

/**
 * Virtualized bordered list of saved identifications (parent ScrollView scrolls).
 */
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
}: DetectionGalleryListProps) {
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

  const itemsById = useMemo(() => new Map(items.map((item) => [item.id, item])), [items]);

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

  const handlePressItemId = useCallback(
    (itemId: string) => {
      const item = itemsById.get(itemId);
      if (item) setSelected(item);
    },
    [itemsById],
  );

  const handleLongPressItemId = useCallback(
    (itemId: string) => {
      if (!onDeleteItem) return;
      const item = itemsById.get(itemId);
      if (item) setPendingDelete(item);
    },
    [itemsById, onDeleteItem],
  );

  const renderItem = useCallback(
    ({ item }: { item: DetectionGalleryItem }) => (
      <DetectionGalleryListItem
        item={item}
        deletable={deletable}
        onPress={() => handlePressItemId(item.id)}
        onLongPress={deletable && onDeleteItem ? () => handleLongPressItemId(item.id) : undefined}
      />
    ),
    [deletable, handleLongPressItemId, handlePressItemId, onDeleteItem],
  );

  if (error) {
    return (
      <View style={styles.messageBlock}>
        <ThemedText style={[styles.message, { color: authColors.textMuted }]}>{error}</ThemedText>
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
    return <CenteredActivityIndicator accessibilityLabel="Loading gallery" />;
  }

  if (items.length === 0) {
    const searchActive = isSearchQueryActive(searchQuery);
    const message =
      searchActive && sourceItemCount > 0
        ? `No identifications match "${searchQuery.trim()}". Try another name or keyword from the description.`
        : emptyMessage;
    return <ThemedText style={[styles.empty, { color: authColors.textMuted }]}>{message}</ThemedText>;
  }

  const showLoadMore = hasMore && Boolean(onLoadMore);

  return (
    <>
      <View accessibilityLabel="Saved identification list" style={styles.listWrap}>
        <FlashList
          data={items}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          scrollEnabled={false}
          drawDistance={GALLERY_FLASH_LIST_DRAW_DISTANCE}
          estimatedItemSize={GALLERY_LIST_ROW_HEIGHT}
        />
      </View>

      {showLoadMore ? (
        <View style={styles.loadMoreWrap}>
          {isLoadingMore ? (
            <ActivityIndicator
              color={authColors.text}
              accessibilityLabel="Loading more photos"
            />
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
        onViewMemberProfile={onViewMemberProfile}
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
