import { useCallback, useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { DiscoverExploreGate } from '@/components/discover/discover-explore-gate';
import { DiscoverTaxonChips } from '@/components/discover/discover-taxon-chips';
import { ExploreSpeciesPager } from '@/components/explore/explore-species-pager';
import { ScreenSearchField } from '@/components/ui/screen-search-field';
import { authColors, authSpacing } from '@/constants/auth-theme';
import { useExploreDiscoverLayout } from '@/hooks/useExploreDiscoverLayout';
import { useExploreSpecies } from '@/hooks/useExploreSpecies';
import { useExploreSpeciesCategory } from '@/hooks/useExploreSpeciesCategory';
import { useExploreSpeciesSort } from '@/hooks/useExploreSpeciesSort';
import { useGalleryGridColumns } from '@/hooks/useGalleryGridColumns';
import { useDiscoverExploreState } from '@/hooks/useDiscoverExploreState';
import { useRefreshControl } from '@/hooks/useRefreshControl';
import {
  filterExploreSpeciesByTaxon,
  type ExploreSpeciesTaxonFilter,
} from '@/lib/explore/exploreSpeciesTaxonFilter';
import {
  exploreSpeciesItemsForCategory,
  type ExploreSpeciesByType,
  type ExploreSpeciesCategory,
} from '@/lib/explore/exploreSpeciesCategory';

function applyTaxonFilter(byType: ExploreSpeciesByType, taxon: ExploreSpeciesTaxonFilter): ExploreSpeciesByType {
  return {
    animals: filterExploreSpeciesByTaxon(byType.animals, taxon),
    plants: filterExploreSpeciesByTaxon(byType.plants, taxon),
  };
}

export default function DiscoverSpeciesScreen() {
  const insets = useSafeAreaInsets();
  const {
    exploreStateName,
    isSignedIn,
    stateLoading,
    needsHomeState,
    isGuestPreview,
    canLoadExploreContent,
  } = useDiscoverExploreState();
  const { byType, isLoading, error, refetch } = useExploreSpecies(
    canLoadExploreContent ? exploreStateName : null,
  );
  const { sortMode, setSort } = useExploreSpeciesSort();
  const { category, setCategory } = useExploreSpeciesCategory();
  const { layoutMode, setLayout } = useExploreDiscoverLayout();
  const { columns, setColumnCount } = useGalleryGridColumns();
  const [searchQuery, setSearchQuery] = useState('');
  const [taxonFilter, setTaxonFilter] = useState<ExploreSpeciesTaxonFilter>('all');
  const { refreshControl } = useRefreshControl(refetch, {
    tintColor: authColors.text,
    colors: [authColors.text],
  });

  const filteredByType = useMemo(() => applyTaxonFilter(byType, taxonFilter), [byType, taxonFilter]);

  const onCategoryChange = useCallback(
    (next: ExploreSpeciesCategory) => {
      setCategory(next);
      if (next === 'all') setSort('observations');
    },
    [setCategory, setSort],
  );

  const displayByType = useMemo(() => {
    if (taxonFilter === 'all') return filteredByType;
    const merged = exploreSpeciesItemsForCategory(filteredByType, 'all');
    if (merged.length === 0) return filteredByType;
    return { animals: merged.filter((s) => s.type === 'animals'), plants: merged.filter((s) => s.type === 'plants') };
  }, [filteredByType, taxonFilter]);

  return (
    <View style={[styles.root, { paddingBottom: insets.bottom }]}>
      <DiscoverExploreGate
        isSignedIn={isSignedIn}
        stateLoading={stateLoading}
        needsHomeState={needsHomeState}
        isGuestPreview={isGuestPreview}
        stateName={exploreStateName}>
        <View style={styles.pad}>
          <DiscoverTaxonChips
            value={taxonFilter}
            onChange={setTaxonFilter}
            borderColor={authColors.border}
          />
          <ScreenSearchField
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search common or scientific name, description…"
            accessibilityLabel="Search species"
          />
        </View>
        <ExploreSpeciesPager
          byType={displayByType}
          searchQuery={searchQuery}
          category={category}
          onCategoryChange={onCategoryChange}
          sortMode={sortMode}
          onSortChange={setSort}
          layoutMode={layoutMode}
          onLayoutChange={setLayout}
          columnCount={columns}
          onColumnCountChange={setColumnCount}
          loading={isLoading}
          error={error}
          onRetry={() => void refetch()}
          refreshControl={refreshControl}
        />
      </DiscoverExploreGate>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: authColors.background,
  },
  pad: {
    paddingHorizontal: authSpacing.lg,
  },
});
