import { memo } from 'react';
import { useRouter } from 'expo-router';

import { ListDetailCard } from '@/components/shared/list-detail-card';
import { ListThumbnail } from '@/components/shared/list-thumbnail';
import { stageDiscoverPark } from '@/lib/discover/discoverRouteCache';
import { routeDiscoverPark } from '@/lib/routing/routes';
import { formatParkMeta, formatSpeciesPreview, parkDistanceMiles } from '@/lib/parks/formatFloridaStatePark';
import { resolveParkListImageUrl, speciesHighlightNames } from '@/lib/parks/parkSpeciesHighlights';
import type { DeviceCoordinates } from '@/lib/parks/sortFloridaStateParks';
import type { FloridaStatePark } from '@/types/florida-state-park';

type Props = {
  park: FloridaStatePark;
  deviceCoords?: DeviceCoordinates | null;
  showDistance?: boolean;
};

function ParkListItemComponent({ park, deviceCoords = null, showDistance = false }: Props) {
  const router = useRouter();
  const wildlifePreview =
    formatSpeciesPreview(speciesHighlightNames(park.topAnimals)) ??
    formatSpeciesPreview(speciesHighlightNames(park.topPlants));
  const distanceMiles = showDistance ? parkDistanceMiles(park, deviceCoords) : null;
  const meta = formatParkMeta(park, { distanceMiles });
  const imageUrl = resolveParkListImageUrl(park);
  const accessLabel = park.publicAccess.toLowerCase().includes('no fee') ? 'Free' : 'Fee';

  const openDetail = () => {
    stageDiscoverPark(park);
    router.push(
      routeDiscoverPark({
        parkId: park.parkId,
        latitude: park.latitude != null ? String(park.latitude) : undefined,
        longitude: park.longitude != null ? String(park.longitude) : undefined,
      }),
    );
  };

  return (
    <ListDetailCard
      surface
      title={park.parkName}
      subtitle={wildlifePreview}
      description={park.description}
      meta={meta}
      cornerBadge={accessLabel}
      leading={<ListThumbnail uri={imageUrl} recyclingKey={park.parkId} />}
      onPress={openDetail}
      accessibilityHint="Opens park details"
      accessibilityLabel={`${park.parkName}, ${meta}`}
    />
  );
}

export const ParkListItem = memo(ParkListItemComponent);