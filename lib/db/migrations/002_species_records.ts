import type { DbMigration } from '@/lib/db/migrations/types';

export const migration002SpeciesRecords: DbMigration = {
  version: 2,
  name: 'species_records',
  async up(db) {
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS species_records (
        id TEXT PRIMARY KEY NOT NULL,
        scientific_name TEXT NOT NULL,
        common_name TEXT NOT NULL,
        taxon_group TEXT NOT NULL DEFAULT '',
        florida_status TEXT NOT NULL DEFAULT 'unknown',
        family TEXT,
        genus TEXT,
        description TEXT NOT NULL DEFAULT '',
        identification_traits TEXT NOT NULL DEFAULT '[]',
        interesting_facts TEXT NOT NULL DEFAULT '[]',
        source_urls TEXT NOT NULL DEFAULT '{}',
        updated_at TEXT NOT NULL DEFAULT '',
        scientific_name_normalized TEXT NOT NULL
      );

      CREATE UNIQUE INDEX IF NOT EXISTS species_records_scientific_name_idx
        ON species_records (scientific_name_normalized);

      CREATE INDEX IF NOT EXISTS species_records_common_name_idx
        ON species_records (common_name);
    `);
  },
};
