// React hook that orchestrates identification flow:
// photo -> optional blur gate -> Claude -> result filters -> iNaturalist -> Species[]

import { EncodingType, readAsStringAsync } from 'expo-file-system/legacy';
import { useCallback, useState } from 'react';

import { identifySpeciesInImage } from '@/api/claude';
import { lookupNativeStatus } from '@/api/inaturalist';
import * as BlueDetection from '@/utils/blueDetection';
import { filterClassifications, hasNoSpeciesFound } from '@/utils/imageFilters';
import type { Species } from '@/types';

interface UseSpeciesIdentificationResult {
  identify:  (photoUri: string, userState: string) => Promise<Species[]>;
  isLoading: boolean;
  error:     string | null;
}

export function useSpeciesIdentification(): UseSpeciesIdentificationResult {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const identify = useCallback(async (
    photoUri: string,
    userState: string,
  ): Promise<Species[]> => {
    setIsLoading(true);
    setError(null);

    try {
      // 1) Quick quality gate: skip API call if image is likely too blurry.
      const blurResult = (BlueDetection as { checkImageBlur?: (uri: string) => Promise<{ isBlurry: boolean }> });
      const maybe = blurResult.checkImageBlur ? await blurResult.checkImageBlur(photoUri) : { isBlurry: false };
      if (maybe.isBlurry) {
        setError('Photo appears blurry. Please retake a sharper image.');
        return [];
      }

      // 2) Convert captured file to base64 for the vision API.
      const base64 = await readAsStringAsync(photoUri, {
        encoding: EncodingType.Base64,
      });

      // 3) Ask Claude for species classifications.
      const rawClassifications = await identifySpeciesInImage(base64, 'image/jpeg');

      // 4) Apply confidence + dedupe filters.
      const { results: classifications, summary } = filterClassifications(rawClassifications);
      if (__DEV__) console.log('[identify] filter summary', summary);

      if (hasNoSpeciesFound(classifications)) return [];

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

      return speciesResults;

    } catch (e) {
      const message = e instanceof Error ? e.message : 'Identification failed';
      setError(message);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { identify, isLoading, error };
}
