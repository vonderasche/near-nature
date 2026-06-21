import { View } from 'react-native';
import { useRouter, type Href } from 'expo-router';

import { DiscoverSpeciesFilterButton } from '@/components/discover/discover-species-filter-button';
import { GalleryGridColumnsPicker } from '@/components/profile/gallery-grid-columns-picker';
import { GalleryLayoutToggle } from '@/components/profile/gallery-layout-toggle';
import { ListSearchToolbar } from '@/components/shared/list-search-toolbar';
import type { DiscoverBrowseMode } from '@/lib/discover/discoverBrowseMode';
import { discoverBrowseLabel } from '@/lib/discover/discoverBrowseMode';
import { routeDiscoverSpeciesFilter } from '@/lib/routing/routes';
import type { GalleryGridColumns } from '@/lib/detections/galleryGridColumns';
import type { GalleryLayoutMode } from '@/lib/detections/galleryLayoutMode';

type Props = {
  browseMode: DiscoverBrowseMode;
  searchQuery: string;
  onSearchQueryChange: (value: string) => void;
  searchPlaceholder: string;
  layoutMode: GalleryLayoutMode;
  onLayoutModeChange: (mode: GalleryLayoutMode) => void;
  gridColumns: GalleryGridColumns;
  onGridColumnsChange: (columns: GalleryGridColumns) => void;
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
  const showSpeciesFilter = browseMode === 'plants' || browseMode === 'animals';
  const speciesKind = browseMode === 'animals' ? 'animal' : 'plant';

  return (
    <ListSearchToolbar
      searchQuery={searchQuery}
      onSearchQueryChange={onSearchQueryChange}
      placeholder={searchPlaceholder}
      accessibilityLabel={`Search ${discoverBrowseLabel(browseMode).toLowerCase()}`}
      trailing={
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          {showSpeciesFilter ? (
            <DiscoverSpeciesFilterButton
              kind={speciesKind}
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
      }
    />
  );
}
