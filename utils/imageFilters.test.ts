import { describe, expect, it } from 'vitest';

import {
  deduplicateByLatinName,
  filterByConfidence,
  filterClassifications,
} from '@/utils/imageFilters';
import type { ClassificationResult } from '@/types';

function classification(
  latinName: string,
  commonName: string,
  confidence: number,
): ClassificationResult {
  return {
    latinName,
    commonName,
    confidence,
    taxonGroup: 'plants',
    boundingBox: { x: 0, y: 0, width: 1, height: 1 },
  };
}

describe('filterByConfidence', () => {
  it('drops results below the threshold', () => {
    const raw = [
      classification('Aaa aaa', 'A', 0.9),
      classification('Bbb bbb', 'B', 0.5),
    ];
    const kept = filterByConfidence(raw, 0.65);
    expect(kept).toHaveLength(1);
    expect(kept[0].latinName).toBe('Aaa aaa');
  });
});

describe('deduplicateByLatinName', () => {
  it('keeps the highest-confidence row per Latin name (case-insensitive)', () => {
    const raw = [
      classification('Danaus plexippus', 'Monarch', 0.7),
      classification('danaus plexippus', 'Monarch butterfly', 0.85),
    ];
    const out = deduplicateByLatinName(raw);
    expect(out).toHaveLength(1);
    expect(out[0].commonName).toBe('Monarch butterfly');
    expect(out[0].confidence).toBe(0.85);
  });
});

describe('filterClassifications', () => {
  it('returns summary counts matching confidence + dedupe', () => {
    const raw = [
      classification('X x', 'X', 0.9),
      classification('Y y', 'Y', 0.4),
      classification('x x', 'X dup', 0.95),
    ];
    const { results, summary } = filterClassifications(raw, 0.65);
    expect(summary.total).toBe(3);
    expect(summary.kept).toBe(results.length);
    expect(summary.dropped).toBe(summary.total - summary.kept);
    expect(results.some((r) => r.latinName === 'Y y')).toBe(false);
    expect(results.filter((r) => r.latinName.toLowerCase().startsWith('x'))).toHaveLength(1);
  });
});
