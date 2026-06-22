import { useCallback, useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useRouter, type Href } from 'expo-router';

import { DiscoverDetailFlashList } from '@/components/discover/discover-detail-flash-list';
import { DiscoverItemGrid, type DiscoverGridItem } from '@/components/discover/discover-item-grid';
import { DiscoverSpeciesSubcategoryChips } from '@/components/discover/discover-species-subcategory-chips';
import { SpeciesListItem } from '@/components/discover/species-list-item';
import { discoverSpeciesFilterSummary } from '@/components/discover/discover-species-filter-content';
import { ErrorRetryBlock } from '@/components/profile/error-retry-block';
import { ActiveFilterChip } from '@/components/shared/active-filter-chip';
import { CenteredActivityIndicator } from '@/components/shared/centered-activity-indicator';
import { ListEmptyActions } from '@/components/shared/list-empty-actions';
import { useListSectionSupportingStyles } from '@/components/shared/list-detail-card';
import { useDiscoverSpeciesBrowse } from '@/context/DiscoverSpeciesBrowseContext';
import { useTheme } from '@/hooks/useTheme';
import {
  DEFAULT_DISCOVER_SPECIES_FILTER,
  filterDiscoverSpecies,
  sortDiscoverSpecies,
} from '@/lib/discover/discoverSpeciesFilter';
import { stageDiscoverSpecies } from '@/lib/discover/discoverRouteCache';
import { DISCOVER_SPECIES_LIST_ROW_HEIGHT } from '@/lib/discover/discoverFlashListLayout';
import { routeDiscoverSpecies } from '@/lib/routing/routes';
import { isSearchQueryActive } from '@/lib/search/normalizeSearchQuery';
import type { GalleryGridColumns } from '@/lib/detections/galleryGridColumns';
import type { GalleryLayoutMode } from '@/lib/detections/galleryLayoutMode';
import type { DiscoverSpeciesEntry, DiscoverSpeciesKind } from '@/types/discover-species';

type Props = {
  entries: DiscoverSpeciesEntry[];
  totalCount: number;
  kind: DiscoverSpeciesKind;
  loading: boolean;
  error: string | null;
  searchQuery: string;
  layoutMode: GalleryLayoutMode;
  gridColumns: GalleryGridColumns;
  onClearSearch: () => void;
  onRetry: () => void;
};

export function DiscoverSpeciesSection({
  entries,
  totalCount,
  kind,
  loading,
  error,
  searchQuery,
  layoutMode,
  gridColumns,
  onClearSearch,
  onRetry,
}: Props) {
  const router = useRouter();
  const { theme } = useTheme();
  const listSectionSupportingStyles = useListSectionSupportingStyles();
  const { getFilter, getSort, setFilter } = useDiscoverSpeciesBrowse();
  const searchActive = isSearchQueryActive(searchQuery);
  const kindLabel = kind === 'plant' ? 'plant' : 'animal';
  const kindLabelPlural = kind === 'plant' ? 'plants' : 'animals';
  const filter = getFilter(kind);

  const visibleEntries = useMemo(() => {
    const filtered = filterDiscoverSpecies(entries, filter);
    return sortDiscoverSpecies(filtered, getSort(kind));
  }, [entries, filter, getFilter, getSort, kind]);

  const gridItems = useMemo(
    (): DiscoverGridItem[] =>
      visibleEntries.map((entry) => ({
        key: `${entry.kind}-${entry.name}`,
        title: entry.name,
        imageUrl: entry.imageUrl,
        accessibilityLabel: entry.name,
        onPress: () => {
          stageDiscoverSpecies(entry);
          router.push(routeDiscoverSpecies({ kind: entry.kind, name: entry.name }) as unknown as Href);
        },
      })),
    [router, visibleEntries],
  );

  const renderSpeciesItem = useCallback(
    (entry: DiscoverSpeciesEntry) => <SpeciesListItem entry={entry} />,
    [],
  );

  if (loading && entries.length === 0) {
    return <CenteredActivityIndicator accessibilityLabel={`Loading featured ${kindLabelPlural}`} />;
  }

  if (error) {
    return <ErrorRetryBlock message={error} onRetry={onRetry} />;
  }

  const filterActive = filter.kind !== 'all';

  return (
    <View style={[styles.wrap, { gap: theme.spacing.sm }]}>
      <DiscoverSpeciesSubcategoryChips
        kind={kind}
        entries={entries}
        filter={filter}
        onFilterChange={(next) => setFilter(kind, next)}
      />

      <Text style={[styles.hint, { color: theme.colors.textSecondary }]}>
        Categories are estimated from species names.
      </Text>

      {totalCount > 0 ? (
        <Text style={[styles.resultCount, { color: theme.colors.textSecondary }]}>
          {searchActive || filterActive
            ? visibleEntries.length === 1
              ? `1 ${kindLabel} matches`
              : `${visibleEntries.length} ${kindLabelPlural} match`
            : totalCount === 1
              ? `1 featured ${kindLabel}`
              : `${totalCount} featured ${kindLabelPlural}`}
        </Text>
      ) : null}

      {filterActive ? (
        <ActiveFilterChip
          label={discoverSpeciesFilterSummary(filter)}
          onClear={() => setFilter(kind, DEFAULT_DISCOVER_SPECIES_FILTER)}
        />
      ) : null}

      {visibleEntries.length === 0 ? (
        <View style={listSectionSupportingStyles.centered}>
          <Text style={listSectionSupportingStyles.muted}>
            {searchActive || filterActive
              ? `No ${kindLabelPlural} match your filters. Try another category or search.`
              : `No featured ${kindLabelPlural} are available right now.`}
          </Text>
          <ListEmptyActions
            onClearSearch={searchActive ? onClearSearch : undefined}
            onClearFilter={filterActive ? () => setFilter(kind, DEFAULT_DISCOVER_SPECIES_FILTER) : undefined}
            onShowAll={
              searchActive || filterActive
                ? () => {
                    onClearSearch();
                    setFilter(kind, DEFAULT_DISCOVER_SPECIES_FILTER);
                  }
                : undefined
            }
            showAllLabel="Show all species"
          />
        </View>
      ) : layoutMode === 'grid' ? (
        <DiscoverItemGrid
          items={gridItems}
          columnCount={gridColumns}
          accessibilityLabel={`Featured ${kindLabelPlural} grid`}
        />
      ) : (
        <DiscoverDetailFlashList
          data={visibleEntries}
          keyExtractor={(entry) => `${entry.kind}-${entry.name}`}
          renderItem={renderSpeciesItem}
          rowHeight={DISCOVER_SPECIES_LIST_ROW_HEIGHT}
          accessibilityLabel={`Featured ${kindLabelPlural} list`}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {},
  hint: {
    fontSize: 12,
  },
  resultCount: {
    fontSize: 14,
    fontWeight: '400',
  },
});
