import { describe, expect, it } from 'vitest';

import {
  routeAnimal,
  routeKingdom,
  routePlant,
  routePlantTopOutput,
  routeSpecialist,
  V5_NOT_IN_GUIDE,
} from '@/lib/camera/tflite/v5/v5Routing';

describe('routeKingdom', () => {
  it('returns plantae at 55% kingdom threshold', () => {
    expect(
      routeKingdom({
        not_organism: 0.05,
        plantae: 0.56,
        animalia: 0.1,
        fungi: 0.05,
        uncertain: 0.24,
      }),
    ).toBe('plantae');
  });

  it('rejects kingdom below 55%', () => {
    expect(
      routeKingdom({
        not_organism: 0.05,
        plantae: 0.54,
        animalia: 0.1,
        fungi: 0.05,
        uncertain: 0.26,
      }),
    ).toBe(V5_NOT_IN_GUIDE);
  });

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

describe('routePlantTopOutput', () => {
  it('selects top plant group without a confidence gate', () => {
    expect(
      routePlantTopOutput({
        trees_shrubs: 0.31,
        wildflowers_herbs: 0.29,
        ferns_mosses: 0.25,
        coontie: 0.15,
      }),
    ).toBe('trees_shrubs');
  });

  it('rejects not_plant', () => {
    expect(
      routePlantTopOutput({
        trees_shrubs: 0.1,
        wildflowers_herbs: 0.15,
        ferns_mosses: 0.1,
        not_plant: 0.65,
      }),
    ).toBe(V5_NOT_IN_GUIDE);
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
