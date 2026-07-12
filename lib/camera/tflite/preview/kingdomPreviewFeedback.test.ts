import { describe, expect, it } from 'vitest';

import {
  buildKingdomPreviewFeedback,
  formatPreviewConfidencePercent,
  isKingdomPreviewConfident,
  resolveKingdomPreviewDisplayState,
} from '@/lib/camera/tflite/preview/kingdomPreviewFeedback';

describe('formatPreviewConfidencePercent', () => {
  it('rounds softmax probability to a whole percent', () => {
    expect(formatPreviewConfidencePercent(0.876)).toBe('88%');
  });
});

describe('buildKingdomPreviewFeedback', () => {
  it('shows confident plant copy at 65% live preview threshold', () => {
    const feedback = buildKingdomPreviewFeedback(
      [
        { label: 'plantae', confidence: 0.68 },
        { label: 'animalia', confidence: 0.08 },
      ],
      'searching',
    );
    expect(feedback.headline).toBe('Looks like a plant');
    expect(feedback.detail).toBe('68% confident');
    expect(feedback.tier).toBe('confident');
  });

  it('shows confident plant copy with percent', () => {
    const feedback = buildKingdomPreviewFeedback(
      [
        { label: 'plantae', confidence: 0.88 },
        { label: 'animalia', confidence: 0.08 },
      ],
      'searching',
    );
    expect(feedback.headline).toBe('Looks like a plant');
    expect(feedback.detail).toBe('88% confident');
    expect(feedback.tier).toBe('confident');
    expect(feedback.organismDetected).toBe(true);
  });

  it('shows maybe animal copy below confident threshold', () => {
    const feedback = buildKingdomPreviewFeedback(
      [
        { label: 'animalia', confidence: 0.62 },
        { label: 'plantae', confidence: 0.2 },
      ],
      'searching',
    );
    expect(feedback.headline).toBe('Might be an animal');
    expect(feedback.detail).toBe('62% — hold steady');
    expect(feedback.tier).toBe('maybe');
  });

  it('shows keep searching with class hints when signal is weak', () => {
    const feedback = buildKingdomPreviewFeedback(
      [
        { label: 'animalia', confidence: 0.38 },
        { label: 'plantae', confidence: 0.35 },
      ],
      'searching',
    );
    expect(feedback.headline).toBe('Keep searching');
    expect(feedback.detail).toContain('Plant 35%');
    expect(feedback.detail).toContain('Animal 38%');
  });

  it('shows no subject when not_organism dominates', () => {
    const feedback = buildKingdomPreviewFeedback(
      [
        { label: 'not_organism', confidence: 0.91 },
        { label: 'plantae', confidence: 0.05 },
      ],
      'searching',
    );
    expect(feedback.headline).toBe('No subject found');
    expect(feedback.detail).toContain('Move closer');
  });

  it('resets hysteresis when the dominant organism class changes', () => {
    const plant = buildKingdomPreviewFeedback(
      [
        { label: 'plantae', confidence: 0.88 },
        { label: 'animalia', confidence: 0.08 },
      ],
      'searching',
      null,
    );
    expect(plant.tier).toBe('confident');

    const animal = buildKingdomPreviewFeedback(
      [
        { label: 'animalia', confidence: 0.86 },
        { label: 'plantae', confidence: 0.07 },
      ],
      'confident',
      'plantae',
    );
    expect(animal.headline).toBe('Looks like an animal');
  });
});

describe('isKingdomPreviewConfident', () => {
  it('requires threshold and margin', () => {
    expect(
      isKingdomPreviewConfident([
        { label: 'animalia', confidence: 0.82 },
        { label: 'plantae', confidence: 0.72 },
      ]),
    ).toBe(false);
  });
});

describe('resolveKingdomPreviewDisplayState', () => {
  it('latches confident tier until release threshold', () => {
    expect(resolveKingdomPreviewDisplayState(0.4, false, 'confident')).toBe('confident');
    expect(resolveKingdomPreviewDisplayState(0.3, false, 'confident')).toBe('searching');
  });
});
