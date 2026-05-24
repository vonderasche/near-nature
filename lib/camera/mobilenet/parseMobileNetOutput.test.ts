import { describe, expect, it } from 'vitest';

import { parseMobileNetTop1 } from '@/lib/camera/mobilenet/parseMobileNetOutput';

describe('parseMobileNetTop1', () => {
  it('reads uint8 quantized logits', () => {
    const buf = new Uint8Array([10, 200, 50]).buffer;
    expect(parseMobileNetTop1(buf)).toEqual({ classIndex: 1, confidence: 200 / 255 });
  });

  it('reads float32 logits', () => {
    const floats = new Float32Array([0.1, 0.9, 0.2]);
    const result = parseMobileNetTop1(floats.buffer);
    expect(result.classIndex).toBe(1);
    expect(result.confidence).toBeCloseTo(0.9, 5);
  });
});
