import { Platform } from 'react-native';

import type { RegionPackId } from '@/constants/regions';
import { isRegionReady } from '@/lib/region/regionReadiness';

export function isRegionalIdentificationAvailable(regionId: RegionPackId): boolean {
  if (!isRegionReady(regionId)) return false;
  return Platform.OS === 'ios' || Platform.OS === 'android';
}
