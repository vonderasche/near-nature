import { Image } from 'expo-image';
import type { ReactNode } from 'react';
import { Pressable, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { authColors, authSpacing, authTypography } from '@/constants/auth-theme';

type Props = {
  imageUri?: string | null;
  onPress?: () => void;
  accessibilityLabel: string;
  borderColor: string;
  style?: StyleProp<ViewStyle>;
  overlay: ReactNode;
};

/**
 * Bordered image card with bottom overlay (featured species, region tiles).
 */
export function DiscoverImageCard({
  imageUri,
  onPress,
  accessibilityLabel,
  borderColor,
  style,
  overlay,
}: Props) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        { borderColor, opacity: pressed ? 0.92 : 1 },
        style,
      ]}>
      {imageUri ? (
        <Image source={{ uri: imageUri }} style={StyleSheet.absoluteFillObject} contentFit="cover" transition={200} />
      ) : (
        <View style={styles.fallback} />
      )}
      <View style={styles.overlay}>{overlay}</View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    overflow: 'hidden',
    backgroundColor: authColors.fieldBackground,
    position: 'relative',
  },
  fallback: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: authColors.fieldBackground,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'flex-end',
    padding: authSpacing.md,
    backgroundColor: 'rgba(0,0,0,0.35)',
  },
});

export const discoverImageCardText = StyleSheet.create({
  typeLabel: {
    ...authTypography.label,
    fontSize: 11,
    color: authColors.textMuted,
    textTransform: 'uppercase',
    marginBottom: authSpacing.xs,
  },
  name: {
    ...authTypography.body,
    fontSize: 18,
    fontWeight: '700',
    color: authColors.text,
  },
  badge: {
    alignSelf: 'flex-start',
    borderWidth: 1,
    paddingHorizontal: authSpacing.sm,
    paddingVertical: 2,
    marginBottom: authSpacing.xs,
  },
  badgeText: {
    ...authTypography.label,
    fontSize: 11,
    color: authColors.text,
  },
});
