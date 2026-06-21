import { forwardRef, useEffect, useImperativeHandle, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { DetectionGalleryGrid } from '@/components/profile/detection-gallery-grid';
import { DetectionGalleryList } from '@/components/profile/detection-gallery-list';
import { GalleryGridColumnsPicker } from '@/components/profile/gallery-grid-columns-picker';
import { GalleryLayoutToggle } from '@/components/profile/gallery-layout-toggle';
import { SpeciesSubcategoryFilterButton } from '@/components/profile/species-subcategory-filter';
import { SpeciesSubcategoryFilterModal } from '@/components/profile/species-subcategory-filter-modal';
import { ScreenSearchField } from '@/components/ui/screen-search-field';
import { authSpacing } from '@/constants/auth-theme';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { useGalleryGridColumns } from '@/hooks/useGalleryGridColumns';
import { useGalleryLayoutMode } from '@/hooks/useGalleryLayoutMode';
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
  emptyMessage?: string;
  searchPlaceholder?: string;
  deletable?: boolean;
  onDeleteItem?: (item: DetectionGalleryItem) => Promise<UserFacingResult>;
  deletingId?: string | null;
  categoryFilter?: GalleryCategoryFilter;
  onCategoryFilterChange?: (value: GalleryCategoryFilter) => void;
  onOpenCategoryFilter?: () => void;
  onOpenDetection?: (item: DetectionGalleryItem) => void;
  onViewMemberProfile?: (userId: string) => void;
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
    emptyMessage,
    searchPlaceholder = 'Search name, type, description, or alias…',
    deletable = false,
    onDeleteItem,
    deletingId = null,
    categoryFilter: controlledCategoryFilter,
    onCategoryFilterChange,
    onOpenCategoryFilter,
    onOpenDetection,
    onViewMemberProfile,
  },
  ref,
) {
  const [searchQuery, setSearchQuery] = useState('');
  const [localCategoryFilter, setLocalCategoryFilter] = useState<GalleryCategoryFilter>({
    kind: 'all',
  });
  const [categoryFilterOpen, setCategoryFilterOpen] = useState(false);
  const categoryFilter = controlledCategoryFilter ?? localCategoryFilter;
  const setCategoryFilter = onCategoryFilterChange ?? setLocalCategoryFilter;
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
  const { layoutMode, setLayoutMode } = useGalleryLayoutMode();

  useEffect(() => {
    setSearchQuery('');
    if (!controlledCategoryFilter) {
      setLocalCategoryFilter({ kind: 'all' });
    }
  }, [controlledCategoryFilter, userId, publicOnly]);

  useImperativeHandle(ref, () => ({ refetch }), [refetch]);

  const filterOrSearchActive =
    isSearchQueryActive(debouncedSearch) || categoryFilter.kind !== 'all';
  const resolvedEmptyMessage =
    filterOrSearchActive && totalCount === 0 && !isLoading
      ? 'No identifications match your search or filter.'
      : emptyMessage;

  const sharedGalleryProps = {
    items,
    sourceItemCount: totalCount ?? items.length,
    searchQuery,
    loading: isLoading,
    isLoadingMore,
    hasMore,
    onLoadMore: () => void loadMore(),
    error,
    onRetry: () => void refetch(),
    emptyMessage: resolvedEmptyMessage,
    deletable,
    onDeleteItem,
    deletingId,
    onOpenDetection,
    onViewMemberProfile,
  };

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
          onPress={() => {
            if (onOpenCategoryFilter) {
              onOpenCategoryFilter();
              return;
            }
            setCategoryFilterOpen(true);
          }}
        />
        <GalleryLayoutToggle value={layoutMode} onChange={setLayoutMode} />
        {layoutMode === 'grid' ? (
          <GalleryGridColumnsPicker value={columns} onChange={setColumnCount} />
        ) : null}
      </View>

      {!onOpenCategoryFilter ? (
        <SpeciesSubcategoryFilterModal
          visible={categoryFilterOpen}
          value={categoryFilter}
          onChange={setCategoryFilter}
          onClose={() => setCategoryFilterOpen(false)}
        />
      ) : null}

      {layoutMode === 'list' ? (
        <DetectionGalleryList {...sharedGalleryProps} />
      ) : (
        <DetectionGalleryGrid {...sharedGalleryProps} columnCount={columns} />
      )}
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
