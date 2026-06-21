import { ScrollView } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';

import { DiscoverSpeciesFilterContent } from '@/components/discover/discover-species-filter-content';
import { Screen } from '@/components/ui/Screen';
import { StackScreenHeader } from '@/components/ui/StackScreenHeader';
import { useDiscoverSpeciesBrowse } from '@/context/DiscoverSpeciesBrowseContext';
import { useTheme } from '@/hooks/useTheme';
import { paramToString } from '@/lib/routing/searchParams';
import type { DiscoverSpeciesKind } from '@/types/discover-species';

function parseKind(raw: string | undefined): DiscoverSpeciesKind {
  return raw === 'animal' ? 'animal' : 'plant';
}

export function DiscoverSpeciesFilterScreenBody() {
  const router = useRouter();
  const { theme } = useTheme();
  const { getFilter, setFilter } = useDiscoverSpeciesBrowse();
  const kind = parseKind(paramToString(useLocalSearchParams<{ kind?: string | string[] }>().kind));
  const filter = getFilter(kind);
  const title = kind === 'plant' ? 'Filter plants' : 'Filter animals';

  return (
    <Screen>
      <ScrollView contentContainerStyle={{ paddingBottom: theme.spacing.xxl }}>
        <StackScreenHeader title={title} subtitle="Category" />
        <DiscoverSpeciesFilterContent
          kind={kind}
          value={filter}
          onChange={(next) => setFilter(kind, next)}
          onDone={() => router.back()}
        />
      </ScrollView>
    </Screen>
  );
}
