import type { SQLiteDatabase } from 'expo-sqlite';

import { getLocalDatabase } from '@/lib/db/database';
import { speciesRecordFromRow, speciesRecordToRow, type SpeciesRecordRow } from '@/lib/db/speciesRecordRow';
import { extractGenusFromLatinName } from '@/lib/identification/extractGenusFromLatinName';
import { normalizeLatinName } from '@/lib/identification/normalizeLatinName';
import type { SpeciesRecord } from '@/types/speciesRecord';

const UPSERT_SPECIES_SQL = `
  INSERT INTO species_records (
    id,
    scientific_name,
    common_name,
    taxon_group,
    florida_status,
    family,
    genus,
    description,
    identification_traits,
    interesting_facts,
    source_urls,
    updated_at,
    scientific_name_normalized
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  ON CONFLICT(id) DO UPDATE SET
    scientific_name = excluded.scientific_name,
    common_name = excluded.common_name,
    taxon_group = excluded.taxon_group,
    florida_status = excluded.florida_status,
    family = excluded.family,
    genus = excluded.genus,
    description = excluded.description,
    identification_traits = excluded.identification_traits,
    interesting_facts = excluded.interesting_facts,
    source_urls = excluded.source_urls,
    updated_at = excluded.updated_at,
    scientific_name_normalized = excluded.scientific_name_normalized
`;

async function upsertSpeciesRecord(db: SQLiteDatabase, record: SpeciesRecord): Promise<void> {
  const row = speciesRecordToRow(record);
  await db.runAsync(UPSERT_SPECIES_SQL, [
    row.id,
    row.scientific_name,
    row.common_name,
    row.taxon_group,
    row.florida_status,
    row.family,
    row.genus,
    row.description,
    row.identification_traits,
    row.interesting_facts,
    row.source_urls,
    row.updated_at,
    normalizeLatinName(row.scientific_name),
  ]);
}

export async function upsertSpeciesRecords(records: SpeciesRecord[]): Promise<void> {
  const db = getLocalDatabase();
  if (!db || records.length === 0) return;

  await db.withTransactionAsync(async () => {
    for (const record of records) {
      await upsertSpeciesRecord(db, record);
    }
  });
}

export async function clearAllSpeciesRecords(): Promise<void> {
  const db = getLocalDatabase();
  if (!db) return;
  await db.runAsync('DELETE FROM species_records');
}

/**
 * Looks up a genus profile for a vision Latin name (e.g. `Asclepias tuberosa` → genus `Asclepias`).
 */
export async function getSpeciesByScientificName(
  latinName: string,
): Promise<SpeciesRecord | null> {
  const db = getLocalDatabase();
  if (!db) return null;

  const genus = extractGenusFromLatinName(latinName);
  const normalized = normalizeLatinName(genus);
  if (!normalized) return null;

  const row = await db.getFirstAsync<SpeciesRecordRow>(
    `SELECT
      id,
      scientific_name,
      common_name,
      taxon_group,
      florida_status,
      family,
      genus,
      description,
      identification_traits,
      interesting_facts,
      source_urls,
      updated_at
    FROM species_records
    WHERE scientific_name_normalized = ?
    LIMIT 1`,
    normalized,
  );

  return row ? speciesRecordFromRow(row) : null;
}

export async function countSpeciesRecords(): Promise<number> {
  const db = getLocalDatabase();
  if (!db) return 0;
  const row = await db.getFirstAsync<{ count: number }>(
    'SELECT COUNT(*) AS count FROM species_records',
  );
  return row?.count ?? 0;
}
