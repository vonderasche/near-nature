import { describe, expect, it } from 'vitest';

import '@/lib/classification/debug/flags/registerDefaultFlags';
import { evaluateFlags } from '@/lib/classification/debug/flagEvaluatorRegistry';
import type { MlTelemetryEventInsert } from '@/lib/classification/debug/types';

function eventWithPayload(
  partial: Partial<MlTelemetryEventInsert> & Pick<MlTelemetryEventInsert, 'event_name' | 'outcome'>,
): MlTelemetryEventInsert {
  return {
    session_id: '11111111-1111-1111-1111-111111111111',
    domain: 'classification',
    pipeline: 'gemini',
    region_id: 'southeast',
    platform: 'test',
    app_version: '1.0.0',
    flags: [],
    payload: {},
    ...partial,
  };
}

describe('classification debug flags', () => {
  it('reclassify_mismatch from comparison when reclassify_mismatch field absent', () => {
    const event = eventWithPayload({
      event_name: 'cloud_reclassify',
      outcome: 'success',
      payload: {
        comparison: { reclassify_mismatch: true },
      },
    });
    expect(evaluateFlags(event, [])).toContain('reclassify_mismatch');
  });

  it('gemini_filtered when filter_summary dropped rows', () => {
    const event = eventWithPayload({
      event_name: 'capture_identify',
      outcome: 'success',
      pipeline: 'gemini',
      payload: { filter_summary: { dropped: 2 } },
    });
    expect(evaluateFlags(event, [])).toContain('gemini_filtered');
  });
});
