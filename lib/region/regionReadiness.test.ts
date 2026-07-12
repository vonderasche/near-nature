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
  clearRegionalModelBundleReadyCache,
  isRegionalModelBundleReady,
  setRegionalModelBundleReadyCache,
} from '@/lib/region/regionalModelReadyState';

describe('isRegionReady', () => {
  beforeEach(() => {
    clearRegionalModelBundleReadyCache();
  });

  it('is true for south when regional models are on-device', () => {
    setRegionalModelBundleReadyCache('south', true);
    expect(isRegionalModelBundleReady('south')).toBe(true);
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
    clearRegionalModelBundleReadyCache();
  });

  it('is always true in global capture mode', () => {
    expect(isCaptureReady('west', 'global', false)).toBe(true);
  });

  it('is always true in regional capture mode (v13 bundled cascade)', () => {
    expect(isCaptureReady('south', 'regional', false)).toBe(true);
    expect(isCaptureReady('south', 'regional', true)).toBe(true);
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
