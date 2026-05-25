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
});
