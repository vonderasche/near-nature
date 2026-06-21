import { useState } from 'react';

import { DiscoverBrowseChips } from '@/components/discover/discover-browse-chips';
import { DiscoverParkSortChips } from '@/components/discover/discover-park-sort-chips';
import { DiscoverParksSection } from '@/components/discover/discover-parks-section';
import { DiscoverSpeciesSection } from '@/components/discover/discover-species-section';
import { TabScreenWithLogout } from '@/components/layout/tab-screen-with-logout';
import { AppGuideButton } from '@/components/shared/app-guide-button';
import { ScreenSearchField } from '@/components/ui/screen-search-field';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { useDeviceCoordinates } from '@/hooks/useDeviceCoordinates';
import { useDiscoverParkSort } from '@/hooks/useDiscoverParkSort';
import { useFloridaStateParks } from '@/hooks/useFloridaStateParks';
import type { DiscoverBrowseMode } from '@/lib/discover/discoverBrowseMode';
import { DEFAULT_DISCOVER_BROWSE } from '@/lib/discover/discoverBrowseMode';

export default function DiscoverScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [browseMode, setBrowseMode] = useState<DiscoverBrowseMode>(DEFAULT_DISCOVER_BROWSE);
  const debouncedSearchQuery = useDebouncedValue(searchQuery, 220);
  const { sortMode, setSortMode } = useDiscoverParkSort();
  const { coords, status: locationStatus } = useDeviceCoordinates(sortMode === 'nearest');
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
      subtitle="Explore Florida state parks and the plants and wildlife you can find there."
      hideLogout
      titleAccessory={<AppGuideButton accessibilityLabel="How to use Discover and the app" />}>
      <ScreenSearchField
        value={searchQuery}
        onChangeText={setSearchQuery}
        placeholder={searchPlaceholder}
        accessibilityLabel="Search Discover"
        accessibilityHint="Filters parks, plants, or animals depending on the selected tab"
      />
      <DiscoverBrowseChips value={browseMode} onChange={setBrowseMode} />
      {browseMode === 'parks' ? (
        <>
          <DiscoverParkSortChips value={sortMode} onChange={setSortMode} />
          <DiscoverParksSection
            parks={parks}
            totalCount={totalCount}
            loading={isLoading}
            error={error}
            searchQuery={debouncedSearchQuery}
            sortMode={sortMode}
            locationStatus={locationStatus}
            deviceCoords={coords}
            onRetry={() => void refetch()}
          />
        </>
      ) : browseMode === 'plants' ? (
        <DiscoverSpeciesSection
          entries={plants}
          totalCount={plantCount}
          kind="plant"
          loading={isLoading}
          error={error}
          searchQuery={debouncedSearchQuery}
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
          onRetry={() => void refetch()}
        />
      )}
    </TabScreenWithLogout>
  );
}
