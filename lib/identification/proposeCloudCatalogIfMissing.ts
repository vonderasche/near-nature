import { devLog } from '@/lib/devLog';
import { proposeSpeciesCatalogFromClassificationsWithMetadata } from '@/services/speciesCatalogService';
import { syncSpeciesCatalogFromCloud } from '@/lib/db/syncSpeciesCatalogFromCloud';
import type { ClassificationResult } from '@/types';
import type { SpeciesWikiData } from '@/api/wikipedia';

/**
 * Save every Gemini identification to Supabase so other users receive it on catalog sync.
 * The propose RPC dedupes by genus and merges richer metadata when present.
 */
export async function proposeCloudCatalogFromGemini(
  classifications: readonly ClassificationResult[],
  wikiByLatinName: Record<string, SpeciesWikiData | null>,
): Promise<void> {
  if (classifications.length === 0) return;

  devLog('[species_catalog] proposing Gemini species to cloud', {
    count: classifications.length,
    names: classifications.map((row) => row.latinName),
  });

  await proposeSpeciesCatalogFromClassificationsWithMetadata(classifications, wikiByLatinName);
  await syncSpeciesCatalogFromCloud();
}

/** @deprecated Use {@link proposeCloudCatalogFromGemini}. */
export const proposeCloudCatalogForMissingSpecies = proposeCloudCatalogFromGemini;
