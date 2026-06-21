import { useLocalSearchParams } from 'expo-router';

import { ParkDetailScreenBody, useParkFromRoute } from '@/components/discover/park-detail-screen-body';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { useFloridaStateParks } from '@/hooks/useFloridaStateParks';
import { DEFAULT_DISCOVER_PARK_SORT } from '@/lib/parks/discoverParkSort';
import { paramToString } from '@/lib/routing/searchParams';

export default function DiscoverParkDetailScreen() {
  const params = useLocalSearchParams<{
    parkId?: string | string[];
    latitude?: string | string[];
    longitude?: string | string[];
  }>();
  const parkId = paramToString(params.parkId);
  const latitudeRaw = paramToString(params.latitude);
  const longitudeRaw = paramToString(params.longitude);
  const latitude = latitudeRaw ? Number(latitudeRaw) : null;
  const longitude = longitudeRaw ? Number(longitudeRaw) : null;
  const debouncedSearchQuery = useDebouncedValue('', 220);
  const { parks, isLoading } = useFloridaStateParks(debouncedSearchQuery, DEFAULT_DISCOVER_PARK_SORT, null);
  const park = useParkFromRoute(parks, parkId, latitude, longitude);

  return <ParkDetailScreenBody park={park} allParks={parks} loading={isLoading} />;
}
