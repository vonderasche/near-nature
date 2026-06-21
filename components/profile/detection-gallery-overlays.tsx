import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';

import { AuthButton } from '@/components/auth/auth-button';
import { DetectionGalleryDetailModal } from '@/components/profile/detection-gallery-detail-modal';
import { ThemedConfirmModal, ThemedMessageModal } from '@/components/ui/themed-sheet-dialog';
import { Text } from '@/components/ui/Text';
import { useTheme } from '@/hooks/useTheme';
import type { useGalleryItemActions } from '@/hooks/useGalleryItemActions';

type GalleryActions = ReturnType<typeof useGalleryItemActions>;

type Props = {
  actions: GalleryActions;
  onCloseDetail: () => void;
  onViewMemberProfile?: (userId: string) => void;
};

export function DetectionGalleryOverlays({
  actions,
  onCloseDetail,
  onViewMemberProfile,
}: Props) {
  const { detailModal, deleteConfirm, deleteError } = actions;

  return (
    <>
      <DetectionGalleryDetailModal
        visible={detailModal.visible}
        item={detailModal.item}
        onClose={onCloseDetail}
        deletable={detailModal.deletable}
        onRequestDelete={detailModal.onRequestDelete}
        deleteBusy={detailModal.deleteBusy}
        onViewMemberProfile={onViewMemberProfile}
      />
      <ThemedConfirmModal
        visible={deleteConfirm.visible}
        title="Delete this photo?"
        message="It will be removed from your gallery. This cannot be undone."
        confirmLabel="Delete"
        onCancel={deleteConfirm.onCancel}
        onConfirm={deleteConfirm.onConfirm}
        confirmLoading={deleteConfirm.loading}
      />
      <ThemedMessageModal
        visible={deleteError.visible}
        title="Could not delete"
        message={deleteError.message}
        onDismiss={deleteError.onDismiss}
      />
    </>
  );
}

type GalleryStatusProps = {
  error: string | null;
  loading: boolean;
  itemsCount: number;
  emptyMessage: string;
  searchQuery?: string;
  sourceItemCount?: number;
  onRetry: () => void;
};

export function DetectionGalleryStatus({
  error,
  loading,
  itemsCount,
  emptyMessage,
  searchQuery = '',
  sourceItemCount = 0,
  onRetry,
}: GalleryStatusProps) {
  const { theme } = useTheme();

  if (error) {
    return (
      <View style={[styles.messageBlock, { gap: theme.spacing.sm }]}>
        <Text variant="subtitle" color="secondary">
          {error}
        </Text>
        <Pressable onPress={onRetry} accessibilityRole="button" accessibilityLabel="Retry loading gallery">
          <Text variant="label" color="accent">
            Try again
          </Text>
        </Pressable>
      </View>
    );
  }

  if (loading && itemsCount === 0) {
    return <ActivityIndicator color={theme.colors.textPrimary} accessibilityLabel="Loading gallery" />;
  }

  if (itemsCount === 0) {
    const trimmed = searchQuery.trim();
    const message =
      trimmed.length > 0 && sourceItemCount > 0
        ? `No identifications match "${trimmed}". Try another name or keyword from the description.`
        : emptyMessage;
    return (
      <Text variant="subtitle" color="secondary">
        {message}
      </Text>
    );
  }

  return null;
}

type LoadMoreProps = {
  visible: boolean;
  isLoadingMore: boolean;
  onLoadMore?: () => void;
};

export function DetectionGalleryLoadMore({ visible, isLoadingMore, onLoadMore }: LoadMoreProps) {
  const { theme } = useTheme();

  if (!visible || !onLoadMore) return null;

  return (
    <View style={[styles.loadMoreWrap, { marginTop: theme.spacing.md }]}>
      {isLoadingMore ? (
        <ActivityIndicator color={theme.colors.textPrimary} accessibilityLabel="Loading more photos" />
      ) : (
        <AuthButton
          title="Load more"
          variant="outline"
          onPress={onLoadMore}
          fillParent
          accessibilityLabel="Load more gallery photos"
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  messageBlock: {},
  loadMoreWrap: {
    alignItems: 'center',
    minHeight: 44,
    justifyContent: 'center',
  },
});
