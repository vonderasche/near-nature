import { Pressable, StyleSheet } from 'react-native';

import { ListDetailCard } from '@/components/shared/list-detail-card';
import { ListThumbnail } from '@/components/shared/list-thumbnail';
import type { DiscoverSpeciesEntry } from '@/types/discover-species';

type Props = {
  entry: DiscoverSpeciesEntry;
  onPress: (entry: DiscoverSpeciesEntry) => void;
};

function formatMeta(entry: DiscoverSpeciesEntry): string {
  const label = entry.kind === 'plant' ? 'plant' : 'animal';
  if (entry.parkCount === 1) {
    return `Featured at 1 park · ${label}`;
  }
  return `Featured at ${entry.parkCount} parks · ${label}`;
}

function formatSubtitle(entry: DiscoverSpeciesEntry): string | null {
  if (entry.parkNames.length === 0) return null;
  if (entry.parkNames.length <= 2) {
    return entry.parkNames.join(' · ');
  }
  return `${entry.parkNames[0]} · ${entry.parkNames[1]} · +${entry.parkNames.length - 2} more`;
}

export function SpeciesListItem({ entry, onPress }: Props) {
  return (
    <Pressable
      onPress={() => onPress(entry)}
      style={({ pressed }) => pressed && styles.rowPressed}
      android_ripple={{ color: 'rgba(255,255,255,0.08)' }}
      accessibilityRole="button"
      accessibilityHint="Opens species details"
      accessibilityLabel={`${entry.name}, ${formatMeta(entry)}`}>
      <ListDetailCard
        title={entry.name}
        subtitle={formatSubtitle(entry)}
        meta={formatMeta(entry)}
        leading={
          entry.imageUrl ? (
            <ListThumbnail uri={entry.imageUrl} recyclingKey={`${entry.kind}-${entry.name}`} />
          ) : undefined
        }
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  rowPressed: {
    opacity: 0.92,
  },
});
