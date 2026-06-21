import type { SQLiteDatabase } from 'expo-sqlite';

import {
  mapUserDetectionRowToGalleryRow,
  type StoredUserDetectionMeta,
  type UserDetectionRow,
} from '@/lib/db/detectionRecordRow';
import { getLocalDatabase } from '@/lib/db/database';
import type { DetectionGalleryRow } from '@/lib/detections/mapDetectionGalleryRow';

export type { StoredUserDetectionMeta, UserDetectionRow } from '@/lib/db/detectionRecordRow';
export { mapUserDetectionRowToGalleryRow } from '@/lib/db/detectionRecordRow';

function db(): SQLiteDatabase | null {
  return getLocalDatabase();
}

/** expo-sqlite allows one active transaction; serialize detection writes. */
let detectionWriteChain: Promise<void> = Promise.resolve();

function enqueueDetectionWrite<T>(fn: () => Promise<T>): Promise<T> {
  const run = detectionWriteChain.then(fn, fn);
  detectionWriteChain = run.then(
    () => undefined,
    () => undefined,
  );
  return run;
}

const UPSERT_SQL = `
  INSERT INTO user_detections (
    id,
    user_id,
    image_url,
    detected_at,
    common_name,
    latin_name,
    category,
    subcategory,
    main_category,
    description,
    native_status,
    confidence,
    state,
    inaturalist_id,
    is_sensitive,
    points,
    synced_at,
    created_at
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  ON CONFLICT(id) DO UPDATE SET
    user_id = excluded.user_id,
    image_url = excluded.image_url,
    detected_at = excluded.detected_at,
    common_name = excluded.common_name,
    latin_name = excluded.latin_name,
    category = excluded.category,
    subcategory = excluded.subcategory,
    main_category = excluded.main_category,
    description = excluded.description,
    native_status = excluded.native_status,
    confidence = excluded.confidence,
    state = excluded.state,
    inaturalist_id = excluded.inaturalist_id,
    is_sensitive = excluded.is_sensitive,
    points = excluded.points,
    synced_at = excluded.synced_at
`;

function nowMs(): number {
  return Date.now();
}

function toBindValues(
  userId: string,
  row: DetectionGalleryRow,
  meta: StoredUserDetectionMeta,
  syncedAt: number,
  createdAt: number,
): (string | number | null)[] {
  return [
    row.id,
    userId,
    row.image_url,
    row.detected_at,
    row.common_name,
    row.latin_name,
    row.category,
    row.subcategory ?? null,
    row.main_category ?? null,
    row.description ?? null,
    row.native_status ?? null,
    meta.confidence ?? null,
    meta.state ?? null,
    meta.inaturalistId ?? null,
    meta.isSensitive ? 1 : 0,
    meta.points ?? 0,
    syncedAt,
    createdAt,
  ];
}

async function upsertUserDetectionOnConnection(
  conn: SQLiteDatabase,
  userId: string,
  row: DetectionGalleryRow,
  meta: StoredUserDetectionMeta,
): Promise<void> {
  const syncedAt = nowMs();
  const existing = await conn.getFirstAsync<{ created_at: number }>(
    'SELECT created_at FROM user_detections WHERE id = ? LIMIT 1',
    row.id,
  );
  const createdAt = existing?.created_at ?? syncedAt;

  await conn.runAsync(UPSERT_SQL, ...toBindValues(userId, row, meta, syncedAt, createdAt));
}

export async function upsertUserDetection(
  userId: string,
  row: DetectionGalleryRow,
  meta: StoredUserDetectionMeta = {},
): Promise<void> {
  const conn = db();
  if (!conn) return;

  await enqueueDetectionWrite(() => upsertUserDetectionOnConnection(conn, userId, row, meta));
}

export async function upsertUserDetections(
  userId: string,
  rows: readonly DetectionGalleryRow[],
  metaById?: ReadonlyMap<string, StoredUserDetectionMeta>,
): Promise<void> {
  const conn = db();
  if (!rows.length || !conn) return;

  await enqueueDetectionWrite(async () => {
    await conn.withTransactionAsync(async () => {
      for (const row of rows) {
        await upsertUserDetectionOnConnection(
          conn,
          userId,
          row,
          metaById?.get(row.id) ?? {},
        );
      }
    });
  });
}

export async function deleteUserDetection(userId: string, detectionId: string): Promise<void> {
  const conn = db();
  if (!conn) return;
  await enqueueDetectionWrite(() =>
    conn.runAsync('DELETE FROM user_detections WHERE user_id = ? AND id = ?', userId, detectionId),
  );
}

export async function getDetectionGalleryRowById(
  detectionId: string,
  options: { userId?: string; publicOnly?: boolean } = {},
): Promise<DetectionGalleryRow | null> {
  const conn = db();
  if (!conn) return null;

  const { userId, publicOnly = false } = options;
  const sensitivityClause = publicOnly ? ' AND is_sensitive = 0' : '';
  const row = userId
    ? await conn.getFirstAsync<UserDetectionRow>(
        `SELECT
          id, user_id, image_url, detected_at, common_name, latin_name,
          category, subcategory, main_category, description, native_status,
          confidence, state, inaturalist_id, is_sensitive, points, synced_at, created_at
         FROM user_detections
         WHERE id = ? AND user_id = ?${sensitivityClause}
         LIMIT 1`,
        detectionId,
        userId,
      )
    : await conn.getFirstAsync<UserDetectionRow>(
        `SELECT
          id, user_id, image_url, detected_at, common_name, latin_name,
          category, subcategory, main_category, description, native_status,
          confidence, state, inaturalist_id, is_sensitive, points, synced_at, created_at
         FROM user_detections
         WHERE id = ?${sensitivityClause}
         LIMIT 1`,
        detectionId,
      );

  return row ? mapUserDetectionRowToGalleryRow(row) : null;
}

export async function listUserDetectionGalleryRows(
  userId: string,
  options: { publicOnly?: boolean; limit?: number; offset?: number } = {},
): Promise<DetectionGalleryRow[]> {
  const conn = db();
  if (!conn) return [];

  const limit = options.limit ?? 500;
  const offset = options.offset ?? 0;
  const publicOnly = options.publicOnly ?? false;

  const rows = publicOnly
    ? await conn.getAllAsync<UserDetectionRow>(
        `SELECT
          id, user_id, image_url, detected_at, common_name, latin_name,
          category, subcategory, main_category, description, native_status,
          confidence, state, inaturalist_id, is_sensitive, points, synced_at, created_at
         FROM user_detections
         WHERE user_id = ? AND is_sensitive = 0
         ORDER BY detected_at DESC
         LIMIT ? OFFSET ?`,
        userId,
        limit,
        offset,
      )
    : await conn.getAllAsync<UserDetectionRow>(
        `SELECT
          id, user_id, image_url, detected_at, common_name, latin_name,
          category, subcategory, main_category, description, native_status,
          confidence, state, inaturalist_id, is_sensitive, points, synced_at, created_at
         FROM user_detections
         WHERE user_id = ?
         ORDER BY detected_at DESC
         LIMIT ? OFFSET ?`,
        userId,
        limit,
        offset,
      );

  return rows.map(mapUserDetectionRowToGalleryRow);
}

export async function countUserDetections(userId: string, publicOnly = false): Promise<number> {
  const conn = db();
  if (!conn) return 0;

  const row = publicOnly
    ? await conn.getFirstAsync<{ count: number }>(
        'SELECT COUNT(*) AS count FROM user_detections WHERE user_id = ? AND is_sensitive = 0',
        userId,
      )
    : await conn.getFirstAsync<{ count: number }>(
        'SELECT COUNT(*) AS count FROM user_detections WHERE user_id = ?',
        userId,
      );
  return row?.count ?? 0;
}

export async function clearUserDetectionsForUser(userId: string): Promise<void> {
  const conn = db();
  if (!conn) return;
  await enqueueDetectionWrite(() =>
    conn.runAsync('DELETE FROM user_detections WHERE user_id = ?', userId),
  );
}

export async function clearAllUserDetections(): Promise<void> {
  const conn = db();
  if (!conn) return;
  await enqueueDetectionWrite(() => conn.runAsync('DELETE FROM user_detections'));
}
