import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

const RING_SIZE = 72;

type Props = {
  /** Center in preview coordinates (points). */
  x: number;
  y: number;
  visible: boolean;
};

export function CameraFocusRing({ x, y, visible }: Props) {
  const scale = useSharedValue(1.2);
  const opacity = useSharedValue(0);

  useEffect(() => {
    if (!visible) {
      opacity.value = 0;
      return;
    }
    scale.value = 1.25;
    opacity.value = 1;
    scale.value = withSequence(withTiming(1, { duration: 180 }), withTiming(0.92, { duration: 120 }));
    opacity.value = withSequence(
      withTiming(1, { duration: 80 }),
      withTiming(1, { duration: 900 }),
      withTiming(0, { duration: 280 }),
    );
  }, [visible, x, y, opacity, scale]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }],
  }));

  if (!visible) return null;

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        styles.ring,
        {
          left: x - RING_SIZE / 2,
          top: y - RING_SIZE / 2,
          width: RING_SIZE,
          height: RING_SIZE,
        },
        animatedStyle,
      ]}>
      <View style={styles.cornerTL} />
      <View style={styles.cornerTR} />
      <View style={styles.cornerBL} />
      <View style={styles.cornerBR} />
    </Animated.View>
  );
}

const corner = {
  position: 'absolute' as const,
  width: 14,
  height: 14,
  borderColor: '#f5d565',
};

const styles = StyleSheet.create({
  ring: {
    position: 'absolute',
    zIndex: 3,
  },
  cornerTL: {
    ...corner,
    top: 0,
    left: 0,
    borderTopWidth: 2,
    borderLeftWidth: 2,
  },
  cornerTR: {
    ...corner,
    top: 0,
    right: 0,
    borderTopWidth: 2,
    borderRightWidth: 2,
  },
  cornerBL: {
    ...corner,
    bottom: 0,
    left: 0,
    borderBottomWidth: 2,
    borderLeftWidth: 2,
  },
  cornerBR: {
    ...corner,
    bottom: 0,
    right: 0,
    borderBottomWidth: 2,
    borderRightWidth: 2,
  },
});
