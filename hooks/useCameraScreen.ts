import * as Haptics from 'expo-haptics';
import { useCallback, useMemo, useRef, useState, type RefObject } from 'react';
import { Platform } from 'react-native';
import { Camera, useCameraDevice, useCameraPermission } from 'react-native-vision-camera';

import { captureSquarePhotoFromCameraRef } from '@/lib/camera/capturePicture';

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
};

export function useCameraScreen(options?: UseCameraScreenOptions): UseCameraScreenResult {
  const onPhotoCaptured = options?.onPhotoCaptured;

  const cameraRef = useRef<Camera>(null);
  const { hasPermission, requestPermission } = useCameraPermission();

  const [facing, setFacing] = useState<CameraFacing>('back');
  const device = useCameraDevice(facing);

  const [capturing, setCapturing] = useState(false);
  const [cameraMessage, setCameraMessage] = useState<CameraScreenMessage | null>(null);

  const clearCameraMessage = useCallback(() => {
    setCameraMessage(null);
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
      const photo = await captureSquarePhotoFromCameraRef(cameraRef);
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
  }, [capturing, onPhotoCaptured]);

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
  };
}

