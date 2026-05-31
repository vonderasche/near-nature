/** Whether a reset load may hydrate from the global Explorer Board list cache. */
export function shouldLoadExplorerBoardFromCache(options: {
  mode: 'reset' | 'append';
  force: boolean;
  isInitial: boolean;
}): boolean {
  return options.mode === 'reset' && options.isInitial && !options.force;
}

/** Whether scroll-loaded rows should be written back to the global cache. */
export function shouldPersistExplorerBoardCache(): boolean {
  return true;
}
