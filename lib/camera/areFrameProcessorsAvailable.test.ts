import { describe, expect, it, vi } from 'vitest';

vi.mock('react-native-vision-camera', () => ({
  VisionCameraProxy: { workletContext: { fake: true } },
}));

import { areFrameProcessorsAvailable } from '@/lib/camera/areFrameProcessorsAvailable';

describe('areFrameProcessorsAvailable', () => {
  it('is true when worklet context exists', () => {
    expect(areFrameProcessorsAvailable()).toBe(true);
  });
});
