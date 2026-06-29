import { describe, expect, it } from 'vitest';

import {
  SUB_TIER_SPECIES_THRESHOLDS,
  TIER_SPECIES_THRESHOLDS,
  subTierForSpeciesCount,
  tierForSpeciesCount,
} from '@/constants/naturalist-categories';
import { buildSpeciesCounts, milestonesForNewCounts } from '@/lib/points/categoryMilestones';

describe('categoryMilestones', () => {
  it('maps tier thresholds', () => {
    expect(tierForSpeciesCount(0)).toBeNull();
    expect(tierForSpeciesCount(TIER_SPECIES_THRESHOLDS.explorer - 1)).toBeNull();
    expect(tierForSpeciesCount(TIER_SPECIES_THRESHOLDS.explorer)).toBe('explorer');
    expect(tierForSpeciesCount(TIER_SPECIES_THRESHOLDS.adventurer)).toBe('adventurer');
    expect(tierForSpeciesCount(TIER_SPECIES_THRESHOLDS.voyager)).toBe('voyager');
    expect(subTierForSpeciesCount(0)).toBeNull();
    expect(subTierForSpeciesCount(SUB_TIER_SPECIES_THRESHOLDS.explorer - 1)).toBeNull();
    expect(subTierForSpeciesCount(SUB_TIER_SPECIES_THRESHOLDS.explorer)).toBe('explorer');
    expect(subTierForSpeciesCount(SUB_TIER_SPECIES_THRESHOLDS.voyager)).toBe('voyager');
  });

  it('awards main explorer once', () => {
    const counts = buildSpeciesCounts([
      { latin_name: 'Quercus alba', category: 'trees_shrubs' },
      ...Array.from({ length: 9 }, (_, i) => ({
        latin_name: `Species ${i}`,
        category: 'wildflowers',
      })),
    ]);
    const awards = milestonesForNewCounts(counts, new Set());
    expect(awards.some((a) => a.awardKey === 'main:botanist:explorer')).toBe(true);
    expect(awards.find((a) => a.awardKey === 'main:botanist:explorer')?.points).toBe(50);
  });

  it('awards subcategory explorer and main explorer at explorer threshold', () => {
    const counts = buildSpeciesCounts(
      Array.from({ length: TIER_SPECIES_THRESHOLDS.explorer }, (_, i) => ({
        latin_name: `Species ${i}`,
        category: 'wildflowers',
      })),
    );

    const awards = milestonesForNewCounts(counts, new Set());
    expect(awards.some((a) => a.awardKey === 'sub:wildflowers:explorer')).toBe(true);
    expect(awards.some((a) => a.awardKey === 'main:botanist:explorer')).toBe(true);
  });

  it('does not award subcategory explorer with zero species', () => {
    const counts = buildSpeciesCounts([]);

    const awards = milestonesForNewCounts(counts, new Set());
    expect(awards.some((a) => a.awardKey === 'sub:wildflowers:explorer')).toBe(false);
  });

  it('awards subcategory explorer at explorer threshold', () => {
    const counts = buildSpeciesCounts(
      Array.from({ length: SUB_TIER_SPECIES_THRESHOLDS.explorer }, (_, i) => ({
        latin_name: `Coreopsis species ${i}`,
        category: 'wildflowers',
      })),
    );

    const awards = milestonesForNewCounts(counts, new Set());
    expect(awards.some((a) => a.awardKey === 'sub:wildflowers:explorer')).toBe(true);
  });

  it('awards mammalogist true voyager at main discipline voyager only', () => {
    const rows = Array.from({ length: 50 }, (_, i) => ({
      latin_name: `Ursus ${i}`,
      category: 'small_mammals',
    }));

    const awards = milestonesForNewCounts(buildSpeciesCounts(rows), new Set());
    expect(awards.some((a) => a.awardKey === 'badge:true_voyager:mammalogist')).toBe(true);
  });
});
