import { describe, expect, it } from 'vitest';

import { rollupSpeciesScoresToGenusTop3 } from '@/lib/camera/mobilenet/birdsSpeciesRollup';

describe('rollupSpeciesScoresToGenusTop3', () => {
  it('aggregates species logits into genus scores', () => {
    const rollup = {
      strategy: 'sum_species_probs',
      speciesCount: 4,
      genusCount: 2,
      speciesToGenus: [0, 0, 1, 1],
    };
    const logits = new Float32Array([2, 1, 0.5, 0.5]);
    const top = rollupSpeciesScoresToGenusTop3(logits.buffer, rollup);
    expect(top[0]?.classIndex).toBe(0);
    expect(top[0]?.confidence).toBeGreaterThan(top[1]?.confidence ?? 0);
  });
});
