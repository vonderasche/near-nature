import type { DbMigration } from '@/lib/db/migrations/types';

export const migration005WikiCache: DbMigration = {
  version: 5,
  name: 'wiki_cache',
  async up(db) {
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS wiki_cache (
        latin_name_normalized TEXT PRIMARY KEY NOT NULL,
        latin_name TEXT NOT NULL,
        payload_json TEXT NOT NULL,
        cached_at INTEGER NOT NULL
      );
    `);
  },
};
