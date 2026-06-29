import { StyleSheet, View } from 'react-native';

import { cameraControlColors } from '@/constants/camera-layout';

const GRID_FRACTIONS = [1 / 3, 2 / 3] as const;

const lineStyle = {
  backgroundColor: cameraControlColors.icon,
};

/**
 * Rule-of-thirds guide over the camera preview (non-interactive).
 */
export function CameraGridOverlay() {
  return (
    <View style={styles.root} pointerEvents="none" accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
      {GRID_FRACTIONS.map((fraction) => (
        <View key={`v-${fraction}`} style={[styles.lineV, lineStyle, { left: `${fraction * 100}%` }]} />
      ))}
      {GRID_FRACTIONS.map((fraction) => (
        <View key={`h-${fraction}`} style={[styles.lineH, lineStyle, { top: `${fraction * 100}%` }]} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 1,
  },
  lineV: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: StyleSheet.hairlineWidth,
    opacity: 0.28,
  },
  lineH: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: StyleSheet.hairlineWidth,
    opacity: 0.28,
  },
});
