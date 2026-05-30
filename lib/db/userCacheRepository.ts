import type { SQLiteDatabase } from 'expo-sqlite';

import { getLocalDatabase } from '@/lib/db/database';
import { normalizeLatinName } from '@/lib/identification/normalizeLatinName';
import type { SavedSpeciesEnrichment } from '@/services/savedSpeciesEnrichmentService';

function db(): SQLiteDatabase | null {
  return getLocalDatabase();
}

export async function loadUserProfileCacheJson(userId: string): Promise<string | null> {
  const conn = db();
  if (!conn) return null;
  const row = await conn.getFirstAsync<{ payload_json: string }>(
    'SELECT payload_json FROM user_profile_cache WHERE user_id = ? LIMIT 1',
    userId,
  );
  return row?.payload_json ?? null;
}

export async function saveUserProfileCacheJson(
  userId: string,
  payloadJson: string,
  cachedAt: number,
  version: number,
): Promise<void> {
  const conn = db();
  if (!conn) return;
  await conn.runAsync(
    `INSERT INTO user_profile_cache (user_id, payload_json, cached_at, version)
     VALUES (?, ?, ?, ?)
     ON CONFLICT(user_id) DO UPDATE SET
       payload_json = excluded.payload_json,
       cached_at = excluded.cached_at,
       version = excluded.version`,
    userId,
    payloadJson,
    cachedAt,
    version,
  );
}

export async function deleteUserProfileCache(userId: string): Promise<void> {
  const conn = db();
  if (!conn) return;
  await conn.runAsync('DELETE FROM user_profile_cache WHERE user_id = ?', userId);
}

export async function clearAllUserProfileCaches(): Promise<void> {
  const conn = db();
  if (!conn) return;
  await conn.runAsync('DELETE FROM user_profile_cache');
}

export async function loadGalleryListCacheJson(
  userId: string,
  publicOnly: boolean,
): Promise<string | null> {
  const conn = db();
  if (!conn) return null;
  const row = await conn.getFirstAsync<{ payload_json: string }>(
    `SELECT payload_json FROM gallery_list_cache
     WHERE user_id = ? AND public_only = ?
     LIMIT 1`,
    userId,
    publicOnly ? 1 : 0,
  );
  return row?.payload_json ?? null;
}

export async function saveGalleryListCacheJson(
  userId: string,
  publicOnly: boolean,
  payloadJson: string,
  cachedAt: number,
  version: number,
): Promise<void> {
  const conn = db();
  if (!conn) return;
  await conn.runAsync(
    `INSERT INTO gallery_list_cache (user_id, public_only, payload_json, cached_at, version)
     VALUES (?, ?, ?, ?, ?)
     ON CONFLICT(user_id, public_only) DO UPDATE SET
       payload_json = excluded.payload_json,
       cached_at = excluded.cached_at,
       version = excluded.version`,
    userId,
    publicOnly ? 1 : 0,
    payloadJson,
    cachedAt,
    version,
  );
}

export async function deleteGalleryListCache(
  userId: string,
  publicOnly?: boolean,
): Promise<void> {
  const conn = db();
  if (!conn) return;
  if (publicOnly === undefined) {
    await conn.runAsync('DELETE FROM gallery_list_cache WHERE user_id = ?', userId);
    return;
  }
  await conn.runAsync(
    'DELETE FROM gallery_list_cache WHERE user_id = ? AND public_only = ?',
    userId,
    publicOnly ? 1 : 0,
  );
}

export async function clearAllGalleryListCaches(): Promise<void> {
  const conn = db();
  if (!conn) return;
  await conn.runAsync('DELETE FROM gallery_list_cache');
}

export async function loadScoringSnapshotCacheJson(userId: string): Promise<string | null> {
  const conn = db();
  if (!conn) return null;
  const row = await conn.getFirstAsync<{ payload_json: string }>(
    'SELECT payload_json FROM scoring_snapshot_cache WHERE user_id = ? LIMIT 1',
    userId,
  );
  return row?.payload_json ?? null;
}

export async function saveScoringSnapshotCacheJson(
  userId: string,
  payloadJson: string,
  cachedAt: number,
  version: number,
): Promise<void> {
  const conn = db();
  if (!conn) return;
  await conn.runAsync(
    `INSERT INTO scoring_snapshot_cache (user_id, payload_json, cached_at, version)
     VALUES (?, ?, ?, ?)
     ON CONFLICT(user_id) DO UPDATE SET
       payload_json = excluded.payload_json,
       cached_at = excluded.cached_at,
       version = excluded.version`,
    userId,
    payloadJson,
    cachedAt,
    version,
  );
}

export async function deleteScoringSnapshotCache(userId: string): Promise<void> {
  const conn = db();
  if (!conn) return;
  await conn.runAsync('DELETE FROM scoring_snapshot_cache WHERE user_id = ?', userId);
}

export async function clearAllScoringSnapshotCaches(): Promise<void> {
  const conn = db();
  if (!conn) return;
  await conn.runAsync('DELETE FROM scoring_snapshot_cache');
}

type SignedUrlRow = {
  object_path: string;
  signed_url: string;
  expires_at_ms: number;
};

export async function loadSignedUrlFromCache(objectPath: string): Promise<SignedUrlRow | null> {
  const conn = db();
  if (!conn) return null;
  return conn.getFirstAsync<SignedUrlRow>(
    `SELECT object_path, signed_url, expires_at_ms
     FROM signed_url_cache
     WHERE object_path = ?
     LIMIT 1`,
    objectPath,
  );
}

export async function loadSignedUrlsFromCache(
  objectPaths: readonly string[],
): Promise<SignedUrlRow[]> {
  const conn = db();
  const trimmed = [...new Set(objectPaths.map((p) => p.trim()).filter(Boolean))];
  if (!conn || trimmed.length === 0) return [];

  const placeholders = trimmed.map(() => '?').join(', ');
  return conn.getAllAsync<SignedUrlRow>(
    `SELECT object_path, signed_url, expires_at_ms
     FROM signed_url_cache
     WHERE object_path IN (${placeholders})`,
    ...trimmed,
  );
}

export async function saveSignedUrlToCache(
  objectPath: string,
  signedUrl: string,
  expiresAtMs: number,
  version: number,
): Promise<void> {
  const conn = db();
  if (!conn) return;
  await conn.runAsync(
    `INSERT INTO signed_url_cache (object_path, signed_url, expires_at_ms, version)
     VALUES (?, ?, ?, ?)
     ON CONFLICT(object_path) DO UPDATE SET
       signed_url = excluded.signed_url,
       expires_at_ms = excluded.expires_at_ms,
       version = excluded.version`,
    objectPath,
    signedUrl,
    expiresAtMs,
    version,
  );
}

export async function deleteSignedUrlsFromCache(objectPaths: readonly string[]): Promise<void> {
  const conn = db();
  const trimmed = objectPaths.map((p) => p.trim()).filter(Boolean);
  if (!conn || trimmed.length === 0) return;

  const placeholders = trimmed.map(() => '?').join(', ');
  await conn.runAsync(
    `DELETE FROM signed_url_cache WHERE object_path IN (${placeholders})`,
    ...trimmed,
  );
}

export async function clearAllSignedUrlCaches(): Promise<void> {
  const conn = db();
  if (!conn) return;
  await conn.runAsync('DELETE FROM signed_url_cache');
}

export async function loadSavedSpeciesCacheMap(
  userId: string,
): Promise<Map<string, SavedSpeciesEnrichment>> {
  const conn = db();
  if (!conn) return new Map();

  const rows = await conn.getAllAsync<{ latin_name_normalized: string; payload_json: string }>(
    `SELECT latin_name_normalized, payload_json
     FROM saved_species_cache
     WHERE user_id = ?`,
    userId,
  );

  const out = new Map<string, SavedSpeciesEnrichment>();
  for (const row of rows) {
    try {
      const parsed = JSON.parse(row.payload_json) as SavedSpeciesEnrichment;
      if (typeof parsed.latinName === 'string') {
        out.set(row.latin_name_normalized, parsed);
      }
    } catch {
      // skip corrupt row
    }
  }
  return out;
}

export async function upsertSavedSpeciesCacheEntry(
  userId: string,
  enrichment: SavedSpeciesEnrichment,
): Promise<void> {
  const conn = db();
  if (!conn) return;
  const key = normalizeLatinName(enrichment.latinName);
  await conn.runAsync(
    `INSERT INTO saved_species_cache (user_id, latin_name_normalized, payload_json)
     VALUES (?, ?, ?)
     ON CONFLICT(user_id, latin_name_normalized) DO UPDATE SET
       payload_json = excluded.payload_json`,
    userId,
    key,
    JSON.stringify(enrichment),
  );
}

export async function replaceSavedSpeciesCacheMap(
  userId: string,
  entries: ReadonlyMap<string, SavedSpeciesEnrichment>,
): Promise<void> {
  const conn = db();
  if (!conn) return;

  await conn.withTransactionAsync(async () => {
    await conn.runAsync('DELETE FROM saved_species_cache WHERE user_id = ?', userId);
    for (const enrichment of entries.values()) {
      const key = normalizeLatinName(enrichment.latinName);
      await conn.runAsync(
        `INSERT INTO saved_species_cache (user_id, latin_name_normalized, payload_json)
         VALUES (?, ?, ?)`,
        userId,
        key,
        JSON.stringify(enrichment),
      );
    }
  });
}

export async function clearSavedSpeciesCacheForUser(userId: string): Promise<void> {
  const conn = db();
  if (!conn) return;
  await conn.runAsync('DELETE FROM saved_species_cache WHERE user_id = ?', userId);
}

export async function clearAllSavedSpeciesCaches(): Promise<void> {
  const conn = db();
  if (!conn) return;
  await conn.runAsync('DELETE FROM saved_species_cache');
}
