import { describe, expect, it } from 'vitest';

import { authSpacing } from '@/constants/auth-theme';
import { bottomToolbarPadding, contentInsetsPadding } from '@/lib/screen/contentInsets';

describe('contentInsetsPadding', () => {
  it('adds auth spacing to top and bottom insets', () => {
    const p = contentInsetsPadding({ top: 44, bottom: 34 });
    expect(p.paddingTop).toBe(44 + authSpacing.sm);
    expect(p.paddingBottom).toBe(34 + authSpacing.sm);
  });
});

describe('bottomToolbarPadding', () => {
  it('uses the larger of inset bottom and minimum padding', () => {
    expect(bottomToolbarPadding({ bottom: 0 }).paddingBottom).toBe(authSpacing.md);
    expect(bottomToolbarPadding({ bottom: 40 }).paddingBottom).toBe(40);
  });
});
