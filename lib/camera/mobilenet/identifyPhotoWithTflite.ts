import {
  previewLabelToSubcategory,
  previewLabelToTaxonGroup,
} from '@/lib/camera/mobilenet/previewLabelTaxonomy';
import { resolveSpecialistForPreviewLabel } from '@/lib/camera/mobilenet/tfliteRouting';
import { getSpecialistDefinition } from '@/lib/camera/mobilenet/specialistModelRegistry';
import { runCaptureRouting, runSpecialistCapture } from '@/lib/camera/tflite/cachedModels';
import { mobilevitRoutingCaptureConfig } from '@/lib/camera/tflite/modelConfigs';
import type { ClassificationPrediction } from '@/lib/camera/tflite/modelTypes';
import type { ClassificationResult } from '@/types';
import type {
  GenusPrediction,
  PreviewPrediction,
  TfliteIdentificationMeta,
  TfliteIdentificationResult,
} from '@/types/tfliteIdentification';

function toPreviewPredictions(
  predictions: ClassificationPrediction[],
  labels: readonly string[],
): PreviewPrediction[] {
  return predictions.map((row) => ({
    classIndex: labels.indexOf(row.label),
    confidence: row.confidence,
    label: row.label,
  }));
}

function toGenusPredictions(
  predictions: ClassificationPrediction[],
  labelLookup: readonly string[],
): GenusPrediction[] {
  return predictions.map((row) => ({
    classIndex: labelLookup.indexOf(row.label),
    confidence: row.confidence,
    genus: row.label,
  }));
}

function genusToClassification(
  genus: string,
  confidence: number,
  previewLabel: string,
): ClassificationResult {
  const subcategory = previewLabelToSubcategory(previewLabel);
  return {
    latinName: genus,
    commonName: genus,
    confidence,
    taxonGroup: previewLabelToTaxonGroup(previewLabel),
    ...(subcategory ? { subcategory } : {}),
  };
}

/**
 * On-device identification for camera capture and gallery picks:
 * 1) MobileViT routing model (top-3 preview groups)
 * 2) route top preview group via routing.json
 * 3) run the matching specialist model for genus predictions (top-3)
 */
export async function identifyPhotoWithTflite(
  photoUri: string,
): Promise<TfliteIdentificationResult> {
  const { predictions: routingPredictions } = await runCaptureRouting(photoUri);
  const previewTop = toPreviewPredictions(
    routingPredictions,
    mobilevitRoutingCaptureConfig.labels,
  );

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

  const { predictions: genusPredictions } = await runSpecialistCapture(photoUri, specialist);
  const genusTop = toGenusPredictions(genusPredictions, specialist.labelLookup);

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
