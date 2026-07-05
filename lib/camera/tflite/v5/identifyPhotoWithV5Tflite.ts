import type { RegionPackId } from '@/constants/regions';
import { previewLabelToTaxonGroup } from '@/lib/camera/mobilenet/previewLabelTaxonomy';
import { isOnDevicePreviewEnabled } from '@/lib/camera/tflite/isOnDevicePreviewEnabled';
import { prepareMvpCaptureMemory } from '@/lib/camera/tflite/mvp/mvpTfliteMemory';
import { getActiveRegionForTfliteCache } from '@/lib/camera/tflite/cachedModels';
import { isV5SpecialistGroup } from '@/lib/camera/tflite/v5/v5ModelRegistry';
import { runV5Stage } from '@/lib/camera/tflite/v5/v5CachedModels';
import {
  predictionsToProbabilityMap,
  routeAnimal,
  routeKingdom,
  routePlant,
  routeSpecialist,
  V5_NOT_IN_GUIDE,
} from '@/lib/camera/tflite/v5/v5Routing';
import {
  v3KingdomToTaxonGroup,
  v3PlantGroupToSubcategory,
  v3SpecialistGroupToSubcategory,
  type V3SpecialistGroup,
} from '@/lib/camera/tflite/v3/v3Taxonomy';
import type { ClassificationResult } from '@/types';
import type {
  GenusPrediction,
  PreviewPrediction,
  TfliteIdentificationMeta,
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
  if (isV5SpecialistGroup(group)) {
    return v3SpecialistGroupToSubcategory(group as V3SpecialistGroup);
  }
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

/**
 * v5 capture cascade: kingdom → regional router → specialist (Southeast / South region).
 */
export async function identifyPhotoWithV5Tflite(
  photoUri: string,
  regionId: RegionPackId = getActiveRegionForTfliteCache(),
): Promise<TfliteIdentificationResult> {
  if (isOnDevicePreviewEnabled()) {
    await prepareMvpCaptureMemory();
  }

  const { predictions: kingdomRaw } = await runV5Stage(regionId, 'kingdom', photoUri);
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

  if (kingdomRoute === V5_NOT_IN_GUIDE) {
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
  const { predictions: routerRaw } = await runV5Stage(regionId, routerKey, photoUri);
  const routerProbs = predictionsToProbabilityMap(routerRaw);
  const specialistGroup =
    kingdomRoute === 'plantae' ? routePlant(routerProbs) : routeAnimal(routerProbs);

  if (specialistGroup === V5_NOT_IN_GUIDE || !isV5SpecialistGroup(specialistGroup)) {
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

  const { predictions: specialistRaw } = await runV5Stage(regionId, specialistGroup, photoUri);
  const specialistResult = routeSpecialist(predictionsToProbabilityMap(specialistRaw));

  if (specialistResult.label === V5_NOT_IN_GUIDE) {
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

  const genusTop: GenusPrediction[] = specialistRaw.slice(0, 3).map((row, index) => ({
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
