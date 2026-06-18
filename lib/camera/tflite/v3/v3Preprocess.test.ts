import { describe, expect, it } from 'vitest';

import {
  centerCropRgba,
  resizeShortEdgeDimensions,
} from '@/lib/camera/tflite/v3/v3ImageTransforms';

describe('resizeShortEdgeDimensions', () => {
  it('scales portrait images on width', () => {
    expect(resizeShortEdgeDimensions(1000, 2000, 255)).toEqual({ width: 255, height: 510 });
  });

  it('scales landscape images on height', () => {
    expect(resizeShortEdgeDimensions(2000, 1000, 255)).toEqual({ width: 510, height: 255 });
  });
});

describe('centerCropRgba', () => {
  it('crops a centered square region', () => {
    const rgba = new Uint8Array(4 * 4 * 4);
    rgba.fill(0);
    rgba[(1 * 4 + 1) * 4] = 255;

    const cropped = centerCropRgba(rgba, 4, 4, 2);
    expect(cropped.length).toBe(2 * 2 * 4);
    expect(cropped[0]).toBe(255);
  });
});
