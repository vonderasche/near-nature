import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';

import { authColors, authSpacing, authTypography } from '@/constants/auth-theme';
import { bottomToolbarPadding } from '@/lib/screen/contentInsets';

type Insets = { bottom: number };

type Props = {
  insets: Insets;
  onFlip: () => void;
  onCapture: () => void;
  capturing: boolean;
};

/**
 * Bottom controls for the live camera: flip, shutter, balanced spacer.
 */
export function CameraBottomToolbar({ insets, onFlip, onCapture, capturing }: Props) {
  return (
    <View style={[styles.toolbar, bottomToolbarPadding(insets)]}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Flip camera"
        onPress={onFlip}
        android_ripple={{ color: 'rgba(255,255,255,0.2)' }}
        style={({ pressed }) => [styles.toolBtn, pressed && styles.toolBtnPressed]}>
        <Text style={styles.toolBtnText}>Flip</Text>
      </Pressable>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={capturing ? 'Taking photo' : 'Take photo'}
        onPress={onCapture}
        disabled={capturing}
        android_ripple={{ color: 'rgba(255,255,255,0.25)', borderless: true }}
        style={({ pressed }) => [
          styles.capture,
          capturing && styles.captureDisabled,
          pressed && !capturing && styles.capturePressed,
        ]}>
        <View style={styles.captureInner} />
      </Pressable>
      <View style={styles.toolSpacer} />
    </View>
  );
}

const styles = StyleSheet.create({
  toolbar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: authSpacing.lg,
    paddingTop: authSpacing.md,
    backgroundColor: authColors.overlayScrim,
  },
  toolBtn: {
    minWidth: 64,
    paddingVertical: authSpacing.sm,
    borderRadius: 8,
  },
  toolBtnPressed: {
    opacity: Platform.OS === 'ios' ? 0.85 : 1,
  },
  toolBtnText: {
    ...authTypography.body,
    color: authColors.text,
    fontWeight: '600',
  },
  toolSpacer: {
    minWidth: 64,
  },
  capture: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 4,
    borderColor: authColors.text,
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
    backgroundColor: authColors.text,
  },
});
