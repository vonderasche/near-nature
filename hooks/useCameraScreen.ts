import * as Haptics from 'expo-haptics';
import { useCallback, useEffect, useMemo, useRef, useState, type RefObject } from 'react';
import { Platform } from 'react-native';
import { Camera, useCameraDevice, useCameraPermission } from 'react-native-vision-camera';

import { captureSquarePhotoFromCameraRef } from '@/lib/camera/capturePicture';
import { cyclePhotoFlashMode, type PhotoFlashMode } from '@/lib/camera/photoFlashMode';

export type CameraFacing = 'back' | 'front';

export type CameraScreenMessage = { title: string; message: string };

export type UseCameraScreenOptions = {
  /** When set, called with the photo URI instead of surfacing a success message. */
  onPhotoCaptured?: (uri: string) => void;
};

export type UseCameraScreenResult = {
  cameraRef: RefObject<Camera | null>;
  requestPermission: () => Promise<unknown>;
  /** `true` while we are waiting for the first permission state. */
  isPermissionPending: boolean;
  isPermissionGranted: boolean;
  facing: CameraFacing;
  toggleFacing: () => void;
  takePicture: () => Promise<void>;
  capturing: boolean;
  cameraMessage: CameraScreenMessage | null;
  clearCameraMessage: () => void;
  /** Selected VisionCamera device, derived from {@link facing}. */
  device: ReturnType<typeof useCameraDevice>;
  flashMode: PhotoFlashMode;
  toggleFlashMode: () => void;
  hasFlash: boolean;
  torchOn: boolean;
  toggleTorch: () => void;
  hasTorch: boolean;
  focusAt: (point: { x: number; y: number }) => Promise<void>;
};

export function useCameraScreen(options?: UseCameraScreenOptions): UseCameraScreenResult {
  const onPhotoCaptured = options?.onPhotoCaptured;

  const cameraRef = useRef<Camera>(null);
  const { hasPermission, requestPermission } = useCameraPermission();

  const [facing, setFacing] = useState<CameraFacing>('back');
  const device = useCameraDevice(facing);

  const [capturing, setCapturing] = useState(false);
  const [cameraMessage, setCameraMessage] = useState<CameraScreenMessage | null>(null);
  const [flashMode, setFlashMode] = useState<PhotoFlashMode>('off');
  const [torchOn, setTorchOn] = useState(false);

  const hasFlash = Boolean(device?.hasFlash);
  const hasTorch = Boolean(device?.hasTorch) && facing === 'back';

  useEffect(() => {
    setFlashMode('off');
    setTorchOn(false);
  }, [facing]);

  const clearCameraMessage = useCallback(() => {
    setCameraMessage(null);
  }, []);

  const toggleFlashMode = useCallback(() => {
    if (!hasFlash) return;
    try {
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {
      /* haptics unavailable */
    }
    setFlashMode((mode) => cyclePhotoFlashMode(mode));
  }, [hasFlash]);

  const toggleTorch = useCallback(() => {
    if (!hasTorch) return;
    try {
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {
      /* haptics unavailable */
    }
    setTorchOn((on) => !on);
  }, [hasTorch]);

  const focusAt = useCallback(async (point: { x: number; y: number }) => {
    const cam = cameraRef.current;
    if (!cam) return;
    try {
      await cam.focus(point);
      try {
        void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      } catch {
        /* haptics unavailable */
      }
    } catch {
      /* focus unsupported on this device / lens */
    }
  }, []);

  const toggleFacing = useCallback(() => {
    try {
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {
      /* haptics unavailable */
    }
    setFacing((f) => (f === 'back' ? 'front' : 'back'));
  }, []);

  const takePicture = useCallback(async () => {
    if (capturing) return;
    setCapturing(true);
    try {
      const photo = await captureSquarePhotoFromCameraRef(cameraRef, {
        flash: flashMode,
        enableShutterSound: false,
      });
      const uri = photo?.uri;
      if (!uri) return;

      try {
        void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      } catch {
        /* haptics unavailable */
      }

      if (onPhotoCaptured) {
        onPhotoCaptured(uri);
        return;
      }

      setCameraMessage({
        title: 'Photo captured',
        message: Platform.OS === 'web' ? 'Saved to preview (web).' : uri,
      });
    } catch (e: unknown) {
      setCameraMessage({
        title: 'Camera',
        message: e instanceof Error ? e.message : 'Could not take photo.',
      });
    } finally {
      setCapturing(false);
    }
  }, [capturing, flashMode, onPhotoCaptured]);

  const isPermissionPending = useMemo(() => hasPermission == null, [hasPermission]);
  const isPermissionGranted = Boolean(hasPermission);

  return {
    cameraRef,
    requestPermission,
    isPermissionPending,
    isPermissionGranted,
    facing,
    toggleFacing,
    takePicture,
    capturing,
    cameraMessage,
    clearCameraMessage,
    device,
    flashMode,
    toggleFlashMode,
    hasFlash,
    torchOn,
    toggleTorch,
    hasTorch,
    focusAt,
  };
}

