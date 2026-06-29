import { describe, expect, it } from 'vitest';

import '@/lib/classification/debug/flags/registerDefaultFlags';
import {
  captureIdentifyBuilder,
  cloudReclassifyBuilder,
} from '@/lib/classification/debug/builders/registerDefaultBuilders';
import { evaluateFlags } from '@/lib/classification/debug/flagEvaluatorRegistry';
import type {
  CaptureIdentifyRawContext,
  CloudReclassifyRawContext,
  TelemetryBuildContext,
} from '@/lib/classification/debug/types';

const ctx: TelemetryBuildContext = {
  sessionId: '11111111-1111-1111-1111-111111111111',
  regionId: 'southeast',
  platform: 'test',
  appVersion: '1.0.0',
};

function finalize(event: ReturnType<typeof captureIdentifyBuilder>) {
  if (!event) throw new Error('missing event');
  return {
    ...event,
    flags: evaluateFlags({ ...event, flags: [] }, event.flagHints ?? []),
  };
}

describe('classification debug builders', () => {
  it('flags empty tflite capture', () => {
    const raw: CaptureIdentifyRawContext = {
      pipeline: 'tflite',
      classifications: [],
      tfliteMeta: {
        previewTop: [{ label: 'No Plant or Animal', confidence: 0.9, classIndex: 0 }],
        routedPreviewLabel: 'No Plant or Animal',
        specialistId: null,
        specialistDisplayName: null,
        genusTop: [],
        usedSpecialist: false,
        notice: 'No plant or animal detected in this image.',
      },
    };
    const event = finalize(captureIdentifyBuilder(ctx, raw)!);
    expect(event.outcome).toBe('empty');
    expect(event.flags).toContain('empty_result');
    expect(event.flags).toContain('routing_no_organism');
  });

  it('flags reclassify mismatch', () => {
    const raw: CloudReclassifyRawContext = {
      priorTfliteMeta: {
        previewTop: [],
        routedPreviewLabel: 'Bird',
        specialistId: 'birds',
        specialistDisplayName: 'Birds',
        genusTop: [{ genus: 'Turdus', confidence: 0.8, classIndex: 0 }],
        usedSpecialist: true,
        notice: null,
      },
      cloudClassifications: [
        {
          latinName: 'Anolis',
          commonName: 'Anolis',
          confidence: 0.77,
          taxonGroup: 'animals',
        },
      ],
    };
    const draft = cloudReclassifyBuilder(ctx, raw)!;
    const event = finalize(draft);
    expect(event.flags).toContain('user_reclassified');
    expect(event.flags).toContain('reclassify_mismatch');
    expect(event.payload.reclassify_mismatch).toBe(true);
  });
});
