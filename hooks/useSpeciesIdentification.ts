// React hook that orchestrates identification flow:
// photo -> Claude -> result filters -> iNaturalist -> Species[]

import { deleteAsync, readLocalFileAsBase64 } from '@/lib/fs/legacyFileSystem';
import { useCallback, useState } from 'react';

import { identifySpeciesInImage } from '@/api/claude';
import { lookupNativeStatus } from '@/api/inaturalist';
import { useResizeImageForUpload } from '@/hooks/useResizeImageForUpload';
import { devLog } from '@/lib/devLog';
import { filterClassifications, hasNoSpeciesFound } from '@/utils/imageFilters';
import type { ClassificationResult, Species } from '@/types';

export type IdentifySpeciesOutcome = {
  species: Species[];
  classifications: ClassificationResult[];
};

interface UseSpeciesIdentificationResult {
  identify: (photoUri: string, userState: string) => Promise<IdentifySpeciesOutcome>;
  isLoading: boolean;
  error: string | null;
}

export function useSpeciesIdentification(): UseSpeciesIdentificationResult {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { resizeForUpload } = useResizeImageForUpload();

  const identify = useCallback(async (
    photoUri: string,
    userState: string,
  ): Promise<IdentifySpeciesOutcome> => {
    setIsLoading(true);
    setError(null);

    let resizedUri: string | null = null;

    try {
      // 1) Resize / compress so vision APIs stay under image size limits (e.g. Claude 5 MiB).
      const resized = await resizeForUpload(photoUri);
      resizedUri = resized.uri;

      // 2) Convert prepared file to base64 for the vision API.
      const base64 = await readLocalFileAsBase64(resizedUri);

      // 3) Ask Claude for species classifications.
      const rawClassifications = await identifySpeciesInImage(base64, 'image/jpeg');

      // 4) Apply confidence + dedupe filters.
      const { results: classifications, summary } = filterClassifications(rawClassifications);
      devLog('[identify] filter summary', summary);

      if (hasNoSpeciesFound(classifications)) return { species: [], classifications: [] };

      // 5) Enrich with native/invasive status in parallel.
      const speciesResults = await Promise.all(
        classifications.map(async (classification, index): Promise<Species> => {
          const nativeResult = await lookupNativeStatus(
            classification.latinName,
            userState,
          );

          return {
            id: `${Date.now()}-${index}`,
            latinName: classification.latinName,
            commonName: classification.commonName,
            taxonGroup: classification.taxonGroup,
            status: nativeResult?.status ?? 'non-native',
            // imageUri and description fetched separately in SpeciesDetailScreen
          };
        }),
      );

      return { species: speciesResults, classifications };

    } catch (e) {
      const message = e instanceof Error ? e.message : 'Identification failed';
      setError(message);
      return { species: [], classifications: [] };
    } finally {
      if (resizedUri && resizedUri !== photoUri) {
        await deleteAsync(resizedUri, { idempotent: true }).catch(() => {});
      }
      setIsLoading(false);
    }
  }, [resizeForUpload]);

  return { identify, isLoading, error };
}
