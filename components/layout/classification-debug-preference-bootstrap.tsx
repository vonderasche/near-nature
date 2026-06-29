import { useClassificationDebugPreference } from '@/hooks/useClassificationDebugPreference';

/** Loads persisted telemetry prefs into the debug runtime module. */
export function ClassificationDebugPreferenceBootstrap() {
  useClassificationDebugPreference();
  return null;
}
