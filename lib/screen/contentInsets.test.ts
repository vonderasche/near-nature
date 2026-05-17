import { describe, expect, it } from 'vitest';

import { spacing } from '@/constants/design-tokens';
import { bottomToolbarPadding, contentInsetsPadding } from '@/lib/screen/contentInsets';

describe('contentInsetsPadding', () => {
  it('adds auth spacing to top and bottom insets', () => {
    const p = contentInsetsPadding({ top: 44, bottom: 34 });
    expect(p.paddingTop).toBe(44 + spacing.sm);
    expect(p.paddingBottom).toBe(34 + spacing.sm);
  });
});

describe('bottomToolbarPadding', () => {
  it('uses the larger of inset bottom and minimum padding', () => {
    expect(bottomToolbarPadding({ bottom: 0 }).paddingBottom).toBe(spacing.md);
    expect(bottomToolbarPadding({ bottom: 40 }).paddingBottom).toBe(40);
  });
});
