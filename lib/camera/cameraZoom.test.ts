import { describe, expect, it } from 'vitest';

import { buildZoomChips, clampZoom, findActiveZoomChipId } from './cameraZoom';

const device = {
  minZoom: 1,
  maxZoom: 10,
  neutralZoom: 1,
} as Parameters<typeof buildZoomChips>[0];

describe('cameraZoom', () => {
  it('builds 1× 2× 5× chips when in range', () => {
    const chips = buildZoomChips(device);
    expect(chips.map((c) => c.label)).toEqual(['1×', '2×', '5×']);
  });

  it('clamps zoom to device bounds', () => {
    expect(clampZoom(99, device)).toBe(10);
    expect(clampZoom(0.5, device)).toBe(1);
  });

  it('picks nearest active chip', () => {
    const chips = buildZoomChips(device);
    expect(findActiveZoomChipId(chips, 2.02)).toBe('x2');
  });
});
