import type { SQLiteDatabase } from 'expo-sqlite';

import { getLocalDatabase } from '@/lib/db/database';

function db(): SQLiteDatabase | null {
  return getLocalDatabase();
}

export async function loadGlobalCacheJson(cacheKey: string): Promise<string | null> {
  const conn = db();
  if (!conn) return null;
  const row = await conn.getFirstAsync<{ payload_json: string }>(
    'SELECT payload_json FROM explorer_board_cache WHERE cache_key = ? LIMIT 1',
    cacheKey,
  );
  return row?.payload_json ?? null;
}

export async function saveGlobalCacheJson(
  cacheKey: string,
  payloadJson: string,
  cachedAt: number,
  version: number,
): Promise<void> {
  const conn = db();
  if (!conn) return;
  await conn.runAsync(
    `INSERT INTO explorer_board_cache (cache_key, payload_json, cached_at, version)
     VALUES (?, ?, ?, ?)
     ON CONFLICT(cache_key) DO UPDATE SET
       payload_json = excluded.payload_json,
       cached_at = excluded.cached_at,
       version = excluded.version`,
    cacheKey,
    payloadJson,
    cachedAt,
    version,
  );
}

export async function deleteGlobalCache(cacheKey: string): Promise<void> {
  const conn = db();
  if (!conn) return;
  await conn.runAsync('DELETE FROM explorer_board_cache WHERE cache_key = ?', cacheKey);
}
