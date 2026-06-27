/** Device cache key (legacy AsyncStorage; native uses SQLite global cache table). */
export const FLORIDA_PARKS_CACHE_KEY = 'near_nature:florida_state_parks';

export const FLORIDA_PARKS_CACHE_VERSION = 2;

export type FloridaParksCacheVersion = typeof FLORIDA_PARKS_CACHE_VERSION;

/** Device cache TTL — when stale, Discover refetches from Supabase (CSV fallback offline). */
export const FLORIDA_PARKS_CACHE_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;
