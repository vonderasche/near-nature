import { migration001Init } from '@/lib/db/migrations/001_init';
import { migration002SpeciesRecords } from '@/lib/db/migrations/002_species_records';
import type { DbMigration } from '@/lib/db/migrations/types';

export const DB_MIGRATIONS: readonly DbMigration[] = [
  migration001Init,
  migration002SpeciesRecords,
];

export const LATEST_DB_MIGRATION_VERSION =
  DB_MIGRATIONS[DB_MIGRATIONS.length - 1]?.version ?? 0;
