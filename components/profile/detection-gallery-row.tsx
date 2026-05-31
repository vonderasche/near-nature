import { memo } from 'react';
import { StyleSheet, View } from 'react-native';

import { DetectionGalleryTile } from '@/components/profile/detection-gallery-tile';
import type { GalleryListRowEntry } from '@/lib/detections/buildGalleryListEntries';
import type { GalleryNativeCategory } from '@/types';

type Props = {
  row: GalleryListRowEntry;
  tileSize: number;
  tileGap: number;
  deletable: boolean;
  onPressItemId: (itemId: string) => void;
  onLongPressItemId?: (itemId: string) => void;
};

function DetectionGalleryRowComponent({
  row,
  tileSize,
  tileGap,
  deletable,
  onPressItemId,
  onLongPressItemId,
}: Props) {
  const category: GalleryNativeCategory =
    row.items[0]?.nativeCategory === 'native' ? 'native' : 'non-native';

  return (
    <View style={[styles.row, { gap: tileGap, marginBottom: tileGap, height: tileSize }]}>
      {row.items.map((tile) => (
        <DetectionGalleryTile
          key={tile.id}
          item={tile}
          category={category}
          size={tileSize}
          deletable={deletable}
          onPressItemId={onPressItemId}
          onLongPressItemId={onLongPressItemId}
        />
      ))}
    </View>
  );
}

export const DetectionGalleryRow = memo(DetectionGalleryRowComponent);

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    flexWrap: 'nowrap',
  },
});
