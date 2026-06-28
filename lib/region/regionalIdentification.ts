import { Platform } from 'react-native';

import type { RegionPackId } from '@/constants/regions';
import { isRegionLive } from '@/constants/regions';

export function isRegionalIdentificationAvailable(regionId: RegionPackId): boolean {
  if (!isRegionLive(regionId)) return false;
  return Platform.OS === 'ios' || Platform.OS === 'android';
}
