import * as Haptics from 'expo-haptics';
import { useCallback } from 'react';

import { areFrameProcessorsAvailable } from '@/lib/camera/areFrameProcessorsAvailable';
import {
  CAMERA_PREF_HDR,
  CAMERA_PREF_LEVEL,
  CAMERA_PREF_LIVE_CLASSIFIER,
  CAMERA_PREF_PREVIEW_MODE,
  CAMERA_PREF_SHUTTER_SOUND,
  CAMERA_PREF_STABILIZATION,
  DEFAULT_CAMERA_HDR,
  DEFAULT_CAMERA_LEVEL,
  DEFAULT_CAMERA_LIVE_CLASSIFIER,
  DEFAULT_CAMERA_PREVIEW_MODE,
  DEFAULT_CAMERA_SHUTTER_SOUND,
  DEFAULT_CAMERA_STABILIZATION,
} from '@/constants/camera-preferences';
import {
  parsePreviewModelId,
  type PreviewModelId,
} from '@/lib/camera/tflite/preview';
import { usePersistedPreference } from '@/hooks/usePersistedPreference';

function parseBool(raw: string | null, fallback: boolean): boolean {
  if (raw === 'true') return true;
  if (raw === 'false') return false;
  return fallback;
}

export function useCameraPreferences() {
  const hdr = usePersistedPreference(CAMERA_PREF_HDR, (r) => parseBool(r, DEFAULT_CAMERA_HDR), DEFAULT_CAMERA_HDR);
  const stabilization = usePersistedPreference(
    CAMERA_PREF_STABILIZATION,
    (r) => parseBool(r, DEFAULT_CAMERA_STABILIZATION),
    DEFAULT_CAMERA_STABILIZATION,
  );
  const shutterSound = usePersistedPreference(
    CAMERA_PREF_SHUTTER_SOUND,
    (r) => parseBool(r, DEFAULT_CAMERA_SHUTTER_SOUND),
    DEFAULT_CAMERA_SHUTTER_SOUND,
  );
  const level = usePersistedPreference(
    CAMERA_PREF_LEVEL,
    (r) => parseBool(r, DEFAULT_CAMERA_LEVEL),
    DEFAULT_CAMERA_LEVEL,
  );
  const liveClassifier = usePersistedPreference(
    CAMERA_PREF_LIVE_CLASSIFIER,
    (r) => parseBool(r, DEFAULT_CAMERA_LIVE_CLASSIFIER),
    DEFAULT_CAMERA_LIVE_CLASSIFIER,
  );
  const previewModePref = usePersistedPreference(
    CAMERA_PREF_PREVIEW_MODE,
    (r) => parsePreviewModelId(r),
    DEFAULT_CAMERA_PREVIEW_MODE,
  );

  const hapticTap = useCallback(() => {
    try {
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {
      /* haptics unavailable */
    }
  }, []);

  const toggleHdr = useCallback(() => {
    hapticTap();
    hdr.setValue(!hdr.value);
  }, [hdr, hapticTap]);
  const toggleStabilization = useCallback(() => {
    hapticTap();
    stabilization.setValue(!stabilization.value);
  }, [stabilization, hapticTap]);
  const toggleShutterSound = useCallback(() => {
    hapticTap();
    shutterSound.setValue(!shutterSound.value);
  }, [shutterSound, hapticTap]);
  const toggleLevel = useCallback(() => {
    hapticTap();
    level.setValue(!level.value);
  }, [level, hapticTap]);
  const selectLivePreviewModel = useCallback(
    (modelId: PreviewModelId) => {
      hapticTap();
      if (!areFrameProcessorsAvailable()) {
        return;
      }
      previewModePref.setValue(modelId);
      if (!liveClassifier.value) {
        liveClassifier.setValue(true);
      }
    },
    [hapticTap, liveClassifier, previewModePref],
  );

  const disableLivePreview = useCallback(() => {
    hapticTap();
    liveClassifier.setValue(false);
  }, [hapticTap, liveClassifier]);

  const liveClassifierEnabled =
    liveClassifier.value && areFrameProcessorsAvailable();
  const previewMode: PreviewModelId = previewModePref.value;
  const frameProcessorsAvailable = areFrameProcessorsAvailable();

  return {
    hdrEnabled: hdr.value,
    toggleHdr,
    stabilizationEnabled: stabilization.value,
    toggleStabilization,
    shutterSoundEnabled: shutterSound.value,
    toggleShutterSound,
    levelEnabled: level.value,
    toggleLevel,
    liveClassifierEnabled,
    previewMode,
    selectLivePreviewModel,
    disableLivePreview,
    frameProcessorsAvailable,
    ready:
      hdr.ready &&
      stabilization.ready &&
      shutterSound.ready &&
      level.ready &&
      liveClassifier.ready &&
      previewModePref.ready,
  };
}
