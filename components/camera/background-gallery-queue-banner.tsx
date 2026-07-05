import { StyleSheet, Text, View } from 'react-native';

import { backgroundGalleryQueueLabel } from '@/lib/camera/backgroundGalleryQueueLabel';
import { useBackgroundGalleryQueue } from '@/hooks/useBackgroundGalleryQueue';
import { useTheme } from '@/hooks/useTheme';

type Props = {
  bottomInset: number;
};

export function BackgroundGalleryQueueBanner({ bottomInset }: Props) {
  const { theme } = useTheme();
  const snapshot = useBackgroundGalleryQueue();
  const label = backgroundGalleryQueueLabel(snapshot);

  if (!label) return null;

  return (
    <View
      pointerEvents="none"
      style={[
        styles.banner,
        {
          bottom: bottomInset + 88,
          backgroundColor: theme.colors.overlayScrim,
          paddingHorizontal: theme.spacing.md,
          paddingVertical: theme.spacing.sm,
        },
      ]}>
      <Text style={[styles.text, { color: theme.colors.textPrimary }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    position: 'absolute',
    left: 16,
    right: 16,
    alignSelf: 'center',
    borderRadius: 8,
    maxWidth: 360,
    marginHorizontal: 'auto',
  },
  text: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
});
