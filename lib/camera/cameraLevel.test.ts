import { describe, expect, it } from 'vitest';

import { isHorizonLevel, rollDegreesFromAccelerometer } from './cameraLevel';

describe('cameraLevel', () => {
  it('reads 0° when upright', () => {
    expect(rollDegreesFromAccelerometer(0, -1)).toBeCloseTo(0, 1);
  });

  it('detects level within tolerance', () => {
    expect(isHorizonLevel(1.5)).toBe(true);
    expect(isHorizonLevel(4)).toBe(false);
  });
});
