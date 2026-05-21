import { forwardRef, useEffect, useImperativeHandle, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { DetectionGalleryGrid } from '@/components/profile/detection-gallery-grid';
import { GalleryGridColumnsPicker } from '@/components/profile/gallery-grid-columns-picker';
import {
  SpeciesSubcategoryFilterButton,
  SpeciesSubcategoryFilterModal,
} from '@/components/profile/species-subcategory-filter';
import { ScreenSearchField } from '@/components/ui/screen-search-field';
import { authSpacing } from '@/constants/auth-theme';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { useGalleryGridColumns } from '@/hooks/useGalleryGridColumns';
import { useUserDetectionGallery } from '@/hooks/useUserDetectionGallery';
import type { GalleryCategoryFilter } from '@/lib/detections/filterDetectionGalleryItems';
import { isSearchQueryActive } from '@/lib/search/normalizeSearchQuery';
import type { DetectionGalleryItem } from '@/types';
import type { UserFacingResult } from '@/types/user-facing-result';

export type UserDetectionGallerySectionHandle = {
  refetch: () => Promise<void>;
};

type UserDetectionGallerySectionProps = {
  userId?: string;
  /** When true, only non-sensitive rows (another member's public gallery). */
  publicOnly?: boolean;
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
 * Search and taxon filters run in `search_user_detections` when the RPC is deployed.
 */
export const UserDetectionGallerySection = forwardRef<
  UserDetectionGallerySectionHandle,
  UserDetectionGallerySectionProps
>(function UserDetectionGallerySection(
  {
    userId,
    publicOnly = false,
    borderColor,
    mutedColor,
    activityColor,
    emptyMessage,
    searchPlaceholder = 'Search name, type, description, or alias…',
    deletable = false,
    onDeleteItem,
    deletingId = null,
  },
  ref,
) {
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<GalleryCategoryFilter>({ kind: 'all' });
  const [categoryFilterOpen, setCategoryFilterOpen] = useState(false);
  const debouncedSearch = useDebouncedValue(searchQuery, 280);
  const {
    items,
    isLoading,
    isLoadingMore,
    hasMore,
    totalCount,
    error,
    loadMore,
    refetch,
  } = useUserDetectionGallery({
    userId,
    publicOnly,
    searchQuery: debouncedSearch,
    categoryFilter,
  });
  const { columns, setColumnCount } = useGalleryGridColumns();

  useEffect(() => {
    setSearchQuery('');
    setCategoryFilter({ kind: 'all' });
  }, [userId, publicOnly]);

  useImperativeHandle(ref, () => ({ refetch }), [refetch]);

  const filterOrSearchActive =
    isSearchQueryActive(debouncedSearch) || categoryFilter.kind !== 'all';
  const resolvedEmptyMessage =
    filterOrSearchActive && totalCount === 0 && !isLoading
      ? 'No identifications match your search or filter.'
      : emptyMessage;

  return (
    <View style={styles.wrap}>
      <View style={styles.searchRow}>
        {userId ? (
          <ScreenSearchField
            borderless
            containerStyle={styles.searchField}
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder={searchPlaceholder}
            accessibilityLabel="Search profile gallery"
          />
        ) : (
          <View style={styles.searchField} />
        )}
        <SpeciesSubcategoryFilterButton
          value={categoryFilter}
          onPress={() => setCategoryFilterOpen(true)}
          mutedColor={mutedColor}
        />
        <GalleryGridColumnsPicker
          value={columns}
          onChange={setColumnCount}
          mutedColor={mutedColor}
          borderColor={borderColor}
        />
      </View>

      <SpeciesSubcategoryFilterModal
        visible={categoryFilterOpen}
        value={categoryFilter}
        onChange={setCategoryFilter}
        onClose={() => setCategoryFilterOpen(false)}
      />

      <DetectionGalleryGrid
        items={items}
        sourceItemCount={totalCount ?? items.length}
        searchQuery={searchQuery}
        columnCount={columns}
        loading={isLoading}
        isLoadingMore={isLoadingMore}
        hasMore={hasMore}
        onLoadMore={() => void loadMore()}
        error={error}
        onRetry={() => void refetch()}
        borderColor={borderColor}
        mutedColor={mutedColor}
        activityColor={activityColor}
        emptyMessage={resolvedEmptyMessage}
        deletable={deletable}
        onDeleteItem={onDeleteItem}
        deletingId={deletingId}
      />
    </View>
  );
});

const styles = StyleSheet.create({
  wrap: {
    gap: authSpacing.sm,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: authSpacing.sm,
  },
  searchField: {
    flex: 1,
    minWidth: 0,
  },
});
