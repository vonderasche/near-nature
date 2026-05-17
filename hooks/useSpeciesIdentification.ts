// React hook that orchestrates identification flow:
// photo -> Claude -> filters -> parallel iNaturalist + Wikipedia enrich

import { deleteAsync, readLocalFileAsBase64 } from '@/lib/fs/legacyFileSystem';
import { useCallback, useState } from 'react';

import { identifySpeciesInImage } from '@/api/claude';
import type { SpeciesWikiData } from '@/api/wikipedia';
import { useResizeImageForUpload } from '@/hooks/useResizeImageForUpload';
import { enrichSpeciesFromApis } from '@/lib/identification/enrichSpeciesFromApis';
import { devLog } from '@/lib/devLog';
import { filterClassifications, hasNoSpeciesFound } from '@/lib/image/imageFilters';
import type { ClassificationResult, Species } from '@/types';

export type IdentifySpeciesOutcome = {
  species: Species[];
  classifications: ClassificationResult[];
  wikiByLatinName: Record<string, SpeciesWikiData | null>;
  wikiError: string | null;
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
      const resized = await resizeForUpload(photoUri);
      resizedUri = resized.uri;

      const base64 = await readLocalFileAsBase64(resizedUri);

      const rawClassifications = await identifySpeciesInImage(base64, 'image/jpeg');

      const { results: classifications, summary } = filterClassifications(rawClassifications);
      devLog('[identify] filter summary', summary);

      if (hasNoSpeciesFound(classifications)) {
        return { species: [], classifications: [], wikiByLatinName: {}, wikiError: null };
      }

      const { species, wikiByLatinName, wikiError } = await enrichSpeciesFromApis(
        classifications,
        userState,
      );

      return { species, classifications, wikiByLatinName, wikiError };
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Identification failed';
      setError(message);
      return { species: [], classifications: [], wikiByLatinName: {}, wikiError: null };
    } finally {
      if (resizedUri && resizedUri !== photoUri) {
        await deleteAsync(resizedUri, { idempotent: true }).catch(() => {});
      }
      setIsLoading(false);
    }
  }, [resizeForUpload]);

  return { identify, isLoading, error };
}
