export const EXPLORER_BOARD_COLUMN_OPTIONS = [1, 2, 4] as const;

export type ExplorerBoardColumns = (typeof EXPLORER_BOARD_COLUMN_OPTIONS)[number];

export const DEFAULT_EXPLORER_BOARD_COLUMNS: ExplorerBoardColumns = 2;

export const EXPLORER_BOARD_COLUMNS_STORAGE_KEY = '@near_nature/explorer_board_columns';

export function isExplorerBoardColumns(n: number): n is ExplorerBoardColumns {
  return (EXPLORER_BOARD_COLUMN_OPTIONS as readonly number[]).includes(n);
}

export function parseExplorerBoardColumns(raw: string | null | undefined): ExplorerBoardColumns {
  const n = Number(raw);
  return isExplorerBoardColumns(n) ? n : DEFAULT_EXPLORER_BOARD_COLUMNS;
}

export function explorerBoardLayoutAccessibilityLabel(columns: ExplorerBoardColumns): string {
  return columns === 1 ? '1 per row' : `${columns} per row`;
}

export function minExplorerBoardTileSize(columns: ExplorerBoardColumns): number {
  switch (columns) {
    case 1:
      return 160;
    case 2:
      return 120;
    case 4:
      return 72;
    default:
      return 120;
  }
}

/** Off-screen draw distance (dp) for nested Explorer Board FlashList. */
export const EXPLORER_BOARD_FLASH_LIST_DRAW_DISTANCE = 560;
