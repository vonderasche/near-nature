import { describe, expect, it } from 'vitest';

import { parseMobileNetTop3 } from '@/lib/camera/mobilenet/parseMobileNetOutput';

describe('parseMobileNetTop3', () => {
  it('returns top three classes from float logits', () => {
    const logits = new Float32Array([0, 4, 1, 2]);
    const top = parseMobileNetTop3(logits.buffer);
    expect(top.map((p) => p.classIndex)).toEqual([1, 3, 2]);
    expect(top[0].confidence).toBeGreaterThan(top[1].confidence);
  });

  it('returns top three classes from quantized bytes', () => {
    const logits = new Uint8Array([3, 9, 4, 255, 8]);
    const top = parseMobileNetTop3(logits.buffer);
    expect(top.map((p) => p.classIndex)).toEqual([3, 1, 4]);
    expect(top[0].confidence).toBe(1);
  });

  it('can force float parsing for large class counts', () => {
    const logits = new Float32Array(1569);
    logits[10] = 2.1;
    logits[777] = 4.2;
    logits[1500] = 3.5;

    const top = parseMobileNetTop3(logits.buffer, { forceFloat: true });
    expect(top.map((p) => p.classIndex)).toEqual([777, 1500, 10]);
  });
});
