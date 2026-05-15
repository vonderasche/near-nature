import { useCallback, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import type { Camera, CameraDevice } from 'react-native-vision-camera';
import { Camera as VisionCamera } from 'react-native-vision-camera';
import type { RefObject } from 'react';

type Point = { x: number; y: number };

type Props = {
  cameraRef: RefObject<Camera | null>;
  device: CameraDevice;
  torch: 'off' | 'on';
  onFocusPoint: (point: Point) => void;
};

/**
 * Full-screen camera with native pinch-zoom, optional torch, and tap-to-focus.
 */
export function CameraLivePreview({ cameraRef, device, torch, onFocusPoint }: Props) {
  const [layout, setLayout] = useState({ width: 0, height: 0 });

  const handleFocus = useCallback(
    (x: number, y: number) => {
      if (layout.width <= 0 || layout.height <= 0) return;
      onFocusPoint({
        x: Math.min(1, Math.max(0, x / layout.width)),
        y: Math.min(1, Math.max(0, y / layout.height)),
      });
    },
    [layout.width, layout.height, onFocusPoint],
  );

  const tapGesture = Gesture.Tap()
    .maxDuration(250)
    .onEnd((event) => {
      handleFocus(event.x, event.y);
    });

  return (
    <GestureDetector gesture={tapGesture}>
      <View
        style={StyleSheet.absoluteFill}
        onLayout={(e) => {
          const { width, height } = e.nativeEvent.layout;
          setLayout({ width, height });
        }}>
        <VisionCamera
          ref={cameraRef}
          style={StyleSheet.absoluteFill}
          device={device}
          isActive
          photo
          enableZoomGesture
          torch={torch}
        />
      </View>
    </GestureDetector>
  );
}
