import { Image } from 'expo-image';
import { useMemo } from 'react';
import { Pressable, StyleSheet, Text, useWindowDimensions, View } from 'react-native';

import { authColors, authSpacing, authTypography } from '@/constants/auth-theme';
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
  const { width: windowWidth } = useWindowDimensions();
  const tileGap = authSpacing.sm;
  const tileSize = useMemo(() => {
    const horizontalPadding = authSpacing.lg * 2;
    const inner = Math.max(0, windowWidth - horizontalPadding);
    return Math.max(
      minGalleryTileSize(columnCount),
      Math.floor((inner - tileGap * (columnCount - 1)) / columnCount),
    );
  }, [columnCount, tileGap, windowWidth]);

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
            { width: tileSize },
            pressed && styles.tilePressed,
          ]}>
          {item.imageUrl ? (
            <Image
              source={{ uri: item.imageUrl }}
              style={[styles.image, { width: tileSize, height: tileSize }]}
              contentFit="cover"
              cachePolicy="memory-disk"
              recyclingKey={item.key}
              transition={200}
            />
          ) : (
            <View style={[styles.image, styles.imagePlaceholder, { width: tileSize, height: tileSize }]} />
          )}
          <Text style={styles.title} numberOfLines={2}>
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
  tile: {
    gap: authSpacing.xs,
  },
  tilePressed: {
    opacity: 0.88,
  },
  image: {
    borderRadius: 4,
    backgroundColor: authColors.border,
  },
  imagePlaceholder: {
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  title: {
    ...authTypography.subtitle,
    fontSize: 12,
    color: authColors.text,
  },
});
