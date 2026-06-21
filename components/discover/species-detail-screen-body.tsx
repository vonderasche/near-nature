import { Image } from 'expo-image';
import { useMemo } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';

import { openDiscoverParkFromNames } from '@/components/discover/park-detail-screen-body';
import { ListThumbnail } from '@/components/shared/list-thumbnail';
import { Section } from '@/components/ui/Section';
import { Screen } from '@/components/ui/Screen';
import { StackScreenHeader } from '@/components/ui/StackScreenHeader';
import { Text } from '@/components/ui/Text';
import { HeroIcon } from '@/components/ui/hero-icon';
import { useTheme } from '@/hooks/useTheme';
import { getDiscoverSubcategoryLabel } from '@/lib/discover/discoverSpeciesSubcategories';
import { resolveParkListImageUrl } from '@/lib/parks/parkSpeciesHighlights';
import type { DiscoverSpeciesEntry } from '@/types/discover-species';
import type { FloridaStatePark } from '@/types/florida-state-park';

type Props = {
  entry: DiscoverSpeciesEntry | null;
  allParks: readonly FloridaStatePark[];
  loading?: boolean;
};

function findParkByName(parks: readonly FloridaStatePark[], parkName: string): FloridaStatePark | undefined {
  return parks.find((park) => park.parkName === parkName);
}

export function SpeciesDetailScreenBody({ entry, allParks, loading = false }: Props) {
  const router = useRouter();
  const { theme } = useTheme();

  const styles = useMemo(
    () =>
      StyleSheet.create({
        heroWrap: {
          width: '100%',
          height: 220,
          marginBottom: theme.spacing.sm,
        },
        heroImage: {
          width: '100%',
          height: '100%',
          borderRadius: theme.radii.md,
          backgroundColor: theme.colors.surfaceRaised,
        },
        parkRow: {
          flexDirection: 'row',
          alignItems: 'center',
          gap: theme.spacing.md,
          paddingVertical: theme.spacing.sm,
          paddingHorizontal: theme.spacing.sm,
          borderRadius: theme.radii.md,
          backgroundColor: theme.colors.surfaceRaised,
          minHeight: 56,
        },
        parkRowPressed: {
          opacity: 0.9,
        },
        parkBody: {
          flex: 1,
          minWidth: 0,
          gap: 2,
        },
      }),
    [theme],
  );

  if (loading && !entry) {
    return (
      <Screen>
        <StackScreenHeader title="Species" />
        <Text variant="subtitle" color="secondary">
          Loading species details…
        </Text>
      </Screen>
    );
  }

  if (!entry) {
    return (
      <Screen>
        <StackScreenHeader title="Species" />
        <Text variant="subtitle" color="secondary">
          This species is no longer available. Go back and try again from Discover.
        </Text>
      </Screen>
    );
  }

  const kindLabel = entry.kind === 'plant' ? 'Plant' : 'Animal';
  const categoryLabel = getDiscoverSubcategoryLabel(entry.subcategoryId);

  return (
    <Screen>
      <ScrollView contentContainerStyle={{ paddingBottom: theme.spacing.xxl }}>
        <StackScreenHeader title={entry.name} subtitle={`${kindLabel} · ${categoryLabel}`} />

        {entry.imageUrl ? (
          <View style={styles.heroWrap}>
            <Image
              source={{ uri: entry.imageUrl }}
              style={styles.heroImage}
              contentFit="cover"
              cachePolicy="memory-disk"
              recyclingKey={`species-detail-${entry.kind}-${entry.name}`}
              transition={200}
              accessibilityLabel={`Photo of ${entry.name}`}
            />
          </View>
        ) : null}

        <Section title="Overview">
          <Text variant="subtitle" color="secondary">
            {entry.parkCount === 1
              ? 'Featured at 1 Florida state park'
              : `Featured at ${entry.parkCount} Florida state parks`}
          </Text>
          <Text variant="caption" color="secondary">
            Category is estimated from the species name.
          </Text>
        </Section>

        <Section title="Look for it at" spaced>
          <View style={{ gap: theme.spacing.sm }}>
            {entry.parkNames.map((parkName) => {
              const park = findParkByName(allParks, parkName);
              const imageUrl = park ? resolveParkListImageUrl(park) : null;
              return (
                <Pressable
                  key={parkName}
                  accessibilityRole="button"
                  accessibilityLabel={`Open ${parkName}`}
                  accessibilityHint="Opens park details"
                  onPress={() => openDiscoverParkFromNames(router, allParks, parkName)}
                  style={({ pressed }) => [styles.parkRow, pressed && styles.parkRowPressed]}>
                  <ListThumbnail uri={imageUrl} recyclingKey={`species-park-${parkName}`} />
                  <View style={styles.parkBody}>
                    <Text variant="body" color="primary">
                      {parkName}
                    </Text>
                    {park?.county ? (
                      <Text variant="caption" color="secondary">
                        {park.county} County
                      </Text>
                    ) : null}
                  </View>
                  <HeroIcon name="chevron-right" size={18} color={theme.colors.textSecondary} />
                </Pressable>
              );
            })}
          </View>
        </Section>
      </ScrollView>
    </Screen>
  );
}
