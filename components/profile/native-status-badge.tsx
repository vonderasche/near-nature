import { StyleSheet, Text, View } from 'react-native';

import { authSpacing, authTypography } from '@/constants/auth-theme';
import {
  formatGalleryNativeBadgeLabel,
  type GalleryNativeCategory,
} from '@/lib/detections/galleryNativeCategory';

type NativeStatusBadgeProps = {
  category: GalleryNativeCategory;
};

export function NativeStatusBadge({ category }: NativeStatusBadgeProps) {
  const isNative = category === 'native';
  return (
    <View
      style={[styles.badge, isNative ? styles.badgeNative : styles.badgeNonNative]}
      accessibilityRole="text"
      accessibilityLabel={formatGalleryNativeBadgeLabel(category)}>
      <Text style={[styles.label, isNative ? styles.labelNative : styles.labelNonNative]}>
        {formatGalleryNativeBadgeLabel(category)}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignSelf: 'center',
    paddingHorizontal: authSpacing.md,
    paddingVertical: authSpacing.xs,
    borderRadius: 999,
    borderWidth: 1,
  },
  badgeNative: {
    backgroundColor: '#e8f5e9',
    borderColor: '#2e7d32',
  },
  badgeNonNative: {
    backgroundColor: '#fff3e0',
    borderColor: '#e65100',
  },
  label: {
    ...authTypography.subtitle,
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  labelNative: {
    color: '#1b5e20',
  },
  labelNonNative: {
    color: '#bf360c',
  },
});
