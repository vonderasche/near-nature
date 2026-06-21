import { StyleSheet, View } from 'react-native';
import { useRouter, type Href } from 'expo-router';

import { DiscoverSpeciesFilterButton } from '@/components/discover/discover-species-filter-button';
import { GalleryGridColumnsPicker } from '@/components/profile/gallery-grid-columns-picker';
import { GalleryLayoutToggle } from '@/components/profile/gallery-layout-toggle';
import { ScreenSearchField } from '@/components/ui/screen-search-field';
import { useDiscoverSpeciesBrowse } from '@/context/DiscoverSpeciesBrowseContext';
import { useGalleryGridColumns } from '@/hooks/useGalleryGridColumns';
import { useGalleryLayoutMode } from '@/hooks/useGalleryLayoutMode';
import { useTheme } from '@/hooks/useTheme';
import type { DiscoverBrowseMode } from '@/lib/discover/discoverBrowseMode';
import { discoverBrowseLabel } from '@/lib/discover/discoverBrowseMode';
import { routeDiscoverSpeciesFilter } from '@/lib/routing/routes';
import type { GalleryLayoutMode } from '@/lib/detections/galleryLayoutMode';

type Props = {
  browseMode: DiscoverBrowseMode;
  searchQuery: string;
  onSearchQueryChange: (value: string) => void;
  searchPlaceholder: string;
  layoutMode: GalleryLayoutMode;
  onLayoutModeChange: (mode: GalleryLayoutMode) => void;
  gridColumns: ReturnType<typeof useGalleryGridColumns>['columns'];
  onGridColumnsChange: ReturnType<typeof useGalleryGridColumns>['setColumnCount'];
};

export function DiscoverSearchToolbar({
  browseMode,
  searchQuery,
  onSearchQueryChange,
  searchPlaceholder,
  layoutMode,
  onLayoutModeChange,
  gridColumns,
  onGridColumnsChange,
}: Props) {
  const router = useRouter();
  const { theme } = useTheme();
  const { getFilter } = useDiscoverSpeciesBrowse();
  const showSpeciesFilter = browseMode === 'plants' || browseMode === 'animals';
  const speciesKind = browseMode === 'animals' ? 'animal' : 'plant';

  return (
    <View style={[styles.row, { gap: theme.spacing.sm }]}>
      <ScreenSearchField
        borderless
        containerStyle={styles.searchField}
        value={searchQuery}
        onChangeText={onSearchQueryChange}
        placeholder={searchPlaceholder}
        accessibilityLabel={`Search ${discoverBrowseLabel(browseMode).toLowerCase()}`}
        accessibilityHint="Filters the list below"
      />
      {showSpeciesFilter ? (
        <DiscoverSpeciesFilterButton
          value={getFilter(speciesKind)}
          onPress={() =>
            router.push(routeDiscoverSpeciesFilter({ kind: speciesKind }) as unknown as Href)
          }
        />
      ) : null}
      <GalleryLayoutToggle value={layoutMode} onChange={onLayoutModeChange} />
      {layoutMode === 'grid' ? (
        <GalleryGridColumnsPicker value={gridColumns} onChange={onGridColumnsChange} />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  searchField: {
    flex: 1,
    minWidth: 0,
  },
});
