import { Image } from 'expo-image';
import { useMemo } from 'react';
import { Pressable, StyleSheet, useWindowDimensions, View } from 'react-native';

import { authColors, authSpacing } from '@/constants/auth-theme';
import { minGalleryTileSize, type GalleryGridColumns } from '@/lib/detections/galleryGridColumns';
import { exploreSpeciesAccessibilityLabel } from '@/lib/explore/formatExploreSpeciesDisplay';
import type { ExploreSpecies } from '@/lib/explore/exploreSpeciesTypes';

type Props = {
  items: ExploreSpecies[];
  columnCount: GalleryGridColumns;
  borderColor: string;
  onPress: (species: ExploreSpecies) => void;
};

export function ExploreSpeciesImageGrid({ items, columnCount, borderColor, onPress }: Props) {
  const { width: windowWidth } = useWindowDimensions();

  const tileSize = useMemo(() => {
    const horizontalPadding = authSpacing.lg * 2;
    const gap = authSpacing.sm;
    const inner = Math.max(0, windowWidth - horizontalPadding);
    const cols = columnCount;
    return Math.max(minGalleryTileSize(cols), Math.floor((inner - gap * (cols - 1)) / cols));
  }, [windowWidth, columnCount]);

  if (items.length === 0) return null;

  return (
    <View style={[styles.grid, { gap: authSpacing.sm }]} accessibilityLabel="Species image grid">
      {items.map((species) => {
        const uri = species.imageUrl ?? species.wikiImageUrl;
        return (
          <Pressable
            key={species.id}
            accessibilityRole="button"
            accessibilityHint="Opens species details"
            accessibilityLabel={exploreSpeciesAccessibilityLabel(species)}
            onPress={() => onPress(species)}
            style={({ pressed }) => [
              styles.tile,
              {
                width: tileSize,
                height: tileSize,
                borderColor,
                opacity: pressed ? 0.92 : 1,
              },
            ]}>
            {uri ? (
              <Image source={{ uri }} style={StyleSheet.absoluteFillObject} contentFit="cover" transition={200} />
            ) : null}
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingVertical: authSpacing.xs,
  },
  tile: {
    borderRadius: 0,
    borderWidth: 1,
    overflow: 'hidden',
    backgroundColor: authColors.background,
  },
});
