import { describe, expect, it } from 'vitest';

import { mapRawPredictions } from '@/lib/camera/tflite/tfliteClassification';

describe('mapRawPredictions', () => {
  const labels = ['not_organism', 'organism'];

  it('uses softmax outputs as probabilities without re-softmaxing', () => {
    const predictions = mapRawPredictions(
      [
        { index: 0, score: 0.08 },
        { index: 1, score: 0.92 },
      ],
      labels,
      { confidenceMode: 'probability', directLabelIndex: true },
    );

    expect(predictions[0]?.label).toBe('organism');
    expect(predictions[0]?.confidence).toBeCloseTo(0.92, 5);
  });

  it('double-softmax crushes organism confidence below the preview threshold', () => {
    const predictions = mapRawPredictions(
      [
        { index: 0, score: 0.1 },
        { index: 1, score: 0.9 },
      ],
      labels,
      { confidenceMode: 'softmax', directLabelIndex: true },
    );

    const organism = predictions.find((row) => row.label === 'organism');
    expect(organism?.confidence ?? 0).toBeLessThan(0.7);
  });
});
