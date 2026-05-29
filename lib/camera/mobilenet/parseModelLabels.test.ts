import { describe, expect, it } from 'vitest';

import { buildLabelLookup, getLabelAtIndex } from '@/lib/camera/mobilenet/parseModelLabels';

describe('parseModelLabels', () => {
  it('builds a lookup table from sparse label json', () => {
    const lookup = buildLabelLookup({
      labels: [
        { index: 0, name: 'Asclepias' },
        { index: 2, name: 'Quercus' },
      ],
    });
    expect(lookup[0]).toBe('Asclepias');
    expect(lookup[1]).toBe('Class 1');
    expect(getLabelAtIndex(lookup, 2)).toBe('Quercus');
  });
});
