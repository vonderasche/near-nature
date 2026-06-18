import { Asset } from 'expo-asset';

import floridaStateParksCsv from '@/assets/data/florida_state_parks.csv';
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

export async function loadFloridaStateParks(): Promise<FloridaStatePark[]> {
  if (cachedParks) return cachedParks;
  if (loadPromise) return loadPromise;

  loadPromise = readBundledCsvText()
    .then((csvText) => {
      cachedParks = parseFloridaStateParksCsv(csvText);
      return cachedParks;
    })
    .finally(() => {
      loadPromise = null;
    });

  return loadPromise;
}

/** Test helper — clears in-memory cache between unit tests. */
export function resetFloridaStateParksCacheForTests(): void {
  cachedParks = null;
  loadPromise = null;
}
