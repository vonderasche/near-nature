import type { DbMigration } from '@/lib/db/migrations/types';

export const migration006ExplorerBoardCache: DbMigration = {
  version: 6,
  name: 'explorer_board_cache',
  async up(db) {
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS explorer_board_cache (
        cache_key TEXT PRIMARY KEY NOT NULL,
        payload_json TEXT NOT NULL,
        cached_at INTEGER NOT NULL,
        version INTEGER NOT NULL
      );
    `);
  },
};
