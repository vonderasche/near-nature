import type { DbMigration } from '@/lib/db/migrations/types';

export const migration007StatusCache: DbMigration = {
  version: 7,
  name: 'status_cache',
  async up(db) {
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS status_cache (
        latin_name_normalized TEXT NOT NULL,
        state_code TEXT NOT NULL,
        latin_name TEXT NOT NULL,
        status TEXT NOT NULL,
        taxon_id INTEGER,
        establishment_means TEXT,
        not_found INTEGER NOT NULL DEFAULT 0,
        cached_at INTEGER NOT NULL,
        PRIMARY KEY (latin_name_normalized, state_code)
      );
    `);
  },
};
