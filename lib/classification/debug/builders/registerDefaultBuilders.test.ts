import { describe, expect, it } from 'vitest';

import '@/lib/classification/debug/flags/registerDefaultFlags';
import {
  captureIdentifyBuilder,
  cloudReclassifyBuilder,
  livePreviewSampleBuilder,
  saveLinkedBuilder,
} from '@/lib/classification/debug/builders/registerDefaultBuilders';
import { evaluateFlags } from '@/lib/classification/debug/flagEvaluatorRegistry';
import type {
  CaptureIdentifyRawContext,
  CloudReclassifyRawContext,
  LivePreviewSampleRawContext,
  TelemetryBuildContext,
} from '@/lib/classification/debug/types';

const ctx: TelemetryBuildContext = {
  sessionId: '11111111-1111-1111-1111-111111111111',
  regionId: 'south',
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
        previewTop: [{ label: 'Bird', confidence: 0.9, classIndex: 2 }],
        routedPreviewLabel: 'Bird',
        specialistId: 'birds',
        specialistDisplayName: 'Birds',
        genusTop: [{ genus: 'Turdus', confidence: 0.8, classIndex: 0 }],
        usedSpecialist: true,
        notice: null,
      },
      priorClassifications: [
        {
          latinName: 'Turdus',
          commonName: 'Turdus',
          confidence: 0.8,
          taxonGroup: 'animals',
        },
      ],
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
    expect(event.payload.tflite_prediction).toMatchObject({
      routing_label: 'Bird',
      specialist_id: 'birds',
      top: { latin_name: 'Turdus', confidence: 0.8 },
    });
    expect(event.payload.gemini_prediction).toMatchObject({
      top: { latin_name: 'Anolis', confidence: 0.77 },
    });
    expect(event.payload.comparison).toMatchObject({
      tflite_top_latin: 'turdus',
      gemini_top_latin: 'anolis',
      latin_match: false,
      reclassify_mismatch: true,
    });
  });

  it('records gemini fallback when predictions agree', () => {
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
      priorClassifications: [
        {
          latinName: 'Turdus',
          commonName: 'American Robin',
          confidence: 0.8,
          taxonGroup: 'animals',
        },
      ],
      cloudClassifications: [
        {
          latinName: 'Turdus',
          commonName: 'American Robin',
          confidence: 0.91,
          taxonGroup: 'animals',
        },
      ],
    };
    const event = finalize(cloudReclassifyBuilder(ctx, raw)!);
    expect(event.flags).toContain('user_reclassified');
    expect(event.flags).not.toContain('reclassify_mismatch');
    expect(event.payload.comparison).toMatchObject({
      latin_match: true,
      reclassify_mismatch: false,
    });
  });

  it('flags user feedback when saving an alternate species', () => {
    const draft = saveLinkedBuilder(ctx, {
      detectionId: '22222222-2222-2222-2222-222222222222',
      selectedIndex: 2,
      userFeedback: {
        kind: 'selected_alternate',
        selectedIndex: 2,
        selectedLatin: 'Anolis',
        topLatin: 'Turdus',
      },
    })!;
    const event = finalize(draft);
    expect(event.flags).toContain('user_feedback');
    expect(event.flags).toContain('user_selected_alternate');
    expect(event.payload.user_feedback).toMatchObject({ selectedLatin: 'Anolis' });
  });

  it('flags kingdom uncertain live preview sample', () => {
    const raw: LivePreviewSampleRawContext = {
      modelId: 'kingdom',
      predictions: [{ label: 'Uncertain', confidence: 0.55, classIndex: -1 }],
    };
    const draft = livePreviewSampleBuilder(ctx, raw)!;
    const event = finalize(draft);
    expect(event.outcome).toBe('empty');
    expect(event.flags).toContain('kingdom_uncertain');
    expect(event.pipeline).toBe('preview');
  });

  it('flags routing_no_organism on live preview sample', () => {
    const raw: LivePreviewSampleRawContext = {
      modelId: 'scene_gate',
      predictions: [{ label: 'No Plant or Animal', confidence: 0.92, classIndex: 0 }],
    };
    const event = finalize(livePreviewSampleBuilder(ctx, raw)!);
    expect(event.flags).toContain('routing_no_organism');
    expect(event.outcome).toBe('empty');
  });

  it('flags low confidence on tflite capture', () => {
    const raw: CaptureIdentifyRawContext = {
      pipeline: 'tflite',
      classifications: [
        {
          latinName: 'Turdus',
          commonName: 'Turdus',
          confidence: 0.5,
          taxonGroup: 'animals',
        },
      ],
      tfliteMeta: {
        previewTop: [{ label: 'Bird', confidence: 0.9, classIndex: 2 }],
        routedPreviewLabel: 'Bird',
        specialistId: 'birds',
        specialistDisplayName: 'Birds',
        genusTop: [{ genus: 'Turdus', confidence: 0.5, classIndex: 0 }],
        usedSpecialist: true,
        notice: null,
      },
    };
    const event = finalize(captureIdentifyBuilder(ctx, raw)!);
    expect(event.flags).toContain('low_confidence');
  });

  it('flags specialist_unavailable when routing has no bundled model', () => {
    const raw: CaptureIdentifyRawContext = {
      pipeline: 'tflite',
      classifications: [],
      tfliteMeta: {
        previewTop: [{ label: 'Snake', confidence: 0.88, classIndex: 5 }],
        routedPreviewLabel: 'Snake',
        specialistId: 'snakes',
        specialistDisplayName: 'Snakes',
        genusTop: [],
        usedSpecialist: false,
        notice: 'Snakes does not have a bundled on-device model.',
      },
    };
    const event = finalize(captureIdentifyBuilder(ctx, raw)!);
    expect(event.flags).toContain('specialist_unavailable');
  });

  it('records tflite_prediction on gemini error using genus_top fallback', () => {
    const raw: CloudReclassifyRawContext = {
      priorTfliteMeta: {
        previewTop: [{ label: 'Bird', confidence: 0.9, classIndex: 2 }],
        routedPreviewLabel: 'Bird',
        specialistId: 'birds',
        specialistDisplayName: 'Birds',
        genusTop: [{ genus: 'Turdus', confidence: 0.8, classIndex: 0 }],
        usedSpecialist: true,
        notice: null,
      },
      cloudClassifications: [],
      error: 'Cloud identification failed',
    };
    const event = finalize(cloudReclassifyBuilder(ctx, raw)!);
    expect(event.outcome).toBe('error');
    expect(event.flags).toContain('identify_exception');
    expect(event.flags).toContain('user_reclassified');
    expect(event.payload.tflite_prediction).toMatchObject({
      top: { latin_name: 'Turdus', confidence: 0.8 },
    });
    expect(event.payload.gemini_prediction).toMatchObject({ top: null });
    expect(event.payload.comparison).toMatchObject({
      tflite_top_latin: 'turdus',
      gemini_top_latin: null,
      latin_match: null,
      reclassify_mismatch: null,
    });
  });

  it('records empty gemini fallback with prior tflite context', () => {
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
      priorClassifications: [
        {
          latinName: 'Turdus',
          commonName: 'Turdus',
          confidence: 0.8,
          taxonGroup: 'animals',
        },
      ],
      cloudClassifications: [],
      error: 'Cloud identification did not find a species in this photo.',
    };
    const event = finalize(cloudReclassifyBuilder(ctx, raw)!);
    expect(event.outcome).toBe('error');
    expect(event.flags).toContain('identify_exception');
    expect(event.payload.gemini_prediction).toMatchObject({ predictions: [] });
    expect(event.payload.tflite_prediction).toMatchObject({ top: { latin_name: 'Turdus' } });
  });

  it('includes all gemini predictions in gemini_prediction payload', () => {
    const raw: CloudReclassifyRawContext = {
      priorTfliteMeta: null,
      priorClassifications: [],
      cloudClassifications: [
        {
          latinName: 'Anolis',
          commonName: 'Anolis',
          confidence: 0.77,
          taxonGroup: 'animals',
        },
        {
          latinName: 'Iguana',
          commonName: 'Green Iguana',
          confidence: 0.15,
          taxonGroup: 'animals',
        },
      ],
    };
    const event = finalize(cloudReclassifyBuilder(ctx, raw)!);
    expect(event.payload.gemini_prediction).toMatchObject({
      predictions: expect.any(Array),
      top: { latin_name: 'Anolis' },
    });
    expect((event.payload.gemini_prediction as { predictions: unknown[] }).predictions).toHaveLength(2);
  });
});
