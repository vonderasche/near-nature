import { describe, expect, it } from 'vitest';

import {
  MOBILENET_TOP16_IMAGENET_MEAN,
  MOBILENET_TOP16_IMAGENET_STD,
} from '@/lib/camera/mobilenet/modelConfig';
import { normalizeMobileNetInput } from '@/lib/camera/mobilenet/normalizeMobileNetInput';

describe('normalizeMobileNetInput', () => {
  it('applies ImageNet normalization to RGB float pixels', () => {
    const input = new Float32Array([0.485, 0.456, 0.406, 1, 1, 1]);
    const normalized = normalizeMobileNetInput(input);

    expect(normalized[0]).toBeCloseTo(0);
    expect(normalized[1]).toBeCloseTo(0);
    expect(normalized[2]).toBeCloseTo(0);
    expect(normalized[3]).toBeCloseTo((1 - MOBILENET_TOP16_IMAGENET_MEAN[0]) / MOBILENET_TOP16_IMAGENET_STD[0]);
    expect(normalized[4]).toBeCloseTo((1 - MOBILENET_TOP16_IMAGENET_MEAN[1]) / MOBILENET_TOP16_IMAGENET_STD[1]);
    expect(normalized[5]).toBeCloseTo((1 - MOBILENET_TOP16_IMAGENET_MEAN[2]) / MOBILENET_TOP16_IMAGENET_STD[2]);
  });
});
