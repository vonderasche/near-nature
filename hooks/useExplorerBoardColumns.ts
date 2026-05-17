import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCallback, useEffect, useState } from 'react';

import {
  DEFAULT_EXPLORER_BOARD_COLUMNS,
  EXPLORER_BOARD_COLUMNS_STORAGE_KEY,
  parseExplorerBoardColumns,
  type ExplorerBoardColumns,
} from '@/lib/explorerBoard/explorerBoardColumns';

export function useExplorerBoardColumns() {
  const [columns, setColumns] = useState<ExplorerBoardColumns>(DEFAULT_EXPLORER_BOARD_COLUMNS);

  useEffect(() => {
    let cancelled = false;
    void AsyncStorage.getItem(EXPLORER_BOARD_COLUMNS_STORAGE_KEY).then((raw) => {
      if (!cancelled) setColumns(parseExplorerBoardColumns(raw));
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const setColumnCount = useCallback((next: ExplorerBoardColumns) => {
    setColumns(next);
    void AsyncStorage.setItem(EXPLORER_BOARD_COLUMNS_STORAGE_KEY, String(next));
  }, []);

  return { columns, setColumnCount };
}
