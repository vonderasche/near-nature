import { Image } from 'expo-image';
import { memo } from 'react';
import { Pressable, StyleSheet } from 'react-native';

import { authColors } from '@/constants/auth-theme';
import { formatGalleryNativeCategoryLabel } from '@/lib/detections/galleryNativeCategory';
import type { DetectionGalleryItem, GalleryNativeCategory } from '@/types';

type Props = {
  item: DetectionGalleryItem;
  category: GalleryNativeCategory;
  size: number;
  deletable: boolean;
  onPress: () => void;
  onLongPress?: () => void;
};

function DetectionGalleryTileComponent({
  item,
  category,
  size,
  deletable,
  onPress,
  onLongPress,
}: Props) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityHint={
        deletable && onLongPress ? 'Opens details. Long press to delete.' : 'Opens details'
      }
      accessibilityLabel={`${item.commonName}, ${item.latinName}, ${formatGalleryNativeCategoryLabel(category)}`}
      onPress={onPress}
      onLongPress={onLongPress}
      delayLongPress={450}
      style={({ pressed }) => [
        styles.tile,
        {
          width: size,
          height: size,
          borderColor: authColors.border,
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
    </Pressable>
  );
}

export const DetectionGalleryTile = memo(DetectionGalleryTileComponent);

const styles = StyleSheet.create({
  tile: {
    borderRadius: 0,
    borderWidth: 1,
    overflow: 'hidden',
    backgroundColor: authColors.background,
  },
});
