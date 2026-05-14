import { Image } from 'expo-image';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, useWindowDimensions, View } from 'react-native';

import { DetectionGalleryDetailModal } from '@/components/profile/detection-gallery-detail-modal';
import { ThemedConfirmModal, ThemedMessageModal } from '@/components/ui/themed-sheet-dialog';
import { ThemedText } from '@/components/themed-text';
import { authColors, authSpacing } from '@/constants/auth-theme';
import type { DetectionGalleryItem } from '@/types';

const NUM_COLUMNS = 3;

export type GalleryDeleteResult = { ok: true } | { ok: false; message?: string };

type DetectionGalleryGridProps = {
  items: DetectionGalleryItem[];
  loading: boolean;
  error: string | null;
  onRetry: () => void;
  borderColor: string;
  mutedColor: string;
  activityColor: string;
  /** Shown when there are no items (default: own-profile copy). */
  emptyMessage?: string;
  /** Own profile: long-press tile or use modal delete to remove a saved photo. */
  deletable?: boolean;
  /** Called after user confirms delete (long-press or modal). */
  onDeleteItem?: (item: DetectionGalleryItem) => Promise<GalleryDeleteResult>;
  /** When set, matches `item.id` while that row is deleting (disables modal delete). */
  deletingId?: string | null;
};

/**
 * Saved detection thumbnails in a multi-column grid. Scrolls with the parent screen
 * (profile `ScrollView`); uses `useWindowDimensions` so tiles stay square at ~⅓ width.
 * Tapping a tile opens {@link DetectionGalleryDetailModal}.
 */
export function DetectionGalleryGrid({
  items,
  loading,
  error,
  onRetry,
  borderColor,
  mutedColor,
  activityColor,
  emptyMessage = 'No saved photos yet. Save an identification from the camera flow.',
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
    async (it: DetectionGalleryItem): Promise<GalleryDeleteResult> => {
      if (!onDeleteItem) return { ok: false, message: 'Delete is not available.' };
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
        setDeleteError(res.message?.trim() || 'Something went wrong.');
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

  const tileSize = useMemo(() => {
    const horizontalPadding = authSpacing.lg * 2;
    const gap = authSpacing.sm;
    const inner = Math.max(0, windowWidth - horizontalPadding);
    return Math.max(72, Math.floor((inner - gap * (NUM_COLUMNS - 1)) / NUM_COLUMNS));
  }, [windowWidth]);

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
    return (
      <ThemedText style={[styles.empty, { color: mutedColor }]}>{emptyMessage}</ThemedText>
    );
  }

  return (
    <>
      <View
        style={[styles.grid, { gap: authSpacing.sm }]}
        accessibilityLabel="Saved identification photos">
        {items.map((item) => (
          <Pressable
            key={item.id}
            accessibilityRole="button"
            accessibilityHint={deletable && onDeleteItem ? 'Opens details. Long press to delete.' : 'Opens details'}
            accessibilityLabel={`${item.commonName}, ${item.latinName}`}
            onPress={() => setSelected(item)}
            onLongPress={deletable && onDeleteItem ? () => confirmAndDelete(item) : undefined}
            delayLongPress={450}
            style={({ pressed }) => [
              styles.tile,
              {
                width: tileSize,
                height: tileSize,
                borderColor,
                opacity: pressed ? 0.92 : 1,
              },
            ]}>
            <Image
              source={{ uri: item.displayUrl }}
              style={StyleSheet.absoluteFillObject}
              contentFit="cover"
              transition={200}
            />
          </Pressable>
        ))}
      </View>

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
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingVertical: authSpacing.xs,
  },
  tile: {
    borderRadius: 8,
    borderWidth: 1,
    overflow: 'hidden',
    backgroundColor: authColors.fieldBackground,
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
});
