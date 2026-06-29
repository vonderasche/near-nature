import { Accelerometer } from 'expo-sensors';
import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { cameraControlColors } from '@/constants/camera-layout';
import { isHorizonLevel, rollDegreesFromAccelerometer } from '@/lib/camera/cameraLevel';

type Props = {
  visible: boolean;
};

/**
 * Rule-of-thirds-style horizon line driven by the accelerometer (portrait hold).
 */
export function CameraLevelOverlay({ visible }: Props) {
  const [rollDeg, setRollDeg] = useState(0);

  useEffect(() => {
    if (!visible) return;

    Accelerometer.setUpdateInterval(80);
    const sub = Accelerometer.addListener(({ x, y }) => {
      setRollDeg(rollDegreesFromAccelerometer(x, y));
    });

    return () => sub.remove();
  }, [visible]);

  if (!visible) return null;

  const level = isHorizonLevel(rollDeg);

  return (
    <View style={styles.root} pointerEvents="none" accessibilityElementsHidden>
      <View style={styles.center}>
        <View
          style={[
            styles.horizon,
            { transform: [{ rotate: `${rollDeg}deg` }] },
            level ? styles.horizonLevel : styles.horizonTilted,
          ]}
        />
        <View style={[styles.tick, styles.tickLeft, level && styles.tickLevel]} />
        <View style={[styles.tick, styles.tickRight, level && styles.tickLevel]} />
      </View>
    </View>
  );
}

const LINE_WIDTH = 120;

const styles = StyleSheet.create({
  root: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  center: {
    width: LINE_WIDTH,
    height: LINE_WIDTH,
    alignItems: 'center',
    justifyContent: 'center',
  },
  horizon: {
    position: 'absolute',
    width: LINE_WIDTH,
    height: 2,
    borderRadius: 1,
  },
  horizonLevel: {
    backgroundColor: '#4ade80',
    opacity: 0.95,
  },
  horizonTilted: {
    backgroundColor: cameraControlColors.icon,
    opacity: 0.55,
  },
  tick: {
    position: 'absolute',
    width: 2,
    height: 14,
    backgroundColor: cameraControlColors.icon,
    opacity: 0.4,
  },
  tickLevel: {
    backgroundColor: '#4ade80',
    opacity: 0.85,
  },
  tickLeft: {
    left: 0,
    top: '50%',
    marginTop: -7,
  },
  tickRight: {
    right: 0,
    top: '50%',
    marginTop: -7,
  },
});
