import { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useRouter, type Href } from 'expo-router';

import { DiscoverItemGrid, type DiscoverGridItem } from '@/components/discover/discover-item-grid';
import { SpeciesListItem } from '@/components/discover/species-list-item';
import { discoverSpeciesFilterSummary } from '@/components/discover/discover-species-filter-content';
import { ErrorRetryBlock } from '@/components/profile/error-retry-block';
import { CenteredActivityIndicator } from '@/components/shared/centered-activity-indicator';
import { useListSectionSupportingStyles } from '@/components/shared/list-detail-card';
import { useDiscoverSpeciesBrowse } from '@/context/DiscoverSpeciesBrowseContext';
import { useTheme } from '@/hooks/useTheme';
import { filterDiscoverSpecies, sortDiscoverSpecies } from '@/lib/discover/discoverSpeciesFilter';
import { stageDiscoverSpecies } from '@/lib/discover/discoverRouteCache';
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
  onRetry,
}: Props) {
  const router = useRouter();
  const { theme } = useTheme();
  const listSectionSupportingStyles = useListSectionSupportingStyles();
  const { getFilter, getSort } = useDiscoverSpeciesBrowse();
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

  if (loading && entries.length === 0) {
    return <CenteredActivityIndicator accessibilityLabel={`Loading featured ${kindLabelPlural}`} />;
  }

  if (error) {
    return <ErrorRetryBlock message={error} onRetry={onRetry} />;
  }

  const filterActive = filter.kind !== 'all';

  return (
    <View style={[styles.wrap, { gap: theme.spacing.sm }]}>
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
        <Text style={[styles.filterSummary, { color: theme.colors.textSecondary }]}>
          {discoverSpeciesFilterSummary(filter)}
        </Text>
      ) : null}

      {visibleEntries.length === 0 ? (
        <View style={listSectionSupportingStyles.centered}>
          <Text style={listSectionSupportingStyles.muted}>
            {searchActive || filterActive
              ? `No ${kindLabelPlural} match your filters. Try another category or search.`
              : `No featured ${kindLabelPlural} are available right now.`}
          </Text>
        </View>
      ) : layoutMode === 'grid' ? (
        <DiscoverItemGrid items={gridItems} columnCount={gridColumns} />
      ) : (
        visibleEntries.map((entry) => (
          <SpeciesListItem key={`${entry.kind}-${entry.name}`} entry={entry} />
        ))
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {},
  resultCount: {
    fontSize: 14,
    fontWeight: '400',
  },
  filterSummary: {
    fontSize: 13,
    fontWeight: '400',
  },
});
