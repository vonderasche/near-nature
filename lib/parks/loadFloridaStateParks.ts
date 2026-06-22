import { Asset } from 'expo-asset';

import floridaStateParksCsv from '@/assets/data/florida_state_parks.csv';
import {
  loadCachedFloridaStateParksEntry,
  saveCachedFloridaStateParks,
} from '@/lib/parks/floridaStateParksCache';
import { parseFloridaStateParksCsv } from '@/lib/parks/parseFloridaStateParksCsv';
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

/** Resolve parks from in-memory, device cache, then bundled CSV (in that order). */
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

  return loadFloridaStateParksFromBundledCsv();
}

/** Test helper — clears in-memory cache between unit tests. */
export function resetFloridaStateParksCacheForTests(): void {
  clearInMemoryFloridaStateParks();
}
