/** Device cache key (legacy AsyncStorage; native uses SQLite global cache table). */
export const FLORIDA_PARKS_CACHE_KEY = 'near_nature:florida_state_parks';

export const FLORIDA_PARKS_CACHE_VERSION = 1;

export type FloridaParksCacheVersion = typeof FLORIDA_PARKS_CACHE_VERSION;

/** Bundled CSV changes only on app release — avoid reparsing on every stale window. */
export const FLORIDA_PARKS_CACHE_MAX_AGE_MS = 30 * 24 * 60 * 60 * 1000;
