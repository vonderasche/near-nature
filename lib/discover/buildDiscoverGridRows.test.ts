import { describe, expect, it } from 'vitest';

import { buildDiscoverGridRows, type DiscoverGridItem } from '@/lib/discover/buildDiscoverGridRows';

function item(key: string): DiscoverGridItem {
  return {
    key,
    title: key,
    onPress: () => {},
    accessibilityLabel: key,
  };
}

describe('buildDiscoverGridRows', () => {
  it('chunks items into rows by column count', () => {
    const rows = buildDiscoverGridRows([item('a'), item('b'), item('c'), item('d'), item('e')], 2);
    expect(rows).toHaveLength(3);
    expect(rows[0]?.items.map((row) => row.key)).toEqual(['a', 'b']);
    expect(rows[1]?.items.map((row) => row.key)).toEqual(['c', 'd']);
    expect(rows[2]?.items.map((row) => row.key)).toEqual(['e']);
  });

  it('returns empty array for no items', () => {
    expect(buildDiscoverGridRows([], 4)).toEqual([]);
  });
});
