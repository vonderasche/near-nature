export const EXPLORER_BOARD_LAYOUT_OPTIONS = ['list', 'grid'] as const;

export type ExplorerBoardLayoutMode = (typeof EXPLORER_BOARD_LAYOUT_OPTIONS)[number];

export const DEFAULT_EXPLORER_BOARD_LAYOUT: ExplorerBoardLayoutMode = 'grid';

export const EXPLORER_BOARD_LAYOUT_STORAGE_KEY = '@near_nature/explorer_board_layout';

export function parseExplorerBoardLayoutMode(raw: string | null | undefined): ExplorerBoardLayoutMode {
  return raw === 'list' ? 'list' : DEFAULT_EXPLORER_BOARD_LAYOUT;
}

export function explorerBoardLayoutLabel(mode: ExplorerBoardLayoutMode): string {
  return mode === 'grid' ? 'Image grid' : 'List';
}
