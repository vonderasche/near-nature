import { useMemo } from 'react';
import { useLocalSearchParams } from 'expo-router';

import { SpeciesDetailScreenBody } from '@/components/discover/species-detail-screen-body';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { useFloridaStateParks } from '@/hooks/useFloridaStateParks';
import { findDiscoverSpeciesEntry } from '@/lib/discover/discoverRouteCache';
import { DEFAULT_DISCOVER_PARK_SORT } from '@/lib/parks/discoverParkSort';
import { paramToString } from '@/lib/routing/searchParams';
import type { DiscoverSpeciesKind } from '@/types/discover-species';

function parseKind(raw: string | undefined): DiscoverSpeciesKind {
  return raw === 'animal' ? 'animal' : 'plant';
}

export default function DiscoverSpeciesDetailScreen() {
  const params = useLocalSearchParams<{
    speciesSlug?: string | string[];
    kind?: string | string[];
    name?: string | string[];
  }>();
  const kind = parseKind(paramToString(params.kind));
  const nameParam = paramToString(params.name);
  const slugParam = paramToString(params.speciesSlug);
  const name = nameParam || (slugParam ? decodeURIComponent(slugParam) : '');
  const debouncedSearchQuery = useDebouncedValue('', 220);
  const { parks, plants, animals, isLoading } = useFloridaStateParks(
    debouncedSearchQuery,
    DEFAULT_DISCOVER_PARK_SORT,
    null,
  );
  const entries = kind === 'plant' ? plants : animals;
  const entry = useMemo(
    () => findDiscoverSpeciesEntry(entries, kind, name),
    [entries, kind, name],
  );

  return <SpeciesDetailScreenBody entry={entry ?? null} allParks={parks} loading={isLoading} />;
}
