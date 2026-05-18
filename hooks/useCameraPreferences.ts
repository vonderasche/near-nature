import * as Haptics from 'expo-haptics';
import { useCallback } from 'react';

import {
  CAMERA_PREF_HDR,
  CAMERA_PREF_LEVEL,
  CAMERA_PREF_SHUTTER_SOUND,
  CAMERA_PREF_STABILIZATION,
  DEFAULT_CAMERA_HDR,
  DEFAULT_CAMERA_LEVEL,
  DEFAULT_CAMERA_SHUTTER_SOUND,
  DEFAULT_CAMERA_STABILIZATION,
} from '@/constants/camera-preferences';
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

  return {
    hdrEnabled: hdr.value,
    toggleHdr,
    stabilizationEnabled: stabilization.value,
    toggleStabilization,
    shutterSoundEnabled: shutterSound.value,
    toggleShutterSound,
    levelEnabled: level.value,
    toggleLevel,
    ready: hdr.ready && stabilization.ready && shutterSound.ready && level.ready,
  };
}
