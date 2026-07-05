import { deleteAsync, readLocalFileAsBase64 } from '@/lib/fs/legacyFileSystem';

import { identifySpeciesInImage } from '@/api/gemini';
import { identifyPhotoWithTflite } from '@/lib/camera/mobilenet/identifyPhotoWithTflite';
import { isTfliteIdentificationAvailable } from '@/lib/camera/mobilenet/isTfliteIdentificationAvailable';
import { getGlobalClassificationDebugSession } from '@/lib/classification/debug';
import type { RegionPackId } from '@/constants/regions';
import { isRegionalIdentificationAvailable } from '@/lib/region/regionalIdentification';
import { enrichSpeciesFromApis } from '@/lib/identification/enrichSpeciesFromApis';
import { devLog } from '@/lib/devLog';
import { filterClassifications, hasNoSpeciesFound } from '@/lib/image/imageFilters';
import { resizeImageForUpload } from '@/lib/image/resizeImageForUpload';
import type { ClassificationResult, Species } from '@/types';
import type { SpeciesWikiData } from '@/api/wikipedia';
import type { TfliteIdentificationMeta } from '@/types/tfliteIdentification';

export type IdentifyPhotoForCaptureResult = {
  species: Species[];
  classifications: ClassificationResult[];
  wikiByLatinName: Record<string, SpeciesWikiData | null>;
  wikiError: string | null;
  tfliteMeta: TfliteIdentificationMeta | null;
  speciesIdBase: number;
};

/** On-device TFLite or Gemini identification for a local photo URI (no React state). */
export async function identifyPhotoForCapture(
  photoUri: string,
  userState: string,
  regionId: RegionPackId,
  userId?: string,
): Promise<IdentifyPhotoForCaptureResult> {
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
      debugSession?.registerCapturePhoto(photoUri);
    } else {
      const resized = await resizeImageForUpload(photoUri, { maxEdge: 1280 });
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
      debugSession?.registerCapturePhoto(photoUri);
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
  } finally {
    if (resizedUri && resizedUri !== photoUri) {
      await deleteAsync(resizedUri, { idempotent: true }).catch(() => {});
    }
  }
}
