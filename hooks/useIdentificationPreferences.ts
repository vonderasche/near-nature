import AsyncStorage from '@react-native-async-storage/async-storage';

import {
  CAPTURE_MODE_PREF,
  DEFAULT_CAPTURE_MODE,
  parseCaptureMode,
  type CaptureMode,
} from '@/constants/identification-preferences';
import { usePersistedPreference } from '@/hooks/usePersistedPreference';

export function useIdentificationPreferences() {
  const captureModePref = usePersistedPreference(
    CAPTURE_MODE_PREF,
    (raw) => parseCaptureMode(raw),
    DEFAULT_CAPTURE_MODE,
  );

  return {
    captureMode: captureModePref.value,
    setCaptureMode: captureModePref.setValue,
    ready: captureModePref.ready,
  };
}

/** Read capture mode outside React (e.g. identification pipeline). */
export async function readCaptureModePreference(): Promise<CaptureMode> {
  const raw = await AsyncStorage.getItem(CAPTURE_MODE_PREF);
  return parseCaptureMode(raw);
}
