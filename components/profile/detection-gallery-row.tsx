import { Image } from 'expo-image';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { authSpacing } from '@/constants/auth-theme';
import type { DetectionGalleryItem } from '@/types';

type DetectionGalleryRowProps = {
  items: DetectionGalleryItem[];
  loading: boolean;
  error: string | null;
  onRetry: () => void;
  borderColor: string;
  mutedColor: string;
  activityColor: string;
};

export function DetectionGalleryRow({
  items,
  loading,
  error,
  onRetry,
  borderColor,
  mutedColor,
  activityColor,
}: DetectionGalleryRowProps) {
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
      <ThemedText style={[styles.empty, { color: mutedColor }]}>
        No saved photos yet. Save an identification from the camera flow.
      </ThemedText>
    );
  }

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.row}
      accessibilityLabel="Saved identification photos">
      {items.map((item) => (
        <View
          key={item.id}
          style={[styles.tile, { borderColor }]}
          accessibilityLabel={`${item.commonName}, ${item.latinName}`}
          accessibilityRole="image">
          <Image
            source={{ uri: item.displayUrl }}
            style={StyleSheet.absoluteFillObject}
            contentFit="cover"
            transition={200}
          />
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  row: {
    gap: authSpacing.sm,
    paddingVertical: authSpacing.xs,
  },
  tile: {
    width: 104,
    height: 104,
    borderRadius: 8,
    borderWidth: 1,
    overflow: 'hidden',
    backgroundColor: '#f0f0f0',
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
