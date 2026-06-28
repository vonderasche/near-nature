import {
  isRegionLive,
  regionLabel,
  type RegionPackId,
} from '@/constants/regions';
import { isRegionalModelBundleReady } from '@/lib/region/regionalModelReadyState';

export type RegionFeature = 'discover' | 'camera';

/** Region has catalog + on-device models available for the active pack. */
export function isRegionReady(regionId: RegionPackId, modelBundleReady?: boolean): boolean {
  const modelsReady = modelBundleReady ?? isRegionalModelBundleReady(regionId);
  return isRegionLive(regionId) && modelsReady;
}

export function regionAvailabilityBadge(regionId: RegionPackId, modelBundleReady?: boolean): 'Available' | 'In progress' {
  return isRegionReady(regionId, modelBundleReady) ? 'Available' : 'In progress';
}

/** Discover tab subtitle — same phrasing whether ready or preparing; gates handle the rest. */
export function regionDiscoverSubtitle(regionId: RegionPackId, modelBundleReady?: boolean): string {
  if (regionId === 'southeast' && isRegionReady(regionId, modelBundleReady)) {
    return 'Florida state parks, plants, and wildlife.';
  }
  return `${regionLabel(regionId)} parks, plants, and wildlife.`;
}

export function regionUnavailableTitle(
  _regionId: RegionPackId,
  _feature: RegionFeature,
  downloadState?: 'idle' | 'downloading' | 'ready' | 'error',
): string {
  if (downloadState === 'downloading') {
    return 'Preparing your region';
  }
  if (downloadState === 'error') {
    return 'Connect to download your region';
  }
  return 'Still setting up';
}

export function regionUnavailableMessage(
  regionId: RegionPackId,
  downloadState?: 'idle' | 'downloading' | 'ready' | 'error',
  downloadProgress?: number,
): string {
  const label = regionLabel(regionId);
  if (downloadState === 'downloading') {
    const pct = Math.round((downloadProgress ?? 0) * 100);
    return `Downloading identification models for ${label}… ${pct}%`;
  }
  if (downloadState === 'error') {
    return `Identification models for ${label} need an internet connection. Retry from Profile or switch to another region.`;
  }
  return `We're bringing parks, species, and identification for ${label} to Near Nature. Choose another region in Profile to keep exploring.`;
}

export function regionProfileDescription(): string {
  return 'Your region sets which parks, species, and identification models load. Change it anytime — the app updates automatically when your region is ready.';
}

export function regionProfileDownloadLabel(
  regionId: RegionPackId,
  downloadState: 'idle' | 'downloading' | 'ready' | 'error',
): string {
  const label = regionLabel(regionId);
  if (downloadState === 'downloading') {
    return `${label} — Preparing…`;
  }
  if (downloadState === 'error') {
    return `${label} — Download failed`;
  }
  return label;
}
