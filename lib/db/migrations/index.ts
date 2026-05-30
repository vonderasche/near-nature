import { migration001Init } from '@/lib/db/migrations/001_init';
import { migration002SpeciesRecords } from '@/lib/db/migrations/002_species_records';
import { migration003UserCache } from '@/lib/db/migrations/003_user_cache';
import { migration004UserDetections } from '@/lib/db/migrations/004_user_detections';
import { migration005WikiCache } from '@/lib/db/migrations/005_wiki_cache';
import type { DbMigration } from '@/lib/db/migrations/types';

export const DB_MIGRATIONS: readonly DbMigration[] = [
  migration001Init,
  migration002SpeciesRecords,
  migration003UserCache,
  migration004UserDetections,
  migration005WikiCache,
];

export const LATEST_DB_MIGRATION_VERSION =
  DB_MIGRATIONS[DB_MIGRATIONS.length - 1]?.version ?? 0;
