import { describe, expect, it, beforeEach } from 'vitest';

import { regionDisplayLabel } from '@/constants/regions';
import {
  isCaptureReady,
  isRegionReady,
  regionAvailabilityBadge,
  regionDiscoverSubtitle,
  regionUnavailableMessage,
} from '@/lib/region/regionReadiness';
import {
  clearGlobalCaptureModelBundleReadyCache,
  setGlobalCaptureModelBundleReadyCache,
} from '@/lib/region/globalCaptureModelReadyState';
import { modelBundleNeedsUpdate } from '@/lib/region/modelBundleVersionCheck';
import type { RegionModelManifest } from '@/services/regionModelDownloadService';

describe('isRegionReady', () => {
  beforeEach(() => {
    clearGlobalCaptureModelBundleReadyCache();
  });

  it('is true for south when global capture models are on-device', () => {
    setGlobalCaptureModelBundleReadyCache(true);
    expect(isRegionReady('south', true)).toBe(true);
  });

  it('is false for south while models are downloading', () => {
    expect(isRegionReady('south', false)).toBe(false);
  });

  it('is false for west until models are published', () => {
    expect(isRegionReady('west')).toBe(false);
  });
});

describe('isCaptureReady', () => {
  beforeEach(() => {
    clearGlobalCaptureModelBundleReadyCache();
  });

  it('is false until global capture models are ready', () => {
    expect(isCaptureReady('west', 'global', false)).toBe(false);
  });

  it('is true when global capture models are ready', () => {
    setGlobalCaptureModelBundleReadyCache(true);
    expect(isCaptureReady('south', 'regional', true)).toBe(true);
  });
});

describe('modelBundleNeedsUpdate', () => {
  const baseManifest: RegionModelManifest = {
    regionId: 'global',
    version: '1.0.0',
    bundle: 'near_nature_v18',
    files: [
      {
        path: 'v18/tflite/v18.tflite',
        storagePath: 'global/v18/tflite/v18.tflite',
        sizeBytes: 100,
        sha256: 'abc',
      },
    ],
  };

  it('returns true when nothing is installed', () => {
    expect(modelBundleNeedsUpdate(null, baseManifest)).toBe(true);
  });

  it('returns false when local matches remote', () => {
    expect(modelBundleNeedsUpdate(baseManifest, baseManifest)).toBe(false);
  });

  it('returns true when version changes', () => {
    expect(
      modelBundleNeedsUpdate(baseManifest, {
        ...baseManifest,
        version: '1.0.1',
      }),
    ).toBe(true);
  });

  it('returns true when bundle name changes', () => {
    expect(
      modelBundleNeedsUpdate(baseManifest, {
        ...baseManifest,
        bundle: 'near_nature_v13',
      }),
    ).toBe(true);
  });
});

describe('region copy', () => {
  it('uses plain region names without coming soon suffix', () => {
    expect(regionDisplayLabel('west')).toBe('West');
    expect(regionDisplayLabel('south')).toBe('South');
  });

  it('uses consistent discover subtitles', () => {
    expect(regionDiscoverSubtitle('west')).toBe('West parks, plants, and wildlife.');
    expect(regionDiscoverSubtitle('south', true)).toBe('Florida state parks, plants, and wildlife.');
  });

  it('uses neutral availability badges', () => {
    expect(regionAvailabilityBadge('south', true)).toBe('Available');
    expect(regionAvailabilityBadge('northeast')).toBe('In progress');
  });

  it('does not mention Florida testing in unavailable message', () => {
    expect(regionUnavailableMessage('west')).toContain('West');
    expect(regionUnavailableMessage('west')).not.toContain('Florida');
  });
});
