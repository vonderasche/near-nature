import { Pressable, StyleSheet, Text, View } from 'react-native';

import { authSpacing, authTypography } from '@/constants/auth-theme';
import { screenColors } from '@/constants/screen-theme';
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
      <Pressable accessibilityRole="button" onPress={onFlip} style={styles.toolBtn}>
        <Text style={styles.toolBtnText}>Flip</Text>
      </Pressable>
      <Pressable
        accessibilityRole="button"
        onPress={onCapture}
        disabled={capturing}
        style={[styles.capture, capturing && styles.captureDisabled]}>
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
    backgroundColor: screenColors.darkToolbar,
  },
  toolBtn: {
    minWidth: 64,
    paddingVertical: authSpacing.sm,
  },
  toolBtnText: {
    ...authTypography.body,
    color: screenColors.onDark,
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
    borderColor: screenColors.onDark,
    alignItems: 'center',
    justifyContent: 'center',
  },
  captureDisabled: {
    opacity: 0.5,
  },
  captureInner: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: screenColors.onDark,
  },
});
