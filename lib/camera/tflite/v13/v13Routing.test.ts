import { describe, expect, it } from 'vitest';

import {
  routeAnimal,
  routeKingdom,
  routePlantTopOutput,
  routeSpecialist,
  V13_NOT_IN_GUIDE,
} from '@/lib/camera/tflite/v13/v13Routing';

describe('v13Routing', () => {
  it('routes kingdom to plantae when confident', () => {
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

  it('routes plant router to top output even below 50%', () => {
    expect(
      routePlantTopOutput({
        trees_shrubs: 0.31,
        wildflowers_herbs: 0.29,
        ferns_mosses: 0.25,
        coontie: 0.15,
      }),
    ).toBe('trees_shrubs');
  });

  it('routes plant router to coontie', () => {
    expect(
      routePlantTopOutput({
        trees_shrubs: 0.1,
        wildflowers_herbs: 0.15,
        ferns_mosses: 0.1,
        coontie: 0.65,
      }),
    ).toBe('coontie');
  });

  it('routes animal router to wild_mammals', () => {
    expect(
      routeAnimal({
        birds: 0.1,
        wild_mammals: 0.7,
        domestic_mammals: 0.05,
        not_animal: 0.1,
      }),
    ).toBe('wild_mammals');
  });

  it('returns NOT_IN_GUIDE when specialist confidence is low', () => {
    const result = routeSpecialist({ Fagaceae: 0.3, Pinaceae: 0.2 });
    expect(result.label).toBe(V13_NOT_IN_GUIDE);
  });
});
