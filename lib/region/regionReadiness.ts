import {
  isRegionLive,
  regionLabel,
  type RegionPackId,
} from '@/constants/regions';
import { isRegionalModelBundleReady } from '@/services/regionModelDownloadService';

export type RegionFeature = 'discover' | 'camera';

/** Region has catalog + on-device models available for the active pack. */
export function isRegionReady(regionId: RegionPackId): boolean {
  return isRegionLive(regionId) && isRegionalModelBundleReady(regionId);
}

export function regionAvailabilityBadge(regionId: RegionPackId): 'Available' | 'In progress' {
  return isRegionReady(regionId) ? 'Available' : 'In progress';
}

/** Discover tab subtitle — same phrasing whether ready or preparing; gates handle the rest. */
export function regionDiscoverSubtitle(regionId: RegionPackId): string {
  if (regionId === 'southeast' && isRegionReady(regionId)) {
    return 'Florida state parks, plants, and wildlife.';
  }
  return `${regionLabel(regionId)} parks, plants, and wildlife.`;
}

export function regionUnavailableTitle(_regionId: RegionPackId, _feature: RegionFeature): string {
  return 'Still setting up';
}

export function regionUnavailableMessage(regionId: RegionPackId): string {
  const label = regionLabel(regionId);
  return `We're bringing parks, species, and identification for ${label} to Near Nature. Choose another region in Profile to keep exploring.`;
}

export function regionProfileDescription(): string {
  return 'Your region sets which parks, species, and identification models load. Change it anytime — the app updates automatically when your region is ready.';
}
