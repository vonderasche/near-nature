import { describe, expect, it } from 'vitest';

import sceneGateLabelsJson from '@/assets/tflite/preview_models/scene_gate/tflite/labels.json';
import kingdomLabelsJson from '@/assets/tflite/preview_models/kingdom/tflite/labels.json';

describe('MVP preview labels bundle', () => {
  it('loads scene gate organism / not_organism labels', () => {
    const labels = [...sceneGateLabelsJson.labels]
      .sort((a, b) => a.index - b.index)
      .map((entry) => entry.name);

    expect(labels).toHaveLength(2);
    expect(labels).toContain('organism');
    expect(labels).toContain('not_organism');
  });

  it('loads kingdom labels in index order', () => {
    const kingdoms = [...kingdomLabelsJson.labels]
      .sort((a, b) => a.index - b.index)
      .map((entry) => entry.name);

    expect(kingdoms).toContain('plantae');
    expect(kingdoms).toContain('animalia');
    expect(kingdoms).toContain('fungi');
  });
});
