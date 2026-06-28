import { describe, expect, it, beforeEach } from 'vitest';

import { regionDisplayLabel } from '@/constants/regions';
import {
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

  it('is true for southeast when regional models are on-device', () => {
    setRegionalModelBundleReadyCache('southeast', true);
    expect(isRegionalModelBundleReady('southeast')).toBe(true);
    expect(isRegionReady('southeast', true)).toBe(true);
  });

  it('is false for southeast while models are downloading', () => {
    expect(isRegionReady('southeast', false)).toBe(false);
  });

  it('is false for southwest until models are published', () => {
    expect(isRegionReady('southwest')).toBe(false);
  });
});

describe('region copy', () => {
  it('uses plain region names without coming soon suffix', () => {
    expect(regionDisplayLabel('southwest')).toBe('Southwest');
  });

  it('uses consistent discover subtitles', () => {
    expect(regionDiscoverSubtitle('southwest')).toBe('Southwest parks, plants, and wildlife.');
    expect(regionDiscoverSubtitle('southeast', true)).toBe('Florida state parks, plants, and wildlife.');
  });

  it('uses neutral availability badges', () => {
    expect(regionAvailabilityBadge('southeast', true)).toBe('Available');
    expect(regionAvailabilityBadge('northeast')).toBe('In progress');
  });

  it('does not mention Florida testing in unavailable message', () => {
    expect(regionUnavailableMessage('southwest')).toContain('Southwest');
    expect(regionUnavailableMessage('southwest')).not.toContain('Florida');
  });
});
