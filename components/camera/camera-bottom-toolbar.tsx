import { HeroIcon } from '@/components/ui/hero-icon';
import { useMemo } from 'react';
import { ActivityIndicator, Platform, Pressable, StyleSheet, Text, View } from 'react-native';

import { useTheme } from '@/hooks/useTheme';
import { bottomToolbarPadding } from '@/lib/screen/contentInsets';

type Insets = { bottom: number };

type Props = {
  insets: Insets;
  onFlip: () => void;
  onCapture: () => void;
  capturing: boolean;
  onPickGallery: () => void;
  pickingGallery: boolean;
};

/**
 * Bottom controls for the live camera: flip, shutter, gallery.
 */
export function CameraBottomToolbar({
  insets,
  onFlip,
  onCapture,
  capturing,
  onPickGallery,
  pickingGallery,
}: Props) {
  const { theme } = useTheme();
  const styles = useMemo(
    () =>
      StyleSheet.create({
        toolbar: {
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: 0,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingHorizontal: theme.spacing.lg,
          paddingTop: theme.spacing.md,
          backgroundColor: theme.colors.overlayScrim,
          zIndex: 10,
          elevation: 10,
        },
        toolBtn: {
          minWidth: 64,
          paddingVertical: theme.spacing.sm,
          borderRadius: 8,
        },
        toolBtnPressed: {
          opacity: Platform.OS === 'ios' ? 0.85 : 1,
        },
        toolBtnText: {
          ...theme.typography.body,
          color: theme.colors.textPrimary,
          fontWeight: '600',
        },
        galleryBtn: {
          minWidth: 64,
          alignItems: 'center',
          gap: 2,
        },
        galleryLabel: {
          ...theme.typography.subtitle,
          color: theme.colors.textPrimary,
          fontSize: 11,
          fontWeight: '600',
        },
        capture: {
          width: 72,
          height: 72,
          borderRadius: 36,
          borderWidth: 4,
          borderColor: theme.colors.textPrimary,
          alignItems: 'center',
          justifyContent: 'center',
        },
        captureDisabled: {
          opacity: 0.5,
        },
        capturePressed: {
          opacity: 0.92,
        },
        captureInner: {
          width: 56,
          height: 56,
          borderRadius: 28,
          backgroundColor: theme.colors.textPrimary,
        },
      }),
    [theme],
  );

  const galleryBusy = pickingGallery || capturing;

  return (
    <View style={[styles.toolbar, bottomToolbarPadding(insets)]}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Flip camera"
        onPress={onFlip}
        disabled={galleryBusy}
        android_ripple={{ color: 'rgba(255,255,255,0.2)' }}
        style={({ pressed }) => [styles.toolBtn, pressed && styles.toolBtnPressed]}>
        <Text style={styles.toolBtnText}>Flip</Text>
      </Pressable>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={capturing ? 'Taking photo' : 'Take photo'}
        onPress={onCapture}
        disabled={galleryBusy}
        android_ripple={{ color: 'rgba(255,255,255,0.25)', borderless: true }}
        style={({ pressed }) => [
          styles.capture,
          capturing && styles.captureDisabled,
          pressed && !capturing && styles.capturePressed,
        ]}>
        <View style={styles.captureInner} />
      </Pressable>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Choose photo from gallery"
        onPress={onPickGallery}
        disabled={galleryBusy}
        android_ripple={{ color: 'rgba(255,255,255,0.2)' }}
        style={({ pressed }) => [styles.toolBtn, styles.galleryBtn, pressed && styles.toolBtnPressed]}>
        {pickingGallery ? (
          <ActivityIndicator color={theme.colors.textPrimary} size="small" />
        ) : (
          <>
            <HeroIcon name="photo" size={22} color={theme.colors.textPrimary} />
            <Text style={styles.galleryLabel}>Gallery</Text>
          </>
        )}
      </Pressable>
    </View>
  );
}
