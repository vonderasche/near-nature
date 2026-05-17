import {
  DEFAULT_EXPLORER_BOARD_LAYOUT,
  EXPLORER_BOARD_LAYOUT_STORAGE_KEY,
  parseExplorerBoardLayoutMode,
  type ExplorerBoardLayoutMode,
} from '@/lib/explorerBoard/explorerBoardLayout';
import { usePersistedPreference } from '@/hooks/usePersistedPreference';

export function useExplorerBoardLayout() {
  const { value: layoutMode, setValue: setLayout } = usePersistedPreference<ExplorerBoardLayoutMode>(
    EXPLORER_BOARD_LAYOUT_STORAGE_KEY,
    parseExplorerBoardLayoutMode,
    DEFAULT_EXPLORER_BOARD_LAYOUT,
  );
  return { layoutMode, setLayout };
}
