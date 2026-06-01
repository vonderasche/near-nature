import { Image } from 'expo-image';
import { memo } from 'react';
import { StyleSheet, View } from 'react-native';

import { ListDetailCard } from '@/components/shared/list-detail-card';
import { authColors } from '@/constants/auth-theme';
import { formatDetectedAt } from '@/lib/detections/formatDetectedAt';
import { galleryListItemTextFields } from '@/lib/detections/galleryListItemText';
import type { DetectionGalleryItem } from '@/types';

export const GALLERY_LIST_THUMB_SIZE = 56;

type Props = {
  item: DetectionGalleryItem;
  onPress?: () => void;
  onLongPress?: () => void;
  deletable?: boolean;
};

function DetectionGalleryListItemComponent({ item, onPress, onLongPress, deletable }: Props) {
  const thumbUri = item.displayUrl?.trim();

  const leading = (
    <View style={styles.thumbWrap}>
      {thumbUri ? (
        <Image
          source={{ uri: thumbUri }}
          style={styles.thumb}
          contentFit="cover"
          cachePolicy="memory-disk"
          recyclingKey={item.id}
          transition={200}
        />
      ) : (
        <View style={[styles.thumb, styles.thumbPlaceholder]} />
      )}
    </View>
  );

  const { title, subtitle, description } = galleryListItemTextFields({
    commonName: item.commonName,
    latinName: item.latinName,
    description: item.description,
  });

  const metaParts = [formatDetectedAt(item.detectedAt)];
  if (item.ownerUsername) {
    metaParts.push(`@${item.ownerUsername}`);
  }

  const accessibilityParts = [title, subtitle, description].filter(Boolean);

  return (
    <ListDetailCard
      title={title}
      subtitle={subtitle}
      description={description}
      meta={metaParts.join(' · ')}
      leading={leading}
      onPress={onPress}
      onLongPress={onLongPress}
      delayLongPress={450}
      accessibilityLabel={
        item.ownerUsername
          ? `${accessibilityParts.join(', ')}, by ${item.ownerUsername}`
          : accessibilityParts.join(', ')
      }
      accessibilityHint={
        deletable && onLongPress ? 'Opens details. Long press to delete.' : 'Opens details'
      }
    />
  );
}

export const DetectionGalleryListItem = memo(DetectionGalleryListItemComponent);

const styles = StyleSheet.create({
  thumbWrap: {
    width: GALLERY_LIST_THUMB_SIZE,
    height: GALLERY_LIST_THUMB_SIZE,
    flexShrink: 0,
  },
  thumb: {
    width: GALLERY_LIST_THUMB_SIZE,
    height: GALLERY_LIST_THUMB_SIZE,
    borderWidth: 1,
    borderColor: authColors.border,
    backgroundColor: authColors.background,
  },
  thumbPlaceholder: {
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
});
