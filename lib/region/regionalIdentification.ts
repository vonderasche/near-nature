import { Platform } from 'react-native';

import type { CaptureMode } from '@/constants/identification-preferences';
import type { RegionPackId } from '@/constants/regions';
import { isCaptureReady } from '@/lib/region/regionReadiness';

export function isRegionalIdentificationAvailable(
  regionId: RegionPackId,
  captureMode: CaptureMode = 'regional',
): boolean {
  if (!isCaptureReady(regionId, captureMode)) return false;
  return Platform.OS === 'ios' || Platform.OS === 'android';
}
