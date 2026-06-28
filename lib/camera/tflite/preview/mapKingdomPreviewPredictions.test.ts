import { describe, expect, it } from 'vitest';

import {
  isKingdomPreviewConfident,
  mapKingdomPreviewPredictions,
} from '@/lib/camera/tflite/preview/mapKingdomPreviewPredictions';

describe('mapKingdomPreviewPredictions', () => {
  it('accepts a clear plant call', () => {
    const result = mapKingdomPreviewPredictions([
      { label: 'plantae', confidence: 0.88 },
      { label: 'animalia', confidence: 0.08 },
      { label: 'fungi', confidence: 0.03 },
      { label: 'uncertain', confidence: 0.01 },
    ]);
    expect(result.organismDetected).toBe(true);
    expect(result.predictions[0]?.label).toBe('Plant');
  });

  it('shows Uncertain when top score is below threshold', () => {
    const result = mapKingdomPreviewPredictions([
      { label: 'animalia', confidence: 0.72 },
      { label: 'plantae', confidence: 0.15 },
    ]);
    expect(result.organismDetected).toBe(false);
    expect(result.predictions[0]?.label).toBe('Uncertain');
  });

  it('shows Uncertain when margin over second place is too small', () => {
    const result = mapKingdomPreviewPredictions([
      { label: 'animalia', confidence: 0.82 },
      { label: 'plantae', confidence: 0.72 },
    ]);
    expect(result.organismDetected).toBe(false);
    expect(result.predictions[0]?.label).toBe('Uncertain');
  });

  it('rejects uncertain class even above threshold', () => {
    expect(
      isKingdomPreviewConfident([{ label: 'uncertain', confidence: 0.95 }]),
    ).toBe(false);
  });

  it('accepts when threshold and margin are both met', () => {
    expect(
      isKingdomPreviewConfident([
        { label: 'animalia', confidence: 0.82 },
        { label: 'plantae', confidence: 0.05 },
      ]),
    ).toBe(true);
  });
});
