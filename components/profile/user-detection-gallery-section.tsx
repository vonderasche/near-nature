import { forwardRef, useEffect, useImperativeHandle, useMemo, useState } from 'react';

import { DetectionGalleryGrid } from '@/components/profile/detection-gallery-grid';
import { GalleryGridColumnsPicker } from '@/components/profile/gallery-grid-columns-picker';
import { ScreenSection } from '@/components/profile/screen-section';
import { ScreenSearchField } from '@/components/ui/screen-search-field';
import { useGalleryGridColumns } from '@/hooks/useGalleryGridColumns';
import { useUserDetectionGallery } from '@/hooks/useUserDetectionGallery';
import { filterDetectionGalleryItems } from '@/lib/detections/filterDetectionGalleryItems';
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
  searchPlaceholder?: string;
  deletable?: boolean;
  onDeleteItem?: (item: DetectionGalleryItem) => Promise<UserFacingResult>;
  deletingId?: string | null;
};

/**
 * Paginated identification gallery for own profile or a member's public profile.
 * Search filters only identifications already loaded for this `userId`.
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
    searchPlaceholder = 'Search common or scientific name, description…',
    deletable = false,
    onDeleteItem,
    deletingId = null,
  },
  ref,
) {
  const [searchQuery, setSearchQuery] = useState('');
  const {
    items,
    isLoading,
    isLoadingMore,
    hasMore,
    error,
    loadMore,
    refetch,
  } = useUserDetectionGallery({ userId, publicOnly });
  const { columns, setColumnCount } = useGalleryGridColumns();

  useEffect(() => {
    setSearchQuery('');
  }, [userId, publicOnly]);

  const filteredItems = useMemo(
    () => filterDetectionGalleryItems(items, searchQuery),
    [items, searchQuery],
  );

  useImperativeHandle(ref, () => ({ refetch }), [refetch]);

  return (
    <ScreenSection
      title={title}
      hint={hint}
      hintColor={hintColor}
      titleAccessory={
        <GalleryGridColumnsPicker
          value={columns}
          onChange={setColumnCount}
          mutedColor={mutedColor}
          borderColor={borderColor}
        />
      }>
      {userId ? (
        <ScreenSearchField
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder={searchPlaceholder}
          accessibilityLabel="Search profile gallery"
        />
      ) : null}
      <DetectionGalleryGrid
        items={filteredItems}
        sourceItemCount={items.length}
        searchQuery={searchQuery}
        columnCount={columns}
        loading={isLoading}
        isLoadingMore={isLoadingMore}
        hasMore={hasMore && !searchQuery.trim()}
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
