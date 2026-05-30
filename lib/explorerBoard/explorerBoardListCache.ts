import {
  EXPLORER_BOARD_LIST_CACHE_KEY,
  EXPLORER_BOARD_LIST_CACHE_VERSION,
} from '@/constants/explorer-board-cache';
import {
  clearDualStorageEntry,
  loadDualStorageJson,
  saveDualStorageJson,
} from '@/lib/db/dualStorageJsonCache';
import { deleteGlobalCache, loadGlobalCacheJson, saveGlobalCacheJson } from '@/lib/db/globalCacheRepository';
import type { ExplorerBoardMemberRow } from '@/lib/explorerBoard/explorerBoardMemberMap';
import {
  parseCachedExplorerBoardList,
  type CachedExplorerBoardList,
} from '@/lib/explorerBoard/explorerBoardListCacheParse';

export type { CachedExplorerBoardList } from '@/lib/explorerBoard/explorerBoardListCacheParse';
export { parseCachedExplorerBoardList } from '@/lib/explorerBoard/explorerBoardListCacheParse';

export async function loadCachedExplorerBoardList(): Promise<CachedExplorerBoardList | null> {
  return loadDualStorageJson({
    loadSqliteJson: () => loadGlobalCacheJson(EXPLORER_BOARD_LIST_CACHE_KEY),
    asyncStorageKey: EXPLORER_BOARD_LIST_CACHE_KEY,
    parse: parseCachedExplorerBoardList,
    migrateSqlite: (json) => {
      const parsed = parseCachedExplorerBoardList(json);
      if (!parsed) return Promise.resolve();
      return saveGlobalCacheJson(
        EXPLORER_BOARD_LIST_CACHE_KEY,
        json,
        parsed.cachedAt,
        EXPLORER_BOARD_LIST_CACHE_VERSION,
      );
    },
  });
}

export async function saveCachedExplorerBoardList(payload: {
  rows: readonly ExplorerBoardMemberRow[];
  hasMore: boolean;
}): Promise<void> {
  const entry: CachedExplorerBoardList = {
    v: EXPLORER_BOARD_LIST_CACHE_VERSION,
    rows: [...payload.rows],
    hasMore: payload.hasMore,
    cachedAt: Date.now(),
  };
  const json = JSON.stringify(entry);

  await saveDualStorageJson({
    asyncStorageKey: EXPLORER_BOARD_LIST_CACHE_KEY,
    json,
    saveSqlite: () =>
      saveGlobalCacheJson(
        EXPLORER_BOARD_LIST_CACHE_KEY,
        json,
        entry.cachedAt,
        EXPLORER_BOARD_LIST_CACHE_VERSION,
      ),
  });
}

export async function invalidateCachedExplorerBoardList(): Promise<void> {
  await clearDualStorageEntry({
    asyncStorageKey: EXPLORER_BOARD_LIST_CACHE_KEY,
    clearSqlite: () => deleteGlobalCache(EXPLORER_BOARD_LIST_CACHE_KEY),
  });
}
