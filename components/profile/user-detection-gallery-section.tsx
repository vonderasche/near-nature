import { forwardRef, useEffect, useImperativeHandle, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { DetectionGalleryGrid } from '@/components/profile/detection-gallery-grid';
import { DetectionGalleryList } from '@/components/profile/detection-gallery-list';
import { GalleryGridColumnsPicker } from '@/components/profile/gallery-grid-columns-picker';
import { GalleryLayoutToggle } from '@/components/profile/gallery-layout-toggle';
import {
  SpeciesSubcategoryFilterButton,
  speciesSubcategoryFilterSummary,
} from '@/components/profile/species-subcategory-filter';
import { ActiveFilterChip } from '@/components/shared/active-filter-chip';
import { ListSearchToolbar } from '@/components/shared/list-search-toolbar';
import { SEARCH_DEBOUNCE_MS } from '@/constants/search';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { useGalleryGridColumns } from '@/hooks/useGalleryGridColumns';
import { useGalleryLayoutMode } from '@/hooks/useGalleryLayoutMode';
import { useTheme } from '@/hooks/useTheme';
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
  onOpenCategoryFilter: () => void;
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
  const { theme } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [localCategoryFilter, setLocalCategoryFilter] = useState<GalleryCategoryFilter>({
    kind: 'all',
  });
  const categoryFilter = controlledCategoryFilter ?? localCategoryFilter;
  const setCategoryFilter = onCategoryFilterChange ?? setLocalCategoryFilter;
  const debouncedSearch = useDebouncedValue(searchQuery, SEARCH_DEBOUNCE_MS);
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

  const filterActive = categoryFilter.kind !== 'all';
  const filterOrSearchActive = isSearchQueryActive(debouncedSearch) || filterActive;
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
    <View style={[styles.wrap, { gap: theme.spacing.sm }]}>
      {userId ? (
        <ListSearchToolbar
          searchQuery={searchQuery}
          onSearchQueryChange={setSearchQuery}
          placeholder={searchPlaceholder}
          accessibilityLabel="Search profile gallery"
          trailing={
            <>
              <SpeciesSubcategoryFilterButton value={categoryFilter} onPress={onOpenCategoryFilter} />
              <GalleryLayoutToggle value={layoutMode} onChange={setLayoutMode} />
              {layoutMode === 'grid' ? (
                <GalleryGridColumnsPicker value={columns} onChange={setColumnCount} />
              ) : null}
            </>
          }
        />
      ) : null}

      {filterActive ? (
        <ActiveFilterChip
          label={speciesSubcategoryFilterSummary(categoryFilter)}
          onClear={() => setCategoryFilter({ kind: 'all' })}
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
  wrap: {},
});
