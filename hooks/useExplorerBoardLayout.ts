import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCallback, useEffect, useState } from 'react';

import {
  DEFAULT_EXPLORER_BOARD_LAYOUT,
  EXPLORER_BOARD_LAYOUT_STORAGE_KEY,
  parseExplorerBoardLayoutMode,
  type ExplorerBoardLayoutMode,
} from '@/lib/explorerBoard/explorerBoardLayout';

export function useExplorerBoardLayout() {
  const [layoutMode, setLayoutMode] = useState<ExplorerBoardLayoutMode>(DEFAULT_EXPLORER_BOARD_LAYOUT);

  useEffect(() => {
    let cancelled = false;
    void AsyncStorage.getItem(EXPLORER_BOARD_LAYOUT_STORAGE_KEY).then((raw) => {
      if (!cancelled) setLayoutMode(parseExplorerBoardLayoutMode(raw));
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const setLayout = useCallback((mode: ExplorerBoardLayoutMode) => {
    setLayoutMode(mode);
    void AsyncStorage.setItem(EXPLORER_BOARD_LAYOUT_STORAGE_KEY, mode);
  }, []);

  return { layoutMode, setLayout };
}
