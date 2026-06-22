import { describe, expect, it } from 'vitest';

import { formatMvpCaptureLoadError, formatMvpCaptureMemoryError } from '@/lib/camera/tflite/mvp/mvpCaptureMemoryError';

describe('formatMvpCaptureMemoryError', () => {
  it('mentions turning live AI off', () => {
    const message = formatMvpCaptureMemoryError('routing model');
    expect(message).toContain('routing model');
    expect(message).toContain('Turn live AI off');
  });
});

describe('formatMvpCaptureLoadError', () => {
  it('maps float16 prepare failures to re-export guidance', () => {
    const message = formatMvpCaptureLoadError(
      new Error('TFLite createModel failed: Node number 1 (CEIL) failed to prepare. FLOAT16 != FLOAT32'),
      'routing model',
    );
    expect(message).toContain('float16');
    expect(message).toContain('float32');
  });
});
