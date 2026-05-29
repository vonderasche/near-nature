import type { SpeciesRecord, SpeciesRecordSourceUrls } from '@/types/speciesRecord';

export type SpeciesRecordRow = {
  id: string;
  scientific_name: string;
  common_name: string;
  taxon_group: string;
  florida_status: string;
  family: string | null;
  genus: string | null;
  description: string;
  identification_traits: string;
  interesting_facts: string;
  source_urls: string;
  updated_at: string;
};

function parseJsonArray(raw: string): string[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((item): item is string => typeof item === 'string');
  } catch {
    return [];
  }
}

function parseJsonObject(raw: string): SpeciesRecordSourceUrls {
  if (!raw) return {};
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!parsed || typeof parsed !== 'object') return {};
    return parsed as SpeciesRecordSourceUrls;
  } catch {
    return {};
  }
}

export function speciesRecordToRow(record: SpeciesRecord): SpeciesRecordRow {
  return {
    id: record.id,
    scientific_name: record.scientificName,
    common_name: record.commonName,
    taxon_group: record.group,
    florida_status: record.floridaStatus,
    family: record.taxonomy.family ?? null,
    genus: record.taxonomy.genus ?? null,
    description: record.description,
    identification_traits: JSON.stringify(record.identificationTraits),
    interesting_facts: JSON.stringify(record.interestingFacts),
    source_urls: JSON.stringify(record.sourceUrls),
    updated_at: record.updatedAt,
  };
}

export function speciesRecordFromRow(row: SpeciesRecordRow): SpeciesRecord {
  return {
    id: row.id,
    scientificName: row.scientific_name,
    commonName: row.common_name,
    group: row.taxon_group,
    floridaStatus: row.florida_status,
    taxonomy: {
      family: row.family ?? undefined,
      genus: row.genus ?? undefined,
    },
    description: row.description,
    identificationTraits: parseJsonArray(row.identification_traits),
    interestingFacts: parseJsonArray(row.interesting_facts),
    sourceUrls: parseJsonObject(row.source_urls),
    updatedAt: row.updated_at,
  };
}
