import { Image } from 'expo-image';
import { memo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useTheme } from '@/hooks/useTheme';
import type { DiscoverGridItem } from '@/lib/discover/buildDiscoverGridRows';

type Props = {
  item: DiscoverGridItem;
  tileSize: number;
};

function DiscoverGridTileComponent({ item, tileSize }: Props) {
  const { theme } = useTheme();

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={item.accessibilityLabel}
      onPress={item.onPress}
      style={({ pressed }) => [
        styles.tile,
        { width: tileSize, gap: theme.spacing.xs },
        pressed && styles.tilePressed,
      ]}>
      {item.imageUrl ? (
        <Image
          source={{ uri: item.imageUrl }}
          style={[styles.image, { width: tileSize, height: tileSize, backgroundColor: theme.colors.border }]}
          contentFit="cover"
          cachePolicy="memory-disk"
          recyclingKey={item.key}
          transition={200}
        />
      ) : (
        <View
          style={[
            styles.image,
            styles.imagePlaceholder,
            { width: tileSize, height: tileSize, backgroundColor: theme.colors.border },
          ]}
        />
      )}
      <Text style={[styles.title, { color: theme.colors.textPrimary }]} numberOfLines={2}>
        {item.title}
      </Text>
    </Pressable>
  );
}

export const DiscoverGridTile = memo(DiscoverGridTileComponent);

const styles = StyleSheet.create({
  tile: {},
  tilePressed: {
    opacity: 0.88,
  },
  image: {
    borderRadius: 4,
  },
  imagePlaceholder: {
    opacity: 0.35,
  },
  title: {
    fontSize: 12,
    fontWeight: '600',
    lineHeight: 16,
  },
});
