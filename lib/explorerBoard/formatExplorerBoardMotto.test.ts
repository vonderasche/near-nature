import { describe, expect, it } from 'vitest';

import { parseExplorerBoardMotto } from '@/lib/explorerBoard/formatExplorerBoardMotto';

describe('parseExplorerBoardMotto', () => {
  it('returns trimmed motto', () => {
    expect(parseExplorerBoardMotto('  Leave no trace.  ')).toBe('Leave no trace.');
  });

  it('returns null for empty or whitespace', () => {
    expect(parseExplorerBoardMotto('')).toBeNull();
    expect(parseExplorerBoardMotto('   ')).toBeNull();
    expect(parseExplorerBoardMotto(null)).toBeNull();
    expect(parseExplorerBoardMotto(undefined)).toBeNull();
  });
});
