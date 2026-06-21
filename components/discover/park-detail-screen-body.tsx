import * as WebBrowser from 'expo-web-browser';
import { Image } from 'expo-image';
import { useCallback, useMemo } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';

import { Button } from '@/components/ui/Button';
import { Section } from '@/components/ui/Section';
import { Screen } from '@/components/ui/Screen';
import { StackScreenHeader } from '@/components/ui/StackScreenHeader';
import { Text } from '@/components/ui/Text';
import { ListThumbnail } from '@/components/shared/list-thumbnail';
import { useTheme } from '@/hooks/useTheme';
import { findFloridaStatePark, stageDiscoverPark } from '@/lib/discover/discoverRouteCache';
import { routeDiscoverPark } from '@/lib/routing/routes';
import {
  formatParkAccessLabel,
  formatParkAcreage,
  formatParkLocation,
} from '@/lib/parks/formatFloridaStatePark';
import { resolveParkListImageUrl } from '@/lib/parks/parkSpeciesHighlights';
import type { FloridaStatePark, ParkSpeciesHighlight } from '@/types/florida-state-park';

type Props = {
  park: FloridaStatePark | null;
  allParks: readonly FloridaStatePark[];
  loading?: boolean;
};

function SpeciesHighlightRow({ item }: { item: ParkSpeciesHighlight }) {
  const { theme } = useTheme();
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.spacing.md }}>
      <ListThumbnail uri={item.imageUrl} recyclingKey={`park-species-${item.name}`} />
      <Text variant="body" color="secondary" style={{ flex: 1 }}>
        {item.name}
      </Text>
    </View>
  );
}

export function ParkDetailScreenBody({ park, allParks, loading = false }: Props) {
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
        metaBlock: {
          gap: 4,
        },
        description: {
          lineHeight: 22,
        },
        credit: {
          fontSize: 12,
        },
      }),
    [theme],
  );

  const openParkPage = useCallback(async () => {
    if (!park?.parkPageUrl) return;
    await WebBrowser.openBrowserAsync(park.parkPageUrl);
  }, [park?.parkPageUrl]);

  if (loading && !park) {
    return (
      <Screen>
        <StackScreenHeader title="Park" />
        <Text variant="subtitle" color="secondary">
          Loading park details…
        </Text>
      </Screen>
    );
  }

  if (!park) {
    return (
      <Screen>
        <StackScreenHeader title="Park" />
        <Text variant="subtitle" color="secondary">
          This park is no longer available. Go back and try again from Discover.
        </Text>
      </Screen>
    );
  }

  const heroImageUrl = resolveParkListImageUrl(park);
  const acreage = formatParkAcreage(park.acreage);
  const access = formatParkAccessLabel(park.publicAccess);

  return (
    <Screen>
      <ScrollView contentContainerStyle={{ paddingBottom: theme.spacing.xxl }}>
        <StackScreenHeader title={park.parkName} subtitle={formatParkLocation(park)} />

        {heroImageUrl ? (
          <View style={styles.heroWrap}>
            <Image
              source={{ uri: heroImageUrl }}
              style={styles.heroImage}
              contentFit="cover"
              cachePolicy="memory-disk"
              recyclingKey={`park-detail-${park.parkId}`}
              transition={200}
              accessibilityLabel={`Photo from ${park.parkName}`}
            />
          </View>
        ) : null}

        <Section title="Overview">
          <View style={styles.metaBlock}>
            {acreage ? (
              <Text variant="subtitle" color="secondary">
                {acreage}
              </Text>
            ) : null}
            {access ? (
              <Text variant="subtitle" color="secondary">
                {`Access: ${access}`}
              </Text>
            ) : null}
            {park.address ? (
              <Text variant="subtitle" color="secondary">
                {park.address}
              </Text>
            ) : null}
          </View>
          {park.description ? (
            <Text variant="body" color="primary" style={styles.description}>
              {park.description}
            </Text>
          ) : null}
          {park.imageAttribution.trim() ? (
            <Text variant="subtitle" color="secondary" style={styles.credit}>
              {`Photo: ${park.imageAttribution.trim()}`}
            </Text>
          ) : null}
        </Section>

        {park.topPlants.length > 0 ? (
          <Section title="Plants to look for" spaced>
            <View style={{ gap: theme.spacing.sm }}>
              {park.topPlants.map((item) => (
                <SpeciesHighlightRow key={item.name} item={item} />
              ))}
            </View>
          </Section>
        ) : null}

        {park.topAnimals.length > 0 ? (
          <Section title="Wildlife to look for" spaced>
            <View style={{ gap: theme.spacing.sm }}>
              {park.topAnimals.map((item) => (
                <SpeciesHighlightRow key={item.name} item={item} />
              ))}
            </View>
          </Section>
        ) : null}

        {park.parkPageUrl ? (
          <Section title="Links" spaced>
            <Button title="Open park page" fillParent onPress={() => void openParkPage()} />
          </Section>
        ) : null}
      </ScrollView>
    </Screen>
  );
}

export function useParkFromRoute(
  parks: readonly FloridaStatePark[],
  parkId: string | undefined,
  latitude?: number | null,
  longitude?: number | null,
): FloridaStatePark | null {
  if (!parkId) return null;
  return findFloridaStatePark(parks, parkId, latitude, longitude) ?? null;
}

export function openDiscoverParkFromNames(
  router: ReturnType<typeof useRouter>,
  allParks: readonly FloridaStatePark[],
  parkName: string,
) {
  const park = allParks.find((entry) => entry.parkName === parkName);
  if (!park) return;
  stageDiscoverPark(park);
  router.push(
    routeDiscoverPark({
      parkId: park.parkId,
      latitude: park.latitude != null ? String(park.latitude) : undefined,
      longitude: park.longitude != null ? String(park.longitude) : undefined,
    }),
  );
}
