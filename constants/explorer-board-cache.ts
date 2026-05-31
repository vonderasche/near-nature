/** Device cache key (legacy AsyncStorage; native uses SQLite global cache table). */
export const EXPLORER_BOARD_LIST_CACHE_KEY = 'near_nature:explorer_board_list';

export const EXPLORER_BOARD_LIST_CACHE_VERSION = 1;

export type ExplorerBoardListCacheVersion = typeof EXPLORER_BOARD_LIST_CACHE_VERSION;

/** Cap cached leaderboard length so scroll-loaded pages do not grow without bound. */
export const EXPLORER_BOARD_LIST_CACHE_MAX_ROWS = 120;
