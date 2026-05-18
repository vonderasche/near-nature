import { describe, expect, it } from 'vitest';

import { buildMainCategoryProgress } from '@/lib/profile/buildCategoryProgress';

describe('buildMainCategoryProgress', () => {
  it('maps server sub/main counts into discipline progress', () => {
    const mains = buildMainCategoryProgress(
      [{ id: 'songbirds', speciesCount: 12 }],
      [{ id: 'ornithologist', speciesCount: 12 }],
    );

    const ornithologist = mains.find((m) => m.id === 'ornithologist');
    expect(ornithologist?.speciesCount).toBe(12);
    expect(ornithologist?.tier).toBe('explorer');

    const songbirds = ornithologist?.subcategories.find((s) => s.id === 'songbirds');
    expect(songbirds?.speciesCount).toBe(12);
    expect(songbirds?.tier).toBe('explorer');
  });
});
