import { useState } from 'react';
import { RefreshControl } from 'react-native';

import { DiscoverBrowseCollapsible } from '@/components/discover/discover-browse-collapsible';
import { DiscoverParksSection } from '@/components/discover/discover-parks-section';
import { DiscoverSearchToolbar } from '@/components/discover/discover-search-toolbar';
import { DiscoverSpeciesSection } from '@/components/discover/discover-species-section';
import { TabScreenWithLogout } from '@/components/layout/tab-screen-with-logout';
import { AppGuideButton } from '@/components/shared/app-guide-button';
import { SEARCH_DEBOUNCE_MS } from '@/constants/search';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { useDeviceCoordinates } from '@/hooks/useDeviceCoordinates';
import { useDiscoverBrowseMode } from '@/hooks/useDiscoverBrowseMode';
import { useDiscoverParkSort } from '@/hooks/useDiscoverParkSort';
import { useRegionalParks } from '@/hooks/useRegionalParks';
import { useGalleryGridColumns } from '@/hooks/useGalleryGridColumns';
import { useGalleryLayoutMode } from '@/hooks/useGalleryLayoutMode';
import { useTheme } from '@/hooks/useTheme';
import { discoverBrowseLabel } from '@/lib/discover/discoverBrowseMode';
import { RegionComingSoon } from '@/components/shared/region-coming-soon';
import { useActiveRegion } from '@/context/RegionContext';

export default function DiscoverScreen() {
  const { theme } = useTheme();
  const { displayLabel, isLive } = useActiveRegion();
  const [searchQuery, setSearchQuery] = useState('');
  const [pullRefreshing, setPullRefreshing] = useState(false);
  const { browseMode, setBrowseMode } = useDiscoverBrowseMode();
  const debouncedSearchQuery = useDebouncedValue(searchQuery, SEARCH_DEBOUNCE_MS);
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
    isRefreshing,
    error,
    refetch,
  } = useRegionalParks(debouncedSearchQuery, sortMode, coords);

  const searchPlaceholder =
    browseMode === 'parks'
      ? 'Search parks, counties, or species…'
      : browseMode === 'plants'
        ? 'Search plants or parks…'
        : 'Search animals or parks…';

  const onRefresh = async () => {
    setPullRefreshing(true);
    try {
      await refetch({ force: true });
    } finally {
      setPullRefreshing(false);
    }
  };

  if (!isLive) {
    return (
      <TabScreenWithLogout
        title="Discover"
        subtitle={`${displayLabel} — coming soon.`}
        hideLogout
        titleAccessory={<AppGuideButton accessibilityLabel="How to use Discover and the app" />}>
        <RegionComingSoon
          title="Coming soon"
          message={`${displayLabel} parks, plants, and animals are on the way. Switch to Southeast in Profile to explore Florida.`}
          showProfileAction
        />
      </TabScreenWithLogout>
    );
  }

  return (
    <TabScreenWithLogout
      title="Discover"
      subtitle={isLive ? "Florida state parks, plants, and wildlife." : `${displayLabel} — coming soon.`}
      hideLogout
      titleAccessory={<AppGuideButton accessibilityLabel="How to use Discover and the app" />}
      refreshControl={
        <RefreshControl
          refreshing={pullRefreshing}
          onRefresh={() => void onRefresh()}
          tintColor={theme.colors.textPrimary}
          colors={[theme.colors.textPrimary]}
        />
      }
      backgroundRefreshing={isRefreshing && !pullRefreshing && parks.length > 0}>
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
          onClearSearch={() => setSearchQuery('')}
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
          onClearSearch={() => setSearchQuery('')}
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
          onClearSearch={() => setSearchQuery('')}
          onRetry={() => void refetch()}
        />
      )}
    </TabScreenWithLogout>
  );
}
