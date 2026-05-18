import { describe, expect, it } from 'vitest';

import { buildZoomChips, clampZoom, findActiveZoomChipId } from './cameraZoom';

const wideDevice = {
  minZoom: 1,
  maxZoom: 10,
  neutralZoom: 1,
} as Parameters<typeof buildZoomChips>[0];

const fixedDevice = {
  minZoom: 1,
  maxZoom: 1,
  neutralZoom: 1,
} as Parameters<typeof buildZoomChips>[0];

describe('cameraZoom', () => {
  it('always builds 1× 2× 5× chips on capable hardware', () => {
    const chips = buildZoomChips(wideDevice);
    expect(chips.map((c) => c.label)).toEqual(['1×', '2×', '5×']);
    expect(chips.map((c) => c.zoom)).toEqual([1, 2, 5]);
  });

  it('still shows three chips when maxZoom is 1 (emulator / fixed lens)', () => {
    const chips = buildZoomChips(fixedDevice);
    expect(chips.map((c) => c.label)).toEqual(['1×', '2×', '5×']);
    expect(chips.every((c) => c.zoom === 1)).toBe(true);
  });

  it('clamps zoom to device bounds', () => {
    expect(clampZoom(99, wideDevice)).toBe(10);
    expect(clampZoom(0.5, wideDevice)).toBe(1);
  });

  it('picks active chip by display multiplier', () => {
    const chips = buildZoomChips(wideDevice);
    expect(findActiveZoomChipId(chips, 2.02, wideDevice)).toBe('x2');
  });
});
