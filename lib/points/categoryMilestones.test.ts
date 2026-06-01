import { describe, expect, it } from 'vitest';

import { subTierForSpeciesCount, tierForSpeciesCount } from '@/constants/naturalist-categories';
import { buildSpeciesCounts, milestonesForNewCounts } from '@/lib/points/categoryMilestones';

describe('categoryMilestones', () => {
  it('maps tier thresholds', () => {
    expect(tierForSpeciesCount(0)).toBeNull();
    expect(tierForSpeciesCount(1)).toBe('voyager');
    expect(subTierForSpeciesCount(0)).toBeNull();
    expect(subTierForSpeciesCount(1)).toBe('voyager');
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

  it('awards subcategory explorer and main explorer at one species', () => {
    const counts = buildSpeciesCounts([
      { latin_name: 'Species 1', category: 'wildflowers' },
    ]);

    const awards = milestonesForNewCounts(counts, new Set());
    expect(awards.some((a) => a.awardKey === 'sub:wildflowers:explorer')).toBe(true);
    expect(awards.some((a) => a.awardKey === 'main:botanist:explorer')).toBe(true);
  });

  it('does not award subcategory explorer with zero species', () => {
    const counts = buildSpeciesCounts([]);

    const awards = milestonesForNewCounts(counts, new Set());
    expect(awards.some((a) => a.awardKey === 'sub:wildflowers:explorer')).toBe(false);
  });

  it('awards subcategory explorer with one distinct species', () => {
    const counts = buildSpeciesCounts([
      { latin_name: 'Coreopsis leavenworthii', category: 'wildflowers' },
    ]);

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
