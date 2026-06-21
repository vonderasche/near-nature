import { useCallback, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { ParkDetailModal } from '@/components/discover/park-detail-modal';
import { ParkListItem } from '@/components/discover/park-list-item';
import { ErrorRetryBlock } from '@/components/profile/error-retry-block';
import { CenteredActivityIndicator } from '@/components/shared/centered-activity-indicator';
import { useListSectionSupportingStyles } from '@/components/shared/list-detail-card';
import { useTheme } from '@/hooks/useTheme';
import { floridaStateParkListKey } from '@/lib/parks/formatFloridaStatePark';
import type { DiscoverParkSortMode } from '@/lib/parks/discoverParkSort';
import { isSearchQueryActive } from '@/lib/search/normalizeSearchQuery';
import type { DeviceCoordinatesStatus } from '@/hooks/useDeviceCoordinates';
import type { DeviceCoordinates } from '@/lib/parks/sortFloridaStateParks';
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
  onRetry,
}: Props) {
  const { theme } = useTheme();
  const listSectionSupportingStyles = useListSectionSupportingStyles();
  const [selectedPark, setSelectedPark] = useState<FloridaStatePark | null>(null);
  const searchActive = isSearchQueryActive(searchQuery);
  const showDistance = sortMode === 'nearest' && locationStatus === 'ready';
  const nearestSortNotice =
    sortMode === 'nearest' && locationStatus === 'denied'
      ? 'Location permission is off — showing parks A–Z instead.'
      : sortMode === 'nearest' && locationStatus === 'unavailable'
        ? 'Location is unavailable — showing parks A–Z instead.'
        : null;

  const closeDetail = useCallback(() => {
    setSelectedPark(null);
  }, []);

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
        </View>
      ) : (
        parks.map((park) => (
          <ParkListItem
            key={floridaStateParkListKey(park)}
            park={park}
            deviceCoords={deviceCoords}
            showDistance={showDistance}
            onPress={setSelectedPark}
          />
        ))
      )}

      <ParkDetailModal visible={selectedPark != null} park={selectedPark} onClose={closeDetail} />
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
