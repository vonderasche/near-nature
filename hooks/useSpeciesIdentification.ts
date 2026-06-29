// React hook that orchestrates identification flow:
// photo -> on-device TFLite (preview + specialist) -> iNat + Wikipedia enrich
// Web fallback: Gemini vision API.

import { deleteAsync, readLocalFileAsBase64 } from '@/lib/fs/legacyFileSystem';
import { useCallback, useRef, useState } from 'react';

import { identifySpeciesInImage } from '@/api/gemini';
import type { SpeciesWikiData } from '@/api/wikipedia';
import { useResizeImageForUpload } from '@/hooks/useResizeImageForUpload';
import { identifyPhotoWithTflite } from '@/lib/camera/mobilenet/identifyPhotoWithTflite';
import { isTfliteIdentificationAvailable } from '@/lib/camera/mobilenet/isTfliteIdentificationAvailable';
import { getGlobalClassificationDebugSession } from '@/lib/classification/debug';
import { useActiveRegion } from '@/context/RegionContext';
import { isRegionalIdentificationAvailable } from '@/lib/region/regionalIdentification';
import { enrichSpeciesFromApis } from '@/lib/identification/enrichSpeciesFromApis';
import { devLog } from '@/lib/devLog';
import { filterClassifications, hasNoSpeciesFound } from '@/lib/image/imageFilters';
import type { ClassificationResult, Species } from '@/types';
import type { TfliteIdentificationMeta } from '@/types/tfliteIdentification';

export type IdentifySpeciesOutcome = {
  species: Species[];
  classifications: ClassificationResult[];
  wikiByLatinName: Record<string, SpeciesWikiData | null>;
  wikiError: string | null;
  tfliteMeta: TfliteIdentificationMeta | null;
  speciesIdBase: number;
};

interface UseSpeciesIdentificationResult {
  identify: (
    photoUri: string,
    userState: string,
    userId?: string,
  ) => Promise<IdentifySpeciesOutcome>;
  isLoading: boolean;
  error: string | null;
}

export function useSpeciesIdentification(): UseSpeciesIdentificationResult {
  const { regionId } = useActiveRegion();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const requestIdRef = useRef(0);
  const { resizeForUpload } = useResizeImageForUpload({ maxEdge: 1280 });

  const identify = useCallback(async (
    photoUri: string,
    userState: string,
    userId?: string,
  ): Promise<IdentifySpeciesOutcome> => {
    const requestId = ++requestIdRef.current;
    setIsLoading(true);
    setError(null);

    let resizedUri: string | null = null;

    try {
      let classifications: ClassificationResult[] = [];
      let tfliteMeta: TfliteIdentificationMeta | null = null;
      let filterSummary: ReturnType<typeof filterClassifications>['summary'] | undefined;
      const debugSession = getGlobalClassificationDebugSession();

      if (isTfliteIdentificationAvailable() && isRegionalIdentificationAvailable(regionId)) {
        const pipeline = await identifyPhotoWithTflite(photoUri);
        tfliteMeta = pipeline.meta;
        classifications = pipeline.classifications.slice(0, 1);
        devLog('[identify] tflite', {
          preview: pipeline.meta.routedPreviewLabel,
          specialist: pipeline.meta.specialistId,
          genusCount: pipeline.meta.genusTop.length,
        });
        debugSession?.emit('capture_identify', {
          pipeline: 'tflite',
          classifications,
          tfliteMeta,
        });
      } else {
        const resized = await resizeForUpload(photoUri);
        resizedUri = resized.uri;
        const base64 = await readLocalFileAsBase64(resizedUri);
        const rawClassifications = await identifySpeciesInImage(base64, 'image/jpeg');
        const filtered = filterClassifications(rawClassifications);
        classifications = filtered.results;
        filterSummary = filtered.summary;
        devLog('[identify] gemini filter summary', filtered.summary);
        debugSession?.emit('capture_identify', {
          pipeline: 'gemini',
          classifications,
          filterSummary,
        });
      }

      if (hasNoSpeciesFound(classifications)) {
        return {
          species: [],
          classifications: [],
          wikiByLatinName: {},
          wikiError: null,
          tfliteMeta,
          speciesIdBase: Date.now(),
        };
      }

      const { species, wikiByLatinName, wikiError, speciesIdBase } = await enrichSpeciesFromApis(
        classifications,
        userState,
        { userId, wikiSpeciesLimit: 1, enrichDepthLimit: 1 },
      );

      return {
        species: species.slice(0, 1),
        classifications,
        wikiByLatinName,
        wikiError,
        tfliteMeta,
        speciesIdBase,
      };
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Identification failed';
      setError(message);
      getGlobalClassificationDebugSession()?.emit('capture_identify', {
        pipeline:
          isTfliteIdentificationAvailable() && isRegionalIdentificationAvailable(regionId)
            ? 'tflite'
            : 'gemini',
        classifications: [],
        error: message,
      });
      return {
        species: [],
        classifications: [],
        wikiByLatinName: {},
        wikiError: null,
        tfliteMeta: null,
        speciesIdBase: Date.now(),
      };
    } finally {
      if (resizedUri && resizedUri !== photoUri) {
        await deleteAsync(resizedUri, { idempotent: true }).catch(() => {});
      }
      if (requestId === requestIdRef.current) {
        setIsLoading(false);
      }
    }
  }, [regionId, resizeForUpload]);

  return { identify, isLoading, error };
}
