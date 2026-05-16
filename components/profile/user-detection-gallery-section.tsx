import { forwardRef, useImperativeHandle } from 'react';

import { DetectionGalleryGrid } from '@/components/profile/detection-gallery-grid';
import { ScreenSection } from '@/components/profile/screen-section';
import { useUserDetectionGallery } from '@/hooks/useUserDetectionGallery';
import type { DetectionGalleryItem } from '@/types';
import type { UserFacingResult } from '@/types/user-facing-result';

export type UserDetectionGallerySectionHandle = {
  refetch: () => Promise<void>;
};

type UserDetectionGallerySectionProps = {
  userId?: string;
  /** When true, only non-sensitive rows (another member's public gallery). */
  publicOnly?: boolean;
  title?: string;
  hint?: string;
  hintColor: string;
  borderColor: string;
  mutedColor: string;
  activityColor: string;
  emptyMessage?: string;
  deletable?: boolean;
  onDeleteItem?: (item: DetectionGalleryItem) => Promise<UserFacingResult>;
  deletingId?: string | null;
};

/**
 * Paginated identification gallery for own profile or a member's public profile.
 */
export const UserDetectionGallerySection = forwardRef<
  UserDetectionGallerySectionHandle,
  UserDetectionGallerySectionProps
>(function UserDetectionGallerySection(
  {
    userId,
    publicOnly = false,
    title = 'Gallery',
    hint,
    hintColor,
    borderColor,
    mutedColor,
    activityColor,
    emptyMessage,
    deletable = false,
    onDeleteItem,
    deletingId = null,
  },
  ref,
) {
  const {
    items,
    isLoading,
    isLoadingMore,
    hasMore,
    error,
    loadMore,
    refetch,
  } = useUserDetectionGallery({ userId, publicOnly });

  useImperativeHandle(ref, () => ({ refetch }), [refetch]);

  return (
    <ScreenSection title={title} hint={hint} hintColor={hintColor}>
      <DetectionGalleryGrid
        items={items}
        loading={isLoading}
        isLoadingMore={isLoadingMore}
        hasMore={hasMore}
        onLoadMore={() => void loadMore()}
        error={error}
        onRetry={() => void refetch()}
        borderColor={borderColor}
        mutedColor={mutedColor}
        activityColor={activityColor}
        emptyMessage={emptyMessage}
        deletable={deletable}
        onDeleteItem={onDeleteItem}
        deletingId={deletingId}
      />
    </ScreenSection>
  );
});
