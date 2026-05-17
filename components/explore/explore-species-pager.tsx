import type { ReactElement } from 'react';
import { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import type { RefreshControlProps } from 'react-native';

import { DiscoverSortMenu } from '@/components/discover/discover-sort-menu';
import { DiscoverTypeMenu } from '@/components/discover/discover-type-menu';
import { DiscoverViewModeToggle } from '@/components/discover/discover-view-mode-toggle';
import { ExploreCategoryPage } from '@/components/explore/explore-category-page';
import { GridLayoutMenu } from '@/components/ui/grid-layout-menu';
import { authColors, authSpacing } from '@/constants/auth-theme';
import type { GalleryGridColumns } from '@/lib/detections/galleryGridColumns';
import type { ExploreDiscoverLayoutMode } from '@/lib/explore/exploreDiscoverLayout';
import {
  exploreSpeciesItemsForCategory,
  exploreSpeciesSortForCategory,
  type ExploreSpeciesByType,
  type ExploreSpeciesCategory,
} from '@/lib/explore/exploreSpeciesCategory';
import { filterExploreSpecies } from '@/lib/explore/filterExploreSpecies';
import type { ExploreSpeciesSortMode } from '@/lib/explore/exploreSpeciesSort';

type Props = {
  byType: ExploreSpeciesByType;
  searchQuery: string;
  category: ExploreSpeciesCategory;
  onCategoryChange: (category: ExploreSpeciesCategory) => void;
  sortMode: ExploreSpeciesSortMode;
  onSortChange: (mode: ExploreSpeciesSortMode) => void;
  layoutMode: ExploreDiscoverLayoutMode;
  onLayoutChange: (mode: ExploreDiscoverLayoutMode) => void;
  columnCount: GalleryGridColumns;
  onColumnCountChange: (columns: GalleryGridColumns) => void;
  loading: boolean;
  error: string | null;
  onRetry?: () => void;
  refreshControl?: ReactElement<RefreshControlProps>;
};

export function ExploreSpeciesPager({
  byType,
  searchQuery,
  category,
  onCategoryChange,
  sortMode,
  onSortChange,
  layoutMode,
  onLayoutChange,
  columnCount,
  onColumnCountChange,
  loading,
  error,
  onRetry,
  refreshControl,
}: Props) {
  const items = useMemo(() => {
    const categoryItems = exploreSpeciesItemsForCategory(byType, category);
    return filterExploreSpecies(categoryItems, searchQuery);
  }, [byType, category, searchQuery]);
  const effectiveSort = exploreSpeciesSortForCategory(category, sortMode);

  return (
    <View style={styles.fill}>
      <View style={styles.toolbar}>
        <DiscoverTypeMenu
          value={category}
          onChange={onCategoryChange}
          mutedColor={authColors.textMuted}
          borderColor={authColors.border}
        />
        {category !== 'all' ? (
          <DiscoverSortMenu
            value={sortMode}
            onChange={onSortChange}
            mutedColor={authColors.textMuted}
            borderColor={authColors.border}
          />
        ) : null}
        {layoutMode === 'grid' ? (
          <GridLayoutMenu
            value={columnCount}
            onChange={onColumnCountChange}
            mutedColor={authColors.textMuted}
            borderColor={authColors.border}
            context="discover"
          />
        ) : null}
        <DiscoverViewModeToggle
          value={layoutMode}
          onChange={onLayoutChange}
          mutedColor={authColors.textMuted}
        />
      </View>
      <ExploreCategoryPage
        category={category}
        items={items}
        searchQuery={searchQuery}
        sortMode={effectiveSort}
        layoutMode={layoutMode}
        columnCount={columnCount}
        loading={loading}
        error={error}
        onRetry={onRetry}
        refreshControl={refreshControl}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  fill: {
    flex: 1,
    minHeight: 320,
  },
  toolbar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: authSpacing.xs,
    marginBottom: authSpacing.md,
  },
});
