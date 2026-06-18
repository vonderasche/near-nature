import { useState } from 'react';

import { DiscoverParkSortChips } from '@/components/discover/discover-park-sort-chips';
import { DiscoverParksSection } from '@/components/discover/discover-parks-section';
import { TabScreenWithLogout } from '@/components/layout/tab-screen-with-logout';
import { ScreenSearchField } from '@/components/ui/screen-search-field';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { useDeviceCoordinates } from '@/hooks/useDeviceCoordinates';
import { useDiscoverParkSort } from '@/hooks/useDiscoverParkSort';
import { useFloridaStateParks } from '@/hooks/useFloridaStateParks';

export default function DiscoverScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearchQuery = useDebouncedValue(searchQuery, 220);
  const { sortMode, setSortMode } = useDiscoverParkSort();
  const { coords, status: locationStatus } = useDeviceCoordinates(sortMode === 'nearest');
  const { parks, totalCount, isLoading, error, refetch } = useFloridaStateParks(
    debouncedSearchQuery,
    sortMode,
    coords,
  );

  return (
    <TabScreenWithLogout
      title="Discover"
      subtitle="Explore Florida state parks and the plants and wildlife you can find there."
      hideLogout>
      <ScreenSearchField
        value={searchQuery}
        onChangeText={setSearchQuery}
        placeholder="Search parks, counties, or species…"
        accessibilityLabel="Search Florida state parks"
        accessibilityHint="Filters parks by name, location, or featured plants and animals"
      />
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
    </TabScreenWithLogout>
  );
}
