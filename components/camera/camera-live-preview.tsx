import { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { runOnJS } from 'react-native-reanimated';
import type { Camera, CameraDevice, CameraDeviceFormat } from 'react-native-vision-camera';
import { Camera as VisionCamera } from 'react-native-vision-camera';
import type { ComponentProps, RefObject } from 'react';

import { CameraFocusRing } from '@/components/camera/camera-focus-ring';
import { CameraGridOverlay } from '@/components/camera/camera-grid-overlay';
import { CameraLevelOverlay } from '@/components/camera/camera-level-overlay';
import { authColors } from '@/constants/auth-theme';
import { clampZoom } from '@/lib/camera/cameraZoom';

type Point = { x: number; y: number };

type FocusRingState = Point & { key: number };
type CameraFrameProcessor = ComponentProps<typeof VisionCamera>['frameProcessor'];

type Props = {
  cameraRef: RefObject<Camera | null>;
  device: CameraDevice;
  format: CameraDeviceFormat | undefined;
  photoHdr: boolean;
  zoom: number;
  onZoomChange: (zoom: number) => void;
  torch: 'off' | 'on';
  isActive: boolean;
  /** Bump after app returns from background to remount the native preview. */
  previewKey: number;
  isResumingPreview?: boolean;
  gridVisible?: boolean;
  levelVisible?: boolean;
  stabilizationEnabled?: boolean;
  stabilizationSupported?: boolean;
  frameProcessor?: CameraFrameProcessor;
  onFocusPoint: (point: Point) => void | Promise<void>;
};

const FOCUS_RING_MS = 1200;

/**
 * Full-screen camera with quality capture settings, grid, tap-to-focus, pinch zoom, and preset chips.
 */
export function CameraLivePreview({
  cameraRef,
  device,
  format,
  photoHdr,
  zoom,
  onZoomChange,
  torch,
  isActive,
  previewKey,
  isResumingPreview = false,
  gridVisible = true,
  levelVisible = false,
  stabilizationEnabled = false,
  stabilizationSupported = false,
  frameProcessor,
  onFocusPoint,
}: Props) {
  const stabilizationMode =
    stabilizationEnabled && stabilizationSupported ? 'auto' : 'off';
  const [layout, setLayout] = useState({ width: 0, height: 0 });
  const [focusRing, setFocusRing] = useState<FocusRingState | null>(null);

  const zoomRef = useRef(zoom);
  zoomRef.current = zoom;

  const pinchBaseZoomRef = useRef(zoom);

  useEffect(() => {
    if (!focusRing) return;
    const timer = setTimeout(() => setFocusRing(null), FOCUS_RING_MS);
    return () => clearTimeout(timer);
  }, [focusRing]);

  const applyZoom = useCallback(
    (value: number) => {
      onZoomChange(clampZoom(value, device));
    },
    [device, onZoomChange],
  );

  const handlePinchStart = useCallback(() => {
    pinchBaseZoomRef.current = zoomRef.current;
  }, []);

  const handlePinchUpdate = useCallback(
    (scale: number) => {
      applyZoom(pinchBaseZoomRef.current * scale);
    },
    [applyZoom],
  );

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
      runOnJS(handleTap)(event.x, event.y);
    });

  const pinchGesture = Gesture.Pinch()
    .onStart(() => {
      runOnJS(handlePinchStart)();
    })
    .onUpdate((event) => {
      runOnJS(handlePinchUpdate)(event.scale);
    });

  const previewGesture = Gesture.Simultaneous(tapGesture, pinchGesture);

  return (
    <GestureDetector gesture={previewGesture}>
      <View
        style={StyleSheet.absoluteFill}
        onLayout={(e) => {
          const { width, height } = e.nativeEvent.layout;
          setLayout({ width, height });
        }}>
        {isActive ? (
          <VisionCamera
            key={previewKey}
            ref={cameraRef}
            style={StyleSheet.absoluteFill}
            device={device}
            format={format}
            isActive
            photo
            photoQualityBalance="quality"
            photoHdr={photoHdr}
            videoStabilizationMode={stabilizationMode}
            zoom={zoom}
            torch={torch}
            frameProcessor={frameProcessor}
          />
        ) : (
          <View style={styles.paused} />
        )}
        {gridVisible ? <CameraGridOverlay /> : null}
        <CameraLevelOverlay visible={levelVisible} />
        {isResumingPreview ? (
          <View style={styles.resuming} accessibilityLabel="Starting camera">
            <ActivityIndicator size="large" color={authColors.text} />
          </View>
        ) : null}
        {focusRing ? (
          <CameraFocusRing key={focusRing.key} x={focusRing.x} y={focusRing.y} visible />
        ) : null}
      </View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  paused: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#000',
  },
  resuming: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.35)',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
