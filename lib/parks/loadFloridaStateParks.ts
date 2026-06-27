import { Asset } from 'expo-asset';

import floridaStateParksCsv from '@/assets/data/florida_state_parks.csv';
import { devLog } from '@/lib/devLog';
import {
  loadCachedFloridaStateParksEntry,
  saveCachedFloridaStateParks,
} from '@/lib/parks/floridaStateParksCache';
import { parseFloridaStateParksCsv } from '@/lib/parks/parseFloridaStateParksCsv';
import { fetchFloridaStateParksFromSupabase } from '@/services/floridaStateParksService';
import type { FloridaStatePark } from '@/types/florida-state-park';

let cachedParks: FloridaStatePark[] | null = null;
let loadPromise: Promise<FloridaStatePark[]> | null = null;

async function readBundledCsvText(): Promise<string> {
  const asset = Asset.fromModule(floridaStateParksCsv);
  if (!asset.downloaded) {
    await asset.downloadAsync();
  }

  const uri = asset.localUri ?? asset.uri;
  const response = await fetch(uri);
  if (!response.ok) {
    throw new Error(`Failed to load Florida state parks data (${response.status}).`);
  }
  return response.text();
}

export function setInMemoryFloridaStateParks(parks: readonly FloridaStatePark[]): void {
  cachedParks = [...parks];
}

export function clearInMemoryFloridaStateParks(): void {
  cachedParks = null;
  loadPromise = null;
}

/** Load parks from bundled CSV, persist to device cache, and hydrate in-memory cache. */
export async function loadFloridaStateParksFromBundledCsv(): Promise<FloridaStatePark[]> {
  if (cachedParks) return cachedParks;
  if (loadPromise) return loadPromise;

  loadPromise = readBundledCsvText()
    .then((csvText) => {
      const parks = parseFloridaStateParksCsv(csvText);
      cachedParks = parks;
      void saveCachedFloridaStateParks(parks).catch(() => {});
      return parks;
    })
    .finally(() => {
      loadPromise = null;
    });

  return loadPromise;
}

/** Pull full catalog from Supabase and persist to device cache. */
export async function loadFloridaStateParksFromSupabase(): Promise<FloridaStatePark[]> {
  const parks = await fetchFloridaStateParksFromSupabase();
  if (parks.length === 0) {
    throw new Error('Florida state parks catalog is empty in Supabase.');
  }

  cachedParks = parks;
  void saveCachedFloridaStateParks(parks).catch(() => {});
  return parks;
}

/**
 * Prefer Supabase (cloud). On failure, reuse the last good device cache.
 * Bundled CSV is dev-only when cloud and cache are both unavailable.
 */
export async function loadFloridaStateParksFresh(): Promise<FloridaStatePark[]> {
  clearInMemoryFloridaStateParks();

  try {
    const parks = await loadFloridaStateParksFromSupabase();
    devLog('[parks] loaded from Supabase', { count: parks.length });
    return parks;
  } catch (error) {
    const cached = await loadCachedFloridaStateParksEntry();
    if (cached) {
      cachedParks = cached.value;
      devLog('[parks] Supabase unavailable; using device cache', {
        count: cached.value.length,
        error,
      });
      return cached.value;
    }

    if (__DEV__) {
      devLog('[parks] Supabase load failed; using bundled CSV (dev only)', error);
      return loadFloridaStateParksFromBundledCsv();
    }

    throw error instanceof Error
      ? error
      : new Error('Could not load Florida state parks from Supabase.');
  }
}

/** Resolve parks from in-memory, device cache, then cloud Supabase. */
export async function loadFloridaStateParks(options?: {
  skipDeviceCache?: boolean;
}): Promise<FloridaStatePark[]> {
  if (cachedParks) return cachedParks;

  if (!options?.skipDeviceCache) {
    const cached = await loadCachedFloridaStateParksEntry();
    if (cached) {
      cachedParks = cached.value;
      return cachedParks;
    }
  }

  return loadFloridaStateParksFresh();
}

/** Test helper — clears in-memory cache between unit tests. */
export function resetFloridaStateParksCacheForTests(): void {
  clearInMemoryFloridaStateParks();
}
