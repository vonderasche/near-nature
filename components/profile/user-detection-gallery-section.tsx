import { forwardRef, useEffect, useImperativeHandle, useMemo, useState } from 'react';
import { View } from 'react-native';

import { DetectionGalleryGrid } from '@/components/profile/detection-gallery-grid';
import { GalleryGridColumnsPicker } from '@/components/profile/gallery-grid-columns-picker';
import {
  SpeciesSubcategoryFilterButton,
  SpeciesSubcategoryFilterModal,
} from '@/components/profile/species-subcategory-filter';
import { ScreenSection } from '@/components/profile/screen-section';
import { ScreenSearchField } from '@/components/ui/screen-search-field';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { useGalleryGridColumns } from '@/hooks/useGalleryGridColumns';
import { useUserDetectionGallery } from '@/hooks/useUserDetectionGallery';
import {
  filterDetectionGalleryItems,
  type GalleryCategoryFilter,
} from '@/lib/detections/filterDetectionGalleryItems';
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
  const [categoryFilter, setCategoryFilter] = useState<GalleryCategoryFilter>({ kind: 'all' });
  const [categoryFilterOpen, setCategoryFilterOpen] = useState(false);
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
    setCategoryFilter({ kind: 'all' });
  }, [userId, publicOnly]);

  const debouncedSearch = useDebouncedValue(searchQuery, 280);

  const filteredItems = useMemo(
    () => filterDetectionGalleryItems(items, debouncedSearch, categoryFilter),
    [items, debouncedSearch, categoryFilter],
  );

  useImperativeHandle(ref, () => ({ refetch }), [refetch]);

  return (
    <ScreenSection
      title={title}
      hint={hint}
      hintColor={hintColor}
      titleAccessory={
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <SpeciesSubcategoryFilterButton
            value={categoryFilter}
            onPress={() => setCategoryFilterOpen(true)}
            mutedColor={mutedColor}
            borderColor={borderColor}
          />
          <GalleryGridColumnsPicker
            value={columns}
            onChange={setColumnCount}
            mutedColor={mutedColor}
            borderColor={borderColor}
          />
        </View>
      }>
      {userId ? (
        <ScreenSearchField
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder={searchPlaceholder}
          accessibilityLabel="Search profile gallery"
        />
      ) : null}
      <SpeciesSubcategoryFilterModal
        visible={categoryFilterOpen}
        value={categoryFilter}
        onChange={setCategoryFilter}
        onClose={() => setCategoryFilterOpen(false)}
      />
      <DetectionGalleryGrid
        items={filteredItems}
        sourceItemCount={items.length}
        searchQuery={searchQuery}
        columnCount={columns}
        loading={isLoading}
        isLoadingMore={isLoadingMore}
        hasMore={hasMore && !debouncedSearch.trim() && categoryFilter.kind === 'all'}
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
