import { describe, expect, it } from 'vitest';

import {
  routeAnimal,
  routeKingdom,
  routePlant,
  routeSpecialist,
  V5_NOT_IN_GUIDE,
} from '@/lib/camera/tflite/v5/v5Routing';

describe('routeKingdom', () => {
  it('returns plantae when confident', () => {
    expect(
      routeKingdom({
        not_organism: 0.05,
        plantae: 0.75,
        animalia: 0.1,
        fungi: 0.05,
        uncertain: 0.05,
      }),
    ).toBe('plantae');
  });

  it('stops on not_organism', () => {
    expect(
      routeKingdom({
        not_organism: 0.8,
        plantae: 0.05,
        animalia: 0.05,
        fungi: 0.05,
        uncertain: 0.05,
      }),
    ).toBe('stop');
  });
});

describe('routePlant', () => {
  it('rejects not_plant', () => {
    expect(
      routePlant({
        trees_shrubs: 0.1,
        wildflowers_herbs: 0.15,
        ferns_mosses: 0.1,
        not_plant: 0.65,
      }),
    ).toBe(V5_NOT_IN_GUIDE);
  });
});

describe('routeAnimal', () => {
  it('routes birds', () => {
    expect(
      routeAnimal({
        birds: 0.7,
        insects: 0.1,
        arachnids: 0.05,
        common_mammals: 0.05,
        not_animal: 0.1,
      }),
    ).toBe('birds');
  });
});

describe('routeSpecialist', () => {
  it('returns family when above threshold', () => {
    const result = routeSpecialist({ Fagaceae: 0.55, Pinaceae: 0.3 });
    expect(result.label).toBe('Fagaceae');
    expect(result.confidence).toBeCloseTo(0.55);
  });
});
