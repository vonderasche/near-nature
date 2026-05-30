import previewModelAsset from '@/assets/tflite/near_nature_app_bundle/preview/preview_classifier.tflite';

import { rollupSpeciesScoresToGenusTop3 } from '@/lib/camera/mobilenet/birdsSpeciesRollup';
import { getLabelAtIndex } from '@/lib/camera/mobilenet/parseModelLabels';
import { preprocessImageForMobileNet } from '@/lib/camera/mobilenet/preprocessImageForMobileNet';
import { previewLabelToTaxonGroup } from '@/lib/camera/mobilenet/previewLabelTaxonomy';
import { resolveSpecialistForPreviewLabel } from '@/lib/camera/mobilenet/tfliteRouting';
import { getSpecialistDefinition } from '@/lib/camera/mobilenet/specialistModelRegistry';
import { getCachedTfliteModel, runTfliteTop3 } from '@/lib/camera/mobilenet/tfliteModelRunner';
import { TFLITE_ROUTING } from '@/lib/camera/mobilenet/tfliteRouting';
import type { ClassificationResult } from '@/types';
import type {
  GenusPrediction,
  PreviewPrediction,
  TfliteIdentificationMeta,
  TfliteIdentificationResult,
} from '@/types/tfliteIdentification';

function previewLabelAtIndex(classIndex: number): string {
  return TFLITE_ROUTING.preview_groups[classIndex] ?? `Class ${classIndex}`;
}

function toPreviewPredictions(
  scores: { classIndex: number; confidence: number }[],
): PreviewPrediction[] {
  return scores.map((score) => ({
    classIndex: score.classIndex,
    confidence: score.confidence,
    label: previewLabelAtIndex(score.classIndex),
  }));
}

function toGenusPredictions(
  scores: { classIndex: number; confidence: number }[],
  labelLookup: readonly string[],
): GenusPrediction[] {
  return scores.map((score) => ({
    classIndex: score.classIndex,
    confidence: score.confidence,
    genus: getLabelAtIndex(labelLookup, score.classIndex),
  }));
}

function genusToClassification(
  genus: string,
  confidence: number,
  previewLabel: string,
): ClassificationResult {
  return {
    latinName: genus,
    commonName: genus,
    confidence,
    taxonGroup: previewLabelToTaxonGroup(previewLabel),
  };
}

async function runSpecialistGenusTop3(
  input: Float32Array,
  specialist: NonNullable<ReturnType<typeof getSpecialistDefinition>>,
): Promise<{ classIndex: number; confidence: number }[]> {
  const specialistModel = await getCachedTfliteModel(specialist.model);

  if (specialist.inferenceMode === 'species_rollup' && specialist.rollup) {
    const outputs = await specialistModel.run([input.buffer as ArrayBuffer]);
    const raw = outputs[0];
    if (raw == null) {
      throw new Error('The bird species model returned no output.');
    }
    return rollupSpeciesScoresToGenusTop3(raw, specialist.rollup);
  }

  return runTfliteTop3(specialistModel, input);
}

/**
 * On-device identification for camera capture and gallery picks:
 * 1) top-20 preview model (near_nature_app_bundle/preview)
 * 2) route top preview class via routing.json
 * 3) run the matching specialist model for genus predictions
 */
export async function identifyPhotoWithTflite(
  photoUri: string,
): Promise<TfliteIdentificationResult> {
  const input = await preprocessImageForMobileNet(photoUri);
  const previewModel = await getCachedTfliteModel(previewModelAsset);
  const previewScores = await runTfliteTop3(previewModel, input);
  const previewTop = toPreviewPredictions(previewScores);

  const topPreview = previewTop[0];
  if (!topPreview) {
    return {
      classifications: [],
      meta: {
        previewTop: [],
        routedPreviewLabel: '',
        specialistId: null,
        specialistDisplayName: null,
        genusTop: [],
        usedSpecialist: false,
        notice: 'Could not classify this photo.',
      },
    };
  }

  if (topPreview.label === 'No Plant or Animal') {
    return {
      classifications: [],
      meta: {
        previewTop,
        routedPreviewLabel: topPreview.label,
        specialistId: null,
        specialistDisplayName: null,
        genusTop: [],
        usedSpecialist: false,
        notice: 'No plant or animal detected in this image.',
      },
    };
  }

  const routing = resolveSpecialistForPreviewLabel(topPreview.label);

  if (!routing.assetFolder) {
    return {
      classifications: [],
      meta: {
        previewTop,
        routedPreviewLabel: topPreview.label,
        specialistId: routing.routingId,
        specialistDisplayName: routing.displayName,
        genusTop: [],
        usedSpecialist: false,
        notice: routing.routingId
          ? `${routing.displayName ?? 'This category'} does not have a bundled on-device model.`
          : 'No specialist model is available for this category.',
      },
    };
  }

  const specialist = getSpecialistDefinition(routing.assetFolder);
  if (!specialist) {
    throw new Error(`Missing specialist model configuration for ${routing.assetFolder}.`);
  }

  const genusScores = await runSpecialistGenusTop3(input, specialist);
  const genusTop = toGenusPredictions(genusScores, specialist.labelLookup);

  const classifications = genusTop.map((row) =>
    genusToClassification(row.genus, row.confidence, topPreview.label),
  );

  return {
    classifications,
    meta: {
      previewTop,
      routedPreviewLabel: topPreview.label,
      specialistId: routing.routingId,
      specialistDisplayName: routing.displayName,
      genusTop,
      usedSpecialist: true,
      notice: null,
    },
  };
}
