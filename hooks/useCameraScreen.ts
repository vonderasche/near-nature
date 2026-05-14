import { CameraView, useCameraPermissions } from 'expo-camera';
import * as Haptics from 'expo-haptics';
import { useCallback, useRef, useState, type RefObject } from 'react';
import { Alert, Platform } from 'react-native';

import { capturePictureFromCameraRef } from '@/lib/camera/capturePicture';

export type CameraFacing = 'back' | 'front';

export type UseCameraScreenOptions = {
  /** When set, called with the photo URI instead of showing the default success alert. */
  onPhotoCaptured?: (uri: string) => void;
};

export type UseCameraScreenResult = {
  cameraRef: RefObject<CameraView | null>;
  permission: ReturnType<typeof useCameraPermissions>[0];
  requestPermission: () => Promise<unknown>;
  /** `true` while Expo has not resolved the permission hook yet */
  isPermissionPending: boolean;
  isPermissionGranted: boolean;
  facing: CameraFacing;
  toggleFacing: () => void;
  takePicture: () => Promise<void>;
  capturing: boolean;
};

/**
 * Camera preview state: permissions, facing, ref, and capture.
 * Pass `onPhotoCaptured` to navigate to a preview screen or upload without the default alert.
 */
export function useCameraScreen(options?: UseCameraScreenOptions): UseCameraScreenResult {
  const onPhotoCaptured = options?.onPhotoCaptured;
  const cameraRef = useRef<CameraView>(null);
  const [permission, requestPermission] = useCameraPermissions();
  const [facing, setFacing] = useState<CameraFacing>('back');
  const [capturing, setCapturing] = useState(false);

  const toggleFacing = useCallback(() => {
    try {
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {
      /* haptics unavailable */
    }
    setFacing((f) => (f === 'back' ? 'front' : 'back'));
  }, []);

  const takePicture = useCallback(async () => {
    setCapturing(true);
    try {
      const photo = await capturePictureFromCameraRef(cameraRef);
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

      Alert.alert('Photo captured', Platform.OS === 'web' ? 'Saved to preview (web).' : uri);
    } catch (e: unknown) {
      Alert.alert('Camera', e instanceof Error ? e.message : 'Could not take photo.');
    } finally {
      setCapturing(false);
    }
  }, [onPhotoCaptured]);

  const isPermissionPending = permission == null;
  const isPermissionGranted = permission?.granted ?? false;

  return {
    cameraRef,
    permission,
    requestPermission,
    isPermissionPending,
    isPermissionGranted,
    facing,
    toggleFacing,
    takePicture,
    capturing,
  };
}
