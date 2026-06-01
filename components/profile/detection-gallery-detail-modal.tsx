import { Image } from 'expo-image';
import { useCallback, useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native';

import { AuthButton } from '@/components/auth/auth-button';
import { NativeStatusBadge } from '@/components/profile/native-status-badge';
import { ButtonStack } from '@/components/ui/button-stack';
import { SheetModalShell } from '@/components/ui/sheet-modal-shell';
import { ThemedConfirmModal, ThemedMessageModal } from '@/components/ui/themed-sheet-dialog';
import { authColors, authSpacing, authTypography } from '@/constants/auth-theme';
import { formatDetectedAt } from '@/lib/detections/formatDetectedAt';
import { formatGalleryNativeDetailHint } from '@/lib/detections/galleryNativeCategory';
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
  /** Community explore: open the member who saved this identification. */
  onViewMemberProfile?: (userId: string) => void;
};

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
  onViewMemberProfile,
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
  const nativeHint = galleryItem ? formatGalleryNativeDetailHint(galleryItem.nativeStatus) : null;

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
                cachePolicy="memory-disk"
                transition={200}
                accessibilityLabel={`Photo of ${galleryItem.commonName}`}
              />
            </View>

            <NativeStatusBadge category={galleryItem.nativeCategory} />
            <Text style={styles.commonName}>{galleryItem.commonName}</Text>
            <Text style={styles.latinName}>{galleryItem.latinName}</Text>
            {nativeHint ? <Text style={styles.nativeHint}>{nativeHint}</Text> : null}
            {galleryItem.description ? (
              <Text style={styles.description} accessibilityRole="text">
                {galleryItem.description}
              </Text>
            ) : null}
            <Text style={styles.meta}>{`Saved ${formatDetectedAt(galleryItem.detectedAt)}`}</Text>
            {galleryItem.ownerUsername ? (
              <Text style={styles.meta}>{`By @${galleryItem.ownerUsername}`}</Text>
            ) : null}

            <ButtonStack>
              {galleryItem.ownerUserId && onViewMemberProfile ? (
                <AuthButton
                  title="View member profile"
                  variant="primary"
                  fillParent
                  onPress={() => {
                    onViewMemberProfile(galleryItem.ownerUserId!);
                    onClose();
                  }}
                  accessibilityLabel={`View ${galleryItem.ownerUsername ?? 'member'} profile`}
                />
              ) : null}
              {deletable && onRequestDelete ? (
                <AuthButton
                  title="Delete from gallery"
                  variant="outline"
                  icon="trash"
                  fillParent
                  onPress={handleDeletePress}
                  loading={deleteBusy}
                  disabled={deleteBusy || deleteConfirmOpen}
                  accessibilityLabel="Delete photo from gallery"
                />
              ) : null}
              <AuthButton
                title="Close"
                variant="outline"
                fillParent
                onPress={onClose}
                disabled={deleteBusy}
              />
            </ButtonStack>
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
    borderRadius: 0,
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
  nativeHint: {
    ...authTypography.subtitle,
    lineHeight: 20,
    color: authColors.textMuted,
    textAlign: 'center',
    fontSize: 13,
  },
  description: {
    ...authTypography.body,
    lineHeight: 22,
    color: authColors.text,
    textAlign: 'left',
  },
  meta: {
    ...authTypography.subtitle,
    lineHeight: 22,
    color: authColors.textMuted,
    textAlign: 'center',
  },
});
