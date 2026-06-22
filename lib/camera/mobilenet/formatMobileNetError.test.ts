import { describe, expect, it } from 'vitest';

import { formatMobileNetError } from '@/lib/camera/mobilenet/formatMobileNetError';

describe('formatMobileNetError', () => {
  it('maps frame processor errors to rebuild guidance', () => {
    expect(formatMobileNetError(new Error('Frame Processors are disabled!'))).toContain(
      'native rebuild',
    );
  });

  it('maps resize plugin errors to plugin rebuild guidance', () => {
    expect(formatMobileNetError('vision-camera-resize-plugin failed')).toContain('resize plugin');
  });

  it('maps model errors to TFLite bundle guidance', () => {
    expect(formatMobileNetError('TFLite failed to invoke model')).toContain('TFLite model');
  });

  it('maps memory errors to emulator guidance', () => {
    expect(formatMobileNetError(new Error('Failed to allocate memory for tensors'))).toContain(
      'ran out of device memory',
    );
  });

  it('maps float16 prepare failures to re-export guidance, not OOM', () => {
    const message = formatMobileNetError(
      new Error('TFLite createModel failed: Node number 1 (CEIL) failed to prepare. FLOAT16 != FLOAT32'),
    );
    expect(message).toContain('float16');
    expect(message).not.toContain('ran out of device memory');
  });

  it('does not treat tensor allocation after prepare failure as OOM', () => {
    const message = formatMobileNetError(new Error('Failed to allocate tensors'));
    expect(message).not.toContain('ran out of device memory');
  });
});
