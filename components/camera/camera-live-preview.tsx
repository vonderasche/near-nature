import { useCallback, useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import type { Camera, CameraDevice, CameraDeviceFormat } from 'react-native-vision-camera';
import { Camera as VisionCamera } from 'react-native-vision-camera';
import type { RefObject } from 'react';

import { CameraFocusRing } from '@/components/camera/camera-focus-ring';
import { CameraGridOverlay } from '@/components/camera/camera-grid-overlay';

type Point = { x: number; y: number };

type FocusRingState = Point & { key: number };

type Props = {
  cameraRef: RefObject<Camera | null>;
  device: CameraDevice;
  format: CameraDeviceFormat | undefined;
  photoHdr: boolean;
  zoom: number;
  torch: 'off' | 'on';
  onFocusPoint: (point: Point) => void | Promise<void>;
};

const FOCUS_RING_MS = 1200;

/**
 * Full-screen camera with quality capture settings, grid, tap-to-focus ring, and controlled zoom.
 */
export function CameraLivePreview({
  cameraRef,
  device,
  format,
  photoHdr,
  zoom,
  torch,
  onFocusPoint,
}: Props) {
  const [layout, setLayout] = useState({ width: 0, height: 0 });
  const [focusRing, setFocusRing] = useState<FocusRingState | null>(null);

  useEffect(() => {
    if (!focusRing) return;
    const timer = setTimeout(() => setFocusRing(null), FOCUS_RING_MS);
    return () => clearTimeout(timer);
  }, [focusRing]);

  const handleTap = useCallback(
    (x: number, y: number) => {
      if (layout.width <= 0 || layout.height <= 0) return;
      setFocusRing({ x, y, key: Date.now() });
      void onFocusPoint({
        x: Math.min(1, Math.max(0, x / layout.width)),
        y: Math.min(1, Math.max(0, y / layout.height)),
      });
    },
    [layout.width, layout.height, onFocusPoint],
  );

  const tapGesture = Gesture.Tap()
    .maxDuration(250)
    .onEnd((event) => {
      handleTap(event.x, event.y);
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
          format={format}
          isActive
          photo
          photoQualityBalance="quality"
          photoHdr={photoHdr}
          zoom={zoom}
          torch={torch}
        />
        <CameraGridOverlay />
        {focusRing ? (
          <CameraFocusRing key={focusRing.key} x={focusRing.x} y={focusRing.y} visible />
        ) : null}
      </View>
    </GestureDetector>
  );
}
