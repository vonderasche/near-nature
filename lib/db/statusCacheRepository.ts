import type { NativeLookupResult } from '@/api/inaturalist';
import { getLocalDatabase } from '@/lib/db/database';
import { STATUS_CACHE_TTL_MS } from '@/lib/identification/statusCachePolicy';
import { normalizeLatinName } from '@/lib/identification/normalizeLatinName';
import type { SpeciesStatus } from '@/types';

type StatusCacheRow = {
  status: string;
  taxon_id: number | null;
  establishment_means: string | null;
  not_found: number;
  cached_at: number;
};

export type StatusCacheEntry =
  | { kind: 'found'; result: NativeLookupResult }
  | { kind: 'not_found' };

function parseSpeciesStatus(value: string): SpeciesStatus {
  const normalized = value.trim().toLowerCase();
  if (normalized === 'native' || normalized === 'non-native' || normalized === 'invasive') {
    return normalized;
  }
  return 'unknown';
}

function normalizeStateCode(stateCode: string): string | null {
  const code = stateCode.trim().toUpperCase().slice(0, 2);
  return code.length === 2 ? code : null;
}

function isFresh(cachedAt: number, now = Date.now()): boolean {
  return now - cachedAt < STATUS_CACHE_TTL_MS;
}

/** Loads a cached iNaturalist native-status lookup for this latin name and US state. */
export async function loadStatusCache(
  latinName: string,
  stateCode: string,
): Promise<StatusCacheEntry | null> {
  const db = getLocalDatabase();
  if (!db) return null;

  const key = normalizeLatinName(latinName);
  const state = normalizeStateCode(stateCode);
  if (!key || !state) return null;

  const row = await db.getFirstAsync<StatusCacheRow>(
    `SELECT status, taxon_id, establishment_means, not_found, cached_at
     FROM status_cache
     WHERE latin_name_normalized = ? AND state_code = ?
     LIMIT 1`,
    [key, state],
  );

  if (!row || !isFresh(row.cached_at)) return null;

  if (row.not_found) {
    return { kind: 'not_found' };
  }

  if (row.taxon_id == null) return null;

  return {
    kind: 'found',
    result: {
      status: parseSpeciesStatus(row.status),
      taxonId: row.taxon_id,
      establishmentMeans: row.establishment_means,
    },
  };
}

/** Persists a native-status lookup so repeat identifies skip iNaturalist. */
export async function saveStatusCache(
  latinName: string,
  stateCode: string,
  result: NativeLookupResult | null,
): Promise<void> {
  const db = getLocalDatabase();
  if (!db) return;

  const trimmed = latinName.trim();
  const key = normalizeLatinName(trimmed);
  const state = normalizeStateCode(stateCode);
  if (!key || !state) return;

  const cachedAt = Date.now();

  if (!result) {
    await db.runAsync(
      `INSERT INTO status_cache (
         latin_name_normalized, state_code, latin_name, status, taxon_id,
         establishment_means, not_found, cached_at
       )
       VALUES (?, ?, ?, ?, NULL, NULL, 1, ?)
       ON CONFLICT(latin_name_normalized, state_code) DO UPDATE SET
         latin_name = excluded.latin_name,
         status = excluded.status,
         taxon_id = excluded.taxon_id,
         establishment_means = excluded.establishment_means,
         not_found = excluded.not_found,
         cached_at = excluded.cached_at`,
      [key, state, trimmed, 'unknown', cachedAt],
    );
    return;
  }

  await db.runAsync(
    `INSERT INTO status_cache (
       latin_name_normalized, state_code, latin_name, status, taxon_id,
       establishment_means, not_found, cached_at
     )
     VALUES (?, ?, ?, ?, ?, ?, 0, ?)
     ON CONFLICT(latin_name_normalized, state_code) DO UPDATE SET
       latin_name = excluded.latin_name,
       status = excluded.status,
       taxon_id = excluded.taxon_id,
       establishment_means = excluded.establishment_means,
       not_found = excluded.not_found,
       cached_at = excluded.cached_at`,
    [
      key,
      state,
      trimmed,
      result.status,
      result.taxonId,
      result.establishmentMeans,
      cachedAt,
    ],
  );
}
