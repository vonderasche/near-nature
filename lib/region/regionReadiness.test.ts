import { describe, expect, it } from 'vitest';

import { regionDisplayLabel } from '@/constants/regions';
import {
  isRegionReady,
  regionAvailabilityBadge,
  regionDiscoverSubtitle,
  regionUnavailableMessage,
} from '@/lib/region/regionReadiness';
import { isRegionalModelBundleReady } from '@/services/regionModelDownloadService';

describe('isRegionReady', () => {
  it('is true for southeast when bundled models are ready', () => {
    expect(isRegionalModelBundleReady('southeast')).toBe(true);
    expect(isRegionReady('southeast')).toBe(true);
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
    expect(regionDiscoverSubtitle('southeast')).toBe('Florida state parks, plants, and wildlife.');
  });

  it('uses neutral availability badges', () => {
    expect(regionAvailabilityBadge('southeast')).toBe('Available');
    expect(regionAvailabilityBadge('northeast')).toBe('In progress');
  });

  it('does not mention Florida testing in unavailable message', () => {
    expect(regionUnavailableMessage('southwest')).toContain('Southwest');
    expect(regionUnavailableMessage('southwest')).not.toContain('Florida');
  });
});
