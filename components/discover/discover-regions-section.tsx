import { useRouter } from 'expo-router';
import { ScrollView, StyleSheet, Text } from 'react-native';

import { DiscoverImageCard, discoverImageCardText } from '@/components/discover/discover-image-card';
import { DiscoverSectionLink } from '@/components/discover/discover-section-link';
import { ScreenSection } from '@/components/profile/screen-section';
import { authSpacing, authTypography } from '@/constants/auth-theme';
import { ecosystemsForState } from '@/lib/explore/stateEcosystemGuides';
import { routes } from '@/lib/routing/routes';

type Props = {
  stateName: string;
  hintColor: string;
  borderColor: string;
};

export function DiscoverRegionsSection({ stateName, hintColor, borderColor }: Props) {
  const router = useRouter();
  const ecosystems = ecosystemsForState(stateName);

  return (
    <ScreenSection
      title={`Explore ${stateName}`}
      hintColor={hintColor}
      titleAccessory={
        <DiscoverSectionLink label="See regions" onPress={() => router.push(routes.discoverEcosystems)} />
      }>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        <DiscoverImageCard
          borderColor={borderColor}
          accessibilityLabel="Browse top species"
          onPress={() => router.push(routes.discoverSpecies)}
          style={[styles.card, styles.cardWide]}
          overlay={
            <>
              <Text style={discoverImageCardText.typeLabel}>Species</Text>
              <Text style={discoverImageCardText.name} numberOfLines={2}>
                Top species
              </Text>
              <Text style={[styles.cardMeta, { color: hintColor }]}>Ranked list for {stateName}</Text>
            </>
          }
        />
        {ecosystems.slice(0, 2).map((eco) => (
          <DiscoverImageCard
            key={eco.id}
            imageUri={eco.imageUrl}
            borderColor={borderColor}
            accessibilityLabel={eco.title}
            onPress={() => router.push(routes.discoverEcosystems)}
            style={styles.card}
            overlay={
              <Text style={discoverImageCardText.name} numberOfLines={2}>
                {eco.title}
              </Text>
            }
          />
        ))}
      </ScrollView>
    </ScreenSection>
  );
}

const CARD_WIDTH = 200;

const styles = StyleSheet.create({
  scroll: {
    gap: authSpacing.sm,
    paddingVertical: authSpacing.xs,
  },
  card: {
    width: CARD_WIDTH,
    height: 120,
  },
  cardWide: {
    width: CARD_WIDTH + 24,
  },
  cardMeta: {
    ...authTypography.subtitle,
    fontSize: 12,
    marginTop: authSpacing.xs,
  },
});
