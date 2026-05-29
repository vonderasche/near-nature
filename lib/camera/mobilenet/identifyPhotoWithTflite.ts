import previewModelAsset from '@/assets/tflite/mobilenetv3_small_top20_preview/tflite/species_classifier.tflite';

import { getMobileNetTop20PreviewLabel } from '@/lib/camera/mobilenet/top20PreviewLabels';
import { preprocessImageForMobileNet } from '@/lib/camera/mobilenet/preprocessImageForMobileNet';
import { previewLabelToTaxonGroup } from '@/lib/camera/mobilenet/previewLabelTaxonomy';
import {
  resolveSpecialistForPreviewLabel,
  SPECIALIST_DISPLAY_NAMES,
} from '@/lib/camera/mobilenet/previewToSpecialist';
import { getLabelAtIndex } from '@/lib/camera/mobilenet/parseModelLabels';
import { getSpecialistDefinition } from '@/lib/camera/mobilenet/specialistModelRegistry';
import { getCachedTfliteModel, runTfliteTop3 } from '@/lib/camera/mobilenet/tfliteModelRunner';
import type { ClassificationResult } from '@/types';
import type {
  GenusPrediction,
  PreviewPrediction,
  TfliteIdentificationMeta,
  TfliteIdentificationResult,
} from '@/types/tfliteIdentification';

function toPreviewPredictions(
  scores: { classIndex: number; confidence: number }[],
): PreviewPrediction[] {
  return scores.map((score) => ({
    classIndex: score.classIndex,
    confidence: score.confidence,
    label: getMobileNetTop20PreviewLabel(score.classIndex),
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
  index: number,
): ClassificationResult {
  return {
    latinName: genus,
    commonName: genus,
    confidence,
    taxonGroup: previewLabelToTaxonGroup(previewLabel),
  };
}

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

  const specialistId = resolveSpecialistForPreviewLabel(topPreview.label);
  const herpLabels = new Set([
    'Reptile / Lizard',
    'Snake',
    'Turtle',
    'Frog / Amphibian',
  ]);

  if (!specialistId) {
    const notice = herpLabels.has(topPreview.label)
      ? 'Reptile and amphibian genus models are not bundled yet. Try a clearer photo or check back after the herps model is added.'
      : 'No specialist genus model is available for this category yet.';
    return {
      classifications: [],
      meta: {
        previewTop,
        routedPreviewLabel: topPreview.label,
        specialistId: null,
        specialistDisplayName: null,
        genusTop: [],
        usedSpecialist: false,
        notice,
      },
    };
  }

  const specialist = getSpecialistDefinition(specialistId);
  if (!specialist) {
    throw new Error(`Missing specialist model configuration for ${specialistId}.`);
  }

  const specialistModel = await getCachedTfliteModel(specialist.model);
  const genusScores = await runTfliteTop3(specialistModel, input);
  const genusTop = toGenusPredictions(genusScores, specialist.labelLookup);

  const classifications = genusTop.map((row, index) =>
    genusToClassification(row.genus, row.confidence, topPreview.label, index),
  );

  return {
    classifications,
    meta: {
      previewTop,
      routedPreviewLabel: topPreview.label,
      specialistId,
      specialistDisplayName: SPECIALIST_DISPLAY_NAMES[specialistId],
      genusTop,
      usedSpecialist: true,
      notice: null,
    },
  };
}
