import { Image } from 'expo-image';
import { useMemo } from 'react';
import { Pressable, StyleSheet, Text, useWindowDimensions, View } from 'react-native';

import { useTheme } from '@/hooks/useTheme';
import {
  minGalleryTileSize,
  type GalleryGridColumns,
} from '@/lib/detections/galleryGridColumns';

export type DiscoverGridItem = {
  key: string;
  title: string;
  imageUrl?: string | null;
  onPress: () => void;
  accessibilityLabel: string;
};

type Props = {
  items: readonly DiscoverGridItem[];
  columnCount: GalleryGridColumns;
};

export function DiscoverItemGrid({ items, columnCount }: Props) {
  const { theme } = useTheme();
  const { width: windowWidth } = useWindowDimensions();
  const tileGap = theme.spacing.sm;
  const tileSize = useMemo(() => {
    const horizontalPadding = theme.spacing.lg * 2;
    const inner = Math.max(0, windowWidth - horizontalPadding);
    return Math.max(
      minGalleryTileSize(columnCount),
      Math.floor((inner - tileGap * (columnCount - 1)) / columnCount),
    );
  }, [columnCount, theme.spacing.lg, tileGap, windowWidth]);

  return (
    <View style={[styles.grid, { gap: tileGap }]}>
      {items.map((item) => (
        <Pressable
          key={item.key}
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
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
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
