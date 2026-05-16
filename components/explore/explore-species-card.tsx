import { Pressable, StyleSheet } from 'react-native';

import { ExplorerBoardMemberAvatar } from '@/components/explorer-board/explorer-board-member-avatar';
import { ListDetailCard } from '@/components/screen/list-detail-card';
import { authColors } from '@/constants/auth-theme';
import {
  exploreSpeciesAccessibilityLabel,
  exploreSpeciesMeta,
  exploreSpeciesSubtitle,
  exploreSpeciesTitle,
} from '@/lib/explore/formatExploreSpeciesDisplay';
import type { ExploreSpecies } from '@/lib/explore/exploreSpeciesTypes';

type Props = {
  species: ExploreSpecies;
  onPress: () => void;
};

export function ExploreSpeciesCard({ species, onPress }: Props) {
  const imageUri = species.imageUrl ?? species.wikiImageUrl;

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => pressed && styles.rowPressed}
      android_ripple={{ color: 'rgba(255,255,255,0.08)' }}
      accessibilityRole="button"
      accessibilityHint="Opens species details"
      accessibilityLabel={exploreSpeciesAccessibilityLabel(species)}>
      <ListDetailCard
        leading={
          <ExplorerBoardMemberAvatar
            storedUrl={imageUri}
            borderColor={authColors.border}
            mutedColor={authColors.textMuted}
            fallbackIcon={species.type === 'plants' ? 'local-florist' : 'pets'}
          />
        }
        title={exploreSpeciesTitle(species)}
        subtitle={exploreSpeciesSubtitle(species)}
        meta={exploreSpeciesMeta(species)}
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  rowPressed: {
    opacity: 0.92,
  },
});
