// React hook that orchestrates identification flow:
// photo -> on-device TFLite (preview + specialist) -> iNat + Wikipedia enrich
// Web fallback: Gemini vision API.

import { useCallback, useRef, useState } from 'react';

import { useActiveRegion } from '@/context/RegionContext';
import { useIdentificationPreferences } from '@/hooks/useIdentificationPreferences';
import {
  identifyPhotoForCapture,
  type IdentifyPhotoForCaptureResult,
} from '@/lib/identification/identifyPhotoForCapture';
import { getGlobalClassificationDebugSession } from '@/lib/classification/debug';
import { isTfliteIdentificationAvailable } from '@/lib/camera/mobilenet/isTfliteIdentificationAvailable';
import { isRegionalIdentificationAvailable } from '@/lib/region/regionalIdentification';

export type IdentifySpeciesOutcome = IdentifyPhotoForCaptureResult;

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
  const { captureMode } = useIdentificationPreferences();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const requestIdRef = useRef(0);

  const identify = useCallback(async (
    photoUri: string,
    userState: string,
    userId?: string,
  ): Promise<IdentifySpeciesOutcome> => {
    const requestId = ++requestIdRef.current;
    setIsLoading(true);
    setError(null);

    try {
      return await identifyPhotoForCapture(photoUri, userState, regionId, userId);
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Identification failed';
      setError(message);
      getGlobalClassificationDebugSession()?.emit('capture_identify', {
        pipeline:
          isTfliteIdentificationAvailable() && isRegionalIdentificationAvailable(regionId, captureMode)
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
      if (requestId === requestIdRef.current) {
        setIsLoading(false);
      }
    }
  }, [captureMode, regionId]);

  return { identify, isLoading, error };
}
