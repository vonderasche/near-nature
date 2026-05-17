import { describe, expect, it } from 'vitest';

import {
  DEFAULT_EXPLORER_BOARD_COLUMNS,
  parseExplorerBoardColumns,
} from '@/lib/explorerBoard/explorerBoardColumns';

describe('parseExplorerBoardColumns', () => {
  it('accepts 1, 2, and 4', () => {
    expect(parseExplorerBoardColumns('1')).toBe(1);
    expect(parseExplorerBoardColumns('4')).toBe(4);
  });

  it('falls back to default for gallery-only values', () => {
    expect(parseExplorerBoardColumns('8')).toBe(DEFAULT_EXPLORER_BOARD_COLUMNS);
    expect(parseExplorerBoardColumns(null)).toBe(DEFAULT_EXPLORER_BOARD_COLUMNS);
  });
});
