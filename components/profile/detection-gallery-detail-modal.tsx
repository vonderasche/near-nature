import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Image } from 'expo-image';
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native';

import { AuthButton } from '@/components/auth/auth-button';
import { SheetModalShell } from '@/components/ui/sheet-modal-shell';
import { ThemedConfirmModal, ThemedMessageModal } from '@/components/ui/themed-sheet-dialog';
import { authColors, authSpacing, authTypography } from '@/constants/auth-theme';
import type { DetectionGalleryItem } from '@/types';
import type { UserFacingResult } from '@/types/user-facing-result';

export type DetectionGalleryDetailModalProps = {
  visible: boolean;
  /** Row to show; when `null`, the modal renders nothing (keep `visible` false). */
  item: DetectionGalleryItem | null;
  onClose: () => void;
  /** Own profile: show delete control (calls `onRequestDelete` after confirm). */
  deletable?: boolean;
  onRequestDelete?: (item: DetectionGalleryItem) => Promise<UserFacingResult>;
  deleteBusy?: boolean;
};

function formatDetectedAt(iso: string): string {
  try {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return iso;
    return d.toLocaleString(undefined, {
      dateStyle: 'medium',
      timeStyle: 'short',
    });
  } catch {
    return iso;
  }
}

/**
 * Full-screen overlay with a larger preview and metadata for a saved detection.
 * Reusable anywhere you have a {@link DetectionGalleryItem}.
 */
export function DetectionGalleryDetailModal({
  visible,
  item,
  onClose,
  deletable = false,
  onRequestDelete,
  deleteBusy = false,
}: DetectionGalleryDetailModalProps) {
  const { height: windowHeight } = useWindowDimensions();
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [confirmLoading, setConfirmLoading] = useState(false);

  useEffect(() => {
    if (!visible || !item) {
      setDeleteConfirmOpen(false);
      setDeleteError(null);
      setConfirmLoading(false);
    }
  }, [visible, item]);

  const runDelete = useCallback(async () => {
    if (!onRequestDelete || !item) return;
    setConfirmLoading(true);
    try {
      const res = await onRequestDelete(item);
      if (!res.ok) {
        setDeleteError(res.message);
        setDeleteConfirmOpen(false);
        return;
      }
      setDeleteConfirmOpen(false);
      onClose();
    } finally {
      setConfirmLoading(false);
    }
  }, [item, onClose, onRequestDelete]);

  const showMain = Boolean(visible && item);
  const galleryItem = item;

  function handleDeletePress() {
    if (!onRequestDelete) return;
    setDeleteConfirmOpen(true);
  }

  /** Numeric cap so ScrollView gets a real max height (percent-only layouts clip text on Android). */
  const sheetMaxHeight = Math.round(windowHeight * 0.92);
  const scrollMaxHeight = Math.max(280, sheetMaxHeight - authSpacing.md * 2);

  return (
    <>
      {showMain && galleryItem ? (
        <SheetModalShell
          visible
          onRequestClose={onClose}
          sheetStyle={{ maxHeight: sheetMaxHeight }}>
          <ScrollView
            style={[styles.scroll, { maxHeight: scrollMaxHeight }]}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator
            keyboardShouldPersistTaps="handled">
            <View style={styles.imageFrame}>
              <Image
                source={{ uri: galleryItem.displayUrl }}
                style={styles.imageFill}
                contentFit="contain"
                transition={200}
                accessibilityLabel={`Photo of ${galleryItem.commonName}`}
              />
            </View>

            <Text style={styles.commonName}>{galleryItem.commonName}</Text>
            <Text style={styles.latinName}>{galleryItem.latinName}</Text>
            <Text style={styles.meta}>{`Saved ${formatDetectedAt(galleryItem.detectedAt)}`}</Text>

            <View style={styles.actions}>
              {deletable && onRequestDelete ? (
                <Pressable
                  onPress={handleDeletePress}
                  disabled={deleteBusy || deleteConfirmOpen}
                  style={({ pressed }) => [
                    styles.deleteRow,
                    (deleteBusy || deleteConfirmOpen || pressed) && styles.deleteRowPressed,
                  ]}
                  accessibilityRole="button"
                  accessibilityLabel="Delete photo from gallery">
                  {deleteBusy ? (
                    <ActivityIndicator color={authColors.text} />
                  ) : (
                    <MaterialIcons name="delete-outline" size={22} color={authColors.text} />
                  )}
                  <Text style={styles.deleteLabel}>Delete from gallery</Text>
                </Pressable>
              ) : null}
              <AuthButton title="Close" variant="outline" onPress={onClose} disabled={deleteBusy} />
            </View>
          </ScrollView>
        </SheetModalShell>
      ) : null}

      <ThemedConfirmModal
        visible={deleteConfirmOpen && Boolean(galleryItem)}
        title="Delete this photo?"
        message="It will be removed from your gallery. This cannot be undone."
        confirmLabel="Delete"
        onCancel={() => setDeleteConfirmOpen(false)}
        onConfirm={runDelete}
        confirmLoading={confirmLoading || deleteBusy}
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
  scroll: {
    flexGrow: 0,
  },
  scrollContent: {
    gap: authSpacing.md,
    paddingBottom: authSpacing.md,
  },
  imageFrame: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: authColors.background,
    borderWidth: 1,
    borderColor: authColors.border,
  },
  imageFill: {
    width: '100%',
    height: '100%',
  },
  commonName: {
    ...authTypography.title,
    fontSize: 22,
    lineHeight: 30,
    color: authColors.text,
    textAlign: 'center',
  },
  latinName: {
    ...authTypography.subtitle,
    lineHeight: 22,
    color: authColors.textMuted,
    fontStyle: 'italic',
    textAlign: 'center',
  },
  meta: {
    ...authTypography.subtitle,
    lineHeight: 22,
    color: authColors.textMuted,
    textAlign: 'center',
  },
  actions: {
    gap: authSpacing.sm,
  },
  deleteRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: authSpacing.sm,
    paddingVertical: authSpacing.sm,
    borderRadius: authSpacing.xs,
    borderWidth: 1,
    borderColor: authColors.border,
    backgroundColor: authColors.background,
  },
  deleteRowPressed: {
    opacity: 0.85,
  },
  deleteLabel: {
    ...authTypography.body,
    fontWeight: '600',
    color: authColors.text,
  },
});
