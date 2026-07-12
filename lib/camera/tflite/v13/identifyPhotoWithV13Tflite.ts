import type { CaptureMode } from '@/constants/identification-preferences';
import type { RegionPackId } from '@/constants/regions';
import { previewLabelToTaxonGroup } from '@/lib/camera/mobilenet/previewLabelTaxonomy';
import { isOnDevicePreviewEnabled } from '@/lib/camera/tflite/isOnDevicePreviewEnabled';
import { prepareMvpCaptureMemory } from '@/lib/camera/tflite/mvp/mvpTfliteMemory';
import { runV13Stage } from '@/lib/camera/tflite/v13/v13CachedModels';
import { isV13SpecialistGroup } from '@/lib/camera/tflite/v13/v13Groups';
import {
  predictionsToProbabilityMap,
  routeAnimal,
  routeKingdom,
  routePlantTopOutput,
  V13_NOT_IN_GUIDE,
} from '@/lib/camera/tflite/v13/v13Routing';
import { v3KingdomToTaxonGroup } from '@/lib/camera/tflite/v3/v3Taxonomy';
import type { ClassificationResult } from '@/types';
import type {
  GenusPrediction,
  PreviewPrediction,
  TfliteIdentificationResult,
} from '@/types/tfliteIdentification';

function toPreviewPredictions(
  predictions: readonly { label: string; confidence: number }[],
): PreviewPrediction[] {
  return predictions.map((row, index) => ({
    label: row.label,
    confidence: row.confidence,
    classIndex: index,
  }));
}

function specialistGroupToSubcategory(group: string): string | undefined {
  if (group === 'wildflowers_herbs') return 'wildflowers';
  if (group === 'trees_shrubs') return 'trees_shrubs';
  if (group === 'ferns_mosses') return 'ferns_mosses';
  if (group === 'coontie') return 'cacti_succulents';
  if (group === 'wild_mammals' || group === 'domestic_mammals') return 'small_mammals';
  if (group === 'birds') return 'songbirds';
  if (group === 'herps') return 'lizards';
  return undefined;
}

function labelToClassification(
  label: string,
  confidence: number,
  taxonGroupHint: string,
): ClassificationResult {
  const subcategory = specialistGroupToSubcategory(taxonGroupHint);
  return {
    latinName: label,
    commonName: label,
    confidence,
    taxonGroup: previewLabelToTaxonGroup(taxonGroupHint) ?? v3KingdomToTaxonGroup(taxonGroupHint),
    ...(subcategory ? { subcategory } : {}),
  };
}

export type IdentifyPhotoWithV13Options = {
  /** Retained for settings UI — v13 cascade always uses bundled global heads. */
  captureMode?: CaptureMode;
  regionId?: RegionPackId;
};

/**
 * v13 global cascade: kingdom → router → specialist (all bundled).
 */
export async function identifyPhotoWithV13Tflite(
  photoUri: string,
  _options?: IdentifyPhotoWithV13Options,
): Promise<TfliteIdentificationResult> {
  if (isOnDevicePreviewEnabled()) {
    await prepareMvpCaptureMemory();
  }

  const { predictions: kingdomRaw } = await runV13Stage('kingdom', photoUri);
  const previewTop = toPreviewPredictions(kingdomRaw);
  const kingdomRoute = routeKingdom(predictionsToProbabilityMap(kingdomRaw));

  if (kingdomRoute === 'stop') {
    return {
      classifications: [],
      meta: {
        previewTop,
        routedPreviewLabel: 'not_organism',
        specialistId: null,
        specialistDisplayName: null,
        genusTop: [],
        usedSpecialist: false,
        notice: 'No plant or animal detected in this image.',
      },
    };
  }

  if (kingdomRoute === V13_NOT_IN_GUIDE) {
    return {
      classifications: [],
      meta: {
        previewTop,
        routedPreviewLabel: kingdomRaw[0]?.label ?? '',
        specialistId: null,
        specialistDisplayName: null,
        genusTop: [],
        usedSpecialist: false,
        notice: 'This subject is not in our guide yet.',
      },
    };
  }

  const routerKey = kingdomRoute === 'plantae' ? 'plant_router' : 'animal_router';
  const { predictions: routerRaw } = await runV13Stage(routerKey, photoUri);
  const routerProbs = predictionsToProbabilityMap(routerRaw);
  const specialistGroup =
    kingdomRoute === 'plantae' ? routePlantTopOutput(routerProbs) : routeAnimal(routerProbs);

  if (specialistGroup === V13_NOT_IN_GUIDE || !isV13SpecialistGroup(specialistGroup)) {
    return {
      classifications: [],
      meta: {
        previewTop,
        routedPreviewLabel: `${kingdomRoute} / ${routerRaw[0]?.label ?? ''}`,
        specialistId: null,
        specialistDisplayName: null,
        genusTop: [],
        usedSpecialist: false,
        notice: 'Could not route this photo to a specialist model.',
      },
    };
  }

  const { predictions: specialistRaw } = await runV13Stage(specialistGroup, photoUri);
  const sortedSpecialist = [...specialistRaw].sort((a, b) => b.confidence - a.confidence);
  const topThree = sortedSpecialist.slice(0, 3);

  if (topThree.length === 0) {
    return {
      classifications: [],
      meta: {
        previewTop,
        routedPreviewLabel: `${kingdomRoute} / ${specialistGroup}`,
        specialistId: specialistGroup,
        specialistDisplayName: specialistGroup,
        genusTop: [],
        usedSpecialist: false,
        notice: 'Specialist confidence was too low for this photo.',
      },
    };
  }

  const genusTop: GenusPrediction[] = topThree.map((row, index) => ({
    genus: row.label,
    confidence: row.confidence,
    classIndex: index,
  }));

  const classifications = genusTop.map((row) =>
    labelToClassification(row.genus, row.confidence, specialistGroup),
  );

  return {
    classifications,
    meta: {
      previewTop,
      routedPreviewLabel: `${kingdomRoute} / ${specialistGroup}`,
      specialistId: specialistGroup,
      specialistDisplayName: specialistGroup,
      genusTop,
      usedSpecialist: true,
      notice: null,
    },
  };
}
