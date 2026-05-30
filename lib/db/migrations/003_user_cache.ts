import type { DbMigration } from '@/lib/db/migrations/types';

export const migration003UserCache: DbMigration = {
  version: 3,
  name: 'user_cache',
  async up(db) {
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS user_profile_cache (
        user_id TEXT PRIMARY KEY NOT NULL,
        payload_json TEXT NOT NULL,
        cached_at INTEGER NOT NULL,
        version INTEGER NOT NULL
      );

      CREATE TABLE IF NOT EXISTS gallery_list_cache (
        user_id TEXT NOT NULL,
        public_only INTEGER NOT NULL CHECK (public_only IN (0, 1)),
        payload_json TEXT NOT NULL,
        cached_at INTEGER NOT NULL,
        version INTEGER NOT NULL,
        PRIMARY KEY (user_id, public_only)
      );

      CREATE TABLE IF NOT EXISTS scoring_snapshot_cache (
        user_id TEXT PRIMARY KEY NOT NULL,
        payload_json TEXT NOT NULL,
        cached_at INTEGER NOT NULL,
        version INTEGER NOT NULL
      );

      CREATE TABLE IF NOT EXISTS signed_url_cache (
        object_path TEXT PRIMARY KEY NOT NULL,
        signed_url TEXT NOT NULL,
        expires_at_ms INTEGER NOT NULL,
        version INTEGER NOT NULL
      );

      CREATE INDEX IF NOT EXISTS signed_url_cache_expires_idx
        ON signed_url_cache (expires_at_ms);

      CREATE TABLE IF NOT EXISTS saved_species_cache (
        user_id TEXT NOT NULL,
        latin_name_normalized TEXT NOT NULL,
        payload_json TEXT NOT NULL,
        PRIMARY KEY (user_id, latin_name_normalized)
      );

      CREATE INDEX IF NOT EXISTS saved_species_cache_user_idx
        ON saved_species_cache (user_id);
    `);
  },
};
