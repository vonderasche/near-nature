import { Image } from 'expo-image';
import { memo, useCallback } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import type { AppTheme } from '@/constants/themes';
import { formatGalleryNativeCategoryLabel } from '@/lib/detections/galleryNativeCategory';
import { useThemedStyles } from '@/hooks/useThemedStyles';
import type { DetectionGalleryItem, GalleryNativeCategory } from '@/types';

type Props = {
  item: DetectionGalleryItem;
  category: GalleryNativeCategory;
  size: number;
  deletable: boolean;
  onPressItemId: (itemId: string) => void;
  onLongPressItemId?: (itemId: string) => void;
};

function createGalleryTileStyles(theme: AppTheme) {
  return StyleSheet.create({
    tile: {
      borderRadius: 0,
      borderWidth: 1,
      borderColor: theme.colors.border,
      overflow: 'hidden',
      backgroundColor: theme.colors.background,
    },
    ownerBadge: {
      position: 'absolute',
      left: 0,
      right: 0,
      bottom: 0,
      paddingHorizontal: theme.spacing.xs,
      paddingVertical: 4,
      backgroundColor: theme.colors.overlayScrimStrong,
    },
    ownerText: {
      ...theme.typography.label,
      fontSize: 11,
      color: theme.colors.textPrimary,
    },
  });
}

function DetectionGalleryTileComponent({
  item,
  category,
  size,
  deletable,
  onPressItemId,
  onLongPressItemId,
}: Props) {
  const styles = useThemedStyles(createGalleryTileStyles);
  const onPress = useCallback(() => onPressItemId(item.id), [item.id, onPressItemId]);
  const onLongPress = useCallback(
    () => onLongPressItemId?.(item.id),
    [item.id, onLongPressItemId],
  );

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityHint={
        deletable && onLongPressItemId ? 'Opens details. Long press to delete.' : 'Opens details'
      }
      accessibilityLabel={
        item.ownerUsername
          ? `${item.commonName}, ${item.latinName}, by ${item.ownerUsername}, ${formatGalleryNativeCategoryLabel(category)}`
          : `${item.commonName}, ${item.latinName}, ${formatGalleryNativeCategoryLabel(category)}`
      }
      onPress={onPress}
      onLongPress={onLongPressItemId ? onLongPress : undefined}
      delayLongPress={450}
      style={({ pressed }) => [
        styles.tile,
        {
          width: size,
          height: size,
          opacity: item.uploadStatus === 'pending' ? (pressed ? 0.75 : 0.92) : pressed ? 0.92 : 1,
        },
      ]}>
      <Image
        source={{ uri: item.displayUrl }}
        style={StyleSheet.absoluteFillObject}
        contentFit="cover"
        cachePolicy="memory-disk"
        recyclingKey={item.id}
        transition={200}
      />
      {item.ownerUsername ? (
        <View style={styles.ownerBadge} pointerEvents="none">
          <Text style={styles.ownerText} numberOfLines={1}>
            {item.ownerUsername}
          </Text>
        </View>
      ) : null}
    </Pressable>
  );
}

export const DetectionGalleryTile = memo(DetectionGalleryTileComponent);
