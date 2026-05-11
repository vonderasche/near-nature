// React hook that orchestrates identification: photo URI → base64 → Claude → iNaturalist → Species[]

import { EncodingType, readAsStringAsync } from 'expo-file-system/legacy';
import { useCallback, useState } from 'react';

import { identifySpeciesInImage } from '@/api/claude';
import { lookupNativeStatus } from '@/api/inaturalist';
import type { Species } from '@/types';

function devLog(...args: unknown[]) {
  if (__DEV__) console.log(...args);
}

interface UseSpeciesIdentificationResult {
  identify: (photoUri: string, userState: string) => Promise<Species[]>;
  isLoading: boolean;
  error: string | null;
}

export function useSpeciesIdentification(): UseSpeciesIdentificationResult {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const identify = useCallback(async (photoUri: string, userState: string): Promise<Species[]> => {
    setIsLoading(true);
    setError(null);

    try {
      devLog('[identify] start', { photoUri, userState });
      const base64 = await readAsStringAsync(photoUri, { encoding: EncodingType.Base64 });
      devLog('[identify] base64 loaded', { chars: base64.length });

      const classifications = await identifySpeciesInImage(base64, 'image/jpeg');
      devLog('[identify] claude classifications', {
        count: classifications.length,
        sample: classifications[0] ?? null,
      });
      if (classifications.length === 0) return [];

      const speciesResults = await Promise.all(
        classifications.map(async (classification, index): Promise<Species> => {
          const nativeResult = await lookupNativeStatus(classification.latinName, userState);

          return {
            id: `${Date.now()}-${index}`,
            latinName: classification.latinName,
            commonName: classification.commonName,
            taxonGroup: classification.taxonGroup,
            status: nativeResult?.status ?? 'non-native',
          };
        })
      );

      devLog('[identify] final species', { count: speciesResults.length, sample: speciesResults[0] ?? null });
      return speciesResults;
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Identification failed';
      devLog('[identify] error', e);
      setError(message);
      return [];
    } finally {
      devLog('[identify] done');
      setIsLoading(false);
    }
  }, []);

  return { identify, isLoading, error };
}
