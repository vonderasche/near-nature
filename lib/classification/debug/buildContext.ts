import Constants from 'expo-constants';
import { Platform } from 'react-native';

import type { TelemetryBuildContext } from '@/lib/classification/debug/types';

export function buildTelemetryContext(sessionId: string, regionId: string | null): TelemetryBuildContext {
  return {
    sessionId,
    regionId,
    platform: Platform.OS,
    appVersion: Constants.expoConfig?.version ?? 'unknown',
  };
}
