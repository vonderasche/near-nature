import { describe, expect, it } from 'vitest';

import {
  DEFAULT_EXPLORER_BOARD_LAYOUT,
  parseExplorerBoardLayoutMode,
} from '@/lib/explorerBoard/explorerBoardLayout';

describe('parseExplorerBoardLayoutMode', () => {
  it('parses list and grid', () => {
    expect(parseExplorerBoardLayoutMode('list')).toBe('list');
    expect(parseExplorerBoardLayoutMode('grid')).toBe('grid');
    expect(parseExplorerBoardLayoutMode(null)).toBe(DEFAULT_EXPLORER_BOARD_LAYOUT);
  });
});
