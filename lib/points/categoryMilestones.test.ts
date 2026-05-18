import { describe, expect, it } from 'vitest';

import { tierForSpeciesCount } from '@/constants/naturalist-categories';
import { buildSpeciesCounts, milestonesForNewCounts } from '@/lib/points/categoryMilestones';

describe('categoryMilestones', () => {
  it('maps tier thresholds', () => {
    expect(tierForSpeciesCount(9)).toBeNull();
    expect(tierForSpeciesCount(10)).toBe('explorer');
    expect(tierForSpeciesCount(50)).toBe('voyager');
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
});
