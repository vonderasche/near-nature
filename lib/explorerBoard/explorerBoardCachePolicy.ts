import { isSearchQueryActive } from '@/lib/search/normalizeSearchQuery';

/** Whether a reset load may hydrate from the global Explorer Board list cache. */
export function shouldLoadExplorerBoardFromCache(options: {
  mode: 'reset' | 'append';
  force: boolean;
  isInitial: boolean;
  searchQuery: string;
}): boolean {
  return (
    options.mode === 'reset' &&
    options.isInitial &&
    !options.force &&
    !isSearchQueryActive(options.searchQuery)
  );
}

/** Whether scroll-loaded rows should be written back to the global cache. */
export function shouldPersistExplorerBoardCache(searchQuery: string): boolean {
  return !isSearchQueryActive(searchQuery);
}
