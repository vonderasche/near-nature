import { memo } from 'react';
import { useRouter } from 'expo-router';

import { ListDetailCard } from '@/components/shared/list-detail-card';
import { ListThumbnail } from '@/components/shared/list-thumbnail';
import { stageDiscoverSpecies } from '@/lib/discover/discoverRouteCache';
import { getDiscoverSubcategoryLabel } from '@/lib/discover/discoverSpeciesSubcategories';
import { routeDiscoverSpecies } from '@/lib/routing/routes';
import type { DiscoverSpeciesEntry } from '@/types/discover-species';

type Props = {
  entry: DiscoverSpeciesEntry;
};

function formatSubtitle(entry: DiscoverSpeciesEntry): string | null {
  if (entry.parkNames.length === 0) return null;
  if (entry.parkNames.length <= 2) {
    return entry.parkNames.join(' · ');
  }
  return `${entry.parkNames[0]} · ${entry.parkNames[1]} · +${entry.parkNames.length - 2} more`;
}

function formatMeta(entry: DiscoverSpeciesEntry): string {
  const parks =
    entry.parkCount === 1 ? '1 park' : `${entry.parkCount} parks`;
  return `${getDiscoverSubcategoryLabel(entry.subcategoryId)} · ${parks}`;
}

function SpeciesListItemComponent({ entry }: Props) {
  const router = useRouter();

  const openDetail = () => {
    stageDiscoverSpecies(entry);
    router.push(routeDiscoverSpecies({ kind: entry.kind, name: entry.name }));
  };

  return (
    <ListDetailCard
      surface
      title={entry.name}
      subtitle={formatSubtitle(entry)}
      meta={formatMeta(entry)}
      leading={
        entry.imageUrl ? (
          <ListThumbnail uri={entry.imageUrl} recyclingKey={`${entry.kind}-${entry.name}`} />
        ) : undefined
      }
      onPress={openDetail}
      accessibilityHint="Opens species details"
      accessibilityLabel={`${entry.name}, ${formatMeta(entry)}`}
    />
  );
}

export const SpeciesListItem = memo(SpeciesListItemComponent);
