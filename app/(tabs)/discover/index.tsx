import { useState } from 'react';

import { DiscoverBrowseCollapsible } from '@/components/discover/discover-browse-collapsible';
import { DiscoverParksSection } from '@/components/discover/discover-parks-section';
import { DiscoverSearchToolbar } from '@/components/discover/discover-search-toolbar';
import { DiscoverSpeciesSection } from '@/components/discover/discover-species-section';
import { TabScreenWithLogout } from '@/components/layout/tab-screen-with-logout';
import { AppGuideButton } from '@/components/shared/app-guide-button';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { useDeviceCoordinates } from '@/hooks/useDeviceCoordinates';
import { useDiscoverParkSort } from '@/hooks/useDiscoverParkSort';
import { useFloridaStateParks } from '@/hooks/useFloridaStateParks';
import { useGalleryGridColumns } from '@/hooks/useGalleryGridColumns';
import { useGalleryLayoutMode } from '@/hooks/useGalleryLayoutMode';
import type { DiscoverBrowseMode } from '@/lib/discover/discoverBrowseMode';
import { DEFAULT_DISCOVER_BROWSE } from '@/lib/discover/discoverBrowseMode';

export default function DiscoverScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [browseMode, setBrowseMode] = useState<DiscoverBrowseMode>(DEFAULT_DISCOVER_BROWSE);
  const debouncedSearchQuery = useDebouncedValue(searchQuery, 220);
  const { sortMode, setSortMode } = useDiscoverParkSort();
  const { coords, status: locationStatus } = useDeviceCoordinates(sortMode === 'nearest');
  const { layoutMode, setLayoutMode } = useGalleryLayoutMode();
  const { columns, setColumnCount } = useGalleryGridColumns();
  const {
    parks,
    plants,
    animals,
    plantCount,
    animalCount,
    totalCount,
    isLoading,
    error,
    refetch,
  } = useFloridaStateParks(debouncedSearchQuery, sortMode, coords);

  const searchPlaceholder =
    browseMode === 'parks'
      ? 'Search parks, counties, or species…'
      : browseMode === 'plants'
        ? 'Search plants or parks…'
        : 'Search animals or parks…';

  return (
    <TabScreenWithLogout
      title="Discover"
      subtitle="Florida state parks, plants, and wildlife."
      hideLogout
      titleAccessory={<AppGuideButton accessibilityLabel="How to use Discover and the app" />}>
      <DiscoverBrowseCollapsible
        browseMode={browseMode}
        onBrowseModeChange={setBrowseMode}
        parkSortMode={sortMode}
        onParkSortModeChange={setSortMode}
      />

      <DiscoverSearchToolbar
        browseMode={browseMode}
        searchQuery={searchQuery}
        onSearchQueryChange={setSearchQuery}
        searchPlaceholder={searchPlaceholder}
        layoutMode={layoutMode}
        onLayoutModeChange={setLayoutMode}
        gridColumns={columns}
        onGridColumnsChange={setColumnCount}
      />

      {browseMode === 'parks' ? (
        <DiscoverParksSection
          parks={parks}
          totalCount={totalCount}
          loading={isLoading}
          error={error}
          searchQuery={debouncedSearchQuery}
          sortMode={sortMode}
          locationStatus={locationStatus}
          deviceCoords={coords}
          layoutMode={layoutMode}
          gridColumns={columns}
          onRetry={() => void refetch()}
        />
      ) : browseMode === 'plants' ? (
        <DiscoverSpeciesSection
          entries={plants}
          totalCount={plantCount}
          kind="plant"
          loading={isLoading}
          error={error}
          searchQuery={debouncedSearchQuery}
          layoutMode={layoutMode}
          gridColumns={columns}
          onRetry={() => void refetch()}
        />
      ) : (
        <DiscoverSpeciesSection
          entries={animals}
          totalCount={animalCount}
          kind="animal"
          loading={isLoading}
          error={error}
          searchQuery={debouncedSearchQuery}
          layoutMode={layoutMode}
          gridColumns={columns}
          onRetry={() => void refetch()}
        />
      )}
    </TabScreenWithLogout>
  );
}
