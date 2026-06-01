import type { SpeciesWikiData } from '@/api/wikipedia';
import { getSpeciesByScientificName, upsertSpeciesRecords } from '@/lib/db/speciesRepository';
import { extractGenusFromLatinName } from '@/lib/identification/extractGenusFromLatinName';
import type { SpeciesRecord } from '@/types/speciesRecord';
import type { SpeciesStatus } from '@/types';

/** Maps catalog `floridaStatus` / native region strings to app species status. */
export function catalogFloridaStatusToSpeciesStatus(floridaStatus: string): SpeciesStatus {
  const normalized = floridaStatus.trim().toLowerCase();
  if (normalized === 'native' || normalized === 'non-native' || normalized === 'invasive') {
    return normalized;
  }
  if (normalized === 'introduced') return 'invasive';
  return 'unknown';
}

/**
 * Merges network enrichment into `species_records` so the next identification of this genus
 * can skip API calls.
 */
export async function persistGenusEnrichmentToCatalog(params: {
  latinName: string;
  commonName: string;
  status?: SpeciesStatus;
  wiki?: SpeciesWikiData | null;
  inatTaxonId?: number | null;
}): Promise<void> {
  const genus = extractGenusFromLatinName(params.latinName);
  if (!genus) return;

  const existing = await getSpeciesByScientificName(params.latinName);
  const statusForCatalog =
    params.status && params.status !== 'unknown'
      ? params.status
      : (existing?.floridaStatus ?? 'unknown');

  const wiki = params.wiki;
  const description = wiki?.description?.trim() || existing?.description || '';
  const funFacts = wiki?.funFacts?.length ? wiki.funFacts : (existing?.interestingFacts ?? []);

  const record: SpeciesRecord = {
    id: existing?.id ?? genus,
    scientificName: genus,
    commonName: params.commonName.trim() || existing?.commonName || genus,
    group: existing?.group ?? '',
    floridaStatus: statusForCatalog,
    taxonomy: existing?.taxonomy ?? { genus },
    description,
    identificationTraits: existing?.identificationTraits ?? [],
    interestingFacts: funFacts,
    sourceUrls: {
      ...(existing?.sourceUrls ?? {}),
      ...(wiki?.pageUrl ? { wikipedia: wiki.pageUrl } : {}),
      ...(wiki?.imageUrl ? { thumbnail: wiki.imageUrl } : {}),
    },
    updatedAt: new Date().toISOString(),
    specialistId: existing?.specialistId,
    inatTaxonId: params.inatTaxonId ?? existing?.inatTaxonId ?? null,
  };

  await upsertSpeciesRecords([record]);
}
