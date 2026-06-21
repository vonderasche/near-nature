import { Pressable, StyleSheet } from 'react-native';

import { ListDetailCard } from '@/components/shared/list-detail-card';
import { ListThumbnail } from '@/components/shared/list-thumbnail';
import { formatParkMeta, formatSpeciesPreview, parkDistanceMiles } from '@/lib/parks/formatFloridaStatePark';
import { resolveParkListImageUrl, speciesHighlightNames } from '@/lib/parks/parkSpeciesHighlights';
import type { DeviceCoordinates } from '@/lib/parks/sortFloridaStateParks';
import type { FloridaStatePark } from '@/types/florida-state-park';

type Props = {
  park: FloridaStatePark;
  deviceCoords?: DeviceCoordinates | null;
  showDistance?: boolean;
  onPress: (park: FloridaStatePark) => void;
};

export function ParkListItem({ park, deviceCoords = null, showDistance = false, onPress }: Props) {
  const wildlifePreview =
    formatSpeciesPreview(speciesHighlightNames(park.topAnimals)) ??
    formatSpeciesPreview(speciesHighlightNames(park.topPlants));
  const distanceMiles = showDistance ? parkDistanceMiles(park, deviceCoords) : null;
  const meta = formatParkMeta(park, { distanceMiles });
  const imageUrl = resolveParkListImageUrl(park);

  return (
    <Pressable
      onPress={() => onPress(park)}
      style={({ pressed }) => pressed && styles.rowPressed}
      android_ripple={{ color: 'rgba(255,255,255,0.08)' }}
      accessibilityRole="button"
      accessibilityHint="Opens park details"
      accessibilityLabel={`${park.parkName}, ${meta}`}>
      <ListDetailCard
        title={park.parkName}
        subtitle={wildlifePreview}
        description={park.description}
        meta={meta}
        leading={<ListThumbnail uri={imageUrl} recyclingKey={park.parkId} />}
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  rowPressed: {
    opacity: 0.92,
  },
});
