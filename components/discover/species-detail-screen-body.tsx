import { Image } from 'expo-image';
import { useMemo } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';

import { openDiscoverParkFromNames } from '@/components/discover/park-detail-screen-body';
import { Section } from '@/components/ui/Section';
import { Screen } from '@/components/ui/Screen';
import { StackScreenHeader } from '@/components/ui/StackScreenHeader';
import { Text } from '@/components/ui/Text';
import { HeroIcon } from '@/components/ui/hero-icon';
import { useTheme } from '@/hooks/useTheme';
import { getDiscoverSubcategoryLabel } from '@/lib/discover/discoverSpeciesSubcategories';
import type { DiscoverSpeciesEntry } from '@/types/discover-species';
import type { FloridaStatePark } from '@/types/florida-state-park';

type Props = {
  entry: DiscoverSpeciesEntry | null;
  allParks: readonly FloridaStatePark[];
  loading?: boolean;
};

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
          justifyContent: 'space-between',
          gap: theme.spacing.sm,
          paddingVertical: theme.spacing.md,
          paddingHorizontal: theme.spacing.md,
          borderRadius: theme.radii.md,
          backgroundColor: theme.colors.surfaceRaised,
        },
        parkRowPressed: {
          opacity: 0.9,
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
        </Section>

        <Section title="Look for it at" spaced>
          <View style={{ gap: theme.spacing.sm }}>
            {entry.parkNames.map((parkName) => (
              <Pressable
                key={parkName}
                accessibilityRole="button"
                accessibilityLabel={`Open ${parkName}`}
                accessibilityHint="Opens park details"
                onPress={() => openDiscoverParkFromNames(router, allParks, parkName)}
                style={({ pressed }) => [styles.parkRow, pressed && styles.parkRowPressed]}>
                <Text variant="body" color="primary" style={{ flex: 1 }}>
                  {parkName}
                </Text>
                <HeroIcon name="chevron-right" size={18} color={theme.colors.textSecondary} />
              </Pressable>
            ))}
          </View>
        </Section>
      </ScrollView>
    </Screen>
  );
}
