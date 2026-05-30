import type { DbMigration } from '@/lib/db/migrations/types';

export const migration004UserDetections: DbMigration = {
  version: 4,
  name: 'user_detections',
  async up(db) {
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS user_detections (
        id TEXT PRIMARY KEY NOT NULL,
        user_id TEXT NOT NULL,
        image_url TEXT NOT NULL,
        detected_at TEXT NOT NULL,
        common_name TEXT NOT NULL,
        latin_name TEXT NOT NULL,
        category TEXT NOT NULL,
        subcategory TEXT,
        main_category TEXT,
        description TEXT,
        native_status TEXT,
        confidence REAL,
        state TEXT,
        inaturalist_id TEXT,
        is_sensitive INTEGER NOT NULL DEFAULT 0,
        points INTEGER NOT NULL DEFAULT 0,
        synced_at INTEGER NOT NULL,
        created_at INTEGER NOT NULL
      );

      CREATE INDEX IF NOT EXISTS user_detections_user_detected_idx
        ON user_detections (user_id, detected_at DESC);

      CREATE INDEX IF NOT EXISTS user_detections_user_public_idx
        ON user_detections (user_id, is_sensitive, detected_at DESC);
    `);
  },
};
