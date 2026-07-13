import { describe, expect, it } from 'vitest';

import { parseThemeName } from '@/constants/theme-preferences';

describe('parseThemeName', () => {
  it('returns valid persisted themes', () => {
    expect(parseThemeName('forestLight')).toBe('forestLight');
    expect(parseThemeName('light')).toBe('light');
  });

  it('migrates removed themes to the closest remaining theme', () => {
    expect(parseThemeName('forestDark')).toBe('dark');
    expect(parseThemeName('forestMeadow')).toBe('forestLight');
    expect(parseThemeName('forestNight')).toBe('dark');
    expect(parseThemeName('neutralGray')).toBe('dark');
  });

  it('falls back to dark for unknown values', () => {
    expect(parseThemeName(null)).toBe('dark');
    expect(parseThemeName('not-a-theme')).toBe('dark');
  });
});
