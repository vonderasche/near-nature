import { describe, expect, it, beforeEach } from 'vitest';

import {
  isClassificationDebugEnabled,
  isClassificationDebugFeatureAvailable,
  isClassificationDebugThumbnailsEnabled,
  setClassificationDebugIncludeThumbnails,
  setClassificationDebugUserOptIn,
} from '@/lib/classification/debug/classificationDebugRuntime';

describe('classificationDebugRuntime', () => {
  beforeEach(() => {
    setClassificationDebugUserOptIn(false);
    setClassificationDebugIncludeThumbnails(false);
  });

  it('requires user opt-in when feature flag is on', () => {
    if (!isClassificationDebugFeatureAvailable()) {
      expect(isClassificationDebugEnabled()).toBe(false);
      setClassificationDebugUserOptIn(true);
      expect(isClassificationDebugEnabled()).toBe(false);
      return;
    }

    expect(isClassificationDebugEnabled()).toBe(false);
    setClassificationDebugUserOptIn(true);
    expect(isClassificationDebugEnabled()).toBe(true);
  });

  it('tracks thumbnail preference in runtime', () => {
    expect(isClassificationDebugThumbnailsEnabled()).toBe(false);
    setClassificationDebugIncludeThumbnails(true);
    expect(isClassificationDebugThumbnailsEnabled()).toBe(true);
  });
});
