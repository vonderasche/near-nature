import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { DiscoverImageCard, discoverImageCardText } from '@/components/discover/discover-image-card';
import { ExploreSpeciesDetailModal } from '@/components/explore/explore-species-detail-modal';
import { ScreenSection } from '@/components/profile/screen-section';
import { authSpacing, authTypography } from '@/constants/auth-theme';
import { EXPLORE_FEATURED_EMPTY_HINT } from '@/lib/explore/discoverSetupHint';
import { exploreTypeLabel } from '@/lib/explore/exploreSpeciesTypes';
import type { ExploreSpecies } from '@/lib/explore/exploreSpeciesTypes';

type Props = {
  items: ExploreSpecies[];
  hintColor: string;
  borderColor: string;
};

export function DiscoverFeaturedSection({ items, hintColor, borderColor }: Props) {
  const [selected, setSelected] = useState<ExploreSpecies | null>(null);

  if (items.length === 0) {
    return (
      <ScreenSection title="Featured this week" hintColor={hintColor}>
        <Text style={[styles.emptyHint, { color: hintColor }]}>{EXPLORE_FEATURED_EMPTY_HINT}</Text>
      </ScreenSection>
    );
  }

  return (
    <ScreenSection title="Featured this week" hintColor={hintColor}>
      <View style={styles.row}>
        {items.map((species) => {
          const uri = species.imageUrl ?? species.wikiImageUrl;
          const typeLabel = exploreTypeLabel(species.type).toUpperCase();
          return (
            <DiscoverImageCard
              key={species.id}
              imageUri={uri}
              borderColor={borderColor}
              accessibilityLabel={`Featured ${species.commonName}`}
              onPress={() => setSelected(species)}
              style={styles.card}
              overlay={
                <>
                  {species.bonusPoints > 0 ? (
                    <View style={[discoverImageCardText.badge, { borderColor }]}>
                      <Text style={discoverImageCardText.badgeText}>+{species.bonusPoints} bonus points</Text>
                    </View>
                  ) : null}
                  <Text style={discoverImageCardText.typeLabel}>{typeLabel} of the week</Text>
                  <Text style={discoverImageCardText.name} numberOfLines={2}>
                    {species.commonName}
                  </Text>
                </>
              }
            />
          );
        })}
      </View>
      <ExploreSpeciesDetailModal species={selected} onClose={() => setSelected(null)} />
    </ScreenSection>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: authSpacing.sm,
  },
  card: {
    flex: 1,
    minHeight: 200,
  },
  emptyHint: {
    ...authTypography.subtitle,
    fontSize: 13,
    lineHeight: 18,
  },
});
