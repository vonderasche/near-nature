import { describe, expect, it, beforeEach } from 'vitest';

import {
  isClassificationDebugEnabled,
  isClassificationDebugFeatureAvailable,
  setClassificationDebugUserOptIn,
} from '@/lib/classification/debug/classificationDebugRuntime';

describe('classificationDebugRuntime', () => {
  beforeEach(() => {
    setClassificationDebugUserOptIn(false);
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
});
