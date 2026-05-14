import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Image } from 'expo-image';
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { AuthButton } from '@/components/auth/auth-button';
import { ThemedConfirmModal, ThemedMessageModal } from '@/components/ui/themed-sheet-dialog';
import { authColors, authSpacing, authTypography } from '@/constants/auth-theme';
import type { DetectionGalleryItem } from '@/types';

export type DetectionGalleryDetailModalProps = {
  visible: boolean;
  /** Row to show; when `null`, the modal renders nothing (keep `visible` false). */
  item: DetectionGalleryItem | null;
  onClose: () => void;
  /** Own profile: show delete control (calls `onRequestDelete` after confirm). */
  deletable?: boolean;
  onRequestDelete?: (item: DetectionGalleryItem) => Promise<{ ok: boolean; message?: string }>;
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
        setDeleteError(res.message?.trim() || 'Something went wrong.');
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

  return (
    <>
      {showMain && galleryItem ? (
        <Modal animationType="fade" transparent visible={visible} onRequestClose={onClose}>
          <View style={styles.root} pointerEvents="box-none">
            <Pressable style={styles.backdrop} onPress={onClose} accessibilityLabel="Dismiss" />
            <View style={styles.sheet} accessibilityViewIsModal>
              <ScrollView
                style={styles.scroll}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled">
                <View style={styles.imageFrame}>
                  <Image
                    source={{ uri: galleryItem.displayUrl }}
                    style={StyleSheet.absoluteFillObject}
                    contentFit="contain"
                    transition={200}
                    accessibilityLabel={`Photo of ${galleryItem.commonName}`}
                  />
                </View>

                <Text style={styles.commonName}>{galleryItem.commonName}</Text>
                <Text style={styles.latinName}>{galleryItem.latinName}</Text>
                <Text style={styles.meta}>Saved {formatDetectedAt(galleryItem.detectedAt)}</Text>
              </ScrollView>

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
            </View>
          </View>
        </Modal>
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
  root: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: authSpacing.lg,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  sheet: {
    maxWidth: 440,
    width: '100%',
    alignSelf: 'center',
    backgroundColor: authColors.background,
    borderWidth: 1,
    borderColor: authColors.border,
    padding: authSpacing.md,
    gap: authSpacing.md,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    zIndex: 1,
  },
  scroll: {
    maxHeight: '72%',
  },
  scrollContent: {
    gap: authSpacing.sm,
    paddingBottom: authSpacing.xs,
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
  commonName: {
    ...authTypography.title,
    fontSize: 22,
    color: authColors.text,
  },
  latinName: {
    ...authTypography.subtitle,
    color: authColors.textMuted,
    fontStyle: 'italic',
  },
  meta: {
    ...authTypography.subtitle,
    color: authColors.textMuted,
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
