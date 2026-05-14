import { Image } from 'expo-image';
import { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  useWindowDimensions,
  View,
} from 'react-native';

import { DetectionGalleryDetailModal } from '@/components/profile/detection-gallery-detail-modal';
import { ThemedText } from '@/components/themed-text';
import { authColors, authSpacing } from '@/constants/auth-theme';
import type { DetectionGalleryItem } from '@/types';

const NUM_COLUMNS = 3;

type DetectionGalleryGridProps = {
  items: DetectionGalleryItem[];
  loading: boolean;
  error: string | null;
  onRetry: () => void;
  borderColor: string;
  mutedColor: string;
  activityColor: string;
  /** Shown when there are no items (default: own-profile copy). */
  emptyMessage?: string;
};

/**
 * Saved detection thumbnails in a multi-column grid. Scrolls with the parent screen
 * (profile `ScrollView`); uses `useWindowDimensions` so tiles stay square at ~⅓ width.
 * Tapping a tile opens {@link DetectionGalleryDetailModal}.
 */
export function DetectionGalleryGrid({
  items,
  loading,
  error,
  onRetry,
  borderColor,
  mutedColor,
  activityColor,
  emptyMessage = 'No saved photos yet. Save an identification from the camera flow.',
}: DetectionGalleryGridProps) {
  const { width: windowWidth } = useWindowDimensions();
  const [selected, setSelected] = useState<DetectionGalleryItem | null>(null);

  const tileSize = useMemo(() => {
    const horizontalPadding = authSpacing.lg * 2;
    const gap = authSpacing.sm;
    const inner = Math.max(0, windowWidth - horizontalPadding);
    return Math.max(72, Math.floor((inner - gap * (NUM_COLUMNS - 1)) / NUM_COLUMNS));
  }, [windowWidth]);

  if (error) {
    return (
      <View style={styles.messageBlock}>
        <ThemedText style={[styles.message, { color: mutedColor }]}>{error}</ThemedText>
        <Pressable
          onPress={onRetry}
          accessibilityRole="button"
          accessibilityLabel="Retry loading gallery">
          <ThemedText type="link" style={styles.retry}>
            Try again
          </ThemedText>
        </Pressable>
      </View>
    );
  }

  if (loading && items.length === 0) {
    return (
      <View style={styles.loaderWrap} accessibilityLabel="Loading gallery">
        <ActivityIndicator color={activityColor} />
      </View>
    );
  }

  if (items.length === 0) {
    return (
      <ThemedText style={[styles.empty, { color: mutedColor }]}>{emptyMessage}</ThemedText>
    );
  }

  return (
    <>
      <View
        style={[styles.grid, { gap: authSpacing.sm }]}
        accessibilityLabel="Saved identification photos">
        {items.map((item) => (
          <Pressable
            key={item.id}
            accessibilityRole="button"
            accessibilityHint="Opens details"
            accessibilityLabel={`${item.commonName}, ${item.latinName}`}
            onPress={() => setSelected(item)}
            style={({ pressed }) => [
              styles.tile,
              {
                width: tileSize,
                height: tileSize,
                borderColor,
                opacity: pressed ? 0.92 : 1,
              },
            ]}>
            <Image
              source={{ uri: item.displayUrl }}
              style={StyleSheet.absoluteFillObject}
              contentFit="cover"
              transition={200}
            />
          </Pressable>
        ))}
      </View>

      <DetectionGalleryDetailModal
        visible={selected !== null}
        item={selected}
        onClose={() => setSelected(null)}
      />
    </>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingVertical: authSpacing.xs,
  },
  tile: {
    borderRadius: 8,
    borderWidth: 1,
    overflow: 'hidden',
    backgroundColor: authColors.fieldBackground,
  },
  loaderWrap: {
    paddingVertical: authSpacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  messageBlock: {
    gap: authSpacing.sm,
  },
  message: {
    fontSize: 14,
  },
  retry: {
    alignSelf: 'flex-start',
  },
  empty: {
    fontSize: 14,
    lineHeight: 20,
  },
});
