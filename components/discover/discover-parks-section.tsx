import { useRouter, type Href } from 'expo-router';
import { useCallback, useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { DiscoverDetailFlashList } from '@/components/discover/discover-detail-flash-list';
import { DiscoverItemGrid, type DiscoverGridItem } from '@/components/discover/discover-item-grid';
import { ParkListItem } from '@/components/discover/park-list-item';
import { ErrorRetryBlock } from '@/components/profile/error-retry-block';
import { ListEmptyActions } from '@/components/shared/list-empty-actions';
import { CenteredActivityIndicator } from '@/components/shared/centered-activity-indicator';
import { useListSectionSupportingStyles } from '@/components/shared/list-detail-card';
import { useTheme } from '@/hooks/useTheme';
import { floridaStateParkListKey } from '@/lib/parks/formatFloridaStatePark';
import type { DiscoverParkSortMode } from '@/lib/parks/discoverParkSort';
import { isSearchQueryActive } from '@/lib/search/normalizeSearchQuery';
import type { DeviceCoordinatesStatus } from '@/hooks/useDeviceCoordinates';
import type { DeviceCoordinates } from '@/lib/parks/sortFloridaStateParks';
import { resolveParkListImageUrl } from '@/lib/parks/parkSpeciesHighlights';
import { stageDiscoverPark } from '@/lib/discover/discoverRouteCache';
import { DISCOVER_PARK_LIST_ROW_HEIGHT } from '@/lib/discover/discoverFlashListLayout';
import { routeDiscoverPark } from '@/lib/routing/routes';
import type { GalleryGridColumns } from '@/lib/detections/galleryGridColumns';
import type { GalleryLayoutMode } from '@/lib/detections/galleryLayoutMode';
import type { FloridaStatePark } from '@/types/florida-state-park';

type Props = {
  parks: FloridaStatePark[];
  totalCount: number;
  loading: boolean;
  error: string | null;
  searchQuery: string;
  sortMode: DiscoverParkSortMode;
  locationStatus: DeviceCoordinatesStatus;
  deviceCoords: DeviceCoordinates | null;
  layoutMode: GalleryLayoutMode;
  gridColumns: GalleryGridColumns;
  onClearSearch: () => void;
  onRetry: () => void;
};

export function DiscoverParksSection({
  parks,
  totalCount,
  loading,
  error,
  searchQuery,
  sortMode,
  locationStatus,
  deviceCoords,
  layoutMode,
  gridColumns,
  onClearSearch,
  onRetry,
}: Props) {
  const router = useRouter();
  const { theme } = useTheme();
  const listSectionSupportingStyles = useListSectionSupportingStyles();
  const searchActive = isSearchQueryActive(searchQuery);
  const showDistance = sortMode === 'nearest' && locationStatus === 'ready';
  const nearestSortNotice =
    sortMode === 'nearest' && locationStatus === 'denied'
      ? 'Location permission is off — showing parks A–Z instead.'
      : sortMode === 'nearest' && locationStatus === 'unavailable'
        ? 'Location is unavailable — showing parks A–Z instead.'
        : null;

  const gridItems = useMemo(
    (): DiscoverGridItem[] =>
      parks.map((park) => ({
        key: floridaStateParkListKey(park),
        title: park.parkName,
        imageUrl: resolveParkListImageUrl(park),
        accessibilityLabel: park.parkName,
        onPress: () => {
          stageDiscoverPark(park);
          router.push(
            routeDiscoverPark({
              parkId: park.parkId,
              latitude: park.latitude != null ? String(park.latitude) : undefined,
              longitude: park.longitude != null ? String(park.longitude) : undefined,
            }) as unknown as Href,
          );
        },
      })),
    [parks, router],
  );

  const renderParkItem = useCallback(
    (park: FloridaStatePark) => (
      <ParkListItem park={park} deviceCoords={deviceCoords} showDistance={showDistance} />
    ),
    [deviceCoords, showDistance],
  );

  if (loading && parks.length === 0) {
    return <CenteredActivityIndicator accessibilityLabel="Loading Florida state parks" />;
  }

  if (error) {
    return <ErrorRetryBlock message={error} onRetry={onRetry} />;
  }

  return (
    <View style={[styles.wrap, { gap: theme.spacing.sm }]}>
      {totalCount > 0 ? (
        <Text style={[styles.resultCount, { color: theme.colors.textSecondary }]}>
          {searchActive
            ? parks.length === 1
              ? '1 park matches your search'
              : `${parks.length} parks match your search`
            : totalCount === 1
              ? '1 Florida state park'
              : `${totalCount} Florida state parks`}
        </Text>
      ) : null}

      {nearestSortNotice ? (
        <Text style={[styles.sortNotice, { color: theme.colors.textSecondary }]}>{nearestSortNotice}</Text>
      ) : null}

      {parks.length === 0 ? (
        <View style={listSectionSupportingStyles.centered}>
          <Text style={listSectionSupportingStyles.muted}>
            {searchActive
              ? 'No parks match your search. Try a county, city, or species name.'
              : 'No park data is available right now.'}
          </Text>
          {searchActive ? (
            <ListEmptyActions onClearSearch={onClearSearch} showAllLabel="Show all parks" onShowAll={onClearSearch} />
          ) : null}
        </View>
      ) : layoutMode === 'grid' ? (
        <DiscoverItemGrid
          items={gridItems}
          columnCount={gridColumns}
          accessibilityLabel="Florida state parks grid"
        />
      ) : (
        <DiscoverDetailFlashList
          data={parks}
          keyExtractor={floridaStateParkListKey}
          renderItem={renderParkItem}
          rowHeight={DISCOVER_PARK_LIST_ROW_HEIGHT}
          accessibilityLabel="Florida state parks list"
        />
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
  sortNotice: {
    fontSize: 14,
    fontWeight: '400',
  },
});
