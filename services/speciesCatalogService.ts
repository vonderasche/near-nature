import { upsertSpeciesMetadata } from '@/services/speciesMetadataService';
import { devLog } from '@/lib/devLog';
import { supabase } from '@/lib/supabase';
import type { ClassificationResult } from '@/types';
import type { SpeciesRecord, SpeciesRecordSourceUrls } from '@/types/speciesRecord';

export type SpeciesCatalogRow = {
  id: string;
  scientific_name: string;
  common_name: string;
  taxon_group: string;
  florida_status: string;
  family: string | null;
  genus: string | null;
  description: string;
  identification_traits: string[] | unknown;
  interesting_facts: string[] | unknown;
  source_urls: SpeciesRecordSourceUrls | Record<string, unknown>;
  inat_taxon_id: number | null;
  specialist_id: string | null;
  catalog_source: string;
  updated_at: string;
};

export type ProposeSpeciesCatalogInput = {
  latinName: string;
  commonName?: string | null;
  taxonGroup?: string | null;
  description?: string | null;
  floridaStatus?: string | null;
  inatTaxonId?: number | null;
  sourceUrls?: SpeciesRecordSourceUrls;
  specialistId?: string | null;
};

const COMMUNITY_SOURCES = ['community', 'enrichment'] as const;

function asStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is string => typeof item === 'string');
}

function asSourceUrls(value: unknown): SpeciesRecordSourceUrls {
  if (!value || typeof value !== 'object') return {};
  return value as SpeciesRecordSourceUrls;
}

export function speciesCatalogRowToRecord(row: SpeciesCatalogRow): SpeciesRecord {
  return {
    id: row.id,
    scientificName: row.scientific_name,
    commonName: row.common_name,
    group: row.taxon_group,
    floridaStatus: row.florida_status,
    taxonomy: {
      family: row.family ?? undefined,
      genus: row.genus ?? row.scientific_name,
    },
    description: row.description,
    identificationTraits: asStringArray(row.identification_traits),
    interestingFacts: asStringArray(row.interesting_facts),
    sourceUrls: asSourceUrls(row.source_urls),
    updatedAt: row.updated_at,
    specialistId: row.specialist_id ?? undefined,
    inatTaxonId: row.inat_taxon_id,
  };
}

/** Pull community/enrichment catalog rows changed since `updatedAfter` (paginated). */
export async function fetchSpeciesCatalogSyncPage(params: {
  updatedAfter?: string | null;
  limit?: number;
  offset?: number;
  catalogSources?: readonly string[] | null;
}): Promise<SpeciesCatalogRow[]> {
  const { data, error } = await supabase.rpc('sync_species_catalog', {
    p_updated_after: params.updatedAfter ?? null,
    p_limit: params.limit ?? 500,
    p_offset: params.offset ?? 0,
    p_catalog_sources: params.catalogSources ?? [...COMMUNITY_SOURCES],
  });

  if (error) throw error;
  return (data ?? []) as SpeciesCatalogRow[];
}

/** Propose a genus/species discovered via cloud AI for all users on next sync. */
export async function proposeSpeciesCatalogEntry(
  input: ProposeSpeciesCatalogInput,
): Promise<string | null> {
  const latinName = input.latinName.trim();
  if (!latinName) return null;

  const { data, error } = await supabase.rpc('propose_species_catalog_entry', {
    p_latin_name: latinName,
    p_common_name: input.commonName?.trim() || null,
    p_taxon_group: input.taxonGroup?.trim() || null,
    p_description: input.description?.trim() || null,
    p_florida_status: input.floridaStatus?.trim() || 'unknown',
    p_inat_taxon_id: input.inatTaxonId ?? null,
    p_source_urls: input.sourceUrls ?? {},
    p_specialist_id: input.specialistId?.trim() || null,
  });

  if (error) throw error;
  return typeof data === 'string' ? data : null;
}

export async function proposeSpeciesCatalogFromClassifications(
  classifications: readonly ClassificationResult[],
  options?: {
    descriptionsByLatinName?: Record<string, string | null | undefined>;
    inatTaxonIdByLatinName?: Record<string, number | null | undefined>;
  },
): Promise<void> {
  for (const row of classifications) {
    try {
      const id = await proposeSpeciesCatalogEntry({
        latinName: row.latinName,
        commonName: row.commonName,
        taxonGroup: row.taxonGroup,
        description: options?.descriptionsByLatinName?.[row.latinName] ?? null,
        inatTaxonId: options?.inatTaxonIdByLatinName?.[row.latinName] ?? null,
      });
      if (id) {
        devLog('[species_catalog] proposed community entry', { id, latinName: row.latinName });
      }
    } catch (error) {
      devLog('[species_catalog] propose failed', { latinName: row.latinName, error });
    }
  }
}

/** Keep search aliases in sync when proposing new community species. */
export async function proposeSpeciesCatalogFromClassificationsWithMetadata(
  classifications: readonly ClassificationResult[],
  wikiByLatinName: Record<string, { description?: string | null } | null | undefined>,
): Promise<void> {
  const descriptionsByLatinName: Record<string, string | null> = {};
  for (const row of classifications) {
    const description = wikiByLatinName[row.latinName]?.description?.trim();
    if (description) descriptionsByLatinName[row.latinName] = description;
  }

  await proposeSpeciesCatalogFromClassifications(classifications, { descriptionsByLatinName });

  for (const row of classifications) {
    try {
      await upsertSpeciesMetadata({
        latinName: row.latinName,
        commonName: row.commonName,
      });
    } catch {
      /* non-blocking */
    }
  }
}
