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
    expect(result.predictions[0]?.label).toBe('Looks like a plant');
    expect(result.predictions[0]?.detail).toBe('88% confident');
  });

  it('shows maybe copy when top score is below confident threshold', () => {
    const result = mapKingdomPreviewPredictions([
      { label: 'animalia', confidence: 0.62 },
      { label: 'plantae', confidence: 0.15 },
    ]);
    expect(result.organismDetected).toBe(false);
    expect(result.predictions[0]?.label).toBe('Might be an animal');
    expect(result.predictions[0]?.detail).toBe('62% — hold steady');
  });

  it('shows maybe when margin is too small for a confident call', () => {
    const result = mapKingdomPreviewPredictions([
      { label: 'animalia', confidence: 0.82 },
      { label: 'plantae', confidence: 0.72 },
    ]);
    expect(result.organismDetected).toBe(false);
    expect(result.predictions[0]?.label).toBe('Might be an animal');
    expect(result.predictions[0]?.detail).toBe('82% — hold steady');
  });

  it('rejects not_organism class for kingdom head', () => {
    expect(
      isKingdomPreviewConfident([{ label: 'not_organism', confidence: 0.95 }]),
    ).toBe(false);
    const result = mapKingdomPreviewPredictions([
      { label: 'not_organism', confidence: 0.95 },
      { label: 'plantae', confidence: 0.03 },
    ]);
    expect(result.organismDetected).toBe(false);
    expect(result.predictions[0]?.label).toBe('No subject found');
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
